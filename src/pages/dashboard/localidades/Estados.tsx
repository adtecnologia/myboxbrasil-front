import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";

interface Estado {
  id: string;
  nome: string;
  sigla: string;
  codigoIbge: string;
}

const Estados = () => {
  const [search, setSearch] = useState("");
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
        const data = await response.json();
        const formattedData = data.map((item: any) => ({
          id: String(item.id),
          nome: item.nome,
          sigla: item.sigla,
          codigoIbge: String(item.id),
        }));
        setEstados(formattedData);
      } catch (error) {
        console.error("Erro ao buscar estados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstados();
  }, []);

  const filtered = estados.filter((e) =>
    e.nome.toLowerCase().includes(search.toLowerCase()) ||
    e.sigla.toLowerCase().includes(search.toLowerCase()) ||
    e.codigoIbge.includes(search)
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Estados</h1>
          <p className="text-sm text-white/75">Listagem oficial de estados e códigos IBGE</p>
        </div>
      </div>

      <DataTable<Estado>
      loading={loading}
        title={`${estados.length} estados disponíveis`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, sigla ou código..."
        columns={[
          { header: "Sigla", accessor: "sigla", className: "font-bold w-24" },
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "Código IBGE", accessor: "codigoIbge", className: "text-muted-foreground w-40" },
        ]}
        renderMobileCard={(e) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div>
              <p className="font-medium text-sm text-foreground">{e.nome}</p>
              <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                <span className="font-bold">{e.sigla}</span>
                <span>•</span>
                <span>IBGE: {e.codigoIbge}</span>
              </div>
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

export default Estados;