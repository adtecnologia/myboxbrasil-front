import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BadgeCheck, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/components/DataPagination";

interface SituacaoDestino {
  id: string;
  nome: string;
  documento: string;
  cidade: string;
  status: "Operacional" | "Suspenso" | "Aguardando Licença";
}

const mockData: SituacaoDestino[] = [
  {
    id: "1",
    nome: "Aterro Sanitário Central",
    documento: "11.222.333/0001-44",
    cidade: "São José do Rio Preto",
    status: "Operacional"
  },
  {
    id: "2",
    nome: "Recicladora EcoLuz",
    documento: "55.666.777/0001-88",
    cidade: "Mirassol",
    status: "Aguardando Licença"
  }
];

const SituacaoDestino = () => {
  const [search, setSearch] = useState("");
  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(mockData, 10);

  const statusColor = {
    "Operacional": "bg-green-100 text-green-700",
    "Suspenso": "bg-red-100 text-red-700",
    "Aguardando Licença": "bg-yellow-100 text-yellow-700"
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold italic">Situação Destino Final</h1>
        <p className="text-sm text-white/75">Monitoramento de destinadores e aterros</p>
      </div>

      <DataTable<SituacaoDestino>
        title="Unidades de Destino"
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "CNPJ", accessor: "documento" },
          { header: "Cidade", accessor: "cidade" },
          { 
            header: "Status", 
            accessor: (d) => (
              <Badge className={`${statusColor[d.status]} border-0 font-medium`}>
                {d.status}
              </Badge>
            )
          },
        ]}
        actions={(d) => (
          <Button variant="outline" size="sm" className="h-8">
            Ver Licenças
          </Button>
        )}
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

export default SituacaoDestino;
