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
    const dataMinhasLocacoes = [
      { name: "Jan", ativas: 4, concluidas: 8 },
      { name: "Fev", ativas: 5, concluidas: 6 },
      { name: "Mar", ativas: 6, concluidas: 10 },
      { name: "Abr", ativas: 3, concluidas: 12 },
      { name: "Mai", ativas: 7, concluidas: 9 },
      { name: "Jun", ativas: 8, concluidas: 11 },
    ];

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
                <h3 className="text-3xl font-bold">8</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Pedidos em Aberto</p>
                <h3 className="text-3xl font-bold text-emerald-600">3</h3>
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
                <h3 className="text-3xl font-bold text-orange-600">2</h3>
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
                <h3 className="text-3xl font-bold text-red-600">1</h3>
              </div>
              <p className="text-[10px] text-red-500 font-medium">Aguardando retorno</p>
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
                {[
                  { label: "Residencial Solar", value: 4, color: "bg-blue-500", total: 8 },
                  { label: "Edifício Mar", value: 2, color: "bg-emerald-500", total: 8 },
                  { label: "Centro Empresarial", value: 2, color: "bg-orange-500", total: 8 },
                ].map((item) => (
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
              <div className="space-y-4">
                {[
                  { tipo: "Entrega", obra: "Residencial Solar", data: "Hoje, 14:00", status: "info" },
                  { tipo: "Retirada", obra: "Edifício Mar", data: "Amanhã, 09:00", status: "warning" },
                  { tipo: "Entrega", obra: "Centro Empresarial", data: "23/12, 10:30", status: "info" },
                  { tipo: "Retirada", obra: "Residencial Solar", data: "24/12, 16:00", status: "warning" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        item.tipo === "Entrega" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                      }`}>
                        {item.tipo === "Entrega" ? <Truck className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.tipo}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {item.obra}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px]">{item.data}</Badge>
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
  }

  // ============ DEFAULT VIEW (admin / locador / destino) ============
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
