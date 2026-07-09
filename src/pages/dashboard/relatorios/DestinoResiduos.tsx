import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, FileText, Printer, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/components/DataPagination";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import myboxLogo from "@/assets/mybox-logo.png";
import * as XLSX from "xlsx";

interface DestinoResiduoData {
  id: string;
  modelo: string;
  dataColeta: string;
  transportador: string;
  locador: string;
  locatario: string;
  destinador: string;
  origem: string;
  destino: string;
  mtrStatus: string;
  cdfStatus: string;
}

const DestinoResiduos = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const userName = useAuthStore((s) => s.user?.name) ?? "—";
  const profileType = useAuthStore((s) => s.activeProfileType());
  const [search, setSearch] = useState("");

  const { data: rows = [], isLoading } = useQuery<DestinoResiduoData[]>({
    queryKey: ["relatorio-destino-residuos", userId, profileType],
    enabled: !!userId,
    queryFn: async () => {
      let pfs: { id: string; locador_id: string | null; pedido_id: string }[] = [];

      if (profileType === "locador") {
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
          "id, created_at, equipment_type, pedido_fornecedor_id, obra:obra_id(rua, numero, bairro, cidade, estado), unidades:ordem_locacao_unidades(id, rota_itens(tipo, rotas(motorista_id, destino_final_id)))",
        )
        .in("pedido_fornecedor_id", pfIds);

      const locadorIds = Array.from(
        new Set(pfs.map((p) => p.locador_id).filter(Boolean) as string[]),
      );
      const pedidoIdsAll = Array.from(new Set(pfs.map((p) => p.pedido_id)));
      const { data: pedidosAll } = pedidoIdsAll.length
        ? await supabase
            .from("pedidos")
            .select("id, locatario_id")
            .in("id", pedidoIdsAll)
        : { data: [] as { id: string; locatario_id: string }[] };
      const locatarioByPedido = new Map(
        (pedidosAll ?? []).map((p) => [p.id, p.locatario_id]),
      );
      const locatarioIds = Array.from(
        new Set((pedidosAll ?? []).map((p) => p.locatario_id).filter(Boolean) as string[]),
      );
      // Coletar motorista/destino de todas as rotas envolvidas
      const motoristaIds: string[] = [];
      const destinoIds: string[] = [];
      for (const o of ordens ?? []) {
        const unidades = (o as any).unidades ?? [];
        for (const u of unidades) {
          for (const ri of u.rota_itens ?? []) {
            const r = ri.rotas;
            if (r?.motorista_id) motoristaIds.push(r.motorista_id);
            if (r?.destino_final_id) destinoIds.push(r.destino_final_id);
          }
        }
      }
      const allProfileIds = Array.from(
        new Set([...locadorIds, ...locatarioIds, ...motoristaIds, ...destinoIds]),
      );
      const { data: profs } = allProfileIds.length
        ? await supabase
            .from("profiles")
            .select("id, nome")
            .in("id", allProfileIds)
        : { data: [] as { id: string; nome: string }[] };
      const nomeById = new Map((profs ?? []).map((p) => [p.id, p.nome]));
      const pfById = new Map(pfs.map((p) => [p.id, p]));

      return (ordens ?? []).map((o) => {
        const obra = (o as { obra: { rua?: string; numero?: string; bairro?: string; cidade?: string; estado?: string } | null }).obra;
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
        // Extrair transportador (motorista da rota de retirada, ou qualquer rota) e destino final
        const unidades = (o as any).unidades ?? [];
        let transportadorId: string | undefined;
        let destinoFinalId: string | undefined;
        for (const u of unidades) {
          for (const ri of u.rota_itens ?? []) {
            const r = ri.rotas;
            if (!r) continue;
            // priorizar rota de retirada para o transportador do destino
            if (String(ri.tipo).toLowerCase() === "retirada") {
              if (r.motorista_id) transportadorId = r.motorista_id;
              if (r.destino_final_id) destinoFinalId = r.destino_final_id;
            } else {
              if (!transportadorId && r.motorista_id) transportadorId = r.motorista_id;
              if (!destinoFinalId && r.destino_final_id) destinoFinalId = r.destino_final_id;
            }
          }
        }
        return {
          id: o.id.slice(0, 16).toUpperCase(),
          modelo: o.equipment_type === "cacamba" ? "Caçamba" : "Equipamento",
          dataColeta: new Date(o.created_at).toLocaleDateString("pt-BR"),
          transportador: transportadorId ? nomeById.get(transportadorId) ?? "—" : "—",
          locador:
            profileType === "locador"
              ? userName
              : locadorId
                ? nomeById.get(locadorId) ?? "—"
                : "—",
          locatario:
            profileType === "locador"
              ? locatarioId
                ? nomeById.get(locatarioId) ?? "—"
                : "—"
              : userName,
          destinador: destinoFinalId ? nomeById.get(destinoFinalId) ?? "—" : "—",
          origem: origem || "—",
          destino: destinoFinalId ? nomeById.get(destinoFinalId) ?? "—" : "—",
          mtrStatus: "Pendente",
          cdfStatus: "Pendente",
        };
      });
    },
  });

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        [r.id, r.modelo, r.locador, r.origem]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [rows, search],
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleExportExcel = () => {
    const data = filtered.map((r) => ({
      Identificação: r.id,
      Modelo: r.modelo,
      "Data Coleta": r.dataColeta,
      Transportador: r.transportador,
      Locador: r.locador,
      Locatário: r.locatario,
      Destinador: r.destinador,
      Origem: r.origem,
      Destino: r.destino,
      MTR: r.mtrStatus,
      CDF: r.cdfStatus,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 22 }, { wch: 22 },
      { wch: 22 }, { wch: 22 }, { wch: 40 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Destino Resíduos");
    XLSX.writeFile(wb, `destino-residuos-${new Date().toISOString().slice(0, 10)}.xlsx`);
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
            <td>${r.id}<br/><span style="color:#888;font-size:10px">${r.modelo}</span></td>
            <td>${r.dataColeta}</td>
            <td><strong>Transp:</strong> ${r.transportador}<br/><strong>Locador:</strong> ${r.locador}<br/><strong>Locatário:</strong> ${r.locatario}<br/><strong>Destin:</strong> ${r.destinador}</td>
            <td><strong style="color:#16a34a">Orig:</strong> ${r.origem}<br/><strong style="color:#dc2626">Dest:</strong> ${r.destino}</td>
            <td style="text-align:center">${r.mtrStatus}</td>
            <td style="text-align:center">${r.cdfStatus}</td>
          </tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Destino de Resíduos</title>
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
      <h1>Destino de Resíduos</h1>
      <div class="meta">Relatório detalhado do ciclo de vida dos resíduos</div>
      <table>
        <thead><tr><th>Identificação</th><th>Data Coleta</th><th>Envolvidos</th><th>Trajeto</th><th>MTR</th><th>CDF</th></tr></thead>
        <tbody>${rowsHtml || `<tr><td colspan="6" style="text-align:center;color:#888">Sem dados</td></tr>`}</tbody>
      </table>
      <script>window.onload=()=>{setTimeout(()=>window.print(),300);}</script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <div>
          <h1 className="text-2xl font-bold">Destino de Resíduos</h1>
          <p className="text-sm text-white/75">Relatório detalhado do ciclo de vida dos resíduos</p>
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

      <DataTable<DestinoResiduoData>
        loading={isLoading}
        title="Rastreabilidade de Resíduos"
        data={paginatedData}
        columns={[
          { 
            header: "Identificação", 
            accessor: (d) => (
              <div className="space-y-1">
                <p className="font-bold text-xs">{d.id}</p>
                <p className="text-xs text-muted-foreground">{d.modelo}</p>
              </div>
            )
          },
          { header: "Data Coleta", accessor: "dataColeta" },
          { 
            header: "Envolvidos", 
            accessor: (d) => (
              <div className="space-y-1 text-[10px]">
                <p><span className="font-bold">Transp:</span> {d.transportador}</p>
                <p><span className="font-bold">Locador:</span> {d.locador}</p>
                <p><span className="font-bold">Locatário:</span> {d.locatario}</p>
                <p><span className="font-bold">Destin:</span> {d.destinador}</p>
              </div>
            )
          },
          { 
            header: "Trajeto", 
            accessor: (d) => (
              <div className="space-y-1 text-[10px] max-w-[200px]">
                <p><span className="font-bold text-primary">Orig:</span> {d.origem}</p>
                <p><span className="font-bold text-destructive">Dest:</span> {d.destino}</p>
              </div>
            )
          },
          { 
            header: "MTR", 
            accessor: (d) => (
              <Badge variant={d.mtrStatus === "Emitido" ? "default" : "secondary"} className="text-[10px]">
                {d.mtrStatus}
              </Badge>
            )
          },
          { 
            header: "CDF", 
            accessor: (d) => (
              <Badge variant={d.cdfStatus === "Emitido" ? "default" : "secondary"} className="text-[10px]">
                {d.cdfStatus}
              </Badge>
            )
          },
        ]}
        pagination={{
          totalItems,
          pageSize,
          currentPage,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        actions={() => (
          <Button variant="outline" size="icon" className="h-8 w-8">
            <FileText className="h-4 w-4" />
          </Button>
        )}
      />
    </div>
  );
};

export default DestinoResiduos;
