import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Truck } from "lucide-react";

const quilometragemData = [
  { id: "1", veiculo: "ABC-1234", motorista: "João Silva", data: "22/05/2026", km: 120 },
  { id: "2", veiculo: "ABC-1234", motorista: "João Silva", data: "21/05/2026", km: 95 },
  { id: "3", veiculo: "ABC-1234", motorista: "João Silva", data: "20/05/2026", km: 110 },
];

const Quilometragem = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Quilometragem Percorrida</h1>
        <p className="text-sm text-white/75">Relatório de distância percorrida pelo veículo</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de KM no Mês</CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">325 KM</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">KM por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { dia: "20/05", km: 110 },
                { dia: "21/05", km: 95 },
                { dia: "22/05", km: 120 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="km" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <DataTable
        title="Histórico de Quilometragem"
        data={quilometragemData}
        columns={[
          { header: "Veículo", accessor: "veiculo" },
          { header: "Data", accessor: "data" },
          { header: "KM Percorrido", accessor: (item) => `${item.km} KM` },
        ]}
        pagination={{
          totalItems: quilometragemData.length,
          pageSize: 10,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default Quilometragem;
