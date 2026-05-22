import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";

const bairroData = [
  { bairro: "Centro", emAndamento: 12, concluidas: 45, primeira: "10/01/2026", ultima: "20/05/2026" },
  { bairro: "Boa Viagem", emAndamento: 8, concluidas: 32, primeira: "15/01/2026", ultima: "18/05/2026" },
  { bairro: "Pina", emAndamento: 5, concluidas: 18, primeira: "20/01/2026", ultima: "15/05/2026" },
];

const LocacoesBairro = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Locação por Bairro</h1>
        <p className="text-sm text-white/75">Análise de desempenho e volume por localidade</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar bairro..." className="pl-9" />
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
        title="Dados por Bairro"
        data={bairroData}
        columns={[
          { header: "Bairro", accessor: "bairro", className: "font-medium" },
          { header: "Em Andamento", accessor: "emAndamento" },
          { header: "Concluídas", accessor: "concluidas" },
          { header: "Primeira Locação", accessor: "primeira" },
          { header: "Última Locação", accessor: "ultima" },
        ]}
        pagination={{
          totalItems: bairroData.length,
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