import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Calendar, Printer, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/components/DataPagination";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import myboxLogo from "@/assets/mybox-logo.png";
import * as XLSX from "xlsx";

interface ColetaVencida {
  id: string;
  modelo: string;
  status: string;
  dataLocacao: string;
  dataVencimento: string;
  diasAtraso: number;
  diasLocada: number | null;
  transportador: string;
  locador: string;
  locatario: string;
  destinador: string;
  origem: string;
  destino: string;
  residuos: { nome: string; peso_kg: number | null; volume_m3: number | null }[];
}

const PRAZO_DIAS = 7;
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");

const STATUS_LABELS: Record<string, string> = {
  entrega_pendente: "Entrega pendente",
  em_transito_locacao: "Em trânsito p/ locação",
  locada: "Locada",
  aguardando_retirada: "Aguardando retirada",
  em_transito_retirada: "Em trânsito p/ retirada",
};

const VencimentoPrazo = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const userName = useAuthStore((s) => s.user?.name) ?? "—";
  const profileType = useAuthStore((s) => s.activeProfileType());
  const [search, setSearch] = useState("");

  const { data: rows = [], isLoading } = useQuery<ColetaVencida[]>({
    queryKey: ["relatorio-cacambas-vencidas", userId, profileType],
    enabled: !!userId,
    queryFn: async (): Promise<ColetaVencida[]> => {
      let pfs: { id: string; locador_id: string | null; pedido_id: string }[] = [];

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
        const pfIdsSet = Array.from(
          new Set((ords ?? []).map((o) => o.pedido_fornecedor_id).filter((id): id is string => Boolean(id))),
        );
        if (!pfIdsSet.length) return [];
        const { data } = await supabase
          .from("pedido_fornecedores")
          .select("id, locador_id, pedido_id")
          .in("id", pfIdsSet);
        pfs = (data ?? []) as typeof pfs;
      } else if (profileType === "locador") {
        const { data } = await supabase
          .from("pedido_fornecedores")
          .select("id, locador_id, pedido_id")
          .eq("locador_id", userId!);
        pfs = (data ?? []) as typeof pfs;
      } else {
        const { data: pedidos } = await supabase
          .from("pedidos")
          .select("id")
          .eq("locatario_id", userId!);
        const pedidoIds = (pedidos ?? []).map((p) => p.id);
        if (!pedidoIds.length) return [];
        const { data } = await supabase
          .from("pedido_fornecedores")
          .select("id, locador_id, pedido_id")
          .in("pedido_id", pedidoIds);
        pfs = (data ?? []) as typeof pfs;
      }

      const pfIds = pfs.map((p) => p.id);
      if (!pfIds.length) return [];

      const { data: ordens } = await supabase
        .from("ordens_locacao")
        .select(
          "id, created_at, equipment_type, pedido_fornecedor_id, obra:obra_id(rua, numero, bairro, cidade, estado), unidades:ordem_locacao_unidades(id, status, created_at, retirada_solicitada_em, destino_final_confirmado_em, destino_final_id, peso_kg, volume_m3, cacamba_unidade:cacamba_unidade_id(codigo, cacamba:cacamba_id(id, modelo)), rota_itens(tipo, rota_id))",
        )
        .in("pedido_fornecedor_id", pfIds);
      const ordensRows = (ordens ?? []) as any[];

      const modeloIds = new Set<string>();
      const cacambaIds = new Set<string>();
      for (const o of ordensRows) {
        for (const u of o.unidades ?? []) {
          const cid = u?.cacamba_unidade?.cacamba?.id;
          const mid = u?.cacamba_unidade?.cacamba?.modelo;
          if (cid) cacambaIds.add(cid);
          if (mid) modeloIds.add(mid);
        }
      }
      const { data: modelos } = modeloIds.size
        ? await supabase.from("modelos_cacamba").select("id, modelo").in("id", Array.from(modeloIds))
        : { data: [] as { id: string; modelo: string }[] };
      const modeloNomeById = new Map((modelos ?? []).map((m) => [m.id, m.modelo]));

      const oluIds: string[] = [];
      for (const o of ordensRows) {
        for (const u of o.unidades ?? []) {
          if (u?.id) oluIds.push(u.id);
        }
      }
      const { data: residuosData } = oluIds.length
        ? await supabase
            .from("ordem_locacao_unidade_residuos")
            .select("ordem_locacao_unidade_id, classe_nome, peso_kg, volume_m3")
            .in("ordem_locacao_unidade_id", oluIds)
        : { data: [] as { ordem_locacao_unidade_id: string; classe_nome: string; peso_kg: number | null; volume_m3: number | null }[] };
      const residuosByOlu = new Map<string, { nome: string; peso_kg: number | null; volume_m3: number | null }[]>();
      for (const r of residuosData ?? []) {
        const arr = residuosByOlu.get(r.ordem_locacao_unidade_id) ?? [];
        arr.push({ nome: r.classe_nome, peso_kg: r.peso_kg, volume_m3: r.volume_m3 });
        residuosByOlu.set(r.ordem_locacao_unidade_id, arr);
      }

      const { data: cacambaResiduos } = cacambaIds.size
        ? await supabase
            .from("cacamba_residuos")
            .select("cacamba_id, classe")
            .in("cacamba_id", Array.from(cacambaIds))
        : { data: [] as { cacamba_id: string; classe: string }[] };
      const classeIds = Array.from(new Set((cacambaResiduos ?? []).map((r) => r.classe).filter(Boolean)));
      const { data: classesResiduos } = classeIds.length
        ? await supabase.from("classes_residuo").select("id, nome").in("id", classeIds)
        : { data: [] as { id: string; nome: string }[] };
      const classeNomeById = new Map((classesResiduos ?? []).map((c) => [c.id, c.nome]));
      const residuosByCacamba = new Map<string, { nome: string }[]>();
      for (const r of cacambaResiduos ?? []) {
        const arr = residuosByCacamba.get(r.cacamba_id) ?? [];
        arr.push({ nome: classeNomeById.get(r.classe) ?? r.classe });
        residuosByCacamba.set(r.cacamba_id, arr);
      }

      const rotaIdsSet = new Set<string>();
      for (const o of ordensRows) {
        for (const u of o.unidades ?? []) {
          for (const ri of u.rota_itens ?? []) {
            if (ri?.rota_id) rotaIdsSet.add(ri.rota_id);
          }
        }
      }
      const { data: rotasData } = rotaIdsSet.size
        ? await supabase
            .from("rotas")
            .select("id, motorista_id, destino_final_id, status, data_programada")
            .in("id", Array.from(rotaIdsSet))
        : { data: [] as any[] };
      const rotaById = new Map((rotasData ?? []).map((r: any) => [r.id, r]));

      const locadorIds = Array.from(new Set(pfs.map((p) => p.locador_id).filter(Boolean) as string[]));
      const pedidoIdsAll = Array.from(new Set(pfs.map((p) => p.pedido_id)));
      const { data: pedidosAll } = pedidoIdsAll.length
        ? await supabase.from("pedidos").select("id, locatario_id").in("id", pedidoIdsAll)
        : { data: [] as { id: string; locatario_id: string }[] };
      const locatarioByPedido = new Map((pedidosAll ?? []).map((p) => [p.id, p.locatario_id]));
      const locatarioIds = Array.from(
        new Set((pedidosAll ?? []).map((p) => p.locatario_id).filter(Boolean) as string[]),
      );
      const motoristaIds: string[] = [];
      const destinoIds: string[] = [];
      for (const o of ordensRows) {
        for (const u of o.unidades ?? []) {
          if (u?.destino_final_id) destinoIds.push(u.destino_final_id);
          for (const ri of u.rota_itens ?? []) {
            const r: any = rotaById.get(ri.rota_id);
            if (r?.motorista_id) motoristaIds.push(r.motorista_id);
            if (r?.destino_final_id) destinoIds.push(r.destino_final_id);
          }
        }
      }
      const allProfileIds = Array.from(new Set([...locadorIds, ...locatarioIds, ...motoristaIds, ...destinoIds]));
      const { data: profs } = allProfileIds.length
        ? await supabase.from("profiles").select("id, nome").in("id", allProfileIds)
        : { data: [] as { id: string; nome: string }[] };
      const nomeById = new Map((profs ?? []).map((p) => [p.id, p.nome]));
      const pfById = new Map(pfs.map((p) => [p.id, p]));

      const STATUS_EM_ANDAMENTO = new Set([
        "entrega_pendente",
        "em_transito_locacao",
        "locada",
        "aguardando_retirada",
        "em_transito_retirada",
      ]);
      const now = Date.now();
      const dayMs = 86_400_000;

      return ordensRows.flatMap((o: any): ColetaVencida[] => {
        const unidadesRaw = (o.unidades ?? []).filter((u: any) => STATUS_EM_ANDAMENTO.has(u.status));
        if (!unidadesRaw.length) return [];
        const firstUnit: any = unidadesRaw[0];
        const locacaoAt: string | null = firstUnit?.created_at ?? o.created_at ?? null;
        if (!locacaoAt) return [];
        const vencMs = new Date(locacaoAt).getTime() + PRAZO_DIAS * dayMs;
        const diasAtraso = Math.floor((now - vencMs) / dayMs);
        if (diasAtraso <= 0) return [];

        const obra = o.obra;
        const origem = obra
          ? [
              [obra.rua, obra.numero].filter(Boolean).join(", "),
              obra.bairro,
              [obra.cidade, obra.estado].filter(Boolean).join("/"),
            ]
              .filter(Boolean)
              .join(" - ")
          : "—";
        const pf = pfById.get(o.pedido_fornecedor_id);
        const locadorId = pf?.locador_id ?? undefined;
        const locatarioId = pf ? locatarioByPedido.get(pf.pedido_id) : undefined;
        const unidadeCodigo = firstUnit?.cacamba_unidade?.codigo ?? null;
        const modeloId = firstUnit?.cacamba_unidade?.cacamba?.modelo ?? null;
        const cacambaModelo = modeloId ? modeloNomeById.get(modeloId) ?? null : null;
        const diasLocada = Math.max(0, Math.floor((now - new Date(locacaoAt).getTime()) / dayMs));

        let transportadorId: string | undefined;
        let destinoFinalId: string | undefined = unidadesRaw.find((u: any) => u.destino_final_id)?.destino_final_id ?? undefined;
        for (const u of unidadesRaw) {
          for (const ri of u.rota_itens ?? []) {
            const r: any = rotaById.get(ri.rota_id);
            if (!r || r.status === "cancelada") continue;
            if (!transportadorId && r.motorista_id) transportadorId = r.motorista_id;
            if (!destinoFinalId && r.destino_final_id) destinoFinalId = r.destino_final_id;
            if (transportadorId && destinoFinalId) break;
          }
          if (transportadorId && destinoFinalId) break;
        }

        const residuos = unidadesRaw.flatMap((u: any) => {
          const medidos = residuosByOlu.get(u.id) ?? [];
          if (medidos.length > 0) return medidos;
          const cacambaId = u?.cacamba_unidade?.cacamba?.id;
          const cadastrados = cacambaId ? residuosByCacamba.get(cacambaId) ?? [] : [];
          return cadastrados.map((r) => ({
            nome: r.nome,
            peso_kg: u?.peso_kg ?? null,
            volume_m3: u?.volume_m3 ?? null,
          }));
        });

        return [{
          id: unidadeCodigo ?? o.id.slice(0, 8).toUpperCase(),
          modelo: cacambaModelo ?? (o.equipment_type === "cacamba" ? "Caçamba" : "Equipamento"),
          status: STATUS_LABELS[firstUnit?.status] ?? (firstUnit?.status ?? "—"),
          dataLocacao: fmt(locacaoAt),
          dataVencimento: fmt(new Date(vencMs).toISOString()),
          diasAtraso,
          diasLocada,
          transportador: transportadorId ? nomeById.get(transportadorId) ?? "—" : "—",
          locador:
            profileType === "locador"
              ? userName
              : locadorId
                ? nomeById.get(locadorId) ?? "—"
                : "—",
          locatario:
            profileType === "locatario"
              ? userName
              : locatarioId
                ? nomeById.get(locatarioId) ?? "—"
                : "—",
          destinador: destinoFinalId ? nomeById.get(destinoFinalId) ?? "—" : "—",
          origem: origem || "—",
          destino: destinoFinalId ? nomeById.get(destinoFinalId) ?? "—" : "—",
          residuos,
        }];
      }).sort((a, b) => b.diasAtraso - a.diasAtraso);
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        [r.id, r.modelo, r.locador, r.locatario, r.origem].join(" ").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } =
    usePagination(filtered, 10);

  const handleExportExcel = () => {
    const data = filtered.map((r) => ({
      Identificação: r.id,
      Modelo: r.modelo,
      Status: r.status,
      "Data Locação": r.dataLocacao,
      "Data Vencimento": r.dataVencimento,
      "Dias em Atraso": r.diasAtraso,
      "Dias Locada": r.diasLocada ?? "—",
      Transportador: r.transportador,
      Locador: r.locador,
      Locatário: r.locatario,
      Destinador: r.destinador,
      Origem: r.origem,
      Destino: r.destino,
      Resíduos: r.residuos
        .map(
          (x) =>
            `${x.nome}${
              x.peso_kg != null
                ? ` (${x.peso_kg} kg)`
                : x.volume_m3 != null
                  ? ` (${x.volume_m3} m³)`
                  : ""
            }`,
        )
        .join("; "),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 20 }, { wch: 14 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
      { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 40 }, { wch: 30 }, { wch: 40 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Coletas Vencidas");
    XLSX.writeFile(wb, `coletas-vencidas-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=1100,height=750");
    if (!w) return;
    const logoUrl = new URL(myboxLogo, window.location.origin).href;
    const nowStr = new Date().toLocaleString("pt-BR");
    const rowsHtml = filtered
      .map(
        (r) => `
          <tr>
            <td>${r.id}<br/><span style="color:#888;font-size:10px">${r.modelo}</span><br/><span style="color:#16a34a;font-size:10px">${r.status}</span></td>
            <td><strong>Locação:</strong> ${r.dataLocacao}<br/><strong>Vencimento:</strong> ${r.dataVencimento}<br/><span style="color:#dc2626"><strong>${r.diasAtraso}</strong> dias em atraso</span></td>
            <td><strong>Transp:</strong> ${r.transportador}<br/><strong>Locador:</strong> ${r.locador}<br/><strong>Locatário:</strong> ${r.locatario}<br/><strong>Destin:</strong> ${r.destinador}</td>
            <td><strong style="color:#16a34a">Orig:</strong> ${r.origem}<br/><strong style="color:#dc2626">Dest:</strong> ${r.destino}</td>
            <td>${
              r.residuos.length
                ? r.residuos
                    .map(
                      (x) =>
                        `<strong>${x.nome}:</strong> ${
                          x.peso_kg != null
                            ? `${x.peso_kg} kg`
                            : x.volume_m3 != null
                              ? `${x.volume_m3} m³`
                              : "—"
                        }`,
                    )
                    .join("<br/>")
                : "—"
            }</td>
          </tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Coletas Vencidas</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#111}
        .brand{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #16a34a;padding-bottom:12px;margin-bottom:16px}
        .brand-left{display:flex;align-items:center;gap:12px}
        .brand-left img{height:44px;width:auto}
        .brand-name{font-size:20px;font-weight:700;color:#16a34a;letter-spacing:.5px}
        .brand-right{font-size:11px;color:#555;text-align:right}
        h1{margin:0 0 4px;font-size:18px}
        .meta{color:#555;font-size:12px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:11px}
        th,td{border:1px solid #ddd;padding:6px;text-align:left;vertical-align:top}
        th{background:#f4f4f5}
      </style></head><body>
      <div class="brand">
        <div class="brand-left">
          <img src="${logoUrl}" alt="MyBox" />
          <span class="brand-name">MyBox Brasil</span>
        </div>
        <div class="brand-right">
          <div><strong>Impresso em</strong></div>
          <div>${nowStr}</div>
        </div>
      </div>
      <h1>Coletas Vencidas</h1>
      <div class="meta">Caçambas em locação com prazo expirado</div>
      <table>
        <thead><tr><th>Identificação</th><th>Datas</th><th>Envolvidos</th><th>Trajeto</th><th>Resíduos</th></tr></thead>
        <tbody>${rowsHtml || `<tr><td colspan="5" style="text-align:center;color:#888">Sem dados</td></tr>`}</tbody>
      </table>
      <script>window.onload=()=>{setTimeout(()=>window.print(),300);}</script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <div>
          <h1 className="text-2xl font-bold">Coletas Vencidas</h1>
          <p className="text-sm text-white/75">Caçambas em locação com prazo expirado</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleExportExcel} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button variant="secondary" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
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

      <DataTable<ColetaVencida>
        loading={isLoading}
        title="Coletas Vencidas"
        data={paginatedData}
        columns={[
          {
            header: "Identificação",
            accessor: (d) => (
              <div className="space-y-1">
                <p className="font-bold text-xs">{d.id}</p>
                <p className="text-xs text-muted-foreground">{d.modelo}</p>
                <Badge variant="outline" className="text-[10px]">{d.status}</Badge>
              </div>
            ),
          },
          {
            header: "Datas",
            accessor: (d) => (
              <div className="space-y-0.5 text-[10px]">
                <p><span className="font-bold">Locação:</span> {d.dataLocacao}</p>
                <p><span className="font-bold">Vencimento:</span> {d.dataVencimento}</p>
                <p className="text-muted-foreground">
                  {d.diasLocada != null ? `${d.diasLocada} ${d.diasLocada === 1 ? "dia" : "dias"}` : "—"}
                </p>
              </div>
            ),
          },
          {
            header: "Envolvidos",
            accessor: (d) => (
              <div className="space-y-1 text-[10px]">
                <p><span className="font-bold">Transp:</span> {d.transportador}</p>
                <p><span className="font-bold">Locador:</span> {d.locador}</p>
                <p><span className="font-bold">Locatário:</span> {d.locatario}</p>
                <p><span className="font-bold">Destin:</span> {d.destinador}</p>
              </div>
            ),
          },
          {
            header: "Trajeto",
            accessor: (d) => (
              <div className="space-y-1 text-[10px] max-w-[200px]">
                <p><span className="font-bold text-primary">Orig:</span> {d.origem}</p>
                <p><span className="font-bold text-destructive">Dest:</span> {d.destino}</p>
              </div>
            ),
          },
          {
            header: "Resíduos",
            accessor: (d) => (
              <div className="space-y-0.5 text-[10px] max-w-[180px]">
                {d.residuos.length === 0 ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  d.residuos.map((r, i) => (
                    <p key={i}>
                      <span className="font-bold">{r.nome}:</span>{" "}
                      {r.peso_kg != null
                        ? `${r.peso_kg} kg`
                        : r.volume_m3 != null
                          ? `${r.volume_m3} m³`
                          : "—"}
                    </p>
                  ))
                )}
              </div>
            ),
          },
          {
            header: "Dias em Atraso",
            accessor: (d) => (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {d.diasAtraso} dias
              </Badge>
            ),
          },
        ]}
        pagination={{
          totalItems,
          pageSize,
          currentPage,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize
        }}
      />
    </div>
  );
};

export default VencimentoPrazo;
