import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ListChecks, ShoppingCart, XCircle, Ban, MapPin, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePagination } from "@/components/DataPagination";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const t = setTimeout(() => map.invalidateSize(), 50);
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [map]);
  return null;
};

type PFStatus =
  | "aguardando_aceite"
  | "aceito"
  | "recusado"
  | "em_separacao"
  | "agendado"
  | "entregue"
  | "cancelado";

interface PedidoRow {
  id: string;
  pedidoId: string;
  pedidoNumero: number;
  pfNumero: number;
  dataAbertura: string;
  dataAberturaISO: string;
  status: PFStatus;
  contraparteNome: string;
  valorTotal: number;
  qtdOrdens: number;
  resumoOrdens: string;
  endereco: string;
}

const statusLabel: Record<PFStatus, string> = {
  aguardando_aceite: "Aguardando aceite",
  aceito: "Aceito pelo locador",
  recusado: "Recusado",
  em_separacao: "Em separação",
  agendado: "Agendado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const statusClasses: Record<PFStatus, string> = {
  aguardando_aceite: "bg-orange-500 text-white",
  aceito: "bg-primary text-primary-foreground",
  recusado: "bg-destructive text-destructive-foreground",
  em_separacao: "bg-blue-500 text-white",
  agendado: "bg-indigo-500 text-white",
  entregue: "bg-emerald-600 text-white",
  cancelado: "bg-destructive text-destructive-foreground",
};

// Legacy mock kept for screens that still render demo data
// (PedidoDetalhes / PedidoMapa). The list itself now loads from the DB.
export interface Pedido {
  id: number;
  dataAbertura: string;
  status: "aguardando" | "aceito" | "recusado" | "cancelado";
  locatario: string;
  endereco: string;
  quantidade: number;
  valorTotal: number;
  modelo: string;
  cacamba: string;
  situacaoCacamba: string;
}
export const mockPedidos: Pedido[] = [];

