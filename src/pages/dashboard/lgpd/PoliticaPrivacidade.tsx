import { useEffect, useState } from "react";
import { Eye, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
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

const PoliticaPrivacidade = () => {
  const [politicas, setPoliticas] = useState<DocumentoVersao[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("politica_privacidade")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setPoliticas((data ?? []) as DocumentoVersao[]);
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
    const path = `politica/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upStorageErr } = await supabase.storage
      .from("documentos-legais")
      .upload(path, file, { contentType: "application/pdf", upsert: false });
    if (upStorageErr) { setUploading(false); toast.error(upStorageErr.message); return; }

    const { error: upErr } = await supabase
      .from("politica_privacidade")
      .update({ situacao: "historico" })
      .eq("situacao", "ativo");
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { error } = await supabase.from("politica_privacidade").insert({
      titulo: form.get("titulo") as string,
      versao: form.get("versao") as string,
      arquivo_url: path,
      situacao: "ativo",
      upload_por: "DPO Empresa",
    });
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Nova versão publicada!");
    setDialogOpen(false);
    formEl.reset();
    load();
  };

  const handleView = async (p: DocumentoVersao) => {
    if (!p.arquivo_url) { toast.error("Nenhum arquivo disponível"); return; }
    const { data, error } = await supabase.storage
      .from("documentos-legais")
      .createSignedUrl(p.arquivo_url, 60 * 10);
    if (error || !data) { toast.error(error?.message ?? "Erro ao gerar link"); return; }
    window.open(data.signedUrl, "_blank");
  };

  const filtered = politicas.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase()) ||
    p.versao.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Política de Privacidade</h1>
          <p className="text-sm text-white/75">Gestão das versões da política de privacidade do sistema</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <ShieldCheck className="mr-2 h-4 w-4" /> Nova Versão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Versão de Política de Privacidade</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" name="titulo" required placeholder="Ex: Política de Privacidade v1.3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="versao">Versão</Label>
                <Input id="versao" name="versao" required placeholder="Ex: 1.3.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arquivo">Arquivo PDF</Label>
                <Input id="arquivo" name="arquivo" type="file" accept="application/pdf" required />
                <p className="text-xs text-muted-foreground">Envie o documento em formato PDF.</p>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Enviando..." : "Publicar Nova Versão"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<DocumentoVersao>
        title={`${politicas.length} versões registradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Data", accessor: (p) => fmtDate(p.created_at), className: "text-sm" },
          { header: "Versão", accessor: "versao", className: "font-mono text-xs" },
          { header: "Título", accessor: "titulo", className: "font-medium" },
          {
            header: "Situação",
            accessor: (p) => (
              <Badge variant={p.situacao === "ativo" ? "default" : "secondary"}>
                {p.situacao === "ativo" ? "Ativo" : "Histórico"}
              </Badge>
            ),
          },
          { header: "Upload feito por", accessor: (p) => p.upload_por ?? "—", className: "text-sm" },
        ]}
        renderMobileCard={(p) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{p.titulo}</p>
                <p className="text-xs text-muted-foreground">Versão: {p.versao}</p>
              </div>
              <Badge variant={p.situacao === "ativo" ? "default" : "secondary"} className="text-[10px]">
                {p.situacao === "ativo" ? "Ativo" : "Histórico"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
              <div>Data: {fmtDate(p.created_at)}</div>
              <div className="truncate">Por: {p.upload_por ?? "—"}</div>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => handleView(p)}>
                <Eye className="mr-1 h-3 w-3" /> Visualizar
              </Button>
            </div>
          </div>
        )}
        actions={(p) => (
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" title="Visualizar PDF" onClick={() => handleView(p)}>
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
    </div>
  );
};

export default PoliticaPrivacidade;
