import { useState } from "react";
import { Search, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";

interface Faturamento {
  id: string;
  entradaId: string;
  cliente: string;
  valor: number;
  status: "Pendente" | "Pago" | "Vencido";
  formaPagamento: string;
  dataVencimento: string;
}

const mockFat: Faturamento[] = [
  { id: "FAT-001", entradaId: "ENT-001", cliente: "Construtora Alpha", valor: 850, status: "Pago", formaPagamento: "PIX", dataVencimento: "2026-04-05" },
  { id: "FAT-002", entradaId: "ENT-002", cliente: "Demolidora Beta", valor: 520, status: "Pendente", formaPagamento: "Boleto", dataVencimento: "2026-04-10" },
  { id: "FAT-003", entradaId: "ENT-003", cliente: "Empreiteira Gama", valor: 1200, status: "Pago", formaPagamento: "PIX", dataVencimento: "2026-03-30" },
  { id: "FAT-004", entradaId: "ENT-004", cliente: "Construtora Alpha", valor: 380, status: "Vencido", formaPagamento: "Boleto", dataVencimento: "2026-03-15" },
  { id: "FAT-005", entradaId: "ENT-005", cliente: "Demolidora Beta", valor: 950, status: "Pendente", formaPagamento: "Transferência", dataVencimento: "2026-04-15" },
];

const statusColor: Record<string, string> = {
  Pendente: "bg-yellow-100 text-yellow-700",
  Pago: "bg-green-100 text-green-700",
  Vencido: "bg-red-100 text-red-700",
};

const Financeiro = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const isMobile = useIsMobile();

  const filtered = mockFat.filter((f) => {
    const matchSearch = f.cliente.toLowerCase().includes(search.toLowerCase()) || f.id.includes(search);
    const matchStatus = statusFilter === "todos" || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const totalPago = mockFat.filter(f => f.status === "Pago").reduce((s, f) => s + f.valor, 0);
  const totalPendente = mockFat.filter(f => f.status === "Pendente").reduce((s, f) => s + f.valor, 0);
  const totalVencido = mockFat.filter(f => f.status === "Vencido").reduce((s, f) => s + f.valor, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <h1 className="text-xl sm:text-2xl font-bold">Financeiro</h1>
        <p className="text-sm text-white/75">Cobranças por operação de entrada</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2"><DollarSign className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold text-foreground">R$ {(totalPago + totalPendente + totalVencido).toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-green-100 p-2"><CheckCircle className="h-5 w-5 text-green-700" /></div><div><p className="text-xs text-muted-foreground">Pago</p><p className="text-lg font-bold text-foreground">R$ {totalPago.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-yellow-100 p-2"><Clock className="h-5 w-5 text-yellow-700" /></div><div><p className="text-xs text-muted-foreground">Pendente</p><p className="text-lg font-bold text-foreground">R$ {totalPendente.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-red-100 p-2"><TrendingUp className="h-5 w-5 text-red-700" /></div><div><p className="text-xs text-muted-foreground">Vencido</p><p className="text-lg font-bold text-foreground">R$ {totalVencido.toLocaleString()}</p></div></CardContent></Card>
      </div>

      <DataTable<Faturamento>
        title="Cobranças"
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        activeFiltersCount={statusFilter !== "todos" ? 1 : 0}
        onClearFilters={() => setStatusFilter("todos")}
        filters={
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Situação</h4>
              <p className="text-sm text-muted-foreground">Filtre por status de pagamento.</p>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        columns={[
          { header: "ID", accessor: "id", className: "font-medium" },
          { header: "Entrada", accessor: "entradaId" },
          { header: "Cliente", accessor: "cliente" },
          { 
            header: "Valor", 
            accessor: (f) => <span className="font-medium">R$ {f.valor.toLocaleString()}</span> 
          },
          { header: "Pagamento", accessor: "formaPagamento" },
          { header: "Vencimento", accessor: "dataVencimento" },
          { 
            header: "Status", 
            accessor: (f) => (
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[f.status]}`}>
                {f.status}
              </span>
            ) 
          },
        ]}
        renderMobileCard={(f) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">{f.cliente}</p>
                <p className="text-xs text-muted-foreground">{f.id} · {f.entradaId}</p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[f.status]}`}>{f.status}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-foreground">R$ {f.valor.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{f.formaPagamento} · Venc: {f.dataVencimento}</span>
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

export default Financeiro;
