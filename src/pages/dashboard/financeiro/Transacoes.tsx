import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { FileText, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

interface Transacao {
  id: string;
  locatario: string;
  data: string;
  valorBruto: number;
  taxas: number;
  valorLiquido: number;
  forma: string;
  status: string;
  tipo: string;
}

const FORMA_LABEL: Record<string, { label: string; taxa: number; tipo: "A vista" | "A prazo" }> = {
  pix: { label: "PIX", taxa: 0, tipo: "A vista" },
  dinheiro: { label: "Dinheiro", taxa: 0, tipo: "A vista" },
  cartao: { label: "Cartão de Crédito", taxa: 0.033, tipo: "A vista" },
  cartao_credito: { label: "Cartão de Crédito", taxa: 0.033, tipo: "A vista" },
  credit_card: { label: "Cartão de Crédito", taxa: 0.033, tipo: "A vista" },
  credito: { label: "Cartão de Crédito", taxa: 0.033, tipo: "A vista" },
  boleto: { label: "Boleto", taxa: 0.03, tipo: "A prazo" },
};

function mapForma(fp: string | null | undefined) {
  const key = String(fp ?? "").toLowerCase();
  return FORMA_LABEL[key] ?? { label: fp || "—", taxa: 0, tipo: "A prazo" as const };
}

const Transacoes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();
  const locadorId = useAuthStore((s) => s.user?.id);

  const { data: transacoes = [], isLoading } = useQuery({
    queryKey: ["transacoes-locador", locadorId],
    enabled: !!locadorId,
    queryFn: async () => {
      const { data: faturas, error } = await supabase
        .from("faturas")
        .select("id, valor_total, status, paga_em, created_at, forma_pagamento, locatario_id")
        .eq("locador_id", locadorId!)
        .eq("status", "paga")
        .order("paga_em", { ascending: false });
      if (error) throw error;
      const ids = Array.from(new Set((faturas ?? []).map((f) => f.locatario_id).filter(Boolean))) as string[];
      const nomes = new Map<string, string>();
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nome, nome_fantasia")
          .in("id", ids);
        (profs ?? []).forEach((p: any) => nomes.set(p.id, p.nome_fantasia || p.nome || "Locatário"));
      }
      return (faturas ?? []).map<Transacao>((f: any) => {
        const info = mapForma(f.forma_pagamento);
        const bruto = Number(f.valor_total ?? 0);
        const taxas = +(bruto * info.taxa).toFixed(2);
        const ref = f.paga_em ? new Date(f.paga_em) : new Date(f.created_at);
        return {
          id: f.id,
          locatario: nomes.get(f.locatario_id) ?? "—",
          data: ref.toLocaleDateString("pt-BR"),
          valorBruto: bruto,
          taxas,
          valorLiquido: +(bruto - taxas).toFixed(2),
          forma: info.label,
          status: "Pago",
          tipo: info.tipo,
        };
      });
    },
  });

  const handleAnticipation = (_id: string) => {
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de antecipação foi enviada para análise.",
    });
  };

  const handleReceipt = (_id: string) => {
    toast({
      title: "Recibo",
      description: "O recibo está sendo gerado e o download começará em breve.",
    });
  };

  const columns: Column<Transacao>[] = [
    { 
      header: "Locatário", 
      accessor: "locatario",
      className: "font-semibold text-foreground"
    },
    { 
      header: "Data", 
      accessor: "data",
      className: "text-muted-foreground"
    },
    { 
      header: "Tipo", 
      accessor: (item) => (
        <Badge variant="outline" className={`text-[10px] border-0 font-bold ${
          item.tipo === "A vista" ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"
        }`}>
          {item.tipo}
        </Badge>
      )
    },
    { 
      header: "Forma", 
      accessor: "forma",
      className: "font-medium"
    },
    { 
      header: "Vlr. Bruto", 
      accessor: (item) => `R$ ${item.valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      className: "font-medium"
    },
    { 
      header: "Custos (Taxas)", 
      accessor: (item) => `R$ ${item.taxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      className: "text-red-500 font-medium"
    },
    { 
      header: "Vlr. Líquido", 
      accessor: (item) => `R$ ${item.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      className: "font-bold text-foreground"
    },
    { 
      header: "Status", 
      accessor: (item) => (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] font-bold">
          {item.status}
        </Badge>
      )
    },
  ];

  const filteredData = useMemo(
    () => transacoes.filter((t) => t.locatario.toLowerCase().includes(searchTerm.toLowerCase())),
    [transacoes, searchTerm]
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Transações" subtitle="Histórico de pagamentos recebidos dos locatários" />

      <DataTable
        data={filteredData}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Buscar por locatário..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        pagination={{
          totalItems: filteredData.length,
          pageSize: pageSize,
          currentPage: currentPage,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize
        }}
      />
    </div>
  );
};

export default Transacoes;