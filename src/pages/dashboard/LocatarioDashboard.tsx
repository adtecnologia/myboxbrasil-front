import {
  Container,
  Recycle,
  ShoppingCart,
  PackageOpen,
  Truck,
  ClipboardList,
  Calendar,
  PlusCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
const fmtBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const LocatarioDashboard = () => {
  const activeProfileType = useAuthStore((state) => state.activeProfileType());
  const userId = useAuthStore((s) => s.user?.id);
  const isLocatario = activeProfileType === "locatario";

  const { data } = useQuery({
    queryKey: ["locatario-dashboard", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("id, valor_total, created_at")
        .eq("locatario_id", userId!)
        .order("created_at", { ascending: false });
      const pedidoIds = (pedidos ?? []).map((p) => p.id);
      const { data: pfs } = pedidoIds.length
        ? await supabase
            .from("pedido_fornecedores")
            .select("id, pedido_id")
            .in("pedido_id", pedidoIds)
        : { data: [] as Array<{ id: string; pedido_id: string }> };
      const pfIds = (pfs ?? []).map((p) => p.id);
      const { data: ordens } = pfIds.length
        ? await supabase
            .from("ordens_locacao")
            .select("id, status, created_at, pedido_fornecedor_id, equipment_type, cacamba_id, equipamento_id")
            .in("pedido_fornecedor_id", pfIds)
            .order("created_at", { ascending: false })
        : { data: [] as Array<{ id: string; status: string; created_at: string; pedido_fornecedor_id: string; equipment_type: string; cacamba_id: string | null; equipamento_id: string | null }> };

      const cacIds = Array.from(new Set((ordens ?? []).map((o) => o.cacamba_id).filter(Boolean) as string[]));
      const eqpIds = Array.from(new Set((ordens ?? []).map((o) => o.equipamento_id).filter(Boolean) as string[]));
      const { data: cacs } = cacIds.length
        ? await supabase.from("cacambas").select("id, modelo, cores").in("id", cacIds)
        : { data: [] as Array<{ id: string; modelo: string; cores: string | null }> };
      const { data: eqps } = eqpIds.length
        ? await supabase.from("equipamentos").select("id, modelo").in("id", eqpIds)
        : { data: [] as Array<{ id: string; modelo: string }> };

      return { pedidos: pedidos ?? [], ordens: ordens ?? [], cacs: cacs ?? [], eqps: eqps ?? [] };
    },
  });

  const ordens = data?.ordens ?? [];

  const stats = useMemo(() => {
    const byStatus = (s: string) => ordens.filter((o) => o.status === s).length;
    return [
      { label: "CDF emitidos", value: 0, icon: Container },
      { label: "Resíduos tratados", value: "0m³", icon: Recycle },
      { label: "Locadas", value: byStatus("entregue"), icon: ShoppingCart },
      { label: "Entregas Pendentes", value: byStatus("aguardando_entrega"), icon: PackageOpen },
      { label: "Em Trânsito", value: byStatus("em_transito"), icon: Truck },
      { label: "Em Análise", value: byStatus("aguardando_aprovacao"), icon: ClipboardList },
    ];
  }, [ordens]);

  const ordensMes = useMemo(() => {
    const year = new Date().getFullYear();
    const counts = new Array(12).fill(0) as number[];
    ordens.forEach((o) => {
      const d = new Date(o.created_at);
      if (d.getFullYear() === year) counts[d.getMonth()] += 1;
    });
    return months.map((m, i) => ({ name: m.slice(0, 3), value: counts[i] }));
  }, [ordens]);

  const ultimosPedidos = useMemo(() => {
    const cacMap = new Map<string, { id: string; modelo: string; cores: string | null }>(
      (data?.cacs ?? []).map((c) => [c.id, c] as const)
    );
    const eqpMap = new Map<string, { id: string; modelo: string }>(
      (data?.eqps ?? []).map((e) => [e.id, e] as const)
    );
    return ordens.slice(0, 4).map((o) => {
      const label =
        o.equipment_type === "cacamba" && o.cacamba_id
          ? `Caçamba ${cacMap.get(o.cacamba_id)?.modelo ?? ""}${cacMap.get(o.cacamba_id)?.cores ? ` - ${cacMap.get(o.cacamba_id)?.cores}` : ""}`
          : o.equipamento_id
          ? `Equipamento ${eqpMap.get(o.equipamento_id)?.modelo ?? ""}`
          : "Item";
      return {
        label,
        data: new Date(o.created_at).toLocaleString("pt-BR"),
      };
    });
  }, [ordens, data]);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Painel" subtitle="Visão geral das suas locações">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isLocatario && (
            <Button asChild className="h-10 px-6 bg-white text-primary hover:bg-white/90 font-bold shadow-lg transition-all ring-4 ring-white/20">
              <Link to="/dashboard/pedidos/solicitar" className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Solicitar locação
              </Link>
            </Button>
          )}
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
        </div>
      </PageHeader>

      {/* Finance Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 rounded-full p-2 text-white">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Próxima Fatura a Vencer</p>
                <p className="text-lg font-bold text-amber-900 leading-tight">{fmtBRL(0)}</p>
                <p className="text-[11px] text-amber-700 font-medium">Sem faturas em aberto</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-amber-700 hover:text-amber-800 hover:bg-amber-500/10">
              <Link to="/dashboard/financeiro/faturas" className="flex items-center gap-1 font-bold">
                Ver fatura <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary/10 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-full p-2 text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Total em Aberto</p>
                <p className="text-lg font-bold text-foreground leading-tight">{fmtBRL(0)}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Sem faturas em aberto</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/10">
              <Link to="/dashboard/financeiro/faturas" className="flex items-center gap-1 font-bold">
                Gestão financeira <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
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
            <CardTitle className="text-lg">Ordens de locação por mês</CardTitle>
            <CardDescription className="text-sm">Volume das suas locações no período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordensMes}>
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
            <CardTitle className="text-lg">Últimos Pedidos</CardTitle>
            <CardDescription className="text-sm">Suas locações recentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ultimosPedidos.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Sem pedidos recentes</p>
            )}
            {ultimosPedidos.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-3 transition-colors hover:bg-muted/30"
              >
                <p className="text-xs font-semibold text-foreground">{p.label}</p>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-[10px] font-bold whitespace-nowrap">
                  {p.data}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocatarioDashboard;