const PedidosList = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore((s) => s.activeProfile() ?? s.user?.profiles[0] ?? null);
  const profileType = activeProfile?.profileType;
  const isLocador = profileType === "locador";
  const rawTenant = activeProfile?.tenantId;
  // tenantId === 'self' significa que o próprio usuário é o locador
  const locadorId =
    rawTenant && rawTenant !== "self" ? rawTenant : user?.id;
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mapaPedido, setMapaPedido] = useState<PedidoRow | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["meus-pedidos", profileType, isLocador ? locadorId : user?.id],
    enabled: !!user?.id && !!profileType,
    queryFn: async (): Promise<PedidoRow[]> => {
      const query = supabase
        .from("pedido_fornecedores")
        .select(
          `id, numero, locador_id, status, valor_total,
           pedidos!inner ( id, numero, created_at, locatario_id ),
           ordens_locacao ( id, equipment_type, quantidade, cacamba_id, equipamento_id,
             obras ( rua, numero, bairro, cidade, estado, complemento ) )`
        );
      const { data: pfs, error } = isLocador
        ? await query.eq("locador_id", locadorId!)
        : await query.eq("pedidos.locatario_id", user!.id);
      if (error) throw error;

      // resolve nome da contraparte (locador p/ locatário; locatário p/ locador)
      const ids = Array.from(
        new Set(
          (pfs ?? [])
            .map((pf: any) => (isLocador ? pf.pedidos?.locatario_id : pf.locador_id))
            .filter(Boolean)
        )
      );
      const nomes = new Map<string, string>();
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nome")
          .in("id", ids as string[]);
        (profs ?? []).forEach((p: any) => nomes.set(p.id, p.nome));
      }

      return (pfs ?? [])
        .sort((a: any, b: any) =>
          (b.pedidos?.created_at ?? "").localeCompare(a.pedidos?.created_at ?? "")
        )
        .map((pf: any) => {
          const ords = pf.ordens_locacao ?? [];
          const qtd = ords.reduce((s: number, o: any) => s + (o.quantidade ?? 0), 0);
          const contraparteId = isLocador ? pf.pedidos?.locatario_id : pf.locador_id;
          const createdAt = pf.pedidos?.created_at ?? "";
          const obra = ords.map((o: any) => o.obras).find(Boolean);
          const endereco = obra
            ? [
                [obra.rua, obra.numero].filter(Boolean).join(", "),
                obra.bairro,
                [obra.cidade, obra.estado].filter(Boolean).join("/"),
              ]
                .filter(Boolean)
                .join(" - ")
            : "—";
          return {
            id: pf.id,
            pedidoId: pf.pedidos?.id,
            pedidoNumero: pf.pedidos?.numero,
            pfNumero: pf.numero,
            dataAbertura: createdAt ? new Date(createdAt).toLocaleString("pt-BR") : "—",
            dataAberturaISO: createdAt ? createdAt.slice(0, 10) : "",
            status: pf.status as PFStatus,
            contraparteNome: contraparteId ? nomes.get(contraparteId) ?? "—" : "—",
            valorTotal: Number(pf.valor_total ?? 0),
            qtdOrdens: qtd,
            resumoOrdens: ords
              .map((o: any) => `${o.quantidade}× ${o.equipment_type}`)
              .join(" • "),
            endereco,
          };
        });
    },
  });

  const counts = useMemo(() => ({
    aguardando_aceite: rows.filter((p) => p.status === "aguardando_aceite").length,
    aceito: rows.filter((p) => p.status === "aceito").length,
    recusado: rows.filter((p) => p.status === "recusado").length,
    cancelado: rows.filter((p) => p.status === "cancelado").length,
  }), [rows]);

  const filtered = rows.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.contraparteNome.toLowerCase().includes(q) ||
      String(p.pedidoNumero).includes(q) ||
      String(p.pfNumero).includes(q);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesDate = !dateFilter || p.dataAberturaISO === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const stats = [
    { label: "Aguardando aceite", value: counts.aguardando_aceite, icon: ShoppingCart },
    { label: "Aceitos", value: counts.aceito, icon: ListChecks },
    { label: "Recusados", value: counts.recusado, icon: XCircle },
    { label: "Cancelados", value: counts.cancelado, icon: Ban },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <h1 className="text-xl sm:text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-white/75">Acompanhamento de ordens de locação</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      <DataTable<PedidoRow>
        title={isLoading ? "Carregando..." : `${filtered.length} pedidos`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Buscar por ${isLocador ? "locatário" : "locador"} ou nº do pedido...`}
        activeFiltersCount={(dateFilter ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
        onClearFilters={() => { setDateFilter(""); setStatusFilter("all"); }}
        filters={
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Filtros avançados</h4>
              <p className="text-sm text-muted-foreground">Refine sua busca por data ou situação.</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-muted-foreground">Data de Abertura</p>
                <Input 
                  type="date" 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)} 
                  className="h-9" 
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-muted-foreground">Situação</p>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas situações</SelectItem>
                    <SelectItem value="aguardando_aceite">Aguardando aceite</SelectItem>
                    <SelectItem value="aceito">Aceito</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                    <SelectItem value="em_separacao">Em separação</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        }
        columns={[
          {
            header: "Data Abertura",
            accessor: (p) => (
              <>
                <p className="text-sm font-medium">{p.dataAbertura}</p>
                <Badge className={`mt-2 text-[9px] uppercase font-black px-1.5 py-0.5 rounded shadow-none tracking-tighter ${statusClasses[p.status]}`}>
                  {statusLabel[p.status]}
                </Badge>
              </>
            ),
          },
          {
            header: isLocador ? "Locatário" : "Locador",
            className: "max-w-xs",
            accessor: (p) => (
              <>
                <p className="text-xs font-bold text-primary uppercase tracking-tight mb-0.5">
                  Pedido #{p.pedidoNumero} • Subpedido #{p.pfNumero}
                </p>
                <p className="text-sm font-bold text-foreground leading-none mb-1.5">{p.contraparteNome}</p>
              </>
            ),
          },
          {
            header: "Qtd",
            accessor: (p) => p.qtdOrdens,
            align: "center",
          },
          {
            header: "Endereço",
            className: "max-w-[260px]",
            accessor: (p) => (
              <p className="text-xs text-foreground leading-tight line-clamp-2" title={p.endereco}>
                {p.endereco}
              </p>
            ),
          },
          {
            header: "Valor Total",
            accessor: (p) => (
              <p className="text-sm font-black text-foreground">
                R$ {p.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            ),
          },
          {
            header: "Itens",
            className: "max-w-[200px]",
            accessor: (p) => (
              <p className="text-[11px] text-muted-foreground leading-tight font-medium italic">
                {p.resumoOrdens || "—"}
              </p>
            ),
          },
        ]}
        renderMobileCard={(p) => (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{p.dataAbertura}</span>
              <Badge variant="outline" className={`text-[10px] uppercase font-bold border-0 ${statusClasses[p.status]} bg-opacity-10`}>
                {statusLabel[p.status]}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">Pedido nº {p.pedidoNumero}/{p.pfNumero}</p>
                <p className="text-sm font-black text-primary">R$ {p.valorTotal}</p>
              </div>
              <p className="text-sm font-medium leading-tight">{p.contraparteNome}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{p.resumoOrdens}</p>
              <p className="text-xs text-foreground line-clamp-2"><span className="font-semibold">Endereço:</span> {p.endereco}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground font-medium uppercase">{p.qtdOrdens} item(ns)</span>
              <div className="flex gap-2">
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => navigate(`/dashboard/pedidos/${p.pedidoId}`)}>
                  <List className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => setMapaPedido(p)}>
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        actions={(p) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => navigate(`/dashboard/pedidos/${p.pedidoId}`)} title="Ver Detalhes">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => setMapaPedido(p)} title="Ver no Mapa">
              <MapPin className="h-4 w-4" />
            </Button>
          </>
        )}
        pagination={{
          totalItems,
          pageSize,
          currentPage,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <Dialog open={!!mapaPedido} onOpenChange={(o) => !o && setMapaPedido(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle>
              Localização — Pedido nº {mapaPedido?.pedidoNumero}/{mapaPedido?.pfNumero}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="w-full h-[500px] rounded-md overflow-hidden bg-muted">
              {mapaPedido && (
                <MapContainer center={[-20.8113, -49.3758]} zoom={14} style={{ height: "100%", width: "100%" }}>
                  <MapResizer />
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[-20.8113, -49.3758]}>
                    <Popup>{mapaPedido.contraparteNome}</Popup>
                  </Marker>
                </MapContainer>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PedidosList;
