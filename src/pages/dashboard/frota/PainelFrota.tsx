import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Truck, 
  Settings, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart as BarChartIcon,
  Wrench,
  AlertOctagon,
  Calendar
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

interface VeiculoRow { id: string; placa: string; ativo: boolean }
interface ManutRow { veiculo_id: string; status: string; tipo: string; data_manutencao: string; valor: number | null }
interface OcorrRow { data_ocorrencia: string }

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const PainelFrota = () => {
  const [veiculos, setVeiculos] = useState<VeiculoRow[]>([]);
  const [manutencoes, setManutencoes] = useState<ManutRow[]>([]);
  const [ocorrencias, setOcorrencias] = useState<OcorrRow[]>([]);
  const [emRotaIds, setEmRotaIds] = useState<Set<string>>(new Set());
  const [alertas, setAlertas] = useState<Array<{ placa: string; servico: string; prazo: string; status: string }>>([]);

  useEffect(() => {
    const load = async () => {
      const [v, m, o, r] = await Promise.all([
        supabase.from("veiculos").select("id,placa,ativo"),
        supabase.from("manutencoes_frota").select("veiculo_id,status,tipo,data_manutencao,valor"),
        supabase.from("ocorrencias_frota").select("data_ocorrencia"),
        supabase.from("rotas").select("veiculo_id").eq("status", "em_andamento"),
      ]);
      const vs = (v.data ?? []) as VeiculoRow[];
      const ms = (m.data ?? []) as ManutRow[];
      setVeiculos(vs);
      setManutencoes(ms);
      setOcorrencias((o.data ?? []) as OcorrRow[]);
      setEmRotaIds(new Set(((r.data ?? []) as { veiculo_id: string | null }[]).map((x) => x.veiculo_id).filter(Boolean) as string[]));

      const placas = new Map(vs.map((x) => [x.id, x.placa]));
      const hoje = new Date();
      const futuras = ms
        .filter((x) => x.status !== "Concluída" && new Date(x.data_manutencao) >= hoje)
        .sort((a, b) => +new Date(a.data_manutencao) - +new Date(b.data_manutencao))
        .slice(0, 5)
        .map((x) => {
          const dias = Math.ceil((+new Date(x.data_manutencao) - +hoje) / 86400000);
          return {
            placa: placas.get(x.veiculo_id) ?? "—",
            servico: x.tipo,
            prazo: `${dias} dia${dias === 1 ? "" : "s"}`,
            status: dias <= 7 ? "critical" : dias <= 30 ? "warning" : "normal",
          };
        });
      setAlertas(futuras);
    };
    load();
  }, []);

  const total = veiculos.length;
  const emManutencaoIds = useMemo(
    () => new Set(manutencoes.filter((m) => m.status === "Em andamento" || m.status === "Agendada").map((m) => m.veiculo_id)),
    [manutencoes]
  );
  const emManutencao = emManutencaoIds.size;
  const emRota = veiculos.filter((v) => emRotaIds.has(v.id) && !emManutencaoIds.has(v.id)).length;
  const disponiveis = Math.max(
    0,
    veiculos.filter((v) => v.ativo && !emManutencaoIds.has(v.id) && !emRotaIds.has(v.id)).length,
  );
  const parados = Math.max(0, total - disponiveis - emManutencao - emRota);
  const preventivas = manutencoes.filter((m) => emManutencaoIds.has(m.veiculo_id) && m.tipo === "Preventiva").length;
  const corretivas = manutencoes.filter((m) => emManutencaoIds.has(m.veiculo_id) && m.tipo === "Corretiva").length;

  const ocor30 = useMemo(() => {
    const limite = Date.now() - 30 * 86400000;
    return ocorrencias.filter((o) => +new Date(o.data_ocorrencia) >= limite).length;
  }, [ocorrencias]);

  const dataDisponibilidade = [
    { name: "Operacionais", value: disponiveis, color: "#10b981" },
    { name: "Em uso", value: emRota, color: "#3b82f6" },
    { name: "Manutenção", value: emManutencao, color: "#f59e0b" },
    { name: "Parados", value: parados, color: "#ef4444" },
  ];

  const dataManutencao = useMemo(() => {
    const arr: { name: string; valor: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const valor = manutencoes
        .filter((m) => {
          const dt = new Date(m.data_manutencao);
          return dt >= d && dt < next;
        })
        .reduce((s, m) => s + (Number(m.valor) || 0), 0);
      arr.push({ name: MESES[d.getMonth()], valor });
    }
    return arr;
  }, [manutencoes]);

  const pct = total > 0 ? Math.round((disponiveis / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Painel Frota" 
        subtitle="Gerenciamento e monitoramento da frota de veículos"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Veículos</p>
              <h3 className="text-3xl font-bold">{String(total).padStart(2, "0")}</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Frota ativa registrada</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Disponíveis</p>
              <h3 className="text-3xl font-bold">{String(disponiveis).padStart(2, "0")}</h3>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">{pct}% de disponibilidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Em Manutenção</p>
              <h3 className="text-3xl font-bold text-orange-600">{String(emManutencao).padStart(2, "0")}</h3>
            </div>
            <p className="text-[10px] text-orange-500 font-medium">{preventivas} preventiva{preventivas === 1 ? "" : "s"}, {corretivas} corretiva{corretivas === 1 ? "" : "s"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ocorrências</p>
              <h3 className="text-3xl font-bold text-red-600">{String(ocor30).padStart(2, "0")}</h3>
            </div>
            <p className="text-[10px] text-red-500 font-medium">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Disponibilidade da Frota</CardTitle>
                <CardDescription>Status atual dos veículos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[260px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataDisponibilidade}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataDisponibilidade.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
              {dataDisponibilidade.map((item) => (
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
                <CardTitle className="text-base font-bold">Custos de Manutenção</CardTitle>
                <CardDescription>Histórico mensal (R$)</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataManutencao}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Alertas de Manutenção</CardTitle>
            <CardDescription>Veículos que necessitam atenção em breve</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertas.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma manutenção agendada.</p>
              )}
              {alertas.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.placa}</p>
                      <p className="text-xs text-muted-foreground">{item.servico}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${
                      item.status === 'critical' ? 'text-red-500' : 
                      item.status === 'warning' ? 'text-orange-500' : 'text-emerald-500'
                    }`}>
                      {item.prazo}
                    </p>
                    <p className="text-[10px] text-muted-foreground">restantes</p>
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
              <Link to="/dashboard/frota/veiculos">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Truck className="h-5 w-5" />
                </div>
                Gerenciar Veículos
              </Link>
            </Button>
            
            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/frota/manutencoes">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Wrench className="h-5 w-5" />
                </div>
                Nova Manutenção
              </Link>
            </Button>
            
            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/frota/ocorrencias">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                Registrar Ocorrência
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelFrota;