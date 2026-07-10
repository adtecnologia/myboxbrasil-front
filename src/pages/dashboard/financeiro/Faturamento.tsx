import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from "recharts";
import { TrendingUp, DollarSign, Users, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Faturamento = () => {
  const locadorId = useAuthStore((s) => s.user?.id);

  const { data, isLoading } = useQuery({
    queryKey: ["faturamento-locador", locadorId],
    enabled: !!locadorId,
    queryFn: async () => {
      const { data: faturas, error } = await supabase
        .from("faturas")
        .select("valor_total, status, paga_em, created_at, pedido_id, locatario_id, forma_pagamento")
        .eq("locador_id", locadorId!);
      if (error) throw error;
      return faturas ?? [];
    },
  });

  const { dataFaturamento, dataPagamento, kpis } = useMemo(() => {
    const faturas = (data ?? []) as any[];
    const pagas = faturas.filter((f) => f.status === "paga");

    // últimos 5 meses
    const now = new Date();
    const buckets: { key: string; name: string; valor: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: MESES[d.getMonth()],
        valor: 0,
      });
    }
    for (const f of pagas) {
      const ref = f.paga_em ? new Date(f.paga_em) : new Date(f.created_at);
      const key = `${ref.getFullYear()}-${ref.getMonth()}`;
      const b = buckets.find((x) => x.key === key);
      if (b) b.valor += Number(f.valor_total ?? 0);
    }

    const total = pagas.reduce((s, f) => s + Number(f.valor_total ?? 0), 0);
    const mediaMensal = buckets.length ? total / buckets.length : 0;
    const totalPedidos = new Set(faturas.map((f) => f.pedido_id).filter(Boolean)).size;
    const clientesAtivos = new Set(faturas.map((f) => f.locatario_id).filter(Boolean)).size;

    const grupos = { avista: 0, aprazo: 0 };
    for (const f of faturas) {
      const fp = String(f.forma_pagamento ?? "").toLowerCase();
      if (["pix", "cartao", "cartao_credito", "credito", "credit_card", "dinheiro"].includes(fp)) {
        grupos.avista += 1;
      } else {
        grupos.aprazo += 1;
      }
    }
    const totalPag = grupos.avista + grupos.aprazo || 1;
    const dataPagamento = [
      { name: "A Vista", value: Math.round((grupos.avista / totalPag) * 100), color: "hsl(var(--primary))" },
      { name: "A Prazo (Boleto)", value: Math.round((grupos.aprazo / totalPag) * 100), color: "hsl(280 70% 55%)" },
    ];

    return {
      dataFaturamento: buckets.map(({ name, valor }) => ({ name, valor })),
      dataPagamento,
      kpis: { total, mediaMensal, totalPedidos, clientesAtivos },
    };
  }, [data]);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Faturamento" subtitle="Dashboard de desempenho financeiro do locador" />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Faturamento Total", value: brl(kpis.total), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Média Mensal", value: brl(kpis.mediaMensal), icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Total Pedidos", value: String(kpis.totalPedidos), icon: Package, color: "text-purple-600", bg: "bg-purple-500/10" },
          { label: "Clientes Ativos", value: String(kpis.clientesAtivos), icon: Users, color: "text-amber-600", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`${stat.bg} ${stat.color} rounded-lg p-2`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                {isLoading ? (
                  <Skeleton className="h-5 w-24 mt-1" />
                ) : (
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Evolução do Faturamento</CardTitle>
            <CardDescription className="text-xs">Faturamento bruto nos últimos 5 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataFaturamento}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Tipo de Pagamento</CardTitle>
            <CardDescription className="text-xs">Distribuição por forma de recebimento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dataPagamento}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataPagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Faturamento;