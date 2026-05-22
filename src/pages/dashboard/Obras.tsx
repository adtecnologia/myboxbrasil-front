import { useState } from "react";
import { Plus, Search, Pencil, Trash2, MapPin, Building2, Phone, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePagination } from "@/components/DataPagination";
import { ObraForm } from "@/components/dashboard/obras/ObraForm";


interface Obra {
  id: string;
  nome: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
  estado: string;
  responsavel: string;
  telefone: string;
  dataInicio: string;
  dataFinalEstimada: string;
  status: "ativa" | "finalizada";
}

const mockObras: Obra[] = [
  { 
    id: "1", 
    nome: "Residencial Solar", 
    rua: "Rua Mirassol", 
    numero: "216", 
    bairro: "Vila Redentora", 
    complemento: "Bloco A",
    cidade: "São José do Rio Preto", 
    estado: "SP",
    responsavel: "Pietro Lorenzo", 
    telefone: "(11) 98888-7777", 
    dataInicio: "10/01/2026", 
    dataFinalEstimada: "10/12/2026",
    status: "ativa" 
  },
  { 
    id: "2", 
    nome: "Edifício Mar", 
    rua: "Av. Atlântica", 
    numero: "500", 
    bairro: "Centro", 
    complemento: "Cobertura",
    cidade: "Balneário Camboriú", 
    estado: "SC",
    responsavel: "Julia Rebeca", 
    telefone: "(11) 97777-6666", 
    dataInicio: "15/01/2026", 
    dataFinalEstimada: "15/01/2027",
    status: "ativa" 
  },
];

const Obras = () => {
  const [obras, setObras] = useState<Obra[]>(mockObras);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);

  const filtered = obras.filter((o) =>
    o.nome.toLowerCase().includes(search.toLowerCase()) ||
    o.rua.toLowerCase().includes(search.toLowerCase()) ||
    o.cidade.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = (data: any) => {
    if (editingObra) {
      setObras(obras.map(o => o.id === editingObra.id ? { ...o, ...data } : o));
    } else {
      const nova: Obra = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: "ativa"
      };
      setObras([nova, ...obras]);
    }
    setDialogOpen(false);
    setEditingObra(null);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Obras</h1>
          <p className="text-sm text-white/75">Gerencie seus canteiros de obras e locais de entrega</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingObra(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Nova Obra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingObra ? "Editar Obra" : "Cadastrar Nova Obra"}</DialogTitle>
            </DialogHeader>
            <div className="px-1">
              <ObraForm 
                onSave={handleSave} 
                initialData={editingObra} 
                submitLabel={editingObra ? "Salvar Alterações" : "Cadastrar Obra"} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Obra>
        title={`${obras.length} obras cadastradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, rua ou cidade..."
        columns={[
          {
            header: "Obra",
            accessor: (o) => (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm leading-none mb-1">{o.nome}</p>
                  <div className="flex items-center text-[10px] text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3" />
                    {o.rua}, {o.numero} - {o.bairro}, {o.cidade}/{o.estado}
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: "Responsável",
            accessor: (o) => (
              <div className="space-y-1">
                <p className="text-sm">{o.responsavel}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Phone className="mr-1 h-3 w-3" />
                  {o.telefone}
                </div>
              </div>
            ),
          },
          {
            header: "Cronograma",
            accessor: (o) => (
              <div className="space-y-1">
                <div className="flex items-center text-xs">
                  <Calendar className="mr-1.5 h-3 w-3 text-primary" />
                  <span className="text-muted-foreground mr-1">Início:</span> {o.dataInicio}
                </div>
                <div className="flex items-center text-xs">
                  <Clock className="mr-1.5 h-3 w-3 text-orange-500" />
                  <span className="text-muted-foreground mr-1">Fim est.:</span> {o.dataFinalEstimada}
                </div>
              </div>
            ),
          },
          {
            header: "Status",
            accessor: (o) => (
              <Badge variant={o.status === "ativa" ? "default" : "secondary"}>
                {o.status === "ativa" ? "Ativa" : "Finalizada"}
              </Badge>
            ),
          },
        ]}
        actions={(o) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
              setEditingObra(o);
              setDialogOpen(true);
            }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg text-destructive">
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

export default Obras;
