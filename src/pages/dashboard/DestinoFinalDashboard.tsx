import {
  FileCheck,
  FileClock,
  Recycle,
  Truck,
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

const cdfMes = months.map((m, i) => ({
  name: m.slice(0, 3),
  value: i < 5 ? [2, 4, 3, 5, 5][i] : 0,
}));

const residuosMes = months.map((m, i) => ({
  name: m.slice(0, 3),
  value: i < 5 ? [3, 5, 4, 6, 4][i] : 0,
}));

const statCards = [
  { label: "CDF emitidos", value: 19, icon: FileCheck, change: "+3", up: true },
  { label: "CDF aguardando emissão", value: 1, icon: FileClock, change: "0", up: true },
  { label: "Resíduos tratados", value: 22, icon: Recycle, change: "+4", up: true },
  { label: "MTR a caminho", value: 0, icon: Truck, change: "0", up: true },
];

const DestinoFinalDashboard = () => {
  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Painel" subtitle="Visão geral da sua operação de destino final">
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-primary/10 p-2">
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
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">CDF emitidos por mês</CardTitle>
            <CardDescription className="text-sm">Volume de certificados emitidos no período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cdfMes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="hsl(var(--muted-foreground))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
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
            <CardTitle className="text-lg">Resíduos tratados por mês</CardTitle>
            <CardDescription className="text-sm">Volume de resíduos processados no período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={residuosMes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="hsl(var(--muted-foreground))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
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
      </div>
    </div>
  );
};

export default DestinoFinalDashboard;
