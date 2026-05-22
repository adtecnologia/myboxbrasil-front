import {
  Users,
  MapPin,
  Landmark,
  Container,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Plus,
  FilePlus,
  UserPlus,
  Activity,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const ordensData = months.map((m, i) => ({
  name: m,
  value: i < 5 ? [18, 24, 15, 32, 28][i] : 0,
}));

const cacambasData = [
  { name: "Disponíveis", value: 320, color: "hsl(142, 76%, 36%)" },
  { name: "Locadas", value: 180, color: "hsl(217, 91%, 60%)" },
  { name: "Manutenção", value: 45, color: "hsl(47, 95%, 55%)" },
  { name: "Atrasadas", value: 23, color: "hsl(0, 84%, 60%)" },
];

const statCards = [
  { label: "Locadores", value: 12, icon: Users, change: "+2", up: true, color: "primary" },
  { label: "Locatários", value: 33, icon: Users, change: "+5", up: true, color: "blue" },
  { label: "Destino final", value: 2, icon: MapPin, change: "0", up: true, color: "orange" },
  { label: "Prefeituras", value: 2, icon: Landmark, change: "0", up: true, color: "purple" },
  { label: "Caçambas", value: 568, icon: Container, change: "+23", up: true, color: "emerald" },
  { label: "Ordens de locação", value: 86, icon: ShoppingCart, change: "-3", up: false, color: "rose" },
];

const quickActions = [
  { label: "Nova Ordem", icon: FilePlus, href: "#", color: "bg-primary/10 text-primary" },
  { label: "Cadastrar Cliente", icon: UserPlus, href: "#", color: "bg-blue-500/10 text-blue-600" },
  { label: "Nova Caçamba", icon: Package, href: "#", color: "bg-orange-500/10 text-orange-600" },
  { label: "Gerar Relatório", icon: Activity, href: "#", color: "bg-purple-500/10 text-purple-600" },
];

const municipios = [
  { name: "São José do Rio Preto / SP", count: 86, pct: 100 },
  { name: "Mirassol / SP", count: 24, pct: 28 },
  { name: "Bady Bassitt / SP", count: 12, pct: 14 },
  { name: "Cedral / SP", count: 8, pct: 9 },
];

const recentOrders = [
  { id: "#1234", client: "ABC Construtora", status: "Em andamento", date: "Há 10 min", amount: "R$ 450,00" },
  { id: "#1233", client: "DEF Engenharia", status: "Finalizada", date: "Há 1 hora", amount: "R$ 320,00" },
  { id: "#1232", client: "GHI Demolições", status: "Pendente", date: "Há 3 horas", amount: "R$ 1.200,00" },
  { id: "#1231", client: "JKL Reformas", status: "Em andamento", date: "Ontem", amount: "R$ 450,00" },
  { id: "#1230", client: "MNO Construtora", status: "Finalizada", date: "Ontem", amount: "R$ 890,00" },
];

const statusColor: Record<string, string> = {
  "Em andamento": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Finalizada": "bg-primary/10 text-primary border-primary/20",
  "Pendente": "bg-amber-500/10 text-amber-600 border-amber-200",
};

import { useAuthStore } from "@/stores/useAuthStore";
import LocadorDashboard from "@/pages/dashboard/LocadorDashboard";
import LocatarioDashboard from "@/pages/dashboard/LocatarioDashboard";
import DestinoFinalDashboard from "@/pages/dashboard/DestinoFinalDashboard";
import PrefeituraDashboard from "@/pages/dashboard/PrefeituraDashboard";

const Dashboard = () => {
  const role = useAuthStore((s) => s.activeProfileType());
  if (role === "locador") return <LocadorDashboard />;
  if (role === "locatario") return <LocatarioDashboard />;
  if (role === "destino") return <DestinoFinalDashboard />;
  if (role === "prefeitura") return <PrefeituraDashboard />;
  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Painel de Controle" subtitle="Visão geral do ecossistema MyBox">
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


      {/* Stat cards */}
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
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Fluxo de Locações</CardTitle>
                <CardDescription className="text-sm">Volume de ordens de serviço nos últimos meses</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                  +12% vs mês anterior
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ordensData}>
                <defs>
                  <linearGradient id="colorOrdens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" vertical={false} opacity={0.1} />
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
                  width={35} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    borderRadius: "12px", 
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#colorOrdens)" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status da Frota</CardTitle>
            <CardDescription className="text-sm">Distribuição atual das caçambas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cacambasData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 11, fontWeight: 500 }} 
                    width={85} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {cacambasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-4">
              <Separator className="opacity-50" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Principais Municípios</p>
                <div className="space-y-4">
                  {municipios.map((m) => (
                    <div key={m.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{m.name.split(' / ')[0]}</span>
                        <span className="font-bold">{m.count} <span className="text-muted-foreground font-normal">loc.</span></span>
                      </div>
                      <Progress value={m.pct} className="h-1.5 bg-muted" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Ordens Recentes</CardTitle>
                <CardDescription className="text-sm">Acompanhamento em tempo real</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold hover:bg-primary/5">
                Ver Todas <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {order.id.replace('#', '')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{order.client}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-foreground">{order.amount}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] px-2.5 py-0.5 font-medium border-0 ${statusColor[order.status] || ""}`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Resumo de Atividade</CardTitle>
            <CardDescription className="text-sm">Últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium leading-none">Novo cliente cadastrado</p>
                  <p className="text-[11px] text-muted-foreground">Há 2 minutos por Maria Silva</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium leading-none">Ordem #1234 atualizada</p>
                  <p className="text-[11px] text-muted-foreground">Há 15 minutos pelo sistema</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium leading-none">Alerta de caçamba atrasada</p>
                  <p className="text-[11px] text-muted-foreground">Há 1 hora em Mirassol/SP</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium leading-none">Pagamento confirmado</p>
                  <p className="text-[11px] text-muted-foreground">Há 3 horas - R$ 450,00</p>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t">
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <h4 className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Dica do dia</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Você sabia que otimizar as rotas pode reduzir os custos de combustível em até 15%? Confira o novo módulo de logística.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
