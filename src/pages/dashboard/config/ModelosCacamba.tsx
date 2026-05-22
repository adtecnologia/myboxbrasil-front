import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";

interface ModeloCacamba {
  id: string;
  foto?: string;
  modelo: string;
  capacidade: string;
  medidaA: string;
  medidaB: string;
  medidaC: string;
  medidaD: string;
  medidaE: string;
  medidaF: string;
  precoMinimo: string;
}

const mockModelos: ModeloCacamba[] = [
  { 
    id: "1", 
    modelo: "Padrão 4m³", 
    capacidade: "4m³", 
    medidaA: "250", medidaB: "160", medidaC: "110", medidaD: "170", medidaE: "150", medidaF: "120",
    precoMinimo: "250,00"
  },
  { 
    id: "2", 
    modelo: "Mini 3m³", 
    capacidade: "3m³", 
    medidaA: "200", medidaB: "150", medidaC: "90", medidaD: "150", medidaE: "140", medidaF: "100",
    precoMinimo: "200,00"
  },
];

const ModelosCacamba = () => {
  const [modelos, setModelos] = useState<ModeloCacamba[]>(mockModelos);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<ModeloCacamba | null>(null);
  const isMobile = useIsMobile();

  const filtered = modelos.filter((m) =>
    m.modelo.toLowerCase().includes(search.toLowerCase()) ||
    m.capacidade.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    const dados: Partial<ModeloCacamba> = {
      modelo: form.get("modelo") as string,
      capacidade: (form.get("capacidade") as string) + "m³",
      medidaA: form.get("medidaA") as string,
      medidaB: form.get("medidaB") as string,
      medidaC: form.get("medidaC") as string,
      medidaD: form.get("medidaD") as string,
      medidaE: form.get("medidaE") as string,
      medidaF: form.get("medidaF") as string,
      precoMinimo: form.get("precoMinimo") as string,
    };

    if (editingModelo) {
      setModelos(modelos.map(m => m.id === editingModelo.id ? { ...m, ...dados } : m));
    } else {
      const novo: ModeloCacamba = {
        id: String(Date.now()),
        ...dados as any
      };
      setModelos([novo, ...modelos]);
    }
    
    setDialogOpen(false);
    setEditingModelo(null);
  };

  const handleDelete = (id: string) => {
    setModelos(modelos.filter(m => m.id !== id));
  };

  const openEdit = (modelo: ModeloCacamba) => {
    setEditingModelo(modelo);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Modelos de Caçamba</h1>
          <p className="text-sm text-white/75">Gestão de especificações técnicas das caçambas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingModelo(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingModelo ? "Editar Modelo" : "Cadastrar Modelo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <Label htmlFor="foto">Foto do Modelo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden">
                      {editingModelo?.foto ? (
                        <img src={editingModelo.foto} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                      )}
                    </div>
                    <Input id="foto" name="foto" type="file" accept="image/*" className="flex-1" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input id="modelo" name="modelo" defaultValue={editingModelo?.modelo} required placeholder="Ex: Padrão 4m³" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidade">Capacidade (m³)</Label>
                  <Input id="capacidade" name="capacidade" type="number" step="0.01" defaultValue={editingModelo?.capacidade.replace("m³", "")} required placeholder="Ex: 4" />
                </div>
                
                <div className="col-span-1 sm:col-span-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((m) => (
                    <div key={m} className="space-y-1">
                      <Label htmlFor={`medida${m}`} className="text-[10px] uppercase font-bold text-muted-foreground">Medida {m} (m)</Label>
                      <Input id={`medida${m}`} name={`medida${m}`} defaultValue={(editingModelo as any)?.[`medida${m}`]} required placeholder="0.00" className="h-8 text-xs text-center" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precoMinimo">Preço Mínimo (R$)</Label>
                  <Input id="precoMinimo" name="precoMinimo" defaultValue={editingModelo?.precoMinimo} required placeholder="0,00" isCurrency />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto">{editingModelo ? "Salvar Alterações" : "Cadastrar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<ModeloCacamba>
        title={`${modelos.length} modelos cadastrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Foto",
            accessor: () => (
              <div className="h-10 w-10 mx-auto rounded bg-muted flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
              </div>
            ),
            align: "center",
          },
          { header: "Modelo", accessor: "modelo", className: "font-bold" },
          { header: "Capac.", accessor: "capacidade" },
          ...['A', 'B', 'C', 'D', 'E', 'F'].map(l => ({
            header: l,
            accessor: (m: ModeloCacamba) => (m as any)[`medida${l}`],
            align: "center" as const,
            className: "text-xs text-muted-foreground w-12"
          })),
          { 
            header: "Preço Mínimo", 
            accessor: (m) => <span className="font-semibold text-primary">R$ {m.precoMinimo}</span>,
            className: "w-32"
          },
        ]}
        renderMobileCard={(m) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex gap-3 min-w-0 flex-1">
                <div className="h-12 w-12 shrink-0 rounded bg-muted flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-foreground truncate">{m.modelo}</p>
                  <p className="text-xs text-muted-foreground">Capacidade: {m.capacidade}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-6 gap-1 bg-muted/30 p-2 rounded text-[10px] text-center">
              {['A', 'B', 'C', 'D', 'E', 'F'].map((label) => (
                <div key={label}>
                  <div className="font-bold text-muted-foreground">{label}</div>
                  <div>{(m as any)[`medida${label}`]}</div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Preço Mínimo:</span>
              <span className="text-primary font-bold">R$ {m.precoMinimo}</span>
            </div>
          </div>
        )}
        actions={(m) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => openEdit(m)} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" onClick={() => handleDelete(m.id)} title="Excluir">
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

export default ModelosCacamba;