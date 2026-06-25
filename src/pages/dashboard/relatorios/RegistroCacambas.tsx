import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMotoristaRotas } from "@/hooks/useMotoristaRotas";

const RegistroCacambas = () => {
  const { data: rotas = [] } = useMotoristaRotas({ includeFinalizadas: true });
  const hoje = new Date().toISOString().slice(0, 10);

  const concluidas = useMemo(
    () => rotas.filter((r) => r.status === "concluida"),
    [rotas]
  );

  const itensHoje = concluidas
    .filter((r) => r.data_programada === hoje)
    .flatMap((r) => r.itens);

  const entregasHoje = itensHoje.filter(
    (i) => i.tipo?.toLowerCase() === "entrega"
  ).length;
  const retiradasHoje = itensHoje.filter(
    (i) => i.tipo?.toLowerCase() === "retirada"
  ).length;

  const registroData = concluidas.flatMap((r) =>
    r.itens.map((i) => ({
      id: i.id,
      data: r.data_programada
        ? new Date(r.data_programada).toLocaleDateString("pt-BR")
        : "—",
      tipo: i.tipo?.toLowerCase() === "retirada" ? "Retirada" : "Entrega",
      cacamba: `#${i.sequencia}`,
      local: i.endereco ?? "—",
    }))
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Registro de Caçambas</h1>
        <p className="text-sm text-white/75">Controle de entregas e retiradas realizadas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entregas Realizadas (Hoje)</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entregasHoje}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Retiradas Realizadas (Hoje)</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retiradasHoje}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Movimentação de Caçambas"
        data={registroData}
        columns={[
          { header: "Data", accessor: "data" },
          { 
            header: "Tipo", 
            accessor: (item) => (
              <Badge variant={item.tipo === "Entrega" ? "default" : "secondary"}>
                {String(item.tipo)}
              </Badge>
            )
          },
          { header: "Caçamba ID", accessor: "cacamba" },
          { header: "Localização", accessor: "local" },
        ]}
        pagination={{
          totalItems: registroData.length,
          pageSize: 10,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default RegistroCacambas;
