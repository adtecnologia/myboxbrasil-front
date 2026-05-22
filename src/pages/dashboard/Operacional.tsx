import { useState } from "react";
import { Plus, Search, Truck, Calendar, Weight, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";

const tiposResiduo = ["Classe A", "Classe B", "Classe C", "Classe D"];
const classesResiduo = ["Inertes", "Recicláveis", "Não recicláveis", "Perigosos"];

interface Entrada {
  id: string;
  dataHora: string;
  cliente: string;
  transportador: string;
  gerador: string;
  tipoResiduo: string;
  classeResiduo: string;
  volume: number;
  peso: number;
  status: string;
}

const mockEntradas: Entrada[] = [
  { id: "ENT-001", dataHora: "2026-03-28 08:30", cliente: "Construtora Alpha", transportador: "Trans Log", gerador: "Obra Av. Brasil", tipoResiduo: "Classe A", classeResiduo: "Inertes", volume: 5, peso: 3200, status: "Processado" },
  { id: "ENT-002", dataHora: "2026-03-28 10:15", cliente: "Demolidora Beta", transportador: "Rápido Entulho", gerador: "Demolição Centro", tipoResiduo: "Classe B", classeResiduo: "Recicláveis", volume: 3, peso: 1800, status: "Recebido" },
  { id: "ENT-003", dataHora: "2026-03-27 14:00", cliente: "Empreiteira Gama", transportador: "Trans Log", gerador: "Reforma Shopping", tipoResiduo: "Classe A", classeResiduo: "Inertes", volume: 7, peso: 4500, status: "Destinado" },
  { id: "ENT-004", dataHora: "2026-03-27 09:45", cliente: "Construtora Alpha", transportador: "EcoTransp", gerador: "Edifício Novo", tipoResiduo: "Classe C", classeResiduo: "Não recicláveis", volume: 2, peso: 950, status: "Em processamento" },
];

const statusColor: Record<string, string> = {
  "Recebido": "bg-blue-100 text-blue-700",
  "Em processamento": "bg-yellow-100 text-yellow-700",
  "Processado": "bg-primary/10 text-primary",
  "Destinado": "bg-green-100 text-green-700",
};

const Operacional = () => {
  const [entradas, setEntradas] = useState<Entrada[]>(mockEntradas);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const filtered = entradas.filter(
    (e) =>
      e.cliente.toLowerCase().includes(search.toLowerCase()) ||
      e.transportador.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nova: Entrada = {
      id: `ENT-${String(entradas.length + 1).padStart(3, "0")}`,
      dataHora: new Date().toISOString().slice(0, 16).replace("T", " "),
      cliente: form.get("cliente") as string,
      transportador: form.get("transportador") as string,
      gerador: form.get("gerador") as string,
      tipoResiduo: form.get("tipoResiduo") as string,
      classeResiduo: form.get("classeResiduo") as string,
      volume: Number(form.get("volume")),
      peso: Number(form.get("peso")),
      status: "Recebido",
    };
    setEntradas([nova, ...entradas]);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Entrada de Resíduos</h1>
          <p className="text-sm text-white/75">Módulo Operacional — Registro de entradas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0"><Plus className="mr-2 h-4 w-4" /> Nova Entrada</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Entrada de Resíduo</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="cliente">Cliente</Label><Input id="cliente" name="cliente" required placeholder="Nome do cliente" /></div>
                <div className="space-y-2"><Label htmlFor="transportador">Transportador</Label><Input id="transportador" name="transportador" required placeholder="Transportador" /></div>
                <div className="space-y-2"><Label htmlFor="gerador">Gerador</Label><Input id="gerador" name="gerador" required placeholder="Gerador" /></div>
                <div className="space-y-2">
                  <Label htmlFor="tipoResiduo">Tipo de Resíduo</Label>
                  <Select name="tipoResiduo" required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{tiposResiduo.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classeResiduo">Classe</Label>
                  <Select name="classeResiduo" required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{classesResiduo.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="volume">Volume (m³)</Label><Input id="volume" name="volume" type="number" step="0.1" required placeholder="0" /></div>
                <div className="space-y-2"><Label htmlFor="peso">Peso (kg)</Label><Input id="peso" name="peso" type="number" required placeholder="0" /></div>
              </div>
              <DialogFooter><Button type="submit" className="w-full sm:w-auto">Registrar Entrada</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Entradas hoje" value={2} icon={Truck} />
        <StatCard label="Volume total" value="17 m³" icon={Ruler} />
        <StatCard label="Peso total" value="10.450 kg" icon={Weight} />
        <StatCard label="Este mês" value={86} icon={Calendar} />
      </div>

      {/* Search + Table/Cards */}
      <DataTable<Entrada>
        title="Entradas recentes"
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "ID", accessor: "id", className: "font-medium" },
          { header: "Data/Hora", accessor: "dataHora", className: "text-sm" },
          { header: "Cliente", accessor: "cliente" },
          { header: "Transportador", accessor: "transportador" },
          { header: "Tipo", accessor: "tipoResiduo" },
          { header: "Vol.", accessor: (e) => `${e.volume} m³` },
          { header: "Peso", accessor: (e) => `${e.peso.toLocaleString()} kg` },
          { 
            header: "Status", 
            accessor: (e) => (
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[e.status] || ""}`}>
                {e.status}
              </span>
            ) 
          },
        ]}
        renderMobileCard={(e) => (
          <div className="rounded-lg border border-border bg-background p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">{e.cliente}</p>
                <p className="text-xs text-muted-foreground">{e.id} · {e.dataHora}</p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[e.status] || ""}`}>{e.status}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Transp: {e.transportador}</span>
              <span>Tipo: {e.tipoResiduo}</span>
            </div>
            <div className="flex gap-4 text-xs font-medium text-foreground pt-1">
              <span>{e.volume} m³</span>
              <span>{e.peso.toLocaleString()} kg</span>
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

export default Operacional;
