import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, FileCheck, FileX, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/components/DataPagination";

interface SituacaoLocador {
  id: string;
  nome: string;
  documento: string;
  docsVencidos: number;
  status: "Regular" | "Irregular" | "Aguardando Validação";
}

const mockData: SituacaoLocador[] = [
  {
    id: "1",
    nome: "Silva Transportes",
    documento: "12.345.678/0001-90",
    docsVencidos: 0,
    status: "Regular"
  },
  {
    id: "2",
    nome: "Oliveira Entulhos",
    documento: "98.765.432/0001-11",
    docsVencidos: 2,
    status: "Irregular"
  },
  {
    id: "3",
    nome: "EcoTransp",
    documento: "45.678.901/0001-22",
    docsVencidos: 0,
    status: "Aguardando Validação"
  }
];

const SituacaoLocadores = () => {
  const [search, setSearch] = useState("");
  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(mockData, 10);

  const statusColor = {
    "Regular": "bg-green-100 text-green-700",
    "Irregular": "bg-red-100 text-red-700",
    "Aguardando Validação": "bg-yellow-100 text-yellow-700"
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold italic">Situação Locadores</h1>
        <p className="text-sm text-white/75">Validação de documentos e regularidade</p>
      </div>

      <DataTable<SituacaoLocador>
        title="Locadores Cadastrados"
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "CNPJ", accessor: "documento" },
          { 
            header: "Docs Vencidos", 
            accessor: (d) => (
              <span className={d.docsVencidos > 0 ? "text-destructive font-bold" : "text-green-600"}>
                {d.docsVencidos}
              </span>
            )
          },
          { 
            header: "Situação", 
            accessor: (d) => (
              <Badge className={`${statusColor[d.status]} border-0 font-medium`}>
                {d.status}
              </Badge>
            )
          },
        ]}
        actions={(d) => (
          <Button variant="outline" size="sm" className="h-8">
            Validar Docs
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

export default SituacaoLocadores;
