import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Filter, Hand, Camera, MapPin, Map as MapIcon, CalendarCheck, Maximize2, Minimize2, FileText, Plus, X, FileCheck2, QrCode, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import myboxLogo from "@/assets/mybox-logo.png";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


type Ordem = {
  id: string;
  dataPedido?: string;
  dataLocacao?: string;
  dataRetirada?: string;
  cliente: string;
  endereco: string;
  pedidoNum: number;
  codigo: string;
  modelo: string;
  distancia?: string;
  tempoRestante?: string;
  locacao?: { motorista: string; veiculo: string; data?: string };
  retirada?: { motorista?: string; veiculo?: string; data?: string; status?: string };
  entrega?: { motorista?: string; veiculo?: string; data?: string; status?: string };
  statusLabel: string;
  statusVariant: "warning" | "info" | "danger" | "purple";
};

const mk = (over: Partial<Ordem>): Ordem => ({
  id: crypto.randomUUID(),
  cliente: "Julia Rebeca Daiane Bernarde",
  endereco: "Rua Mirassol, 216 - Vila Redentora - São José do Rio Preto / SP",
  pedidoNum: 19,
  codigo: "AR77M6TVDL1F1NZ3",
  modelo: "Modelo Estacionária C4",
  distancia: "0,00 km",
  statusLabel: "Aguardando",
  statusVariant: "warning",
  ...over,
});

