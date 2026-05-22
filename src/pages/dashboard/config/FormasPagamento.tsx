import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";

interface FormaPagamento {
  id: string;
  nome: string;
  situacao: "Ativo" | "Inativo";
}

const mockFormas: FormaPagamento[] = [
  { id: "1", nome: "Cartão Débito", situacao: "Inativo" },
  { id: "2", nome: "Cartão Crédito", situacao: "Ativo" },
  { id: "3", nome: "Pix", situacao: "Inativo" },
  { id: "4", nome: "Boleto 7 Dias", situacao: "Ativo" },
  { id: "5", nome: "Boleto 15 Dias", situacao: "Ativo" },
  { id: "6", nome: "Boleto 30 Dias", situacao: "Ativo" },
];

const FormasPagamento = () => {
  const [formas, setFormas] = useState<FormaPagamento[]>(mockFormas);
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  const toggleSituacao = (id: string) => {
    setFormas(formas.map(f => 
      f.id === id ? { ...f, situacao: f.situacao === "Ativo" ? "Inativo" : "Ativo" } : f
    ));
  };

  const filtered = formas.filter((f) =>
    f.nome.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Formas de Pagamento</h1>
          <p className="text-sm text-white/75">Gerencie a disponibilidade das formas de pagamento</p>
        </div>
      </div>

      <DataTable<FormaPagamento>
        title={`${formas.length} formas cadastradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Forma de Pagamento", accessor: "nome", className: "font-medium" },
          { 
            header: "Situação", 
            accessor: (f) => (
              <Badge variant={f.situacao === "Ativo" ? "default" : "secondary"}>
                {f.situacao}
              </Badge>
            ),
            className: "w-32"
          },
        ]}
        renderMobileCard={(f) => (
          <div className="rounded-lg border border-border bg-background p-4 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground">{f.nome}</p>
              <div className="mt-1">
                <Badge variant={f.situacao === "Ativo" ? "default" : "secondary"} className="text-[10px] h-5">
                  {f.situacao}
                </Badge>
              </div>
            </div>
            <div className="ml-4">
              <Switch 
                checked={f.situacao === "Ativo"} 
                onCheckedChange={() => toggleSituacao(f.id)} 
              />
            </div>
          </div>
        )}
        actions={(f) => (
          <Switch 
            checked={f.situacao === "Ativo"} 
            onCheckedChange={() => toggleSituacao(f.id)} 
          />
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

export default FormasPagamento;
