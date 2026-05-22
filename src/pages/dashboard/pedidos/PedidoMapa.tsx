import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockPedidos } from "./PedidosList";

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
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);
  return null;
};

const PedidoMapa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pedido = mockPedidos.find((p) => String(p.id) === id);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Centro padrão: São José do Rio Preto
  const center: [number, number] = [-20.8113, -49.3758];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Pedido nº {pedido?.id ?? "-"}</h1>
          <p className="text-sm text-white/75">Localização da entrega no mapa</p>
        </div>
        <Button 
          className="bg-white/20 hover:bg-white/30 text-white border-0"
          onClick={() => navigate("/dashboard/pedidos")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      <Card>
        <CardContent className="p-2">
          <div 
            ref={wrapperRef}
            className={`relative w-full rounded-md overflow-hidden bg-muted ${isFullscreen ? "rounded-none" : ""}`}
            style={{ height: isFullscreen ? "100vh" : "600px" }}
          >
            <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
              <MapResizer />
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {pedido && (
                <Marker position={center}>
                  <Popup>{pedido.endereco}</Popup>
                </Marker>
              )}
            </MapContainer>
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Sair de tela cheia" : "Tela cheia"}
              className="absolute top-[88px] left-[10px] z-[1000] h-[30px] w-[30px] flex items-center justify-center bg-white hover:bg-muted text-foreground border-2 border-[rgba(0,0,0,0.2)] rounded-[4px] shadow-sm transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PedidoMapa;
