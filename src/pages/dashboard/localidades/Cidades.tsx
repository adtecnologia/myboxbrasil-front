import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Cidade {
  id: string;
  nome: string;
  estado: string;
  codigoIbge: string;
  taxaOperacional: number;
}

interface Estado {
  sigla: string;
  nome: string;
}

const Cidades = () => {
  const [search, setSearch] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<string>("SP");
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [pendingChange, setPendingChange] = useState<{
    cidade: Cidade;
    novaTaxa: number;
  } | null>(null);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
        const data = await response.json();
        setEstados(data.map((item: any) => ({
          sigla: item.sigla,
          nome: item.nome
        })));
      } catch (error) {
        console.error("Erro ao buscar estados:", error);
      }
    };
    fetchEstados();
  }, []);

  useEffect(() => {
    const fetchCidades = async () => {
      if (!selectedEstado) return;
      setLoading(true);
      try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/municipios`);
        const data = await response.json();
        const codigos = data.map((d: any) => String(d.id));
        const { data: taxasData } = await supabase
          .from("cidades_taxas")
          .select("codigo_ibge, taxa_operacional")
          .in("codigo_ibge", codigos);
        const taxasMap = new Map<string, number>(
          (taxasData ?? []).map((t: any) => [t.codigo_ibge, Number(t.taxa_operacional)])
        );
        const formattedData: Cidade[] = data.map((item: any) => ({
          id: String(item.id),
          nome: item.nome,
          estado: selectedEstado,
          codigoIbge: String(item.id),
          taxaOperacional: taxasMap.get(String(item.id)) ?? 0,
        }));
        setCidades(formattedData);
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCidades();
  }, [selectedEstado]);

  const filtered = cidades.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.codigoIbge.includes(search)
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const startEdit = (c: Cidade) => {
    setEditingId(c.id);
    setEditValue(String(c.taxaOperacional ?? 0).replace(".", ","));
  };

  const commitEdit = (c: Cidade) => {
    const parsed = parseFloat(editValue.replace(",", "."));
    setEditingId(null);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast({ title: "Valor inválido", description: "Informe um número entre 0 e 100.", variant: "destructive" });
      return;
    }
    if (parsed === Number(c.taxaOperacional)) return;
    setPendingChange({ cidade: c, novaTaxa: parsed });
  };

  const confirmChange = async () => {
    if (!pendingChange) return;
    const { cidade, novaTaxa } = pendingChange;
    const { error } = await supabase
      .from("cidades_taxas")
      .upsert(
        {
          codigo_ibge: cidade.codigoIbge,
          estado: cidade.estado,
          nome: cidade.nome,
          taxa_operacional: novaTaxa,
        },
        { onConflict: "codigo_ibge" }
      );
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      setCidades((prev) =>
        prev.map((x) => (x.id === cidade.id ? { ...x, taxaOperacional: novaTaxa } : x))
      );
      toast({ title: "Taxa atualizada", description: `${cidade.nome}: ${novaTaxa}%` });
    }
    setPendingChange(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Cidades</h1>
          <p className="text-sm text-white/75">Listagem oficial de municípios por estado</p>
        </div>
      </div>

      <DataTable<Cidade>
        title={`${totalItems} cidades encontradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome ou código..."
        filters={
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Filtrar por Estado</h4>
              <p className="text-sm text-muted-foreground">Selecione o estado para listar os municípios.</p>
            </div>
            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map((est) => (
                  <SelectItem key={est.sigla} value={est.sigla}>
                    {est.nome} ({est.sigla})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        activeFiltersCount={selectedEstado ? 1 : 0}
        columns={[
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "Estado", accessor: "estado", className: "w-32" },
          { header: "Código IBGE", accessor: "codigoIbge", className: "text-muted-foreground w-40" },
          {
            header: "Taxa Operacional",
            className: "w-48",
            accessor: (c) =>
              editingId === c.id ? (
                <Input
                  autoFocus
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(c)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      (e.target as HTMLInputElement).blur();
                    } else if (e.key === "Escape") {
                      setEditingId(null);
                    }
                  }}
                  className="h-8 w-28"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="rounded px-2 py-1 text-left hover:bg-muted/40 transition-colors"
                >
                  {Number(c.taxaOperacional).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}%
                </button>
              ),
          },
        ]}
        renderMobileCard={(c) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div>
              <p className="font-medium text-sm text-foreground">{c.nome}</p>
              <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                <span className="font-bold">{c.estado}</span>
                <span>•</span>
                <span>IBGE: {c.codigoIbge}</span>
              </div>
              <div className="mt-2 text-xs">
                <span className="text-muted-foreground">Taxa Operacional: </span>
                {editingId === c.id ? (
                  <Input
                    autoFocus
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => commitEdit(c)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                      } else if (e.key === "Escape") {
                        setEditingId(null);
                      }
                    }}
                    className="h-8 w-28 inline-block"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {Number(c.taxaOperacional).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}%
                  </button>
                )}
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

      <AlertDialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja alterar a Taxa Operacional de{" "}
              <strong>{pendingChange?.cidade.nome}</strong> para{" "}
              <strong>
                {pendingChange?.novaTaxa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}%
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmChange}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cidades;