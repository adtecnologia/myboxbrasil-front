import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Download, Filter, Building2, CreditCard, Search } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/components/DataPagination";
import { useState, useMemo } from "react";

const faturas = [
  { id: "1", locador: "MyBox Brasil", status: "aberta", vencimento: "15/06/2026", valor: 2450.00, itens: 12, tipo: "faturado" },
  { id: "2", locador: "Eco Caçambas", status: "fechada", vencimento: "10/05/2026", valor: 1800.00, itens: 8, tipo: "faturado" },
  { id: "3", locador: "Disk Entulho", status: "paga", vencimento: "15/04/2026", valor: 3200.00, itens: 15, tipo: "faturado" },
  { id: "4", locador: "MyBox Brasil", status: "paga", vencimento: "15/05/2026", valor: 2100.00, itens: 10, tipo: "faturado" },
  { id: "5", locador: "MyBox Brasil", status: "paga", vencimento: "19/05/2026", valor: 450.00, itens: 1, tipo: "a_vista", forma: "PIX" },
  { id: "6", locador: "Eco Caçambas", status: "paga", vencimento: "18/05/2026", valor: 550.00, itens: 1, tipo: "a_vista", forma: "Crédito" },
];

const Faturas = () => {
  const [search, setSearch] = useState("");
  
  const filteredData = useMemo(() => {
    return faturas.filter(f => 
      f.locador.toLowerCase().includes(search.toLowerCase()) ||
      f.status.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filteredData, 10);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Gestão de Faturas" subtitle="Faturas de locadores com contrato de faturamento" />

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Abertas</p>
            <p className="text-2xl font-bold mt-1">R$ 2.450,00</p>
            <p className="text-[10px] text-amber-600 mt-1 font-medium">1 fatura pendente</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">A Vencer</p>
            <p className="text-2xl font-bold mt-1 text-foreground">R$ 1.800,00</p>
            <p className="text-[10px] text-primary mt-1 font-medium">Próximo venc: 10/06</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Pago (Mês)</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">R$ 5.300,00</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-muted/50">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Locadores com Acordo</p>
            <p className="text-2xl font-bold mt-1">03</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Histórico de Faturas"
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por locador ou status..."
        columns={[
          {
            header: "Locador",
            accessor: (f) => (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="font-medium text-xs">{f.locador}</span>
              </div>
            ),
          },
          {
            header: "Status",
            accessor: (f) => (
              <div className="flex flex-col gap-1">
                <Badge 
                  variant="outline" 
                  className={`font-semibold text-[10px] w-fit ${
                    f.status === 'aberta' ? 'bg-amber-500/10 text-amber-600 border-0' : 
                    f.status === 'fechada' ? 'bg-blue-500/10 text-blue-600 border-0' : 
                    'bg-emerald-500/10 text-emerald-600 border-0'
                  }`}
                >
                  {f.status.toUpperCase()}
                </Badge>
                {f.tipo === "a_vista" && (
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    À Vista ({f.forma})
                  </span>
                )}
                {f.tipo === "faturado" && (
                  <span className="text-[10px] font-medium text-muted-foreground italic">
                    Faturamento
                  </span>
                )}
              </div>
            ),
          },
          {
            header: "Vencimento",
            accessor: (f) => <span className="text-xs text-muted-foreground">{f.vencimento}</span>,
          },
          {
            header: "Itens",
            accessor: (f) => <span className="text-xs text-muted-foreground">{f.itens} locações</span>,
          },
          {
            header: "Valor Total",
            accessor: (f) => <span className="text-xs font-bold">R$ {f.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>,
          },
        ]}
        actions={(f) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver Detalhes">
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Baixar PDF">
              <Download className="h-4 w-4" />
            </Button>
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

export default Faturas;