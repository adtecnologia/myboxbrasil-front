import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/components/DataPagination";

interface LocacaoVencida {
  id: string;
  locatario: string;
  locador: string;
  obra: string;
  dataInicio: string;
  dataVencimento: string;
  diasAtraso: number;
}

const mockData: LocacaoVencida[] = [
  {
    id: "PED-001",
    locatario: "Construtora Alpha",
    locador: "Silva Transportes",
    obra: "Residencial Solar",
    dataInicio: "10/05/2026",
    dataVencimento: "20/05/2026",
    diasAtraso: 2
  },
  {
    id: "PED-002",
    locatario: "Engenharia Beta",
    locador: "Oliveira Entulhos",
    obra: "Edifício Mar",
    dataInicio: "05/05/2026",
    dataVencimento: "15/05/2026",
    diasAtraso: 7
  }
];

const VencimentoPrazo = () => {
  const [search, setSearch] = useState("");
  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(mockData, 10);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold italic">Vencimento de Prazo</h1>
        <p className="text-sm text-white/75">Monitoramento de locações com prazo expirado</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar..." className="pl-9" />
            </div>
            <Button className="w-full">Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      <DataTable<LocacaoVencida>
        title="Locações Vencidas"
        data={paginatedData}
        columns={[
          { header: "Pedido", accessor: "id", className: "font-medium" },
          { header: "Locatário", accessor: "locatario" },
          { header: "Obra", accessor: "obra" },
          { header: "Vencimento", accessor: "dataVencimento" },
          { 
            header: "Dias em Atraso", 
            accessor: (d) => (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {d.diasAtraso} dias
              </Badge>
            )
          },
        ]}
        pagination={{
          totalItems,
          pageSize,
          currentPage,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize
        }}
      />
    </div>
  );
};

export default VencimentoPrazo;
