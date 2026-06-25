import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

const fmt = (t: number) => new Date(t).toLocaleDateString("pt-BR");

const LocacoesBairro = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState("");

  const { data: bairroData = [] } = useQuery({
    queryKey: ["relatorio-locacoes-bairro", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: pfs } = await supabase
        .from("pedido_fornecedores")
        .select("id")
        .eq("locador_id", userId!);
      const pfIds = (pfs ?? []).map((p) => p.id);
      if (!pfIds.length) return [];
      const { data: ordens } = await supabase
        .from("ordens_locacao")
        .select("status, created_at, obra:obra_id(bairro)")
        .in("pedido_fornecedor_id", pfIds);
      const map = new Map<string, { bairro: string; emAndamento: number; concluidas: number; datas: number[] }>();
      (ordens ?? []).forEach((o) => {
        const bairro = (o.obra as { bairro?: string } | null)?.bairro || "—";
        const entry = map.get(bairro) ?? { bairro, emAndamento: 0, concluidas: 0, datas: [] };
        if (o.status === "finalizado") entry.concluidas += 1;
        else if (["pendente", "aceito", "em_entrega", "ativo"].includes(o.status)) entry.emAndamento += 1;
        entry.datas.push(new Date(o.created_at).getTime());
        map.set(bairro, entry);
      });
      return Array.from(map.values()).map((e) => {
        const sorted = e.datas.sort((a, b) => a - b);
        return {
          bairro: e.bairro,
          emAndamento: e.emAndamento,
          concluidas: e.concluidas,
          primeira: sorted.length ? fmt(sorted[0]) : "—",
          ultima: sorted.length ? fmt(sorted[sorted.length - 1]) : "—",
        };
      });
    },
  });

  const filtered = useMemo(
    () => bairroData.filter((b) => b.bairro.toLowerCase().includes(search.toLowerCase())),
    [bairroData, search],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Locação por Bairro</h1>
        <p className="text-sm text-white/75">Análise de desempenho e volume por localidade</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar bairro..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="date" className="pl-9" placeholder="Início" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="date" className="pl-9" placeholder="Fim" />
            </div>
            <Button className="w-full">Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        title="Dados por Bairro"
        data={filtered}
        columns={[
          { header: "Bairro", accessor: "bairro", className: "font-medium" },
          { header: "Em Andamento", accessor: "emAndamento" },
          { header: "Concluídas", accessor: "concluidas" },
          { header: "Primeira Locação", accessor: "primeira" },
          { header: "Última Locação", accessor: "ultima" },
        ]}
        pagination={{
          totalItems: filtered.length,
          pageSize: 10,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default LocacoesBairro;