import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMotoristaRotas } from "@/hooks/useMotoristaRotas";

const Roteiros = () => {
  const { data: rotas = [] } = useMotoristaRotas({ includeFinalizadas: true });

  const concluidas = useMemo(
    () => rotas.filter((r) => r.status === "concluida"),
    [rotas]
  );

  const inicioMes = new Date();
  inicioMes.setDate(1);
  const concluidasMes = concluidas.filter(
    (r) => r.data_programada && new Date(r.data_programada) >= inicioMes
  );

  const mediaPontos =
    concluidas.length === 0
      ? 0
      : Math.round(
          (concluidas.reduce((acc, r) => acc + r.itens.length, 0) / concluidas.length) * 10
        ) / 10;

  const roteirosData = concluidas.map((r) => ({
    id: r.id,
    data: r.data_programada
      ? new Date(r.data_programada).toLocaleDateString("pt-BR")
      : "—",
    pontos: r.itens.length,
    status: "Concluído",
    tempo: "—",
  }));

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
            <div className="text-2xl font-bold">{concluidasMes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Média de Pontos por Roteiro</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaPontos}</div>
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
