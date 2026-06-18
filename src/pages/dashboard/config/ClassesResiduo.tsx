import { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { useLocadorTable } from "@/hooks/useLocadorTable";

interface ClasseResiduo {
  id: string;
  nome: string;
  descricao: string | null;
}

const ClassesResiduo = () => {
  const { rows: classes, loading, create, update, remove } = useLocadorTable<ClasseResiduo>("classes_residuo");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClasseResiduo | null>(null);
  const isMobile = useIsMobile();

  const filtered = classes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    (c.descricao ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nome = form.get("nome") as string;
    const descricao = form.get("descricao") as string;

    const ok = editingClass
      ? await update(editingClass.id, { nome, descricao })
      : await create({ nome, descricao });
    if (ok) {
      setDialogOpen(false);
      setEditingClass(null);
    }
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const openEdit = (classe: ClasseResiduo) => {
    setEditingClass(classe);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Classes de Resíduos</h1>
          <p className="text-sm text-white/75">Gestão de classificações de resíduos sólidos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingClass(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Nova Classe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClass ? "Editar Classe" : "Cadastrar Classe"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Classe</Label>
                <Input id="nome" name="nome" defaultValue={editingClass?.nome} required placeholder="Ex: Classe I - Perigosos" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" name="descricao" defaultValue={editingClass?.descricao} required placeholder="Descreva as características da classe..." />
              </div>
              <DialogFooter>
                <Button type="submit">{editingClass ? "Salvar Alterações" : "Cadastrar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<ClasseResiduo>
        title={`${classes.length} classes cadastradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Classe", accessor: "nome", className: "font-medium w-1/3" },
          { header: "Descrição", accessor: "descricao", className: "text-muted-foreground" },
        ]}
        renderMobileCard={(c) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-medium text-sm text-foreground truncate">{c.nome}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.descricao}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
        actions={(c) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => openEdit(c)} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" onClick={() => handleDelete(c.id)} title="Excluir">
              <Trash2 className="h-4 w-4" />
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

export default ClassesResiduo;