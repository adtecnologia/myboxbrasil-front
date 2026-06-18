import { Link } from "react-router-dom";
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

const dataPerfis = [
  { name: "Admin", value: 4, color: "#8b5cf6" },
  { name: "Locador", value: 28, color: "#10b981" },
  { name: "Locatário", value: 62, color: "#3b82f6" },
  { name: "Motorista", value: 18, color: "#f59e0b" },
  { name: "Destino", value: 9, color: "#ef4444" },
  { name: "Prefeitura", value: 5, color: "#06b6d4" },
];

const dataCrescimento = [
  { name: "Jan", novos: 8 },
  { name: "Fev", novos: 12 },
  { name: "Mar", novos: 18 },
  { name: "Abr", novos: 15 },
  { name: "Mai", novos: 22 },
  { name: "Jun", novos: 28 },
];

const PainelUsuarios = () => {
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
              <h3 className="text-3xl font-bold">126</h3>
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
              <h3 className="text-3xl font-bold text-emerald-600">108</h3>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">86% do total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Novos no Mês</p>
              <h3 className="text-3xl font-bold text-orange-600">28</h3>
            </div>
            <p className="text-[10px] text-orange-500 font-medium">+27% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <UserX className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inativos</p>
              <h3 className="text-3xl font-bold text-red-600">18</h3>
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
              {[
                { nome: "Carlos Mendes", perfil: "Locatário", data: "Hoje, 14:20", status: "success" },
                { nome: "Ana Paula Souza", perfil: "Motorista", data: "Hoje, 10:45", status: "success" },
                { nome: "Roberto Lima", perfil: "Locador", data: "Ontem, 16:30", status: "info" },
                { nome: "Juliana Castro", perfil: "Locatário", data: "Ontem, 09:15", status: "info" },
              ].map((item, i) => (
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
