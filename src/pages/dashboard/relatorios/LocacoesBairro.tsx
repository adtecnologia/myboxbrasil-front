import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, MapPin, Loader2, CheckCircle2, CalendarPlus, CalendarClock, Printer, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import myboxLogo from "@/assets/mybox-logo.png";
import * as XLSX from "xlsx";

const fmt = (t: number) => new Date(t).toLocaleDateString("pt-BR");

const LocacoesBairro = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const profileType = useAuthStore((s) => s.activeProfileType());
  const [search, setSearch] = useState("");

  const { data: bairroData = [], isLoading } = useQuery({
    queryKey: ["relatorio-locacoes-bairro", userId, profileType],
    enabled: !!userId,
    queryFn: async () => {
      // 1. Descobrir pedido_fornecedores relevantes ao perfil ativo
      let pfIds: string[] = [];
      if (profileType === "locatario") {
        const { data: pedidos } = await supabase
          .from("pedidos")
          .select("id")
          .eq("locatario_id", userId!);
        const pedidoIds = (pedidos ?? []).map((p) => p.id);
        if (!pedidoIds.length) return [];
        const { data: pfs } = await supabase
          .from("pedido_fornecedores")
          .select("id")
          .in("pedido_id", pedidoIds);
        pfIds = (pfs ?? []).map((p) => p.id);
      } else {
        const { data: pfs } = await supabase
          .from("pedido_fornecedores")
          .select("id")
          .eq("locador_id", userId!);
        pfIds = (pfs ?? []).map((p) => p.id);
      }
      if (!pfIds.length) return [];

      // 2. Ordens de locação desses pfs (para mapear id → obra/bairro)
      const { data: ordensLoc } = await supabase
        .from("ordens_locacao")
        .select("id, obra:obra_id(bairro)")
        .in("pedido_fornecedor_id", pfIds);
      if (!ordensLoc?.length) return [];
      const ordemToBairro = new Map(
        (ordensLoc ?? []).map((o: any) => [o.id, (o.obra?.bairro as string) || "—"]),
      );

      // 3. Unidades efetivamente alocadas (fonte da verdade)
      const { data: olus } = await supabase
        .from("ordem_locacao_unidades")
        .select("status, created_at, ordem_locacao_id")
        .in("ordem_locacao_id", Array.from(ordemToBairro.keys()));

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

      const map = new Map<
        string,
        { bairro: string; emAndamento: number; concluidas: number; datas: number[] }
      >();
      (olus ?? []).forEach((u: any) => {
        const bairro = ordemToBairro.get(u.ordem_locacao_id) || "—";
        const entry = map.get(bairro) ?? { bairro, emAndamento: 0, concluidas: 0, datas: [] };
        if (concluidasStatuses.includes(u.status)) entry.concluidas += 1;
        else if (emAndamentoStatuses.includes(u.status)) entry.emAndamento += 1;
        entry.datas.push(new Date(u.created_at).getTime());
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

  const handleExportExcel = () => {
    const rows = filtered.map((b) => ({
      Bairro: b.bairro,
      "Em Andamento": b.emAndamento,
      Concluídas: b.concluidas,
      "Primeira Locação": b.primeira,
      "Última Locação": b.ultima,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 40 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Locação por Bairro");
    XLSX.writeFile(wb, `locacao-por-bairro-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=1000,height=700");
    if (!w) return;
    const logoUrl = new URL(myboxLogo, window.location.origin).href;
    const nowStr = new Date().toLocaleString("pt-BR");
    const rowsHtml = filtered
      .map(
        (b) => `
          <tr>
            <td>${b.bairro}</td>
            <td style="text-align:center">${b.emAndamento}</td>
            <td style="text-align:center">${b.concluidas}</td>
            <td>${b.primeira}</td>
            <td>${b.ultima}</td>
          </tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Locação por Bairro</title>
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
      <h1>Locação por Bairro</h1>
      <div class="meta">Análise de desempenho e volume por localidade</div>
      <table>
        <thead><tr><th>Bairro</th><th style="text-align:center">Em Andamento</th><th style="text-align:center">Concluídas</th><th>Primeira Locação</th><th>Última Locação</th></tr></thead>
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
          <h1 className="text-2xl font-bold">Locação por Bairro</h1>
          <p className="text-sm text-white/75">Análise de desempenho e volume por localidade</p>
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
        loading={isLoading}
        title="Dados por Bairro"
        data={filtered}
        columns={[
          {
            header: "Bairro",
            accessor: (item: any) => (
              <div className="flex items-center gap-2 font-medium">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                {item.bairro}
              </div>
            ),
          },
          {
            header: "Em Andamento",
            accessor: (item: any) => (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-blue-200">
                <Loader2 className="h-3 w-3" />
                {item.emAndamento}
              </span>
            ),
          },
          {
            header: "Concluídas",
            accessor: (item: any) => (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                {item.concluidas}
              </span>
            ),
          },
          {
            header: "Primeira Locação",
            accessor: (item: any) => (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarPlus className="h-3.5 w-3.5 text-primary/70" />
                {item.primeira}
              </span>
            ),
          },
          {
            header: "Última Locação",
            accessor: (item: any) => (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5 text-amber-500" />
                {item.ultima}
              </span>
            ),
          },
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