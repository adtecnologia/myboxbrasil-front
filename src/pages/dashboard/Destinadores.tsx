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
import { useEntities, type EntityProfile } from "@/hooks/useEntities";
import { toast } from "sonner";

const initials = (n: string) => (n || "").trim().substring(0, 2).toUpperCase() || "DF";

const Destinadores = () => {
  const { rows: destinadores, update } = useEntities("destino");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EntityProfile | null>(null);
  const activeProfileType = useAuthStore((state) => state.activeProfileType());
  const isReadOnly = activeProfileType === "prefeitura";
  const isMobile = useIsMobile();

  const filtered = destinadores.filter((d) =>
    d.nome.toLowerCase().includes(search.toLowerCase()) ||
    (d.documento ?? "").includes(search)
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleEdit = (item: EntityProfile) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    if (!editingItem) {
      toast.info("Novos cadastros devem ser feitos via tela de Cadastro de Usuário.");
      setDialogOpen(false);
      return;
    }
    const ok = await update(editingItem.id, {
      nome: data.nomeRazaoSocial,
      documento: data.documento,
      cidade: data.cidade,
      estado: data.estado,
    });
    if (ok) {
      setDialogOpen(false);
      setEditingItem(null);
    }
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
                  documento: editingItem.documento ?? "",
                  cidade: editingItem.cidade ?? "",
                  estado: editingItem.estado ?? "",
                } : undefined}
                onSubmit={handleSave} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable<EntityProfile>
        title={`${destinadores.length} destinadores cadastrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Logo",
            accessor: (d) => (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {initials(d.nome)}
              </div>
            ),
          },
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "Documento", accessor: (d) => d.documento ?? "—" },
          { header: "Celular", accessor: (d) => d.celular ?? "—" },
          { header: "Cidade", accessor: (d) => d.cidade ?? "—" },
          { header: "Estado", accessor: (d) => d.estado ?? "—" },
        ]}
        renderMobileCard={(d) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {initials(d.nome)}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{d.nome}</p>
                  <p className="text-xs text-muted-foreground">{d.documento ?? "—"}</p>
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
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{d.cidade ?? "—"}/{d.estado ?? "—"}</span>
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
