import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

const PALETTE = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#6366f1"];

interface ClasseAgg {
  name: string;
  valor: number; // toneladas
  volume: number; // m³
  color: string;
}

const ClasseResiduos = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const profileType = useAuthStore((s) => s.activeProfileType());

  const { data: classeData = [], isLoading } = useQuery<ClasseAgg[]>({
    queryKey: ["relatorio-classe-residuos", userId, profileType],
    enabled: !!userId,
    queryFn: async () => {
      // 1) Escopo por perfil -> pedido_fornecedores
      let pfs: { id: string }[] = [];
      if (profileType === "prefeitura") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("cidade, estado")
          .eq("id", userId!)
          .maybeSingle();
        if (!profile?.cidade || !profile?.estado) return [];
        const { data: obras } = await supabase
          .from("obras")
          .select("id")
          .ilike("cidade", profile.cidade)
          .ilike("estado", profile.estado);
        const obraIds = (obras ?? []).map((o) => o.id);
        if (!obraIds.length) return [];
        const { data: ords } = await supabase
          .from("ordens_locacao")
          .select("pedido_fornecedor_id")
          .in("obra_id", obraIds);
        const pfIds = Array.from(
          new Set((ords ?? []).map((o) => o.pedido_fornecedor_id).filter((i): i is string => Boolean(i))),
        );
        pfs = pfIds.map((id) => ({ id }));
      } else if (profileType === "locador") {
        const { data } = await supabase
          .from("pedido_fornecedores")
          .select("id")
          .eq("locador_id", userId!);
        pfs = data ?? [];
      } else {
        const { data: pedidos } = await supabase
          .from("pedidos")
          .select("id")
          .eq("locatario_id", userId!);
        const pedidoIds = (pedidos ?? []).map((p) => p.id);
        if (!pedidoIds.length) return [];
        const { data } = await supabase
          .from("pedido_fornecedores")
          .select("id")
          .in("pedido_id", pedidoIds);
        pfs = data ?? [];
      }
      const pfIds = pfs.map((p) => p.id);
      if (!pfIds.length) return [];

      // 2) Ordens -> unidades
      const { data: ordens } = await supabase
        .from("ordens_locacao")
        .select("id, unidades:ordem_locacao_unidades(id, peso_kg, volume_m3, cacamba_unidade:cacamba_unidade_id(cacamba:cacamba_id(id)))")
        .in("pedido_fornecedor_id", pfIds);
      const ordensRows = (ordens ?? []) as any[];
      const oluIds: string[] = [];
      const cacambaIds = new Set<string>();
      const oluMeta = new Map<string, { peso_kg: number | null; volume_m3: number | null; cacamba_id: string | null }>();
      for (const o of ordensRows) {
        for (const u of o.unidades ?? []) {
          if (!u?.id) continue;
          oluIds.push(u.id);
          const cid = u?.cacamba_unidade?.cacamba?.id ?? null;
          if (cid) cacambaIds.add(cid);
          oluMeta.set(u.id, { peso_kg: u.peso_kg ?? null, volume_m3: u.volume_m3 ?? null, cacamba_id: cid });
        }
      }
      if (!oluIds.length) return [];

      // 3) Resíduos medidos por unidade
      const { data: medidos } = await supabase
        .from("ordem_locacao_unidade_residuos")
        .select("ordem_locacao_unidade_id, classe_nome, peso_kg, volume_m3")
        .in("ordem_locacao_unidade_id", oluIds);
      const medidosByOlu = new Map<string, { nome: string; peso_kg: number | null; volume_m3: number | null }[]>();
      for (const r of medidos ?? []) {
        const arr = medidosByOlu.get(r.ordem_locacao_unidade_id) ?? [];
        arr.push({ nome: r.classe_nome, peso_kg: r.peso_kg, volume_m3: r.volume_m3 });
        medidosByOlu.set(r.ordem_locacao_unidade_id, arr);
      }

      // 4) Fallback: classes cadastradas na caçamba
      const { data: cacambaResiduos } = cacambaIds.size
        ? await supabase
            .from("cacamba_residuos")
            .select("cacamba_id, classe")
            .in("cacamba_id", Array.from(cacambaIds))
        : { data: [] as { cacamba_id: string; classe: string }[] };
      const classeIds = Array.from(new Set((cacambaResiduos ?? []).map((r) => r.classe).filter(Boolean)));
      const { data: classes } = classeIds.length
        ? await supabase.from("classes_residuo").select("id, nome").in("id", classeIds)
        : { data: [] as { id: string; nome: string }[] };
      const classeNomeById = new Map((classes ?? []).map((c) => [c.id, c.nome]));
      const cacambaClasses = new Map<string, string[]>();
      for (const r of cacambaResiduos ?? []) {
        const arr = cacambaClasses.get(r.cacamba_id) ?? [];
        arr.push(classeNomeById.get(r.classe) ?? r.classe);
        cacambaClasses.set(r.cacamba_id, arr);
      }

      // 5) Agregar por classe
      const agg = new Map<string, { peso: number; volume: number }>();
      const add = (nome: string, peso: number, volume: number) => {
        const cur = agg.get(nome) ?? { peso: 0, volume: 0 };
        cur.peso += peso;
        cur.volume += volume;
        agg.set(nome, cur);
      };
      for (const [oluId, meta] of oluMeta) {
        const medRows = medidosByOlu.get(oluId) ?? [];
        if (medRows.length > 0) {
          for (const r of medRows) {
            add(r.nome, Number(r.peso_kg ?? 0), Number(r.volume_m3 ?? 0));
          }
          continue;
        }
        const nomes = meta.cacamba_id ? cacambaClasses.get(meta.cacamba_id) ?? [] : [];
        if (!nomes.length) continue;
        const pesoShare = Number(meta.peso_kg ?? 0) / nomes.length;
        const volShare = Number(meta.volume_m3 ?? 0) / nomes.length;
        for (const nome of nomes) add(nome, pesoShare, volShare);
      }

      const list: ClasseAgg[] = Array.from(agg.entries())
        .map(([name, v], idx) => ({
          name,
          valor: +(v.peso / 1000).toFixed(2),
          volume: +v.volume.toFixed(2),
          color: PALETTE[idx % PALETTE.length],
        }))
        .sort((a, b) => (b.valor || b.volume) - (a.valor || a.volume));
      return list;
    },
  });

  const total = useMemo(() => classeData.reduce((s, c) => s + c.valor, 0), [classeData]);
  const totalVolume = useMemo(() => classeData.reduce((s, c) => s + c.volume, 0), [classeData]);
  const useVolume = total === 0 && totalVolume > 0;
  const totalRef = useVolume ? totalVolume : total;
  const unit = useVolume ? "m³" : "t";

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold italic">Classe de Resíduos</h1>
        <p className="text-sm text-white/75">KPI e volumetria por classe de resíduo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Distribuição por Classe ({useVolume ? "m³" : "Toneladas"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Carregando...
                </div>
              ) : classeData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Sem dados
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classeData.map((c) => ({ ...c, valor: useVolume ? c.volume : c.valor }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                    {classeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Resumo Mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classeData.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
            {classeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{useVolume ? item.volume : item.valor}{unit}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {totalRef > 0
                      ? `${(((useVolume ? item.volume : item.valor) / totalRef) * 100).toFixed(1)}% do total`
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Total Geral</span>
                <span className="text-sm font-bold">{totalRef.toFixed(useVolume ? 2 : 2)}{unit}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Detalhamento por Classe"
        data={classeData}
        loading={isLoading}
        columns={[
          { header: "Classe", accessor: "name", className: "font-medium" },
          { header: `Total (${unit})`, accessor: (d) => `${useVolume ? d.volume : d.valor} ${unit}` },
          {
            header: "Percentual",
            accessor: (d) =>
              totalRef > 0
                ? `${(((useVolume ? d.volume : d.valor) / totalRef) * 100).toFixed(1)}%`
                : "—",
          },
        ]}
        pagination={{
          totalItems: classeData.length,
          pageSize: 10,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default ClasseResiduos;
