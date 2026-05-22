import { useState } from "react";
import { Plus, Search, Pencil, Trash2, ShieldCheck, MapPin, Eye } from "lucide-react";
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

interface Destinador {
  id: string;
  nome: string;
  documento: string;
  licencaAmbiental: string;
  cidade: string;
  estado: string;
  taxa: string;
  logo: string;
}

const mockDestinadores: Destinador[] = [
  { id: "1", nome: "Aterro Sanitário Regional", documento: "12.345.678/0001-90", licencaAmbiental: "LP 123/2023", cidade: "São José do Rio Preto", estado: "SP", taxa: "10%", logo: "AR" },
  { id: "2", nome: "Recicladora Eco S.A.", documento: "98.765.432/0001-10", licencaAmbiental: "LO 456/2022", cidade: "Mirassol", estado: "SP", taxa: "8%", logo: "RE" },
  { id: "3", nome: "Incinera Brasil", documento: "11.222.333/0001-44", licencaAmbiental: "LI 789/2024", cidade: "Catanduva", estado: "SP", taxa: "12%", logo: "IB" },
];

const Destinadores = () => {
  const [destinadores, setDestinadores] = useState<Destinador[]>(mockDestinadores);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Destinador | null>(null);
  const activeProfileType = useAuthStore((state) => state.activeProfileType());
  const isReadOnly = activeProfileType === "prefeitura";
  const isMobile = useIsMobile();

  const filtered = destinadores.filter((d) =>
    d.nome.toLowerCase().includes(search.toLowerCase()) ||
    d.documento.includes(search) ||
    d.licencaAmbiental.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const novo: Destinador = {
      id: String(destinadores.length + 1),
      nome: form.get("nome") as string,
      documento: form.get("documento") as string,
      licencaAmbiental: form.get("licenca") as string,
      cidade: form.get("cidade") as string,
      estado: form.get("estado") as string,
      taxa: "0%",
      logo: (form.get("nome") as string)?.substring(0, 2).toUpperCase() || "DF",
    };
    setDestinadores([novo, ...destinadores]);
    setDialogOpen(false);
  };

  const handleEdit = (item: Destinador) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSave = (data: any) => {
    if (editingItem) {
      setDestinadores(destinadores.map(d => d.id === editingItem.id ? {
        ...d,
        nome: data.nomeRazaoSocial,
        documento: data.documento,
        cidade: data.cidade,
        estado: data.estado,
        logo: data.nomeRazaoSocial.substring(0, 2).toUpperCase(),
      } : d));
    } else {
      setDestinadores([{
        id: String(destinadores.length + 1),
        nome: data.nomeRazaoSocial,
        documento: data.documento,
        licencaAmbiental: "Não informada",
        cidade: data.cidade,
        estado: data.estado,
        taxa: "0%",
        logo: data.nomeRazaoSocial.substring(0, 2).toUpperCase(),
      }, ...destinadores]);
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Destinadores Finais</h1>
          <p className="text-sm text-white/75">Cadastro de aterros e usinas de reciclagem</p>
        </div>
        {!isReadOnly && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingItem(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-0"><Plus className="mr-2 h-4 w-4" /> Novo Destinador</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
              <DialogHeader><DialogTitle>{editingItem ? "Editar Destinador" : "Cadastrar Destinador"}</DialogTitle></DialogHeader>
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

      <DataTable<Destinador>
        title={`${destinadores.length} destinadores cadastrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Logo",
            accessor: (d) => (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {d.logo}
              </div>
            ),
          },
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "Licença Ambiental", accessor: "licencaAmbiental" },
          { header: "Documento", accessor: "documento" },
          { header: "Cidade", accessor: "cidade" },
          { header: "Estado", accessor: "estado" },
          { header: "Taxa", accessor: "taxa" },
        ]}
        renderMobileCard={(d) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {d.logo}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{d.nome}</p>
                  <p className="text-xs text-muted-foreground">{d.documento}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {isReadOnly ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(d)}><Eye className="h-3.5 w-3.5" /></Button>
                ) : (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" />{d.licencaAmbiental}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{d.cidade}/{d.estado}</span>
              <span className="flex items-center gap-1 font-semibold text-primary">Taxa: {d.taxa}</span>
            </div>
          </div>
        )}
        actions={(d) => isReadOnly ? (
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => handleEdit(d)} title="Visualizar">
            <Eye className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => handleEdit(d)} title="Editar">
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

export default Destinadores;
