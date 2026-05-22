import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ArrowUpCircle, History, Landmark, CreditCard, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MinhaConta = () => {
  const [amount, setAmount] = useState("");

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Insira um valor válido para saque");
      return;
    }
    toast.success(`Solicitação de saque de R$ ${amount} enviada com sucesso!`);
    setAmount("");
  };

  const withdrawHistory = [
    { id: 1, date: "10/05/2026", amount: 1500.00, status: "Concluído", bank: "Banco do Brasil (****1234)" },
    { id: 2, date: "25/04/2026", amount: 2200.00, status: "Concluído", bank: "Banco do Brasil (****1234)" },
    { id: 3, date: "05/04/2026", amount: 850.00, status: "Concluído", bank: "Itaú (****5678)" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Minha Conta" subtitle="Gerencie seu saldo e dados bancários" />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary rounded-full p-2 text-white">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-primary uppercase tracking-wider">Saldo Disponível</p>
            </div>
            <p className="text-3xl font-bold text-foreground">R$ 4.250,50</p>
            <p className="text-xs text-muted-foreground mt-1">Liberado para saque imediato</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-500 rounded-full p-2 text-white">
                <History className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Saldo Bloqueado</p>
            </div>
            <p className="text-3xl font-bold text-foreground">R$ 1.800,00</p>
            <p className="text-xs text-muted-foreground mt-1">Aguardando prazo de compensação</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" />
              Dados Bancários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Banco:</span>
              <span className="font-medium text-foreground">Banco do Brasil (001)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Agência:</span>
              <span className="font-medium text-foreground">1234-5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conta:</span>
              <span className="font-medium text-foreground">56789-0</span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-8">Editar Dados</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-primary" />
              Solicitar Saque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor do Saque (R$)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="0,00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Limite disponível: R$ 4.250,50</p>
              </div>
              <Button type="submit" className="w-full font-bold">Solicitar Transferência</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Histórico de Saques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-muted-foreground">{item.date} • {item.bank}</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MinhaConta;