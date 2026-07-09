import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Trophy, TrendingUp, Users, Printer, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import myboxLogo from "@/assets/mybox-logo.png";
import * as XLSX from "xlsx";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const RankingClientes = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: rankingData = [], isLoading } = useQuery({
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
        supabase.from("ordens_locacao").select("id, pedido_fornecedor_id").in("pedido_fornecedor_id", pfIds),
        supabase.from("pedidos").select("id, locatario_id").in("id", pedidoIds),
      ]);
      const ordemIds = (ordens ?? []).map((o) => o.id);
      if (!ordemIds.length) return [];

      const { data: unidades } = await supabase
        .from("ordem_locacao_unidades")
        .select("status, ordem_locacao_id")
        .in("ordem_locacao_id", ordemIds);
      if (!unidades?.length) return [];

      const pedidoToUser = new Map((pedidos ?? []).map((p) => [p.id, p.locatario_id]));
      const userIds = Array.from(new Set((pedidos ?? []).map((p) => p.locatario_id)));
      const { data: profs } = userIds.length
        ? await supabase.from("profiles").select("id, nome").in("id", userIds)
        : { data: [] as { id: string; nome: string }[] };
      const userToName = new Map((profs ?? []).map((p) => [p.id, p.nome]));
      const pfToUser = new Map(pfs.map((pf) => [pf.id, pedidoToUser.get(pf.pedido_id)]));
      const ordemToPf = new Map((ordens ?? []).map((o) => [o.id, o.pedido_fornecedor_id]));
      const pfsComUnidade = new Set(
        (unidades ?? [])
          .map((u) => ordemToPf.get(u.ordem_locacao_id))
          .filter((id): id is string => Boolean(id)),
      );

      type Row = { cliente: string; faturamento: string; faturamentoNum: number; total: number; emAndamento: number; concluidas: number };
      const agg = new Map<string, Row>();
      pfs.forEach((pf) => {
        if (!pfsComUnidade.has(pf.id)) return;
        const uid = pfToUser.get(pf.id);
        if (!uid) return;
        const nome = userToName.get(uid) ?? "—";
        const r = agg.get(uid) ?? { cliente: nome, faturamento: "", faturamentoNum: 0, total: 0, emAndamento: 0, concluidas: 0 };
        r.faturamentoNum += Number(pf.valor_total ?? 0);
        agg.set(uid, r);
      });

      const emAndamentoStatuses = [
        "entrega_pendente",
        "em_transito_locacao",
        "locada",
        "aguardando_retirada",
        "em_transito_retirada",
      ];
      const concluidasStatuses = [
        "em_transito_destino_final",
        "aguardando_analise",
        "cdf_emitido",
      ];

      (unidades ?? []).forEach((unidade) => {
        const pfId = ordemToPf.get(unidade.ordem_locacao_id);
        if (!pfId) return;
        const uid = pfToUser.get(pfId);
        if (!uid) return;
        const r = agg.get(uid);
        if (!r) return;
        const status = unidade.status ?? "";
        r.total += 1;
        if (concluidasStatuses.includes(status)) r.concluidas += 1;
        else if (emAndamentoStatuses.includes(status)) r.emAndamento += 1;
      });
      return Array.from(agg.values())
        .map((r) => ({ ...r, faturamento: brl(r.faturamentoNum) }))
        .sort((a, b) => b.faturamentoNum - a.faturamentoNum);
    },
  });

  const topCliente = rankingData[0]?.cliente ?? "—";
  const clientesAtivos = rankingData.length;

  const handleExportExcel = () => {
    const rows = rankingData.map((r) => ({
      Cliente: r.cliente,
      "Total Faturado": r.faturamentoNum,
      "Total Locações": r.total,
      "Em Andamento": r.emAndamento,
      Concluídas: r.concluidas,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 32 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ranking Clientes");
    XLSX.writeFile(wb, `ranking-clientes-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=1000,height=700");
    if (!w) return;
    const logoUrl = new URL(myboxLogo, window.location.origin).href;
    const nowStr = new Date().toLocaleString("pt-BR");
    const rowsHtml = rankingData
      .map(
        (r) => `
          <tr>
            <td>${r.cliente}</td>
            <td style="text-align:right">${r.faturamento}</td>
            <td style="text-align:center">${r.total}</td>
            <td style="text-align:center">${r.emAndamento}</td>
            <td style="text-align:center">${r.concluidas}</td>
          </tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Ranking de Clientes</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#111}
        .brand{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #16a34a;padding-bottom:12px;margin-bottom:16px}
        .brand-left{display:flex;align-items:center;gap:12px}
        .brand-left img{height:44px;width:auto}
        .brand-name{font-size:20px;font-weight:700;color:#16a34a;letter-spacing:.5px}
        .brand-right{font-size:11px;color:#555;text-align:right}
        h1{margin:0 0 4px;font-size:18px}
        .meta{color:#555;font-size:12px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ddd;padding:8px;text-align:left}
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
      <h1>Ranking de Clientes</h1>
      <div class="meta">Os clientes que mais geram valor para o seu negócio</div>
      <table>
        <thead><tr><th>Cliente</th><th style="text-align:right">Total Faturado</th><th style="text-align:center">Total Locações</th><th style="text-align:center">Em Andamento</th><th style="text-align:center">Concluídas</th></tr></thead>
        <tbody>${rowsHtml || `<tr><td colspan="5" style="text-align:center;color:#888">Sem dados</td></tr>`}</tbody>
      </table>
      <script>window.onload=()=>{setTimeout(()=>window.print(),300);}</script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ranking de Clientes</h1>
          <p className="text-sm text-white/75">Os clientes que mais geram valor para o seu negócio</p>
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
        loading={isLoading}
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