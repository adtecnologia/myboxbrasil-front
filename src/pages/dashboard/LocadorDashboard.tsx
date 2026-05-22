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
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const ultimosPedidos = [
  { id: "ORD-2024-001", cliente: "Construtora Silva", status: "Em Rota", valor: 450.00, data: "22/05/2026 14:30" },
  { id: "ORD-2024-002", cliente: "João dos Santos", status: "Pendente", valor: 380.00, data: "22/05/2026 11:15" },
  { id: "ORD-2024-003", cliente: "Reforma ABC", status: "Finalizado", valor: 520.00, data: "21/05/2026 16:45" },
];

const faturamentoSemana = [
  { dia: "Seg", valor: 1200 },
  { dia: "Ter", valor: 1800 },
  { dia: "Qua", valor: 1500 },
  { dia: "Qui", valor: 2200 },
  { dia: "Sex", valor: 2600 },
  { dia: "Sáb", valor: 900 },
  { dia: "Dom", valor: 400 },
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

      {/* Seção Financeira Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Receita Total (Maio)</p>
                <h3 className="text-3xl font-bold mt-1 text-white">R$ 12.450,00</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="flex items-center bg-white/20 px-2 py-0.5 rounded text-xs">
                <TrendingUp className="h-3 w-3 mr-1" /> +12%
              </span>
              <span className="opacity-70">em relação ao mês passado</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturas em Aberto</p>
                <h3 className="text-2xl font-bold mt-1">R$ 3.280,00</h3>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Meta de recebimento</span>
                <span className="font-medium text-foreground">75%</span>
              </div>
              <Progress value={75} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos Clientes</p>
                <h3 className="text-2xl font-bold mt-1">14</h3>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              <div className="flex -space-x-2 mr-2">
                {[1, 2, 3, 4].map((i) => (
                  <Avatar key={i} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">+3 novos hoje</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stat cards - Operacional */}
      <div>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Status da Frota</h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((stat) => (
            <Card key={stat.label} className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-all group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary group-hover:text-white transition-colors">
                    <stat.icon className="h-4 w-4 text-primary group-hover:text-white" />
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-5 font-medium border-0 ${
                      stat.up ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1 leading-tight">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico de Faturamento */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Faturamento da Semana</CardTitle>
              <CardDescription className="text-sm">Comparativo diário de receitas</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Ver Detalhes
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={faturamentoSemana}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="hsl(var(--muted-foreground))" />
                <XAxis 
                  dataKey="dia" 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={false} 
                  tickLine={false} 
                  width={40} 
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                  formatter={(value: any) => [`R$ ${value}`, "Valor"]}
                />
                <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Últimas Atividades */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
            <CardDescription className="text-sm">Últimas movimentações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ultimosPedidos.map((pedido) => (
              <div key={pedido.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium text-muted-foreground">{pedido.id}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 border-0 ${
                      pedido.status === "Em Rota" ? "bg-blue-500/10 text-blue-600" :
                      pedido.status === "Finalizado" ? "bg-emerald-500/10 text-emerald-600" :
                      "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {pedido.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{pedido.cliente}</p>
                  <p className="text-xs font-bold text-primary">R$ {pedido.valor.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {pedido.data}
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs text-primary" onClick={() => {}}>
              Ver todos os pedidos
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alertas Operacionais */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
              <Wrench className="h-4 w-4 text-rose-500 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-700">Manutenção Vencida</p>
                <p className="text-[10px] text-rose-600/80">Cacamba #422 precisa de vistoria técnica imediata.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <FileText className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-700">Documentação Pendente</p>
                <p className="text-[10px] text-amber-600/80">Alvará de funcionamento vence em 15 dias.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Frota Disponível */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Disponibilidade por Modelo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Modelo Estacionária C4 (Amarelo)</span>
                <span className="font-bold">12/15</span>
              </div>
              <Progress value={80} className="h-1.5" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Modelo Estacionária C7 (Preto)</span>
                <span className="font-bold">8/12</span>
              </div>
              <Progress value={66} className="h-1.5" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Modelo Estacionária C3 (Azul)</span>
                <span className="font-bold">2/5</span>
              </div>
              <Progress value={40} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocadorDashboard;