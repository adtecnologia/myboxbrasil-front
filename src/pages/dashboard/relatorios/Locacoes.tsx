import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

const locacoesData = [
  { id: "1", cliente: "Construtora Alpha", data: "20/05/2026", status: "Em andamento", obra: "Residencial Solar", bairro: "Centro" },
  { id: "2", cliente: "Demolidora Beta", data: "19/05/2026", status: "Concluída", obra: "Edifício Mar", bairro: "Boa Viagem" },
  { id: "3", cliente: "Engenharia Gama", data: "18/05/2026", status: "Atrasada", obra: "Shopping Center", bairro: "Pina" },
];

const statusData = [
  { name: "Em andamento", value: 45, color: "#3b82f6" },
  { name: "Concluídas", value: 30, color: "#10b981" },
  { name: "Atrasadas", value: 12, color: "#ef4444" },
];

const Locacoes = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Relatório de Locações</h1>
        <p className="text-sm text-white/75">Visão geral de todas as locações do sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Volume Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { mes: "Mar", total: 65 },
                  { mes: "Abr", total: 78 },
                  { mes: "Mai", total: 87 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Listagem Detalhada"
        data={locacoesData}
        columns={[
          { header: "Cliente", accessor: "cliente" },
          { header: "Obra", accessor: "obra" },
          { header: "Bairro", accessor: "bairro" },
          { header: "Data", accessor: "data" },
          { 
            header: "Status", 
            accessor: (item) => (
              <Badge variant={
                item.status === "Concluída" ? "secondary" : 
                item.status === "Atrasada" ? "destructive" : 
                "default"
              }>
                {String(item.status)}
              </Badge>
            )
          },
        ]}
        pagination={{
          totalItems: locacoesData.length,
          pageSize: 10,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default Locacoes;