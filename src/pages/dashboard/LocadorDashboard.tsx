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
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const LocadorDashboard = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data } = useQuery({
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

      return {
        cacambas: cacambas ?? [],
        unidades: unidades ?? [],
        pfs: pfs ?? [],
        ordens: ordens ?? [],
        pedidos: pedidos ?? [],
        profs: profs ?? [],
      };
    },
  });

  const stats = useMemo(() => {
    const unidades = data?.unidades ?? [];
    const ordens = data?.ordens ?? [];
    const total = unidades.length;
    const manutencao = unidades.filter((u) => u.manutencao).length;
    const disponiveis = unidades.filter((u) => u.disponivel && !u.manutencao).length;
    const byStatus = (s: string) => ordens.filter((o) => o.status === s).length;
    return [
      { label: "Total Caçambas", value: total, icon: ShoppingCart },
      { label: "Disponíveis", value: disponiveis, icon: PackageSearch },
      { label: "Entregas Pendentes", value: byStatus("aguardando_entrega"), icon: PackageOpen },
      { label: "Locadas", value: byStatus("entregue"), icon: PackageCheck },
      { label: "Aguardando Retirada", value: byStatus("aguardando_retirada"), icon: MapPin },
      { label: "Limpeza e Manutenção", value: manutencao, icon: Wrench },
    ];
  }, [data]);

  const receitaMes = useMemo(() => {
    const pfs = data?.pfs ?? [];
    const now = new Date();
    return pfs
      .filter((p) => {
        const d = new Date(p.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, p) => acc + Number(p.valor_total ?? 0), 0);
  }, [data]);

  const novosClientes = useMemo(() => {
    const pedidos = data?.pedidos ?? [];
    const now = new Date();
    const ids = new Set(
      pedidos
        .filter((p) => {
          const d = new Date(p.created_at);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .map((p) => p.locatario_id)
    );
    return ids.size;
  }, [data]);

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
      cliente: userToName.get(pedidoToUser.get(p.pedido_id) ?? "") ?? "—",
      status: p.status,
      valor: Number(p.valor_total ?? 0),
      data: new Date(p.created_at).toLocaleString("pt-BR"),
    }));
  }, [data]);

  const disponibilidadeModelo = useMemo(() => {
    const cacambas = data?.cacambas ?? [];
    const unidades = data?.unidades ?? [];
    const byCacamba = new Map<string, { total: number; disp: number; modelo: string }>();
    cacambas.forEach((c) => byCacamba.set(c.id, { total: 0, disp: 0, modelo: c.modelo }));
    unidades.forEach((u) => {
      const entry = byCacamba.get(u.cacamba_id);
      if (!entry) return;
      entry.total += 1;
      if (u.disponivel && !u.manutencao) entry.disp += 1;
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
                <h3 className="text-2xl font-bold mt-1">{fmtBRL(0)}</h3>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">Sem registros</div>
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
            <Card key={stat.label} className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-all group">
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
            {ultimosPedidos.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Sem pedidos recentes</p>
            )}
            {ultimosPedidos.map((pedido) => (
              <div key={pedido.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium text-muted-foreground">{pedido.id}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-0 bg-primary/10 text-primary">
                    {pedido.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{pedido.cliente}</p>
                  <p className="text-xs font-bold text-primary">{fmtBRL(pedido.valor)}</p>
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
    </div>
  );
};

export default LocadorDashboard;