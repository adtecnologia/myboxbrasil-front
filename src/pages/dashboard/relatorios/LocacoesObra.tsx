import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";

const obraData = [
  { obra: "Residencial Solar", emAndamento: 5, concluidas: 15, primeira: "10/01/2026", ultima: "20/05/2026" },
  { obra: "Edifício Mar", emAndamento: 3, concluidas: 12, primeira: "15/01/2026", ultima: "18/05/2026" },
  { obra: "Shopping Center", emAndamento: 2, concluidas: 8, primeira: "20/01/2026", ultima: "15/05/2026" },
];

const LocacoesObra = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Locação por Obra</h1>
        <p className="text-sm text-white/75">Monitoramento de ativos por canteiro de obras</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar obra..." className="pl-9" />
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
        title="Dados por Obra"
        data={obraData}
        columns={[
          { header: "Obra", accessor: "obra", className: "font-medium" },
          { header: "Em Andamento", accessor: "emAndamento" },
          { header: "Concluídas", accessor: "concluidas" },
          { header: "Primeira Locação", accessor: "primeira" },
          { header: "Última Locação", accessor: "ultima" },
        ]}
        pagination={{
          totalItems: obraData.length,
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