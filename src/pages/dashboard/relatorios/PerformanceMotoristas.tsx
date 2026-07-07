import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Truck, AlertTriangle, CheckCircle } from "lucide-react";

type Row = {
  motorista: string;
  viagens: number;
  entregas: number;
  retiradas: number;
  atrasos: number;
  ocorrencias: number;
};

const PerformanceMotoristas = () => {
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore(
    (s) => s.activeProfile() ?? s.user?.profiles[0] ?? null,
  );
  const rawTenant = activeProfile?.tenantId;
  const locadorId = rawTenant && rawTenant !== "self" ? rawTenant : user?.id;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data } = useQuery({
    queryKey: ["performance-motoristas", locadorId],
    enabled: !!locadorId,
    queryFn: async () => {
      const hoje = new Date().toISOString().slice(0, 10);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "motorista")
        .eq("ativo", true)
        .eq("locador_id", locadorId!);
      const ids = (roles ?? []).map((r: any) => r.user_id);

      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, nome").in("id", ids)
        : { data: [] as any[] };

      const { data: rotas } = await supabase
        .from("rotas")
        .select("id, motorista_id, status, data_programada, finalizado_at, rota_itens(tipo)")
        .eq("locador_id", locadorId!);

      const { data: ocorr } = await supabase
        .from("ocorrencias_frota")
        .select("id, status")
        .eq("locador_id", locadorId!)
        .neq("status", "Resolvida");

      const rows: Row[] = (profs ?? []).map((p: any) => {
        const rs = (rotas ?? []).filter((r: any) => r.motorista_id === p.id);
        const viagens = rs.filter((r: any) => r.status === "concluida").length;
        let entregas = 0;
        let retiradas = 0;
        let atrasos = 0;
        rs.forEach((r: any) => {
          const concl = r.status === "concluida";
          (r.rota_itens ?? []).forEach((it: any) => {
            if (concl) {
              const t = String(it.tipo ?? "").toLowerCase();
              if (t === "entrega") entregas++;
              else if (t === "retirada") retiradas++;
            }
          });
          if (concl && r.finalizado_at && r.data_programada) {
            const fin = String(r.finalizado_at).slice(0, 10);
            if (fin > r.data_programada) atrasos++;
          } else if (!concl && r.status !== "cancelada" && r.data_programada && r.data_programada < hoje) {
            atrasos++;
          }
        });
        return {
          motorista: p.nome ?? "Motorista",
          viagens,
          entregas,
          retiradas,
          atrasos,
          ocorrencias: 0,
        };
      });

      const totalViagens = (rotas ?? []).filter((r: any) => r.status === "concluida").length;
      const concluidas = (rotas ?? []).filter((r: any) => r.status === "concluida");
      const noPrazo = concluidas.filter(
        (r: any) =>
          r.finalizado_at &&
          r.data_programada &&
          String(r.finalizado_at).slice(0, 10) <= r.data_programada,
      ).length;
      const pontualidade = concluidas.length
        ? Math.round((noPrazo / concluidas.length) * 100)
        : null;
      const ocorrenciasAtivas = (ocorr ?? []).length;

      return { rows, totalViagens, pontualidade, ocorrenciasAtivas };
    },
  });

  const rows = data?.rows ?? [];
  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Performance de Motoristas</h1>
        <p className="text-sm text-white/75">Indicadores de eficiência logística por colaborador</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Viagens</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalViagens ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Pontualidade</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.pontualidade == null ? "—" : `${data.pontualidade}%`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ocorrências Ativas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.ocorrenciasAtivas ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Métricas Individuais"
        data={pageRows}
        columns={[
          { header: "Motorista", accessor: "motorista", className: "font-medium" },
          { header: "Total Viagens", accessor: "viagens" },
          { header: "Total Entregas", accessor: "entregas" },
          { header: "Total Retiradas", accessor: "retiradas" },
          { header: "Atrasos", accessor: "atrasos", className: "text-red-600 font-medium" },
          { header: "Ocorrências", accessor: "ocorrencias", className: "text-amber-600 font-medium" },
        ]}
        pagination={{
          totalItems: rows.length,
          pageSize,
          currentPage: page,
          onPageChange: setPage,
          onPageSizeChange: (s) => {
            setPageSize(s);
            setPage(1);
          },
        }}
      />
    </div>
  );
};

export default PerformanceMotoristas;