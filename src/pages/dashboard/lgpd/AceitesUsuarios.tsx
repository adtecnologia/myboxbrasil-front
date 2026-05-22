import { useState } from "react";
import { Search, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";

interface AceiteUsuario {
  id: string;
  dataHora: string;
  usuario: string;
  documento: string; // Ex: "Termos de Uso v2.1.0"
  dados: {
    ip: string;
    dispositivo: string;
    so: string;
    navegador: string;
    agente: string;
  };
}

const mockAceites: AceiteUsuario[] = [
  { 
    id: "1", 
    dataHora: "14/05/2026 10:32:15", 
    usuario: "João Silva (joao@email.com)", 
    documento: "Termos de Uso v2.1.0",
    dados: {
      ip: "189.123.45.67",
      dispositivo: "Desktop",
      so: "Windows 11",
      navegador: "Chrome 124.0",
      agente: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
    }
  },
  { 
    id: "2", 
    dataHora: "14/05/2026 09:15:22", 
    usuario: "Maria Oliveira (maria@empresa.com.br)", 
    documento: "Política de Privacidade v1.2.0",
    dados: {
      ip: "177.89.231.12",
      dispositivo: "Mobile",
      so: "iOS 17.4",
      navegador: "Safari Mobile",
      agente: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)..."
    }
  },
];

const AceitesUsuarios = () => {
  const [aceites] = useState<AceiteUsuario[]>(mockAceites);
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  const filtered = aceites.filter((a) =>
    a.usuario.toLowerCase().includes(search.toLowerCase()) ||
    a.documento.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Aceites dos Usuários</h1>
          <p className="text-sm text-white/75">Log de conformidade e aceites jurídicos</p>
        </div>
      </div>

      <DataTable<AceiteUsuario>
        title={`${aceites.length} registros encontrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por usuário ou doc..."
        columns={[
          { header: "Data/Hora", accessor: "dataHora", className: "text-sm whitespace-nowrap" },
          { header: "Usuário", accessor: "usuario", className: "font-medium" },
          {
            header: "Documento",
            accessor: (a) => (
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                {a.documento}
              </span>
            ),
          },
          {
            header: "Dados Técnicos",
            accessor: (a) => (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-help text-xs text-muted-foreground">
                      <Info className="h-3.5 w-3.5" />
                      <span>{a.dados.ip} • {a.dados.dispositivo}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="w-80 p-3">
                    <div className="space-y-2 text-xs">
                      <p><strong>IP:</strong> {a.dados.ip}</p>
                      <p><strong>Dispositivo:</strong> {a.dados.dispositivo}</p>
                      <p><strong>S.O.:</strong> {a.dados.so}</p>
                      <p><strong>Navegador:</strong> {a.dados.navegador}</p>
                      <p className="break-all opacity-70"><strong>User-Agent:</strong> {a.dados.agente}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ),
          },
        ]}
        renderMobileCard={(a) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-foreground break-words">{a.usuario}</p>
                <p className="text-xs text-primary font-medium mt-1">{a.documento}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{a.dataHora}</span>
            </div>
            <div className="bg-muted/50 p-2 rounded text-[10px] space-y-1 text-muted-foreground">
              <div className="grid grid-cols-2">
                <span>IP: {a.dados.ip}</span>
                <span>Disp: {a.dados.dispositivo}</span>
              </div>
              <div>S.O.: {a.dados.so}</div>
              <div>Nav: {a.dados.navegador}</div>
              <div className="truncate">Agent: {a.dados.agente}</div>
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

export default AceitesUsuarios;
