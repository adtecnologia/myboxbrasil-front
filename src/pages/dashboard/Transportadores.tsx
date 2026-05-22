import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Phone, Truck as TruckIcon, Eye } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { EntityForm } from "@/components/EntityForm";
import { DataTable } from "@/components/DataTable";

interface Locador {
  id: string;
  nome: string;
  documento: string;
  cidade: string;
  estado: string;
  licencaAmbiental: string;
  taxa: string;
  logo: string;
}

const mockData: Locador[] = [
  { id: "1", nome: "Trans Log Ltda", documento: "33.444.555/0001-66", cidade: "São José do Rio Preto", estado: "SP", licencaAmbiental: "12345/2024", taxa: "10%", logo: "TL" },
  { id: "2", nome: "Rápido Entulho ME", documento: "77.888.999/0001-00", cidade: "Mirassol", estado: "SP", licencaAmbiental: "67890/2024", taxa: "12%", logo: "RE" },
  { id: "3", nome: "EcoTransp SA", documento: "22.111.333/0001-55", cidade: "Bady Bassitt", estado: "SP", licencaAmbiental: "11223/2024", taxa: "15%", logo: "ET" },
];

const Transportadores = () => {
  const [items, setItems] = useState(mockData);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Locador | null>(null);
  const activeProfileType = useAuthStore((state) => state.activeProfileType());
  const isReadOnly = activeProfileType === "prefeitura";
  const isMobile = useIsMobile();

  const filtered = items.filter((t) =>
    t.nome.toLowerCase().includes(search.toLowerCase()) || t.documento.includes(search)
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
      licencaAmbiental: "Pendente",
      taxa: "0%",
      logo: (form.get("nome") as string)?.substring(0, 2).toUpperCase() || "LC"
    }, ...items]);
    setDialogOpen(false);
  };

  const handleEdit = (item: Locador) => {
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
        logo: data.nomeRazaoSocial.substring(0, 2).toUpperCase()
      } : i));
    } else {
      setItems([{
        id: String(items.length + 1),
        nome: data.nomeRazaoSocial,
        documento: data.documento,
        cidade: data.cidade,
        estado: data.estado,
        licencaAmbiental: "Pendente",
        taxa: "0%",
        logo: data.nomeRazaoSocial.substring(0, 2).toUpperCase()
      }, ...items]);
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Locadores</h1>
          <p className="text-sm text-white/75">Cadastro de locadores</p>
        </div>
        {!isReadOnly && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingItem(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-0"><Plus className="mr-2 h-4 w-4" /> Novo Locador</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
              <DialogHeader><DialogTitle>{editingItem ? "Editar Locador" : "Cadastrar Locador"}</DialogTitle></DialogHeader>
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
        )}
      </div>

      <DataTable<Locador>
        title={`${items.length} locadores`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Logo",
            accessor: (t) => (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {t.logo}
              </div>
            ),
          },
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "Licença Ambiental", accessor: "licencaAmbiental" },
          { header: "Documento", accessor: "documento" },
          { header: "Cidade", accessor: "cidade" },
          { header: "Estado", accessor: "estado" },
          ...(!isReadOnly ? [{
            header: "Taxa",
            accessor: (t: Locador) => (
              <Input
                type="number"
                value={parseFloat(t.taxa) || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const v = e.target.value;
                  setItems(items.map(i => i.id === t.id ? { ...i, taxa: `${v}%` } : i));
                }}
                className="h-8 w-20"
              />
            ),
          }] : []),
        ]}
        renderMobileCard={(t) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {t.logo}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">{t.documento}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {isReadOnly ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}><Eye className="h-3.5 w-3.5" /></Button>
                ) : (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">Licença: {t.licencaAmbiental}</span>
              <span className="flex items-center gap-1">{t.cidade}/{t.estado}</span>
              {!isReadOnly && <span className="flex items-center gap-1 font-semibold text-primary">Taxa: {t.taxa}</span>}
            </div>
          </div>
        )}
        actions={(t) => isReadOnly ? (
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => handleEdit(t)} title="Visualizar">
            <Eye className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => handleEdit(t)} title="Editar">
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

export default Transportadores;
