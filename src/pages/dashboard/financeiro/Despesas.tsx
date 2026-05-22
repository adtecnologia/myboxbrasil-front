import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingDown, ArrowDownCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

const dataMensal = [
  { name: "Jan", faturado: 3500, vista: 1000 },
  { name: "Fev", faturado: 4200, vista: 1000 },
  { name: "Mar", faturado: 3800, vista: 1000 },
  { name: "Abr", faturado: 5100, vista: 1000 },
  { name: "Mai", faturado: 4400, vista: 1500 },
  { name: "Jun", faturado: 5200, vista: 2000 },
];

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const dataTipoPagamento = [
  { name: "Boleto (Faturado)", value: 26200, color: "hsl(var(--primary))" },
  { name: "À Vista (PIX/Cartão)", value: 7500, color: "#f59e0b" },
];

const categorias = [
  { name: "Locações", valor: 12400, color: "hsl(var(--primary))" },
  { name: "Taxas de Destino", valor: 8200, color: "#f59e0b" },
  { name: "Licenciamento", valor: 2200, color: "#6366f1" },
  { name: "Outros", valor: 900, color: "#94a3b8" },
];

const Despesas = () => {
  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Relatório de Despesas" subtitle="Acompanhe seus gastos com locações e serviços">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/70 mr-1" />
          <Select defaultValue="5">
            <SelectTrigger className="w-[130px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="2026">
            <SelectTrigger className="w-[100px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <ArrowDownCircle className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">-12% vs mês ant.</span>
            </div>
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Total do Mês (Maio)</p>
            <p className="text-3xl font-bold mt-1">R$ 5.900,00</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Média Mensal</p>
            <p className="text-3xl font-bold mt-1 text-foreground">R$ 5.616,66</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total no Ano</p>
            <p className="text-3xl font-bold mt-1 text-foreground">R$ 33.700,00</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Evolução de Gastos (Acordo vs À Vista)</CardTitle>
            <CardDescription>Comparativo mensal de modalidades de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataMensal}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} width={40} tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="faturado" name="Boleto (Faturado)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="vista" name="À Vista" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Acordo</CardTitle>
            <CardDescription>Total acumulado por tipo de negociação</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataTipoPagamento}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataTipoPagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Total']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Despesas;