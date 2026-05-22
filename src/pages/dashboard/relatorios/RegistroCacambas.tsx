import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Package, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const registroData = [
  { id: "1", data: "22/05/2026", tipo: "Entrega", cacamba: "C-452", local: "Rua das Flores, 123" },
  { id: "2", data: "22/05/2026", tipo: "Retirada", cacamba: "C-112", local: "Av. Brasil, 500" },
  { id: "3", data: "22/05/2026", tipo: "Entrega", cacamba: "C-889", local: "Rua Piauí, 45" },
];

const RegistroCacambas = () => {
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
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Retiradas Realizadas (Hoje)</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
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
