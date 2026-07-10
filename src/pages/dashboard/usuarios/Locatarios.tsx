import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Mail, Power, Eye, ShoppingCart, ClipboardList, Building2, Receipt, MapPin, User, FileText, FileCheck2, FileBadge, FileSpreadsheet, CircleDollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/components/DataPagination";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { formatCPF, formatCNPJ, formatCelular, formatCEP, onlyDigits } from "@/lib/auth-utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Locatario {
  id: string;
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  status: "ativo" | "inativo";
  avatar_url?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

const Locatarios = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: locatarios = [], isLoading } = useQuery({
    queryKey: ["locatarios", "v2"],
    queryFn: async (): Promise<Locatario[]> => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id, ativo")
        .eq("role", "locatario");
      if (error) throw error;
      const ativoMap = new Map<string, boolean>();
      (roles ?? []).forEach((r) => {
        ativoMap.set(r.user_id, (ativoMap.get(r.user_id) ?? false) || !!r.ativo);
      });
      const ids = Array.from(ativoMap.keys());
      if (ids.length === 0) return [];
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, nome, documento, celular, telefone, email, avatar_url, cidade, estado")
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

  const filtered = locatarios.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.documento.includes(search)
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const formatDoc = (v: string) =>
    onlyDigits(v).length > 11 ? formatCNPJ(v) : formatCPF(v);

  const toggleAcesso = useMutation({
    mutationFn: async (l: Locatario) => {
      const novo = l.status !== "ativo";
      const { error } = await supabase
        .from("user_roles")
        .update({ ativo: novo })
        .eq("user_id", l.id)
        .eq("role", "locatario");
      if (error) throw error;
      return novo;
    },
    onSuccess: (novo) => {
      toast.success(novo ? "Acesso ativado" : "Acesso desativado");
      queryClient.invalidateQueries({ queryKey: ["locatarios"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao atualizar acesso"),
  });

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Gestão de Locatários</h1>
            <p className="text-sm text-white/75">Administração de clientes que pedem caçambas</p>
          </div>
        </div>
      )}

      <DataTable<Locatario>
        title={`${locatarios.length} locatários cadastrados`}
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
            accessor: (c) => (
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
            ),
          },
          {
            header: "Contato",
            accessor: (c) => (
              <div className="text-xs space-y-1">
                <p className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /> {formatCelular(c.telefone)}</p>
                <p className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" /> {c.email}</p>
              </div>
            ),
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

      <LocatarioDetailsDialog id={detailId} onOpenChange={(o) => !o && setDetailId(null)} />
    </div>
  );
};

export default Locatarios;

// ============ Detalhes do Locatário ============
function LocatarioDetailsDialog({
  id,
  onOpenChange,
}: {
  id: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = !!id;
  const { data, isLoading } = useQuery({
    queryKey: ["locatario-detalhes", id],
    enabled: !!id,
    queryFn: async () => {
      const [profileRes, pedidosRes, obrasRes, faturasRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id!).maybeSingle(),
        supabase.from("pedidos").select("id").eq("locatario_id", id!),
        supabase.from("obras").select("id", { count: "exact", head: true }).eq("user_id", id!),
        supabase.from("faturas").select("valor_total, status").eq("locatario_id", id!),
      ]);
      if (profileRes.error) throw profileRes.error;
      if (pedidosRes.error) throw pedidosRes.error;

      const pedidoIds = (pedidosRes.data ?? []).map((p: any) => p.id);
      let locacoes = 0;
      if (pedidoIds.length) {
        const { data: pfs } = await supabase
          .from("pedido_fornecedores")
          .select("ordens_locacao(id)")
          .in("pedido_id", pedidoIds);
        (pfs ?? []).forEach((pf: any) => {
          locacoes += Array.isArray(pf.ordens_locacao) ? pf.ordens_locacao.length : 0;
        });
      }

      return {
        profile: profileRes.data as any,
        pedidos: pedidoIds.length,
        obras: obrasRes.count ?? 0,
        faturas: (faturasRes.data ?? []).length,
        faturasPagas: (faturasRes.data ?? [])
          .filter((f: any) => f.status === "paga")
          .reduce((acc: number, f: any) => acc + Number(f.valor_total ?? 0), 0),
        faturasPendentes: (faturasRes.data ?? [])
          .filter((f: any) => f.status !== "paga")
          .reduce((acc: number, f: any) => acc + Number(f.valor_total ?? 0), 0),
        mtrs: 0,
        cdfs: 0,
        nfs: 0,
        locacoes,
      };
    },
  });

  const p = data?.profile;
  const formatDoc = (v?: string | null) => {
    if (!v) return "—";
    return onlyDigits(v).length > 11 ? formatCNPJ(v) : formatCPF(v);
  };
  const endereco =
    p &&
    [
      [p.logradouro, p.numero].filter(Boolean).join(", "),
      p.complemento,
      p.bairro,
      [p.cidade, p.estado].filter(Boolean).join("/"),
      p.cep ? `CEP ${formatCEP(p.cep)}` : null,
    ]
      .filter(Boolean)
      .join(" - ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Locatário</DialogTitle>
        </DialogHeader>

        <div className="p-6">
        {isLoading || !data ? (
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

            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard icon={ShoppingCart} label="Pedidos" value={data.pedidos} color="text-amber-600" />
                <KpiCard icon={ClipboardList} label="Locações" value={data.locacoes} color="text-purple-600" />
                <KpiCard icon={Building2} label="Obras" value={data.obras} color="text-sky-600" />
                <KpiCard icon={Receipt} label="Faturas" value={data.faturas} color="text-emerald-600" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <KpiCard
                  icon={Wallet}
                  label="Faturas pendentes"
                  value={data.faturasPendentes}
                  color="text-rose-600"
                  format="currency"
                />
                <KpiCard
                  icon={CircleDollarSign}
                  label="Faturas pagas"
                  value={data.faturasPagas}
                  color="text-emerald-600"
                  format="currency"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <KpiCard icon={FileCheck2} label="MTRs" value={data.mtrs} color="text-indigo-600" />
                <KpiCard icon={FileBadge} label="CDFs" value={data.cdfs} color="text-teal-600" />
                <KpiCard icon={FileSpreadsheet} label="NFs" value={data.nfs} color="text-slate-600" />
              </div>
            </div>

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
