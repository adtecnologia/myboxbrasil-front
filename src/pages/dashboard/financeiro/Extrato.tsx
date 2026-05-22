import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, Search, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const Extrato = () => {
  const extrato = [
    { id: 1, descricao: "Recebimento - Construtora Rocha", data: "15/05/2026", valor: 450.00, tipo: "entrada" },
    { id: 2, descricao: "Saque - Transferência Bancária", data: "10/05/2026", valor: -1500.00, tipo: "saida" },
    { id: 3, descricao: "Recebimento - Engenharia Silva", data: "08/05/2026", valor: 1200.00, tipo: "entrada" },
    { id: 4, descricao: "Tarifa de Intermediação - Pedido #1234", data: "08/05/2026", valor: -24.50, tipo: "saida" },
    { id: 5, descricao: "Recebimento - Maria Oliveira", data: "05/05/2026", valor: 380.00, tipo: "entrada" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Extrato" subtitle="Histórico completo de entradas e saídas da sua conta">
        <Button variant="outline" size="sm" className="bg-white/15 text-white border-white/20 backdrop-blur-md gap-2">
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 bg-card rounded-lg border p-4 flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saldo Atual</p>
          <p className="text-2xl font-bold text-foreground">R$ 4.250,50</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs">
            <Calendar className="h-4 w-4" /> Maio / 2026
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y">
            {extrato.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${
                    item.tipo === "entrada" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                  }`}>
                    {item.tipo === "entrada" ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.descricao}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.data}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${
                  item.tipo === "entrada" ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {item.tipo === "entrada" ? "+" : ""} R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).replace('-', '')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Extrato;