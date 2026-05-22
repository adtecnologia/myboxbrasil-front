import { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";

interface TipoVeiculo {
  id: string;
  tipo: string;
}

const mockTipos: TipoVeiculo[] = [
  { id: "1", tipo: "Caminhão Poli-Guindaste" },
  { id: "2", tipo: "Caminhão Roll-on Roll-off" },
  { id: "3", tipo: "Caminhão Pipa" },
  { id: "4", tipo: "Caminhão Caçamba" },
];

const TiposVeiculos = () => {
  const [tipos, setTipos] = useState<TipoVeiculo[]>(mockTipos);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoVeiculo | null>(null);
  const isMobile = useIsMobile();

  const filtered = tipos.filter((t) =>
    t.tipo.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const tipoValue = form.get("tipo") as string;

    if (editingTipo) {
      setTipos(tipos.map(t => t.id === editingTipo.id ? { ...t, tipo: tipoValue } : t));
    } else {
      const novo: TipoVeiculo = {
        id: String(Date.now()),
        tipo: tipoValue,
      };
      setTipos([novo, ...tipos]);
    }
    
    setDialogOpen(false);
    setEditingTipo(null);
  };

  const handleDelete = (id: string) => {
    setTipos(tipos.filter(t => t.id !== id));
  };

  const openEdit = (t: TipoVeiculo) => {
    setEditingTipo(t);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Tipos de Veículos</h1>
          <p className="text-sm text-white/75">Gestão de categorias de veículos da frota</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTipo(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTipo ? "Editar Tipo" : "Cadastrar Tipo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Veículo</Label>
                <Input id="tipo" name="tipo" defaultValue={editingTipo?.tipo} required placeholder="Ex: Caminhão Poli-Guindaste" />
              </div>
              <DialogFooter>
                <Button type="submit">{editingTipo ? "Salvar Alterações" : "Cadastrar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<TipoVeiculo>
        title={`${tipos.length} tipos cadastrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Tipo", accessor: "tipo", className: "font-medium" },
        ]}
        renderMobileCard={(t) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">{t.tipo}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
        actions={(t) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => openEdit(t)} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" onClick={() => handleDelete(t.id)} title="Excluir">
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

export default TiposVeiculos;