import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Package, 
  Box, 
  TrendingUp,
  BarChart as BarChartIcon,
  CheckCircle2,
  AlertTriangle,
  History,
  Plus,
  MapPin
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { supabase } from "@/integrations/supabase/client";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

type HistItem = { id: string; codigo: string; acao: string; data: string; ts: number };

const PainelAtivos = () => {
  const [stats, setStats] = useState({ total: 0, disponiveis: 0, emCampo: 0, manutencao: 0 });
  const [movimentacao, setMovimentacao] = useState<{ name: string; entradas: number; saidas: number }[]>([]);
  const [historico, setHistorico] = useState<HistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const desde = new Date();
      desde.setDate(desde.getDate() - 6);
      const desdeISO = desde.toISOString();

      const [uCac, uEqp, olus, olusProcesso, rotasMov] = await Promise.all([
        supabase.from("cacamba_unidades").select("id, disponivel, manutencao"),
        supabase.from("equipamento_unidades").select("id, disponivel"),
        supabase
          .from("ordem_locacao_unidades")
          .select("cacamba_unidade_id, status")
          .in("status", [
            "locada",
            "aguardando_retirada",
          ]),
        supabase
          .from("ordem_locacao_unidades")
          .select("cacamba_unidade_id, status")
          .in("status", [
            "em_transito_locacao",
            "locada",
            "aguardando_retirada",
            "em_transito_retirada",
            "em_transito_analise",
          ]),
        supabase
          .from("rotas")
          .select(
            "id, status, iniciado_at, finalizado_at, rota_itens ( id, tipo, ordem_locacao_unidades:ordem_locacao_unidade_id ( cacamba_unidades:cacamba_unidade_id ( codigo ) ) )",
          )
          .or(`iniciado_at.gte.${desdeISO},finalizado_at.gte.${desdeISO}`)
          .order("iniciado_at", { ascending: false }),
      ]);
      if (!active) return;

      const uc = uCac.data ?? [];
      const ue = uEqp.data ?? [];
      const total = uc.length + ue.length;
      const manutCount =
        uc.filter((u: { manutencao: boolean }) => u.manutencao).length;
      const emCampoIds = new Set(
        (olus.data ?? [])
          .map((o: { cacamba_unidade_id: string | null }) => o.cacamba_unidade_id)
          .filter(Boolean) as string[],
      );
      const emCampo = uc.filter((u: { id: string }) => emCampoIds.has(u.id)).length;
      const emProcessoIds = new Set(
        (olusProcesso.data ?? [])
          .map((o: { cacamba_unidade_id: string | null }) => o.cacamba_unidade_id)
          .filter(Boolean) as string[],
      );
      const disponiveis =
        uc.filter(
          (u: { id: string; disponivel: boolean; manutencao: boolean }) =>
            u.disponivel && !u.manutencao && !emProcessoIds.has(u.id),
        ).length +
        ue.filter((u: { disponivel: boolean }) => u.disponivel).length;
      setStats({ total, disponiveis, emCampo, manutencao: manutCount });

      // Movimentação dos últimos 7 dias
      const buckets = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { date: d, name: DIAS[d.getDay()], entradas: 0, saidas: 0 };
      });
      const idxByDay = (iso: string) => {
        const d = new Date(iso);
        return buckets.findIndex(
          (b) =>
            b.date.getFullYear() === d.getFullYear() &&
            b.date.getMonth() === d.getMonth() &&
            b.date.getDate() === d.getDate()
        );
      };
      const histItems: HistItem[] = [];
      (rotasMov.data ?? []).forEach((r: any) => {
        const itens = r.rota_itens ?? [];
        const entregas = itens.filter((it: any) => String(it.tipo ?? "").toLowerCase() === "entrega").length;
        const retiradas = itens.filter((it: any) => String(it.tipo ?? "").toLowerCase() === "retirada").length;
        if (r.iniciado_at) {
          const i = idxByDay(r.iniciado_at);
          if (i >= 0) buckets[i].saidas += entregas;
        }
        if (r.finalizado_at) {
          const i = idxByDay(r.finalizado_at);
          if (i >= 0) buckets[i].entradas += retiradas;
        }
        itens.forEach((it: any) => {
          const codigo = it.ordem_locacao_unidades?.cacamba_unidades?.codigo ?? "—";
          const tipo = String(it.tipo ?? "").toLowerCase();
          if (r.finalizado_at) {
            histItems.push({
              id: `f-${it.id}`,
              codigo,
              acao: tipo === "retirada" ? "Retirada concluída" : "Entrega concluída",
              data: new Date(r.finalizado_at).toLocaleString("pt-BR"),
              ts: new Date(r.finalizado_at).getTime(),
            });
          } else if (r.iniciado_at) {
            histItems.push({
              id: `i-${it.id}`,
              codigo,
              acao: tipo === "retirada" ? "Retirada iniciada" : "Entrega iniciada",
              data: new Date(r.iniciado_at).toLocaleString("pt-BR"),
              ts: new Date(r.iniciado_at).getTime(),
            });
          }
        });
      });
      setMovimentacao(buckets.map(({ name, entradas, saidas }) => ({ name, entradas, saidas })));

      setHistorico(histItems.sort((a, b) => b.ts - a.ts).slice(0, 6));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const dataStatus = useMemo(
    () => [
      { name: "Disponíveis", value: stats.disponiveis, color: "#10b981" },
      { name: "Em Campo", value: stats.emCampo, color: "#3b82f6" },
      { name: "Manutenção", value: stats.manutencao, color: "#f59e0b" },
    ],
    [stats]
  );
  const utilizacao = stats.total > 0 ? Math.round((stats.emCampo / stats.total) * 100) : 0;

  if (loading) {
    return <DashboardSkeleton title="Painel de Ativos" subtitle="Gestão e monitoramento de caçambas e equipamentos" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Painel de Ativos" 
        subtitle="Gestão e monitoramento de caçambas e equipamentos"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Ativos</p>
              <h3 className="text-3xl font-bold">{stats.total}</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Caçambas e Equipamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Em Campo</p>
              <h3 className="text-3xl font-bold">{stats.emCampo}</h3>
            </div>
            <p className="text-[10px] text-blue-600 font-medium">{utilizacao}% de utilização</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Disponíveis</p>
              <h3 className="text-3xl font-bold text-emerald-600">{stats.disponiveis}</h3>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">Prontos para locação</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Manutenção</p>
              <h3 className="text-3xl font-bold text-orange-600">{stats.manutencao}</h3>
            </div>
            <p className="text-[10px] text-orange-500 font-medium">Aguardando reparo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Distribuição de Status</CardTitle>
                <CardDescription>Ocupação atual dos ativos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[260px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
              {dataStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 whitespace-nowrap">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Movimentação Semanal</CardTitle>
                <CardDescription>Entradas e Saídas do pátio</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movimentacao}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="saidas" name="Ocorrências" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="entradas" name="Manutenções" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Histórico Recente</CardTitle>
            <CardDescription>Últimas movimentações de ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historico.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Sem movimentações recentes.</p>
              )}
              {historico.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Box className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.codigo}</p>
                      <p className="text-xs text-muted-foreground">{item.acao}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">{item.data}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-3">
            <Button className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/cacambas">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Package className="h-5 w-5" />
                </div>
                Gerenciar Caçambas
              </Link>
            </Button>
            
            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/equipamentos">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Box className="h-5 w-5" />
                </div>
                Gerenciar Equipamentos
              </Link>
            </Button>
            
            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <History className="h-5 w-5" />
              </div>
              Histórico de Ativos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelAtivos;