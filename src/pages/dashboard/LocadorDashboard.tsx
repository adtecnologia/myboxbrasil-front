import {
  ShoppingCart,
  PackageSearch,
  PackageOpen,
  PackageCheck,
  MapPin,
  Truck,
  Wrench,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const pedidosMes = months.map((m, i) => ({
  name: m.slice(0, 3),
  value: i < 5 ? [15, 22, 12, 28, 24][i] : 0,
}));

const statCards = [
  { label: "Total Caçambas", value: 36, icon: ShoppingCart, change: "+2", up: true },
  { label: "Disponíveis", value: 29, icon: PackageSearch, change: "0", up: true },
  { label: "Entregas Pendentes", value: 2, icon: PackageOpen, change: "+1", up: true },
  { label: "Locadas", value: 0, icon: PackageCheck, change: "0", up: true },
  { label: "Aguardando Retirada", value: 3, icon: MapPin, change: "-1", up: false },
  { label: "Limpeza e Manutenção", value: 4, icon: Wrench, change: "+1", up: true },
];

const produtosMaisPedidos = [
  { label: "Modelo Estacionária C4 - Cor: Amarelo", qtd: 17 },
  { label: "Modelo Estacionária C7 - Cor: Preto", qtd: 6 },
  { label: "Modelo Estacionária C3 - Cor: Azul", qtd: 4 },
];

const LocadorDashboard = () => {
  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Painel" subtitle="Visão geral da sua operação">
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

      {/* Banner de aviso */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 dark:text-amber-200">
          Sua conta está em processo de aprovação na prefeitura. Alguns recursos podem estar limitados.
        </p>
      </div>

      {/* Stat cards - Seguindo o padrão do admin */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`rounded-lg bg-primary/10 p-2`}>
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 h-5 font-medium border-0 ${
                    stat.up ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                  }`}
                >
                  {stat.up ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1 leading-tight">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Pedidos por mês</CardTitle>
            <CardDescription className="text-sm">Volume de solicitações no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pedidosMes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="hsl(var(--muted-foreground))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={false} 
                  tickLine={false} 
                  width={30} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Produtos mais pedidos</CardTitle>
            <CardDescription className="text-sm">Top modelos e cores mais locados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {produtosMaisPedidos.map((p) => (
              <div
                key={p.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-3 transition-colors hover:bg-muted/30"
              >
                <p className="text-xs font-semibold text-foreground">{p.label}</p>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs font-bold">
                  {p.qtd}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocadorDashboard;