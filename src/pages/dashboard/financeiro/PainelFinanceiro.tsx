import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Wallet,
  PieChart as PieChartIcon,
  Plus,
  FileText,
  CreditCard as CreditCardIcon,
  History
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

const dataReceita = [
  { name: "Jan", receita: 45000, despesa: 32000 },
  { name: "Fev", receita: 52000, despesa: 34000 },
  { name: "Mar", receita: 48000, despesa: 31000 },
  { name: "Abr", receita: 61000, despesa: 38000 },
  { name: "Mai", receita: 55000, despesa: 35000 },
  { name: "Jun", receita: 67000, despesa: 41000 },
];

const dataDistribuicao = [
  { name: "Locações", value: 65, color: "#10b981" },
  { name: "Serviços", value: 20, color: "#3b82f6" },
  { name: "Outros", value: 15, color: "#f59e0b" },
];

const transacoesRecentes = [
  { id: "TRX-001", cliente: "Construtora Alfa", valor: 1250.00, data: "22/05/2026", status: "Pago", tipo: "Receita" },
  { id: "TRX-002", fornecedor: "Posto Shell", valor: -850.40, data: "21/05/2026", status: "Pago", tipo: "Despesa" },
  { id: "TRX-003", cliente: "João da Silva", valor: 450.00, data: "21/05/2026", status: "Pendente", tipo: "Receita" },
  { id: "TRX-004", fornecedor: "Manutenção Preventiva", valor: -1200.00, data: "20/05/2026", status: "Pago", tipo: "Despesa" },
];

const PainelFinanceiro = () => {
  const profileType = useAuthStore((state) => state.activeProfileType());
  const isLocador = profileType === "locador";

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Painel Financeiro" 
        subtitle="Indicadores de saúde financeira e fluxo de caixa"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Saldo Total</p>
                <h3 className="text-2xl font-bold mt-1 text-white">R$ 124.530,00</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-white/90">
              <ArrowUpRight className="h-3 w-3" />
              <span className="font-bold">+12%</span>
              <span className="opacity-80">em relação ao mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Mensal</p>
                <h3 className="text-2xl font-bold mt-1 text-emerald-600">R$ 67.400,00</h3>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">Meta: 90%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Despesas</p>
                <h3 className="text-2xl font-bold mt-1 text-red-500">R$ 41.200,00</h3>
              </div>
              <div className="bg-red-50 p-3 rounded-xl text-red-600">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <span className="text-red-500 font-medium">8% acima</span>
              <span className="text-muted-foreground text-[10px]">do esperado</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inadimplência</p>
                <h3 className="text-2xl font-bold mt-1 text-amber-600">4.5%</h3>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <span className="text-emerald-500 font-medium">-1.2%</span>
              <span className="text-muted-foreground text-[10px]">queda este mês</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Fluxo de Caixa</CardTitle>
            <CardDescription>Comparativo entre receitas e despesas (6 meses)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataReceita}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                  <Tooltip 
                    formatter={(value) => `R$ ${Number(value).toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="receita" name="Receita" stroke="#10b981" fillOpacity={1} fill="url(#colorReceita)" strokeWidth={3} />
                  <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Origem da Receita</CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataDistribuicao}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataDistribuicao.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2 mt-4">
              {dataDistribuicao.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            title="Transações Recentes"
            data={transacoesRecentes}
            columns={[
              {
                header: "ID",
                accessor: "id",
                className: "font-mono text-[10px] text-muted-foreground"
              },
              {
                header: "Descrição",
                accessor: (t) => t.cliente || t.fornecedor || ""
              },
              {
                header: "Valor",
                accessor: (t) => (
                  <span className={t.tipo === "Receita" ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                    {t.tipo === "Receita" ? "+" : ""} R$ {Math.abs(t.valor).toLocaleString()}
                  </span>
                )
              },
              {
                header: "Data",
                accessor: (t) => (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3" />
                    {t.data}
                  </div>
                )
              },
              {
                header: "Status",
                accessor: (t) => (
                  <Badge variant="outline" className={t.status === "Pago" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}>
                    {t.status}
                  </Badge>
                )
              }
            ]}
            pagination={{
              totalItems: transacoesRecentes.length,
              pageSize: 5,
              currentPage: 1,
              onPageChange: () => {},
              onPageSizeChange: () => {},
            }}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-3">
            <Button 
              className="h-14 justify-start gap-4 px-4 text-base" 
              asChild
            >
              <Link to="/dashboard/financeiro/faturamento">
                <div className="bg-white/20 p-2 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                Novo Faturamento
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-14 justify-start gap-4 px-4 text-base"
              asChild
            >
              <Link to="/dashboard/financeiro/extrato">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <History className="h-5 w-5" />
                </div>
                Ver Extrato
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-14 justify-start gap-4 px-4 text-base"
              asChild
            >
              <Link to="/dashboard/financeiro/faturas">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <CreditCardIcon className="h-5 w-5" />
                </div>
                Gestão de Faturas
              </Link>
            </Button>

            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium">Conciliação Bancária</p>
                <p className="text-[10px] text-muted-foreground mt-1">Próxima rotina amanhã às 08h</p>
                <Button variant="link" size="sm" className="mt-1 h-auto p-0">Ver agenda</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelFinanceiro;
