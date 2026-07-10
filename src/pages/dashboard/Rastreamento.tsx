import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, User, Power, Truck, Search, MapPin, Navigation, ShieldCheck, Box, Info, Check } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Função para criar o ícone personalizado com a imagem do motorista/fiscal
const createAvatarIcon = (status: "online" | "offline" | "active", nome: string, type: "driver" | "fiscal") => {
  const color = status === "online" || status === "active" ? (type === "driver" ? "#10b981" : "#3b82f6") : "#94a3b8";
  const initials = nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  return L.divIcon({
    className: 'custom-avatar-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid ${color};
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      ">
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${color}20;
          color: ${color};
          font-weight: bold;
          font-size: 14px;
        ">
          ${initials}
        </div>
        <div style="
          position: absolute;
          bottom: 0;
          right: 0;
          width: 12px;
          height: 12px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const createBoxIcon = () => {
  return L.divIcon({
    className: 'custom-box-marker',
    html: `
      <div style="
        background: #f59e0b;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

interface RoutePoint {
  id: string;
  tipo: "entrega" | "retirada" | string;
  endereco: string;
  posicao: [number, number] | null;
  enderecoQueries: string[];
  status: "pendente" | "concluido";
  equipamento: string;
  cliente?: string;
}

interface Driver {
  id: string;
  nome: string;
  status: "online" | "offline";
  entregaAtual: string | null;
  posicao: [number, number];
  veiculo: string;
  roteiro?: RoutePoint[];
}

interface Fiscal {
  id: string;
  nome: string;
  status: "online" | "offline";
  posicao: [number, number];
  setor: string;
  ultimaOcorrencia?: string;
}

interface LocacaoPoint {
  id: string;
  locatario: string;
  locador: string;
  endereco: string;
  posicao: [number, number];
  cacamba: string;
  dataInicio: string;
  status: "ativo" | "pendente_retirada";
}

// Geocoder simples (Nominatim) com cache em memória
const geocodeCache = new Map<string, [number, number] | null>();
async function geocodeAddress(q: string): Promise<[number, number] | null> {
  const key = q.trim().toLowerCase();
  if (!key) return null;
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      { headers: { "Accept-Language": "pt-BR" } }
    );
    const j = await r.json();
    if (Array.isArray(j) && j.length) {
      const pos: [number, number] = [parseFloat(j[0].lat), parseFloat(j[0].lon)];
      geocodeCache.set(key, pos);
      return pos;
    }
  } catch {}
  geocodeCache.set(key, null);
  return null;
}

const _mockDriversUnused: Driver[] = [
  { 
    id: "1", 
    nome: "João Silva", 
    status: "online", 
    entregaAtual: "Rota de 3 pontos", 
    posicao: [-15.7801, -47.9292], 
    veiculo: "Mercedes-Benz Axor",
    roteiro: []
  },
  { id: "2", nome: "Ricardo Santos", status: "online", entregaAtual: "Pedido #1025", posicao: [-20.8200, -49.3800], veiculo: "VW Constellation" },
  { id: "3", nome: "Marcos Oliveira", status: "offline", entregaAtual: null, posicao: [-20.8150, -49.3900], veiculo: "Scania R450" },
  { id: "4", nome: "Felipe Costa", status: "online", entregaAtual: "Pedido #1028", posicao: [-20.8050, -49.3700], veiculo: "Volvo FH 540" },
];

const mockFiscais: Fiscal[] = [];
const mockLocacaoPoints: LocacaoPoint[] = [];

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);
  return null;
};

const Rastreamento = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedFiscal, setSelectedFiscal] = useState<Fiscal | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<LocacaoPoint | null>(null);
  const [routeGeo, setRouteGeo] = useState<Record<string, [number, number]>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const activeProfileType = useAuthStore((state) => state.activeProfileType());
  const isPrefeitura = activeProfileType === "prefeitura";

  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore(
    (s) => s.activeProfile() ?? s.user?.profiles[0] ?? null
  );
  const rawTenant = activeProfile?.tenantId;
  const locadorId = rawTenant && rawTenant !== "self" ? rawTenant : user?.id;

  const { data: drivers = [] } = useQuery({
    queryKey: ["rastreamento-motoristas", locadorId],
    enabled: !!locadorId && !isPrefeitura,
    queryFn: async (): Promise<Driver[]> => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "motorista")
        .eq("ativo", true)
        .eq("locador_id", locadorId!);
      if (error) throw error;
      const ids = (roles ?? []).map((r: any) => r.user_id);
      if (!ids.length) return [];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, nome")
        .in("id", ids);
      const { data: rotasAtivas } = await supabase
        .from("rotas")
        .select(
          `motorista_id, id,
           veiculo:veiculo_id(placa, marca, modelo),
           rota_itens (
             id, sequencia, tipo,
             ordem_locacao_unidades (
               id, status,
               ordens_locacao (
                 obras ( rua, numero, bairro, cidade, estado ),
                 pedido_fornecedores ( pedidos ( locatario_id ) )
               )
             )
           )`
        )
        .in("motorista_id", ids)
        .eq("status", "em_andamento");
      const rotaByMotorista = new Map<string, any>();
      (rotasAtivas ?? []).forEach((r: any) => {
        if (r.motorista_id) rotaByMotorista.set(r.motorista_id, r);
      });
      // Buscar nomes dos locatários dos itens da rota
      const locIds = Array.from(new Set((rotasAtivas ?? []).flatMap((r: any) =>
        (r.rota_itens ?? []).map((it: any) =>
          it.ordem_locacao_unidades?.ordens_locacao?.pedido_fornecedores?.pedidos?.locatario_id
        ).filter(Boolean)
      )));
      const locNomes = new Map<string, string>();
      if (locIds.length) {
        const { data: locProfs } = await supabase.from("profiles").select("id, nome").in("id", locIds);
        (locProfs ?? []).forEach((p: any) => locNomes.set(p.id, p.nome));
      }
      return (profs ?? []).map((p: any, idx: number): Driver => {
        // dispersão determinística em torno do centro
        let h = 0;
        for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) | 0;
        const lat = -15.7801 + (((h % 1000) / 1000) * 0.04 - 0.02);
        const lng = -47.9292 + ((((h >> 10) % 1000) / 1000) * 0.04 - 0.02);
        const rotaAtiva = rotaByMotorista.get(p.id);
        const itens = [...(rotaAtiva?.rota_itens ?? [])].sort(
          (a: any, b: any) => (a.sequencia ?? 0) - (b.sequencia ?? 0)
        );
        const paradas = itens.length;
        const veic = rotaAtiva?.veiculo;
        const veicLabel = veic
          ? [veic.marca, veic.modelo, veic.placa ? `(${veic.placa})` : null]
              .filter(Boolean)
              .join(" ")
          : "—";
        const roteiro: RoutePoint[] = itens.map((it: any): RoutePoint => {
          const ol = it.ordem_locacao_unidades?.ordens_locacao ?? {};
          const obra = ol.obras ?? {};
          const locId = ol.pedido_fornecedores?.pedidos?.locatario_id;
          const oluStatus = it.ordem_locacao_unidades?.status ?? "";
          const tipoItem = it.tipo === "retirada" ? "retirada" : "entrega";
          const concluido =
            tipoItem === "entrega"
              ? ["locada", "aguardando_retirada", "em_transito_retirada", "em_transito_analise", "aguardando_analise", "finalizada"].includes(oluStatus)
              : ["em_transito_analise", "aguardando_analise", "finalizada"].includes(oluStatus);
          const endereco = [
            [obra.rua, obra.numero].filter(Boolean).join(", "),
            obra.bairro,
            [obra.cidade, obra.estado].filter(Boolean).join("/"),
          ].filter(Boolean).join(" - ");
          const fullQuery = [
            [obra.rua, obra.numero].filter(Boolean).join(", "),
            obra.bairro, obra.cidade, obra.estado, "Brasil",
          ].filter(Boolean).join(", ");
          const enderecoQueries = [
            fullQuery,
            [obra.bairro, obra.cidade, obra.estado, "Brasil"].filter(Boolean).join(", "),
            [obra.cidade, obra.estado, "Brasil"].filter(Boolean).join(", "),
          ].filter((v, i, a) => v && a.indexOf(v) === i);
          return {
            id: it.id,
            tipo: tipoItem,
            endereco: endereco || "—",
            posicao: null,
            enderecoQueries,
            status: concluido ? "concluido" : "pendente",
            equipamento: "",
            cliente: (locId && locNomes.get(locId)) || "Cliente",
          };
        });
        return {
          id: p.id,
          nome: p.nome ?? "Motorista",
          status: rotaAtiva ? "online" : "online",
          entregaAtual: rotaAtiva
            ? `Rota em andamento • ${paradas} ${paradas === 1 ? "parada" : "paradas"}`
            : null,
          posicao: [lat, lng],
          veiculo: veicLabel,
          roteiro,
        };
      });
    },
  });
  const mockDrivers = drivers;

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapperRef.current.requestFullscreen();
  };

  const center: [number, number] = [-15.7801, -47.9292];

  const handleDriverClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setSelectedFiscal(null);
    setSelectedPoint(null);
    if (mapInstance && (!driver.roteiro || driver.roteiro.length === 0)) {
      mapInstance.setView(driver.posicao, 16, { animate: true, duration: 1 });
    }
  };

  const handleFiscalClick = (fiscal: Fiscal) => {
    setSelectedFiscal(fiscal);
    setSelectedDriver(null);
    setSelectedPoint(null);
    if (mapInstance) {
      mapInstance.setView(fiscal.posicao, 16, { animate: true, duration: 1 });
    }
  };

  const handlePointClick = (point: LocacaoPoint) => {
    setSelectedPoint(point);
    setSelectedDriver(null);
    setSelectedFiscal(null);
    if (mapInstance) {
      mapInstance.setView(point.posicao, 17, { animate: true, duration: 1 });
    }
  };

  // Geocodifica pontos do roteiro do motorista selecionado
  useEffect(() => {
    if (!selectedDriver?.roteiro?.length) return;
    let cancelled = false;
    (async () => {
      for (const p of selectedDriver.roteiro!) {
        if (routeGeo[p.id]) continue;
        for (const q of p.enderecoQueries) {
          const pos = await geocodeAddress(q);
          if (cancelled) return;
          if (pos) {
            setRouteGeo((prev) => (prev[p.id] ? prev : { ...prev, [p.id]: pos }));
            break;
          }
        }
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDriver?.id]);

  // Ajusta o mapa para caber o roteiro
  useEffect(() => {
    if (!mapInstance || !selectedDriver?.roteiro?.length) return;
    const pts = selectedDriver.roteiro
      .map((p) => routeGeo[p.id])
      .filter(Boolean) as [number, number][];
    const all = [selectedDriver.posicao, ...pts];
    if (all.length === 1) {
      mapInstance.setView(all[0], 15, { animate: true });
    } else if (all.length > 1) {
      mapInstance.fitBounds(L.latLngBounds(all.map((p) => L.latLng(p[0], p[1]))), {
        padding: [60, 60], maxZoom: 15, animate: true,
      });
    }
  }, [mapInstance, selectedDriver, routeGeo]);

  const filteredDrivers = mockDrivers.filter(d => 
    d.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.veiculo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiscais = mockFiscais.filter(f => 
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.setor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPoints = mockLocacaoPoints.filter(p => 
    p.endereco.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.locatario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-57px)] -m-4 sm:-m-6 flex-col sm:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full sm:w-80 h-1/2 sm:h-auto bg-background border-r border-border flex flex-col z-10 min-h-0">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Rastreamento
            </h2>
            <Badge variant="outline" className="text-[10px] uppercase font-bold">
              {isPrefeitura 
                ? `${mockFiscais.filter(f => f.status === "online").length} Online`
                : `${mockDrivers.filter(d => d.status === "online").length} Online`
              }
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={isPrefeitura ? "Buscar fiscal ou endereço..." : "Buscar motorista..."}
              className="pl-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isPrefeitura ? (
          <Tabs defaultValue="fiscais" className="flex-1 flex flex-col min-h-0">
            <div className="px-4">
              <TabsList className="w-full">
                <TabsTrigger value="fiscais" className="flex-1 gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Fiscais
                </TabsTrigger>
                <TabsTrigger value="pontos" className="flex-1 gap-2">
                  <Box className="h-4 w-4" />
                  Pontos
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator className="mt-2" />
            <TabsContent value="fiscais" className="flex-1 mt-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {filteredFiscais.map(fiscal => (
                    <div 
                      key={fiscal.id}
                      onClick={() => handleFiscalClick(fiscal)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedFiscal?.id === fiscal.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${fiscal.status === "online" ? "bg-blue-500" : "bg-zinc-400"}`} />
                          <span className="font-semibold text-sm">{fiscal.nome}</span>
                        </div>
                        <Badge variant="secondary" className={`text-[10px] ${fiscal.status === "online" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-zinc-50 text-zinc-500"}`}>
                          {fiscal.status === "online" ? "On" : "Off"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3 w-3" />
                        Setor: {fiscal.setor}
                      </div>
                      {fiscal.ultimaOcorrencia && (
                        <div className="text-[10px] mt-2 bg-muted p-1.5 rounded flex gap-2">
                          <Info className="h-3 w-3 text-blue-500 shrink-0" />
                          <span className="line-clamp-1">{fiscal.ultimaOcorrencia}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="pontos" className="flex-1 mt-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {filteredPoints.map(point => (
                    <div 
                      key={point.id}
                      onClick={() => handlePointClick(point)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPoint?.id === point.id ? 'border-amber-500 bg-amber-50/50' : 'border-transparent hover:border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm line-clamp-1">{point.locatario}</span>
                        <Badge variant={point.status === 'ativo' ? 'outline' : 'secondary'} className="text-[10px] uppercase font-bold">
                          {point.status === 'ativo' ? 'Locada' : 'Retirar'}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground space-y-1">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {point.endereco}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Box className="h-3 w-3" />
                          {point.cacamba}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <Separator />
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredDrivers.map(driver => (
                  <div 
                    key={driver.id}
                    onClick={() => handleDriverClick(driver)}
                    className="p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${driver.status === "online" ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        <span className="font-semibold text-sm">{driver.nome}</span>
                      </div>
                      {driver.status === "online" ? (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px]">On</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-zinc-50 text-zinc-500 border-zinc-100 text-[10px]">Off</Badge>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Truck className="h-3 w-3" />
                        <span>{driver.veiculo}</span>
                      </div>
                      {driver.entregaAtual ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 p-1.5 rounded border border-primary/10">
                            <Box className="h-3 w-3" />
                            <span>{driver.entregaAtual}</span>
                          </div>
                          
                          {selectedDriver?.id === driver.id && driver.roteiro && (
                            <div className="pl-2 border-l-2 border-primary/20 space-y-2 mt-2">
                              {driver.roteiro.map((p, idx) => (
                                <div 
                                  key={p.id} 
                                  className={`text-[10px] relative hover:bg-primary/5 p-1 rounded transition-colors ${p.status === 'concluido' ? 'opacity-60' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const pos = routeGeo[p.id];
                                    if (mapInstance && pos) mapInstance.flyTo(pos, 17, { duration: 0.8 });
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white ${p.status === 'concluido' ? 'bg-emerald-500' : p.tipo === 'entrega' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                                      {p.status === 'concluido' ? <Check className="h-2.5 w-2.5" /> : idx + 1}
                                    </span>
                                    <span className={`font-semibold uppercase ${p.status === 'concluido' ? 'line-through' : ''}`}>{p.tipo}</span>
                                    {p.status === 'concluido' && (
                                      <span className="text-[9px] font-semibold text-emerald-600">Concluído</span>
                                    )}
                                    {!routeGeo[p.id] && (
                                      <span className="text-[9px] text-muted-foreground italic">localizando…</span>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground ml-6 break-words">{p.endereco}</p>
                                  {p.cliente && (
                                    <p className="text-primary/70 ml-6 text-[9px]">{p.cliente}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px] text-muted-foreground italic px-1.5">Sem entregas ativas</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>

      {/* Mapa */}
      <div className="flex-1 relative bg-muted min-h-0" ref={wrapperRef}>
        <MapContainer 
          center={center} 
          zoom={14} 
          ref={setMapInstance}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <MapResizer />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Renderização para Locador (Motoristas) */}
          {!isPrefeitura && (
            <>
              {selectedDriver?.roteiro && (
                <>
                  {(() => {
                    const pts = [
                      selectedDriver.posicao,
                      ...selectedDriver.roteiro
                        .map((p) => routeGeo[p.id])
                        .filter(Boolean) as [number, number][],
                    ];
                    return pts.length > 1 ? (
                      <Polyline
                        positions={pts}
                        color="#3b82f6"
                        dashArray="5, 10"
                        weight={3}
                        opacity={0.6}
                      />
                    ) : null;
                  })()}
                  {selectedDriver.roteiro.map((p, idx) => {
                    const pos = routeGeo[p.id];
                    if (!pos) return null;
                    return (
                    <Marker 
                      key={p.id} 
                      position={pos}
                      icon={L.divIcon({
                        className: 'custom-route-marker',
                        html: `<div style="background: ${p.tipo === 'entrega' ? '#3b82f6' : '#f97316'}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${idx + 1}</div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                      })}
                    >
                      <Popup>
                        <div className="p-1">
                          <p className="font-bold text-xs uppercase text-primary mb-1">{p.tipo}{p.cliente ? `: ${p.cliente}` : ""}</p>
                          <p className="text-[10px]">{p.endereco}</p>
                        </div>
                      </Popup>
                    </Marker>
                    );
                  })}
                </>
              )}
              {mockDrivers.map(driver => (
                <Marker 
                  key={driver.id} 
                  position={driver.posicao} 
                  icon={createAvatarIcon(driver.status, driver.nome, "driver")}
                  eventHandlers={{ click: () => handleDriverClick(driver) }}
                >
                  <Popup>
                    <div className="p-1 min-w-[150px]">
                      <p className="font-bold text-sm mb-1">{driver.nome}</p>
                      <p className="text-xs mb-1 flex items-center gap-1.5"><Truck className="h-3 w-3" /> {driver.veiculo}</p>
                      {driver.entregaAtual && (
                        <p className="text-xs text-primary font-semibold flex items-center gap-1.5">
                          <Box className="h-3 w-3" /> {driver.entregaAtual}
                        </p>
                      )}
                      <p className="text-[10px] mt-2 text-muted-foreground uppercase pt-2 border-t">
                        Status: {driver.status}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </>
          )}

          {/* Renderização para Prefeitura (Fiscais e Pontos) */}
          {isPrefeitura && (
            <>
              {mockFiscais.map(fiscal => (
                <Marker 
                  key={fiscal.id} 
                  position={fiscal.posicao} 
                  icon={createAvatarIcon(fiscal.status, fiscal.nome, "fiscal")}
                  eventHandlers={{ click: () => handleFiscalClick(fiscal) }}
                >
                  <Popup>
                    <div className="p-1 min-w-[150px]">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                        <p className="font-bold text-sm">Fiscal: {fiscal.nome}</p>
                      </div>
                      <p className="text-xs mb-1"><strong>Setor:</strong> {fiscal.setor}</p>
                      {fiscal.ultimaOcorrencia && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-[10px]">
                          <strong>Última Atividade:</strong><br/>
                          {fiscal.ultimaOcorrencia}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
              {mockLocacaoPoints.map(point => (
                <Marker 
                  key={point.id} 
                  position={point.posicao} 
                  icon={createBoxIcon()}
                  eventHandlers={{ click: () => handlePointClick(point) }}
                >
                  <Popup>
                    <div className="p-1 min-w-[180px]">
                      <p className="font-bold text-sm mb-2 border-b pb-1">{point.locatario}</p>
                      <div className="space-y-1.5 text-[11px]">
                        <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {point.endereco}</p>
                        <p className="flex items-center gap-1.5"><Box className="h-3.5 w-3.5 text-muted-foreground" /> {point.cacamba}</p>
                        <p className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground" /> Locador: {point.locador}</p>
                        <p className="flex items-center gap-1.5 font-semibold text-primary"><Navigation className="h-3.5 w-3.5" /> Início: {point.dataInicio}</p>
                      </div>
                      <Badge className={`mt-2 w-full justify-center ${point.status === 'ativo' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
                        {point.status === 'ativo' ? 'EM LOCAÇÃO' : 'AGUARDANDO RETIRADA'}
                      </Badge>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </>
          )}
        </MapContainer>

        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Sair de tela cheia" : "Tela cheia"}
          className="absolute top-[10px] right-[10px] z-[1000] h-[34px] w-[34px] flex items-center justify-center bg-white hover:bg-muted text-foreground border border-border rounded-md shadow-md transition-colors"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg flex gap-4 text-xs font-medium">
          {isPrefeitura ? (
            <>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Fiscal Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span>Caçamba Locada</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Em Entrega</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-zinc-400" />
                <span>Offline</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rastreamento;