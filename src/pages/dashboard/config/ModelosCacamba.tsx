import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { useLocadorTable } from "@/hooks/useLocadorTable";
import { toast } from "@/hooks/use-toast";

interface ModeloCacamba {
  id: string;
  foto_url?: string | null;
  modelo: string;
  tipo: string | null;
  capacidade: string;
  medida_a: string | null;
  medida_b: string | null;
  medida_c: string | null;
  medida_d: string | null;
  medida_e: string | null;
  medida_f: string | null;
  preco_minimo: number | null;
}

const MEDIDAS = ["a", "b", "c", "d", "e", "f"] as const;
const parsePreco = (v: string) => {
  const n = Number(String(v).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const formatPreco = (v: number | null) =>
  v == null ? "" : v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ModelosCacamba = () => {
  const { rows: modelos, create, update, remove } = useLocadorTable<ModeloCacamba>("modelos_cacamba");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<ModeloCacamba | null>(null);
  const [tipo, setTipo] = useState<string>("");
  const isMobile = useIsMobile();

  const filtered = modelos.filter((m) =>
    m.modelo.toLowerCase().includes(search.toLowerCase()) ||
    m.capacidade.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!tipo) {
      toast({ title: "Tipo é obrigatório", description: "Selecione Estacionária ou Roll-on/Roll-off", variant: "destructive" });
      return;
    }
    const dados = {
      modelo: form.get("modelo") as string,
      tipo,
      capacidade: (form.get("capacidade") as string) + "m³",
      medida_a: form.get("medidaA") as string,
      medida_b: form.get("medidaB") as string,
      medida_c: form.get("medidaC") as string,
      medida_d: form.get("medidaD") as string,
      medida_e: form.get("medidaE") as string,
      medida_f: form.get("medidaF") as string,
      preco_minimo: parsePreco(form.get("precoMinimo") as string),
    };
    const ok = editingModelo
      ? await update(editingModelo.id, dados)
      : await create(dados);
    if (ok) {
      setDialogOpen(false);
      setEditingModelo(null);
    }
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const openEdit = (modelo: ModeloCacamba) => {
    setEditingModelo(modelo);
    setTipo(modelo.tipo ?? "");
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
          if (!open) {
            setEditingModelo(null);
            setTipo("");
          }
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
            <form onSubmit={handleSave}>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1 sm:col-span-3">
                  <Label htmlFor="foto">Foto do Modelo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden">
                      {editingModelo?.foto_url ? (
                        <img src={editingModelo.foto_url} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                      )}
                    </div>
                    <Input id="foto" name="foto" type="file" accept="image/*" className="flex-1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger id="tipo">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Estacionária">Estacionária</SelectItem>
                      <SelectItem value="Roll-on/Roll-off">Roll-on/Roll-off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input id="modelo" name="modelo" defaultValue={editingModelo?.modelo} required placeholder="Ex: Padrão 4m³" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidade">Capacidade (m³)</Label>
                  <Input id="capacidade" name="capacidade" type="number" step="0.01" defaultValue={editingModelo?.capacidade.replace("m³", "")} required placeholder="Ex: 4" />
                </div>
                
                <div className="col-span-1 sm:col-span-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((m) => (
                    <div key={m} className="space-y-1">
                      <Label htmlFor={`medida${m}`} className="text-[10px] uppercase font-bold text-muted-foreground">Medida {m} (m)</Label>
                      <Input id={`medida${m}`} name={`medida${m}`} defaultValue={(editingModelo as any)?.[`medida_${m.toLowerCase()}`] ?? ""} placeholder="0.00" className="h-8 text-xs text-center" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precoMinimo">Preço Mínimo (R$)</Label>
                  <Input id="precoMinimo" name="precoMinimo" defaultValue={formatPreco(editingModelo?.preco_minimo ?? null)} required placeholder="0,00" isCurrency />
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
          { header: "Tipo", accessor: (m) => m.tipo ? <Badge variant="secondary" className="text-[10px] font-normal">{m.tipo}</Badge> : "-" },
          { header: "Capac.", accessor: "capacidade" },
          ...['A', 'B', 'C', 'D', 'E', 'F'].map(l => ({
            header: l,
            accessor: (m: ModeloCacamba) => (m as any)[`medida_${l.toLowerCase()}`] ?? "",
            align: "center" as const,
            className: "text-xs text-muted-foreground w-12"
          })),
          { 
            header: "Preço Mínimo", 
            accessor: (m) => <span className="font-semibold text-primary">R$ {formatPreco(m.preco_minimo)}</span>,
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
                  {m.tipo && <Badge variant="secondary" className="text-[10px] font-normal mt-1">{m.tipo}</Badge>}
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
                  <div>{(m as any)[`medida_${label.toLowerCase()}`] ?? ""}</div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Preço Mínimo:</span>
              <span className="text-primary font-bold">R$ {formatPreco(m.preco_minimo)}</span>
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