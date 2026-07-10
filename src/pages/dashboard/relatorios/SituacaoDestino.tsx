import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/components/DataPagination";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import myboxLogo from "@/assets/mybox-logo.png";
import * as XLSX from "xlsx";

interface SituacaoDestino {
  id: string;
  nome: string;
  documento: string;
  docsVencidos: number;
  status: "Operacional" | "Suspenso" | "Aguardando Licença";
}

function formatCpfCnpj(v: string | null | undefined): string {
  if (!v) return "—";
  const d = v.replace(/\D/g, "");
  if (d.length === 11)
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14)
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return v;
}

const SituacaoDestino = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState("");

  const { data: rows = [], isLoading } = useQuery<SituacaoDestino[]>({
    queryKey: ["situacao-destinos", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_destinos_licenciados_prefeitura",
        { _uid: userId! },
      );
      if (error) throw error;
      const list = (data ?? []) as Array<{
        id: string;
        nome: string;
        documento: string;
        cidade: string;
        licenca_status: string;
      }>;
      if (!list.length) return [];

      const ids = list.map((l) => l.id);
      const today = new Date().toISOString().slice(0, 10);
      const { data: docs } = await supabase
        .from("documentos_licenca_cidade")
        .select("user_id, data_vencimento")
        .in("user_id", ids)
        .not("data_vencimento", "is", null)
        .lt("data_vencimento", today);
      const vencidosByUser = new Map<string, number>();
      for (const d of docs ?? []) {
        vencidosByUser.set(d.user_id, (vencidosByUser.get(d.user_id) ?? 0) + 1);
      }

      return list.map((l) => {
        const vencidos = vencidosByUser.get(l.id) ?? 0;
        let status: SituacaoDestino["status"];
        if (l.licenca_status === "validado" && vencidos === 0) status = "Operacional";
        else if (l.licenca_status === "rejeitado" || vencidos > 0) status = "Suspenso";
        else status = "Aguardando Licença";
        return {
          id: l.id,
          nome: l.nome ?? "—",
          documento: formatCpfCnpj(l.documento),
          docsVencidos: vencidos,
          status,
        };
      });
    },
  });

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        [r.nome, r.documento].join(" ").toLowerCase().includes(search.toLowerCase()),
      ),
    [rows, search],
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } =
    usePagination(filtered, 10);

  const statusColor = {
    "Operacional": "bg-green-100 text-green-700",
    "Suspenso": "bg-red-100 text-red-700",
    "Aguardando Licença": "bg-yellow-100 text-yellow-700"
  };

  const handleExportExcel = () => {
    const data = filtered.map((r) => ({
      Nome: r.nome,
      "CPF/CNPJ": r.documento,
      "Docs Vencidos": r.docsVencidos,
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 14 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Situação Destinos");
    XLSX.writeFile(wb, `situacao-destinos-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=1000,height=750");
    if (!w) return;
    const logoUrl = new URL(myboxLogo, window.location.origin).href;
    const nowStr = new Date().toLocaleString("pt-BR");
    const rowsHtml = filtered
      .map(
        (r) => `
          <tr>
            <td>${r.nome}</td>
            <td>${r.documento}</td>
            <td style="text-align:center;color:${r.docsVencidos > 0 ? "#dc2626" : "#16a34a"};font-weight:bold">${r.docsVencidos}</td>
            <td>${r.status}</td>
          </tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Situação Destino Final</title>
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
        th,td{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}
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
      <h1>Situação Destino Final</h1>
      <div class="meta">Monitoramento de destinadores e aterros</div>
      <table>
        <thead><tr><th>Nome</th><th>CPF/CNPJ</th><th>Docs Vencidos</th><th>Status</th></tr></thead>
        <tbody>${rowsHtml || `<tr><td colspan="4" style="text-align:center;color:#888">Sem dados</td></tr>`}</tbody>
      </table>
      <script>window.onload=()=>{setTimeout(()=>window.print(),300);}</script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <div>
          <h1 className="text-2xl font-bold italic">Situação Destino Final</h1>
          <p className="text-sm text-white/75">Monitoramento de destinadores e aterros</p>
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

      <DataTable<SituacaoDestino>
        loading={isLoading}
        title="Unidades de Destino"
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "CPF/CNPJ", accessor: "documento" },
          {
            header: "Docs Vencidos",
            accessor: (d) => (
              <span className={d.docsVencidos > 0 ? "text-destructive font-bold" : "text-green-600"}>
                {d.docsVencidos}
              </span>
            ),
          },
          { 
            header: "Status", 
            accessor: (d) => (
              <Badge className={`${statusColor[d.status]} border-0 font-medium`}>
                {d.status}
              </Badge>
            )
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

export default SituacaoDestino;
