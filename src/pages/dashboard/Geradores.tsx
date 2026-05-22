import { useState } from "react";
import { Plus, Search, Pencil, Trash2, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { EntityForm } from "@/components/EntityForm";
import { DataTable } from "@/components/DataTable";

interface Locatario {
  id: string;
  nome: string;
  documento: string;
  cidade: string;
  estado: string;
  foto: string;
}

const mockData: Locatario[] = [
  { id: "1", nome: "Obra Av. Brasil, 1500", documento: "12.345.678/0001-90", cidade: "São José do Rio Preto", estado: "SP", foto: "OB" },
  { id: "2", nome: "Demolição Centro Comercial", documento: "98.765.432/0001-21", cidade: "Mirassol", estado: "SP", foto: "DC" },
  { id: "3", nome: "Reforma Shopping Plaza", documento: "45.678.901/0001-32", cidade: "Bady Bassitt", estado: "SP", foto: "RS" },
  { id: "4", nome: "Edifício Novo Horizonte", documento: "32.109.876/0001-54", cidade: "São José do Rio Preto", estado: "SP", foto: "EN" },
];

const Geradores = () => {
  const [items, setItems] = useState(mockData);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Locatario | null>(null);
  const isMobile = useIsMobile();

  const filtered = items.filter((g) =>
    g.nome.toLowerCase().includes(search.toLowerCase()) || g.documento.includes(search)
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setItems([{
      id: String(items.length + 1),
      nome: form.get("nome") as string,
      documento: form.get("documento") as string,
      cidade: form.get("cidade") as string,
      estado: form.get("estado") as string,
      foto: (form.get("nome") as string)?.substring(0, 2).toUpperCase() || "LC"
    }, ...items]);
    setDialogOpen(false);
  };

  const handleEdit = (item: Locatario) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSave = (data: any) => {
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? {
        ...i,
        nome: data.nomeRazaoSocial,
        documento: data.documento,
        cidade: data.cidade,
        estado: data.estado,
        foto: data.nomeRazaoSocial.substring(0, 2).toUpperCase(),
      } : i));
    } else {
      setItems([{
        id: String(items.length + 1),
        nome: data.nomeRazaoSocial,
        documento: data.documento,
        cidade: data.cidade,
        estado: data.estado,
        foto: data.nomeRazaoSocial.substring(0, 2).toUpperCase(),
      }, ...items]);
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Locatários</h1>
          <p className="text-sm text-white/75">Cadastro de locatários</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0"><Plus className="mr-2 h-4 w-4" /> Novo Locatário</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
            <DialogHeader><DialogTitle>{editingItem ? "Editar Locatário" : "Cadastrar Locatário"}</DialogTitle></DialogHeader>
            <EntityForm 
              initialData={editingItem ? {
                nomeRazaoSocial: editingItem.nome,
                documento: editingItem.documento,
                cidade: editingItem.cidade,
                estado: editingItem.estado,
              } : undefined}
              onSubmit={handleSave} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Locatario>
        title={`${items.length} locatários`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Foto",
            accessor: (g) => (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {g.foto}
              </div>
            ),
          },
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "Documento", accessor: "documento" },
          { header: "Cidade", accessor: "cidade" },
          { header: "Estado", accessor: "estado" },
        ]}
        renderMobileCard={(g) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {g.foto}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{g.nome}</p>
                  <p className="text-xs text-muted-foreground">{g.documento}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{g.cidade}/{g.estado}</span>
            </div>
          </div>
        )}
        actions={(g) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => handleEdit(g)} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" title="Excluir">
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

export default Geradores;
