import { useState } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { useLocadorTable } from "@/hooks/useLocadorTable";

interface FormaPagamento {
  id: string;
  nome: string;
  ativo: boolean;
}

const FormasPagamento = () => {
  const { rows: formas, create, update, remove } = useLocadorTable<FormaPagamento>("formas_pagamento");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSituacao = async (f: FormaPagamento) => {
    await update(f.id, { ativo: !f.ativo });
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nome = (new FormData(e.currentTarget).get("nome") as string)?.trim();
    if (!nome) return;
    const ok = await create({ nome, ativo: true });
    if (ok) setDialogOpen(false);
  };

  const filtered = formas.filter((f) =>
    f.nome.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Formas de Pagamento</h1>
          <p className="text-sm text-white/75">Gerencie a disponibilidade das formas de pagamento</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Nova Forma
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Forma de Pagamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" required placeholder="Ex.: Pix" />
              </div>
              <DialogFooter>
                <Button type="submit">Cadastrar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<FormaPagamento>
        title={`${formas.length} formas cadastradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Forma de Pagamento", accessor: "nome", className: "font-medium" },
          { 
            header: "Situação", 
            accessor: (f) => (
              <Badge variant={f.ativo ? "default" : "secondary"}>
                {f.ativo ? "Ativo" : "Inativo"}
              </Badge>
            ),
            className: "w-32"
          },
        ]}
        renderMobileCard={(f) => (
          <div className="rounded-lg border border-border bg-background p-4 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground">{f.nome}</p>
              <div className="mt-1">
                <Badge variant={f.ativo ? "default" : "secondary"} className="text-[10px] h-5">
                  {f.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <Switch 
                checked={f.ativo}
                onCheckedChange={() => toggleSituacao(f)}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(f.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
        actions={(f) => (
          <div className="flex items-center gap-2">
            <Switch checked={f.ativo} onCheckedChange={() => toggleSituacao(f)} />
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" onClick={() => remove(f.id)} title="Excluir">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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

export default FormasPagamento;
