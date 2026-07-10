import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Mail, Power, Eye, Package, Wrench, ClipboardList, ShoppingCart, MapPin, Building2, User, FileText, Handshake, MapPinned, DollarSign, FileCheck2, FileBadge, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/components/DataPagination";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { formatCPF, formatCNPJ, formatCelular, formatCEP, onlyDigits } from "@/lib/auth-utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";

interface Locador {
  id: string;
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  status: "ativo" | "inativo";
  avatar_url?: string | null;
  cidade?: string | null;
  estado?: string | null;
  licenca_status?: "aguardando_validacao" | "validado" | "rejeitado" | "sem_documentos" | null;
}

const Locadores = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [detailId, setDetailId] = useState<string | null>(null);
  const activeProfileType = useAuthStore((s) => s.activeProfileType());
  const authUser = useAuthStore((s) => s.user);
  const isPrefeitura = activeProfileType === "prefeitura";

  const { data: locadores = [], isLoading } = useQuery({
    queryKey: ["locadores", "v2", isPrefeitura ? `pref-${authUser?.id}` : "all"],
    queryFn: async (): Promise<Locador[]> => {
      // Prefeitura: usa função definer que traz todos os locadores com
      // cadastro de licença na cidade — ativos ou não.
      if (isPrefeitura) {
        const { data, error } = await supabase.rpc(
          "get_locadores_licenciados_prefeitura",
        );
        if (error) throw error;
        return (data ?? []).map((p: any) => ({
          id: p.id,
          nome: p.nome ?? "",
          documento: p.documento ?? "",
          telefone: p.celular ?? p.telefone ?? "",
          email: p.email ?? "",
          status: p.ativo ? "ativo" : "inativo",
          avatar_url: p.avatar_url ?? null,
          cidade: p.cidade ?? null,
          estado: p.estado ?? null,
          licenca_status: p.licenca_status ?? null,
        }));
      }

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id, ativo")
        .eq("role", "locador");
      if (error) throw error;
      const ativoMap = new Map<string, boolean>();
      (roles ?? []).forEach((r) => {
        ativoMap.set(r.user_id, (ativoMap.get(r.user_id) ?? false) || !!r.ativo);
      });
      const ids = Array.from(ativoMap.keys());
      if (ids.length === 0) return [];
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, nome, nome_fantasia, documento, celular, telefone, email, ativo, avatar_url, cidade, estado")
        .in("id", ids);
      if (pErr) throw pErr;
      return (profiles ?? []).map((p) => ({
        id: p.id,
        nome: p.nome ?? "",
        documento: p.documento ?? "",
        telefone: p.celular ?? p.telefone ?? "",
        email: p.email ?? "",
        status: ativoMap.get(p.id) ? "ativo" : "inativo",
        avatar_url: (p as any).avatar_url ?? null,
        cidade: (p as any).cidade ?? null,
        estado: (p as any).estado ?? null,
      }));
    },
  });

  const filtered = locadores.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.documento.includes(search)
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const formatDoc = (v: string) =>
    onlyDigits(v).length > 11 ? formatCNPJ(v) : formatCPF(v);

  const toggleAcesso = useMutation({
    mutationFn: async (l: Locador) => {
      const novo = l.status !== "ativo";
      const { error } = await supabase
        .from("user_roles")
        .update({ ativo: novo })
        .eq("user_id", l.id)
        .eq("role", "locador");
      if (error) throw error;
      return novo;
    },
    onSuccess: (novo) => {
      toast.success(novo ? "Acesso ativado" : "Acesso desativado");
      queryClient.invalidateQueries({ queryKey: ["locadores"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao atualizar acesso"),
  });

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {isPrefeitura ? "Locadores licenciados na cidade" : "Gestão de Locadores"}
            </h1>
            <p className="text-sm text-white/75">
              {isPrefeitura
                ? "Fornecedores de caçambas com licença ativa no seu município"
                : "Administração de fornecedores de caçambas"}
            </p>
          </div>
        </div>
      )}

      <DataTable<Locador>
        title={`${locadores.length} locadores cadastrados`}
        data={paginatedData}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Foto",
            accessor: (c) => (
              <Avatar className="h-9 w-9">
                <AvatarImage src={c.avatar_url ?? undefined} alt={c.nome} />
                <AvatarFallback className="text-xs">
                  {(c.nome || "?").trim().charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ),
          },
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "Documento", accessor: (c) => formatDoc(c.documento) },
          {
            header: "Cidade",
            accessor: (c) =>
              c.cidade || c.estado
                ? [c.cidade, c.estado].filter(Boolean).join("/")
                : "—",
          },
          {
            header: "Status",
            accessor: (c) => {
              if (isPrefeitura) {
                const map: Record<string, { label: string; cls: string }> = {
                  validado: { label: "Validado", cls: "bg-green-500/10 text-green-600 border-green-500/20" },
                  aguardando_validacao: { label: "Aguardando validação", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
                  rejeitado: { label: "Rejeitado", cls: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
                  sem_documentos: { label: "Sem documentos", cls: "bg-muted text-muted-foreground border-border" },
                };
                const s = map[c.licenca_status ?? "sem_documentos"] ?? map.sem_documentos;
                return (
                  <Badge variant="outline" className={s.cls}>
                    {s.label}
                  </Badge>
                );
              }
              return (
                <Badge
                  variant="outline"
                  className={
                    c.status === "ativo"
                      ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 capitalize"
                      : "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20 capitalize"
                  }
                >
                  {c.status}
                </Badge>
              );
            },
          },
          { 
            header: "Contato", 
            accessor: (c) => (
              <div className="text-xs space-y-1">
                <p className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /> {formatCelular(c.telefone)}</p>
                <p className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" /> {c.email}</p>
              </div>
            ) 
          },
        ]}
        renderMobileCard={(c) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground">{c.nome}</p>
                  <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase">{c.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{formatDoc(c.documento)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => toggleAcesso.mutate(c)}
                disabled={toggleAcesso.isPending}
              >
                <Power className="h-3.5 w-3.5" />
                {c.status === "ativo" ? "Desativar" : "Ativar"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{formatCelular(c.telefone)}</span>
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
            </div>
          </div>
        )}
        actions={(c) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 rounded-lg shadow-sm"
              onClick={() => setDetailId(c.id)}
              title="Ver detalhes"
            >
              <Eye className="h-4 w-4" />
              Detalhes
            </Button>
            {!isPrefeitura && (
            <Button
              variant="outline"
              size="sm"
              className={`h-8 gap-1 rounded-lg shadow-sm ${c.status === "ativo" ? "text-destructive hover:border-destructive" : "text-primary hover:border-primary"}`}
              onClick={() => toggleAcesso.mutate(c)}
              disabled={toggleAcesso.isPending}
              title={c.status === "ativo" ? "Desativar acesso" : "Ativar acesso"}
            >
              <Power className="h-4 w-4" />
              {c.status === "ativo" ? "Desativar" : "Ativar"}
            </Button>
            )}
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

      <LocadorDetailsDialog id={detailId} onOpenChange={(o) => !o && setDetailId(null)} />
    </div>
  );
};

