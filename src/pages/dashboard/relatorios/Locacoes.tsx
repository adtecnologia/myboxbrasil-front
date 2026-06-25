import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

const Locacoes = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: ordens = [] } = useQuery({
    queryKey: ["relatorio-locacoes-locador", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: pfs } = await supabase
        .from("pedido_fornecedores")
        .select("id, pedido_id")
        .eq("locador_id", userId!);
      const pfIds = (pfs ?? []).map((p) => p.id);
      if (!pfIds.length) return [] as Array<{ id: string; status: string; created_at: string; obra: { nome: string | null; bairro: string | null } | null; pedido_fornecedor_id: string }>;
      const { data } = await supabase
        .from("ordens_locacao")
        .select("id, status, created_at, pedido_fornecedor_id, obra:obra_id(nome, bairro)")
        .in("pedido_fornecedor_id", pfIds);
      return (data ?? []) as Array<{ id: string; status: string; created_at: string; pedido_fornecedor_id: string; obra: { nome: string | null; bairro: string | null } | null }>;
    },
  });

  const pfPedido = useQuery({
    queryKey: ["relatorio-locacoes-locador-clientes", userId],
    enabled: !!userId && ordens.length > 0,
    queryFn: async () => {
      const pfIds = Array.from(new Set(ordens.map((o) => o.pedido_fornecedor_id)));
      const { data: pfs } = await supabase
        .from("pedido_fornecedores")
        .select("id, pedido_id")
        .in("id", pfIds);
      const pedidoIds = Array.from(new Set((pfs ?? []).map((p) => p.pedido_id)));
      const { data: pedidos } = pedidoIds.length
        ? await supabase.from("pedidos").select("id, locatario_id").in("id", pedidoIds)
        : { data: [] as { id: string; locatario_id: string }[] };
      const userIds = Array.from(new Set((pedidos ?? []).map((p) => p.locatario_id)));
      const { data: profs } = userIds.length
        ? await supabase.from("profiles").select("id, nome").in("id", userIds)
        : { data: [] as { id: string; nome: string }[] };
      const pedidoToUser = new Map((pedidos ?? []).map((p) => [p.id, p.locatario_id]));
      const userToName = new Map((profs ?? []).map((p) => [p.id, p.nome]));
      const pfToCliente = new Map<string, string>();
      (pfs ?? []).forEach((pf) => {
        const uid = pedidoToUser.get(pf.pedido_id);
        pfToCliente.set(pf.id, uid ? userToName.get(uid) ?? "—" : "—");
      });
      return pfToCliente;
    },
  });

  const counts = useMemo(() => {
    const emAndamento = ordens.filter((o) => ["pendente", "aceito", "em_entrega", "ativo"].includes(o.status)).length;
    const concluidas = ordens.filter((o) => o.status === "finalizado").length;
    const atrasadas = 0;
    return { emAndamento, concluidas, atrasadas };
  }, [ordens]);

  const statusData = [
    { name: "Em andamento", value: counts.emAndamento, color: "#3b82f6" },
    { name: "Concluídas", value: counts.concluidas, color: "#10b981" },
    { name: "Atrasadas", value: counts.atrasadas, color: "#ef4444" },
  ];

  const locacoesData = ordens.map((o) => ({
    id: o.id,
    cliente: pfPedido.data?.get(o.pedido_fornecedor_id) ?? "—",
    data: new Date(o.created_at).toLocaleDateString("pt-BR"),
    status: o.status === "finalizado" ? "Concluída" : o.status === "cancelado" || o.status === "recusado" ? "Cancelada" : "Em andamento",
    obra: o.obra?.nome ?? "—",
    bairro: o.obra?.bairro ?? "—",
  }));

  const volumeMensal = useMemo(() => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const buckets = Array.from({ length: 3 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
      return { mes: meses[d.getMonth()], key: `${d.getFullYear()}-${d.getMonth()}`, total: 0 };
    });
    ordens.forEach((o) => {
      const d = new Date(o.created_at);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const b = buckets.find((x) => x.key === k);
      if (b) b.total += 1;
    });
    return buckets;
  }, [ordens]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Relatório de Locações</h1>
        <p className="text-sm text-white/75">Visão geral de todas as locações do sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.emAndamento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.concluidas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.atrasadas}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Volume Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeMensal}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Listagem Detalhada"
        data={locacoesData}
        columns={[
          { header: "Cliente", accessor: "cliente" },
          { header: "Obra", accessor: "obra" },
          { header: "Bairro", accessor: "bairro" },
          { header: "Data", accessor: "data" },
          { 
            header: "Status", 
            accessor: (item) => (
              <Badge variant={
                item.status === "Concluída" ? "secondary" : 
                item.status === "Atrasada" ? "destructive" : 
                "default"
              }>
                {String(item.status)}
              </Badge>
            )
          },
        ]}
        pagination={{
          totalItems: locacoesData.length,
          pageSize: 10,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default Locacoes;