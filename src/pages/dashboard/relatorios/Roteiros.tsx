import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const roteirosData = [
  { id: "1", data: "22/05/2026", pontos: 8, status: "Concluído", tempo: "06:30h" },
  { id: "2", data: "21/05/2026", pontos: 10, status: "Concluído", tempo: "07:45h" },
  { id: "3", data: "20/05/2026", pontos: 7, status: "Concluído", tempo: "05:15h" },
];

const Roteiros = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Roteiros Diários Realizados</h1>
        <p className="text-sm text-white/75">Histórico de rotas e pontos visitados</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Roteiros Concluídos (Mês)</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Média de Pontos por Roteiro</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Histórico de Roteiros"
        data={roteirosData}
        columns={[
          { header: "Data", accessor: "data" },
          { header: "Pontos de Parada", accessor: "pontos" },
          { header: "Tempo Total", accessor: "tempo" },
          { 
            header: "Status", 
            accessor: (item) => (
              <Badge variant="secondary">{String(item.status)}</Badge>
            )
          },
        ]}
        pagination={{
          totalItems: roteirosData.length,
          pageSize: 10,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default Roteiros;
