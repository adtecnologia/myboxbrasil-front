import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";

interface Gerador {
  id: string;
  nome: string;
  documento: string;
  tipoResiduo: string;
  obra: string;
  cidade: string;
  estado: string;
}

const mockGeradores: Gerador[] = [
  { id: "1", nome: "Construtora Alvorada", documento: "11.222.333/0001-44", tipoResiduo: "Classe A - Inerte", obra: "Edifício Central Park", cidade: "São Paulo", estado: "SP" },
  { id: "2", nome: "Demolidora Forte", documento: "55.666.777/0001-88", tipoResiduo: "Classe B - Reciclável", obra: "Reforma Av. Paulista", cidade: "São Paulo", estado: "SP" },
];

const initials = (n: string) => (n || "").trim().substring(0, 2).toUpperCase() || "GR";

const Geradores = () => {
  const [items, setItems] = useState<Gerador[]>(mockGeradores);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Gerador | null>(null);

  const filtered = items.filter((g) =>
    g.nome.toLowerCase().includes(search.toLowerCase()) ||
    g.documento.includes(search) ||
    g.obra.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleEdit = (item: Gerador) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Factory className="h-6 w-6" /> Geradores</h1>
          <p className="text-sm text-white/75">Empresas/obras geradoras dos resíduos recebidos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0"><Plus className="mr-2 h-4 w-4" /> Novo Gerador</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar Gerador" : "Cadastrar Gerador"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome / Razão Social</Label><Input defaultValue={editing?.nome} /></div>
              <div><Label>CNPJ</Label><Input defaultValue={editing?.documento} /></div>
              <div><Label>Obra</Label><Input defaultValue={editing?.obra} /></div>
              <div><Label>Tipo de Resíduo</Label><Input defaultValue={editing?.tipoResiduo} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cidade</Label><Input defaultValue={editing?.cidade} /></div>
                <div><Label>Estado</Label><Input defaultValue={editing?.estado} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={() => setDialogOpen(false)}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Gerador>
        title={`${items.length} geradores`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "",
            accessor: (g) => (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{initials(g.nome)}</div>
            ),
          },
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "CNPJ", accessor: "documento" },
          { header: "Obra", accessor: "obra" },
          { header: "Tipo de Resíduo", accessor: "tipoResiduo" },
          { header: "Cidade/UF", accessor: (g) => `${g.cidade}/${g.estado}` },
        ]}
        renderMobileCard={(g) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">{initials(g.nome)}</div>
                <div>
                  <p className="font-medium text-sm text-foreground">{g.nome}</p>
                  <p className="text-xs text-muted-foreground">{g.documento}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(g.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>Obra: {g.obra}</span>
              <span>{g.tipoResiduo}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{g.cidade}/{g.estado}</span>
            </div>
          </div>
        )}
        actions={(g) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => handleEdit(g)} title="Editar"><Pencil className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" onClick={() => handleDelete(g.id)} title="Excluir"><Trash2 className="h-4 w-4" /></Button>
          </>
        )}
        pagination={{ totalItems, pageSize, currentPage, onPageChange: setCurrentPage, onPageSizeChange: setPageSize }}
      />
    </div>
  );
};

export default Geradores;