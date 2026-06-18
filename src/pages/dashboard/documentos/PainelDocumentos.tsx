import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileText, 
  FileCheck, 
  FileClock, 
  AlertCircle,
  Download,
  Search,
  Plus,
  ArrowUpRight,
  ShieldCheck
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

const dataTipos = [
  { name: "MTR", value: 45, color: "#3b82f6" },
  { name: "CDF", value: 32, color: "#8b5cf6" },
  { name: "NF", value: 28, color: "#f59e0b" },
  { name: "Licenças", value: 12, color: "#10b981" },
];

const dataEmissoes = [
  { name: "Jan", valor: 85 },
  { name: "Fev", valor: 92 },
  { name: "Mar", valor: 78 },
  { name: "Abr", valor: 110 },
  { name: "Mai", valor: 95 },
  { name: "Jun", valor: 125 },
];

const PainelDocumentos = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Painel de Documentos" 
        subtitle="Controle e monitoramento de MTRs, CDFs e documentação legal"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Emitidos</p>
              <h3 className="text-3xl font-bold">117</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">CDFs Concluídos</p>
              <h3 className="text-3xl font-bold text-emerald-600">84</h3>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">100% de conformidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <FileClock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">MTRs Pendentes</p>
              <h3 className="text-3xl font-bold text-orange-600">12</h3>
            </div>
            <p className="text-[10px] text-orange-500 font-medium">Aguardando recebimento</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vencimento Licenças</p>
              <h3 className="text-3xl font-bold text-red-600">02</h3>
            </div>
            <p className="text-[10px] text-red-500 font-medium">Próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Distribuição por Tipo</CardTitle>
                <CardDescription>Volume de documentos gerados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataTipos}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataTipos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {dataTipos.map((item) => (
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
                <CardTitle className="text-base font-bold">Histórico de Emissão</CardTitle>
                <CardDescription>Volume mensal de documentos</CardDescription>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataEmissoes}>
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
            <CardTitle className="text-base font-bold">Documentos Recentes</CardTitle>
            <CardDescription>Últimas emissões do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { ref: "MTR-2026-045", tipo: "MTR", data: "Hoje, 11:20", status: "success" },
                { ref: "CDF-2026-032", tipo: "CDF", data: "Hoje, 09:45", status: "success" },
                { ref: "LO-2026-012", tipo: "Licença", data: "Ontem, 15:30", status: "warning" },
                { ref: "NF-8829", tipo: "NF", data: "Ontem, 14:10", status: "success" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.ref}</p>
                      <p className="text-xs text-muted-foreground">{item.tipo}</p>
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
              <Link to="/dashboard/documentos/listagem">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Search className="h-5 w-5" />
                </div>
                Consultar Documentos
              </Link>
            </Button>
            
            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Plus className="h-5 w-5" />
              </div>
              Novo Documento
            </Button>
            
            <Button variant="outline" className="h-14 justify-start gap-4 px-4 text-base">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              Verificar Licenças
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelDocumentos;