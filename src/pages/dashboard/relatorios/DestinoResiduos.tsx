import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/components/DataPagination";

interface DestinoResiduoData {
  id: string;
  modelo: string;
  dataColeta: string;
  transportador: string;
  locador: string;
  locatario: string;
  destinador: string;
  origem: string;
  destino: string;
  mtrStatus: string;
  cdfStatus: string;
}

const mockData: DestinoResiduoData[] = [
  {
    id: "CGCE1T82WZNG9KTL",
    modelo: "Modelo Estacionária C4",
    dataColeta: "13/11/2025",
    transportador: "Pietro Lorenzo Leonardo Ramos",
    locador: "Francisca Helena Elza Gonçalves",
    locatario: "Julia Rebeca Daiane Bernarde",
    destinador: "Henrique Bruno Leandro Bernardes",
    origem: "Rua Mirassol 216 - Vila Redentora",
    destino: "Rua Apóstolo Marcheto 837 - Loteamento Recanto do Lago",
    mtrStatus: "Emitido",
    cdfStatus: "Emitido",
  },
  {
    id: "BFGE1T82WZNG9KTL",
    modelo: "Modelo Estacionária C4",
    dataColeta: "14/11/2025",
    transportador: "Carlos Eduardo Silva",
    locador: "Francisca Helena Elza Gonçalves",
    locatario: "Julia Rebeca Daiane Bernarde",
    destinador: "Henrique Bruno Leandro Bernardes",
    origem: "Av. Brasil 500 - Centro",
    destino: "Rua Apóstolo Marcheto 837 - Loteamento Recanto do Lago",
    mtrStatus: "Emitido",
    cdfStatus: "Pendente",
  },
];

const DestinoResiduos = () => {
  const [search, setSearch] = useState("");
  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(mockData, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <div>
          <h1 className="text-2xl font-bold">Destino de Resíduos</h1>
          <p className="text-sm text-white/75">Relatório detalhado do ciclo de vida dos resíduos</p>
        </div>
        <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-0">
          <Download className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar..." 
                className="pl-9" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="date" className="pl-9" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="date" className="pl-9" />
            </div>
            <Button className="w-full">Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      <DataTable<DestinoResiduoData>
        title="Rastreabilidade de Resíduos"
        data={paginatedData}
        columns={[
          { 
            header: "Identificação", 
            accessor: (d) => (
              <div className="space-y-1">
                <p className="font-bold text-xs">{d.id}</p>
                <p className="text-xs text-muted-foreground">{d.modelo}</p>
              </div>
            )
          },
          { header: "Data Coleta", accessor: "dataColeta" },
          { 
            header: "Envolvidos", 
            accessor: (d) => (
              <div className="space-y-1 text-[10px]">
                <p><span className="font-bold">Transp:</span> {d.transportador}</p>
                <p><span className="font-bold">Locador:</span> {d.locador}</p>
                <p><span className="font-bold">Locatário:</span> {d.locatario}</p>
                <p><span className="font-bold">Destin:</span> {d.destinador}</p>
              </div>
            )
          },
          { 
            header: "Trajeto", 
            accessor: (d) => (
              <div className="space-y-1 text-[10px] max-w-[200px]">
                <p><span className="font-bold text-primary">Orig:</span> {d.origem}</p>
                <p><span className="font-bold text-destructive">Dest:</span> {d.destino}</p>
              </div>
            )
          },
          { 
            header: "MTR", 
            accessor: (d) => (
              <Badge variant={d.mtrStatus === "Emitido" ? "default" : "secondary"} className="text-[10px]">
                {d.mtrStatus}
              </Badge>
            )
          },
          { 
            header: "CDF", 
            accessor: (d) => (
              <Badge variant={d.cdfStatus === "Emitido" ? "default" : "secondary"} className="text-[10px]">
                {d.cdfStatus}
              </Badge>
            )
          },
        ]}
        pagination={{
          totalItems,
          pageSize,
          currentPage,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        actions={() => (
          <Button variant="outline" size="icon" className="h-8 w-8">
            <FileText className="h-4 w-4" />
          </Button>
        )}
      />
    </div>
  );
};

export default DestinoResiduos;
