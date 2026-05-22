import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, BarChart3, PieChart } from "lucide-react";
import { usePagination } from "@/components/DataPagination";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const classeData = [
  { name: "Classe A", valor: 450, color: "#10b981" },
  { name: "Classe B", valor: 300, color: "#3b82f6" },
  { name: "Classe C", valor: 120, color: "#f59e0b" },
  { name: "Classe D", valor: 80, color: "#ef4444" },
];

const ClasseResiduos = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold italic">Classe de Resíduos</h1>
        <p className="text-sm text-white/75">KPI e volumetria por classe de resíduo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Distribuição por Classe (Toneladas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                    {classeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Resumo Mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{item.valor}t</p>
                  <p className="text-[10px] text-muted-foreground">{((item.valor / 950) * 100).toFixed(1)}% do total</p>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Total Geral</span>
                <span className="text-sm font-bold">950t</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Detalhamento por Classe"
        data={classeData}
        columns={[
          { header: "Classe", accessor: "name", className: "font-medium" },
          { header: "Total (t)", accessor: (d) => `${d.valor} t` },
          { header: "Percentual", accessor: (d) => `${((d.valor / 950) * 100).toFixed(1)}%` },
        ]}
        pagination={{
          totalItems: classeData.length,
          pageSize: 10,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default ClasseResiduos;
