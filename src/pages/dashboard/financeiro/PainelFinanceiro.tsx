import { useMemo } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const dataReceitaMock = [
  { name: "Jan", receita: 45000, despesa: 32000 },
  { name: "Fev", receita: 52000, despesa: 34000 },
  { name: "Mar", receita: 48000, despesa: 31000 },
  { name: "Abr", receita: 61000, despesa: 38000 },
  { name: "Mai", receita: 55000, despesa: 35000 },
  { name: "Jun", receita: 67000, despesa: 41000 },
];

const dataDistribuicaoMock = [
  { name: "Locações", value: 65, color: "#10b981" },
  { name: "Serviços", value: 20, color: "#3b82f6" },
  { name: "Outros", value: 15, color: "#f59e0b" },
];

const transacoesRecentesMock = [
  { id: "TRX-001", cliente: "Construtora Alfa", valor: 1250.00, data: "22/05/2026", status: "Pago", tipo: "Receita" },
  { id: "TRX-002", fornecedor: "Posto Shell", valor: -850.40, data: "21/05/2026", status: "Pago", tipo: "Despesa" },
  { id: "TRX-003", cliente: "João da Silva", valor: 450.00, data: "21/05/2026", status: "Pendente", tipo: "Receita" },
  { id: "TRX-004", fornecedor: "Manutenção Preventiva", valor: -1200.00, data: "20/05/2026", status: "Pago", tipo: "Despesa" },
];

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function useFinanceiroLocador(locadorId: string | undefined) {
  return useQuery({
    queryKey: ["painel-financeiro-locador", locadorId],
    enabled: !!locadorId,
    queryFn: async () => {
      const { data: faturas, error } = await supabase
        .from("faturas")
        .select("id, valor_total, status, paga_em, vencimento, created_at, locatario_id, pedido_id")
        .eq("locador_id", locadorId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = faturas ?? [];

      const locatarioIds = Array.from(new Set(rows.map((r) => r.locatario_id).filter(Boolean)));
      const nomes = new Map<string, string>();
      if (locatarioIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nome")
          .in("id", locatarioIds as string[]);
        (profs ?? []).forEach((p: any) => nomes.set(p.id, p.nome));
      }

      const now = new Date();
      const mesAtual = now.getMonth();
      const anoAtual = now.getFullYear();

      let saldoTotal = 0;
      let receitaMes = 0;
      let receitaMesAnterior = 0;
      let vencidas = 0;
      const fluxoMap = new Map<string, number>();
      // últimos 6 meses (incluindo atual)
      for (let i = 5; i >= 0; i--) {
        const d = new Date(anoAtual, mesAtual - i, 1);
        fluxoMap.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
      }

      for (const f of rows) {
        const v = Number(f.valor_total) || 0;
        if (f.status === "paga") {
          saldoTotal += v;
          const dt = f.paga_em ? new Date(f.paga_em) : null;
          if (dt) {
            const key = `${dt.getFullYear()}-${dt.getMonth()}`;
            if (fluxoMap.has(key)) fluxoMap.set(key, (fluxoMap.get(key) || 0) + v);
            if (dt.getMonth() === mesAtual && dt.getFullYear() === anoAtual) receitaMes += v;
            const prev = new Date(anoAtual, mesAtual - 1, 1);
            if (dt.getMonth() === prev.getMonth() && dt.getFullYear() === prev.getFullYear())
              receitaMesAnterior += v;
          }
        }
        if (f.status === "vencida") vencidas += 1;
      }

      const fluxo = Array.from(fluxoMap.entries()).map(([k, receita]) => {
        const [y, m] = k.split("-").map(Number);
        return { name: MESES[m], ano: y, receita, despesa: 0 };
      });

      const inadimplencia = rows.length ? (vencidas / rows.length) * 100 : 0;
      const variacao =
        receitaMesAnterior > 0
          ? ((receitaMes - receitaMesAnterior) / receitaMesAnterior) * 100
          : receitaMes > 0
          ? 100
          : 0;

      // Distribuição por status
      const porStatus = { paga: 0, pendente: 0, vencida: 0 } as Record<string, number>;
      for (const f of rows) {
        const v = Number(f.valor_total) || 0;
        if (f.status in porStatus) porStatus[f.status] += v;
      }
      const totalDist = porStatus.paga + porStatus.pendente + porStatus.vencida;
      const distribuicao = totalDist > 0
        ? [
            { name: "Recebido", value: Math.round((porStatus.paga / totalDist) * 100), color: "#10b981" },
            { name: "A Receber", value: Math.round((porStatus.pendente / totalDist) * 100), color: "#3b82f6" },
            { name: "Vencidas", value: Math.round((porStatus.vencida / totalDist) * 100), color: "#f59e0b" },
          ].filter((d) => d.value > 0)
        : [];

      const transacoes = rows.slice(0, 8).map((f, idx) => ({
        id: `FAT-${String(idx + 1).padStart(3, "0")}`,
        cliente: (f.locatario_id && nomes.get(f.locatario_id)) || "Cliente",
        fornecedor: undefined as string | undefined,
        valor: Number(f.valor_total) || 0,
        data: new Date(f.paga_em || f.vencimento || f.created_at).toLocaleDateString("pt-BR"),
        status: f.status === "paga" ? "Pago" : f.status === "vencida" ? "Vencida" : "Pendente",
        tipo: "Receita" as string,
      }));

      return {
        saldoTotal,
        receitaMes,
        variacao,
        inadimplencia,
        fluxo,
        distribuicao,
        transacoes,
        total: rows.length,
      };
    },
  });
}

const PainelFinanceiro = () => {
  const profileType = useAuthStore((state) => state.activeProfileType());
  const isLocador = profileType === "locador";
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore(
    (s) => s.activeProfile() ?? s.user?.profiles[0] ?? null
  );
  const rawTenant = activeProfile?.tenantId;
  const locadorId = rawTenant && rawTenant !== "self" ? rawTenant : user?.id;

  const { data: real, isLoading } = useFinanceiroLocador(isLocador ? locadorId : undefined);

  const dataReceita = isLocador && real ? real.fluxo : dataReceitaMock;
  const dataDistribuicao = isLocador && real && real.distribuicao.length
    ? real.distribuicao
    : dataDistribuicaoMock;
  const transacoesRecentes: any[] = isLocador && real ? real.transacoes : transacoesRecentesMock;

  const saldoTotal = isLocador && real ? real.saldoTotal : 124530;
  const receitaMensal = isLocador && real ? real.receitaMes : 67400;
  const variacao = isLocador && real ? real.variacao : 12;
  const inadimplencia = isLocador && real ? real.inadimplencia : 4.5;

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
                {isLocador && isLoading ? (
                  <Skeleton className="h-7 w-32 mt-1 bg-white/20" />
                ) : (
                  <h3 className="text-2xl font-bold mt-1 text-white">{brl(saldoTotal)}</h3>
                )}
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-white/90">
              {variacao >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span className="font-bold">{variacao >= 0 ? "+" : ""}{variacao.toFixed(1)}%</span>
              <span className="opacity-80">em relação ao mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Mensal</p>
                {isLocador && isLoading ? (
                  <Skeleton className="h-7 w-32 mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold mt-1 text-emerald-600">{brl(receitaMensal)}</h3>
                )}
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <span className="text-muted-foreground text-[10px]">Faturas pagas neste mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Despesas</p>
                {isLocador ? (
                  <h3 className="text-2xl font-bold mt-1 text-red-500">{brl(0)}</h3>
                ) : (
                  <h3 className="text-2xl font-bold mt-1 text-red-500">R$ 41.200,00</h3>
                )}
              </div>
              <div className="bg-red-50 p-3 rounded-xl text-red-600">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <span className="text-muted-foreground text-[10px]">
                {isLocador ? "Sem despesas registradas" : "8% acima do esperado"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inadimplência</p>
                {isLocador && isLoading ? (
                  <Skeleton className="h-7 w-20 mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold mt-1 text-amber-600">{inadimplencia.toFixed(1)}%</h3>
                )}
              </div>
              <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <span className="text-muted-foreground text-[10px]">
                {isLocador ? "% de faturas vencidas" : "-1.2% queda este mês"}
              </span>
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
