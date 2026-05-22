import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Truck, AlertTriangle, CheckCircle } from "lucide-react";

const performanceData = [
  { motorista: "João Silva", entregas: 145, retiradas: 138, atrasos: 2, ocorrencias: 0 },
  { motorista: "Pedro Santos", entregas: 132, retiradas: 128, atrasos: 5, ocorrencias: 1 },
  { motorista: "Ricardo Lima", entregas: 120, retiradas: 115, atrasos: 1, ocorrencias: 0 },
];

const PerformanceMotoristas = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Performance de Motoristas</h1>
        <p className="text-sm text-white/75">Indicadores de eficiência logística por colaborador</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Viagens</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">778</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Pontualidade</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.8%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ocorrências Ativas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Métricas Individuais"
        data={performanceData}
        columns={[
          { header: "Motorista", accessor: "motorista", className: "font-medium" },
          { header: "Total Entregas", accessor: "entregas" },
          { header: "Total Retiradas", accessor: "retiradas" },
          { header: "Atrasos", accessor: "atrasos", className: "text-red-600 font-medium" },
          { header: "Ocorrências", accessor: "ocorrencias", className: "text-amber-600 font-medium" },
        ]}
        pagination={{
          totalItems: performanceData.length,
          pageSize: 10,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default PerformanceMotoristas;