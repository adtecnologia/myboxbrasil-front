import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/components/DataPagination";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

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
  const [search, setSearch] = useState("");

  const { data: rows = [] } = useQuery<DestinoResiduoData[]>({
    queryKey: ["relatorio-destino-residuos", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("id")
        .eq("locatario_id", userId!);
      const pedidoIds = (pedidos ?? []).map((p) => p.id);
      if (!pedidoIds.length) return [];

      const { data: pfs } = await supabase
        .from("pedido_fornecedores")
        .select("id, locador_id")
        .in("pedido_id", pedidoIds);
      const pfIds = (pfs ?? []).map((p) => p.id);
      if (!pfIds.length) return [];

      const { data: ordens } = await supabase
        .from("ordens_locacao")
        .select(
          "id, created_at, equipment_type, pedido_fornecedor_id, obra:obra_id(rua, numero, bairro, cidade, estado)",
        )
        .in("pedido_fornecedor_id", pfIds);

      const locadorIds = Array.from(
        new Set((pfs ?? []).map((p) => p.locador_id).filter(Boolean) as string[]),
      );
      const { data: profs } = locadorIds.length
        ? await supabase
            .from("profiles")
            .select("id, nome")
            .in("id", locadorIds)
        : { data: [] as { id: string; nome: string }[] };
      const nomeById = new Map((profs ?? []).map((p) => [p.id, p.nome]));
      const locadorByPf = new Map(
        (pfs ?? []).map((p) => [p.id, p.locador_id]),
      );

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
        const locadorId = locadorByPf.get(o.pedido_fornecedor_id) ?? undefined;
        return {
          id: o.id.slice(0, 16).toUpperCase(),
          modelo: o.equipment_type === "cacamba" ? "Caçamba" : "Equipamento",
          dataColeta: new Date(o.created_at).toLocaleDateString("pt-BR"),
          transportador: "—",
          locador: locadorId ? nomeById.get(locadorId) ?? "—" : "—",
          locatario: userName,
          destinador: "—",
          origem: origem || "—",
          destino: "—",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <div>
          <h1 className="text-2xl font-bold">Destino de Resíduos</h1>
          <p className="text-sm text-white/75">Relatório detalhado do ciclo de vida dos resíduos</p>
        </div>
        <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-0">
          <Download className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
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
