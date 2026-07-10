import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { useLocadorTable } from "@/hooks/useLocadorTable";

interface FormaPagamento {
  id: string;
  nome: string;
  tipo: string | null;
  ativo: boolean;
}

const FormasPagamento = () => {
  const { rows: formas, update } = useLocadorTable<FormaPagamento>("formas_pagamento");
  const [search, setSearch] = useState("");

  const toggleSituacao = async (f: FormaPagamento) => {
    await update(f.id, { ativo: !f.ativo });
  };

  const filtered = formas.filter((f) => f.nome.toLowerCase().includes(search.toLowerCase()));
  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <h1 className="text-xl sm:text-2xl font-bold">Formas de Pagamento</h1>
        <p className="text-sm text-white/75">Gerencie a disponibilidade das formas de pagamento</p>
      </div>

      <DataTable<FormaPagamento>
        title={`${formas.length} formas cadastradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Forma de Pagamento", accessor: "nome", className: "font-medium" },
          { header: "Tipo", accessor: (f) => f.tipo ? <Badge variant="outline" className="capitalize text-[10px] font-normal">{f.tipo}</Badge> : "-" },
          {
            header: "Situação",
            accessor: (f) => (
              <Badge variant={f.ativo ? "default" : "secondary"}>{f.ativo ? "Ativo" : "Inativo"}</Badge>
            ),
            className: "w-32",
          },
        ]}
        renderMobileCard={(f) => (
          <div className="rounded-lg border border-border bg-background p-4 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground">{f.nome}</p>
              <div className="mt-1 flex gap-2">
                {f.tipo && <Badge variant="outline" className="capitalize text-[10px] h-5">{f.tipo}</Badge>}
                <Badge variant={f.ativo ? "default" : "secondary"} className="text-[10px] h-5">{f.ativo ? "Ativo" : "Inativo"}</Badge>
              </div>
            </div>
            <Switch checked={f.ativo} onCheckedChange={() => toggleSituacao(f)} />
          </div>
        )}
        actions={(f) => (
          <Switch checked={f.ativo} onCheckedChange={() => toggleSituacao(f)} />
        )}
        pagination={{ totalItems, pageSize, currentPage, onPageChange: setCurrentPage, onPageSizeChange: setPageSize }}
      />
    </div>
  );
};

export default FormasPagamento;
