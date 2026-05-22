import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Trophy, TrendingUp, Users } from "lucide-react";

const rankingData = [
  { cliente: "Construtora Alpha", faturamento: "R$ 45.000", total: 57, emAndamento: 5, concluidas: 52 },
  { cliente: "Demolidora Beta", faturamento: "R$ 32.500", total: 40, emAndamento: 3, concluidas: 37 },
  { cliente: "Engenharia Gama", faturamento: "R$ 28.900", total: 35, emAndamento: 2, concluidas: 33 },
];

const RankingClientes = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Ranking de Clientes</h1>
        <p className="text-sm text-white/75">Os clientes que mais geram valor para o seu negócio</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Top Faturamento</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-950">Construtora Alpha</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Crescimento Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Ranking Detalhado"
        data={rankingData}
        columns={[
          { header: "Cliente", accessor: "cliente", className: "font-medium" },
          { header: "Total Faturado", accessor: "faturamento" },
          { header: "Total Locações", accessor: "total" },
          { header: "Em Andamento", accessor: "emAndamento" },
          { header: "Concluídas", accessor: "concluidas" },
        ]}
        pagination={{
          totalItems: rankingData.length,
          pageSize: 10,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default RankingClientes;