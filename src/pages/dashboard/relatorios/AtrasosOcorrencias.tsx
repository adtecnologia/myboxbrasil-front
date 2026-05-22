import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const atrasosData = [
  { 
    id: "1", 
    dataPlanejada: "22/05/2026 08:00", 
    dataRealizada: "22/05/2026 10:30", 
    descricao: "Trânsito intenso na marginal", 
    rota: "Rota Norte - Setor A", 
    cacamba: "C-452" 
  },
  { 
    id: "2", 
    dataPlanejada: "21/05/2026 14:00", 
    dataRealizada: "21/05/2026 16:45", 
    descricao: "Pneu furado no trajeto", 
    rota: "Rota Sul - Setor B", 
    cacamba: "C-112" 
  },
  { 
    id: "3", 
    dataPlanejada: "20/05/2026 09:00", 
    dataRealizada: "20/05/2026 09:45", 
    descricao: "Aguardando liberação no local", 
    rota: "Centro-Oeste", 
    cacamba: "C-889" 
  },
  { 
    id: "4", 
    dataPlanejada: "19/05/2026 10:00", 
    dataRealizada: "19/05/2026 11:20", 
    descricao: "Endereço de difícil acesso", 
    rota: "Vila Redentora", 
    cacamba: "C-223" 
  },
];

const ocorrenciasOperacionaisData = [
  { 
    id: "1", 
    data: "22/05/2026 11:15", 
    tipo: "Avaria", 
    descricao: "Caçamba com amassado lateral", 
    rota: "Rota Norte", 
    cacamba: "C-452",
    gravidade: "Baixa"
  },
  { 
    id: "2", 
    data: "21/05/2026 15:30", 
    tipo: "Acesso", 
    descricao: "Local obstruído por veículos", 
    rota: "Rota Sul", 
    cacamba: "C-112",
    gravidade: "Média"
  },
  { 
    id: "3", 
    data: "20/05/2026 16:00", 
    tipo: "Veículo", 
    descricao: "Falha mecânica no sistema hidráulico", 
    rota: "Logística Base", 
    cacamba: "-",
    gravidade: "Alta"
  },
];

const AtrasosOcorrencias = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Atrasos e Ocorrências Registradas</h1>
        <p className="text-sm text-white/75">Relatório de intercorrências durante a operação</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Atrasos</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Ocorrências</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Relatório de Atrasos (Planejado vs Realizado)"
        data={atrasosData}
        columns={[
          { header: "Planejado", accessor: "dataPlanejada" },
          { header: "Realizado", accessor: "dataRealizada" },
          { header: "Rota", accessor: "rota" },
          { header: "Caçamba", accessor: "cacamba" },
          { header: "Motivo", accessor: "descricao" },
          { 
            header: "Status", 
            accessor: () => (
              <Badge variant="destructive">
                Atrasado
              </Badge>
            )
          },
        ]}
        pagination={{
          totalItems: atrasosData.length,
          pageSize: 5,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />

      <DataTable
        title="Ocorrências Operacionais Registradas"
        data={ocorrenciasOperacionaisData}
        columns={[
          { header: "Data/Hora", accessor: "data" },
          { header: "Tipo", accessor: "tipo" },
          { header: "Rota", accessor: "rota" },
          { header: "Caçamba", accessor: "cacamba" },
          { header: "Descrição", accessor: "descricao" },
          { 
            header: "Gravidade", 
            accessor: (item) => (
              <Badge variant={item.gravidade === "Alta" ? "destructive" : item.gravidade === "Média" ? "default" : "secondary"}>
                {String(item.gravidade)}
              </Badge>
            )
          },
        ]}
        pagination={{
          totalItems: ocorrenciasOperacionaisData.length,
          pageSize: 5,
          currentPage: 1,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
};

export default AtrasosOcorrencias;
