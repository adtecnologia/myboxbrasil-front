
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Map as MapIcon, 
  Truck, 
  Navigation,
  ChevronRight,
  Info,
  X,
  Ban
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePagination } from "@/components/DataPagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createSequenceIcon = (sequence: number) => {
  return L.divIcon({
    className: 'custom-sequence-marker',
    html: `
      <div style="
        background: #3b82f6;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${sequence}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

type Ponto = {
  id: string;
  cliente: string;
  endereco: string;
  tipo: string;
  posicao: [number, number] | null;
  enderecoQueries: string[];
};

type Rota = {
  id: string;
  nome: string;
  motorista: string;
  veiculo: string;
  dataProgramada: string | null;
  data: string;
  status: string;
  pontos: number;
  itinerario: Ponto[];
};

// Nominatim geocoder com cache em memória
const geocodeCache = new Map<string, [number, number] | null>();
async function geocodeAddress(query: string): Promise<[number, number] | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (geocodeCache.has(key)) return geocodeCache.get(key) ?? null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" } },
    );
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      const pos: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      geocodeCache.set(key, pos);
      return pos;
    }
  } catch {}
  geocodeCache.set(key, null);
  return null;
}

const MapAutoFit = ({ center, positions }: { center: [number, number]; positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (positions.length === 1) map.setView(positions[0], 14);
    else if (positions.length > 1) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else map.setView(center, 12);
  }, [map, center, positions]);
  return null;
};

const MapFlyTo = ({ target }: { target: { pos: [number, number]; key: string } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !target) return;
    map.flyTo(target.pos, 17, { duration: 0.8 });
  }, [map, target]);
  return null;
};

function useRotasAgendadas() {
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore(
    (s) => s.activeProfile() ?? s.user?.profiles[0] ?? null
  );
  const rawTenant = activeProfile?.tenantId;
  const locadorId = rawTenant && rawTenant !== "self" ? rawTenant : user?.id;

  const { data = [], isLoading } = useQuery({
    queryKey: ["rotas-agendadas", locadorId],
    enabled: !!locadorId,
    queryFn: async (): Promise<Rota[]> => {
      const { data: rotas, error } = await supabase
        .from("rotas")
        .select(
          `id, motorista_id, data_programada, status,
           veiculos ( placa, marca, modelo ),
           rota_itens (
             id, sequencia, tipo,
             ordem_locacao_unidades (
               id,
               ordens_locacao (
                 obras ( rua, numero, bairro, cidade, estado ),
                 pedido_fornecedores ( pedidos ( locatario_id ) )
               )
             )
           )`
        )
        .eq("locador_id", locadorId!)
        .in("status", ["agendada", "em_andamento", "cancelada"])
        .order("data_programada", { ascending: true });
      if (error) throw error;

      const motIds = Array.from(
        new Set((rotas ?? []).map((r: any) => r.motorista_id).filter(Boolean))
      );
      const locIds = Array.from(
        new Set(
          (rotas ?? []).flatMap((r: any) =>
            (r.rota_itens ?? [])
              .map(
                (it: any) =>
                  it.ordem_locacao_unidades?.ordens_locacao
                    ?.pedido_fornecedores?.pedidos?.locatario_id
              )
              .filter(Boolean)
          )
        )
      );
      const ids = Array.from(new Set([...motIds, ...locIds]));
      const nomes = new Map<string, string>();
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nome")
          .in("id", ids);
        (profs ?? []).forEach((p: any) => nomes.set(p.id, p.nome));
      }

      return (rotas ?? []).map((r: any, idx: number): Rota => {
        const v = r.veiculos ?? {};
        const veiculoLabel = v.placa
          ? `${v.placa}${v.marca || v.modelo ? ` (${[v.marca, v.modelo].filter(Boolean).join(" ")})` : ""}`
          : "—";
        const itens = [...(r.rota_itens ?? [])].sort(
          (a: any, b: any) => a.sequencia - b.sequencia
        );
        return {
          id: r.id,
          nome: `Rota ${String(idx + 1).padStart(3, "0")}`,
          motorista: nomes.get(r.motorista_id) ?? "—",
          veiculo: veiculoLabel,
          dataProgramada: r.data_programada ?? null,
          data: r.data_programada
            ? (() => { const [y,m,d] = String(r.data_programada).slice(0,10).split("-"); return `${d}/${m}/${y}`; })()
            : "—",
          status: r.status,
          pontos: itens.length,
          itinerario: itens.map((it: any): Ponto => {
            const ol = it.ordem_locacao_unidades?.ordens_locacao ?? {};
            const obra = ol.obras ?? {};
            const locId = ol.pedido_fornecedores?.pedidos?.locatario_id;
            const endereco = [
              [obra.rua, obra.numero].filter(Boolean).join(", "),
              obra.bairro,
              [obra.cidade, obra.estado].filter(Boolean).join("/"),
            ]
              .filter(Boolean)
              .join(" - ");
            const fullQuery = [
              [obra.rua, obra.numero].filter(Boolean).join(", "),
              obra.bairro,
              obra.cidade,
              obra.estado,
              "Brasil",
            ].filter(Boolean).join(", ");
            const enderecoQueries = [
              fullQuery,
              [obra.bairro, obra.cidade, obra.estado, "Brasil"].filter(Boolean).join(", "),
              [obra.cidade, obra.estado, "Brasil"].filter(Boolean).join(", "),
            ].filter((v, i, a) => v && a.indexOf(v) === i);
            return {
              id: it.id,
              cliente: (locId && nomes.get(locId)) ?? "Cliente",
              endereco: endereco || "—",
              tipo: it.tipo,
              posicao: null,
              enderecoQueries,
            };
          }),
        };
      }).sort((a, b) => (a.dataProgramada ?? "9999-12-31").localeCompare(b.dataProgramada ?? "9999-12-31"));
    },
  });
  return { data, isLoading };
}

const RotasAgendadas = () => {
  const { data: rotas, isLoading } = useRotasAgendadas();
  const [search, setSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<Rota | null>(null);
  const [rotaToCancel, setRotaToCancel] = useState<Rota | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore(
    (s) => s.activeProfile() ?? s.user?.profiles[0] ?? null,
  );
  const rawTenant = activeProfile?.tenantId;
  const locadorId = rawTenant && rawTenant !== "self" ? rawTenant : user?.id;
  const [mapCenter, setMapCenter] = useState<[number, number]>([-15.7801, -47.9292]);
  const [geocodedPos, setGeocodedPos] = useState<Record<string, [number, number]>>({});
  const [focusedItem, setFocusedItem] = useState<{ pos: [number, number]; key: string } | null>(null);

  // Reset foco ao trocar de rota
  useEffect(() => {
    setFocusedItem(null);
  }, [selectedRoute?.id]);

  // Centro do mapa = endereço do locador logado
  useEffect(() => {
    if (!locadorId) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("logradouro, numero, bairro, cidade, estado")
        .eq("id", locadorId)
        .maybeSingle();
      if (!data) return;
      const q = [
        [data.logradouro, data.numero].filter(Boolean).join(", "),
        data.bairro,
        data.cidade,
        data.estado,
        "Brasil",
      ].filter(Boolean).join(", ");
      if (!q) return;
      const pos = await geocodeAddress(q);
      if (pos) setMapCenter(pos);
    })();
  }, [locadorId]);

  // Geocodifica pontos da rota selecionada
  useEffect(() => {
    if (!selectedRoute) return;
    selectedRoute.itinerario.forEach((p) => {
      if (geocodedPos[p.id]) return;
      (async () => {
        for (const q of p.enderecoQueries) {
          if (!q) continue;
          const pos = await geocodeAddress(q);
          if (pos) {
            setGeocodedPos((prev) => (prev[p.id] ? prev : { ...prev, [p.id]: pos }));
            return;
          }
        }
      })();
    });
  }, [selectedRoute, geocodedPos]);

  const routePositions = useMemo(() => {
    if (!selectedRoute) return [] as [number, number][];
    return selectedRoute.itinerario
      .map((p) => geocodedPos[p.id])
      .filter(Boolean) as [number, number][];
  }, [selectedRoute, geocodedPos]);

  const cancelMutation = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      const { error } = await supabase
        .from("rotas")
        .update({ status: "cancelada", motivo_cancelamento: motivo })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rota cancelada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["rotas-agendadas"] });
      setRotaToCancel(null);
      setMotivoCancelamento("");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao cancelar rota"),
  });

  const statusBadge = (status: string) => {
    if (status === "cancelada")
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">cancelada</Badge>;
    if (status === "em_andamento")
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">em andamento</Badge>;
    return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">{status}</Badge>;
  };

  const filtered = rotas
    .filter(
      (r) =>
        r.nome.toLowerCase().includes(search.toLowerCase()) ||
        r.motorista.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (a.dataProgramada ?? "9999-12-31").localeCompare(b.dataProgramada ?? "9999-12-31"));
  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Rotas Agendadas" 
        subtitle="Listagem de rotas futuras e aguardando início"
      />

      <DataTable
      loading={isLoading}
        title="Próximas Rotas"
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Rota",
            accessor: (r) => (
              <div className="flex flex-col">
                <span className="font-bold text-sm">{r.nome}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">{r.id}</span>
              </div>
            )
          },
          {
            header: "Motorista / Veículo",
            accessor: (r) => (
              <div className="flex flex-col">
                <span className="text-sm">{r.motorista}</span>
                <span className="text-xs text-muted-foreground">{r.veiculo}</span>
              </div>
            )
          },
          {
            header: "Data",
            accessor: (r) => (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {r.data}
              </div>
            )
          },
          {
            header: "Status",
            accessor: (r) => statusBadge(r.status),
          },
          {
            header: "Ações",
            accessor: (r) => (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 h-8 text-xs font-semibold"
                  onClick={() => setSelectedRoute(r)}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  Ver Roteiro
                </Button>
                {r.status !== "cancelada" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 h-8 text-xs font-semibold text-red-600 hover:text-red-700 hover:border-red-200"
                    onClick={() => setRotaToCancel(r)}
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Cancelar
                  </Button>
                )}
              </div>
            )
          }
        ]}
        renderMobileCard={(r) => (
          <div className="p-4 bg-card border rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-sm">{r.nome}</h4>
                <p className="text-[10px] text-muted-foreground uppercase">{r.id}</p>
              </div>
              {statusBadge(r.status)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground">Motorista</p>
                <p className="font-medium">{r.motorista}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">{r.data}</p>
              </div>
            </div>
            <div className="pt-2 border-t flex justify-between items-center gap-2">
              <span className="text-xs font-bold text-primary">{r.pontos} locais agendados</span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs gap-2"
                  onClick={() => setSelectedRoute(r)}
                >
                  <MapIcon className="h-3.5 w-3.5" /> Roteiro
                </Button>
                {r.status !== "cancelada" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs gap-2 text-red-600 hover:text-red-700"
                    onClick={() => setRotaToCancel(r)}
                  >
                    <Ban className="h-3.5 w-3.5" /> Cancelar
                  </Button>
                )}
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

      <Dialog open={!!selectedRoute} onOpenChange={(open) => !open && setSelectedRoute(null)}>
        <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden flex flex-col h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Roteiro da Rota: {selectedRoute?.nome}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Itinerary List */}
            <div className="w-full md:w-80 border-r overflow-y-auto p-4 space-y-4 bg-muted/20">
              <p className="text-xs text-muted-foreground">
                {selectedRoute?.data} • {selectedRoute?.motorista} • {selectedRoute?.veiculo}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-primary/10 text-primary border-0 font-bold">{selectedRoute?.itinerario.length} Pontos</Badge>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sequência da Rota</span>
              </div>
              
              <div className="space-y-4">
                {selectedRoute?.itinerario.map((item, idx) => (
                  <div key={item.id} className="relative pl-8 pb-4 last:pb-0">
                    {idx < selectedRoute!.itinerario.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-primary/20" />
                    )}
                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                      {idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const pos = geocodedPos[item.id];
                        if (pos) setFocusedItem({ pos, key: `${item.id}-${Date.now()}` });
                      }}
                      disabled={!geocodedPos[item.id]}
                      className={`w-full text-left bg-white p-3 rounded-lg border shadow-sm transition-colors ${
                        focusedItem && geocodedPos[item.id] && focusedItem.pos === geocodedPos[item.id]
                          ? "border-primary ring-2 ring-primary/30"
                          : "hover:border-primary"
                      } ${!geocodedPos[item.id] ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-xs truncate">{item.cliente}</h4>
                        <Badge variant="outline" className={`text-[9px] px-1 h-4 ${item.tipo === "Entrega" ? "text-blue-500 border-blue-200" : "text-orange-500 border-orange-200"}`}>
                          {item.tipo}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-start gap-1">
                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{item.endereco}</span>
                      </p>
                    </button>
                  </div>
                ))}
              </div>

              <Card className="mt-6 bg-primary text-primary-foreground">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium opacity-80">Estimativas</span>
                    <Info className="h-3.5 w-3.5 opacity-60" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <p className="text-[10px] opacity-70">Distância</p>
                      <p className="text-sm font-bold">18.5 km</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                      <p className="text-[10px] opacity-70">Duração</p>
                      <p className="text-sm font-bold">2h 15m</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <div className="flex-1 relative min-h-[300px]">
              {selectedRoute && (
                <MapContainer 
                  center={mapCenter}
                  zoom={12}
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapAutoFit center={mapCenter} positions={routePositions} />
                  <MapFlyTo target={focusedItem} />
                  {selectedRoute.itinerario.map((item, idx) => {
                    const pos = geocodedPos[item.id];
                    if (!pos) return null;
                    return (
                      <Marker
                        key={item.id}
                        position={pos}
                        icon={createSequenceIcon(idx + 1)}
                      >
                        <Popup>
                          <div className="p-1">
                            <p className="font-bold text-sm">{item.cliente}</p>
                            <p className="text-xs text-muted-foreground">{item.endereco}</p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                  {routePositions.length > 1 && (
                    <Polyline
                      positions={routePositions}
                      color="#3b82f6"
                      weight={4}
                      opacity={0.6}
                      dashArray="10, 10"
                    />
                  )}
                </MapContainer>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!rotaToCancel} onOpenChange={(o) => { if (!o) { setRotaToCancel(null); setMotivoCancelamento(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar rota?</AlertDialogTitle>
            <AlertDialogDescription>
              A rota <strong>{rotaToCancel?.nome}</strong> será marcada como cancelada.
              Ela permanecerá no histórico, mas não estará ativa. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="motivo-cancelamento">Motivo do cancelamento *</Label>
            <Textarea
              id="motivo-cancelamento"
              placeholder="Informe o motivo do cancelamento..."
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelMutation.isPending || !motivoCancelamento.trim()}
              onClick={(e) => {
                e.preventDefault();
                if (rotaToCancel && motivoCancelamento.trim())
                  cancelMutation.mutate({ id: rotaToCancel.id, motivo: motivoCancelamento.trim() });
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelMutation.isPending ? "Cancelando..." : "Sim, cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RotasAgendadas;
