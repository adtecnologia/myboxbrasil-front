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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_LABELS: Record<string, string> = {
  aguardando_aceite: "Aguardando Aceite",
  aceito: "Aceito",
  recusado: "Recusado",
  cancelado: "Cancelado",
  concluido: "Concluído",
  em_andamento: "Em Andamento",
  pendente: "Pendente",
};

const STATUS_STYLES: Record<string, string> = {
  aguardando_aceite: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  aceito: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  recusado: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  cancelado: "bg-muted text-muted-foreground",
  concluido: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  em_andamento: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  pendente: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
};

const formatStatusLabel = (s: string) =>
  STATUS_LABELS[s] ?? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const LocadorDashboard = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const navigate = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ["locador-dashboard", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: cacambas } = await supabase
        .from("cacambas")
        .select("id, modelo")
        .eq("locador_id", userId!);
      const cacambaIds = (cacambas ?? []).map((c) => c.id);
      const { data: unidades } = cacambaIds.length
        ? await supabase
            .from("cacamba_unidades")
            .select("id, cacamba_id, disponivel, manutencao")
            .in("cacamba_id", cacambaIds)
        : { data: [] as Array<{ id: string; cacamba_id: string; disponivel: boolean; manutencao: boolean }> };

      const modeloIds = Array.from(new Set((cacambas ?? []).map((c) => c.modelo).filter(Boolean) as string[]));
      const { data: modelos } = modeloIds.length
        ? await supabase.from("modelos_cacamba").select("id, modelo").in("id", modeloIds)
        : { data: [] as Array<{ id: string; modelo: string }> };

      const unidadeIds = (unidades ?? []).map((u) => u.id);
      const { data: olus } = unidadeIds.length
        ? await supabase
            .from("ordem_locacao_unidades")
            .select("cacamba_unidade_id, status")
            .in("cacamba_unidade_id", unidadeIds)
            .in("status", [
              "entrega_pendente",
              "em_transito_locacao",
              "locada",
              "aguardando_retirada",
              "em_transito_retirada",
              "em_transito_analise",
            ])
        : { data: [] as Array<{ cacamba_unidade_id: string; status: string }> };

      const { data: pfs } = await supabase
        .from("pedido_fornecedores")
        .select("id, pedido_id, valor_total, status, created_at")
        .eq("locador_id", userId!)
        .order("created_at", { ascending: false });

      const pfIds = (pfs ?? []).map((p) => p.id);
      const { data: ordens } = pfIds.length
        ? await supabase
            .from("ordens_locacao")
            .select("id, status, pedido_fornecedor_id")
            .in("pedido_fornecedor_id", pfIds)
        : { data: [] as Array<{ id: string; status: string; pedido_fornecedor_id: string }> };

      const pedidoIds = Array.from(new Set((pfs ?? []).map((p) => p.pedido_id)));
      const { data: pedidos } = pedidoIds.length
        ? await supabase.from("pedidos").select("id, locatario_id, created_at").in("id", pedidoIds)
        : { data: [] as Array<{ id: string; locatario_id: string; created_at: string }> };

      const locatarioIds = Array.from(new Set((pedidos ?? []).map((p) => p.locatario_id)));
      const { data: profs } = locatarioIds.length
        ? await supabase.from("profiles").select("id, nome").in("id", locatarioIds)
        : { data: [] as Array<{ id: string; nome: string }> };

      const { data: faturasAbertas } = await supabase
        .from("faturas")
        .select("valor_total, status")
        .eq("locador_id", userId!)
        .in("status", ["pendente", "vencida"]);

      const { data: licencas } = await supabase
        .from("licenca_cidade")
        .select("id, cidade, estado, status_prefeitura")
        .eq("user_id", userId!)
        .order("estado", { ascending: true })
        .order("cidade", { ascending: true });
      const licencaIds = (licencas ?? []).map((l) => l.id);
      const { data: licencaDocs } = licencaIds.length
        ? await supabase
            .from("documentos_licenca_cidade")
            .select("licenca_cidade_id, status")
            .in("licenca_cidade_id", licencaIds)
        : { data: [] as Array<{ licenca_cidade_id: string; status: string }> };

      return {
        cacambas: cacambas ?? [],
        unidades: unidades ?? [],
        modelos: modelos ?? [],
        olus: olus ?? [],
        pfs: pfs ?? [],
        ordens: ordens ?? [],
        pedidos: pedidos ?? [],
        profs: profs ?? [],
        faturasAbertas: faturasAbertas ?? [],
        licencas: licencas ?? [],
        licencaDocs: licencaDocs ?? [],
      };
    },
  });

  const stats = useMemo(() => {
    const unidades = data?.unidades ?? [];
    const olus = data?.olus ?? [];
    const total = unidades.length;
    const manutencao = unidades.filter((u) => u.manutencao).length;
    const emProcessoIds = new Set(olus.map((o) => o.cacamba_unidade_id));
    const disponiveis = unidades.filter(
      (u) => u.disponivel && !u.manutencao && !emProcessoIds.has(u.id),
    ).length;
    const countStatus = (arr: string[]) =>
      olus.filter((o) => arr.includes(o.status)).length;
    return [
      { label: "Total Caçambas", value: total, icon: ShoppingCart, href: "/dashboard/ativos/cacambas" },
      { label: "Disponíveis", value: disponiveis, icon: PackageSearch, href: "/dashboard/ativos/cacambas" },
      { label: "Entregas Pendentes", value: countStatus(["entrega_pendente", "em_transito_locacao"]), icon: PackageOpen, href: "/dashboard/pedidos/ordens?tab=entregas" },
      { label: "Locadas", value: countStatus(["locada"]), icon: PackageCheck, href: "/dashboard/pedidos/ordens?tab=locadas" },
      { label: "Aguardando Retirada", value: countStatus(["aguardando_retirada", "em_transito_retirada"]), icon: MapPin, href: "/dashboard/pedidos/ordens?tab=locadas" },
      { label: "Limpeza e Manutenção", value: manutencao, icon: Wrench, href: "/dashboard/ativos/manutencoes" },
    ];
  }, [data]);

  const faturasEmAberto = useMemo(
    () => (data?.faturasAbertas ?? []).reduce((acc, f) => acc + Number(f.valor_total ?? 0), 0),
    [data],
  );

  const receitaMes = useMemo(() => {
    const pfs = data?.pfs ?? [];
    return pfs
      .filter((p) => {
        const d = new Date(p.created_at);
        return d.getMonth() === month - 1 && d.getFullYear() === year;
      })
      .reduce((acc, p) => acc + Number(p.valor_total ?? 0), 0);
  }, [data, month, year]);

  const novosClientes = useMemo(() => {
    const pedidos = data?.pedidos ?? [];
    const ids = new Set(
      pedidos
        .filter((p) => {
          const d = new Date(p.created_at);
          return d.getMonth() === month - 1 && d.getFullYear() === year;
        })
        .map((p) => p.locatario_id)
    );
    return ids.size;
  }, [data, month, year]);

  const faturamentoSemana = useMemo(() => {
    const pfs = data?.pfs ?? [];
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return { date: d, dia: DIAS_SEMANA[d.getDay()], valor: 0 };
    });
    pfs.forEach((p) => {
      const d = new Date(p.created_at);
      const idx = buckets.findIndex(
        (b) =>
          b.date.getFullYear() === d.getFullYear() &&
          b.date.getMonth() === d.getMonth() &&
          b.date.getDate() === d.getDate()
      );
      if (idx >= 0) buckets[idx].valor += Number(p.valor_total ?? 0);
    });
    return buckets.map(({ dia, valor }) => ({ dia, valor }));
  }, [data]);

  const ultimosPedidos = useMemo(() => {
    const pfs = data?.pfs ?? [];
    const pedidoToUser = new Map((data?.pedidos ?? []).map((p) => [p.id, p.locatario_id]));
    const userToName = new Map((data?.profs ?? []).map((p) => [p.id, p.nome]));
    return pfs.slice(0, 3).map((p) => ({
      id: `PF-${String(p.id).slice(0, 8).toUpperCase()}`,
      pedidoId: p.pedido_id as string,
      cliente: userToName.get(pedidoToUser.get(p.pedido_id) ?? "") ?? "—",
      status: p.status,
      valor: Number(p.valor_total ?? 0),
      data: new Date(p.created_at).toLocaleString("pt-BR"),
    }));
  }, [data]);

  const disponibilidadeModelo = useMemo(() => {
    const cacambas = data?.cacambas ?? [];
    const unidades = data?.unidades ?? [];
    const modeloNomes = new Map((data?.modelos ?? []).map((m) => [m.id, m.modelo]));
    const olus = data?.olus ?? [];
    const emProcessoIds = new Set(olus.map((o) => o.cacamba_unidade_id));
    const byCacamba = new Map<string, { total: number; disp: number; modelo: string }>();
    cacambas.forEach((c) =>
      byCacamba.set(c.id, { total: 0, disp: 0, modelo: modeloNomes.get(c.modelo) ?? "Sem modelo" }),
    );
    unidades.forEach((u) => {
      const entry = byCacamba.get(u.cacamba_id);
      if (!entry) return;
      entry.total += 1;
      if (u.disponivel && !u.manutencao && !emProcessoIds.has(u.id)) entry.disp += 1;
    });
    const byModelo = new Map<string, { total: number; disp: number }>();
    byCacamba.forEach(({ modelo, total, disp }) => {
      const cur = byModelo.get(modelo) ?? { total: 0, disp: 0 };
      cur.total += total;
      cur.disp += disp;
      byModelo.set(modelo, cur);
    });
    return Array.from(byModelo.entries()).map(([modelo, v]) => ({ modelo, ...v }));
  }, [data]);

  const licencasCidades = useMemo(() => {
    const licencas = data?.licencas ?? [];
    const docs = data?.licencaDocs ?? [];
    const byLic = new Map<string, string[]>();
    docs.forEach((d) => {
      const arr = byLic.get(d.licenca_cidade_id) ?? [];
      arr.push(d.status);
      byLic.set(d.licenca_cidade_id, arr);
    });
    return licencas.map((l) => {
      const statuses = byLic.get(l.id) ?? [];
      const sp = (l as { status_prefeitura?: string | null }).status_prefeitura;
      const status = sp === "validado"
        ? { label: "Aprovada", cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400" }
        : sp === "rejeitado"
        ? { label: "Não aprovada", cls: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400" }
        : statuses.length === 0
        ? { label: "Sem documentos", cls: "bg-muted text-muted-foreground border-border" }
        : { label: "Aguardando validação", cls: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400" };
      return { id: l.id, cidade: l.cidade, estado: l.estado, docs: statuses.length, status };
    });
  }, [data]);

  if (isLoading) {
    return <DashboardSkeleton title="Painel" subtitle="Visão geral da sua operação" />;
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Painel" subtitle="Visão geral da sua operação">
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

      {/* Seção Financeira Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Receita Total (mês)</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{fmtBRL(receitaMes)}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 text-xs opacity-70">Soma de pedidos do mês atual</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturas em Aberto</p>
                <h3 className="text-2xl font-bold mt-1">{fmtBRL(faturasEmAberto)}</h3>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              {faturasEmAberto > 0 ? "Faturas pendentes ou vencidas" : "Sem registros"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos Clientes (mês)</p>
                <h3 className="text-2xl font-bold mt-1">{novosClientes}</h3>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 text-[11px] text-muted-foreground">Clientes únicos no mês atual</div>
          </CardContent>
        </Card>
      </div>

      {/* Stat cards - Operacional */}
      <div>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Status da Frota</h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <Link key={stat.label} to={stat.href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              <Card className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-all group cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary group-hover:text-white transition-colors">
                      <stat.icon className="h-4 w-4 text-primary group-hover:text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1 leading-tight">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico de Faturamento */}
        <Card className="border-none shadow-sm lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 flex-none">
            <div>
              <CardTitle className="text-lg">Faturamento da Semana</CardTitle>
              <CardDescription className="text-sm">Comparativo diário de receitas</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => navigate("/dashboard/financeiro/faturamento")}
            >
              Ver Detalhes
            </Button>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={280}>
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
            {ultimosPedidos.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Sem pedidos recentes</p>
            )}
            {ultimosPedidos.map((pedido) => (
              <button
                key={pedido.id}
                type="button"
                onClick={() => navigate(`/dashboard/pedidos/${pedido.pedidoId}`)}
                className="w-full text-left flex flex-col gap-2 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-medium text-muted-foreground truncate">{pedido.id}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 border-0 whitespace-nowrap ${STATUS_STYLES[pedido.status] ?? "bg-primary/10 text-primary"}`}
                  >
                    {formatStatusLabel(pedido.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold truncate">{pedido.cliente}</p>
                  <p className="text-xs font-bold text-primary whitespace-nowrap">{fmtBRL(pedido.valor)}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {pedido.data}
                </div>
              </button>
            ))}
            <Button variant="ghost" className="w-full text-xs text-primary" asChild>
              <Link to="/dashboard/pedidos">Ver todos os pedidos</Link>
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
            <p className="text-xs text-muted-foreground text-center py-6">Sem alertas no momento</p>
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
            {disponibilidadeModelo.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Sem caçambas cadastradas</p>
            )}
            {disponibilidadeModelo.map((m) => (
              <div key={m.modelo} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{m.modelo}</span>
                  <span className="font-bold">{m.disp}/{m.total}</span>
                </div>
                <Progress value={m.total ? (m.disp / m.total) * 100 : 0} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Licenças por Cidade */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Licenças por Cidade
            </CardTitle>
            <CardDescription>Situação das cidades onde você atua</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-primary" asChild>
            <Link to="/dashboard/configuracoes">Gerenciar</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {licencasCidades.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              Nenhuma cidade cadastrada. Configure em Configurações.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {licencasCidades.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/20 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {c.cidade} <span className="text-muted-foreground font-normal">/ {c.estado}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {c.docs} {c.docs === 1 ? "documento" : "documentos"}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] h-5 px-1.5 whitespace-nowrap ${c.status.cls}`}>
                    {c.status.label}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocadorDashboard;