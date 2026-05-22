import { useState } from "react";
import { Search, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";

interface VeiculoAdmin {
  id: string;
  foto?: string;
  locador: string;
  modeloCacamba: string;
  tipoLocacao: "Externo" | "Interno" | "Ambos";
  precoExterno: string;
  precoInterno: string;
  diasExterno: number;
  diasInterno: number;
  tampa: "Sim" | "Não";
  cor: string;
}

const mockVeiculos: VeiculoAdmin[] = [
  { 
    id: "1", 
    locador: "Silva Transportes", 
    modeloCacamba: "Padrão 4m³", 
    tipoLocacao: "Ambos",
    precoExterno: "250,00",
    precoInterno: "200,00",
    diasExterno: 3,
    diasInterno: 5,
    tampa: "Não",
    cor: "Azul"
  },
  { 
    id: "2", 
    locador: "Oliveira Entulhos", 
    modeloCacamba: "Mini 3m³", 
    tipoLocacao: "Externo",
    precoExterno: "180,00",
    precoInterno: "-",
    diasExterno: 2,
    diasInterno: 0,
    tampa: "Sim",
    cor: "Verde"
  },
];

const CacambasAdmin = () => {
  const [veiculos] = useState<VeiculoAdmin[]>(mockVeiculos);
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  const filtered = veiculos.filter((v) =>
    v.locador.toLowerCase().includes(search.toLowerCase()) ||
    v.modeloCacamba.toLowerCase().includes(search.toLowerCase()) ||
    v.cor.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Listagem de Caçambas</h1>
          <p className="text-sm text-white/75">Visão geral das caçambas e especificações de locação</p>
        </div>
      </div>

      <DataTable<VeiculoAdmin>
        title={`${veiculos.length} veículos registrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por locador, modelo ou cor..."
        columns={[
          {
            header: "Foto",
            accessor: () => (
              <div className="h-10 w-10 mx-auto rounded bg-muted flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
              </div>
            ),
            align: "center",
          },
          { header: "Locador", accessor: "locador", className: "font-medium text-sm" },
          { header: "Modelo", accessor: "modeloCacamba", className: "text-sm" },
          {
            header: "Locação",
            accessor: (v) => <Badge variant="secondary" className="text-[10px] font-normal">{v.tipoLocacao}</Badge>,
          },
          {
            header: "Preço (Ext/Int)",
            accessor: (v) => (
              <div className="flex flex-col text-xs">
                <span>Ext: R$ {v.precoExterno}</span>
                <span>Int: R$ {v.precoInterno}</span>
              </div>
            ),
          },
          {
            header: "Dias (Ext/Int)",
            accessor: (v) => (
              <div className="flex flex-col text-xs">
                <span>Ext: {v.diasExterno} dias</span>
                <span>Int: {v.diasInterno} dias</span>
              </div>
            ),
          },
          { header: "Tampa", accessor: "tampa", align: "center", className: "text-xs" },
          { header: "Cor", accessor: "cor", className: "text-xs" },
        ]}
        renderMobileCard={(v) => (
          <div className="rounded-lg border border-border bg-background p-4 shadow-sm space-y-3">
            <div className="flex gap-3">
              <div className="h-16 w-16 shrink-0 rounded bg-muted flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-foreground truncate">{v.locador}</p>
                <p className="text-xs text-primary font-medium">{v.modeloCacamba}</p>
                <Badge variant="outline" className="text-[10px] mt-1">{v.tipoLocacao}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] bg-muted/30 p-2 rounded">
              <div><span className="text-muted-foreground">Preço Ext:</span> R$ {v.precoExterno}</div>
              <div><span className="text-muted-foreground">Preço Int:</span> R$ {v.precoInterno}</div>
              <div><span className="text-muted-foreground">Dias Ext:</span> {v.diasExterno}d</div>
              <div><span className="text-muted-foreground">Dias Int:</span> {v.diasInterno}d</div>
              <div><span className="text-muted-foreground">Tampa:</span> {v.tampa}</div>
              <div><span className="text-muted-foreground">Cor:</span> {v.cor}</div>
            </div>
          </div>
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

export default CacambasAdmin;
