import { useState } from "react";
import { Search, Eye, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";

interface DocumentoVersao {
  id: string;
  data: string;
  versao: string;
  titulo: string;
  situacao: "Ativo" | "Histórico";
  uploadPor: string;
}

const mockTermos: DocumentoVersao[] = [
  { id: "1", data: "14/05/2026", versao: "2.1.0", titulo: "Termos de Uso Geral v2.1", situacao: "Ativo", uploadPor: "Admin Sistema" },
  { id: "2", data: "10/01/2026", versao: "2.0.0", titulo: "Termos de Uso Geral v2.0", situacao: "Histórico", uploadPor: "Admin Sistema" },
  { id: "3", data: "15/06/2025", versao: "1.0.0", titulo: "Termos de Uso Inicial", situacao: "Histórico", uploadPor: "Suporte Técnico" },
];

const TermosUso = () => {
  const [termos, setTermos] = useState<DocumentoVersao[]>(mockTermos);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    const novo: DocumentoVersao = {
      id: String(Date.now()),
      data: new Date().toLocaleDateString('pt-BR'),
      versao: form.get("versao") as string,
      titulo: form.get("titulo") as string,
      situacao: "Ativo",
      uploadPor: "Admin Sistema"
    };

    // Desativa versões anteriores se a nova for ativa
    setTermos([novo, ...termos.map(t => ({ ...t, situacao: "Histórico" as const }))]);
    setDialogOpen(false);
  };

  const filtered = termos.filter((t) =>
    t.titulo.toLowerCase().includes(search.toLowerCase()) ||
    t.versao.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

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
            <form onSubmit={handleSave} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" name="titulo" required placeholder="Ex: Termos de Uso Geral v2.2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="versao">Versão</Label>
                <Input id="versao" name="versao" required placeholder="Ex: 2.2.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arquivo">Upload PDF</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-muted/50">
                  <FileUp className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">Arraste ou clique para selecionar o arquivo PDF</p>
                  <Input id="arquivo" name="arquivo" type="file" accept=".pdf" className="max-w-xs mt-2" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Publicar Nova Versão</Button>
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
          { header: "Data", accessor: "data", className: "text-sm" },
          { header: "Versão", accessor: "versao", className: "font-mono text-xs" },
          { header: "Título", accessor: "titulo", className: "font-medium" },
          {
            header: "Situação",
            accessor: (t) => (
              <Badge variant={t.situacao === "Ativo" ? "default" : "secondary"}>
                {t.situacao}
              </Badge>
            ),
          },
          { header: "Upload feito por", accessor: "uploadPor", className: "text-sm" },
        ]}
        renderMobileCard={(t) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{t.titulo}</p>
                <p className="text-xs text-muted-foreground">Versão: {t.versao}</p>
              </div>
              <Badge variant={t.situacao === "Ativo" ? "default" : "secondary"} className="text-[10px]">
                {t.situacao}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
              <div>Data: {t.data}</div>
              <div className="truncate">Por: {t.uploadPor}</div>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]">
                <Eye className="mr-1 h-3 w-3" /> Visualizar
              </Button>
              <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]">
                <Download className="mr-1 h-3 w-3" /> Download
              </Button>
            </div>
          </div>
        )}
        actions={(t) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" title="Visualizar">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" title="Download">
              <Download className="h-4 w-4" />
            </Button>
          </>
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

export default TermosUso;
