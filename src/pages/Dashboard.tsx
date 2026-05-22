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
  DollarSign,
  AlertCircle,
  Truck,
  ClipboardList,
  Clock,
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
import MotoristaDashboard from "@/pages/dashboard/MotoristaDashboard";


const Dashboard = () => {
  const role = useAuthStore((s) => s.activeProfileType());
  if (role === "locador") return <LocadorDashboard />;
  if (role === "locatario") return <LocatarioDashboard />;
  if (role === "destino") return <DestinoFinalDashboard />;
  if (role === "prefeitura") return <PrefeituraDashboard />;
  if (role === "motorista") return <MotoristaDashboard />;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Visão Geral do Sistema" subtitle="Painel de controle administrativo MyBox">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/20">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Sistema Online</span>
          </div>
          <Select defaultValue="2026">
            <SelectTrigger className="w-[100px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-bold h-9">
            <Plus className="h-4 w-4 mr-2" /> Novo Locador
          </Button>
        </div>
      </PageHeader>

      {/* KPIs Financeiros e Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500">
            <DollarSign size={100} />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Receita Bruta (Mês)</p>
                <h3 className="text-3xl font-black">R$ 142.580,00</h3>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px]">
                <TrendingUp className="h-3 w-3 mr-1" /> +18.4%
              </Badge>
              <span className="text-[10px] opacity-70 font-medium italic">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-500">
            <ClipboardList size={100} />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total de Locações</p>
                <h3 className="text-3xl font-black">1.284</h3>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                <TrendingUp className="h-3 w-3 mr-1" /> +5.2%
              </Badge>
              <span className="text-[10px] text-muted-foreground font-medium italic">em 30 dias</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-500">
            <Truck size={100} />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Logística Ativa</p>
                <h3 className="text-3xl font-black">42</h3>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-5 w-5 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">motoristas em rota agora</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-500">
            <Container size={100} />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Taxa de Ocupação</p>
                <h3 className="text-3xl font-black">74%</h3>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={74} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-2 font-medium">842 caçambas em campo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico Principal */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-lg">Crescimento de Mercado</CardTitle>
              <CardDescription className="text-sm">Volume transacionado por região</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase">Exportar PDF</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={ordensData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Municípios e Alertas */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Municípios Líderes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {municipios.map((m) => (
                <div key={m.name} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                      <span>{m.name.split(' / ')[0]}</span>
                      <span className="text-primary">{m.pct}%</span>
                    </div>
                    <Progress value={m.pct} className="h-1.5" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-rose-700 dark:text-rose-400 font-black">
                <AlertCircle className="h-5 w-5" />
                Alertas Críticos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-[11px] font-medium p-2 rounded bg-white/50 dark:bg-black/20 border border-rose-200/50">
                <span className="font-bold text-rose-600">Documentação:</span> 3 locadores com alvarás vencendo em 48h.
              </div>
              <div className="text-[11px] font-medium p-2 rounded bg-white/50 dark:bg-black/20 border border-rose-200/50">
                <span className="font-bold text-rose-600">Operacional:</span> 8 caçambas com tempo de locação excedido em 5 dias.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tabela de Ordens */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Ordens Críticas</CardTitle>
            <Button variant="link" size="sm" className="text-xs font-bold uppercase tracking-wider text-primary">Ver Todas</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                      {order.id.replace('#', '')}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{order.client}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider font-semibold">
                        <Clock className="h-3 w-3" /> {order.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-2 py-0 border-0 ${statusColor[order.status]}`}>
                      {order.status}
                    </Badge>
                    <span className="text-sm font-black text-foreground tabular-nums">{order.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Registro de Atividades Recentes */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Logs de Atividade</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6 space-y-6 pb-6">
              {[
                { type: 'user', msg: 'Novo locador "EcoEntulho" aprovado', time: '12:45', color: 'bg-emerald-500' },
                { type: 'order', msg: 'Alteração de status Ordem #1284', time: '11:20', color: 'bg-blue-500' },
                { type: 'system', msg: 'Backup automático concluído', time: '04:00', color: 'bg-purple-500' },
                { type: 'alert', msg: 'Falha de login detectada - IP: 187.32.1.4', time: '02:15', color: 'bg-rose-500' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 items-start relative">
                  {i !== 3 && <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-border" />}
                  <div className={`h-6 w-6 rounded-full ${log.color} flex items-center justify-center border-4 border-background shrink-0 z-10`}>
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold text-foreground">{log.msg}</p>
                      <span className="text-[10px] font-bold text-muted-foreground">{log.time}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium italic">Sistema de Monitoramento em Tempo Real</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
