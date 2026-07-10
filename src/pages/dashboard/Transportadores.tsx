import { useState } from "react";
import { Plus, Pencil, Trash2, Phone, Truck as TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";

interface Transportador {
  id: string;
  nome: string;
  documento: string;
  celular: string;
  placa: string;
  cidade: string;
  estado: string;
}

const mockTransportadores: Transportador[] = [];

const initials = (n: string) => (n || "").trim().substring(0, 2).toUpperCase() || "TR";

const Transportadores = () => {
  const [items, setItems] = useState<Transportador[]>(mockTransportadores);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transportador | null>(null);

  const filtered = items.filter((t) =>
    t.nome.toLowerCase().includes(search.toLowerCase()) ||
    t.documento.includes(search) ||
    t.placa.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleEdit = (item: Transportador) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><TruckIcon className="h-6 w-6" /> Transportadores</h1>
          <p className="text-sm text-white/75">Empresas que transportam resíduos até o destino final</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0"><Plus className="mr-2 h-4 w-4" /> Novo Transportador</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar Transportador" : "Cadastrar Transportador"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome / Razão Social</Label><Input defaultValue={editing?.nome} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>CNPJ</Label><Input defaultValue={editing?.documento} /></div>
                <div><Label>Placa</Label><Input defaultValue={editing?.placa} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cidade</Label><Input defaultValue={editing?.cidade} /></div>
                <div><Label>Estado</Label><Input defaultValue={editing?.estado} /></div>
              </div>
              <div><Label>Celular</Label><Input defaultValue={editing?.celular} /></div>
            </div>
            <DialogFooter><Button onClick={() => setDialogOpen(false)}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Transportador>
        title={`${items.length} transportadores`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "",
            accessor: (t) => (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{initials(t.nome)}</div>
            ),
          },
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "CNPJ", accessor: "documento" },
          { header: "Placa", accessor: "placa" },
          { header: "Celular", accessor: "celular" },
          { header: "Cidade/UF", accessor: (t) => `${t.cidade}/${t.estado}` },
        ]}
        renderMobileCard={(t) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">{initials(t.nome)}</div>
                <div>
                  <p className="font-medium text-sm text-foreground">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">{t.documento}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>Placa: {t.placa}</span>
              <span>{t.cidade}/{t.estado}</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{t.celular}</span>
            </div>
          </div>
        )}
        actions={(t) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => handleEdit(t)} title="Editar"><Pencil className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" onClick={() => handleDelete(t.id)} title="Excluir"><Trash2 className="h-4 w-4" /></Button>
          </>
        )}
        pagination={{ totalItems, pageSize, currentPage, onPageChange: setCurrentPage, onPageSizeChange: setPageSize }}
      />
    </div>
  );
};

export default Transportadores;
