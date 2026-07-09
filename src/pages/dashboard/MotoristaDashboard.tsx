import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMotoristaRotas, type MotoristaRotaItem } from "@/hooks/useMotoristaRotas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { 
  MapPin, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Navigation,
  Phone
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MotoristaDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const { data: rotas = [], isLoading } = useMotoristaRotas({ includeFinalizadas: true });
  const navigate = useNavigate();

  const hoje = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  const toDateStr = (d?: string | null) => (d ?? "").slice(0, 10);
  const formatDataBR = (d?: string | null) => {
    const s = toDateStr(d);
    if (!s) return "—";
    const [y, m, day] = s.split("-");
    return `${day}/${m}/${y}`;
  };

  // Status que representam conclusão do item na rota:
  // - Entrega: caçamba já foi entregue (locada em diante)
  // - Retirada: caçamba já foi retirada (em trânsito para análise / destino / cdf emitido)
  const STATUS_CONCLUIDO_ENTREGA = new Set([
    "locada",
    "aguardando_retirada",
    "em_transito_retirada",
    "em_transito_analise",
    "em_transito_destino_final",
    "aguardando_analise",
    "cdf_emitido",
  ]);
  const STATUS_CONCLUIDO_RETIRADA = new Set([
    "aguardando_analise",
    "cdf_emitido",
  ]);
  const isItemConcluido = (i: MotoristaRotaItem) => {
    if (!i.olu_status) return false;
    const tipo = String(i.tipo ?? "").toLowerCase();
    const set = tipo === "retirada" ? STATUS_CONCLUIDO_RETIRADA : STATUS_CONCLUIDO_ENTREGA;
    return set.has(i.olu_status);
  };

  // Rotas não canceladas ordenadas por data
  const rotasOrdenadas = useMemo(
    () =>
      [...rotas]
        .filter((r) => r.status !== "cancelada")
        .sort((a, b) =>
          (a.data_programada ?? "9999-12-31").localeCompare(
            b.data_programada ?? "9999-12-31"
          )
        ),
    [rotas]
  );

  const rotaEmAndamento = useMemo(
    () => rotasOrdenadas.find((r) => r.status === "em_andamento") ?? null,
    [rotasOrdenadas]
  );
  const proximaRotaHoje = useMemo(
    () =>
      rotasOrdenadas.find(
        (r) => toDateStr(r.data_programada) === hoje && r.status !== "concluida"
      ) ?? null,
    [rotasOrdenadas, hoje]
  );
  const rotaDestaque = rotaEmAndamento ?? proximaRotaHoje;
  const emAndamento = !!rotaEmAndamento;

  const rotasHoje = useMemo(
    () => rotasOrdenadas.filter((r) => toDateStr(r.data_programada) === hoje),
    [rotasOrdenadas, hoje]
  );

  const tarefasHoje = useMemo<MotoristaRotaItem[]>(
    () => rotasHoje.flatMap((r) => r.itens),
    [rotasHoje]
  );

  const tarefasProximaRota = useMemo<MotoristaRotaItem[]>(
    () => rotaDestaque?.itens.filter((i) => !isItemConcluido(i)) ?? [],
    [rotaDestaque]
  );

  const nextTask = tarefasProximaRota[0] ?? null;
  const restantes = useMemo<MotoristaRotaItem[]>(() => {
    const pendentes = rotasOrdenadas
      .filter((r) => r.status !== "concluida")
      .flatMap((r) => r.itens.filter((i) => !isItemConcluido(i)));
    return nextTask ? pendentes.filter((i) => i.id !== nextTask.id) : pendentes;
  }, [rotasOrdenadas, nextTask]);
  const total = tarefasHoje.length;
  const concluidasHoje = tarefasHoje.filter(isItemConcluido).length;
  const progresso = total === 0 ? 0 : Math.round((concluidasHoje / total) * 100);

  const formatTipo = (t: string) =>
    t ? t.charAt(0).toUpperCase() + t.slice(1) : "Tarefa";

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title={`Olá, ${user?.name ?? "Motorista"}`}
        subtitle={
          isLoading
            ? "Carregando suas rotas..."
            : total === 0
            ? "Você não tem tarefas programadas para hoje"
            : `Sua jornada de hoje: ${total} ${total === 1 ? "tarefa programada" : "tarefas programadas"}`
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Task Card */}
        {rotaDestaque ? (
        <Card className="md:col-span-2 border-primary/20 bg-primary/5 shadow-lg overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <Badge className={`mb-2 ${emAndamento ? "bg-emerald-600" : "bg-primary"}`}>
                  {emAndamento ? "Rota em Andamento" : "Próxima Atividade"}
                </Badge>
                <CardTitle className="text-2xl font-bold">
                  {nextTask ? `${formatTipo(nextTask.tipo)} #${nextTask.sequencia}` : "Sem tarefas"}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {nextTask?.cliente ?? "—"}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatDataBR(rotaDestaque?.data_programada)}
                </p>
                <p className="text-xs text-muted-foreground">Data</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">{nextTask?.endereco ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {rotaDestaque?.veiculo?.placa
                      ? `Veículo: ${rotaDestaque.veiculo.placa}`
                      : "Veículo não definido"}
                  </p>
                </div>
              </div>

              <Button
                  className="flex-1 gap-2"
                  disabled={!nextTask || !rotaDestaque}
                  onClick={() => {
                    if (rotaDestaque)
                      navigate("/dashboard/logistica/rotas", {
                        state: emAndamento ? undefined : { startRouteId: rotaDestaque.id },
                      });
                  }}
                >
                  <Navigation className="h-4 w-4" /> {emAndamento ? "Continuar Rota" : "Iniciar Rota"}
              </Button>
            </div>
          </CardContent>
        </Card>
        ) : (
          <Card className="md:col-span-2 border-dashed">
            <CardContent className="py-10 text-center space-y-2">
              <p className="text-lg font-semibold">Nada mais para hoje 🎉</p>
              <p className="text-sm text-muted-foreground">
                {total > 0
                  ? "Você concluiu todas as tarefas do dia."
                  : "Você não tem rotas programadas para hoje."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progresso do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mb-2">
                <p className="text-2xl font-bold text-foreground">{concluidasHoje}/{total}</p>
                <p className="text-xs text-muted-foreground">{progresso}% completo</p>
              </div>
              <Progress value={progresso} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 text-rose-600">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Ocorrências Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">00</p>
              <p className="text-xs text-muted-foreground mt-1">Nenhuma ocorrência ativa</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" /> Próximas Tarefas
        </h3>
        <div className="grid gap-3">
          {restantes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Carregando..." : "Sem outras tarefas pendentes."}
            </p>
          )}
          {restantes.map((task) => (
            <Card key={task.id} className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary uppercase">{formatTipo(task.tipo)}</span>
                      <span className="text-xs text-muted-foreground">#{task.sequencia}</span>
                    </div>
                    <p className="font-semibold">{task.cliente}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {task.endereco ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">Pendente</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-primary"
            onClick={() => navigate("/dashboard/logistica/rotas")}
          >
            Ver cronograma completo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MotoristaDashboard;
