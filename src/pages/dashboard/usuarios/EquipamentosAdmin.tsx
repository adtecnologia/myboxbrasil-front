import { useState } from "react";
import { Image as ImageIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { EquipamentoForm, EquipamentoFormData } from "@/components/EquipamentoForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

interface EquipamentoAdmin {
  id: string;
  foto?: string;
  locador: string;
  tipoEquipamento: string;
  nome: string;
  valorDiaria: string;
  valorSemanal: string;
  valorQuinzenal: string;
  valorMensal: string;
  descricao: string;
  orientacoesOperacao: string;
  orientacoesSeguranca: string;
  fotos: string[];
  unidades: { id: string; codigo: string; disponivel: boolean }[];
}

const mockEquipamentos: EquipamentoAdmin[] = [
  {
    id: "1",
    locador: "Silva Transportes",
    tipoEquipamento: "Prensa Hidráulica",
    nome: "Prensa X-500",
    valorDiaria: "150,00",
    valorSemanal: "800,00",
    valorQuinzenal: "1.500,00",
    valorMensal: "2.800,00",
    descricao: "",
    orientacoesOperacao: "",
    orientacoesSeguranca: "",
    fotos: [],
    unidades: [
      { id: "e1", codigo: "EQP-001", disponivel: true },
      { id: "e2", codigo: "EQP-002", disponivel: false },
    ],
  },
  {
    id: "2",
    locador: "Oliveira Entulhos",
    tipoEquipamento: "Triturador",
    nome: "Triturador T-200",
    valorDiaria: "200,00",
    valorSemanal: "1.100,00",
    valorQuinzenal: "2.000,00",
    valorMensal: "3.500,00",
    descricao: "",
    orientacoesOperacao: "",
    orientacoesSeguranca: "",
    fotos: [],
    unidades: [
      { id: "e3", codigo: "EQP-003", disponivel: true },
    ],
  },
];

const EquipamentosAdmin = () => {
  const [equipamentos, setEquipamentos] = useState<EquipamentoAdmin[]>(mockEquipamentos);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EquipamentoAdmin | null>(null);
  const activeProfileType = useAuthStore((s) => s.activeProfileType());
  const isLocador = activeProfileType === "locador";

  const filtered = equipamentos.filter((e) =>
    e.locador.toLowerCase().includes(search.toLowerCase()) ||
    e.tipoEquipamento.toLowerCase().includes(search.toLowerCase()) ||
    e.nome.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleCreate = (data: EquipamentoFormData) => {
    const novo: EquipamentoAdmin = {
      id: Math.random().toString(36).substr(2, 9),
      locador: "Meu Locador",
      tipoEquipamento: data.tipoEquipamento,
      nome: data.nome,
      valorDiaria: data.precoDiario,
      valorSemanal: data.precoSemanal,
      valorQuinzenal: data.precoQuinzenal,
      valorMensal: data.precoMensal,
      descricao: data.descricao,
      orientacoesOperacao: data.orientacoesOperacao,
      orientacoesSeguranca: data.orientacoesSeguranca,
      fotos: data.fotos,
      unidades: data.unidades,
    };
    setEquipamentos([novo, ...equipamentos]);
    setIsDialogOpen(false);
    toast.success("Equipamento cadastrado com sucesso!");
  };

  const handleEdit = (data: EquipamentoFormData) => {
    if (!editing) return;
    setEquipamentos(equipamentos.map((e) =>
      e.id === editing.id
        ? {
            ...e,
            tipoEquipamento: data.tipoEquipamento,
            nome: data.nome,
            valorDiaria: data.precoDiario,
            valorSemanal: data.precoSemanal,
            valorQuinzenal: data.precoQuinzenal,
            valorMensal: data.precoMensal,
            descricao: data.descricao,
            orientacoesOperacao: data.orientacoesOperacao,
            orientacoesSeguranca: data.orientacoesSeguranca,
            fotos: data.fotos,
            unidades: data.unidades,
          }
        : e
    ));
    setEditing(null);
    setIsDialogOpen(false);
    toast.success("Equipamento atualizado com sucesso!");
  };

  const handleDelete = (id: string) => {
    setEquipamentos(equipamentos.filter((e) => e.id !== id));
    toast.success("Equipamento removido com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold italic">Gestão de Equipamentos</h1>
          <p className="text-sm text-white/75">Gerencie seu inventário e valores de locação</p>
        </div>
        {isLocador && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditing(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
                <Plus className="mr-2 h-4 w-4" />
                Novo Equipamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 shrink-0 border-b">
                <DialogTitle>{editing ? "Editar Equipamento" : "Cadastrar Novo Equipamento"}</DialogTitle>
              </DialogHeader>
              <EquipamentoForm
                initialData={editing ? {
                  tipoEquipamento: editing.tipoEquipamento,
                  nome: editing.nome,
                  precoDiario: editing.valorDiaria,
                  precoSemanal: editing.valorSemanal,
                  precoQuinzenal: editing.valorQuinzenal,
                  precoMensal: editing.valorMensal,
                  descricao: editing.descricao,
                  orientacoesOperacao: editing.orientacoesOperacao,
                  orientacoesSeguranca: editing.orientacoesSeguranca,
                  fotos: editing.fotos,
                  unidades: editing.unidades,
                } : undefined}
                onSubmit={editing ? handleEdit : handleCreate}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable<EquipamentoAdmin>
        title={`${equipamentos.length} equipamentos registrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por locador, tipo ou nome..."
        columns={[
          {
            header: "Foto",
            accessor: () => (
              <div className="h-10 w-10 mx-auto rounded bg-muted flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
              </div>
            ),
            align: "center",
            className: "w-16",
          },
          { header: "Locador", accessor: "locador", className: "font-medium text-sm" },
          {
            header: "Equipamento",
            accessor: (e) => (
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">{e.nome}</span>
                <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal bg-muted/30 w-fit">
                  {e.tipoEquipamento}
                </Badge>
              </div>
            ),
          },
          { header: "Diária", accessor: (e) => `R$ ${e.valorDiaria}`, className: "text-xs" },
          { header: "Semanal", accessor: (e) => `R$ ${e.valorSemanal}`, className: "text-xs" },
          { header: "Quinzenal", accessor: (e) => `R$ ${e.valorQuinzenal}`, className: "text-xs" },
          { header: "Mensal", accessor: (e) => `R$ ${e.valorMensal}`, className: "text-xs font-semibold text-primary" },
          {
            header: "Disponíveis",
            accessor: (e) => {
              const total = e.unidades?.length || 0;
              const disp = e.unidades?.filter((u) => u.disponivel).length || 0;
              return (
                <Badge variant={disp > 0 ? "default" : "destructive"} className="h-6 px-2 text-[11px]">
                  {disp} / {total}
                </Badge>
              );
            },
            align: "center",
          },
        ]}
        actions={(e) => isLocador ? (
          <>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm"
              onClick={() => { setEditing(e); setIsDialogOpen(true); }}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive"
              onClick={() => handleDelete(e.id)}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : null}
        renderMobileCard={(e) => (
          <div className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-base text-foreground truncate">{e.locador}</p>
                  <p className="text-xs text-primary font-medium">{e.nome}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{e.tipoEquipamento}</Badge>
                </div>
              </div>
              {isLocador && (
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => { setEditing(e); setIsDialogOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => handleDelete(e.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-muted/50 rounded-md p-2"><p className="text-muted-foreground mb-0.5">Diária</p><p className="font-medium">R$ {e.valorDiaria}</p></div>
              <div className="bg-muted/50 rounded-md p-2"><p className="text-muted-foreground mb-0.5">Semanal</p><p className="font-medium">R$ {e.valorSemanal}</p></div>
              <div className="bg-muted/50 rounded-md p-2"><p className="text-muted-foreground mb-0.5">Quinzenal</p><p className="font-medium">R$ {e.valorQuinzenal}</p></div>
              <div className="bg-muted/50 rounded-md p-2"><p className="text-muted-foreground mb-0.5">Mensal</p><p className="font-medium">R$ {e.valorMensal}</p></div>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Disponíveis: <span className="font-semibold text-foreground">{e.unidades.filter(u => u.disponivel).length} / {e.unidades.length}</span>
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

export default EquipamentosAdmin;
