import { useCallback, useEffect, useState } from "react";
import { Image as ImageIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { EquipamentoForm, EquipamentoFormData } from "@/components/EquipamentoForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const EquipamentosAdmin = () => {
  const [equipamentos, setEquipamentos] = useState<EquipamentoAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EquipamentoAdmin | null>(null);
  const activeProfileType = useAuthStore((s) => s.activeProfileType());
  const user = useAuthStore((s) => s.user);
  const isLocador = activeProfileType === "locador";
  const canSeeLocador = activeProfileType === "admin" || activeProfileType === "prefeitura";

  const filtered = equipamentos.filter((e) =>
    e.locador.toLowerCase().includes(search.toLowerCase()) ||
    e.tipoEquipamento.toLowerCase().includes(search.toLowerCase()) ||
    e.nome.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const toNum = (s: string) => (s ? Number(String(s).replace(/\./g, "").replace(",", ".")) : 0);
  const fmt = (n: number | null | undefined) => (n != null ? String(n) : "");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipamentos")
      .select(`
        id, locador_id, tipo_equipamento, nome,
        preco_diario, preco_semanal, preco_quinzenal, preco_mensal,
        descricao, orientacoes_operacao, orientacoes_seguranca,
        equipamento_unidades ( id, codigo, disponivel ),
        equipamento_fotos ( url )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar equipamentos: " + error.message);
      setLoading(false);
      return;
    }
    const locadorIds = Array.from(new Set((data ?? []).map((e: any) => e.locador_id).filter(Boolean)));
    let nomes: Record<string, string> = {};
    if (locadorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, nome")
        .in("id", locadorIds);
      nomes = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p.nome]));
    }
    setEquipamentos((data ?? []).map((e: any) => ({
      id: e.id,
      locador: nomes[e.locador_id] ?? "—",
      tipoEquipamento: e.tipo_equipamento,
      nome: e.nome,
      valorDiaria: fmt(e.preco_diario),
      valorSemanal: fmt(e.preco_semanal),
      valorQuinzenal: fmt(e.preco_quinzenal),
      valorMensal: fmt(e.preco_mensal),
      descricao: e.descricao ?? "",
      orientacoesOperacao: e.orientacoes_operacao ?? "",
      orientacoesSeguranca: e.orientacoes_seguranca ?? "",
      fotos: (e.equipamento_fotos ?? []).map((f: any) => f.url),
      unidades: e.equipamento_unidades ?? [],
    })));
    setLoading(false);
  }, [user?.name]);

  useEffect(() => { load(); }, [load]);

  const persistChildren = async (equipamentoId: string, data: EquipamentoFormData) => {
    const ops: PromiseLike<unknown>[] = [];
    if (data.unidades.length) {
      ops.push(supabase.from("equipamento_unidades").insert(
        data.unidades.map((u) => ({ equipamento_id: equipamentoId, codigo: u.codigo, disponivel: u.disponivel }))
      ));
    }
    if (data.fotos.length) {
      ops.push(supabase.from("equipamento_fotos").insert(
        data.fotos.map((url, ordem) => ({ equipamento_id: equipamentoId, url, ordem }))
      ));
    }
    await Promise.all(ops);
  };

  const handleCreate = async (data: EquipamentoFormData) => {
    if (!user?.id) { toast.error("Sessão inválida."); return; }
    const { data: inserted, error } = await supabase
      .from("equipamentos")
      .insert({
        locador_id: user.id,
        tipo_equipamento: data.tipoEquipamento,
        nome: data.nome,
        preco_diario: toNum(data.precoDiario),
        preco_semanal: toNum(data.precoSemanal),
        preco_quinzenal: toNum(data.precoQuinzenal),
        preco_mensal: toNum(data.precoMensal),
        descricao: data.descricao,
        orientacoes_operacao: data.orientacoesOperacao,
        orientacoes_seguranca: data.orientacoesSeguranca,
      })
      .select("id").single();
    if (error || !inserted) { toast.error("Erro ao cadastrar: " + (error?.message ?? "")); return; }
    await persistChildren(inserted.id, data);
    setIsDialogOpen(false);
    toast.success("Equipamento cadastrado com sucesso!");
    load();
  };

  const handleEdit = async (data: EquipamentoFormData) => {
    if (!editing) return;
    const id = editing.id;
    const { error } = await supabase
      .from("equipamentos")
      .update({
        tipo_equipamento: data.tipoEquipamento,
        nome: data.nome,
        preco_diario: toNum(data.precoDiario),
        preco_semanal: toNum(data.precoSemanal),
        preco_quinzenal: toNum(data.precoQuinzenal),
        preco_mensal: toNum(data.precoMensal),
        descricao: data.descricao,
        orientacoes_operacao: data.orientacoesOperacao,
        orientacoes_seguranca: data.orientacoesSeguranca,
      })
      .eq("id", id);
    if (error) { toast.error("Erro ao atualizar: " + error.message); return; }
    await Promise.all([
      supabase.from("equipamento_unidades").delete().eq("equipamento_id", id),
      supabase.from("equipamento_fotos").delete().eq("equipamento_id", id),
    ]);
    await persistChildren(id, data);
    setEditing(null);
    setIsDialogOpen(false);
    toast.success("Equipamento atualizado com sucesso!");
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("equipamentos").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir: " + error.message); return; }
    toast.success("Equipamento removido com sucesso!");
    load();
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
      loading={loading}
        title={loading ? "Carregando…" : `${equipamentos.length} equipamentos registrados`}
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
          ...(canSeeLocador ? [{ header: "Locador", accessor: "locador" as const, className: "font-medium text-sm" }] : []),
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
        actions={activeProfileType === "admin" ? undefined : (e) => isLocador ? (
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
