
import { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  Filter, 
  QrCode, 
  Play, 
  PackageCheck, 
  Camera,
  Map as MapIcon,
  Navigation,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Truck,
  Image as ImageIcon,
  Plus,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createSequenceIcon = (sequence: number, status: string) => {
  const color = status === "Concluída" ? "#10b981" : "#3b82f6";
  return L.divIcon({
    className: 'custom-sequence-marker',
    html: `
      <div style="
        background: ${color};
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

const createTruckIcon = () => {
  return L.divIcon({
    className: 'custom-truck-marker',
    html: `
      <div style="
        background: #1e293b;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v7a1 1 0 0 0 1 1h2"/><path d="M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
};

interface DeliveryItem {
  id: string;
  client: string;
  address: string;
  status: "Pendente" | "Em Rota" | "Concluída";
  type: "Entrega" | "Retirada";
  time: string;
  sequence: number;
  qrCode: string;
  posicao: [number, number];
  obra?: string;
  residuo?: string;
}

interface Route {
  id: string;
  name: string;
  date: string;
  status: "Pendente" | "Em Rota" | "Concluída";
  items: DeliveryItem[];
}

const MinhasRotas = () => {
  const [search, setSearch] = useState("");
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [expandedRoutes, setExpandedRoutes] = useState<string[]>(["R-001"]);
  const [showMap, setShowMap] = useState(false);
  
  // Delivery confirmation states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmStep, setConfirmStep] = useState<"qr" | "photo">("qr");
  const [selectedDeliveryItem, setSelectedDeliveryItem] = useState<DeliveryItem | null>(null);
  const [deliveryPhotos, setDeliveryPhotos] = useState<string[]>([]);
  
  const [truckPos, setTruckPos] = useState<[number, number]>([-20.8050, -49.3700]);

  const [routes, setRoutes] = useState<Route[]>([
    {
      id: "R-001",
      name: "Rota Norte - Setor A",
      date: "22/05/2026",
      status: "Pendente",
      items: [
        { id: "#ENT-1001", client: "Construtora Alfa", address: "Rua A, 123 - Centro", status: "Pendente", type: "Entrega", time: "09:00", sequence: 1, qrCode: "C-1001", posicao: [-20.8113, -49.3758], obra: "Residencial Horizonte", residuo: "Classe A" },
        { id: "#ENT-1002", client: "João da Silva", address: "Av. B, 456 - Jd. América", status: "Pendente", type: "Entrega", time: "10:30", sequence: 2, qrCode: "C-1002", posicao: [-20.8150, -49.3850], obra: "Reforma Particular", residuo: "Misto" },
        { id: "#ENT-1004", client: "Reforma Central", address: "Praça da Sé, 1 - Centro", status: "Pendente", type: "Retirada", time: "11:45", sequence: 3, qrCode: "C-1004", posicao: [-20.8200, -49.3950], obra: "Edifício Comercial", residuo: "Solo" },
      ]
    },
    {
      id: "R-002",
      name: "Rota Sul - Setor B",
      date: "22/05/2026",
      status: "Pendente",
      items: [
        { id: "#ENT-1005", client: "Escola Municipal", address: "Rua Escolar, 50 - Vila Sul", status: "Pendente", type: "Entrega", time: "14:00", sequence: 1, qrCode: "C-1005", posicao: [-20.8250, -49.3850], obra: "Manutenção Quadra", residuo: "Vegetal" },
        { id: "#ENT-1006", client: "Hospital Regional", address: "Av. Saúde, 1000 - Sul", status: "Pendente", type: "Retirada", time: "15:30", sequence: 2, qrCode: "C-1006", posicao: [-20.8300, -49.3900], obra: "Nova Ala", residuo: "Gesso" },
      ]
    }
  ]);

  const [startingRouteId, setStartingRouteId] = useState<string | null>(null);
  const [validatedQrs, setValidatedQrs] = useState<string[]>([]);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);

  // Simulando movimento do motorista
  useEffect(() => {
    if (activeRouteId && showMap) {
      const interval = setInterval(() => {
        setTruckPos(prev => [prev[0] - 0.0001, prev[1] - 0.0001]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeRouteId, showMap]);

  const toggleRouteExpansion = (id: string) => {
    setExpandedRoutes(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleOpenStartModal = (routeId: string) => {
    if (activeRouteId) {
      toast.error("Você já possui uma rota ativa.");
      return;
    }
    setStartingRouteId(routeId);
    setValidatedQrs([]);
    setIsStartModalOpen(true);
  };

  const handleStartRoute = () => {
    if (!startingRouteId) return;
    
    setActiveRouteId(startingRouteId);
    setRoutes(prev => prev.map(r => 
      r.id === startingRouteId ? { ...r, status: "Em Rota", items: r.items.map(i => ({...i, status: "Em Rota"})) } : r
    ));
    setIsStartModalOpen(false);
    setStartingRouteId(null);
    setValidatedQrs([]);
    setShowMap(true);
    toast.success("Rota iniciada com sucesso!");
  };

  const handleValidateQr = () => {
    if (!qrCode || !startingRouteId) return;
    const route = routes.find(r => r.id === startingRouteId);
    const itemToValidate = route?.items.find(i => i.qrCode === qrCode);

    if (itemToValidate) {
      if (validatedQrs.includes(qrCode)) {
        toast.warning("Esta caçamba já foi validada.");
      } else {
        setValidatedQrs(prev => [...prev, qrCode]);
        toast.success(`Caçamba ${qrCode} validada!`);
        setQrCode("");
      }
    } else {
      toast.error("QR Code não pertence a esta rota.");
    }
  };

  const handleConfirmDeliveryQr = () => {
    if (!qrCode || !selectedDeliveryItem) return;
    
    if (qrCode === selectedDeliveryItem.qrCode) {
      toast.success("Caçamba validada! Agora tire as fotos do local.");
      setConfirmStep("photo");
      setQrCode("");
    } else {
      toast.error("QR Code incorreto para este local.");
    }
  };

  const handleAddPhoto = () => {
    const newPhoto = "https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?q=80&w=300&auto=format&fit=crop";
    setDeliveryPhotos(prev => [...prev, newPhoto]);
    toast.success("Foto adicionada.");
  };

  const handleFinishDelivery = () => {
    if (!selectedDeliveryItem || !activeRouteId) return;
    
    setRoutes(prev => prev.map(r => {
      if (r.id === activeRouteId) {
        return {
          ...r,
          items: r.items.map(i => i.id === selectedDeliveryItem.id ? { ...i, status: "Concluída" } : i)
        };
      }
      return r;
    }));

    setIsConfirmModalOpen(false);
    setSelectedDeliveryItem(null);
    setConfirmStep("qr");
    setDeliveryPhotos([]);
    toast.success("Finalizado com sucesso!");
  };

  const handleFinishRoute = () => {
    if (!activeRouteId) return;
    const currentRoute = routes.find(r => r.id === activeRouteId);
    const allDone = currentRoute?.items.every(i => i.status === "Concluída");
    
    if (!allDone) {
      toast.warning("Ainda existem entregas pendentes nesta rota.");
      return;
    }

    setRoutes(prev => prev.map(r => 
      r.id === activeRouteId ? { ...r, status: "Concluída" } : r
    ));
    setActiveRouteId(null);
    setShowMap(false);
    toast.info("Rota finalizada.");
  };

  const filteredRoutes = routes.filter(r => 
    r.status !== "Concluída" && (
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.items.some(i => i.client.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const activeRoute = routes.find(r => r.id === activeRouteId);
  const routePoints = activeRoute?.items.map(item => item.posicao) || [];

  return (
    <div className="space-y-6 pb-24">
      <PageHeader 
        title="Minhas Rotas de Entrega" 
        subtitle="Gerencie seu itinerário diário"
      />

      {activeRouteId && (
        <Card className="bg-primary/5 border-primary/20 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <Navigation className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-primary text-lg">Rota em Andamento</p>
                  <p className="text-sm text-muted-foreground">
                    {activeRoute?.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={showMap ? "secondary" : "outline"} 
                  className="gap-2"
                  onClick={() => setShowMap(!showMap)}
                >
                  <MapIcon className="h-4 w-4" /> {showMap ? "Lista" : "Mapa"}
                </Button>
                <Button size="sm" onClick={handleFinishRoute}>
                  Finalizar
                </Button>
              </div>
            </div>

            {showMap && (
              <div className="flex flex-col">
                <div className="h-[300px] w-full border-t relative">
                  <MapContainer 
                    center={truckPos} 
                    zoom={15} 
                    className="h-full w-full"
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapResizer />
                    
                    {/* Truck Marker */}
                    <Marker position={truckPos} icon={createTruckIcon()} />
                    
                    {activeRoute?.items.map((item) => (
                      <Marker 
                        key={item.id} 
                        position={item.posicao} 
                        icon={createSequenceIcon(item.sequence, item.status)}
                      >
                        <Popup>
                          <div className="p-1 max-w-[200px]">
                            <p className="font-bold text-sm">{item.client}</p>
                            <p className="text-xs text-muted-foreground">{item.address}</p>
                            <Badge variant="outline" className="mt-2 text-[10px]">{item.status}</Badge>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    {routePoints.length > 1 && (
                      <Polyline positions={routePoints} color="#3b82f6" weight={4} opacity={0.6} dashArray="10, 10" />
                    )}
                  </MapContainer>
                  <div className="absolute top-2 right-2 z-[2]">
                    <Badge className="bg-white/90 text-primary border-primary backdrop-blur-sm shadow-sm flex items-center gap-2 px-3 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      GPS Ativo
                    </Badge>
                  </div>
                </div>

                {/* Delivery list below map */}
                <div className="p-4 bg-background border-t space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <MapIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Itinerário da Rota</span>
                  </div>
                  {activeRoute?.items.map((item, idx) => (
                    <div key={item.id} className="relative pl-8 pb-4 last:pb-0">
                      {idx < (activeRoute?.items.length || 0) - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-muted-foreground/20" />
                      )}
                      <div className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                        item.status === "Concluída" ? "bg-emerald-500 text-white border-emerald-500" : "bg-primary/10 text-primary border-primary/20"
                      }`}>
                        {item.status === "Concluída" ? <CheckCircle2 className="h-3 w-3" /> : item.sequence}
                      </div>
                      
                      <div className="flex justify-between items-start group">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm">{item.client}</h5>
                              <Badge variant="outline" className={`text-[8px] h-4 ${item.type === "Entrega" ? "text-blue-500 border-blue-200" : "text-orange-500 border-orange-200"}`}>
                                {item.type}
                              </Badge>
                              {item.status === "Concluída" && <Badge className="bg-emerald-500 text-white text-[8px] h-4">Concluído</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {item.address}
                            </p>
                          <p className="text-[10px] font-medium text-primary/70 mt-1 uppercase tracking-tighter">
                            Previsão: {item.time}
                          </p>
                        </div>
                        {item.status !== "Concluída" && (
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="h-9 gap-2 shadow-sm border"
                              onClick={() => {
                                setSelectedDeliveryItem(item);
                                setIsConfirmModalOpen(true);
                              }}
                            >
                              Confirmar {item.type}
                            </Button>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!showMap && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar rota ou cliente..." 
                className="pl-9 h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map((route) => (
                <Card key={route.id} className={`overflow-hidden transition-all ${activeRouteId === route.id ? "ring-2 ring-primary" : ""}`}>
                  <Collapsible open={expandedRoutes.includes(route.id)}>
                    <div className="flex items-center justify-between p-4 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${route.status === "Em Rota" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <PackageCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold">{route.name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" /> {route.items.length} entregas • {route.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {route.status === "Pendente" && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleOpenStartModal(route.id)}
                            disabled={!!activeRouteId}
                          >
                            <Play className="h-4 w-4 fill-primary" /> Iniciar
                          </Button>
                        )}
                        <CollapsibleTrigger asChild onClick={() => toggleRouteExpansion(route.id)}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {expandedRoutes.includes(route.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="p-4 pt-2 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <MapIcon className="h-4 w-4 text-primary" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Itinerário da Rota</span>
                        </div>
                        {route.items.map((item, idx) => (
                          <div key={item.id} className="relative pl-8 pb-4 last:pb-0">
                            {idx < route.items.length - 1 && (
                              <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-muted-foreground/20" />
                            )}
                            <div className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                              item.status === "Concluída" ? "bg-emerald-500 text-white border-emerald-500" : "bg-primary/10 text-primary border-primary/20"
                            }`}>
                              {item.status === "Concluída" ? <CheckCircle2 className="h-3 w-3" /> : item.sequence}
                            </div>
                            
                            <div className="flex justify-between items-start group">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-sm">{item.client}</h5>
                                  <Badge variant="outline" className={`text-[8px] h-4 ${item.type === "Entrega" ? "text-blue-500 border-blue-200" : "text-orange-500 border-orange-200"}`}>
                                    {item.type}
                                  </Badge>
                                  {item.status === "Concluída" && <Badge className="bg-emerald-500 text-white text-[8px] h-4">Concluído</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" /> {item.address}
                                </p>
                                <p className="text-[10px] font-medium text-primary/70 mt-1 uppercase tracking-tighter">
                                  Previsão: {item.time}
                                </p>
                              </div>
                              {route.status === "Em Rota" && item.status !== "Concluída" && (
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  className="h-9 gap-2 shadow-sm border"
                                  onClick={() => {
                                    setSelectedDeliveryItem(item);
                                    setIsConfirmModalOpen(true);
                                  }}
                                >
                                  Confirmar {item.type}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
                <PackageCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <h3 className="text-lg font-semibold">Sem rotas disponíveis</h3>
                <p className="text-sm">Todas as atividades foram concluídas ou nenhuma rota foi atribuída.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Carregamento da Rota (Início) */}
      <Dialog open={isStartModalOpen} onOpenChange={setIsStartModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Carregamento de Rota</DialogTitle>
            <DialogDescription>
              Valide o QR Code de todas as caçambas de <strong>Entrega</strong> que estão sendo carregadas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Itens para Entrega ({validatedQrs.length}/{routes.find(r => r.id === startingRouteId)?.items.filter(i => i.type === "Entrega").length || 0})</label>
              <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
                {routes.find(r => r.id === startingRouteId)?.items.filter(i => i.type === "Entrega").map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${validatedQrs.includes(item.qrCode) ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                        {validatedQrs.includes(item.qrCode) ? <CheckCircle2 className="h-4 w-4" /> : <QrCode className="h-3 w-3" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.qrCode}</p>
                        <p className="text-[10px] text-muted-foreground">{item.client}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-video bg-black rounded-xl flex flex-col items-center justify-center overflow-hidden">
               <Camera className="h-8 w-8 text-white mb-1 opacity-50" />
               <div className="absolute inset-8 border-2 border-primary/50 rounded" />
               <p className="text-[10px] text-white/50 font-bold uppercase mt-2">Leitor de Carga Ativo</p>
            </div>

            <div className="flex gap-2">
              <Input 
                placeholder="QR Code da Caçamba" 
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleValidateQr()}
              />
              <Button onClick={handleValidateQr}>Validar</Button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsStartModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button 
              onClick={handleStartRoute} 
              disabled={validatedQrs.length !== (routes.find(r => r.id === startingRouteId)?.items.filter(i => i.type === "Entrega").length || 0)}
              className="flex-1"
            >
              Iniciar Rota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Entrega (No Local) */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Confirmar {selectedDeliveryItem?.type}: {selectedDeliveryItem?.id}</DialogTitle>
            <DialogDescription>Validação obrigatória no local do cliente.</DialogDescription>
          </DialogHeader>
          
          <div className="p-6 pt-4 space-y-6">
            {/* Informações da Ordem */}
            <div className="bg-muted/50 rounded-xl p-4 border space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Info className="h-4 w-4" /> Dados da Locação
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-semibold text-right">{selectedDeliveryItem?.client}</span>
                <span className="text-muted-foreground">Obra:</span>
                <span className="font-semibold text-right">{selectedDeliveryItem?.obra}</span>
                <span className="text-muted-foreground">Resíduo:</span>
                <span className="font-semibold text-right">{selectedDeliveryItem?.residuo}</span>
                <span className="text-muted-foreground">Endereço:</span>
                <span className="font-semibold text-right line-clamp-2">{selectedDeliveryItem?.address}</span>
              </div>
            </div>

            {confirmStep === "qr" ? (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold">Passo 1: Valide o QR Code</p>
                  <p className="text-xs text-muted-foreground">Confirme se é a caçamba correta para este local.</p>
                </div>
                
                <div className="relative aspect-square max-w-[200px] mx-auto bg-black rounded-2xl flex items-center justify-center overflow-hidden">
                  <Camera className="h-10 w-10 text-white/30" />
                  <div className="absolute inset-4 border-2 border-emerald-500 rounded animate-pulse" />
                </div>

                <div className="flex gap-2">
                  <Input 
                    placeholder="Escaneie o QR Code" 
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmDeliveryQr()}
                  />
                  <Button onClick={handleConfirmDeliveryQr}>Validar</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold">Passo 2: Fotos da Atividade</p>
                  <p className="text-xs text-muted-foreground">Tire fotos para comprovar a conclusão.</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={handleAddPhoto}
                    className="aspect-square bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground mt-1">FOTO</span>
                  </button>
                  {deliveryPhotos.map((photo, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden relative group border">
                      <img src={photo} alt={`Atividade ${i}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setDeliveryPhotos(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 h-5 w-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full h-12 text-lg gap-2" 
                  onClick={handleFinishDelivery}
                  disabled={deliveryPhotos.length === 0}
                >
                  <CheckCircle2 className="h-5 w-5" /> Finalizar {selectedDeliveryItem?.type}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinhasRotas;
