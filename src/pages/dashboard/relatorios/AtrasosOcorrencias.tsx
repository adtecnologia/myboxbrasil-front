import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const atrasosData: {
  id: string;
  dataPlanejada: string;
  dataRealizada: string;
  descricao: string;
  rota: string;
  cacamba: string;
}[] = [];

const ocorrenciasOperacionaisData: {
  id: string;
  data: string;
  tipo: string;
  descricao: string;
  rota: string;
  cacamba: string;
  gravidade: string;
}[] = [];

const AtrasosOcorrencias = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Atrasos e Ocorrências Registradas</h1>
        <p className="text-sm text-white/75">Relatório de intercorrências durante a operação</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Atrasos</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atrasosData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Ocorrências</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ocorrenciasOperacionaisData.length}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Relatório de Atrasos (Planejado vs Realizado)"
        data={atrasosData}
        columns={[
          { header: "Planejado", accessor: "dataPlanejada" },
          { header: "Realizado", accessor: "dataRealizada" },
          { header: "Rota", accessor: "rota" },
          { header: "Caçamba", accessor: "cacamba" },
          { header: "Motivo", accessor: "descricao" },
          { 
            header: "Status", 
            accessor: () => (
              <Badge variant="destructive">
                Atrasado
              </Badge>
            )
          },
        ]}
        pagination={{
          totalItems: atrasosData.length,
          pageSize: 5,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />

      <DataTable
        title="Ocorrências Operacionais Registradas"
        data={ocorrenciasOperacionaisData}
        columns={[
          { header: "Data/Hora", accessor: "data" },
          { header: "Tipo", accessor: "tipo" },
          { header: "Rota", accessor: "rota" },
          { header: "Caçamba", accessor: "cacamba" },
          { header: "Descrição", accessor: "descricao" },
          { 
            header: "Gravidade", 
            accessor: (item) => (
              <Badge variant={item.gravidade === "Alta" ? "destructive" : item.gravidade === "Média" ? "default" : "secondary"}>
                {String(item.gravidade)}
              </Badge>
            )
          },
        ]}
        pagination={{
          totalItems: ocorrenciasOperacionaisData.length,
          pageSize: 5,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default AtrasosOcorrencias;