const pendentes: Ordem[] = [
  mk({ dataPedido: "26/11/2025 - 12:22", cliente: "Thiago Samuel da Luz", endereco: "Rua Adelina Moreti, 757 - Parque Residencial Dom Lafaiete Líbano - São José do Rio Preto / SP", pedidoNum: 19, statusLabel: "Não Selecionada", retirada: { data: "Agendado para 26/11/2025", motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" } }),
  mk({ dataPedido: "19/05/2026 - 21:47", pedidoNum: 78, codigo: "U4ECBITUO52ASP72", modelo: "Modelo Roll-on/Roll-off até 10m³", statusLabel: "Não Selecionada", retirada: { status: "Aguardando agendamento" } }),
  mk({ dataPedido: "11/12/2025 - 10:49", cliente: "Kamilly Maitê Rodrigues", endereco: "Rua Mário Alves da Silva, 245 - Residencial Colorado - São José do Rio Preto / SP", pedidoNum: 83, codigo: "TWF0KBMV80AMFK4S", modelo: "Modelo Estacionária C4", statusLabel: "Não Selecionada", retirada: { status: "Aguardando agendamento" } }),
];

const transito: Ordem[] = [
  mk({ dataPedido: "26/11/2025 - 12:20", cliente: "Juan Ricardo Gustavo Silva", endereco: "Rua Vera, 111 - Jardim Soraia - São José do Rio Preto / SP", pedidoNum: 13, codigo: "TWF0KBMV80AMFK4S", modelo: "Modelo Estacionária C4", statusLabel: "Em trânsito para locação", statusVariant: "purple", retirada: { data: "Agendado para 26/11/2025", motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" } }),
  mk({ dataPedido: "11/12/2025 - 10:32", pedidoNum: 34, codigo: "TWF0KBMV80AMFK4S", modelo: "Modelo Estacionária C4", statusLabel: "Em trânsito para locação", statusVariant: "purple", retirada: { data: "Agendado para 11/12/2025", motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" } }),
  mk({ dataPedido: "11/12/2025 - 10:43", cliente: "Leandro André Aparício", endereco: "Avenida João Neves, 538 - Fazenda Palmeira (Zona Rural) - São José do Rio Preto / SP", pedidoNum: 62, statusLabel: "Em trânsito para locação", statusVariant: "purple", retirada: { data: "Agendado para 11/12/2025", motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" } }),
];

const locadas: Ordem[] = [
  mk({ dataLocacao: "26/11/2025", cliente: "Otávio Samuel César da Mata", endereco: "Rua Darcênio Raimundo, 966 - Solo Sagrado - São José do Rio Preto / SP", pedidoNum: 29, codigo: "8WYX7XO2MTN3MVJ6", modelo: "Modelo Estacionária C4", tempoRestante: "174 dia(s) de locação", statusLabel: "Aguardando retirada", statusVariant: "danger", locacao: { motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" }, retirada: { status: "Aguardando retirada" } }),
  mk({ dataLocacao: "11/12/2025", cliente: "Yago Oliver Tiago Gomes", endereco: "Rua Pedro Correa da Cunha, 748 - Residencial Gaivota II - São José do Rio Preto / SP", pedidoNum: 44, codigo: "TO7IH15N80YUC0HL", modelo: "Modelo Estacionária C4", tempoRestante: "159 dia(s) de locação", statusLabel: "Aguardando retirada", statusVariant: "danger", locacao: { motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" }, retirada: { status: "Aguardando retirada" } }),
  mk({ dataLocacao: "11/12/2025", cliente: "Gabriel Cláudio Diogo da Paz", endereco: "Rua Projetada 5, 436 - Villa Cassini - São José do Rio Preto / SP", pedidoNum: 67, codigo: "TO7IH15N80YUC0HL", modelo: "Modelo Estacionária C4", tempoRestante: "159 dia(s) de locação", statusLabel: "Aguardando retirada", statusVariant: "danger", locacao: { motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" }, retirada: { status: "Aguardando retirada" } }),
  mk({ dataLocacao: "11/12/2025", pedidoNum: 79, tempoRestante: "159 dia(s) de locação", statusLabel: "Em trânsito para retirada", statusVariant: "purple", locacao: { motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" }, retirada: { data: "Agendado para 11/12/2025", motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" } }),
];

const analise: Ordem[] = [
  mk({ dataRetirada: "26/11/2025", cliente: "MTR: nº 4", endereco: "Rua Apóstolo Marcheto, 837 - Loteamento Recanto do Lago - São José do Rio Preto / SP", pedidoNum: 4, codigo: "TO7IH15N80YUC0HL", modelo: "Modelo Estacionária C4", statusLabel: "Em trânsito para destino final", statusVariant: "danger", locacao: { motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" }, retirada: { motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" } }),
  mk({ dataRetirada: "11/12/2025", cliente: "MTR: nº 12", endereco: "Rua Apóstolo Marcheto, 837 - Loteamento Recanto do Lago - São José do Rio Preto / SP", pedidoNum: 12, statusLabel: "Em análise", statusVariant: "danger", locacao: { motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" }, retirada: { motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" } }),
];

const cdf: Ordem[] = [
  mk({ dataLocacao: "11/12/2025", cliente: "Carlos Edson Mateus Sales", endereco: "Rua Valter Longui, 218 - Parque Residencial Cambuí - São José do Rio Preto / SP", pedidoNum: 35, codigo: "8WYX7XO2MTN3MVJ6", modelo: "Modelo Estacionária C4", statusLabel: "CDF Emitido", statusVariant: "danger", locacao: { motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" }, retirada: { status: "Aguardando retirada" } }),
  mk({ dataLocacao: "11/12/2025", cliente: "Thomas Vinicius da Conceição", endereco: "Rua Gelson Antônio Rasteli, 694 - Residencial Bom Sucesso - São José do Rio Preto / SP", pedidoNum: 48, codigo: "TWF0KBMV80AMFK4S", modelo: "Modelo Estacionária C4", statusLabel: "CDF Emitido", statusVariant: "danger", locacao: { motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" }, retirada: { status: "Aguardando retirada" } }),
  mk({ dataLocacao: "11/12/2025", cliente: "Emilly Nina Sabrina das Neves", endereco: "Rua Natalino Bonelli, 668 - Residencial Mirante - São José do Rio Preto / SP", pedidoNum: 53, codigo: "TWF0KBMV80AMFK4S", modelo: "Modelo Estacionária C4", statusLabel: "CDF Emitido", statusVariant: "danger", locacao: { motorista: "Evelyn Julia Emanuelly Monteiro", veiculo: "AAA7777 - Caminhão Basculante" }, retirada: { status: "Aguardando retirada" } }),
];

const StatusBadge = ({ ordem }: { ordem: Ordem }) => {
  const styles: Record<Ordem["statusVariant"], string> = {
    warning: "bg-amber-100 text-amber-700 border border-amber-200",
    info: "bg-sky-100 text-sky-700 border border-sky-200",
    danger: "bg-rose-100 text-rose-700 border border-rose-200",
    purple: "bg-purple-100 text-purple-700 border border-purple-200",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${styles[ordem.statusVariant]}`}>{ordem.statusLabel}</span>;
};

const DriverVehicleCell = ({ motorista, veiculo, data, status }: { motorista?: string; veiculo?: string; data?: string; status?: string }) => {
  const activeProfileType = useAuthStore((state) => state.activeProfileType());
  const isLocatario = activeProfileType === "locatario";

  if (status && !motorista) {
    if (isLocatario && status === "Não Selecionada") return null;
    return (
      <div className="inline-block rounded-md border border-border bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">{status}</div>
    );
  }
  return (
    <div className="space-y-1">
      {data && (
        <div className="rounded-md border border-border bg-background px-2 py-1 text-[10px] text-center text-foreground">{data}</div>
      )}
      {motorista && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1 text-[10px] text-emerald-700 text-center">{motorista}</div>
      )}
      {veiculo && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-2 py-1 text-[10px] text-rose-700 text-center">{veiculo}</div>
      )}
    </div>
  );
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(container);
    // also handle window resize
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
};

// Deterministic pseudo-random position around a center based on id
const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
};
const positionFor = (id: string, center: [number, number]): [number, number] => {
  const h = Math.abs(hashStr(id));
  const dLat = (((h % 1000) / 1000) - 0.5) * 0.06;
  const dLng = ((((h >> 10) % 1000) / 1000) - 0.5) * 0.06;
  return [center[0] + dLat, center[1] + dLng];
};

const MapBox = ({ className = "", data = [], tabLabel = "", mapRef }: { className?: string; data?: Ordem[]; tabLabel?: string; mapRef?: React.MutableRefObject<L.Map | null> }) => {
  const center: [number, number] = [-20.8113, -49.3758]; // São José do Rio Preto
  const wrapperRef = useRef<HTMLDivElement>(null);
  const internalMapRef = useRef<L.Map | null>(null);
  const activeMapRef = mapRef || internalMapRef;
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrapperRef.current.requestFullscreen();
    }
  };

  const positionsById = useMemo(() => {
    const map: Record<string, [number, number]> = {};
    data.forEach((o) => { map[o.id] = positionFor(o.id, center); });
    return map;
  }, [data]);

  const filteredOverlay = useMemo(
    () => data.filter(o => `${o.cliente} ${o.endereco} ${o.codigo}`.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );

  const focusOrdem = (o: Ordem) => {
    const pos = positionsById[o.id];
    if (!pos || !activeMapRef.current) return;
    activeMapRef.current.flyTo(pos, 15, { duration: 0.6 });
    const marker = markerRefs.current[o.id];
    if (marker) {
      setTimeout(() => marker.openPopup(), 350);
    }
  };

  return (
    <div 
      ref={wrapperRef}
      className={`relative isolate z-0 rounded-xl border border-border overflow-hidden shadow-inner bg-muted ${className} ${isFullscreen ? "rounded-none border-0 z-[9999]" : ""}`}
      style={{ height: isFullscreen ? '100vh' : '480px' }}
    >
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={!isFullscreen}
        ref={(instance) => { if (instance) activeMapRef.current = instance; }}
      >
        <MapResizer />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((o) => (
          <Marker
            key={o.id}
            position={positionsById[o.id]}
            ref={(ref) => { if (ref) markerRefs.current[o.id] = ref; }}
          >
            <Popup minWidth={260} maxWidth={300}>
              <div className="space-y-1.5 text-[11px]">
                <p className="text-[12px] font-bold text-rose-700 leading-snug mb-1">{o.endereco}</p>
                <div><span className="font-semibold">Situação:</span> <span className="text-muted-foreground">{o.statusLabel}</span></div>
                <div><span className="font-semibold">Locatário:</span> <span className="text-muted-foreground">{o.cliente}</span></div>
                {o.locacao?.motorista && (
                  <div><span className="font-semibold">Locador:</span> <span className="text-muted-foreground">{o.locacao.motorista}</span></div>
                )}
                <div><span className="font-semibold">Identificação:</span> <span className="text-muted-foreground">{o.codigo}</span></div>
                <div className="text-muted-foreground">{o.modelo}</div>
                <div><span className="font-semibold">Tipo de locação:</span> <span className="text-muted-foreground">Interno / dias</span></div>
                {o.dataLocacao && (
                  <div><span className="font-semibold">Data locação:</span> <span className="text-muted-foreground">{o.dataLocacao}</span></div>
                )}
                {o.dataPedido && (
                  <div><span className="font-semibold">Data pedido:</span> <span className="text-muted-foreground">{o.dataPedido}</span></div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {isFullscreen && <FullscreenZoomControl />}
      </MapContainer>

      {/* Fullscreen-only overlays */}
      {isFullscreen && (
        <>
          {/* Top-left user info */}
          <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-white rounded-full pl-1 pr-4 py-1 shadow-lg border border-border">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={myboxLogo} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">MB</AvatarFallback>
              </Avatar>
              <span className="absolute -top-1 -left-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                {data.length}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground leading-tight">Locador PJ</p>
              <p className="text-xs font-bold text-foreground leading-tight">MyBox Brasil</p>
            </div>
          </div>

          {/* Top-right search + list */}
          <div className="absolute top-4 right-4 z-[1000] w-[360px] max-h-[calc(100vh-32px)] flex flex-col gap-3">
            <div className="relative bg-white rounded-full shadow-lg border border-border">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="h-11 rounded-full border-0 pl-5 pr-12 focus-visible:ring-0 bg-transparent"
              />
              <button className="absolute right-1 top-1 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
                <Search className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-2 pr-1">
              {filteredOverlay.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => focusOrdem(o)}
                  className="w-full text-left bg-white rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer"
                >
                  <div className="bg-rose-50 border-l-4 border-rose-400 px-4 py-2.5">
                    <p className="text-xs font-bold text-rose-700 leading-snug">{o.endereco}</p>
                  </div>
                  <div className="px-4 py-2 text-[11px] text-foreground">
                    <span className="font-semibold">Situação:</span>{" "}
                    <span className="text-muted-foreground">{o.statusLabel}</span>
                  </div>
                </button>
              ))}
              {filteredOverlay.length === 0 && (
                <div className="bg-white/90 rounded-xl px-4 py-6 text-center text-xs text-muted-foreground shadow">
                  Nenhuma ordem encontrada
                </div>
              )}
            </div>
          </div>

          {/* Bottom-left logo (offset to the right of zoom + fullscreen controls) */}
          <div className="absolute bottom-4 left-20 z-[1000] bg-white rounded-xl shadow-lg border border-border px-3 py-2 flex items-center gap-2">
            <img src={myboxLogo} alt="MyBox" className="h-10 w-10 object-contain" />
            <span className="text-base font-black text-foreground tracking-tight">MyBox</span>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Sair de tela cheia" : "Tela cheia"}
        className={`absolute z-[1000] h-[30px] w-[30px] flex items-center justify-center bg-white hover:bg-muted text-foreground border-2 border-[rgba(0,0,0,0.2)] rounded-[4px] shadow-sm transition-colors ${
          isFullscreen ? "bottom-[88px] left-[10px]" : "top-[88px] left-[10px]"
        }`}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
};

const FullscreenZoomControl = () => {
  const map = useMap();
  useEffect(() => {
    const zoomControl = L.control.zoom({ position: "bottomleft" });
    zoomControl.addTo(map);
    return () => {
      zoomControl.remove();
    };
  }, [map]);
  return null;
};

type TabKey = "entregas" | "locadas" | "analise" | "cdf";

const allTabsConfig: { key: TabKey; label: string; data: Ordem[]; mode: "view" | "view-analise" | "view-cdf" }[] = [
  { key: "entregas", label: "Entregas", data: [...pendentes, ...transito], mode: "view" },
  { key: "locadas", label: "Locadas", data: locadas, mode: "view" },
  { key: "analise", label: "Em Análise", data: analise, mode: "view-analise" },
  { key: "cdf", label: "CDF Emitido", data: cdf, mode: "view-cdf" },
];

const AgendamentoModal = ({ tipo, selectedCount }: { tipo: "entrega" | "retirada"; selectedCount: number }) => {
  const activeProfileType = useAuthStore((state) => state.activeProfileType());
  if (activeProfileType === "locatario" || activeProfileType === "prefeitura") return null;
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={selectedCount === 0} 
          className="absolute bottom-6 right-6 z-40 gap-2 shadow-2xl h-14 px-8 rounded-full bg-primary hover:bg-primary/90 transition-all scale-100 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          <CalendarCheck className="h-6 w-6" />
          <span className="font-bold text-base">Agendar {tipo === "entrega" ? "Entrega" : "Retirada"}</span>
          <Badge variant="secondary" className="ml-1 bg-white text-primary hover:bg-white px-2 py-0.5 rounded-full text-xs font-black">
            {selectedCount}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Agendar {tipo}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure os detalhes para os {selectedCount} itens selecionados.
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="data" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Data {tipo}
            </Label>
            <Input id="data" type="date" className="h-10 border-muted-foreground/20 focus:border-primary" />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Motorista
              </Label>
              <Select>
                <SelectTrigger className="h-10 border-muted-foreground/20 focus:border-primary">
                  <SelectValue placeholder="Selecione o motorista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Evelyn Monteiro - 123.456.789-00</SelectItem>
                  <SelectItem value="2">João Silva - 987.654.321-11</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Veículo
              </Label>
              <Select>
                <SelectTrigger className="h-10 border-muted-foreground/20 focus:border-primary">
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">AAA7777 - Caminhão Basculante</SelectItem>
                  <SelectItem value="2">BBB8888 - Roll-on/Roll-off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {tipo === "retirada" && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Destino final
              </Label>
              <Select>
                <SelectTrigger className="h-10 border-muted-foreground/20 focus:border-primary">
                  <SelectValue placeholder="Selecione o destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Aterro Central - CNPJ: 11.222.333/0001-44</SelectItem>
                  <SelectItem value="2">Usina de Reciclagem - CNPJ: 55.666.777/0001-88</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="flex-1 h-11" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="flex-1 h-11 bg-primary hover:bg-primary/90" onClick={() => setOpen(false)}>Confirmar Agendamento</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PedirRetiradaModal = () => {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"qr" | "code" | null>(null);
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleConfirmar = async () => {
    const code = codigo.trim();
    if (!code) {
      toast.error("Informe o código da caçamba");
      return;
    }
    setLoading(true);
    const { error } = await supabase.rpc("solicitar_retirada_por_codigo", { _codigo: code });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Não foi possível solicitar a retirada");
      return;
    }
    toast.success("Retirada solicitada com sucesso");
    setOpen(false);
    setMethod(null);
    setCodigo("");
    queryClient.invalidateQueries();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setMethod(null);
          setCodigo("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button 
          className="absolute bottom-6 right-6 z-40 gap-2 shadow-2xl h-14 px-8 rounded-full bg-primary hover:bg-primary/90 transition-all scale-100 hover:scale-105 active:scale-95"
        >
          <Hand className="h-6 w-6" />
          <span className="font-bold text-base">Pedir Retirada</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hand className="h-5 w-5 text-primary" />
            Solicitar Retirada
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code da caçamba ou digite o código de identificação.
          </p>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {!method ? (
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-32 flex flex-col gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => setMethod("qr")}
              >
                <QrCode className="h-10 w-10 text-primary" />
                <span className="font-semibold">Escanear QR Code</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-32 flex flex-col gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => setMethod("code")}
              >
                <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-full font-mono font-bold text-primary">
                  123
                </div>
                <span className="font-semibold">Digitar Código</span>
              </Button>
            </div>
          ) : method === "qr" ? (
            <div className="space-y-4">
              <div className="aspect-square bg-black/5 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/20 animate-pulse" />
                <QrCode className="h-20 w-20 text-muted-foreground/40 mb-4" />
                <p className="text-xs text-muted-foreground font-medium">Aguardando câmera...</p>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -translate-x-1 -translate-y-1" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary translate-x-1 -translate-y-1" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -translate-x-1 translate-y-1" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary translate-x-1 translate-y-1" />
                </div>
              </div>
              <Button variant="ghost" className="w-full text-xs" onClick={() => setMethod(null)}>Voltar</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cacamba-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Código da Caçamba
                </Label>
                <div className="relative">
                  <Input 
                    id="cacamba-code" 
                    placeholder="Ex: AR77M6TV" 
                    className="h-12 text-lg font-mono font-bold uppercase tracking-widest pl-4 pr-12 border-2 focus:border-primary" 
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <Button variant="outline" className="flex-1 h-11" onClick={() => setMethod(null)}>Voltar</Button>
                <Button className="flex-1 h-11 bg-primary hover:bg-primary/90" onClick={handleConfirmar} disabled={loading}>
                  {loading ? "Enviando..." : "Confirmar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EmitirCdfDialog = ({ ordem }: { ordem: Ordem }) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<{ id: string; classe: string; tratamento: string; volume: string }[]>([
    { id: crypto.randomUUID(), classe: "A1", tratamento: "1", volume: "3" },
    { id: crypto.randomUUID(), classe: "", tratamento: "", volume: "" },
  ]);

  const addRow = () => setRows((r) => [...r, { id: crypto.randomUUID(), classe: "", tratamento: "", volume: "" }]);
  const removeRow = (id: string) => setRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r));
  const updateRow = (id: string, patch: Partial<{ classe: string; tratamento: string; volume: string }>) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg shadow-sm">
          <FileCheck2 className="h-3.5 w-3.5" />
          Emitir CDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle>Tratamento resíduos MTR nº{ordem.pedidoNum}</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex justify-end">
            <Button onClick={addRow} className="h-9 gap-1.5 bg-primary hover:bg-primary/90 text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" />
              Adicionar tratamento
            </Button>
          </div>
          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-[1fr_1fr_120px_44px] gap-3 items-center">
                <Select value={row.classe} onValueChange={(v) => updateRow(row.id, { classe: v })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Classe resíduo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">Classe A1</SelectItem>
                    <SelectItem value="A2">Classe A2</SelectItem>
                    <SelectItem value="A3">Classe A3</SelectItem>
                    <SelectItem value="A4">Classe A4</SelectItem>
                    <SelectItem value="B">Classe B</SelectItem>
                    <SelectItem value="C">Classe C</SelectItem>
                    <SelectItem value="D">Classe D</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={row.tratamento} onValueChange={(v) => updateRow(row.id, { tratamento: v })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Tratamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Reciclagem Mecânica</SelectItem>
                    <SelectItem value="2">2 - Reutilização</SelectItem>
                    <SelectItem value="3">3 - Aterro Classe A</SelectItem>
                    <SelectItem value="4">4 - Aterro Industrial</SelectItem>
                    <SelectItem value="5">5 - Coprocessamento</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="M³"
                  value={row.volume}
                  onChange={(e) => updateRow(row.id, { volume: e.target.value })}
                  className="h-10"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeRow(row.id)}
                  className="h-10 w-10"
                  title="Remover"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setOpen(false)} className="h-10 bg-primary hover:bg-primary/90 font-semibold">
              Salvar e emitir CDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const OrdensTable = ({ data, mode, selected, setSelected, onFocusLocatario, isDestinoFinal, tabKey }: { data: Ordem[]; mode: typeof allTabsConfig[number]["mode"]; selected: string[]; setSelected: (v: string[]) => void; onFocusLocatario?: (o: Ordem) => void; isDestinoFinal?: boolean; tabKey?: TabKey }) => {
  const activeProfileType = useAuthStore((state) => state.activeProfileType());
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => data.filter(o => `${o.cliente} ${o.codigo} ${o.endereco}`.toLowerCase().includes(search.toLowerCase())), [data, search]);
  
  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const isLocatario = activeProfileType === "locatario";
  const isPrefeitura = activeProfileType === "prefeitura";
  const showCheckbox = false;
  const toggle = (id: string) => setSelected(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  const firstColLabel = mode === "view" && data === locadas ? "Data Locação" : mode === "view-cdf" ? "Data Locação" : mode === "view-analise" ? "Data Retirada" : "Data Pedido";
  const localLabel = mode === "view-analise" ? "Local destino" : "Local locação";

  return (
    <DataTable<Ordem>
      title={`${filtered.length} registros`}
      data={paginatedData}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Pesquisar..."
      onRowClick={(o) => showCheckbox && toggle(o.id)}
      rowClassName={(o) => selected.includes(o.id) ? "bg-primary/10 hover:bg-primary/15 shadow-[inset_4px_0_0_0_hsl(var(--primary))] transition-all" : ""}
      columns={[
        {
          header: firstColLabel,
          accessor: (o) => (
            <div className="space-y-1.5">
              <div className="text-xs font-medium">{o.dataPedido || o.dataLocacao || o.dataRetirada}</div>
              {o.tempoRestante && (
                <div className="text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded-sm inline-block">
                  {o.tempoRestante}
                </div>
              )}
              <StatusBadge ordem={o} />
            </div>
          ),
        },
        {
          header: localLabel,
          className: "max-w-xs",
          accessor: (o) => (
            <div className="text-xs space-y-0.5">
              <div className="text-[10px] font-bold text-muted-foreground">Pedido: nº {o.pedidoNum}</div>
              <div className="font-bold text-foreground leading-tight">{o.cliente}</div>
              <div className="flex items-start gap-1 mt-1">
                <MapPin className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] text-primary leading-tight font-medium">{o.endereco}</p>
                  {o.distancia && (
                    <div className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-sm inline-block">
                      {o.distancia}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ),
        },
        {
          header: "Código",
          accessor: (o) => (
            <div className="text-xs space-y-0.5">
              <div className="font-mono font-bold text-foreground">{o.codigo}</div>
              <div className="text-primary text-[11px] font-medium">{o.modelo}</div>
            </div>
          ),
        },
        
        ...(data === locadas || mode === "view-analise" || mode === "view-cdf" ? [{
          header: "Locação",
          accessor: (o: Ordem) => <DriverVehicleCell motorista={o.locacao?.motorista} veiculo={o.locacao?.veiculo} />,
        }] : []),
        tabKey === "entregas"
          ? {
              header: "Entrega",
              accessor: (o: Ordem) => (
                <DriverVehicleCell
                  motorista={o.entrega?.motorista}
                  veiculo={o.entrega?.veiculo}
                  data={o.entrega?.data}
                  status={o.entrega?.status}
                />
              ),
            }
          : {
              header: "Retirada",
              accessor: (o: Ordem) => (
                <DriverVehicleCell
                  motorista={o.retirada?.motorista}
                  veiculo={o.retirada?.veiculo}
                  data={o.retirada?.data}
                  status={o.retirada?.status}
                />
              ),
            },
      ]}
      actions={(o) => {
        const isLocatario = activeProfileType === "locatario";
        return (
          <div className="flex justify-end items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {!isLocatario && isDestinoFinal && mode === "view-analise" && o.statusLabel === "Em análise" && (
              <EmitirCdfDialog ordem={o} />
            )}
            {!isLocatario && isDestinoFinal && (mode === "view-analise" || mode === "view-cdf") && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm"
                title="Abrir MTR (PDF)"
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
            {!isLocatario && !isDestinoFinal && (mode === "view-analise" || mode === "view-cdf") && (
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm">
                <Hand className="h-4 w-4" />
              </Button>
            )}
            {!isLocatario && !isDestinoFinal && (mode === "view-analise" || mode === "view-cdf" || (mode === "view" && data === locadas)) && (
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm">
                <Camera className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onFocusLocatario?.(o);
              }}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        );
      }}
      pagination={{
        totalItems,
        pageSize,
        currentPage,
        onPageChange: setCurrentPage,
        onPageSizeChange: setPageSize,
      }}
    />
  );
};


const OrdensLocacao = () => {
  const activeProfileType = useAuthStore((state) => state.activeProfileType());
  const isDestinoFinal = activeProfileType === "destino";
  const isPrefeitura = activeProfileType === "prefeitura";

  const entregasDB = useOrdensFromDB(
    ["entrega_pendente", "em_transito_locacao"],
    "view"
  );
  const locadasDB = useOrdensFromDB(
    ["locada", "aguardando_retirada", "em_transito_retirada"],
    "view"
  );
  const analiseDB = useOrdensFromDB(
    ["em_transito_destino_final", "aguardando_analise"],
    "view-analise"
  );
  const cdfDB = useOrdensFromDB(["cdf_emitido"], "view-cdf");

  const filteredTabsConfig = useMemo(() => {
    if (isDestinoFinal) {
      return allTabsConfig.filter(t => t.key === "analise" || t.key === "cdf");
    }
    if (isPrefeitura) {
      return allTabsConfig.filter(t => t.key === "locadas" || t.key === "cdf");
    }
    return allTabsConfig.map((t) => {
      if (t.key === "entregas") return { ...t, data: entregasDB };
      if (t.key === "locadas") return { ...t, data: locadasDB };
      if (t.key === "analise") return { ...t, data: analiseDB };
      if (t.key === "cdf") return { ...t, data: cdfDB };
      return t;
    });
  }, [isDestinoFinal, isPrefeitura, entregasDB, locadasDB, analiseDB, cdfDB]);

  const [tab, setTab] = useState<TabKey>(filteredTabsConfig[0]?.key || "entregas");

  useEffect(() => {
    setTab(filteredTabsConfig[0]?.key || "entregas");
  }, [filteredTabsConfig]);

  const [selectedByTab, setSelectedByTab] = useState<Record<TabKey, string[]>>({ entregas: [], locadas: [], analise: [], cdf: [] });
  const mapRefs = useRef<Record<string, L.Map | null>>({});

  const handleFocusOrdem = (ordem: Ordem, tabKey: string) => {
    const map = mapRefs.current[tabKey];
    if (!map) return;
    
    // Smooth scroll map into view if it's not well visible
    const mapElement = map.getContainer();
    mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Deterministic position based on current MapBox logic
    const center: [number, number] = [-20.8113, -49.3758];
    const pos = positionFor(ordem.id, center);
    
    map.flyTo(pos, 15, { duration: 0.6 });
    
    // We can't easily trigger the popup from here because markerRefs are inside MapBox
    // But we can add a custom logic to MapBox or just let the focus happen.
    // Actually, MapBox already has focusOrdem, but it's internal.
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <h1 className="text-xl sm:text-2xl font-bold">Ordens de Locação</h1>
        <p className="text-sm text-white/80">Gerencie entregas, locações ativas, retiradas e CDFs</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1">
          {filteredTabsConfig.map(t => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs sm:text-sm">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {filteredTabsConfig.map(t => (
          <TabsContent key={t.key} value={t.key} className="space-y-5 mt-4">
            <div className="relative">
              <MapBox 
                className="min-h-[480px] w-full" 
                data={t.data} 
                tabLabel={t.label}
                mapRef={{ 
                  get current() { return mapRefs.current[t.key] || null; },
                  set current(val) { mapRefs.current[t.key] = val; }
                } as React.MutableRefObject<L.Map | null>}
              />
              {activeProfileType === "locatario" && t.key === "locadas" && (
                <PedirRetiradaModal />
              )}
            </div>
            <OrdensTable
              data={t.data}
              mode={t.mode}
              tabKey={t.key}
              selected={selectedByTab[t.key]}
              setSelected={(v) => setSelectedByTab(s => ({ ...s, [t.key]: v }))}
              onFocusLocatario={(o) => handleFocusOrdem(o, t.key)}
              isDestinoFinal={isDestinoFinal}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OrdensLocacao;

// ============= DB-backed ordens =============
const STATUS_META: Record<
  string,
  { label: string; variant: Ordem["statusVariant"] }
> = {
  entrega_pendente: { label: "Entrega pendente", variant: "warning" },
  em_transito_locacao: { label: "Em trânsito para locação", variant: "purple" },
  locada: { label: "Locada", variant: "info" },
  aguardando_retirada: { label: "Aguardando retirada", variant: "danger" },
  em_transito_retirada: { label: "Em trânsito para retirada", variant: "purple" },
  em_transito_destino_final: { label: "Em trânsito para destino final", variant: "danger" },
  aguardando_analise: { label: "Aguardando análise", variant: "warning" },
  cdf_emitido: { label: "CDF emitido", variant: "danger" },
  cancelada: { label: "Cancelada", variant: "danger" },
};

function useOrdensFromDB(statuses: string[], mode: "view" | "view-analise" | "view-cdf"): Ordem[] {
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore(
    (s) => s.activeProfile() ?? s.user?.profiles[0] ?? null
  );
  const profileType = activeProfile?.profileType;
  const isLocador = profileType === "locador";
  const rawTenant = activeProfile?.tenantId;
  const locadorId =
    rawTenant && rawTenant !== "self" ? rawTenant : user?.id;

  const { data = [] } = useQuery({
    queryKey: [
      "ordens-db",
      statuses.join(","),
      profileType,
      isLocador ? locadorId : user?.id,
    ],
    enabled: !!user?.id && !!profileType,
    queryFn: async (): Promise<Ordem[]> => {
      const query = supabase
        .from("ordem_locacao_unidades")
        .select(
          `id, status,
           cacamba_unidades ( codigo, cacambas ( modelo ) ),
           ordens_locacao!inner (
             id, equipment_type, created_at,
             obras ( rua, numero, bairro, cidade, estado ),
             pedido_fornecedores!inner (
               id, numero, status, locador_id,
               pedidos!inner ( id, numero, locatario_id )
             )
           )`
        )
        .in("status", statuses);

      const { data: rows, error } = isLocador
        ? await query.eq("ordens_locacao.pedido_fornecedores.locador_id", locadorId!)
        : await query.eq("ordens_locacao.pedido_fornecedores.pedidos.locatario_id", user!.id);
      if (error) throw error;

      const aceitos = (rows ?? []).filter(
        (r: any) => r.ordens_locacao?.pedido_fornecedores?.status === "aceito"
      );

      // Resolver nomes de modelos de caçamba (cacambas.modelo guarda o id do modelo)
      const modeloIds = Array.from(
        new Set(
          aceitos
            .map((r: any) => r.cacamba_unidades?.cacambas?.modelo)
            .filter(Boolean)
        )
      );
      const modeloNomes = new Map<string, string>();
      if (modeloIds.length) {
        const { data: mods } = await supabase
          .from("modelos_cacamba")
          .select("id, modelo")
          .in("id", modeloIds as string[]);
        (mods ?? []).forEach((m: any) => modeloNomes.set(m.id, m.modelo));
      }

      // Buscar dados de entrega (rota) para as OLUs da aba Entregas
      const oluIds = aceitos.map((r: any) => r.id);
      const entregaByOlu = new Map<string, { motorista?: string; veiculo?: string; data?: string }>();
      if (mode === "view" && oluIds.length) {
        const { data: itens } = await supabase
          .from("rota_itens")
          .select("ordem_locacao_unidade_id, tipo, rotas ( data_programada, motorista_id, veiculo_id, status )")
          .in("ordem_locacao_unidade_id", oluIds)
          .ilike("tipo", "entrega");
        const motoristaIds = Array.from(new Set((itens ?? []).map((it: any) => it.rotas?.motorista_id).filter(Boolean)));
        const veiculoIds = Array.from(new Set((itens ?? []).map((it: any) => it.rotas?.veiculo_id).filter(Boolean)));
        const motNomes = new Map<string, string>();
        if (motoristaIds.length) {
          const { data: mprofs } = await supabase.from("profiles").select("id, nome").in("id", motoristaIds as string[]);
          (mprofs ?? []).forEach((p: any) => motNomes.set(p.id, p.nome));
        }
        const veicMap = new Map<string, string>();
        if (veiculoIds.length) {
          const { data: vs } = await supabase.from("veiculos").select("id, placa, marca, modelo").in("id", veiculoIds as string[]);
          (vs ?? []).forEach((v: any) => {
            const label = [v.placa, [v.marca, v.modelo].filter(Boolean).join(" ")].filter(Boolean).join(" - ");
            veicMap.set(v.id, label);
          });
        }
        (itens ?? []).forEach((it: any) => {
          const r = it.rotas;
          if (!r) return;
          if (r.status === "cancelada") return;
          entregaByOlu.set(it.ordem_locacao_unidade_id, {
            motorista: r.motorista_id ? motNomes.get(r.motorista_id) : undefined,
            veiculo: r.veiculo_id ? veicMap.get(r.veiculo_id) : undefined,
            data: r.data_programada
              ? `Agendado para ${new Date(r.data_programada).toLocaleDateString("pt-BR")}`
              : undefined,
          });
        });
      }

      const locatarioIds = Array.from(
        new Set(
          aceitos
            .map(
              (r: any) =>
                r.ordens_locacao?.pedido_fornecedores?.pedidos?.locatario_id
            )
            .filter(Boolean)
        )
      );
      const nomes = new Map<string, string>();
      if (locatarioIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nome")
          .in("id", locatarioIds as string[]);
        (profs ?? []).forEach((p: any) => nomes.set(p.id, p.nome));
      }

      return aceitos.map((r: any): Ordem => {
        const ol = r.ordens_locacao ?? {};
        const pf = ol.pedido_fornecedores ?? {};
        const ped = pf.pedidos ?? {};
        const obra = ol.obras ?? {};
        const cu = r.cacamba_unidades ?? {};
        const cac = cu.cacambas ?? {};
        const modeloNome = cac.modelo ? modeloNomes.get(cac.modelo) ?? null : null;
        const endereco = obra
          ? [
              [obra.rua, obra.numero].filter(Boolean).join(", "),
              obra.bairro,
              [obra.cidade, obra.estado].filter(Boolean).join("/"),
            ]
              .filter(Boolean)
              .join(" - ")
          : "—";
        const createdAt = ol.created_at
          ? new Date(ol.created_at).toLocaleString("pt-BR")
          : "—";
        const meta = STATUS_META[r.status] ?? {
          label: r.status,
          variant: "warning" as const,
        };
        return {
          id: r.id,
          dataPedido: mode === "view" ? createdAt : undefined,
          dataLocacao: mode === "view-cdf" ? createdAt : undefined,
          dataRetirada: mode === "view-analise" ? createdAt : undefined,
          cliente: nomes.get(ped.locatario_id) ?? "—",
          endereco,
          pedidoNum: ped.numero ?? 0,
          codigo: cu.codigo ?? "—",
          modelo: modeloNome ?? ol.equipment_type ?? "—",
          statusLabel: meta.label,
          statusVariant: meta.variant,
          retirada: { status: "Aguardando agendamento" },
          entrega: entregaByOlu.get(r.id) ?? { status: "Aguardando agendamento" },
        };
      });
    },
  });

  return data;
}
