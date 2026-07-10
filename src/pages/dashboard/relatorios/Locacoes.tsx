import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

const Locacoes = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: ordens = [], isLoading } = useQuery({
    queryKey: ["relatorio-locacoes-locador", userId],
    enabled: !!userId,
    queryFn: async () => {
      // 1. Encontra caçambas do locador logado
      const { data: cacambas } = await supabase
        .from("cacambas")
        .select("id")
        .eq("locador_id", userId!);
      const cacambaIds = (cacambas ?? []).map((c) => c.id);
      if (!cacambaIds.length) return [];

      // 2. Unidades dessas caçambas
      const { data: unidades } = await supabase
        .from("cacamba_unidades")
        .select("id")
        .in("cacamba_id", cacambaIds);
      const unidadeIds = (unidades ?? []).map((u) => u.id);
      if (!unidadeIds.length) return [];

      // 3. Ordens de locação (unidades) efetivamente alocadas
      const { data: olus } = await supabase
        .from("ordem_locacao_unidades")
        .select("id, status, created_at, ordem_locacao_id")
        .in("cacamba_unidade_id", unidadeIds);
      if (!olus?.length) return [];

      // 4. Enriquecer com ordem_locacao → obra
      const ordemIds = Array.from(new Set(olus.map((o) => o.ordem_locacao_id)));
      const { data: ordensLoc } = await supabase
        .from("ordens_locacao")
        .select("id, pedido_fornecedor_id, obra:obra_id(nome, bairro)")
        .in("id", ordemIds);
      const ordemMap = new Map((ordensLoc ?? []).map((o: any) => [o.id, o]));

      return olus.map((u: any) => {
        const ordem: any = ordemMap.get(u.ordem_locacao_id);
        return {
          id: u.id,
          status: u.status as string,
          created_at: u.created_at as string,
          pedido_fornecedor_id: ordem?.pedido_fornecedor_id as string,
          obra: ordem?.obra ?? null,
        };
      });
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
    const emAndamentoStatuses = [
      "entrega_pendente",
      "em_transito_locacao",
      "locada",
      "aguardando_retirada",
      "em_transito_retirada",
    ];
    const concluidasStatuses = ["em_transito_destino_final", "aguardando_analise", "cdf_emitido"];
    const emAndamento = ordens.filter((o) => emAndamentoStatuses.includes(o.status)).length;
    const concluidas = ordens.filter((o) => concluidasStatuses.includes(o.status)).length;
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
    status:
      o.status === "cdf_emitido"
        ? "Concluída"
        : o.status === "cancelada"
          ? "Cancelada"
          : "Em andamento",
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

      {isLoading ? (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
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
        </>
      )}

      <DataTable
        loading={isLoading}
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