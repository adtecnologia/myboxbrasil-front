import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";


const residuosPorTipo = [
  { name: "Classe A", value: 420 },
  { name: "Classe B", value: 95 },
  { name: "Classe C", value: 38 },
  { name: "Classe D", value: 15 },
];

const COLORS = ["hsl(145,63%,32%)", "hsl(145,45%,50%)", "hsl(40,80%,55%)", "hsl(0,70%,55%)"];

const faturamentoMensal = [
  { mes: "Janeiro", valor: 12500 },
  { mes: "Fevereiro", valor: 18200 },
  { mes: "Março", valor: 22800 },
];

const topClientes = [
  { nome: "Construtora Alpha Ltda", entradas: 34, volume: "170 m³", faturamento: "R$ 28.900" },
  { nome: "Demolidora Beta ME", entradas: 22, volume: "88 m³", faturamento: "R$ 17.600" },
  { nome: "Empreiteira Gama SA", entradas: 18, volume: "126 m³", faturamento: "R$ 15.120" },
  { nome: "Construtora Delta", entradas: 12, volume: "60 m³", faturamento: "R$ 10.200" },
];

const Relatorios = () => {
  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Relatórios</h1>
            <p className="text-sm text-white/75">Resumo geral por período</p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="2026">
              <SelectTrigger className="w-[100px] bg-white/15 border-white/20 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Resíduos por tipo */}
          <Card>
            <CardHeader><CardTitle className="text-base">Resíduos recebidos por tipo</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={residuosPorTipo} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {residuosPorTipo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Faturamento mensal */}
          <Card>
            <CardHeader><CardTitle className="text-base">Faturamento mensal (R$)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={faturamentoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,10%,88%)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString()}`} />
                  <Bar dataKey="valor" fill="hsl(145,63%,32%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top clientes */}
        <DataTable
          title="Top clientes por volume"
          data={topClientes}
          columns={[
            { header: "Cliente", accessor: "nome", className: "font-medium" },
            { header: "Entradas", accessor: "entradas" },
            { header: "Volume", accessor: "volume" },
            { header: "Faturamento", accessor: "faturamento" },
          ]}
          pagination={{
            totalItems: topClientes.length,
            pageSize: 10,
            currentPage: 1,
            onPageChange: () => {},
            onPageSizeChange: () => {},
          }}
        />
      </div>
    </>
  );
};

export default Relatorios;
