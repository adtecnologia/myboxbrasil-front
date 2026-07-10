import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Printer, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { Building2, Loader2, CheckCircle2, CalendarPlus, CalendarClock } from "lucide-react";
import myboxLogo from "@/assets/mybox-logo.png";
import * as XLSX from "xlsx";

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "—";

const LocacoesObra = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const profileType = useAuthStore((s) => s.activeProfileType());
  const [search, setSearch] = useState("");

  const { data: obraData = [], isLoading } = useQuery({
    queryKey: ["relatorio-locacoes-obra", userId, profileType],
    enabled: !!userId,
    queryFn: async () => {
      let ordensLoc: any[] | null = null;
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
          .select("id, obra:obra_id(id, nome)")
          .in("obra_id", obraIds);
        ordensLoc = ords ?? [];
      } else {
      let pfIds: string[] = [];
      if (profileType === "locador") {
        const { data: pfs } = await supabase
          .from("pedido_fornecedores")
          .select("id")
          .eq("locador_id", userId!);
        pfIds = (pfs ?? []).map((p) => p.id);
      } else {
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
      }
      if (!pfIds.length) return [];
        const { data: ords } = await supabase
          .from("ordens_locacao")
          .select("id, obra:obra_id(id, nome)")
          .in("pedido_fornecedor_id", pfIds);
        ordensLoc = ords ?? [];
      }
      if (!ordensLoc?.length) return [];
      const ordemToObra = new Map<string, { id: string; nome: string }>();
      (ordensLoc ?? []).forEach((o: any) => {
        if (o.obra) ordemToObra.set(o.id, { id: o.obra.id, nome: o.obra.nome });
      });

      // 3. Unidades efetivamente alocadas
      const { data: olus } = await supabase
        .from("ordem_locacao_unidades")
        .select("status, created_at, ordem_locacao_id")
        .in("ordem_locacao_id", Array.from(ordemToObra.keys()));

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
        { obra: string; emAndamento: number; concluidas: number; datas: number[] }
      >();
      (olus ?? []).forEach((u: any) => {
        const obra = ordemToObra.get(u.ordem_locacao_id);
        if (!obra) return;
        const entry = map.get(obra.id) ?? {
          obra: obra.nome,
          emAndamento: 0,
          concluidas: 0,
          datas: [],
        };
        if (concluidasStatuses.includes(u.status)) entry.concluidas += 1;
        else if (emAndamentoStatuses.includes(u.status)) entry.emAndamento += 1;
        entry.datas.push(new Date(u.created_at).getTime());
        map.set(obra.id, entry);
      });

      return Array.from(map.values()).map((e) => {
        const sorted = e.datas.sort((a, b) => a - b);
        return {
          obra: e.obra,
          emAndamento: e.emAndamento,
          concluidas: e.concluidas,
          primeira: sorted.length ? fmt(new Date(sorted[0]).toISOString()) : "—",
          ultima: sorted.length ? fmt(new Date(sorted[sorted.length - 1]).toISOString()) : "—",
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

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=1000,height=700");
    if (!w) return;
    const logoUrl = new URL(myboxLogo, window.location.origin).href;
    const nowStr = new Date().toLocaleString("pt-BR");
    const rowsHtml = filtered
      .map(
        (o: any) => `
          <tr>
            <td>${o.obra}</td>
            <td style="text-align:center">${o.emAndamento}</td>
            <td style="text-align:center">${o.concluidas}</td>
            <td>${o.primeira}</td>
            <td>${o.ultima}</td>
          </tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Locação por Obra</title>
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
      <h1>Locação por Obra</h1>
      <div class="meta">Monitoramento de ativos por canteiro de obras</div>
      <table>
        <thead><tr><th>Obra</th><th style="text-align:center">Em Andamento</th><th style="text-align:center">Concluídas</th><th>Primeira Locação</th><th>Última Locação</th></tr></thead>
        <tbody>${rowsHtml || `<tr><td colspan="5" style="text-align:center;color:#888">Sem dados</td></tr>`}</tbody>
      </table>
      <script>window.onload=()=>{setTimeout(()=>window.print(),300);}</script>
    </body></html>`);
    w.document.close();
  };

  const handleExportExcel = () => {
    const rows = filtered.map((o: any) => ({
      Obra: o.obra,
      "Em Andamento": o.emAndamento,
      Concluídas: o.concluidas,
      "Primeira Locação": o.primeira,
      "Última Locação": o.ultima,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Locação por Obra");
    XLSX.writeFile(wb, `locacao-por-obra-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Locação por Obra</h1>
          <p className="text-sm text-white/75">Monitoramento de ativos por canteiro de obras</p>
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
        loading={isLoading}
        title="Dados por Obra"
        data={filtered}
        columns={[
          {
            header: "Obra",
            accessor: (item: any) => (
              <div className="flex items-center gap-2 font-medium">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                {item.obra}
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

export default LocacoesObra;