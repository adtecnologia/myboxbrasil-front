import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMotoristaRotas } from "@/hooks/useMotoristaRotas";
import { useLocadorRotas } from "@/hooks/useLocadorRotas";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Navigation,
  Fuel,
  Map as MapIcon,
  ChevronRight,
  Plus,
  History
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
import { useNavigate } from "react-router-dom";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";

const PainelLogistico = () => {
  const navigate = useNavigate();
  const activeRole = useAuthStore((s) => s.activeProfileType?.() ?? null);
  const isMotorista = activeRole === "motorista";
  const isLocador = activeRole === "locador";
  const { data: rotasMotorista = [], isLoading: loadingMot } = useMotoristaRotas({ includeFinalizadas: true });

  const { data: rotasLocador = [], isLoading: loadingLoc } = useLocadorRotas();

  const rotasFonte = (
    isMotorista
      ? rotasMotorista.map((r) => ({ id: r.id, data_programada: r.data_programada, status: r.status, veiculo: r.veiculo, itens: r.itens }))
      : isLocador
        ? rotasLocador
        : []
  ).filter((r) => r.status !== "cancelada");

  const hojeISO = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => {
    const rotasHoje = rotasFonte.filter((r) => r.data_programada === hojeISO);
    const ativas = rotasFonte.filter((r) => r.status === "em_andamento").length;
    const entregasHoje = rotasHoje.reduce(
      (acc, r) => acc + r.itens.filter((i) => (i as { tipo?: string }).tipo?.toLowerCase() === "entrega").length,
      0
    );
    const retiradasHoje = rotasHoje.reduce(
      (acc, r) => acc + r.itens.filter((i) => (i as { tipo?: string }).tipo?.toLowerCase() === "retirada").length,
      0
    );
    return {
      ativas,
      total: rotasFonte.length,
      entregasHoje,
      retiradasHoje,
      paradasHoje: rotasHoje.reduce((acc, r) => acc + r.itens.length, 0),
    };
  }, [rotasFonte, hojeISO]);

  const rotasCriticas = rotasFonte
    .filter((r) => r.status !== "concluida")
    .slice()
    .sort((a, b) => {
      const da = a.data_programada ?? "";
      const db = b.data_programada ?? "";
      if (!da) return 1;
      if (!db) return -1;
      return da.localeCompare(db);
    })
    .slice(0, 2);

  const dataAtividades = useMemo(() => {
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const out: { name: string; rotas: number; entregas: number; retiradas: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const rotasDia = rotasFonte.filter((r) => r.data_programada === iso);
      const entregas = rotasDia.reduce(
        (acc, r) => acc + r.itens.filter((it) => (it as { tipo?: string }).tipo?.toLowerCase() === "entrega").length,
        0
      );
      const retiradas = rotasDia.reduce(
        (acc, r) => acc + r.itens.filter((it) => (it as { tipo?: string }).tipo?.toLowerCase() === "retirada").length,
        0
      );
      out.push({ name: dias[d.getDay()], rotas: rotasDia.length, entregas, retiradas });
    }
    return out;
  }, [rotasFonte]);

  const dataStatus = useMemo(() => {
    const rotasDia = rotasFonte.filter(
      (r) => r.data_programada === hojeISO && r.status !== "cancelada",
    );
    const total = rotasDia.length || 1;
    const concl = rotasDia.filter((r) => r.status === "concluida").length;
    const andamento = rotasDia.filter((r) => r.status === "em_andamento").length;
    const aguardando = rotasDia.filter((r) => r.status === "agendada").length;
    const atraso = rotasDia.filter(
      (r) => r.status === "agendada" && r.data_programada && r.data_programada < hojeISO,
    ).length;
    return [
      { name: "Concluído", value: Math.round((concl / total) * 100), color: "#10b981" },
      { name: "Em Rota", value: Math.round((andamento / total) * 100), color: "#3b82f6" },
      { name: "Aguardando", value: Math.round((aguardando / total) * 100), color: "#f59e0b" },
      { name: "Atrasado", value: Math.round((atraso / total) * 100), color: "#ef4444" },
    ];
  }, [rotasFonte, hojeISO]);

  const isLoading = (isMotorista && loadingMot) || (isLocador && loadingLoc);
  if (isLoading) {
    return (
      <DashboardSkeleton
        title="Painel Logístico"
        subtitle={
          isMotorista
            ? "Visão geral das suas rotas atribuídas"
            : "Visão geral e monitoramento das operações de transporte"
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Painel Logístico" 
        subtitle={
          isMotorista
            ? "Visão geral das suas rotas atribuídas"
            : "Visão geral e monitoramento das operações de transporte"
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Rotas Ativas</p>
                <h3 className="text-3xl font-bold mt-1">
                  {String(stats.ativas).padStart(2, "0")}
                </h3>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Navigation className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="bg-white/20 px-1.5 py-0.5 rounded">{stats.total} no total</span>
              <span className="opacity-80">{stats.paradasHoje} paradas hoje</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entregas Hoje</p>
                <h3 className="text-3xl font-bold mt-1">
                  {String(stats.entregasHoje).padStart(2, "0")}
                </h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100">Hoje</Badge>
              <span className="text-muted-foreground">Entregas programadas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retiradas Hoje</p>
                <h3 className="text-3xl font-bold mt-1">
                  {String(stats.retiradasHoje).padStart(2, "0")}
                </h3>
              </div>
              <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                <Truck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-100">Hoje</Badge>
              <span className="text-muted-foreground">Retiradas programadas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ocorrências</p>
                <h3 className="text-3xl font-bold mt-1 text-red-500">00</h3>
              </div>
              <div className="bg-red-50 p-3 rounded-xl text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Nenhuma ocorrência</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Atividade Semanal</CardTitle>
            <CardDescription>Volume de rotas e entregas nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataAtividades}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="entregas" name="Entregas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="retiradas" name="Retiradas" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rotas" name="Rotas" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Distribuição de Status</CardTitle>
            <CardDescription>Eficiência das rotas de hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={dataStatus} margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {dataStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-4 pl-8">
                {dataStatus.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">
              {isMotorista ? "Minhas Próximas Rotas" : "Próximas Rotas"}
            </h3>
            <Button variant="link" asChild>
              <Link to={isMotorista ? "/dashboard/logistica/rotas" : "/dashboard/logistica/agendadas"}>
                Ver todas
              </Link>
            </Button>
          </div>
          
          <div className="space-y-3">
            {rotasCriticas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {isMotorista ? "Você ainda não possui rotas atribuídas." : "Nenhuma rota cadastrada."}
              </p>
            ) : (
              rotasCriticas.map((r, i) => (
                  <Card
                    key={r.id}
                    className="group hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() =>
                      navigate(
                        isMotorista
                          ? "/dashboard/logistica/rotas"
                          : "/dashboard/logistica/agendadas"
                      )
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-muted flex flex-col items-center justify-center">
                          <Truck className="h-5 w-5 text-primary" />
                          <span className="text-[10px] font-bold mt-0.5">
                            {r.veiculo?.placa ?? "—"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm truncate">
                              Rota {String(i + 1).padStart(3, "0")}
                            </h4>
                            <Badge variant="outline" className="text-[10px]">
                              {r.status === "em_andamento" ? "Em andamento" : "Agendada"}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {r.itens.length} paradas
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{" "}
                              {r.data_programada
                                ? (() => { const [y,m,d] = String(r.data_programada).slice(0,10).split("-"); return `${d}/${m}/${y}`; })()
                                : "—"}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-3">
            {isMotorista ? (
              <Button
                className="h-14 justify-start gap-4 px-4 text-base"
                asChild
              >
                <Link to="/dashboard/logistica/rotas">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <MapIcon className="h-5 w-5" />
                  </div>
                  Minhas Rotas
                </Link>
              </Button>
            ) : (
              <>
                <Button 
              className="h-14 justify-start gap-4 px-4 text-base" 
              asChild
            >
              <Link to="/dashboard/logistica/agendar">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Plus className="h-5 w-5" />
                </div>
                Criar Nova Rota
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-14 justify-start gap-4 px-4 text-base"
              asChild
            >
              <Link to="/dashboard/rastreamento">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <MapIcon className="h-5 w-5" />
                </div>
                Monitoramento GPS
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-14 justify-start gap-4 px-4 text-base"
              asChild
            >
              <Link to="/dashboard/logistica/historico">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <History className="h-5 w-5" />
                </div>
                Histórico de Rotas
              </Link>
            </Button>
            
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium">Escala de Motoristas</p>
                <p className="text-[10px] text-muted-foreground mt-1">Próxima atualização em 2h</p>
                <Button variant="link" size="sm" className="mt-1 h-auto p-0">Visualizar</Button>
              </CardContent>
            </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelLogistico;