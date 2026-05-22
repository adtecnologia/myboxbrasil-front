import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ListChecks, ShoppingCart, XCircle, Ban, MapPin, List, Calendar, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { StatCard } from "@/components/StatCard";
import { DataTable, Column } from "@/components/DataTable";

export interface Pedido {
  id: number;
  dataAbertura: string;
  status: "aguardando" | "aceito" | "recusado" | "cancelado";
  locatario: string;
  endereco: string;
  quantidade: number;
  valorTotal: number;
  modelo: string;
  cacamba: string;
  situacaoCacamba: string;
}

export const mockPedidos: Pedido[] = [
  { id: 86, dataAbertura: "2025-12-11 10:50", status: "aceito", locatario: "Juan Ricardo Gustavo Silva", endereco: "Rua Vera, 111 - Jardim Soraia - São José do Rio Preto / SP", quantidade: 1, valorTotal: 200, modelo: "Estacionária C4", cacamba: "XBVCFJ2IOPGAKKS9", situacaoCacamba: "Entrega pendente" },
  { id: 85, dataAbertura: "2025-12-11 10:49", status: "aceito", locatario: "Juliana Louise Laura da Silva", endereco: "Rua das Tulipas, 337 - Condomínio São João I (Zona Rural) - São José do Rio Preto / SP", quantidade: 1, valorTotal: 200, modelo: "Estacionária C4", cacamba: "XBVCFJ2IOPGAKKS9", situacaoCacamba: "Entrega pendente" },
  { id: 84, dataAbertura: "2025-12-11 10:49", status: "aceito", locatario: "Isabelle Sophia Isabelle da Cunha", endereco: "Rua Sebastião Severiano, 500 - Conjunto Habitacional Cristo Rei - São José do Rio Preto / SP", quantidade: 1, valorTotal: 200, modelo: "Estacionária C4", cacamba: "MU3UJ2YY3RTG1JKG", situacaoCacamba: "Entrega pendente" },
  { id: 83, dataAbertura: "2025-12-11 10:49", status: "aceito", locatario: "Kamilly Maitê Rodrigues", endereco: "Rua Mário Alves da Silva, 245 - Residencial Colorado - São José do Rio Preto / SP", quantidade: 1, valorTotal: 369, modelo: "Estacionária C4", cacamba: "TWF0KBMV80AMFK4S", situacaoCacamba: "Entrega pendente" },
  { id: 82, dataAbertura: "2025-12-11 10:49", status: "aceito", locatario: "Sophie Francisca Giovana Martins", endereco: "Rua São Judas Tadeu, 508 - Centro (Engenheiro Schmitt) - São José do Rio Preto / SP", quantidade: 1, valorTotal: 324, modelo: "Roll-on/Roll-of até 80m³", cacamba: "GC8QSI3L4DVEV34Z", situacaoCacamba: "Entrega pendente" },
  { id: 81, dataAbertura: "2025-12-11 10:48", status: "aceito", locatario: "Analu Priscila Ramos", endereco: "Rua Nildo Morselli, 864 - Residencial Gaivota II - São José do Rio Preto / SP", quantidade: 1, valorTotal: 369, modelo: "Estacionária C7", cacamba: "ZBZVK0RGEC7CR47D", situacaoCacamba: "CDF Emitido" },
  { id: 80, dataAbertura: "2025-12-11 10:48", status: "aceito", locatario: "Isabelle Sophia Isabelle da Cunha", endereco: "Rua Sebastião Severiano, 500 - Conjunto Habitacional Cristo Rei - São José do Rio Preto / SP", quantidade: 1, valorTotal: 200, modelo: "Estacionária C4", cacamba: "MU3UJ2YY3RTG1JKG", situacaoCacamba: "Entrega pendente" },
  { id: 78, dataAbertura: "2025-12-11 10:47", status: "aguardando", locatario: "Julia Rebeca Daiane Bernarde", endereco: "Rua Mirassol, 216 - Vila Redentora - São José do Rio Preto / SP", quantidade: 1, valorTotal: 267, modelo: "Roll-on/Roll-of até 10m³", cacamba: "—", situacaoCacamba: "—" },
  { id: 79, dataAbertura: "2025-12-11 10:47", status: "aceito", locatario: "Julia Rebeca Daiane Bernarde", endereco: "Rua Mirassol, 216 - Vila Redentora - São José do Rio Preto / SP", quantidade: 1, valorTotal: 369, modelo: "Estacionária C4", cacamba: "AR77M6TVDL1F1NZ3", situacaoCacamba: "Em trânsito para retirada" },
];

const statusLabel: Record<Pedido["status"], string> = {
  aguardando: "Aguardando Confirmação",
  aceito: "Pedido aceito",
  recusado: "Pedido recusado",
  cancelado: "Pedido cancelado",
};

const statusClasses: Record<Pedido["status"], string> = {
  aguardando: "bg-orange-500 text-white",
  aceito: "bg-primary text-primary-foreground",
  recusado: "bg-destructive text-destructive-foreground",
  cancelado: "bg-muted text-muted-foreground",
};

const PedidosList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const isMobile = useIsMobile();

  const counts = useMemo(() => ({
    aguardando: mockPedidos.filter((p) => p.status === "aguardando").length,
    aceito: mockPedidos.filter((p) => p.status === "aceito").length,
    recusado: mockPedidos.filter((p) => p.status === "recusado").length,
    cancelado: mockPedidos.filter((p) => p.status === "cancelado").length,
  }), []);

  const filtered = mockPedidos.filter((p) => {
    const matchesSearch = 
      p.locatario.toLowerCase().includes(search.toLowerCase()) ||
      p.endereco.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).includes(search);
    
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    
    // Simple date string comparison (YYYY-MM-DD)
    const matchesDate = !dateFilter || p.dataAbertura.includes(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const stats = [
    { label: "Aguardando confirmação", value: counts.aguardando, icon: ShoppingCart },
    { label: "Pedidos aceitos", value: counts.aceito, icon: ListChecks },
    { label: "Pedidos recusados", value: counts.recusado, icon: XCircle },
    { label: "Pedidos cancelados", value: counts.cancelado, icon: Ban },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <h1 className="text-xl sm:text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-white/75">Acompanhamento de ordens de locação</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      <DataTable<Pedido>
        title={`${filtered.length} pedidos`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por cliente, id ou endereço..."
        activeFiltersCount={(dateFilter ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
        onClearFilters={() => { setDateFilter(""); setStatusFilter("all"); }}
        filters={
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Filtros avançados</h4>
              <p className="text-sm text-muted-foreground">Refine sua busca por data ou situação.</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-muted-foreground">Data de Abertura</p>
                <Input 
                  type="date" 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)} 
                  className="h-9" 
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-muted-foreground">Situação</p>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas situações</SelectItem>
                    <SelectItem value="aguardando">Aguardando</SelectItem>
                    <SelectItem value="aceito">Aceito</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        }
        columns={[
          {
            header: "Data Abertura",
            accessor: (p) => (
              <>
                <p className="text-sm font-medium">{p.dataAbertura}</p>
                <Badge className={`mt-2 text-[9px] uppercase font-black px-1.5 py-0.5 rounded shadow-none tracking-tighter ${statusClasses[p.status]}`}>
                  {statusLabel[p.status]}
                </Badge>
              </>
            ),
          },
          {
            header: "Locatário / Local locação",
            className: "max-w-xs",
            accessor: (p) => (
              <>
                <p className="text-xs font-bold text-primary uppercase tracking-tight mb-0.5">ID: #{p.id}</p>
                <p className="text-sm font-bold text-foreground leading-none mb-1.5">{p.locatario}</p>
                <div className="flex items-start gap-1">
                  <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-tight">{p.endereco}</p>
                </div>
              </>
            ),
          },
          {
            header: "Qtd",
            accessor: "quantidade",
            align: "center",
          },
          {
            header: "Valor Total",
            accessor: (p) => (
              <p className="text-sm font-black text-foreground">
                R$ {p.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            ),
          },
          {
            header: "Situação",
            className: "max-w-[200px]",
            accessor: (p) => (
              <>
                <p className="text-xs font-bold text-primary mb-1">Modelo {p.modelo}</p>
                <p className="text-[11px] text-muted-foreground leading-none font-medium italic">
                  {p.cacamba !== "—" ? `${p.cacamba} • ${p.situacaoCacamba}` : "Sem caçamba atribuída"}
                </p>
              </>
            ),
          },
        ]}
        renderMobileCard={(p) => (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{p.dataAbertura}</span>
              <Badge variant="outline" className={`text-[10px] uppercase font-bold border-0 ${statusClasses[p.status]} bg-opacity-10`}>
                {statusLabel[p.status]}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">Pedido nº {p.id}</p>
                <p className="text-sm font-black text-primary">R$ {p.valorTotal}</p>
              </div>
              <p className="text-sm font-medium leading-tight">{p.locatario}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{p.endereco}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground font-medium uppercase">Modelo {p.modelo}</span>
              <div className="flex gap-2">
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => navigate(`/dashboard/pedidos/${p.id}`)}>
                  <List className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => navigate(`/dashboard/pedidos/${p.id}/mapa`)}>
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        actions={(p) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => navigate(`/dashboard/pedidos/${p.id}`)} title="Ver Detalhes">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => navigate(`/dashboard/pedidos/${p.id}/mapa`)} title="Ver no Mapa">
              <MapPin className="h-4 w-4" />
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

export default PedidosList;
