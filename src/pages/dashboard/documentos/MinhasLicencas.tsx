import { useState } from "react";
import { Search, FileCheck, Download, Filter, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";

interface Licenca {
  id: string;
  nome: string;
  orgao: string;
  numero: string;
  dataEmissao: string;
  dataVencimento: string;
  status: "Vigente" | "Vencendo" | "Vencida" | "Em Renovação";
}

const mockLicencas: Licenca[] = [];

const MinhasLicencas = () => {
  const [search, setSearch] = useState("");

  const filtered = mockLicencas.filter((l) =>
    l.nome.toLowerCase().includes(search.toLowerCase()) ||
    l.numero.toLowerCase().includes(search.toLowerCase()) ||
    l.orgao.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const getStatusBadge = (status: Licenca["status"]) => {
    switch (status) {
      case "Vigente":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 flex gap-1 items-center w-fit"><ShieldCheck className="h-3 w-3" /> Vigente</Badge>;
      case "Vencendo":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 flex gap-1 items-center w-fit"><Clock className="h-3 w-3" /> Vencendo</Badge>;
      case "Vencida":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 flex gap-1 items-center w-fit"><AlertTriangle className="h-3 w-3" /> Vencida</Badge>;
      case "Em Renovação":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 flex gap-1 items-center w-fit"><Clock className="h-3 w-3" /> Em Renovação</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Minhas Licenças" 
        subtitle="Controle de validade e status das licenças ambientais e operacionais"
      />

      <DataTable<Licenca>
        title={`${totalItems} licenças cadastradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Licença",
            accessor: (l) => (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{l.nome}</p>
                  <p className="text-[11px] text-muted-foreground">{l.orgao}</p>
                </div>
              </div>
            ),
          },
          { header: "Número", accessor: "numero" },
          { header: "Emissão", accessor: (l) => new Date(l.dataEmissao).toLocaleDateString() },
          { 
            header: "Vencimento", 
            accessor: (l) => (
              <span className={l.status === "Vencida" ? "text-red-600 font-bold" : l.status === "Vencendo" ? "text-orange-600 font-bold" : ""}>
                {new Date(l.dataVencimento).toLocaleDateString()}
              </span>
            )
          },
          { 
            header: "Status", 
            accessor: (l) => getStatusBadge(l.status)
          },
        ]}
        renderMobileCard={(l) => (
          <div className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-base text-foreground">{l.nome}</p>
                  <p className="text-xs text-muted-foreground">{l.orgao}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Número</p>
                <p className="font-medium">{l.numero}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Status</p>
                {getStatusBadge(l.status)}
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Emissão</p>
                <p className="font-medium">{new Date(l.dataEmissao).toLocaleDateString()}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Vencimento</p>
                <p className={`font-bold ${l.status === "Vencida" ? "text-red-600" : l.status === "Vencendo" ? "text-orange-600" : ""}`}>
                  {new Date(l.dataVencimento).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
        actions={(l) => (
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" title="Download Arquivo">
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

export default MinhasLicencas;