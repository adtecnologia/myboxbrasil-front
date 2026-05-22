import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { FileText, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transacao {
  id: number;
  locatario: string;
  data: string;
  valorBruto: number;
  taxas: number;
  valorLiquido: number;
  forma: string;
  status: string;
  tipo: string;
}

const Transacoes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();

  const transacoes: Transacao[] = [
    { 
      id: 1, 
      locatario: "Construtora Rocha", 
      data: "15/05/2026", 
      valorBruto: 450.00, 
      taxas: 15.00, 
      valorLiquido: 435.00, 
      forma: "Cartão de Crédito", 
      status: "Pago", 
      tipo: "A vista" 
    },
    { 
      id: 2, 
      locatario: "Engenharia Silva", 
      data: "14/05/2026", 
      valorBruto: 1200.00, 
      taxas: 36.00, 
      valorLiquido: 1164.00, 
      forma: "Boleto", 
      status: "Pago", 
      tipo: "A prazo" 
    },
    { 
      id: 3, 
      locatario: "Maria Oliveira", 
      data: "12/05/2026", 
      valorBruto: 380.00, 
      taxas: 0.00, 
      valorLiquido: 380.00, 
      forma: "PIX", 
      status: "Pago", 
      tipo: "A vista" 
    },
    { 
      id: 4, 
      locatario: "Construtora Rocha", 
      data: "10/05/2026", 
      valorBruto: 450.00, 
      taxas: 0.00, 
      valorLiquido: 450.00, 
      forma: "PIX", 
      status: "Pago", 
      tipo: "A vista" 
    },
    { 
      id: 5, 
      locatario: "Jardins LTDA", 
      data: "08/05/2026", 
      valorBruto: 890.00, 
      taxas: 26.70, 
      valorLiquido: 863.30, 
      forma: "Boleto", 
      status: "Pago", 
      tipo: "A prazo" 
    },
  ];

  const handleAnticipation = (id: number) => {
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de antecipação foi enviada para análise.",
    });
  };

  const handleReceipt = (id: number) => {
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

  const filteredData = transacoes.filter(t => 
    t.locatario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Transações" subtitle="Histórico de pagamentos recebidos dos locatários" />

      <DataTable
        data={filteredData}
        columns={columns}
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
        actions={(item) => (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2 gap-1 text-xs" 
              onClick={() => handleReceipt(item.id)}
              title="Ver Recibo"
            >
              <FileText className="h-3.5 w-3.5" />
              Recibo
            </Button>
            {item.forma === "Cartão de Crédito" && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2 gap-1 text-xs border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                onClick={() => handleAnticipation(item.id)}
                title="Pedir Antecipação"
              >
                <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                Antecipar
              </Button>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default Transacoes;