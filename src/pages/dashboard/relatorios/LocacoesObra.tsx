import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "—";

const LocacoesObra = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState("");

  const { data: obraData = [] } = useQuery({
    queryKey: ["relatorio-locacoes-obra", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: obras } = await supabase
        .from("obras")
        .select("id, nome")
        .eq("user_id", userId!);
      if (!obras?.length) return [];
      const ids = obras.map((o) => o.id);
      const { data: ordens } = await supabase
        .from("ordens_locacao")
        .select("obra_id, status, created_at")
        .in("obra_id", ids);
      return obras.map((o) => {
        const items = (ordens ?? []).filter((x) => x.obra_id === o.id);
        const concluidas = items.filter((x) => x.status === "finalizado").length;
        const emAndamento = items.filter((x) =>
          ["pendente", "aceito", "em_entrega", "ativo"].includes(x.status),
        ).length;
        const datas = items
          .map((x) => new Date(x.created_at).getTime())
          .sort((a, b) => a - b);
        return {
          obra: o.nome,
          emAndamento,
          concluidas,
          primeira: datas.length ? fmt(new Date(datas[0]).toISOString()) : "—",
          ultima: datas.length
            ? fmt(new Date(datas[datas.length - 1]).toISOString())
            : "—",
        };
      });
    },
  });

  const filtered = useMemo(
    () =>
      obraData.filter((o) =>
        o.obra.toLowerCase().includes(search.toLowerCase()),
      ),
    [obraData, search],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Locação por Obra</h1>
        <p className="text-sm text-white/75">Monitoramento de ativos por canteiro de obras</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar obra..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="date" className="pl-9" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="date" className="pl-9" />
            </div>
            <Button className="w-full">Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        title="Dados por Obra"
        data={filtered}
        columns={[
          { header: "Obra", accessor: "obra", className: "font-medium" },
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

export default LocacoesObra;