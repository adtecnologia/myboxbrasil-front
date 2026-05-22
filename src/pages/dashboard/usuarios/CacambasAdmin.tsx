import { useState } from "react";
import { Search, Image as ImageIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { CacambaForm, CacambaFormData } from "@/components/CacambaForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePagination } from "@/components/DataPagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface CacambaAdmin {
  id: string;
  foto?: string;
  locador: string;
  modeloCacamba: string;
  tipoLocacao: "Externo" | "Interno" | "Ambos";
  precoExterno: string;
  precoInterno: string;
  diasExterno: number;
  diasInterno: number;
  tampa: "Sim" | "Não";
  cor: string;
  unidades: { id: string; codigo: string; disponivel: boolean; manutencao: boolean }[];
}

const mockCacambas: CacambaAdmin[] = [
  { 
    id: "1", 
    locador: "Silva Transportes", 
    modeloCacamba: "Padrão 4m³", 
    tipoLocacao: "Ambos",
    precoExterno: "250,00",
    precoInterno: "200,00",
    diasExterno: 3,
    diasInterno: 5,
    tampa: "Não",
    cor: "Azul",
    unidades: [
      { id: "u1", codigo: "CAC-001", disponivel: true, manutencao: false },
      { id: "u2", codigo: "CAC-002", disponivel: false, manutencao: false },
    ]
  },
  { 
    id: "2", 
    locador: "Oliveira Entulhos", 
    modeloCacamba: "Mini 3m³", 
    tipoLocacao: "Externo",
    precoExterno: "180,00",
    precoInterno: "-",
    diasExterno: 2,
    diasInterno: 0,
    tampa: "Sim",
    cor: "Verde",
    unidades: [
      { id: "u3", codigo: "CAC-003", disponivel: true, manutencao: false },
    ]
  },
];

const CacambasAdmin = () => {
  const [cacambas, setCacambas] = useState<CacambaAdmin[]>(mockCacambas);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCacamba, setEditingCacamba] = useState<CacambaAdmin | null>(null);
  const activeProfileType = useAuthStore((state) => state.activeProfileType());
  const isLocador = activeProfileType === "locador";

  const filtered = cacambas.filter((v) =>
    v.locador.toLowerCase().includes(search.toLowerCase()) ||
    v.modeloCacamba.toLowerCase().includes(search.toLowerCase()) ||
    v.cor.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const modeloLabel = (id: string) => {
    const map: Record<string, string> = {
      "mini-3m": "Mini 3m³",
      "padrao-4m": "Padrão 4m³",
      "media-5m": "Média 5m³",
      "grande-7m": "Grande 7m³",
      "extra-10m": "Extra 10m³",
    };
    return map[id] || id;
  };

  const handleCreate = (data: CacambaFormData) => {
    const newCacamba: CacambaAdmin = {
      id: Math.random().toString(36).substr(2, 9),
      locador: "Meu Locador",
      modeloCacamba: modeloLabel(data.modelo),
      tipoLocacao: data.tipoLocacao,
      precoExterno: data.precoExterno,
      precoInterno: data.precoInterno,
      diasExterno: Number(data.diasExterno) || 0,
      diasInterno: Number(data.diasInterno) || 0,
      tampa: data.tipoTampa === "sem" ? "Não" : "Sim",
      cor: data.cores,
      unidades: data.unidades,
    };
    
    setCacambas([newCacamba, ...cacambas]);
    setIsDialogOpen(false);
    toast.success("Caçamba cadastrada com sucesso!");
  };

  const handleEdit = (data: CacambaFormData) => {
    if (!editingCacamba) return;
    
    const updated = cacambas.map(c => 
      c.id === editingCacamba.id 
        ? { 
            ...c, 
            modeloCacamba: modeloLabel(data.modelo),
            tipoLocacao: data.tipoLocacao,
            precoExterno: data.precoExterno,
            precoInterno: data.precoInterno,
            diasExterno: Number(data.diasExterno) || 0,
            diasInterno: Number(data.diasInterno) || 0,
            tampa: data.tipoTampa === "sem" ? "Não" : "Sim" as "Sim" | "Não",
            cor: data.cores,
            unidades: data.unidades,
          } 

        : c
    );
    
    setCacambas(updated);
    setEditingCacamba(null);
    setIsDialogOpen(false);
    toast.success("Caçamba atualizada com sucesso!");
  };

  const handleDelete = (id: string) => {
    setCacambas(cacambas.filter(c => c.id !== id));
    toast.success("Caçamba removida com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold italic">Gestão de Caçambas</h1>
          <p className="text-sm text-white/75">Gerencie seu inventário e preços de locação</p>
        </div>
        {isLocador && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingCacamba(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
                <Plus className="mr-2 h-4 w-4" />
                Nova Caçamba
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 shrink-0 border-b">
                <DialogTitle>{editingCacamba ? "Editar Caçamba" : "Cadastrar Nova Caçamba"}</DialogTitle>
              </DialogHeader>
              <CacambaForm 
                initialData={editingCacamba ? {
                  tipoLocacao: editingCacamba.tipoLocacao,
                  precoExterno: editingCacamba.precoExterno,
                  precoInterno: editingCacamba.precoInterno,
                  diasExterno: editingCacamba.diasExterno.toString(),
                  diasInterno: editingCacamba.diasInterno.toString(),
                  tipoTampa: editingCacamba.tampa === "Sim" ? "articulada" : "sem",
                  cores: editingCacamba.cor,
                  unidades: editingCacamba.unidades,
                } : undefined}

                onSubmit={editingCacamba ? handleEdit : handleCreate} 
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable<CacambaAdmin>
        title={`${cacambas.length} caçambas registradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por locador, modelo ou cor..."
        columns={[
          {
            header: "Foto",
            accessor: () => (
              <div className="h-10 w-10 mx-auto rounded bg-muted flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
              </div>
            ),
            align: "center",
            className: "w-16",
          },
          { header: "Locador", accessor: "locador", className: "font-medium text-sm" },
          { 
            header: "Modelo", 
            accessor: (v) => (
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">{v.modeloCacamba}</span>
                <div className="flex gap-1.5 items-center flex-wrap">
                  <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal bg-muted/30">
                    Tampa: {v.tampa}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal bg-muted/30">
                    Cor: {v.cor}
                  </Badge>
                </div>
              </div>
            ),
            className: "text-sm" 
          },

          {
            header: "Locação",
            accessor: (v) => <Badge variant="secondary" className="text-[10px] font-normal">{v.tipoLocacao}</Badge>,
          },
          {
            header: "Preço (Ext/Int)",
            accessor: (v) => (
              <div className="flex flex-col text-xs">
                <span>Ext: R$ {v.precoExterno}</span>
                <span>Int: R$ {v.precoInterno}</span>
              </div>
            ),
          },
          {
            header: "Dias (Ext/Int)",
            accessor: (v) => (
              <div className="flex flex-col text-xs">
                <span>Ext: {v.diasExterno} dias</span>
                <span>Int: {v.diasInterno} dias</span>
              </div>
            ),
          },
          { 
            header: "Disponíveis", 
            accessor: (v) => {
              const total = v.unidades?.length || 0;
              const disponiveis = v.unidades?.filter(u => u.disponivel).length || 0;
              return (
                <div className="flex items-center gap-2">
                  <Badge variant={disponiveis > 0 ? "default" : "destructive"} className="h-6 px-2 text-[11px]">
                    {disponiveis} / {total}
                  </Badge>
                </div>
              );
            },
            align: "center",
          },

        ]}
        actions={(v) => isLocador ? (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm"
              onClick={() => {
                setEditingCacamba(v);
                setIsDialogOpen(true);
              }}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive"
              onClick={() => handleDelete(v.id)}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : null}
        renderMobileCard={(v) => (
          <div className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-base text-foreground truncate">{v.locador}</p>
                  <p className="text-xs text-primary font-medium">{v.modeloCacamba}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{v.tipoLocacao}</Badge>
                </div>
              </div>
              {isLocador && (
                <div className="flex gap-1 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => {
                      setEditingCacamba(v);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full text-destructive"
                    onClick={() => handleDelete(v.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Preço Ext/Int</p>
                <p className="font-medium">R$ {v.precoExterno} / R$ {v.precoInterno}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Dias Ext/Int</p>
                <p className="font-medium">{v.diasExterno}d / {v.diasInterno}d</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Tampa</p>
                <p className="font-medium">{v.tampa}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Cor</p>
                <p className="font-medium">{v.cor}</p>
              </div>
            </div>
          </div>
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

export default CacambasAdmin;