export default Locadores;

// ============ Detalhes do Locador ============
function LocadorDetailsDialog({
  id,
  onOpenChange,
}: {
  id: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = !!id;
  const activeProfileType = useAuthStore((s) => s.activeProfileType());
  const isPrefeitura = activeProfileType === "prefeitura";
  const queryClient = useQueryClient();
  const [actionDoc, setActionDoc] = useState<
    { id: string; nome: string; action: "aceito" | "negado" } | null
  >(null);
  const [motivoText, setMotivoText] = useState("");
  const [actionLic, setActionLic] = useState<
    { id: string; label: string; action: "validado" | "rejeitado" } | null
  >(null);
  const [motivoLicText, setMotivoLicText] = useState("");

  const statusMut = useMutation({
    mutationFn: async (vars: { docId: string; status: "aceito" | "negado"; motivo?: string }) => {
      const { error } = await supabase.rpc(
        "prefeitura_atualizar_status_documento_licenca",
        { _doc_id: vars.docId, _status: vars.status, _motivo: vars.motivo ?? null },
      );
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.status === "aceito" ? "Documento validado" : "Documento recusado");
      queryClient.invalidateQueries({ queryKey: ["locador-licencas-pref", id] });
      setActionDoc(null);
      setMotivoText("");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao atualizar documento"),
  });

  const licMut = useMutation({
    mutationFn: async (vars: { licId: string; status: "validado" | "rejeitado"; motivo: string }) => {
      const { error } = await supabase.rpc(
        "prefeitura_atualizar_status_licenca",
        { _licenca_id: vars.licId, _status: vars.status, _motivo: vars.motivo },
      );
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.status === "validado" ? "Locador validado" : "Locador rejeitado");
      queryClient.invalidateQueries({ queryKey: ["locador-licencas-pref", id] });
      queryClient.invalidateQueries({ queryKey: ["locadores"] });
      setActionLic(null);
      setMotivoLicText("");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao atualizar licença"),
  });

  const { data: licencasPref = [] } = useQuery({
    queryKey: ["locador-licencas-pref", id],
    enabled: !!id && isPrefeitura,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_locador_licencas_prefeitura",
        { _locador_id: id! },
      );
      if (error) throw error;
      return (data ?? []) as unknown as Array<{
        id: string;
        cidade: string;
        estado: string;
        created_at: string;
        status_prefeitura: string | null;
        motivo_prefeitura: string | null;
        validado_em: string | null;
        documentos: Array<{
          id: string;
          nome: string;
          status: string;
          data_vencimento: string | null;
          arquivo_path: string | null;
          motivo_recusa: string | null;
          created_at: string;
        }>;
      }>;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["locador-detalhes", id],
    enabled: !!id && !isPrefeitura,
    queryFn: async () => {
      const [profileRes, cacRes, equipRes, pfRes, licRes, fatRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id!).maybeSingle(),
        supabase
          .from("cacambas")
          .select("id")
          .eq("locador_id", id!),
        supabase
          .from("equipamentos")
          .select("id")
          .eq("locador_id", id!),
        supabase
          .from("pedido_fornecedores")
          .select("id, pedido_id, ordens_locacao(id)")
          .eq("locador_id", id!),
        supabase
          .from("licenca_cidade")
          .select("cidade, estado")
          .eq("user_id", id!),
        supabase
          .from("faturas")
          .select("valor_total, status")
          .eq("locador_id", id!),
      ]);
      if (profileRes.error) throw profileRes.error;
      if (pfRes.error) throw pfRes.error;

      const cacIds = (cacRes.data ?? []).map((c: any) => c.id);
      const equipIds = (equipRes.data ?? []).map((e: any) => e.id);

      const [cacUnitsRes, equipUnitsRes] = await Promise.all([
        cacIds.length
          ? supabase
              .from("cacamba_unidades")
              .select("id", { count: "exact", head: true })
              .in("cacamba_id", cacIds)
          : Promise.resolve({ count: 0 } as any),
        equipIds.length
          ? supabase
              .from("equipamento_unidades")
              .select("id", { count: "exact", head: true })
              .in("equipamento_id", equipIds)
          : Promise.resolve({ count: 0 } as any),
      ]);

      const pedidos = new Set<string>();
      let locacoes = 0;
      (pfRes.data ?? []).forEach((pf: any) => {
        if (pf.pedido_id) pedidos.add(pf.pedido_id);
        locacoes += Array.isArray(pf.ordens_locacao) ? pf.ordens_locacao.length : 0;
      });

      const cidadesSet = new Set<string>();
      (licRes.data ?? []).forEach((l: any) => {
        if (l.cidade && l.estado) cidadesSet.add(`${l.cidade}/${l.estado}`.toLowerCase());
      });
      const faturamento = (fatRes.data ?? [])
        .filter((f: any) => f.status === "paga")
        .reduce((acc: number, f: any) => acc + Number(f.valor_total ?? 0), 0);

      return {
        profile: profileRes.data as any,
        cacambas: cacUnitsRes.count ?? 0,
        equipamentos: equipUnitsRes.count ?? 0,
        locacoes,
        pedidos: pedidos.size,
        parcerias: 0,
        cidades: cidadesSet.size,
        faturamento,
        mtrs: 0,
        cdfs: 0,
        nfs: 0,
      };
    },
  });

  const p = data?.profile;
  const { data: profileForPref } = useQuery({
    queryKey: ["locador-profile-pref", id],
    enabled: !!id && isPrefeitura,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
  const profile = isPrefeitura ? profileForPref : p;
  const formatDoc = (v?: string | null) => {
    if (!v) return "—";
    return onlyDigits(v).length > 11 ? formatCNPJ(v) : formatCPF(v);
  };
  const endereco =
    profile &&
    [
      [profile.logradouro, profile.numero].filter(Boolean).join(", "),
      profile.complemento,
      profile.bairro,
      [profile.cidade, profile.estado].filter(Boolean).join("/"),
      profile.cep ? `CEP ${formatCEP(profile.cep)}` : null,
    ]
      .filter(Boolean)
      .join(" - ");

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Locador</DialogTitle>
        </DialogHeader>

        <div className="p-6">
        {isPrefeitura ? (
          !profile ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{profile?.nome ?? "—"}</p>
                    {profile?.nome_fantasia && (
                      <p className="text-sm text-muted-foreground">{profile.nome_fantasia}</p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      profile?.ativo
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    }
                  >
                    {profile?.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border border-border">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Dados cadastrais
                  </p>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <Field icon={User} label="Documento" value={formatDoc(profile?.documento)} />
                  <Field icon={Mail} label="Email" value={profile?.email ?? "—"} />
                  <Field icon={Phone} label="Celular" value={profile?.celular ? formatCelular(profile.celular) : "—"} />
                  <Field icon={Phone} label="Telefone" value={profile?.telefone ? formatCelular(profile.telefone) : "—"} />
                  <Field icon={MapPin} label="Endereço" value={endereco || "—"} className="md:col-span-2" />
                </div>
              </div>

              <div className="rounded-lg border border-border">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <FileBadge className="h-4 w-4 text-primary" /> Licenças cadastradas
                    <span className="text-xs font-normal text-muted-foreground">
                      ({licencasPref.length})
                    </span>
                  </p>
                </div>
                {licencasPref.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Nenhuma licença cadastrada.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {licencasPref.map((lic) => (
                      <li key={lic.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {lic.cidade}/{lic.estado}
                          </p>
                          <div className="flex items-center gap-2">
                            {lic.status_prefeitura === "validado" && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                Locador validado
                              </Badge>
                            )}
                            {lic.status_prefeitura === "rejeitado" && (
                              <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">
                                Locador rejeitado
                              </Badge>
                            )}
                            <span className="text-[11px] text-muted-foreground">
                              Desde {new Date(lic.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                        {lic.motivo_prefeitura && (lic.status_prefeitura === "validado" || lic.status_prefeitura === "rejeitado") && (
                          <p className={`text-[11px] ${lic.status_prefeitura === "validado" ? "text-green-600" : "text-rose-600"}`}>
                            <span className="font-semibold">
                              {lic.status_prefeitura === "validado" ? "Observação:" : "Motivo:"}
                            </span>{" "}
                            {lic.motivo_prefeitura}
                          </p>
                        )}
                        {lic.documentos.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Sem documentos anexados.</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {lic.documentos.map((d) => {
                              const styles: Record<string, string> = {
                                aceito: "bg-green-500/10 text-green-600 border-green-500/20",
                                aguardando_validacao: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                                negado: "bg-rose-500/10 text-rose-600 border-rose-500/20",
                                vencido: "bg-rose-500/10 text-rose-600 border-rose-500/20",
                              };
                              return (
                                <li
                                  key={d.id}
                                  className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs space-y-2"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                    <span className="truncate font-medium text-foreground">{d.nome}</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {d.data_vencimento && (
                                      <span className="text-muted-foreground">
                                        Venc.: {new Date(d.data_vencimento).toLocaleDateString("pt-BR")}
                                      </span>
                                    )}
                                    <Badge
                                      variant="outline"
                                      className={`capitalize ${styles[d.status] ?? "bg-muted text-muted-foreground"}`}
                                    >
                                      {d.status.replace(/_/g, " ")}
                                    </Badge>
                                  </div>
                                  </div>
                                  {d.status === "negado" && d.motivo_recusa && (
                                    <p className="text-[11px] text-rose-600">
                                      <span className="font-semibold">Motivo:</span> {d.motivo_recusa}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-end gap-2 pt-1">
                                    {d.arquivo_path && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-[11px] gap-1"
                                        onClick={async () => {
                                          const { data: signed, error } = await supabase.storage
                                            .from("documentos-legais")
                                            .createSignedUrl(d.arquivo_path!, 60, { download: true });
                                          if (error || !signed?.signedUrl) {
                                            toast.error("Não foi possível gerar o link");
                                            return;
                                          }
                                          window.open(signed.signedUrl, "_blank");
                                        }}
                                      >
                                        <Download className="h-3 w-3" /> Baixar
                                      </Button>
                                    )}
                                    {d.status !== "aceito" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-[11px] gap-1 border-green-500/30 text-green-600 hover:bg-green-500/10"
                                        disabled={statusMut.isPending}
                                        onClick={() => {
                                          setActionDoc({ id: d.id, nome: d.nome, action: "aceito" });
                                          setMotivoText("");
                                        }}
                                      >
                                        <Check className="h-3 w-3" /> Validar
                                      </Button>
                                    )}
                                    {d.status !== "negado" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-[11px] gap-1 border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                                        disabled={statusMut.isPending}
                                        onClick={() => {
                                          setActionDoc({ id: d.id, nome: d.nome, action: "negado" });
                                          setMotivoText("");
                                        }}
                                      >
                                        <X className="h-3 w-3" /> Recusar
                                      </Button>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        {(() => {
                          const allAceito =
                            lic.documentos.length > 0 &&
                            lic.documentos.every((d) => d.status === "aceito");
                          if (!allAceito || lic.status_prefeitura === "validado" || lic.status_prefeitura === "rejeitado") return null;
                          return (
                            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                                disabled={licMut.isPending}
                                onClick={() => {
                                  setActionLic({ id: lic.id, label: `${lic.cidade}/${lic.estado}`, action: "rejeitado" });
                                  setMotivoLicText("");
                                }}
                              >
                                <X className="h-4 w-4" /> Rejeitar locador
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 gap-1 bg-green-600 hover:bg-green-700 text-white"
                                disabled={licMut.isPending}
                                onClick={() => {
                                  setActionLic({ id: lic.id, label: `${lic.cidade}/${lic.estado}`, action: "validado" });
                                  setMotivoLicText("");
                                }}
                              >
                                <Check className="h-4 w-4" /> Validar locador
                              </Button>
                            </div>
                          );
                        })()}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        ) : isLoading || !data ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cabeçalho do perfil */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">{p?.nome ?? "—"}</p>
                  {p?.nome_fantasia && (
                    <p className="text-sm text-muted-foreground">{p.nome_fantasia}</p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={
                    p?.ativo
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  }
                >
                  {p?.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>

            {/* KPIs */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard icon={Package} label="Caçambas" value={data.cacambas} color="text-emerald-600" />
                <KpiCard icon={Wrench} label="Equipamentos" value={data.equipamentos} color="text-sky-600" />
                <KpiCard icon={ClipboardList} label="Locações" value={data.locacoes} color="text-purple-600" />
                <KpiCard icon={ShoppingCart} label="Pedidos" value={data.pedidos} color="text-amber-600" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard icon={Handshake} label="Parcerias" value={data.parcerias} color="text-indigo-600" />
                <KpiCard icon={MapPinned} label="Cidades" value={data.cidades} color="text-teal-600" />
                <KpiCard
                  icon={DollarSign}
                  label="Faturamento"
                  value={data.faturamento}
                  color="text-emerald-600"
                  format="currency"
                  className="col-span-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <KpiCard icon={FileCheck2} label="MTRs" value={data.mtrs} color="text-indigo-600" />
                <KpiCard icon={FileBadge} label="CDFs" value={data.cdfs} color="text-teal-600" />
                <KpiCard icon={FileSpreadsheet} label="NFs" value={data.nfs} color="text-slate-600" />
              </div>
            </div>

            {/* Dados cadastrais */}
            <div className="rounded-lg border border-border">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Dados cadastrais
                </p>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Field icon={User} label="Documento" value={formatDoc(p?.documento)} />
                <Field icon={Mail} label="Email" value={p?.email ?? "—"} />
                <Field icon={Phone} label="Celular" value={p?.celular ? formatCelular(p.celular) : "—"} />
                <Field icon={Phone} label="Telefone" value={p?.telefone ? formatCelular(p.telefone) : "—"} />
                <Field icon={MapPin} label="Endereço" value={endereco || "—"} className="md:col-span-2" />
              </div>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
    <Dialog
      open={!!actionDoc}
      onOpenChange={(o) => {
        if (!o) {
          setActionDoc(null);
          setMotivoText("");
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionDoc?.action === "aceito" ? "Validar documento" : "Recusar documento"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 px-6 py-4">
          {actionDoc && (
            <p className="text-sm text-muted-foreground">
              Documento: <span className="font-medium text-foreground">{actionDoc.nome}</span>
            </p>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {actionDoc?.action === "aceito" ? "Observação *" : "Motivo da recusa *"}
            </label>
            <Textarea
              value={motivoText}
              onChange={(e) => setMotivoText(e.target.value)}
              placeholder={
                actionDoc?.action === "aceito"
                  ? "Descreva a observação da validação"
                  : "Descreva o motivo para recusar este documento"
              }
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t -mx-6 px-6 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setActionDoc(null);
                setMotivoText("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant={actionDoc?.action === "aceito" ? "default" : "destructive"}
              disabled={statusMut.isPending || !motivoText.trim()}
              onClick={() =>
                actionDoc &&
                statusMut.mutate({
                  docId: actionDoc.id,
                  status: actionDoc.action,
                  motivo: motivoText.trim(),
                })
              }
            >
              {actionDoc?.action === "aceito" ? "Confirmar validação" : "Confirmar recusa"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog
      open={!!actionLic}
      onOpenChange={(o) => {
        if (!o) {
          setActionLic(null);
          setMotivoLicText("");
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionLic?.action === "validado" ? "Validar locador" : "Rejeitar locador"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 px-6 py-4">
          {actionLic && (
            <p className="text-sm text-muted-foreground">
              Licença: <span className="font-medium text-foreground">{actionLic.label}</span>
            </p>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {actionLic?.action === "validado" ? "Observação *" : "Motivo da rejeição *"}
            </label>
            <Textarea
              value={motivoLicText}
              onChange={(e) => setMotivoLicText(e.target.value)}
              placeholder={
                actionLic?.action === "validado"
                  ? "Descreva a observação da validação"
                  : "Descreva o motivo para rejeitar este locador"
              }
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t -mx-6 px-6 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setActionLic(null);
                setMotivoLicText("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant={actionLic?.action === "validado" ? "default" : "destructive"}
              disabled={licMut.isPending || !motivoLicText.trim()}
              onClick={() =>
                actionLic &&
                licMut.mutate({
                  licId: actionLic.id,
                  status: actionLic.action,
                  motivo: motivoLicText.trim(),
                })
              }
            >
              {actionLic?.action === "validado" ? "Confirmar validação" : "Confirmar rejeição"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  format,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  format?: "currency" | "number";
  className?: string;
}) {
  const display =
    format === "currency"
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0)
      : value;
  return (
    <div className={`rounded-lg border border-border bg-background p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{display}</p>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[11px] uppercase text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
