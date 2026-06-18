import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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

const dataAtividades = [
  { name: "Seg", rotas: 12, entregas: 45 },
  { name: "Ter", rotas: 15, entregas: 52 },
  { name: "Qua", rotas: 10, entregas: 38 },
  { name: "Qui", rotas: 18, entregas: 65 },
  { name: "Sexta", rotas: 22, entregas: 80 },
  { name: "Sáb", rotas: 8, entregas: 25 },
];

const dataStatus = [
  { name: "Concluído", value: 85, color: "#10b981" },
  { name: "Em Rota", value: 10, color: "#3b82f6" },
  { name: "Atrasado", value: 5, color: "#ef4444" },
];

const PainelLogistico = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Painel Logístico" 
        subtitle="Visão geral e monitoramento das operações de transporte"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Rotas Ativas</p>
                <h3 className="text-3xl font-bold mt-1">08</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Navigation className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="bg-white/20 px-1.5 py-0.5 rounded">+2 que ontem</span>
              <span className="opacity-80">Progresso total 65%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entregas Hoje</p>
                <h3 className="text-3xl font-bold mt-1">42</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100">85% Meta</Badge>
              <span className="text-muted-foreground">Faltam 8 para a meta</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consumo Médio</p>
                <h3 className="text-3xl font-bold mt-1">4.2 <span className="text-base font-normal text-muted-foreground">km/L</span></h3>
              </div>
              <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                <Fuel className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Economia de 5%</span>
              <span className="text-muted-foreground">vs mês ant.</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ocorrências</p>
                <h3 className="text-3xl font-bold mt-1 text-red-500">02</h3>
              </div>
              <div className="bg-red-50 p-3 rounded-xl text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-red-500 font-medium">Urgente</span>
              <span className="text-muted-foreground">Necessitam atenção</span>
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
            <h3 className="text-lg font-bold">Rotas Críticas</h3>
            <Button variant="link" asChild><Link to="/dashboard/logistica/agendadas">Ver todas</Link></Button>
          </div>
          
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i} className="group hover:border-primary/50 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted flex flex-col items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                      <span className="text-[10px] font-bold mt-0.5">ABC-123{i}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm truncate">Rota Centro - Setor {i === 1 ? 'A' : 'B'}</h4>
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-100">Em tempo</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> 12 km percorridos</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 4h em trânsito</span>
                      </div>
                      <div className="mt-3 w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: i === 1 ? '75%' : '40%' }} />
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-3">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelLogistico;