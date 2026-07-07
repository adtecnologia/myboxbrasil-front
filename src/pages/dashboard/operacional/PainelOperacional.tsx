import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Truck, 
  Package, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  BarChart as BarChartIcon,
  ClipboardList,
  Plus,
  AlertOctagon
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

const dataProducao = [
  { name: "Seg", entregas: 45, coletas: 38 },
  { name: "Ter", entregas: 52, coletas: 42 },
  { name: "Qua", entregas: 38, coletas: 35 },
  { name: "Qui", entregas: 65, coletas: 58 },
  { name: "Sex", entregas: 80, coletas: 72 },
  { name: "Sab", entregas: 25, coletas: 20 },
];

const dataEficiencia = [
  { time: "08:00", valor: 95 },
  { time: "10:00", valor: 88 },
  { time: "12:00", valor: 70 },
  { time: "14:00", valor: 92 },
  { time: "16:00", valor: 85 },
  { time: "18:00", valor: 78 },
];

const PainelOperacional = () => {
  const profileType = useAuthStore((state) => state.activeProfileType());
  const isLocador = profileType === "locador";
  const isLocatario = profileType === "locatario";

  // ============ LOCATÁRIO VIEW ============
  if (isLocatario) {
    return <LocatarioView />;
  }

  if (isLocador) {
    return <LocadorView />;
  }

  // ============ DEFAULT VIEW (admin / locador / destino) ============
  return <DefaultView isLocador={isLocador} />;
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Status onde a caçamba já está fisicamente no cliente
const EM_LOCACAO_ST = ["locada"];
const AGUARDANDO_RETIRADA_ST = ["aguardando_retirada"];
// Em trânsito (não estão em campo, mas em movimentação)
const EM_TRANSITO_ST = ["em_transito_locacao", "em_transito_retirada"];
const PENDENTE_ENTREGA_ST = ["entrega_pendente"];
const CONCLUIDO_ST = ["em_transito_destino_final", "aguardando_analise", "cdf_emitido"];

const LocadorView = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data } = useQuery({
    queryKey: ["painel-operacional-locador", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ data: pfs }, { data: veiculos }, { data: rotasAtivas }, { data: ocorrAtivos }, { data: ocorrFrota }] =
        await Promise.all([
          supabase.from("pedido_fornecedores").select("id").eq("locador_id", userId!),
          supabase.from("veiculos").select("id, ativo, placa").eq("locador_id", userId!),
          supabase
            .from("rotas")
            .select("veiculo_id")
            .eq("locador_id", userId!)
            .eq("status", "em_andamento"),
          supabase
            .from("ocorrencias_ativos")
            .select("id, status, gravidade, descricao, created_at")
            .eq("locador_id", userId!),
          supabase
            .from("ocorrencias_frota")
            .select("id, status, gravidade, descricao, created_at")
            .eq("locador_id", userId!),
        ]);
      const pfIds = (pfs ?? []).map((p) => p.id);
      const { data: ordens } = pfIds.length
        ? await supabase
            .from("ordens_locacao")
            .select("id, created_at")
            .in("pedido_fornecedor_id", pfIds)
        : { data: [] as Array<{ id: string; created_at: string }> };
      const olIds = (ordens ?? []).map((o) => o.id);
      const { data: unidades } = olIds.length
        ? await supabase
            .from("ordem_locacao_unidades")
            .select("id, status, created_at, updated_at")
            .in("ordem_locacao_id", olIds)
        : { data: [] as Array<{ id: string; status: string; created_at: string; updated_at: string }> };
      return {
        veiculos: veiculos ?? [],
        veiculosEmRota: new Set(
          (rotasAtivas ?? [])
            .map((r: { veiculo_id: string | null }) => r.veiculo_id)
            .filter((v): v is string => !!v),
        ),
        unidades: unidades ?? [],
        ocorrencias: [...(ocorrAtivos ?? []), ...(ocorrFrota ?? [])],
      };
    },
  });

  const veiculos = data?.veiculos ?? [];
  const veiculosEmRota = data?.veiculosEmRota ?? new Set<string>();
  const unidades = data?.unidades ?? [];
  const ocorrencias = data?.ocorrencias ?? [];

  const stats = useMemo(() => {
    const veiculosAtivos = veiculos.filter((v) => veiculosEmRota.has(v.id)).length;
    const veiculosTotal = veiculos.length;
    const emCampo = unidades.filter((u) =>
      [...EM_LOCACAO_ST, ...AGUARDANDO_RETIRADA_ST].includes(u.status),
    ).length;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const concluidoHoje = unidades.filter(
      (u) => CONCLUIDO_ST.includes(u.status) && new Date(u.updated_at ?? u.created_at) >= hoje,
    ).length;
    const ocorrenciasAbertas = ocorrencias.filter((o) => o.status !== "resolvida" && o.status !== "encerrada").length;
    const ocorrenciasCriticas = ocorrencias.filter(
      (o) => o.gravidade === "critica" && o.status !== "resolvida" && o.status !== "encerrada",
    ).length;
    return { veiculosAtivos, veiculosTotal, emCampo, concluidoHoje, ocorrenciasAbertas, ocorrenciasCriticas };
  }, [veiculos, veiculosEmRota, unidades, ocorrencias]);

  const dataProducaoLocador = useMemo(() => {
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const buckets = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return { name: dias[d.getDay()], ts: d.getTime(), entregas: 0, coletas: 0 };
    });
    const findBucket = (ts: number) => {
      const day = new Date(ts);
      day.setHours(0, 0, 0, 0);
      return buckets.find((b) => b.ts === day.getTime());
    };
    unidades.forEach((u) => {
      const b = findBucket(new Date(u.created_at).getTime());
      if (b && EM_LOCACAO_ST.includes(u.status)) b.entregas += 1;
      if (u.updated_at) {
        const b2 = findBucket(new Date(u.updated_at).getTime());
        if (b2 && CONCLUIDO_ST.includes(u.status)) b2.coletas += 1;
      }
    });
    return buckets.map(({ name, entregas, coletas }) => ({ name, entregas, coletas }));
  }, [unidades]);

  const statusCacambas = useMemo(() => {
    const emLoc = unidades.filter((u) => EM_LOCACAO_ST.includes(u.status)).length;
    const aguRet = unidades.filter((u) => AGUARDANDO_RETIRADA_ST.includes(u.status)).length;
    const total = Math.max(unidades.length, 1);
    return [
      { label: "Em Locação", value: emLoc, color: "bg-blue-500", total },
      { label: "Aguardando Retirada", value: aguRet, color: "bg-orange-500", total },
      { label: "Concluídas", value: unidades.filter((u) => CONCLUIDO_ST.includes(u.status)).length, color: "bg-emerald-500", total },
    ];
  }, [unidades]);

  const alertas = useMemo(
    () =>
      ocorrencias
        .filter((o) => o.status !== "resolvida" && o.status !== "encerrada")
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4)
        .map((o) => ({
          text: o.descricao ?? "Ocorrência sem descrição",
          type: o.gravidade === "critica" ? "critical" : "warning",
        })),
    [ocorrencias],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel Operacional"
        subtitle="Monitoramento em tempo real da produtividade e campo"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Veículos Ativos</p>
              <h3 className="text-3xl font-bold">{stats.veiculosAtivos}/{stats.veiculosTotal}</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Em rota / total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Caçambas em Campo</p>
              <h3 className="text-3xl font-bold">{stats.emCampo}</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Locadas + Aguardando Retirada</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Concluído Hoje</p>
              <h3 className="text-3xl font-bold">{stats.concluidoHoje}</h3>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">Unidades finalizadas hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ocorrências</p>
              <h3 className="text-3xl font-bold text-red-600">{String(stats.ocorrenciasAbertas).padStart(2, "0")}</h3>
            </div>
            <p className="text-[10px] text-red-500 font-medium">
              {stats.ocorrenciasCriticas > 0 ? `${stats.ocorrenciasCriticas} crítica(s)` : "Nenhuma crítica"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Volume de Operações</CardTitle>
                <CardDescription>Entregas e Coletas — últimos 7 dias</CardDescription>
              </div>
              <BarChartIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataProducaoLocador}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="entregas" name="Entregas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="coletas" name="Coletas" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Status de Caçambas</CardTitle>
            <CardDescription>Distribuição atual das unidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusCacambas.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{item.label}</span>
                    <span>{item.value} unidades</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.color} h-2 transition-all duration-500`}
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {unidades.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Sem unidades registradas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Alertas Recentes</CardTitle>
            <CardDescription>Ocorrências abertas em ativos e frota</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertas.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Sem alertas no momento</p>
              )}
              {alertas.map((a, i) => (
                <div key={i} className="flex gap-2 items-start p-2 rounded-lg bg-muted/30">
                  <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${a.type === "critical" ? "bg-red-500" : "bg-orange-500"}`} />
                  <span className="text-xs text-muted-foreground leading-tight">{a.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-3">
            <Button className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/pedidos">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ClipboardList className="h-5 w-5" />
                </div>
                Gestão de Pedidos
              </Link>
            </Button>
            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/pedidos/ordens">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                Ordens de Locação
              </Link>
            </Button>
            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/pedidos/ocorrencias">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                Ocorrências
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LocatarioView = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data } = useQuery({
    queryKey: ["painel-operacional-locatario", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("id")
        .eq("locatario_id", userId!);
      const pedidoIds = (pedidos ?? []).map((p) => p.id);
      const { data: pfs } = pedidoIds.length
        ? await supabase.from("pedido_fornecedores").select("id, pedido_id").in("pedido_id", pedidoIds)
        : { data: [] as Array<{ id: string; pedido_id: string }> };
      const pfIds = (pfs ?? []).map((p) => p.id);
      const { data: ordens } = pfIds.length
        ? await supabase
            .from("ordens_locacao")
            .select("id, status, created_at, obra_id, quantidade")
            .in("pedido_fornecedor_id", pfIds)
        : { data: [] as Array<{ id: string; status: string; created_at: string; obra_id: string | null; quantidade: number }> };
      const olIds = (ordens ?? []).map((o) => o.id);
      const { data: unidades } = olIds.length
        ? await supabase
            .from("ordem_locacao_unidades")
            .select("id, status, ordem_locacao_id")
            .in("ordem_locacao_id", olIds)
        : { data: [] as Array<{ id: string; status: string; ordem_locacao_id: string }> };
      const obraIds = Array.from(new Set((ordens ?? []).map((o) => o.obra_id).filter(Boolean) as string[]));
      const { data: obras } = obraIds.length
        ? await supabase.from("obras").select("id, nome").in("id", obraIds)
        : { data: [] as Array<{ id: string; nome: string }> };
      const { data: proximas } = await supabase.rpc("get_locatario_proximas_movimentacoes");
      return {
        ordens: ordens ?? [],
        obras: obras ?? [],
        unidades: unidades ?? [],
        proximas: (proximas ?? []) as Array<{
          id: string;
          sequencia: number;
          tipo: string;
          data_programada: string | null;
          rota_status: string;
          olu_status: string;
          codigo_cacamba: string | null;
          obra_nome: string | null;
          endereco: string | null;
          cidade: string | null;
          estado: string | null;
        }>,
      };
    },
  });

  const ordens = data?.ordens ?? [];
  const obras = data?.obras ?? [];
  const unidades = data?.unidades ?? [];
  const proximas = data?.proximas ?? [];

  const stats = useMemo(() => {
    const sumQty = (statuses: string[]) =>
      ordens
        .filter((o) => statuses.includes(o.status))
        .reduce((acc, o) => acc + Number(o.quantidade ?? 1), 0);
    const countUnid = (statuses: string[]) =>
      unidades.filter((u) => statuses.includes(u.status)).length;
    const ativas = countUnid(["locada", "aguardando_retirada"]);
    const aguardando = countUnid(["entrega_pendente", "em_transito_locacao"]);
    const retiradas = unidades.filter((u) =>
      ["aguardando_retirada", "retirada_pendente"].includes(u.status)
    ).length;
    return { ativas, aguardando, retiradas, ocorrencias: 0 };
  }, [ordens, unidades]);

  const dataMinhasLocacoes = useMemo(() => {
    const year = new Date().getFullYear();
    const buckets = MESES.map((name) => ({ name, ativas: 0, concluidas: 0 }));
    ordens.forEach((o) => {
      const d = new Date(o.created_at);
      if (d.getFullYear() !== year) return;
      const m = d.getMonth();
      if (o.status === "finalizada") buckets[m].concluidas += 1;
      else buckets[m].ativas += 1;
    });
    return buckets;
  }, [ordens]);

  const cacambasPorObra = useMemo(() => {
    const nomeMap = new Map(obras.map((o) => [o.id, o.nome]));
    const counts = new Map<string, number>();
    ordens.forEach((o) => {
      if (!o.obra_id) return;
      counts.set(o.obra_id, (counts.get(o.obra_id) ?? 0) + Number(o.quantidade ?? 1));
    });
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
    const palette = ["bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-purple-500", "bg-rose-500"];
    return Array.from(counts.entries()).map(([id, value], i) => ({
      label: nomeMap.get(id) ?? "Obra",
      value,
      total,
      color: palette[i % palette.length],
    }));
  }, [ordens, obras]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Painel Operacional"
          subtitle="Acompanhe suas locações, solicitações e ocorrências"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Caçambas Ativas</p>
                <h3 className="text-3xl font-bold">{stats.ativas}</h3>
              </div>
              <p className="text-[10px] text-muted-foreground">Em suas obras</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entregas Pendentes</p>
                <h3 className="text-3xl font-bold text-emerald-600">{stats.aguardando}</h3>
              </div>
              <p className="text-[10px] text-emerald-600 font-medium">Aguardando entrega</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retiradas Pendentes</p>
                <h3 className="text-3xl font-bold text-orange-600">{stats.retiradas}</h3>
              </div>
              <p className="text-[10px] text-orange-500 font-medium">Solicitar coleta</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ocorrências</p>
                <h3 className="text-3xl font-bold text-red-600">{stats.ocorrencias}</h3>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">Sem registros</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Histórico de Locações</CardTitle>
                  <CardDescription>Ativas e concluídas por mês</CardDescription>
                </div>
                <BarChartIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataMinhasLocacoes}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="ativas" name="Ativas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="concluidas" name="Concluídas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Caçambas por Obra</CardTitle>
              <CardDescription>Distribuição atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cacambasPorObra.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">Sem caçambas em obras</p>
                )}
                {cacambasPorObra.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{item.label}</span>
                      <span>{item.value} caçambas</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`${item.color} h-2 transition-all duration-500`}
                        style={{ width: `${(item.value / item.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-bold">Próximas Movimentações</CardTitle>
              <CardDescription>Entregas e retiradas agendadas</CardDescription>
            </CardHeader>
            <CardContent>
              {proximas.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Sem movimentações agendadas</p>
              ) : (
                <div className="space-y-3">
                  {proximas.slice(0, 8).map((m) => {
                    const isEntrega = (m.tipo ?? "").toLowerCase() === "entrega";
                    return (
                      <div key={m.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isEntrega ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
                            {isEntrega ? <Package className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {isEntrega ? "Entrega" : "Retirada"}
                              {m.codigo_cacamba ? ` · ${m.codigo_cacamba}` : ""}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {m.obra_nome ?? "Obra"}
                              {m.endereco ? ` — ${m.endereco}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground text-right shrink-0">
                          {m.data_programada
                            ? new Date(m.data_programada).toLocaleDateString("pt-BR")
                            : "Sem data"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Ações Rápidas</h3>
            <div className="grid grid-cols-1 gap-3">
              <Button className="h-14 justify-start gap-4 px-4 text-base" asChild>
                <Link to="/dashboard/pedidos/solicitar">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Plus className="h-5 w-5" />
                  </div>
                  Solicitar Caçamba
                </Link>
              </Button>

              <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base" asChild>
                <Link to="/dashboard/pedidos/ordens">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  Minhas Ordens
                </Link>
              </Button>

              <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base" asChild>
                <Link to="/dashboard/obras">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  Minhas Obras
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
};

const DefaultView = ({ isLocador }: { isLocador: boolean }) => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Painel Operacional" 
        subtitle="Monitoramento em tempo real da produtividade e campo"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Veículos Ativos</p>
              <h3 className="text-3xl font-bold">12/15</h3>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">+3 em relação a ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Caçambas em Campo</p>
              <h3 className="text-3xl font-bold">342</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Ocupação de 82%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Concluído Hoje</p>
              <h3 className="text-3xl font-bold">28</h3>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">92% de sucesso</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ocorrências</p>
              <h3 className="text-3xl font-bold text-red-600">04</h3>
            </div>
            <p className="text-[10px] text-red-500 font-medium">2 críticas necessitam ação</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Volume de Operações</CardTitle>
                <CardDescription>Entregas e Coletas por dia</CardDescription>
              </div>
              <BarChartIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataProducao}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="entregas" name="Entregas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="coletas" name="Coletas" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Eficiência Horária</CardTitle>
                <CardDescription>% de produtividade da frota</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataEficiencia}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    name="Eficiência (%)" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Status de Caçambas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Em Locação", value: 280, color: "bg-blue-500", total: 342 },
                { label: "Aguardando Retirada", value: 45, color: "bg-orange-500", total: 342 },
                { label: "Manutenção", value: 17, color: "bg-red-500", total: 342 },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{item.label}</span>
                    <span>{item.value} unidades</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className={`${item.color} h-2 transition-all duration-500`} 
                      style={{ width: `${(item.value / item.total) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-3">
            {isLocador ? (
              <>
                <Button 
                  className="h-14 justify-start gap-4 px-4 text-base" 
                  asChild
                >
                  <Link to="/dashboard/pedidos">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    Gestão de Pedidos
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-14 justify-start gap-4 px-4 text-base"
                  asChild
                >
                  <Link to="/dashboard/pedidos/ordens">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    Ordens de Locação
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-14 justify-start gap-4 px-4 text-base"
                  asChild
                >
                  <Link to="/dashboard/pedidos/ocorrencias">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <AlertOctagon className="h-5 w-5" />
                    </div>
                    Ocorrências
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  className="h-14 justify-start gap-4 px-4 text-base" 
                  asChild
                >
                  <Link to="/dashboard/operacional/entradas">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Plus className="h-5 w-5" />
                    </div>
                    Nova Entrada de Resíduos
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-14 justify-start gap-4 px-4 text-base"
                  asChild
                >
                  <Link to="/dashboard/operacional/entregas">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    Gestão de Entregas
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-14 justify-start gap-4 px-4 text-base"
                  asChild
                >
                  <Link to="/dashboard/operacional/retiradas">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    Gestão de Retiradas
                  </Link>
                </Button>
              </>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Alertas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { text: "Cacamba C-102 em atraso", type: "critical" },
                    { text: "Manutenção veículo ABC-1234", type: "warning" },
                  ].map((alerta, i) => (
                    <div key={i} className="flex gap-2 items-start p-2 rounded-lg bg-muted/30">
                      <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                        alerta.type === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                      }`} />
                      <span className="text-[10px] text-muted-foreground leading-tight">{alerta.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelOperacional;
