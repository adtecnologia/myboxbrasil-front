import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  UserX,
  Settings,
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
import { DashboardSkeleton } from "@/components/DashboardSkeleton";

const ROLE_META: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "#8b5cf6" },
  locador: { label: "Locador", color: "#10b981" },
  locatario: { label: "Locatário", color: "#3b82f6" },
  motorista: { label: "Motorista", color: "#f59e0b" },
  destino: { label: "Destino", color: "#ef4444" },
  prefeitura: { label: "Prefeitura", color: "#06b6d4" },
};

const ROLE_ORDER = ["admin", "locador", "motorista", "locatario", "prefeitura", "destino"];

interface TenantUserRow {
  user_id: string;
  role: string;
  ativo: boolean;
  created_at: string;
  nome: string;
}

function useTenantUsers() {
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore(
    (s) => s.activeProfile() ?? s.user?.profiles[0] ?? null
  );
  const rawTenant = activeProfile?.tenantId;
  const locadorId = rawTenant && rawTenant !== "self" ? rawTenant : user?.id;

  return useQuery({
    queryKey: ["painel-usuarios", locadorId],
    enabled: !!locadorId,
    queryFn: async (): Promise<TenantUserRow[]> => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id, role, ativo, created_at, locador_id")
        .or(`locador_id.eq.${locadorId},user_id.eq.${locadorId}`);
      if (error) throw error;

      const ids = Array.from(new Set((roles ?? []).map((r: any) => r.user_id)));
      const nomes = new Map<string, string>();
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nome")
          .in("id", ids);
        (profs ?? []).forEach((p: any) => nomes.set(p.id, p.nome));
      }

      const byUser = new Map<string, any>();
      (roles ?? []).forEach((r: any) => {
        const cur = byUser.get(r.user_id);
        if (!cur || ROLE_ORDER.indexOf(r.role) < ROLE_ORDER.indexOf(cur.role)) {
          byUser.set(r.user_id, r);
        }
      });

      return Array.from(byUser.values()).map((r: any) => ({
        user_id: r.user_id,
        role: r.role,
        ativo: r.ativo,
        created_at: r.created_at,
        nome: nomes.get(r.user_id) ?? "—",
      }));
    },
  });
}

const PainelUsuarios = () => {
  const { data: users = [], isLoading } = useTenantUsers();

  const total = users.length;
  const ativos = users.filter((u) => u.ativo).length;
  const inativos = total - ativos;
  const pctAtivos = total ? Math.round((ativos / total) * 100) : 0;

  const now = new Date();
  const novosMes = users.filter((u) => {
    const d = new Date(u.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const dataPerfis = useMemo(() => {
    const counts = new Map<string, number>();
    users.forEach((u) => counts.set(u.role, (counts.get(u.role) ?? 0) + 1));
    return Array.from(counts.entries()).map(([role, value]) => ({
      name: ROLE_META[role]?.label ?? role,
      value,
      color: ROLE_META[role]?.color ?? "#94a3b8",
    }));
  }, [users]);

  const dataCrescimento = useMemo(() => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const arr: { name: string; novos: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const novos = users.filter((u) => {
        const c = new Date(u.created_at);
        return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
      }).length;
      arr.push({ name: meses[d.getMonth()], novos });
    }
    return arr;
  }, [users]);

  const ultimosCadastros = useMemo(
    () =>
      [...users]
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
        .slice(0, 4)
        .map((u) => ({
          nome: u.nome,
          perfil: ROLE_META[u.role]?.label ?? u.role,
          data: new Date(u.created_at).toLocaleString("pt-BR"),
        })),
    [users]
  );

  if (isLoading) {
    return <DashboardSkeleton title="Painel de Usuários" subtitle="Visão geral dos usuários e perfis do sistema" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Usuários"
        subtitle="Visão geral dos usuários e perfis do sistema"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
              <h3 className="text-3xl font-bold">{total}</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Cadastrados na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ativos</p>
              <h3 className="text-3xl font-bold text-emerald-600">{ativos}</h3>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">{pctAtivos}% do total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Novos no Mês</p>
              <h3 className="text-3xl font-bold text-orange-600">{novosMes}</h3>
            </div>
            <p className="text-[10px] text-orange-500 font-medium">Cadastrados este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <UserX className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inativos</p>
              <h3 className="text-3xl font-bold text-red-600">{inativos}</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Sem acesso recente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Distribuição por Perfil</CardTitle>
            <CardDescription>Usuários por tipo de acesso</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPerfis}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataPerfis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {dataPerfis.map((item) => (
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
                <CardTitle className="text-base font-bold">Crescimento Mensal</CardTitle>
                <CardDescription>Novos usuários cadastrados</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataCrescimento}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="novos" name="Novos Usuários" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Últimos Cadastros</CardTitle>
            <CardDescription>Usuários recentemente adicionados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ultimosCadastros.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhum cadastro recente
                </p>
              )}
              {ultimosCadastros.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">{item.perfil}</p>
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
              <Link to="/dashboard/usuarios/listagem">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                Gerenciar Usuários
              </Link>
            </Button>

            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/usuarios/roles">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                Perfis e Permissões
              </Link>
            </Button>

            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/configuracoes">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Settings className="h-5 w-5" />
                </div>
                Configurações
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelUsuarios;
