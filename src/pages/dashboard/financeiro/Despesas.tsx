import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingDown, ArrowDownCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const shortMonths = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const isVista = (f?: string | null) => f === "pix" || f === "cartao_credito" || f === "cartao_debito";
const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const Despesas = () => {
  const now = new Date();
  const [mes, setMes] = useState<number>(now.getMonth() + 1);
  const [ano, setAno] = useState<number>(now.getFullYear());
  const [faturas, setFaturas] = useState<Array<{ valor: number; forma: string | null; ref: Date }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("faturas")
        .select("valor_total, forma_pagamento, vencimento, paga_em, created_at");
      const rows = (data ?? []).map((f: any) => {
        const refStr = f.paga_em || f.vencimento || f.created_at;
        return {
          valor: Number(f.valor_total) || 0,
          forma: f.forma_pagamento as string | null,
          ref: new Date(refStr),
        };
      });
      setFaturas(rows);
      setLoading(false);
    };
    load();
  }, []);

  const { totalMes, totalMesAnterior, mediaMensal, totalAno, deltaPct, dataMensal, dataTipoPagamento } = useMemo(() => {
    const doAno = faturas.filter((f) => f.ref.getFullYear() === ano);
    const totalAno = doAno.reduce((s, f) => s + f.valor, 0);

    const porMes: Record<number, { faturado: number; vista: number }> = {};
    for (let m = 0; m < 12; m++) porMes[m] = { faturado: 0, vista: 0 };
    doAno.forEach((f) => {
      const m = f.ref.getMonth();
      if (isVista(f.forma)) porMes[m].vista += f.valor;
      else porMes[m].faturado += f.valor;
    });
    const dataMensal = shortMonths.map((name, i) => ({
      name,
      faturado: porMes[i].faturado,
      vista: porMes[i].vista,
    }));

    const mesIdx = mes - 1;
    const totalMes = porMes[mesIdx].faturado + porMes[mesIdx].vista;
    const totalMesAnterior =
      mesIdx > 0
        ? porMes[mesIdx - 1].faturado + porMes[mesIdx - 1].vista
        : faturas
            .filter((f) => f.ref.getFullYear() === ano - 1 && f.ref.getMonth() === 11)
            .reduce((s, f) => s + f.valor, 0);
    const deltaPct = totalMesAnterior > 0 ? ((totalMes - totalMesAnterior) / totalMesAnterior) * 100 : 0;

    const mesesComGasto = dataMensal.filter((d) => d.faturado + d.vista > 0).length || 1;
    const mediaMensal = totalAno / mesesComGasto;

    const totalFat = doAno.filter((f) => !isVista(f.forma)).reduce((s, f) => s + f.valor, 0);
    const totalVista = doAno.filter((f) => isVista(f.forma)).reduce((s, f) => s + f.valor, 0);
    const dataTipoPagamento = [
      { name: "Boleto (Faturado)", value: totalFat, color: "hsl(var(--primary))" },
      { name: "À Vista (PIX/Cartão)", value: totalVista, color: "#f59e0b" },
    ];

    return { totalMes, totalMesAnterior, mediaMensal, totalAno, deltaPct, dataMensal, dataTipoPagamento };
  }, [faturas, mes, ano]);

  if (loading) {
    return <DashboardSkeleton title="Relatório de Despesas" subtitle="Acompanhe seus gastos com locações e serviços" statCount={3} />;
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Relatório de Despesas" subtitle="Acompanhe seus gastos com locações e serviços">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/70 mr-1" />
          <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
            <SelectTrigger className="w-[130px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
            <SelectTrigger className="w-[100px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2027">2027</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <ArrowDownCircle className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                {deltaPct >= 0 ? "+" : ""}{deltaPct.toFixed(0)}% vs mês ant.
              </span>
            </div>
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Total do Mês ({months[mes - 1]})</p>
            <p className="text-3xl font-bold mt-1">{brl(totalMes)}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Média Mensal</p>
            <p className="text-3xl font-bold mt-1 text-foreground">{brl(mediaMensal)}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total no Ano</p>
            <p className="text-3xl font-bold mt-1 text-foreground">{brl(totalAno)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Evolução de Gastos (Acordo vs À Vista)</CardTitle>
            <CardDescription>Comparativo mensal de modalidades de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataMensal}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} width={40} tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="faturado" name="Boleto (Faturado)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="vista" name="À Vista" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Acordo</CardTitle>
            <CardDescription>Total acumulado por tipo de negociação</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataTipoPagamento}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataTipoPagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Total']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Despesas;