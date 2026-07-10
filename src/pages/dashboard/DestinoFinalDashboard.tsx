import {
  FileCheck,
  FileClock,
  Recycle,
  Truck,
  Calendar,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
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

const DestinoFinalDashboard = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ["destino-final-dashboard", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: olus } = await supabase
        .from("ordem_locacao_unidades")
        .select("id, status, destino_final_confirmado_em, updated_at")
        .eq("destino_final_id", userId!);

      const oluIds = (olus ?? []).map((o) => o.id);
      const { data: residuos } = oluIds.length
        ? await supabase
            .from("ordem_locacao_unidade_residuos")
            .select("ordem_locacao_unidade_id, peso_kg, volume_m3")
            .in("ordem_locacao_unidade_id", oluIds)
        : { data: [] as Array<{ ordem_locacao_unidade_id: string; peso_kg: number | null; volume_m3: number | null }> };

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
        olus: olus ?? [],
        residuos: residuos ?? [],
        licencas: licencas ?? [],
        licencaDocs: licencaDocs ?? [],
      };
    },
  });

  const inSelectedMonth = (iso: string | null | undefined) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getMonth() === month - 1 && d.getFullYear() === year;
  };

  const stats = useMemo(() => {
    const olus = data?.olus ?? [];
    const residuos = data?.residuos ?? [];
    const emitidasNoMes = olus.filter(
      (o) => o.status === "cdf_emitido" && inSelectedMonth(o.destino_final_confirmado_em ?? o.updated_at),
    );
    const emitidasIds = new Set(emitidasNoMes.map((o) => o.id));
    const cdfEmitidos = emitidasNoMes.length;
    const cdfAguardando = olus.filter((o) => o.status === "aguardando_analise").length;
    const mtrACaminho = olus.filter((o) => o.status === "em_transito_analise").length;
    const residuosTratados = residuos
      .filter((r) => emitidasIds.has(r.ordem_locacao_unidade_id))
      .reduce((acc, r) => acc + Number(r.peso_kg ?? 0), 0);
    return [
      { label: "CDF emitidos", value: cdfEmitidos, icon: FileCheck },
      { label: "CDF aguardando emissão", value: cdfAguardando, icon: FileClock },
      { label: "Resíduos tratados (kg)", value: Math.round(residuosTratados), icon: Recycle },
      { label: "MTR a caminho", value: mtrACaminho, icon: Truck },
    ];
  }, [data, month, year]);

  const cdfMes = useMemo(() => {
    const olus = data?.olus ?? [];
    const buckets = months.map((m) => ({ name: m.slice(0, 3), value: 0 }));
    olus.forEach((o) => {
      if (o.status !== "cdf_emitido") return;
      const iso = o.destino_final_confirmado_em ?? o.updated_at;
      if (!iso) return;
      const d = new Date(iso);
      if (d.getFullYear() !== year) return;
      buckets[d.getMonth()].value += 1;
    });
    return buckets;
  }, [data, year]);

  const residuosMes = useMemo(() => {
    const olus = data?.olus ?? [];
    const residuos = data?.residuos ?? [];
    const oluMonth = new Map<string, number>();
    olus.forEach((o) => {
      if (o.status !== "cdf_emitido") return;
      const iso = o.destino_final_confirmado_em ?? o.updated_at;
      if (!iso) return;
      const d = new Date(iso);
      if (d.getFullYear() !== year) return;
      oluMonth.set(o.id, d.getMonth());
    });
    const buckets = months.map((m) => ({ name: m.slice(0, 3), value: 0 }));
    residuos.forEach((r) => {
      const m = oluMonth.get(r.ordem_locacao_unidade_id);
      if (m === undefined) return;
      buckets[m].value += Number(r.peso_kg ?? 0);
    });
    return buckets.map((b) => ({ ...b, value: Math.round(b.value) }));
  }, [data, year]);

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
    return <DashboardSkeleton title="Painel" subtitle="Visão geral da sua operação de destino final" />;
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Painel" subtitle="Visão geral da sua operação de destino final">
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-lg">Resíduos tratados por mês (kg)</CardTitle>
            <CardDescription className="text-sm">Peso total de resíduos processados no período</CardDescription>
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

export default DestinoFinalDashboard;
