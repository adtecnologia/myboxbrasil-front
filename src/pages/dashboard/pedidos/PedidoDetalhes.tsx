import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Loader2, MapPin, Package, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/use-toast";

const pfStatusLabel: Record<string, string> = {
  aguardando_aceite: "Aguardando aceite",
  aceito: "Aceito pelo locador",
  recusado: "Recusado",
  em_separacao: "Em separação",
  agendado: "Agendado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const pfStatusClasses: Record<string, string> = {
  aguardando_aceite: "bg-orange-500 text-white",
  aceito: "bg-primary text-primary-foreground",
  recusado: "bg-destructive text-destructive-foreground",
  em_separacao: "bg-blue-500 text-white",
  agendado: "bg-indigo-500 text-white",
  entregue: "bg-emerald-600 text-white",
  cancelado: "bg-destructive text-destructive-foreground",
};

const fmtBRL = (v: number) =>
  `R$ ${Number(v ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const emptyLocadores = new Map<string, string>();
const emptyModelos = new Map<string, string>();
const emptyDesignadas = new Map<string, { id: string; cacamba_unidade_id: string; codigo?: string }[]>();
const emptyUnidadesPorCacamba = new Map<
  string,
  { id: string; codigo: string; disponivel: boolean; manutencao: boolean }[]
>();

const PedidoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pedido-detalhes", id],
    enabled: !!id,
    queryFn: async () => {
      const { data: pedido, error } = await supabase
        .from("pedidos")
        .select(
          `id, numero, created_at, status, valor_total, observacoes, locatario_id,
           pedido_fornecedores (
             id, numero, locador_id, status, valor_total,
             ordens_locacao (
               id, numero, equipment_type, quantidade, preco_unitario, valor_total,
               status, observacoes, cacamba_id, equipamento_id, obra_id,
               cacambas:cacamba_id ( id, modelo, material, cores, tipo_tampa,
                                    tipo_locacao, dias_externo, preco_externo,
                                    dias_interno, preco_interno ),
               equipamentos:equipamento_id ( id, nome, tipo_equipamento, descricao ),
               obras:obra_id ( id, nome, rua, numero, bairro, cidade, estado )
             )
           )`
        )
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      if (!pedido) return null;

      const locadorIds = Array.from(
        new Set(
          (pedido.pedido_fornecedores ?? [])
            .map((pf: any) => pf.locador_id)
            .filter(Boolean)
        )
      );
      const locadores = new Map<string, string>();
      if (locadorIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nome")
          .in("id", locadorIds as string[]);
        (profs ?? []).forEach((p: any) => locadores.set(p.id, p.nome));
      }

      // cacambas.modelo armazena o id de modelos_cacamba — resolver nome
      const modeloIds = Array.from(
        new Set(
          (pedido.pedido_fornecedores ?? [])
            .flatMap((pf: any) => pf.ordens_locacao ?? [])
            .map((ol: any) => ol.cacambas?.modelo)
            .filter(Boolean)
        )
      );
      const modelos = new Map<string, string>();
      if (modeloIds.length) {
        const { data: mods } = await supabase
          .from("modelos_cacamba")
          .select("id, modelo, capacidade")
          .in("id", modeloIds as string[]);
        (mods ?? []).forEach((m: any) =>
          modelos.set(m.id, `${m.modelo}${m.capacidade ? ` (${m.capacidade})` : ""}`)
        );
      }

      // Unidades já designadas por ordem
      const ordemIds = (pedido.pedido_fornecedores ?? []).flatMap((pf: any) =>
        (pf.ordens_locacao ?? []).map((ol: any) => ol.id)
      );
      const designadas = new Map<string, { id: string; cacamba_unidade_id: string; codigo?: string }[]>();
      if (ordemIds.length) {
        const { data: olus } = await supabase
          .from("ordem_locacao_unidades")
          .select("id, ordem_locacao_id, cacamba_unidade_id, cacamba_unidades:cacamba_unidade_id ( codigo )")
          .in("ordem_locacao_id", ordemIds);
        (olus ?? []).forEach((r: any) => {
          const arr = designadas.get(r.ordem_locacao_id) ?? [];
          arr.push({ id: r.id, cacamba_unidade_id: r.cacamba_unidade_id, codigo: r.cacamba_unidades?.codigo });
          designadas.set(r.ordem_locacao_id, arr);
        });
      }

      // Unidades disponíveis por cacamba (modelo) — só para os locadores envolvidos
      const cacambaIds = Array.from(
        new Set(
          (pedido.pedido_fornecedores ?? [])
            .flatMap((pf: any) => pf.ordens_locacao ?? [])
            .map((ol: any) => ol.cacamba_id)
            .filter(Boolean)
        )
      );
      const unidadesPorCacamba = new Map<string, { id: string; codigo: string; disponivel: boolean; manutencao: boolean }[]>();
      if (cacambaIds.length) {
        const { data: uns } = await supabase
          .from("cacamba_unidades")
          .select("id, codigo, cacamba_id, disponivel, manutencao")
          .in("cacamba_id", cacambaIds as string[]);
        (uns ?? []).forEach((u: any) => {
          const arr = unidadesPorCacamba.get(u.cacamba_id) ?? [];
          arr.push(u);
          unidadesPorCacamba.set(u.cacamba_id, arr);
        });
      }

      return { pedido, locadores, modelos, designadas, unidadesPorCacamba };
    },
  });

  const cancelar = useMutation({
    mutationFn: async (pfId: string) => {
      const { error } = await supabase
        .from("pedido_fornecedores")
        .update({ status: "cancelado" })
        .eq("id", pfId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Subpedido cancelado" });
      queryClient.invalidateQueries({ queryKey: ["pedido-detalhes", id] });
      queryClient.invalidateQueries({ queryKey: ["meus-pedidos"] });
    },
    onError: (e: any) =>
      toast({ title: "Erro ao cancelar", description: e.message, variant: "destructive" }),
  });

  const salvarUnidades = useMutation({
    mutationFn: async ({
      ordemId,
      atuais,
      selecionadas,
    }: {
      ordemId: string;
      atuais: string[];
      selecionadas: string[];
    }) => {
      const remover = atuais.filter((u) => !selecionadas.includes(u));
      const adicionar = selecionadas.filter((u) => !atuais.includes(u));
      if (remover.length) {
        const { error } = await supabase
          .from("ordem_locacao_unidades")
          .delete()
          .eq("ordem_locacao_id", ordemId)
          .in("cacamba_unidade_id", remover);
        if (error) throw error;
      }
      if (adicionar.length) {
        const { error } = await supabase
          .from("ordem_locacao_unidades")
          .insert(adicionar.map((u) => ({ ordem_locacao_id: ordemId, cacamba_unidade_id: u })));
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Unidades atualizadas" });
      queryClient.invalidateQueries({ queryKey: ["pedido-detalhes", id] });
    },
    onError: (e: any) =>
      toast({ title: "Erro ao salvar unidades", description: e.message, variant: "destructive" }),
  });

  const aceitarPf = useMutation({
    mutationFn: async (pfId: string) => {
      const { error } = await supabase
        .from("pedido_fornecedores")
        .update({ status: "aceito" })
        .eq("id", pfId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Subpedido aceito" });
      queryClient.invalidateQueries({ queryKey: ["pedido-detalhes", id] });
      queryClient.invalidateQueries({ queryKey: ["meus-pedidos"] });
    },
    onError: (e: any) =>
      toast({ title: "Erro ao aceitar", description: e.message, variant: "destructive" }),
  });

  const recusarPf = useMutation({
    mutationFn: async ({ pfId, motivo }: { pfId: string; motivo: string }) => {
      const { error } = await supabase
        .from("pedido_fornecedores")
        .update({ status: "recusado", motivo_recusa: motivo })
        .eq("id", pfId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Subpedido recusado" });
      queryClient.invalidateQueries({ queryKey: ["pedido-detalhes", id] });
      queryClient.invalidateQueries({ queryKey: ["meus-pedidos"] });
    },
    onError: (e: any) =>
      toast({ title: "Erro ao recusar", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.pedido) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/dashboard/pedidos")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <p>Pedido não encontrado.</p>
      </div>
    );
  }

  const {
    pedido,
    locadores = emptyLocadores,
    modelos = emptyModelos,
    designadas = emptyDesignadas,
    unidadesPorCacamba = emptyUnidadesPorCacamba,
  } = data;
  const isOwner = pedido.locatario_id === userId;
  const pendentes = (pedido.pedido_fornecedores ?? []).filter(
    (pf: any) => pf.status === "aguardando_aceite"
  );
  const podeCancelar = isOwner && pendentes.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Pedido nº {pedido.numero}</h1>
          <p className="text-sm text-white/75">
            {new Date(pedido.created_at).toLocaleString("pt-BR")} • Total {fmtBRL(pedido.valor_total)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {podeCancelar && (
            <Button
              variant="destructive"
              disabled={cancelar.isPending}
              onClick={() => {
                if (confirm(`Cancelar ${pendentes.length} subpedido(s) pendente(s)?`)) {
                  pendentes.forEach((pf: any) => cancelar.mutate(pf.id));
                }
              }}
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancelar pedido
            </Button>
          )}
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => navigate("/dashboard/pedidos")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </div>

      {(pedido.pedido_fornecedores ?? []).map((pf: any) => {
        const locadorNome = pf.locador_id
          ? locadores.get(pf.locador_id) ?? "Locador"
          : "Sem locador";
        const isLocadorPf = pf.locador_id === userId;
        const aguardando = pf.status === "aguardando_aceite";
        const ordens = pf.ordens_locacao ?? [];
        const todasCompletas =
          ordens.length > 0 &&
          ordens.every(
            (ol: any) =>
              ol.equipment_type !== "cacamba" ||
              (designadas.get(ol.id)?.length ?? 0) >= (ol.quantidade ?? 0)
          );
        return (
          <Card key={pf.id}>
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-tight">
                    Subpedido #{pedido.numero}/{pf.numero}
                  </p>
                  <h2 className="text-lg font-bold text-foreground">{locadorNome}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`uppercase font-bold ${pfStatusClasses[pf.status] ?? ""}`}>
                    {pfStatusLabel[pf.status] ?? pf.status}
                  </Badge>
                  <p className="text-sm font-black text-foreground">{fmtBRL(pf.valor_total)}</p>
                </div>
              </div>

              {pf.status === "recusado" && pf.motivo_recusa && (
                <p className="text-sm text-destructive">
                  <span className="font-semibold">Motivo da recusa:</span> {pf.motivo_recusa}
                </p>
              )}

              <div className="space-y-4">
                {(pf.ordens_locacao ?? []).map((ol: any) => {
                  const c = ol.cacambas;
                  const eq = ol.equipamentos;
                  const obra = ol.obras;
                  const unidadesDisponiveis =
                    (ol.equipment_type === "cacamba" && ol.cacamba_id
                      ? unidadesPorCacamba.get(ol.cacamba_id) ?? []
                      : []);
                  const designadasOrdem = designadas.get(ol.id) ?? [];
                  return (
                    <div
                      key={ol.id}
                      className="rounded-lg border border-border bg-card/50 p-4 grid gap-4 md:grid-cols-[160px,1fr]"
                    >
                      <div className="flex items-start justify-center">
                        <div className="h-32 w-32 rounded-lg bg-muted flex items-center justify-center text-primary">
                          <Package className="h-12 w-12" />
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-primary">
                            {ol.equipment_type === "cacamba"
                              ? `Caçamba ${
                                  (c?.modelo && modelos?.get(c.modelo)) ||
                                  c?.modelo ||
                                  ""
                                }`
                              : `Equipamento ${eq?.nome ?? ""}`}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            Ordem #{ol.numero}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <p className="font-semibold">Quantidade</p>
                            <p className="text-muted-foreground">{ol.quantidade}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Preço unit.</p>
                            <p className="text-muted-foreground">{fmtBRL(ol.preco_unitario)}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Total</p>
                            <p className="text-muted-foreground">{fmtBRL(ol.valor_total)}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Status</p>
                            <p className="text-muted-foreground capitalize">
                              {String(ol.status).replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>

                        {ol.equipment_type === "cacamba" && c && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40">
                            <div>
                              <p className="font-semibold">Material</p>
                              <p className="text-muted-foreground">{c.material ?? "—"}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Cor</p>
                              <p className="text-muted-foreground">{c.cores ?? "—"}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Tipo de tampa</p>
                              <p className="text-muted-foreground">{c.tipo_tampa ?? "—"}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Tipo de locação</p>
                              <p className="text-muted-foreground">{c.tipo_locacao ?? "—"}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Dias externo</p>
                              <p className="text-muted-foreground">{c.dias_externo ?? "—"}</p>
                            </div>
                            <div>
                              <p className="font-semibold">Dias interno</p>
                              <p className="text-muted-foreground">{c.dias_interno ?? "—"}</p>
                            </div>
                          </div>
                        )}

                        {ol.equipment_type === "equipamento" && eq && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40">
                            <div>
                              <p className="font-semibold">Tipo</p>
                              <p className="text-muted-foreground">{eq.tipo_equipamento ?? "—"}</p>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="font-semibold">Descrição</p>
                              <p className="text-muted-foreground">{eq.descricao ?? "—"}</p>
                            </div>
                          </div>
                        )}

                        {obra && (
                          <div className="pt-2 border-t border-border/40">
                            <p className="font-semibold flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> Local de entrega
                            </p>
                            <p className="text-muted-foreground">
                              {obra.nome} — {obra.rua}, {obra.numero} • {obra.bairro} • {obra.cidade}/{obra.estado}
                            </p>
                          </div>
                        )}

                        {ol.observacoes && (
                          <p className="text-xs italic text-muted-foreground">
                            Obs.: {ol.observacoes}
                          </p>
                        )}

                        {isLocadorPf && ol.equipment_type === "cacamba" && (
                          <UnidadesPicker
                            ordemId={ol.id}
                            quantidade={ol.quantidade ?? 0}
                            unidades={unidadesDisponiveis}
                            designadas={designadasOrdem}
                            podeEditar={aguardando}
                            onSalvar={(selecionadas) =>
                              salvarUnidades.mutate({
                                ordemId: ol.id,
                                atuais: designadasOrdem.map((d) => d.cacamba_unidade_id),
                                selecionadas,
                              })
                            }
                            salvando={salvarUnidades.isPending}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {isLocadorPf && aguardando && (
                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border/60">
                  <RecusarDialog
                    onConfirm={(motivo) => recusarPf.mutate({ pfId: pf.id, motivo })}
                    disabled={recusarPf.isPending}
                  />
                  <Button
                    disabled={!todasCompletas || aceitarPf.isPending}
                    onClick={() => aceitarPf.mutate(pf.id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {todasCompletas
                      ? "Aceitar pedido"
                      : "Selecione todas as unidades para aceitar"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PedidoDetalhes;

type UnidadeOption = { id: string; codigo: string; disponivel: boolean; manutencao: boolean };

function UnidadesPicker({
  ordemId,
  quantidade,
  unidades,
  designadas,
  podeEditar,
  onSalvar,
  salvando,
}: {
  ordemId: string;
  quantidade: number;
  unidades: UnidadeOption[];
  designadas: { id: string; cacamba_unidade_id: string; codigo?: string }[];
  podeEditar: boolean;
  onSalvar: (selecionadas: string[]) => void;
  salvando: boolean;
}) {
  const designadasIds = useMemo(
    () => designadas.map((d) => d.cacamba_unidade_id),
    [designadas]
  );
  const [sel, setSel] = useState<string[]>(designadasIds);

  // resync quando os dados externos mudarem
  const key = designadasIds.join(",");
  useEffect(() => {
    setSel(designadasIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Paginação
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  const ordenadas = useMemo(() => {
    const arr = [...unidades];
    arr.sort((a, b) => {
      const sa = sel.includes(a.id) ? 0 : 1;
      const sb = sel.includes(b.id) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      const da = a.disponivel && !a.manutencao ? 0 : 1;
      const db = b.disponivel && !b.manutencao ? 0 : 1;
      if (da !== db) return da - db;
      return a.codigo.localeCompare(b.codigo);
    });
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidades, key]);
  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPaginas) setPage(totalPaginas);
  }, [page, totalPaginas]);
  const visiveis = ordenadas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = (uid: string) => {
    setSel((prev) => {
      if (prev.includes(uid)) return prev.filter((x) => x !== uid);
      if (prev.length >= quantidade) {
        toast({
          title: "Limite atingido",
          description: `Você só pode selecionar ${quantidade} unidade(s).`,
          variant: "destructive",
        });
        return prev;
      }
      return [...prev, uid];
    });
  };

  const dirty = useMemo(() => {
    const a = [...designadasIds].sort().join(",");
    const b = [...sel].sort().join(",");
    return a !== b;
  }, [designadasIds, sel]);

  return (
    <div className="pt-2 border-t border-border/40 space-y-2" data-ordem={ordemId}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">
          Unidades a enviar{" "}
          <span
            className={
              sel.length === quantidade
                ? "text-primary"
                : "text-muted-foreground"
            }
          >
            ({sel.length}/{quantidade})
          </span>
        </p>
        {podeEditar && dirty && (
          <Button size="sm" disabled={salvando} onClick={() => onSalvar(sel)}>
            Salvar seleção
          </Button>
        )}
      </div>
      {unidades.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nenhuma unidade cadastrada para este modelo de caçamba.
        </p>
      ) : (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {visiveis.map((u) => {
            const checked = sel.includes(u.id);
            const indisp = !u.disponivel || u.manutencao;
            const disabled = !podeEditar || (indisp && !checked);
            return (
              <label
                key={u.id}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${
                  checked ? "border-primary bg-primary/5" : "border-border"
                } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => toggle(u.id)}
                />
                <span className="flex-1">
                  <span className="font-medium">{u.codigo}</span>
                  {indisp && (
                    <span className="block text-[10px] uppercase text-muted-foreground">
                      {u.manutencao ? "Em manutenção" : "Indisponível"}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Mostrando {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, ordenadas.length)} de {ordenadas.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                {page}/{totalPaginas}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPaginas}
                onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}

function RecusarDialog({
  onConfirm,
  disabled,
}: {
  onConfirm: (motivo: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={disabled}>
          <XCircle className="mr-2 h-4 w-4" /> Recusar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recusar subpedido</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Motivo da recusa</label>
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Descreva o motivo da recusa"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!motivo.trim() || disabled}
            onClick={() => {
              onConfirm(motivo.trim());
              setOpen(false);
              setMotivo("");
            }}
          >
            Confirmar recusa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
