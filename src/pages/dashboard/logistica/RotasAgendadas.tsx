
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  X
} from "lucide-react";
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

const mockRotas = [
  {
    id: "ROT-001",
    nome: "Rota Norte - Setor A",
    motorista: "João Silva",
    veiculo: "ABC-1234 (Mercedes-Benz)",
    data: "22/05/2026",
    status: "Pendente",
    pontos: 3,
    itinerario: [
      { id: 1, cliente: "Construtora Alfa", endereco: "Rua A, 123 - Centro", tipo: "Entrega", posicao: [-20.8113, -49.3758] as [number, number] },
      { id: 2, cliente: "João da Silva", endereco: "Av. B, 456 - Jd. América", tipo: "Entrega", posicao: [-20.8150, -49.3850] as [number, number] },
      { id: 3, cliente: "Reforma Central", endereco: "Praça da Sé, 1 - Centro", tipo: "Retirada", posicao: [-20.8200, -49.3950] as [number, number] },
    ]
  },
  {
    id: "ROT-002",
    nome: "Rota Sul - Setor B",
    motorista: "Ricardo Santos",
    veiculo: "XYZ-9876 (Volkswagen)",
    data: "23/05/2026",
    status: "Pendente",
    pontos: 5,
    itinerario: [
      { id: 1, cliente: "Escola Municipal", endereco: "Rua Escolar, 50 - Vila Sul", tipo: "Entrega", posicao: [-20.8250, -49.3850] as [number, number] },
      { id: 2, cliente: "Hospital Regional", endereco: "Av. Saúde, 1000 - Sul", tipo: "Retirada", posicao: [-20.8300, -49.3900] as [number, number] },
    ]
  }
];

const RotasAgendadas = () => {
  const [search, setSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<typeof mockRotas[0] | null>(null);

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(mockRotas, 10);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Rotas Agendadas" 
        subtitle="Listagem de rotas futuras e aguardando início"
      />

      <DataTable
        title="Próximas Rotas"
        data={mockRotas}
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
            accessor: (r) => (
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                {r.status}
              </Badge>
            )
          },
          {
            header: "Ações",
            accessor: (r) => (
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 h-8 text-xs font-semibold"
                onClick={() => setSelectedRoute(r)}
              >
                <MapIcon className="h-3.5 w-3.5" />
                Ver Roteiro
              </Button>
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
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                {r.status}
              </Badge>
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
            <div className="pt-2 border-t flex justify-between items-center">
              <span className="text-xs font-bold text-primary">{r.pontos} locais agendados</span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 text-xs gap-2"
                onClick={() => setSelectedRoute(r)}
              >
                <MapIcon className="h-3.5 w-3.5" /> Roteiro
              </Button>
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
          <DialogHeader className="p-6 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Roteiro da Rota: {selectedRoute?.nome}
                </DialogTitle>
                <DialogDescription>
                  {selectedRoute?.data} • {selectedRoute?.motorista} • {selectedRoute?.veiculo}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Itinerary List */}
            <div className="w-full md:w-80 border-r overflow-y-auto p-4 space-y-4 bg-muted/20">
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
                    <div className="bg-white p-3 rounded-lg border shadow-sm group hover:border-primary transition-colors cursor-default">
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
                    </div>
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
                  center={selectedRoute.itinerario[0].posicao} 
                  zoom={13} 
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {selectedRoute.itinerario.map((item, idx) => (
                    <Marker 
                      key={item.id} 
                      position={item.posicao} 
                      icon={createSequenceIcon(idx + 1)}
                    >
                      <Popup>
                        <div className="p-1">
                          <p className="font-bold text-sm">{item.cliente}</p>
                          <p className="text-xs text-muted-foreground">{item.endereco}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <Polyline 
                    positions={selectedRoute.itinerario.map(i => i.posicao)} 
                    color="#3b82f6" 
                    weight={4} 
                    opacity={0.6} 
                    dashArray="10, 10" 
                  />
                </MapContainer>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RotasAgendadas;
