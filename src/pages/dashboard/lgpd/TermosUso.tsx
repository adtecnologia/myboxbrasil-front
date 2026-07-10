import { useEffect, useState } from "react";
import { Eye, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import PdfCanvasViewer from "@/components/PdfCanvasViewer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentoVersao {
  id: string;
  titulo: string;
  versao: string;
  conteudo: string | null;
  arquivo_url: string | null;
  situacao: "ativo" | "historico";
  upload_por: string | null;
  created_at: string;
}

const TermosUso = () => {
  const [termos, setTermos] = useState<DocumentoVersao[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerData, setViewerData] = useState<Uint8Array | null>(null);
  const [viewerTitle, setViewerTitle] = useState<string>("");

  const load = async () => {
    const { data, error } = await supabase
      .from("termos_uso")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setTermos((data ?? []) as DocumentoVersao[]);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const file = form.get("arquivo") as File | null;
    if (!file || file.size === 0) { toast.error("Selecione um arquivo PDF"); return; }
    if (file.type !== "application/pdf") { toast.error("O arquivo deve ser PDF"); return; }

    setUploading(true);
    const path = `termos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upStorageErr } = await supabase.storage
      .from("documentos-legais")
      .upload(path, file, { contentType: "application/pdf", upsert: false });
    if (upStorageErr) { setUploading(false); toast.error(upStorageErr.message); return; }

    const { error: upErr } = await supabase
      .from("termos_uso")
      .update({ situacao: "historico" })
      .eq("situacao", "ativo");
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { error } = await supabase.from("termos_uso").insert({
      titulo: form.get("titulo") as string,
      versao: form.get("versao") as string,
      arquivo_url: path,
      situacao: "ativo",
      upload_por: "Admin Sistema",
    });
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Nova versão publicada!");
    setDialogOpen(false);
    formEl.reset();
    load();
  };

  const handleView = async (t: DocumentoVersao) => {
    if (!t.arquivo_url) { toast.error("Nenhum arquivo disponível"); return; }
    const { data, error } = await supabase.storage
      .from("documentos-legais")
      .download(t.arquivo_url);
    if (error || !data) { toast.error(error?.message ?? "Erro ao carregar PDF"); return; }
    const bytes = new Uint8Array(await data.arrayBuffer());
    setViewerData(bytes);
    setViewerTitle(t.titulo);
    setViewerOpen(true);
  };

  const filtered = termos.filter((t) =>
    t.titulo.toLowerCase().includes(search.toLowerCase()) ||
    t.versao.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Termos de Uso</h1>
          <p className="text-sm text-white/75">Gestão das versões dos termos de uso do sistema</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <FileText className="mr-2 h-4 w-4" /> Nova Versão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Versão de Termos de Uso</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" name="titulo" required placeholder="Ex: Termos de Uso Geral v2.2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="versao">Versão</Label>
                  <Input id="versao" name="versao" required placeholder="Ex: 2.2.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arquivo">Arquivo PDF</Label>
                  <Input id="arquivo" name="arquivo" type="file" accept="application/pdf" required />
                  <p className="text-xs text-muted-foreground">Envie o documento em formato PDF.</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto" disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Enviando..." : "Publicar Nova Versão"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<DocumentoVersao>
        title={`${termos.length} versões registradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Data", accessor: (t) => fmtDate(t.created_at), className: "text-sm" },
          { header: "Versão", accessor: "versao", className: "font-mono text-xs" },
          { header: "Título", accessor: "titulo", className: "font-medium" },
          {
            header: "Situação",
            accessor: (t) => (
              <Badge variant={t.situacao === "ativo" ? "default" : "secondary"}>
                {t.situacao === "ativo" ? "Ativo" : "Histórico"}
              </Badge>
            ),
          },
          { header: "Upload feito por", accessor: (t) => t.upload_por ?? "—", className: "text-sm" },
        ]}
        renderMobileCard={(t) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{t.titulo}</p>
                <p className="text-xs text-muted-foreground">Versão: {t.versao}</p>
              </div>
              <Badge variant={t.situacao === "ativo" ? "default" : "secondary"} className="text-[10px]">
                {t.situacao === "ativo" ? "Ativo" : "Histórico"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
              <div>Data: {fmtDate(t.created_at)}</div>
              <div className="truncate">Por: {t.upload_por ?? "—"}</div>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => handleView(t)}>
                <Eye className="mr-1 h-3 w-3" /> Visualizar
              </Button>
            </div>
          </div>
        )}
        actions={(t) => (
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" title="Visualizar PDF" onClick={() => handleView(t)}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
        pagination={{
          totalItems,
          pageSize,
          currentPage,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <Dialog open={viewerOpen} onOpenChange={(o) => {
        setViewerOpen(o);
        if (!o) {
          setViewerData(null);
        }
      }}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="truncate">{viewerTitle || "Visualizar PDF"}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <PdfCanvasViewer data={viewerData} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TermosUso;
