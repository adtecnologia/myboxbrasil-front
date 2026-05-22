import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { useIsMobile } from "@/hooks/use-mobile";

interface Veiculo {
  id: string;
  tipoVeiculo: string;
  placa: string;
  renavam: string;
  marca: string;
  modelo: string;
  versao: string;
  anoFabricacao: string;
  anoModelo: string;
  combustivel: string;
  motor: string;
  eixos: string;
  lotacao: string; // toneladas
  tara: string; // toneladas
}

const mockVeiculos: Veiculo[] = [
  {
    id: "1",
    tipoVeiculo: "Caminhão Poli-Guindaste",
    placa: "ABC-1234",
    renavam: "12345678901",
    marca: "Mercedes-Benz",
    modelo: "Accelo 1016",
    versao: "BlueTec 5",
    anoFabricacao: "2023",
    anoModelo: "2024",
    combustivel: "Diesel",
    motor: "4.8",
    eixos: "2",
    lotacao: "6.5",
    tara: "3.5",
  },
  {
    id: "2",
    tipoVeiculo: "Caminhão Roll-on Roll-off",
    placa: "XYZ-9876",
    renavam: "98765432109",
    marca: "Volkswagen",
    modelo: "Constellation 24.280",
    versao: "6x2",
    anoFabricacao: "2022",
    anoModelo: "2022",
    combustivel: "Diesel",
    motor: "6.7",
    eixos: "3",
    lotacao: "15.0",
    tara: "8.0",
  },
];

const Veiculos = () => {
  const [items, setItems] = useState<Veiculo[]>(mockVeiculos);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Veiculo | null>(null);
  const isMobile = useIsMobile();

  const filtered = items.filter((v) =>
    v.placa.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo.toLowerCase().includes(search.toLowerCase()) ||
    v.marca.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;

    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
    } else {
      const newItem: Veiculo = {
        id: String(Date.now()),
        ...data,
      };
      setItems([newItem, ...items]);
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item: Veiculo) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este veículo?")) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold italic">Veículos</h1>
          <p className="text-sm text-white/75">Gestão da frota de veículos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Veículo" : "Cadastrar Veículo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoVeiculo">Tipo de Veículo</Label>
                  <Select name="tipoVeiculo" defaultValue={editingItem?.tipoVeiculo || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Caminhão Poli-Guindaste">Caminhão Poli-Guindaste</SelectItem>
                      <SelectItem value="Caminhão Roll-on Roll-off">Caminhão Roll-on Roll-off</SelectItem>
                      <SelectItem value="Caminhão Pipa">Caminhão Pipa</SelectItem>
                      <SelectItem value="Caminhão Caçamba">Caminhão Caçamba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa</Label>
                  <Input id="placa" name="placa" defaultValue={editingItem?.placa} required placeholder="ABC-1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renavam">Renavam</Label>
                  <Input id="renavam" name="renavam" defaultValue={editingItem?.renavam} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" name="marca" defaultValue={editingItem?.marca} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input id="modelo" name="modelo" defaultValue={editingItem?.modelo} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="versao">Versão</Label>
                  <Input id="versao" name="versao" defaultValue={editingItem?.versao} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anoFabricacao">Ano Fabricação</Label>
                  <Input id="anoFabricacao" name="anoFabricacao" type="number" defaultValue={editingItem?.anoFabricacao} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anoModelo">Ano Modelo</Label>
                  <Input id="anoModelo" name="anoModelo" type="number" defaultValue={editingItem?.anoModelo} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="combustivel">Combustível</Label>
                  <Select name="combustivel" defaultValue={editingItem?.combustivel || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Gasolina">Gasolina</SelectItem>
                      <SelectItem value="Flex">Flex</SelectItem>
                      <SelectItem value="GNV">GNV</SelectItem>
                      <SelectItem value="Elétrico">Elétrico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motor">Motor</Label>
                  <Input id="motor" name="motor" defaultValue={editingItem?.motor} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eixos">Eixos</Label>
                  <Input id="eixos" name="eixos" type="number" defaultValue={editingItem?.eixos} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lotacao">Lotação (ton)</Label>
                  <Input id="lotacao" name="lotacao" type="number" step="0.1" defaultValue={editingItem?.lotacao} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tara">Tara (ton)</Label>
                  <Input id="tara" name="tara" type="number" step="0.1" defaultValue={editingItem?.tara} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingItem ? "Salvar Alterações" : "Cadastrar Veículo"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Veiculo>
        title={`${items.length} veículos cadastrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Veículo",
            accessor: (v) => (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{v.placa}</p>
                  <p className="text-[11px] text-muted-foreground">{v.marca} {v.modelo}</p>
                </div>
              </div>
            ),
          },
          { header: "Tipo", accessor: "tipoVeiculo" },
          { header: "Ano", accessor: (v) => `${v.anoFabricacao}/${v.anoModelo}` },
          { header: "Combustível", accessor: "combustivel" },
          { header: "Lotação", accessor: (v) => v.lotacao ? `${v.lotacao}t` : "-" },
          { header: "Tara", accessor: (v) => v.tara ? `${v.tara}t` : "-" },
        ]}
        renderMobileCard={(v) => (
          <div className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-base text-foreground">{v.placa}</p>
                  <p className="text-xs text-muted-foreground">{v.marca} {v.modelo}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEdit(v)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => handleDelete(v.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Tipo</p>
                <p className="font-medium">{v.tipoVeiculo}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Ano</p>
                <p className="font-medium">{v.anoFabricacao}/{v.anoModelo}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Combustível</p>
                <p className="font-medium">{v.combustivel}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Lotação/Tara</p>
                <p className="font-medium">{v.lotacao}t / {v.tara}t</p>
              </div>
            </div>
          </div>
        )}
        actions={(v) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => handleEdit(v)} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" onClick={() => handleDelete(v.id)} title="Excluir">
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

export default Veiculos;
