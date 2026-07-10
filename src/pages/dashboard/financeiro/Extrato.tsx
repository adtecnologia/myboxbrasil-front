import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Download, Inbox, Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Extrato = () => {
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const saldoDisponivel = 0;
  const totalRecebidoMes = 0;
  const totalSacadoMes = 0;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Extrato" subtitle="Histórico completo de entradas e saídas da sua conta">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/70 mr-1" />
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[130px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[100px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="bg-white/15 text-white border-white/20 backdrop-blur-md gap-2 ml-1" disabled>
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg p-2 bg-emerald-500/10 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Saldo Disponível</p>
              <p className="text-lg font-bold text-foreground">{brl(saldoDisponivel)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg p-2 bg-blue-500/10 text-blue-600">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Recebido no Mês</p>
              <p className="text-lg font-bold text-foreground">{brl(totalRecebidoMes)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg p-2 bg-rose-500/10 text-rose-600">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Sacado no Mês</p>
              <p className="text-lg font-bold text-foreground">{brl(totalSacadoMes)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-10">
          <div className="flex flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <div className="rounded-full bg-muted/40 p-3">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">Nenhuma movimentação registrada</p>
            <p className="text-xs max-w-md">
              As entradas do saldo disponível e os saques realizados aparecerão aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Extrato;