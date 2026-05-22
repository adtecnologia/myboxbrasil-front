import { useState } from "react";
import { Search, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";

interface Documento {
  id: string;
  tipo: "MTR" | "CDF" | "NF";
  numero: string;
  dataEmissao: string;
  entradaId: string;
  cliente: string;
  status: string;
}

const mockDocs: Documento[] = [
  { id: "1", tipo: "MTR", numero: "MTR-2026-001", dataEmissao: "2026-03-28", entradaId: "ENT-001", cliente: "Construtora Alpha", status: "Emitido" },
  { id: "2", tipo: "CDF", numero: "CDF-2026-001", dataEmissao: "2026-03-28", entradaId: "ENT-001", cliente: "Construtora Alpha", status: "Emitido" },
  { id: "3", tipo: "MTR", numero: "MTR-2026-002", dataEmissao: "2026-03-28", entradaId: "ENT-002", cliente: "Demolidora Beta", status: "Pendente" },
  { id: "4", tipo: "MTR", numero: "MTR-2026-003", dataEmissao: "2026-03-27", entradaId: "ENT-003", cliente: "Empreiteira Gama", status: "Emitido" },
  { id: "5", tipo: "CDF", numero: "CDF-2026-002", dataEmissao: "2026-03-27", entradaId: "ENT-003", cliente: "Empreiteira Gama", status: "Emitido" },
  { id: "6", tipo: "NF", numero: "NF-2026-001", dataEmissao: "2026-03-27", entradaId: "ENT-003", cliente: "Empreiteira Gama", status: "Emitido" },
];

const tipoBadge: Record<string, string> = {
  MTR: "bg-blue-100 text-blue-700",
  CDF: "bg-purple-100 text-purple-700",
  NF: "bg-orange-100 text-orange-700",
};

const Documentos = () => {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const isMobile = useIsMobile();

  const filtered = mockDocs.filter((d) => {
    const matchSearch = d.numero.toLowerCase().includes(search.toLowerCase()) || d.cliente.toLowerCase().includes(search.toLowerCase());
    const matchTipo = tipoFilter === "todos" || d.tipo === tipoFilter;
    return matchSearch && matchTipo;
  });

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <h1 className="text-xl sm:text-2xl font-bold">Documentos</h1>
        <p className="text-sm text-white/75">MTR, CDF e Notas Fiscais vinculados às entradas</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-blue-100 p-2"><FileText className="h-5 w-5 text-blue-700" /></div><div><p className="text-xs text-muted-foreground">MTRs</p><p className="text-xl font-bold text-foreground">{mockDocs.filter(d => d.tipo === "MTR").length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-purple-100 p-2"><FileText className="h-5 w-5 text-purple-700" /></div><div><p className="text-xs text-muted-foreground">CDFs</p><p className="text-xl font-bold text-foreground">{mockDocs.filter(d => d.tipo === "CDF").length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg bg-orange-100 p-2"><FileText className="h-5 w-5 text-orange-700" /></div><div><p className="text-xs text-muted-foreground">NFs</p><p className="text-xl font-bold text-foreground">{mockDocs.filter(d => d.tipo === "NF").length}</p></div></CardContent></Card>
      </div>

      <DataTable<Documento>
        title="Documentos emitidos"
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        activeFiltersCount={tipoFilter !== "todos" ? 1 : 0}
        onClearFilters={() => setTipoFilter("todos")}
        filters={
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Tipo de Documento</h4>
              <p className="text-sm text-muted-foreground">Filtre por MTR, CDF ou NF.</p>
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="MTR">MTR</SelectItem>
                <SelectItem value="CDF">CDF</SelectItem>
                <SelectItem value="NF">NF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        columns={[
          {
            header: "Tipo",
            accessor: (d) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tipoBadge[d.tipo]}`}>{d.tipo}</span>,
          },
          { header: "Número", accessor: "numero", className: "font-medium" },
          { header: "Data", accessor: "dataEmissao" },
          { header: "Entrada", accessor: "entradaId" },
          { header: "Cliente", accessor: "cliente" },
          {
            header: "Status",
            accessor: (d) => <Badge variant={d.status === "Emitido" ? "default" : "secondary"}>{d.status}</Badge>,
          },
        ]}
        renderMobileCard={(d) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${tipoBadge[d.tipo]}`}>{d.tipo}</span>
                <p className="font-medium text-sm text-foreground">{d.numero}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>{d.dataEmissao}</span>
              <span>{d.entradaId}</span>
              <span>{d.cliente}</span>
            </div>
            <Badge variant={d.status === "Emitido" ? "default" : "secondary"} className="text-[10px]">{d.status}</Badge>
          </div>
        )}
        actions={(d) => (
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" title="Download">
            <Download className="h-4 w-4" />
          </Button>
        )}
        pagination={{
          totalItems,
          pageSize,
          currentPage,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
};

export default Documentos;
