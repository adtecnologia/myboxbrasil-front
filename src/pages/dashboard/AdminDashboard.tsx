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
  Activity,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusColor: Record<string, string> = {
  pago: "bg-primary/10 text-primary border-primary/20",
  parcialmente_pago: "bg-blue-500/10 text-blue-600 border-blue-200",
  aguardando_pagamentos: "bg-amber-500/10 text-amber-600 border-amber-200",
  cancelado: "bg-rose-500/10 text-rose-600 border-rose-200",
};

const formatStatus = (s?: string | null) =>
  !s
    ? "—"
    : s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const AdminDashboard = () => {
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const rangeStart = useMemo(
    () => new Date(year, month - 1, 1).toISOString(),
    [year, month],
  );
  const rangeEnd = useMemo(
    () => new Date(year, month, 1).toISOString(),
    [year, month],
  );
  const prevStart = useMemo(
    () => new Date(year, month - 2, 1).toISOString(),
    [year, month],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard", month, year],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const yearStart = new Date(year, 0, 1).toISOString();
      const yearEnd = new Date(year + 1, 0, 1).toISOString();

      const [
        rolesRes,
        cacambaUnidadesRes,
        ordensCurrRes,
        ordensPrevRes,
        ordensYearRes,
        oluStatusRes,
        pedidosRes,
        obrasRes,
      ] = await Promise.all([
        supabase.from("user_roles").select("role, created_at").eq("ativo", true),
        supabase.from("cacamba_unidades").select("id, disponivel, manutencao, created_at"),
        supabase
          .from("ordens_locacao")
          .select("id", { count: "exact", head: true })
          .lt("created_at", rangeEnd),
        supabase
          .from("ordens_locacao")
          .select("id", { count: "exact", head: true })
          .lt("created_at", rangeStart),
        supabase
          .from("ordens_locacao")
          .select("id, created_at")
          .gte("created_at", yearStart)
          .lt("created_at", yearEnd),
        supabase.from("ordem_locacao_unidades").select("id, status, cacamba_unidade_id"),
        supabase
          .from("pedidos")
          .select("id, numero, status, valor_total, created_at, locatario_id")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase.from("obras").select("cidade, estado"),
      ]);

      const locatarioIds = Array.from(
        new Set((pedidosRes.data ?? []).map((p) => p.locatario_id).filter(Boolean)),
      ) as string[];
      const profilesRes = locatarioIds.length
        ? await supabase.from("profiles").select("id, nome").in("id", locatarioIds)
        : { data: [] as { id: string; nome: string }[] };
      const profileById = new Map(
        (profilesRes.data ?? []).map((p) => [p.id, p.nome]),
      );

      return {
        roles: rolesRes.data ?? [],
        cacambaUnidades: cacambaUnidadesRes.data ?? [],
        ordensCurr: ordensCurrRes.count ?? 0,
        ordensPrev: ordensPrevRes.count ?? 0,
        ordensYear: ordensYearRes.data ?? [],
        oluStatus: oluStatusRes.data ?? [],
        pedidos: (pedidosRes.data ?? []).map((p) => ({
          ...p,
          locatario_nome: profileById.get(p.locatario_id ?? "") ?? "Cliente",
        })),
        obras: obrasRes.data ?? [],
      };
    },
  });

  const stats = useMemo(() => {
    if (!data) return null;

    const roleCount = (r: string) =>
      data.roles.filter(
        (x) => x.role === r && (!x.created_at || x.created_at < rangeEnd),
      ).length;
    const roleNewInMonth = (r: string) =>
      data.roles.filter(
        (x) =>
          x.role === r &&
          x.created_at &&
          x.created_at >= rangeStart &&
          x.created_at < rangeEnd,
      ).length;

    const cacambasAte = data.cacambaUnidades.filter(
      (c) => !c.created_at || c.created_at < rangeEnd,
    ).length;
    const cacambasNewInMonth = data.cacambaUnidades.filter(
      (c) => c.created_at && c.created_at >= rangeStart && c.created_at < rangeEnd,
    ).length;

    const ordensDelta = data.ordensCurr - data.ordensPrev;

    return [
      {
        label: "Locadores",
        value: roleCount("locador"),
        icon: Users,
        change: roleNewInMonth("locador"),
      },
      {
        label: "Locatários",
        value: roleCount("locatario"),
        icon: Users,
        change: roleNewInMonth("locatario"),
      },
      {
        label: "Destino final",
        value: roleCount("destino"),
        icon: MapPin,
        change: roleNewInMonth("destino"),
      },
      {
        label: "Prefeituras",
        value: roleCount("prefeitura"),
        icon: Landmark,
        change: roleNewInMonth("prefeitura"),
      },
      {
        label: "Caçambas",
        value: cacambasAte,
        icon: Container,
        change: cacambasNewInMonth,
      },
      {
        label: "Ordens de locação",
        value: data.ordensCurr,
        icon: ShoppingCart,
        change: ordensDelta,
      },
    ];
  }, [data, rangeStart, rangeEnd]);

  const ordensChart = useMemo(() => {
    const counts = new Array(12).fill(0);
    (data?.ordensYear ?? []).forEach((o) => {
      if (!o.created_at) return;
      const m = new Date(o.created_at).getMonth();
      counts[m] += 1;
    });
    return months.map((name, i) => ({ name, value: counts[i] }));
  }, [data]);

  const monthDelta = useMemo(() => {
    if (!data) return 0;
    if (!data.ordensPrev) return data.ordensCurr > 0 ? 100 : 0;
    return Math.round(((data.ordensCurr - data.ordensPrev) / data.ordensPrev) * 100);
  }, [data]);

  const cacambasFleet = useMemo(() => {
    if (!data) return [];
    const oluActive = data.oluStatus.filter((o) =>
      ["locada", "em_transito_locacao", "aguardando_retirada", "em_transito_retirada"].includes(
        o.status ?? "",
      ),
    );
    const locadasIds = new Set(
      oluActive.map((o) => o.cacamba_unidade_id).filter(Boolean) as string[],
    );
    const atrasadasIds = new Set(
      data.oluStatus
        .filter((o) => o.status === "aguardando_retirada")
        .map((o) => o.cacamba_unidade_id)
        .filter(Boolean) as string[],
    );
    const manutencao = data.cacambaUnidades.filter((c) => c.manutencao).length;
    const locadas = data.cacambaUnidades.filter((c) => locadasIds.has(c.id)).length;
    const atrasadas = data.cacambaUnidades.filter((c) => atrasadasIds.has(c.id)).length;
    const disponiveis = data.cacambaUnidades.filter(
      (c) => c.disponivel && !c.manutencao && !locadasIds.has(c.id),
    ).length;
    return [
      { name: "Disponíveis", value: disponiveis, color: "hsl(142, 76%, 36%)" },
      { name: "Locadas", value: locadas, color: "hsl(217, 91%, 60%)" },
      { name: "Manutenção", value: manutencao, color: "hsl(47, 95%, 55%)" },
      { name: "Atrasadas", value: atrasadas, color: "hsl(0, 84%, 60%)" },
    ];
  }, [data]);

  const municipios = useMemo(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    data.obras.forEach((o) => {
      if (!o.cidade) return;
      const key = `${o.cidade}${o.estado ? " / " + o.estado : ""}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const arr = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
    const max = arr[0]?.count ?? 1;
    return arr.map((m) => ({ ...m, pct: (m.count / max) * 100 }));
  }, [data]);

  const recentActivity = useMemo(() => {
    if (!data) return [];
    return (data.pedidos ?? []).slice(0, 4).map((p) => ({
      id: p.id,
      title: `Pedido #${p.numero} — ${p.locatario_nome}`,
      subtitle: `${formatStatus(p.status)} · ${fmtBRL(Number(p.valor_total ?? 0))}`,
      color:
        p.status === "pago"
          ? "bg-emerald-500"
          : p.status === "cancelado"
            ? "bg-rose-500"
            : p.status === "aguardando_pagamentos"
              ? "bg-amber-500"
              : "bg-primary",
    }));
  }, [data]);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 pb-10" aria-busy="true" aria-live="polite">
        <PageHeader title="Painel de Controle" subtitle="Visão geral do ecossistema MyBox" />

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-5 w-32 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full mt-4" />
              <div className="mt-6 space-y-3">
                <Skeleton className="h-3 w-40" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-1.5 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-2 w-20" />
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-4 w-20 hidden sm:block" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-44" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="mt-1 h-2 w-2 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-2/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Painel de Controle" subtitle="Visão geral do ecossistema MyBox">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/70 mr-1" />
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[130px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[100px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => {
          const up = stat.change >= 0;
          return (
            <Card
              key={stat.label}
              className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-5 font-medium border-0 ${
                      up
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {up ? (
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                    )}
                    {up ? "+" : ""}
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Fluxo de Locações</CardTitle>
                <CardDescription className="text-sm">
                  Volume de ordens de serviço em {year}
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className={`border-0 ${
                  monthDelta >= 0
                    ? "bg-primary/10 text-primary"
                    : "bg-rose-500/10 text-rose-600"
                }`}
              >
                {monthDelta >= 0 ? "+" : ""}
                {monthDelta}% vs mês anterior
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ordensChart}>
                <defs>
                  <linearGradient id="colorOrdens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted-foreground))"
                  vertical={false}
                  opacity={0.1}
                />
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
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
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
                <BarChart data={cacambasFleet} layout="vertical">
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
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {cacambasFleet.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-4">
              <Separator className="opacity-50" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Principais Municípios
                </p>
                {municipios.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma obra cadastrada ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {municipios.map((m) => (
                      <div key={m.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">
                            {m.name.split(" / ")[0]}
                          </span>
                          <span className="font-bold">
                            {m.count}{" "}
                            <span className="text-muted-foreground font-normal">loc.</span>
                          </span>
                        </div>
                        <Progress value={m.pct} className="h-1.5 bg-muted" />
                      </div>
                    ))}
                  </div>
                )}
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
                <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
                <CardDescription className="text-sm">Acompanhamento em tempo real</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary font-semibold hover:bg-primary/5"
                asChild
              >
                <Link to="/dashboard/pedidos">
                  Ver Todas <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(data?.pedidos ?? []).length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Nenhum pedido registrado ainda.</p>
            ) : (
              <div className="divide-y divide-border">
                {(data?.pedidos ?? []).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {order.numero}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {order.locatario_nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString("pt-BR")
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-foreground">
                          {fmtBRL(Number(order.valor_total ?? 0))}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2.5 py-0.5 font-medium border-0 ${
                          statusColor[order.status ?? ""] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
            <CardDescription className="text-sm">Últimos pedidos do sistema</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground">Sem atividade recente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${item.color}`} />
                    <div className="space-y-1">
                      <p className="text-xs font-medium leading-none">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;