import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import {
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Package,
  CalendarDays,
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
  Cell,
} from "recharts";

interface ObraRow {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  status: string;
  data_inicio: string;
  data_final_estimada: string;
  created_at: string;
}

const PainelObras = () => {
  const [obras, setObras] = useState<ObraRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("obras")
        .select("id,nome,cidade,estado,status,data_inicio,data_final_estimada,created_at")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Erro ao carregar obras");
      } else {
        setObras((data ?? []) as ObraRow[]);
      }
      setLoading(false);
    })();
  }, []);

  const total = obras.length;
  const ativas = obras.filter((o) => o.status === "ativa").length;
  const finalizadas = obras.filter((o) => o.status === "finalizada").length;

  const dataStatus = [
    { name: "Ativas", value: ativas, color: "#10b981" },
    { name: "Finalizadas", value: finalizadas, color: "#3b82f6" },
  ];

  const prazoMedio = useMemo(() => {
    if (!obras.length) return 0;
    const meses = obras.map((o) => {
      const ini = new Date(o.data_inicio);
      const fim = new Date(o.data_final_estimada);
      return Math.max(0, (fim.getFullYear() - ini.getFullYear()) * 12 + (fim.getMonth() - ini.getMonth()));
    });
    return Math.round(meses.reduce((a, b) => a + b, 0) / meses.length);
  }, [obras]);

  const dataLocacoes = useMemo(() => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const hoje = new Date();
    const buckets: { name: string; locacoes: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      buckets.push({ name: meses[d.getMonth()], locacoes: 0 });
    }
    obras.forEach((o) => {
      const d = new Date(o.created_at);
      const diff = (hoje.getFullYear() - d.getFullYear()) * 12 + (hoje.getMonth() - d.getMonth());
      if (diff >= 0 && diff <= 5) buckets[5 - diff].locacoes += 1;
    });
    return buckets;
  }, [obras]);

  const destaque = obras.slice(0, 4);

  if (loading) {
    return <DashboardSkeleton title="Painel de Obras" subtitle="Visão geral dos seus canteiros de obras" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Obras"
        subtitle="Visão geral dos seus canteiros de obras"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Obras</p>
              <h3 className="text-3xl font-bold">{loading ? "—" : total}</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Cadastradas no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Obras Ativas</p>
              <h3 className="text-3xl font-bold text-emerald-600">{loading ? "—" : ativas}</h3>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Obras Finalizadas</p>
              <h3 className="text-3xl font-bold text-orange-600">{loading ? "—" : finalizadas}</h3>
            </div>
            <p className="text-[10px] text-orange-500 font-medium">Concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Prazo Médio</p>
              <h3 className="text-3xl font-bold">{loading ? "—" : `${prazoMedio}m`}</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Duração estimada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Status das Obras</CardTitle>
            <CardDescription>Distribuição atual por situação</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full max-w-[300px]">
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
              <div className="grid grid-cols-3 gap-2 mt-2">
                {dataStatus.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Locações por Mês</CardTitle>
                <CardDescription>Solicitações de caçambas</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataLocacoes}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="locacoes" name="Locações" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Obras em Destaque</CardTitle>
            <CardDescription>Canteiros com maior movimentação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {destaque.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma obra cadastrada</p>
              )}
              {destaque.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.nome}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.cidade}/{item.estado}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary capitalize">{item.status}</p>
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
              <Link to="/dashboard/obras/listagem">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Building2 className="h-5 w-5" />
                </div>
                Gerenciar Obras
              </Link>
            </Button>

            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/pedidos/solicitar">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                Solicitar Caçamba
              </Link>
            </Button>

            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/relatorios/obra">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                Relatório por Obra
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelObras;
