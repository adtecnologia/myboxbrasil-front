import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Power, Eye, MapPin, Building, FileText, User, Phone, Mail, Users, Package, ClipboardList, ShoppingCart, Recycle, Truck, FileCheck2, FileBadge, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/components/DataPagination";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { formatCPF, formatCNPJ, formatCelular, formatCEP, onlyDigits } from "@/lib/auth-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Prefeitura {
  id: string;
  nome: string;
  documento: string;
  cidade: string;
  estado: string;
  status: "ativo" | "inativo";
}

const initials = (n: string) => (n || "").trim().substring(0, 2).toUpperCase() || "PM";

const Prefeituras = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: prefeituras = [], isLoading } = useQuery({
    queryKey: ["prefeituras"],
    queryFn: async (): Promise<Prefeitura[]> => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id, ativo")
        .eq("role", "prefeitura");
      if (error) throw error;
      const ativoMap = new Map<string, boolean>();
      (roles ?? []).forEach((r) => {
        ativoMap.set(r.user_id, (ativoMap.get(r.user_id) ?? false) || !!r.ativo);
      });
      const ids = Array.from(ativoMap.keys());
      if (ids.length === 0) return [];
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, nome, documento, cidade, estado")
        .in("id", ids)
        .order("nome", { ascending: true });
      if (pErr) throw pErr;
      return (profiles ?? []).map((p) => ({
        id: p.id,
        nome: p.nome ?? "",
        documento: p.documento ?? "",
        cidade: p.cidade ?? "",
        estado: p.estado ?? "",
        status: ativoMap.get(p.id) ? "ativo" : "inativo",
      }));
    },
  });

  const filtered = prefeituras.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.documento.includes(search) ||
    p.cidade.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const formatDoc = (v: string) =>
    onlyDigits(v).length > 11 ? formatCNPJ(v) : formatCPF(v);

  const toggleAcesso = useMutation({
    mutationFn: async (p: Prefeitura) => {
      const novo = p.status !== "ativo";
      const { error } = await supabase
        .from("user_roles")
        .update({ ativo: novo })
        .eq("user_id", p.id)
        .eq("role", "prefeitura");
      if (error) throw error;
      return novo;
    },
    onSuccess: (novo) => {
      toast.success(novo ? "Acesso ativado" : "Acesso desativado");
      queryClient.invalidateQueries({ queryKey: ["prefeituras"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao atualizar acesso"),
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Prefeituras</h1>
          <p className="text-sm text-white/75">Cadastro de prefeituras conveniadas</p>
        </div>
      </div>

      <DataTable<Prefeitura>
        title={`${prefeituras.length} prefeituras cadastradas`}
        data={paginatedData}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Foto",
            accessor: (p) => (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {initials(p.nome)}
              </div>
            ),
          },
          { header: "Nome", accessor: "nome", className: "font-medium" },
          { header: "Documento", accessor: (p) => formatDoc(p.documento) },
          { header: "Cidade", accessor: (p) => p.cidade || "—" },
          { header: "Estado", accessor: (p) => p.estado || "—" },
          {
            header: "Status",
            accessor: (p) => (
              <Badge
                variant="outline"
                className={
                  p.status === "ativo"
                    ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 capitalize"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20 capitalize"
                }
              >
                {p.status}
              </Badge>
            ),
          },
        ]}
        renderMobileCard={(p) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {initials(p.nome)}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">{formatDoc(p.documento)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => toggleAcesso.mutate(p)}
                disabled={toggleAcesso.isPending}
              >
                <Power className="h-3.5 w-3.5" />
                {p.status === "ativo" ? "Desativar" : "Ativar"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.cidade || "—"} - {p.estado || "—"}</span>
            </div>
          </div>
        )}
        actions={(p) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 rounded-lg shadow-sm"
              onClick={() => setDetailId(p.id)}
              title="Ver detalhes"
            >
              <Eye className="h-4 w-4" />
              Detalhes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 gap-1 rounded-lg shadow-sm ${p.status === "ativo" ? "text-destructive hover:border-destructive" : "text-primary hover:border-primary"}`}
              onClick={() => toggleAcesso.mutate(p)}
              disabled={toggleAcesso.isPending}
              title={p.status === "ativo" ? "Desativar acesso" : "Ativar acesso"}
            >
              <Power className="h-4 w-4" />
              {p.status === "ativo" ? "Desativar" : "Ativar"}
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

      <PrefeituraDetailsDialog id={detailId} onOpenChange={(o) => !o && setDetailId(null)} />
    </div>
  );
};

export default Prefeituras;

// ============ Detalhes da Prefeitura ============
function PrefeituraDetailsDialog({
  id,
  onOpenChange,
}: {
  id: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = !!id;
  const { data, isLoading } = useQuery({
    queryKey: ["prefeitura-detalhes", id],
    enabled: !!id,
    queryFn: async () => {
      const [profileRes, dashRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id!).maybeSingle(),
        supabase.rpc("get_prefeitura_dashboard", { _uid: id! }),
      ]);
      if (profileRes.error) throw profileRes.error;
      const stats = (dashRes.data as any)?.stats ?? {};
      return {
        profile: profileRes.data as any,
        locadores: Number(stats.locadores ?? 0),
        cacambas: Number(stats.cacambas ?? 0),
        locacoes: Number(stats.cacambas_locadas ?? 0),
        pedidos: Number(stats.total_pedidos ?? 0),
        residuos: Number(stats.residuos_m3 ?? 0),
        destinos: Number(stats.destino_final ?? 0),
        ordens: Number(stats.total_ordens ?? 0),
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Detalhes da Prefeitura
          </DialogTitle>
          <DialogDescription>Informações cadastrais e indicadores operacionais.</DialogDescription>
        </DialogHeader>

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
                  {(p?.cidade || p?.estado) && (
                    <p className="text-sm text-muted-foreground">
                      {[p?.cidade, p?.estado].filter(Boolean).join("/")}
                    </p>
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
                <KpiCard icon={Users} label="Locadores" value={data.locadores} color="text-indigo-600" />
                <KpiCard icon={Package} label="Caçambas" value={data.cacambas} color="text-emerald-600" />
                <KpiCard icon={ClipboardList} label="Locações" value={data.locacoes} color="text-purple-600" />
                <KpiCard icon={ShoppingCart} label="Pedidos" value={data.pedidos} color="text-amber-600" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard icon={Recycle} label="Resíduos (m³)" value={data.residuos} color="text-lime-600" />
                <KpiCard icon={Truck} label="Destinos finais" value={data.destinos} color="text-sky-600" />
                <KpiCard icon={ClipboardList} label="Ordens" value={data.ordens} color="text-rose-600" className="col-span-2" />
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
