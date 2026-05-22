import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";

interface Locatario {
  id: string;
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  status: "ativo" | "inativo";
  pedidosRealizados: number;
}

const mockLocatarios: Locatario[] = [
  { id: "1", nome: "Ricardo Santos", documento: "444.555.666-77", telefone: "(11) 99999-8888", email: "ricardo@obras.com", status: "ativo", pedidosRealizados: 12 },
  { id: "2", nome: "Ana Paula Lima", documento: "111.222.333-44", telefone: "(11) 98888-9999", email: "ana@engenharia.com", status: "ativo", pedidosRealizados: 5 },
];

const Locatarios = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const [locatarios, setLocatarios] = useState<Locatario[]>(mockLocatarios);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const filtered = locatarios.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.documento.includes(search)
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const novo: Locatario = {
      id: String(locatarios.length + 1),
      nome: form.get("nome") as string,
      documento: form.get("documento") as string,
      telefone: form.get("telefone") as string,
      email: form.get("email") as string,
      status: "ativo",
      pedidosRealizados: 0,
    };
    setLocatarios([novo, ...locatarios]);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Gestão de Locatários</h1>
            <p className="text-sm text-white/75">Administração de clientes que pedem caçambas</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-0"><Plus className="mr-2 h-4 w-4" /> Novo Locatário</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar Locatário</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2"><Label>Nome Completo</Label><Input name="nome" required /></div>
                <div className="space-y-2"><Label>CPF / CNPJ</Label><Input name="documento" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Telefone</Label><Input name="telefone" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" /></div>
                </div>
                <DialogFooter><Button type="submit">Cadastrar</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <DataTable<Locatario>
        title={`${locatarios.length} locatários cadastrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "Documento", accessor: "documento" },
          { 
            header: "Status", 
            accessor: (c) => (
              <Badge variant={c.status === "ativo" ? "default" : "secondary"} className={c.status === "ativo" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0" : ""}>
                {c.status}
              </Badge>
            ) 
          },
          { header: "Pedidos", accessor: "pedidosRealizados", align: "center" },
          { 
            header: "Contato", 
            accessor: (c) => (
              <div className="text-xs space-y-1">
                <p className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /> {c.telefone}</p>
                <p className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" /> {c.email}</p>
              </div>
            ) 
          },
        ]}
        renderMobileCard={(c) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground">{c.nome}</p>
                  <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase">{c.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.documento}</p>
                <p className="text-[10px] font-semibold text-primary uppercase mt-1">{c.pedidosRealizados} pedidos realizados</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.telefone}</span>
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
            </div>
          </div>
        )}
        actions={(c) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" title="Editar">
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

export default Locatarios;
