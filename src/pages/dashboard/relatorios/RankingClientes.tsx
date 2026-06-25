import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Trophy, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const RankingClientes = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: rankingData = [] } = useQuery({
    queryKey: ["relatorio-ranking-clientes", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: pfs } = await supabase
        .from("pedido_fornecedores")
        .select("id, pedido_id, valor_total")
        .eq("locador_id", userId!);
      if (!pfs?.length) return [];
      const pfIds = pfs.map((p) => p.id);
      const pedidoIds = Array.from(new Set(pfs.map((p) => p.pedido_id)));
      const [{ data: ordens }, { data: pedidos }] = await Promise.all([
        supabase.from("ordens_locacao").select("status, pedido_fornecedor_id").in("pedido_fornecedor_id", pfIds),
        supabase.from("pedidos").select("id, locatario_id").in("id", pedidoIds),
      ]);
      const pedidoToUser = new Map((pedidos ?? []).map((p) => [p.id, p.locatario_id]));
      const userIds = Array.from(new Set((pedidos ?? []).map((p) => p.locatario_id)));
      const { data: profs } = userIds.length
        ? await supabase.from("profiles").select("id, nome").in("id", userIds)
        : { data: [] as { id: string; nome: string }[] };
      const userToName = new Map((profs ?? []).map((p) => [p.id, p.nome]));
      const pfToUser = new Map(pfs.map((pf) => [pf.id, pedidoToUser.get(pf.pedido_id)]));

      type Row = { cliente: string; faturamento: string; faturamentoNum: number; total: number; emAndamento: number; concluidas: number };
      const agg = new Map<string, Row>();
      pfs.forEach((pf) => {
        const uid = pfToUser.get(pf.id);
        if (!uid) return;
        const nome = userToName.get(uid) ?? "—";
        const r = agg.get(uid) ?? { cliente: nome, faturamento: "", faturamentoNum: 0, total: 0, emAndamento: 0, concluidas: 0 };
        r.faturamentoNum += Number(pf.valor_total ?? 0);
        agg.set(uid, r);
      });
      (ordens ?? []).forEach((o) => {
        const uid = pfToUser.get(o.pedido_fornecedor_id);
        if (!uid) return;
        const r = agg.get(uid);
        if (!r) return;
        r.total += 1;
        if (o.status === "finalizado") r.concluidas += 1;
        else if (["pendente", "aceito", "em_entrega", "ativo"].includes(o.status)) r.emAndamento += 1;
      });
      return Array.from(agg.values())
        .map((r) => ({ ...r, faturamento: brl(r.faturamentoNum) }))
        .sort((a, b) => b.faturamentoNum - a.faturamentoNum);
    },
  });

  const topCliente = rankingData[0]?.cliente ?? "—";
  const clientesAtivos = rankingData.length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Ranking de Clientes</h1>
        <p className="text-sm text-white/75">Os clientes que mais geram valor para o seu negócio</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Top Faturamento</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-950">{topCliente}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Crescimento Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesAtivos}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Ranking Detalhado"
        data={rankingData}
        columns={[
          { header: "Cliente", accessor: "cliente", className: "font-medium" },
          { header: "Total Faturado", accessor: "faturamento" },
          { header: "Total Locações", accessor: "total" },
          { header: "Em Andamento", accessor: "emAndamento" },
          { header: "Concluídas", accessor: "concluidas" },
        ]}
        pagination={{
          totalItems: rankingData.length,
          pageSize: 10,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default RankingClientes;