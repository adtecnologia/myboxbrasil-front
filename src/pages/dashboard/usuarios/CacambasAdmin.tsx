import { useCallback, useEffect, useState } from "react";
import { Image as ImageIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { CacambaForm, CacambaFormData } from "@/components/CacambaForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePagination } from "@/components/DataPagination";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CacambaAdmin {
  id: string;
  locador: string;
  modelo: string;
  modeloCacamba: string;
  material: string;
  peso: string;
  tipoLocacao: "Externo" | "Interno" | "Ambos";
  precoExterno: string;
  precoInterno: string;
  diasExterno: number;
  diasInterno: number;
  tipoTampa: "articulada" | "corredica" | "sem";
  tampa: "Sim" | "Não";
  cor: string;
  residuos: string[];
  fotos: string[];
  unidades: { id: string; codigo: string; disponivel: boolean; manutencao: boolean }[];
}

const CacambasAdmin = () => {
  const [cacambas, setCacambas] = useState<CacambaAdmin[]>([]);
  const [modelosMap, setModelosMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCacamba, setEditingCacamba] = useState<CacambaAdmin | null>(null);
  const activeProfileType = useAuthStore((state) => state.activeProfileType());
  const user = useAuthStore((state) => state.user);
  const isLocador = activeProfileType === "locador";
  const canSeeLocador = activeProfileType === "admin" || activeProfileType === "prefeitura";

  const filtered = cacambas.filter((v) =>
    v.locador.toLowerCase().includes(search.toLowerCase()) ||
    v.modeloCacamba.toLowerCase().includes(search.toLowerCase()) ||
    v.cor.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const modeloLabel = useCallback(
    (id: string) => modelosMap[id] ?? id,
    [modelosMap]
  );

  useEffect(() => {
    supabase
      .from("modelos_cacamba")
      .select("id, modelo, capacidade")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data ?? []).forEach((m: any) => {
          map[m.id] = `${m.modelo} (${m.capacidade})`;
        });
        setModelosMap(map);
      });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cacambas")
      .select(`
        id, locador_id, modelo, material, peso, cores, tipo_tampa, tipo_locacao,
        dias_externo, dias_interno, preco_externo, preco_interno,
        cacamba_unidades ( id, codigo, disponivel, manutencao ),
        cacamba_residuos ( classe ),
        cacamba_fotos ( url )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar caçambas: " + error.message);
      setLoading(false);
      return;
    }

    const locadorIds = Array.from(new Set((data ?? []).map((c: any) => c.locador_id).filter(Boolean)));
    let nomes: Record<string, string> = {};
    if (locadorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, nome")
        .in("id", locadorIds);
      nomes = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p.nome]));
    }

    const mapped: CacambaAdmin[] = (data ?? []).map((c: any) => ({
      id: c.id,
      locador: nomes[c.locador_id] ?? "—",
      modelo: c.modelo,
      modeloCacamba: modeloLabel(c.modelo),
      material: c.material ?? "",
      peso: c.peso != null ? String(c.peso) : "",
      tipoLocacao: c.tipo_locacao,
      precoExterno: c.preco_externo != null ? String(c.preco_externo) : "",
      precoInterno: c.preco_interno != null ? String(c.preco_interno) : "",
      diasExterno: c.dias_externo ?? 0,
      diasInterno: c.dias_interno ?? 0,
      tipoTampa: c.tipo_tampa,
      tampa: c.tipo_tampa === "sem" ? "Não" : "Sim",
      cor: c.cores ?? "",
      residuos: (c.cacamba_residuos ?? []).map((r: any) => r.classe),
      fotos: (c.cacamba_fotos ?? []).map((f: any) => f.url),
      unidades: c.cacamba_unidades ?? [],
    }));

    // Marca unidades ocupadas por ordens de locação ativas (não finalizadas)
    const unidadeIds = mapped.flatMap((c) => c.unidades.map((u) => u.id));
    if (unidadeIds.length) {
      const { data: olus } = await supabase
        .from("ordem_locacao_unidades")
        .select("cacamba_unidade_id, status")
        .in("cacamba_unidade_id", unidadeIds)
        .in("status", [
          "entrega_pendente",
          "em_transito_locacao",
          "locada",
          "aguardando_retirada",
          "em_transito_retirada",
          "em_transito_analise",
        ]);
      const ocupadas = new Set((olus ?? []).map((o: any) => o.cacamba_unidade_id));
      mapped.forEach((c) => {
        c.unidades = c.unidades.map((u) => ({
          ...u,
          disponivel: u.disponivel && !ocupadas.has(u.id),
        }));
      });
    }

    setCacambas(mapped);
    setLoading(false);
  }, [modeloLabel]);

  useEffect(() => {
    load();
  }, [load]);

  const persistChildren = async (cacambaId: string, data: CacambaFormData) => {
    const ops: PromiseLike<unknown>[] = [];
    if (data.unidades.length) {
      ops.push(
        supabase.from("cacamba_unidades").insert(
          data.unidades.map((u) => ({
            cacamba_id: cacambaId,
            codigo: u.codigo,
            disponivel: u.disponivel,
            manutencao: u.manutencao,
          }))
        )
      );
    }
    if (data.residuos.length) {
      ops.push(
        supabase.from("cacamba_residuos").insert(
          data.residuos.map((classe) => ({ cacamba_id: cacambaId, classe }))
        )
      );
    }
    if (data.fotos.length) {
      ops.push(
        supabase.from("cacamba_fotos").insert(
          data.fotos.map((url, ordem) => ({ cacamba_id: cacambaId, url, ordem }))
        )
      );
    }
    await Promise.all(ops);
  };

  const handleCreate = async (data: CacambaFormData) => {
    if (!user?.id) {
      toast.error("Sessão inválida.");
      return;
    }
    const { data: inserted, error } = await supabase
      .from("cacambas")
      .insert({
        locador_id: user.id,
        modelo: data.modelo,
        material: data.material,
        peso: data.peso ? Number(data.peso) : null,
        cores: data.cores,
        tipo_tampa: data.tipoTampa,
        tipo_locacao: data.tipoLocacao,
        dias_externo: Number(data.diasExterno) || 0,
        dias_interno: Number(data.diasInterno) || 0,
        preco_externo: data.precoExterno ? Number(String(data.precoExterno).replace(",", ".")) : 0,
        preco_interno: data.precoInterno ? Number(String(data.precoInterno).replace(",", ".")) : 0,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      toast.error("Erro ao cadastrar: " + (error?.message ?? ""));
      return;
    }

    try {
      await persistChildren(inserted.id, data);
    } catch (e) {
      toast.error("Caçamba criada, mas falha ao salvar dados relacionados.");
    }

    setIsDialogOpen(false);
    toast.success("Caçamba cadastrada com sucesso!");
    load();
  };

  const handleEdit = async (data: CacambaFormData) => {
    if (!editingCacamba) return;
    const id = editingCacamba.id;

    const { error } = await supabase
      .from("cacambas")
      .update({
        modelo: data.modelo,
        material: data.material,
        peso: data.peso ? Number(data.peso) : null,
        cores: data.cores,
        tipo_tampa: data.tipoTampa,
        tipo_locacao: data.tipoLocacao,
        dias_externo: Number(data.diasExterno) || 0,
        dias_interno: Number(data.diasInterno) || 0,
        preco_externo: data.precoExterno ? Number(String(data.precoExterno).replace(",", ".")) : 0,
        preco_interno: data.precoInterno ? Number(String(data.precoInterno).replace(",", ".")) : 0,
      })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar: " + error.message);
      return;
    }

    await Promise.all([
      supabase.from("cacamba_unidades").delete().eq("cacamba_id", id),
      supabase.from("cacamba_residuos").delete().eq("cacamba_id", id),
      supabase.from("cacamba_fotos").delete().eq("cacamba_id", id),
    ]);
    await persistChildren(id, data);

    setEditingCacamba(null);
    setIsDialogOpen(false);
    toast.success("Caçamba atualizada com sucesso!");
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cacambas").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
      return;
    }
    toast.success("Caçamba removida com sucesso!");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold italic">Gestão de Caçambas</h1>
          <p className="text-sm text-white/75">Gerencie seu inventário e preços de locação</p>
        </div>
        {isLocador && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingCacamba(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
                <Plus className="mr-2 h-4 w-4" />
                Nova Caçamba
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 shrink-0 border-b">
                <DialogTitle>{editingCacamba ? "Editar Caçamba" : "Cadastrar Nova Caçamba"}</DialogTitle>
              </DialogHeader>
              <CacambaForm 
                initialData={editingCacamba ? {
                  modelo: editingCacamba.modelo,
                  material: editingCacamba.material,
                  peso: editingCacamba.peso,
                  tipoLocacao: editingCacamba.tipoLocacao,
                  precoExterno: editingCacamba.precoExterno,
                  precoInterno: editingCacamba.precoInterno,
                  diasExterno: editingCacamba.diasExterno.toString(),
                  diasInterno: editingCacamba.diasInterno.toString(),
                  tipoTampa: editingCacamba.tipoTampa,
                  cores: editingCacamba.cor,
                  residuos: editingCacamba.residuos,
                  fotos: editingCacamba.fotos,
                  unidades: editingCacamba.unidades,
                } : undefined}

                onSubmit={editingCacamba ? handleEdit : handleCreate} 
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable<CacambaAdmin>
      loading={loading}
        title={loading ? "Carregando…" : `${cacambas.length} caçambas registradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por locador, modelo ou cor..."
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
            header: "Modelo", 
            accessor: (v) => (
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">{v.modeloCacamba}</span>
                <div className="flex gap-1.5 items-center flex-wrap">
                  <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal bg-muted/30">
                    Tampa: {v.tampa}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal bg-muted/30">
                    Cor: {v.cor}
                  </Badge>
                </div>
              </div>
            ),
            className: "text-sm" 
          },

          {
            header: "Locação",
            accessor: (v) => <Badge variant="secondary" className="text-[10px] font-normal">{v.tipoLocacao}</Badge>,
          },
          {
            header: "Preço (Ext/Int)",
            accessor: (v) => (
              <div className="flex flex-col text-xs">
                <span>Ext: R$ {v.precoExterno}</span>
                <span>Int: R$ {v.precoInterno}</span>
              </div>
            ),
          },
          {
            header: "Dias (Ext/Int)",
            accessor: (v) => (
              <div className="flex flex-col text-xs">
                <span>Ext: {v.diasExterno} dias</span>
                <span>Int: {v.diasInterno} dias</span>
              </div>
            ),
          },
          { 
            header: "Disponíveis", 
            accessor: (v) => {
              const total = v.unidades?.length || 0;
              const disponiveis = v.unidades?.filter(u => u.disponivel).length || 0;
              return (
                <div className="flex items-center gap-2">
                  <Badge variant={disponiveis > 0 ? "default" : "destructive"} className="h-6 px-2 text-[11px]">
                    {disponiveis} / {total}
                  </Badge>
                </div>
              );
            },
            align: "center",
          },

        ]}
        actions={activeProfileType === "admin" ? undefined : (v) => isLocador ? (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm"
              onClick={() => {
                setEditingCacamba(v);
                setIsDialogOpen(true);
              }}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive"
              onClick={() => handleDelete(v.id)}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : null}
        renderMobileCard={(v) => (
          <div className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-base text-foreground truncate">{v.locador}</p>
                  <p className="text-xs text-primary font-medium">{v.modeloCacamba}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{v.tipoLocacao}</Badge>
                </div>
              </div>
              {isLocador && (
                <div className="flex gap-1 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => {
                      setEditingCacamba(v);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full text-destructive"
                    onClick={() => handleDelete(v.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Preço Ext/Int</p>
                <p className="font-medium">R$ {v.precoExterno} / R$ {v.precoInterno}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Dias Ext/Int</p>
                <p className="font-medium">{v.diasExterno}d / {v.diasInterno}d</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Tampa</p>
                <p className="font-medium">{v.tampa}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Cor</p>
                <p className="font-medium">{v.cor}</p>
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

export default CacambasAdmin;
