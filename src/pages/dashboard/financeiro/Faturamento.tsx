import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie, Legend
} from "recharts";
import { TrendingUp, DollarSign, Users, Package } from "lucide-react";

const Faturamento = () => {
  const dataFaturamento = [
    { name: "Jan", valor: 12500 },
    { name: "Fev", valor: 15800 },
    { name: "Mar", valor: 14200 },
    { name: "Abr", valor: 19500 },
    { name: "Mai", valor: 22450 },
  ];

  const dataPagamento = [
    { name: "A Vista", value: 65, color: "#3b82f6" },
    { name: "A Prazo (Boleto)", value: 35, color: "#a855f7" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Faturamento" subtitle="Dashboard de desempenho financeiro do locador" />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Faturamento Total", value: "R$ 84.450", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Média Mensal", value: "R$ 16.890", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Total Pedidos", value: "184", icon: Package, color: "text-purple-600", bg: "bg-purple-500/10" },
          { label: "Clientes Ativos", value: "42", icon: Users, color: "text-amber-600", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`${stat.bg} ${stat.color} rounded-lg p-2`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Evolução do Faturamento</CardTitle>
            <CardDescription className="text-xs">Faturamento bruto nos últimos 5 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataFaturamento}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Tipo de Pagamento</CardTitle>
            <CardDescription className="text-xs">Distribuição por forma de recebimento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dataPagamento}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataPagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Faturamento;