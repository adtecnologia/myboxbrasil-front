import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ArrowUpCircle, History, Landmark } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type BancoData = {
  banco_codigo: string | null;
  banco_nome: string | null;
  banco_agencia: string | null;
  banco_conta: string | null;
  banco_tipo_conta: string | null;
};

const MinhaConta = () => {
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore(
    (s) => s.activeProfile() ?? s.user?.profiles[0] ?? null
  );
  const rawTenant = activeProfile?.tenantId;
  const locadorId = rawTenant && rawTenant !== "self" ? rawTenant : user?.id;
  const qc = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [amount, setAmount] = useState("");

  // Faturas do locador → saldo bloqueado
  const { data: saldoBloqueado = 0, isLoading: loadingSaldo } = useQuery({
    queryKey: ["minha-conta-saldo", locadorId],
    enabled: !!locadorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faturas")
        .select("valor_total")
        .eq("locador_id", locadorId!);
      if (error) throw error;
      return (data ?? []).reduce(
        (acc, f: any) => acc + (Number(f.valor_total) || 0),
        0
      );
    },
  });

  // Dados bancários do perfil
  const { data: banco, isLoading: loadingBanco } = useQuery({
    queryKey: ["minha-conta-banco", locadorId],
    enabled: !!locadorId,
    queryFn: async (): Promise<BancoData> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("banco_codigo, banco_nome, banco_agencia, banco_conta, banco_tipo_conta")
        .eq("id", locadorId!)
        .maybeSingle();
      if (error) throw error;
      return (
        (data as BancoData) ?? {
          banco_codigo: null,
          banco_nome: null,
          banco_agencia: null,
          banco_conta: null,
          banco_tipo_conta: null,
        }
      );
    },
  });

  const [form, setForm] = useState<BancoData>({
    banco_codigo: "",
    banco_nome: "",
    banco_agencia: "",
    banco_conta: "",
    banco_tipo_conta: "corrente",
  });

  useEffect(() => {
    if (banco && editOpen) {
      setForm({
        banco_codigo: banco.banco_codigo ?? "",
        banco_nome: banco.banco_nome ?? "",
        banco_agencia: banco.banco_agencia ?? "",
        banco_conta: banco.banco_conta ?? "",
        banco_tipo_conta: banco.banco_tipo_conta ?? "corrente",
      });
    }
  }, [banco, editOpen]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!locadorId) throw new Error("Usuário não identificado");
      const { error } = await supabase
        .from("profiles")
        .update({
          banco_codigo: form.banco_codigo || null,
          banco_nome: form.banco_nome || null,
          banco_agencia: form.banco_agencia || null,
          banco_conta: form.banco_conta || null,
          banco_tipo_conta: form.banco_tipo_conta || null,
        })
        .eq("id", locadorId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dados bancários atualizados");
      qc.invalidateQueries({ queryKey: ["minha-conta-banco", locadorId] });
      setEditOpen(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Nenhum saldo disponível para saque no momento.");
    setAmount("");
  };

  const bancoPreenchido = !!(banco?.banco_nome || banco?.banco_agencia || banco?.banco_conta);

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
            <p className="text-3xl font-bold text-foreground">{brl(0)}</p>
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
            {loadingSaldo ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{brl(saldoBloqueado)}</p>
            )}
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
            {loadingBanco ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : bancoPreenchido ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Banco:</span>
                  <span className="font-medium text-foreground truncate ml-2">
                    {banco?.banco_nome ?? "—"}
                    {banco?.banco_codigo ? ` (${banco.banco_codigo})` : ""}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agência:</span>
                  <span className="font-medium text-foreground">{banco?.banco_agencia || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conta:</span>
                  <span className="font-medium text-foreground">{banco?.banco_conta || "—"}</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                Nenhum dado bancário cadastrado.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 text-xs h-8"
              onClick={() => setEditOpen(true)}
            >
              {bancoPreenchido ? "Editar Dados" : "Cadastrar Dados"}
            </Button>
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
                  disabled
                />
                <p className="text-[10px] text-muted-foreground">Limite disponível: {brl(0)}</p>
              </div>
              <Button type="submit" className="w-full font-bold" disabled>
                Solicitar Transferência
              </Button>
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
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nenhum saque realizado até o momento.
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dados Bancários</DialogTitle>
            <DialogDescription>
              Informe a conta onde deseja receber os repasses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-1">
                <Label htmlFor="banco_codigo">Código</Label>
                <Input
                  id="banco_codigo"
                  placeholder="001"
                  value={form.banco_codigo ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, banco_codigo: e.target.value }))}
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label htmlFor="banco_nome">Banco</Label>
                <Input
                  id="banco_nome"
                  placeholder="Banco do Brasil"
                  value={form.banco_nome ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, banco_nome: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="banco_agencia">Agência</Label>
                <Input
                  id="banco_agencia"
                  placeholder="1234-5"
                  value={form.banco_agencia ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, banco_agencia: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="banco_conta">Conta</Label>
                <Input
                  id="banco_conta"
                  placeholder="56789-0"
                  value={form.banco_conta ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, banco_conta: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Tipo de Conta</Label>
              <Select
                value={form.banco_tipo_conta ?? "corrente"}
                onValueChange={(v) => setForm((f) => ({ ...f, banco_tipo_conta: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Conta Poupança</SelectItem>
                  <SelectItem value="pagamento">Conta Pagamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
              {saveMut.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinhaConta;