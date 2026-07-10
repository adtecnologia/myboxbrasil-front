import { useState } from "react";
import {
  MapPin,
  Eye,
  Phone,
  Mail,
  Power,
  Building2,
  User,
  FileText,
  Package,
  Boxes,
  MapPinned,
  FileCheck2,
  FileBadge,
  FileSpreadsheet,
} from "lucide-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCPF, formatCNPJ, formatCelular, formatCEP, onlyDigits } from "@/lib/auth-utils";
import { toast } from "sonner";

const initials = (n: string) => (n || "").trim().substring(0, 2).toUpperCase() || "DF";

interface Destinador {
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

const Destinadores = () => {
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: destinadores = [], isLoading } = useQuery({
    queryKey: ["destinadores", "v2"],
    queryFn: async (): Promise<Destinador[]> => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id, ativo")
        .eq("role", "destino");
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

  const filtered = destinadores.filter((d) =>
    d.nome.toLowerCase().includes(search.toLowerCase()) ||
    d.documento.includes(search)
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const formatDoc = (v: string) =>
    onlyDigits(v).length > 11 ? formatCNPJ(v) : formatCPF(v);

  const toggleAcesso = useMutation({
    mutationFn: async (d: Destinador) => {
      const novo = d.status !== "ativo";
      const { error } = await supabase
        .from("user_roles")
        .update({ ativo: novo })
        .eq("user_id", d.id)
        .eq("role", "destino");
      if (error) throw error;
      return novo;
    },
    onSuccess: (novo) => {
      toast.success(novo ? "Acesso ativado" : "Acesso desativado");
      queryClient.invalidateQueries({ queryKey: ["destinadores"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao atualizar acesso"),
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Destinadores Finais</h1>
          <p className="text-sm text-white/75">Cadastro de aterros e usinas de reciclagem</p>
        </div>
      </div>

      <DataTable<Destinador>
        title={`${destinadores.length} destinadores cadastrados`}
        data={paginatedData}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Foto",
            accessor: (d) => (
              <Avatar className="h-9 w-9">
                <AvatarImage src={d.avatar_url ?? undefined} alt={d.nome} />
                <AvatarFallback className="text-xs">{initials(d.nome)}</AvatarFallback>
              </Avatar>
            ),
          },
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "Documento", accessor: (d) => (d.documento ? formatDoc(d.documento) : "—") },
          {
            header: "Cidade",
            accessor: (d) =>
              d.cidade || d.estado
                ? [d.cidade, d.estado].filter(Boolean).join("/")
                : "—",
          },
          {
            header: "Status",
            accessor: (d) => (
              <Badge
                variant="outline"
                className={
                  d.status === "ativo"
                    ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 capitalize"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20 capitalize"
                }
              >
                {d.status}
              </Badge>
            ),
          },
          {
            header: "Contato",
            accessor: (d) => (
              <div className="text-xs space-y-1">
                <p className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /> {d.telefone ? formatCelular(d.telefone) : "—"}</p>
                <p className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" /> {d.email || "—"}</p>
              </div>
            ),
          },
        ]}
        renderMobileCard={(d) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={d.avatar_url ?? undefined} alt={d.nome} />
                  <AvatarFallback className="text-xs">{initials(d.nome)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground">{d.nome}</p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase">{d.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.documento ? formatDoc(d.documento) : "—"}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => toggleAcesso.mutate(d)}
                disabled={toggleAcesso.isPending}
              >
                <Power className="h-3.5 w-3.5" />
                {d.status === "ativo" ? "Desativar" : "Ativar"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{d.cidade ?? "—"}/{d.estado ?? "—"}</span>
            </div>
          </div>
        )}
        actions={(d) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 rounded-lg shadow-sm"
              onClick={() => setDetailId(d.id)}
              title="Ver detalhes"
            >
              <Eye className="h-4 w-4" />
              Detalhes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 gap-1 rounded-lg shadow-sm ${d.status === "ativo" ? "text-destructive hover:border-destructive" : "text-primary hover:border-primary"}`}
              onClick={() => toggleAcesso.mutate(d)}
              disabled={toggleAcesso.isPending}
              title={d.status === "ativo" ? "Desativar acesso" : "Ativar acesso"}
            >
              <Power className="h-4 w-4" />
              {d.status === "ativo" ? "Desativar" : "Ativar"}
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

      <DestinadorDetailsDialog id={detailId} onOpenChange={(o) => !o && setDetailId(null)} />
    </div>
  );
};

export default Destinadores;

// ============ Detalhes do Destinador ============
function DestinadorDetailsDialog({
  id,
  onOpenChange,
}: {
  id: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = !!id;
  const { data, isLoading } = useQuery({
    queryKey: ["destinador-detalhes", id],
    enabled: !!id,
    queryFn: async () => {
      const [profileRes, oluRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id!).maybeSingle(),
        supabase
          .from("ordem_locacao_unidades")
          .select("id, volume_m3, ordem_locacao_id, ordens_locacao(obra_id, obras(cidade, estado))")
          .eq("destino_final_id", id!),
      ]);
      if (profileRes.error) throw profileRes.error;

      const olus = (oluRes.data ?? []) as any[];
      const locacoes = olus.length;
      const volume = olus.reduce((acc, o) => acc + Number(o.volume_m3 ?? 0), 0);
      const cidades = new Set<string>();
      olus.forEach((o) => {
        const obra = o.ordens_locacao?.obras;
        if (obra?.cidade && obra?.estado) {
          cidades.add(`${obra.cidade}/${obra.estado}`.toLowerCase());
        }
      });

      return {
        profile: profileRes.data as any,
        locacoes,
        volume,
        cidades: cidades.size,
        mtrs: 0,
        cdfs: 0,
        nfs: 0,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Destinador</DialogTitle>
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
            <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-lg font-semibold text-foreground">{p?.nome ?? "—"}</p>
                {p?.nome_fantasia && <p className="text-sm text-muted-foreground">{p.nome_fantasia}</p>}
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

            {/* KPIs */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard icon={Package} label="Locações" value={data.locacoes} color="text-purple-600" />
                <KpiCard icon={Boxes} label="Volume (m³)" value={data.volume} color="text-emerald-600" format="decimal" />
                <KpiCard icon={MapPinned} label="Cidades" value={data.cidades} color="text-teal-600" />
                <KpiCard icon={FileCheck2} label="MTRs" value={data.mtrs} color="text-indigo-600" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
  format?: "decimal" | "number";
  className?: string;
}) {
  const display =
    format === "decimal"
      ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value ?? 0)
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
