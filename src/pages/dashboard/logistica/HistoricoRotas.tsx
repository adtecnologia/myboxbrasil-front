
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Map as MapIcon, 
  Navigation,
  Fuel,
  TrendingDown,
  TrendingUp,
  History
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

const createSequenceIcon = (sequence: number, color: string = "#3b82f6") => {
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

const mockHistorico = [
  {
    id: "ROT-098",
    nome: "Rota Norte - Entregas Matinais",
    motorista: "João Silva",
    veiculo: "ABC-1234 (Mercedes-Benz)",
    data: "15/05/2026",
    status: "Concluída",
    pontos: 4,
    estimado: {
      km: 18.5,
      tempo: "2h 15m",
      combustivel: "12.0L"
    },
    real: {
      km: 20.2,
      tempo: "2h 40m",
      combustivel: "13.5L"
    },
    itinerario: [
      { id: 1, cliente: "Construtora Alfa", endereco: "Rua A, 123 - Centro", tipo: "Entrega", posicao: [-20.8113, -49.3758] as [number, number], realizado: true, locatario: "Construtora Alfa LTDA", modelo: "Caçamba 5m³", equipamento: "C-102" },
      { id: 2, cliente: "João da Silva", endereco: "Av. B, 456 - Jd. América", tipo: "Entrega", posicao: [-20.8150, -49.3850] as [number, number], realizado: true, locatario: "João da Silva", modelo: "Caçamba 3m³", equipamento: "C-055" },
      { id: 3, cliente: "Reforma Central", endereco: "Praça da Sé, 1 - Centro", tipo: "Retirada", posicao: [-20.8200, -49.3950] as [number, number], realizado: true, destinoFinal: "EcoPonto Norte", modelo: "Caçamba 5m³", equipamento: "C-088" },
      { id: 4, cliente: "Obra Residencial", endereco: "Rua C, 789 - Vila Nova", tipo: "Entrega", posicao: [-20.8050, -49.3650] as [number, number], realizado: true, locatario: "Residencial Park", modelo: "Caçamba 5m³", equipamento: "C-110" },
    ],
    // Rota realmente feita pelo motorista (ligeiramente diferente)
    rotaRealizada: [
      [-20.8113, -49.3758],
      [-20.8120, -49.3780],
      [-20.8150, -49.3850],
      [-20.8180, -49.3900],
      [-20.8200, -49.3950],
      [-20.8150, -49.3850],
      [-20.8050, -49.3650],
    ] as [number, number][]
  },
  {
    id: "ROT-097",
    nome: "Rota Sul - Coleta Setor B",
    motorista: "Ricardo Santos",
    veiculo: "XYZ-9876 (Volkswagen)",
    data: "14/05/2026",
    status: "Concluída",
    pontos: 3,
    estimado: {
      km: 12.0,
      tempo: "1h 30m",
      combustivel: "8.5L"
    },
    real: {
      km: 11.5,
      tempo: "1h 20m",
      combustivel: "7.8L"
    },
    itinerario: [
      { id: 1, cliente: "Escola Municipal", endereco: "Rua Escolar, 50 - Vila Sul", tipo: "Entrega", posicao: [-20.8250, -49.3850] as [number, number], realizado: true, locatario: "Prefeitura Municipal", modelo: "Caçamba 5m³", equipamento: "C-201" },
      { id: 2, cliente: "Hospital Regional", endereco: "Av. Saúde, 1000 - Sul", tipo: "Retirada", posicao: [-20.8300, -49.3900] as [number, number], realizado: true, destinoFinal: "Aterro Sanitário Municipal", modelo: "Caçamba 5m³", equipamento: "C-202" },
      { id: 3, cliente: "Condomínio Solar", endereco: "Rua do Sol, 200 - Sul", tipo: "Retirada", posicao: [-20.8350, -49.3950] as [number, number], realizado: true, destinoFinal: "EcoPonto Sul", modelo: "Caçamba 3m³", equipamento: "C-205" },
    ],
    rotaRealizada: [
      [-20.8250, -49.3850],
      [-20.8300, -49.3900],
      [-20.8350, -49.3950],
    ] as [number, number][]
  }
];

const HistoricoRotas = () => {
  const [search, setSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<typeof mockHistorico[0] | null>(null);

  const { totalItems, currentPage, pageSize, setCurrentPage, setPageSize } = usePagination(mockHistorico, 10);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Histórico de Rotas" 
        subtitle="Consulte o desempenho de rotas já finalizadas"
      />

      <DataTable
        title="Rotas Concluídas"
        data={mockHistorico}
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {r.data}
              </div>
            )
          },
          {
            header: "Distância Real",
            accessor: (r) => (
              <div className="flex items-center gap-1.5 font-medium text-sm">
                {r.real.km} km
                {r.real.km > r.estimado.km ? (
                  <TrendingUp className="h-3 w-3 text-red-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
              </div>
            )
          },
          {
            header: "Tempo Real",
            accessor: (r) => (
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {r.real.tempo}
              </div>
            )
          },
          {
            header: "Status",
            accessor: (r) => (
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
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
                <History className="h-3.5 w-3.5" />
                Detalhes
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
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
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
              <div className="space-y-1">
                <p className="text-muted-foreground">KM Real</p>
                <p className="font-medium">{r.real.km} km</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Tempo Real</p>
                <p className="font-medium">{r.real.tempo}</p>
              </div>
            </div>
            <div className="pt-2 border-t flex justify-end">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 text-xs gap-2"
                onClick={() => setSelectedRoute(r)}
              >
                <History className="h-3.5 w-3.5" /> Ver Detalhes
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
        <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden flex flex-col h-[90vh]">
          <DialogHeader className="p-6 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Comparativo de Rota: {selectedRoute?.nome}
                </DialogTitle>
                <DialogDescription>
                  Realizada em {selectedRoute?.data} • {selectedRoute?.motorista}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Comparison Stats */}
            <div className="w-full md:w-80 border-r overflow-y-auto p-4 space-y-6 bg-muted/20">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Resumo de Performance</h3>
                
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold">Distância</span>
                      <Navigation className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-muted-foreground">Programado</span>
                        <span className="text-sm font-medium">{selectedRoute?.estimado.km} km</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-muted-foreground">Realizado</span>
                        <span className="text-base font-bold text-blue-600">{selectedRoute?.real.km} km</span>
                      </div>
                      <div className={`text-[10px] font-bold text-right ${selectedRoute && selectedRoute.real.km > selectedRoute.estimado.km ? "text-red-500" : "text-green-500"}`}>
                        {selectedRoute && (selectedRoute.real.km - selectedRoute.estimado.km).toFixed(1)} km de diferença
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold">Tempo</span>
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-muted-foreground">Programado</span>
                        <span className="text-sm font-medium">{selectedRoute?.estimado.tempo}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-muted-foreground">Realizado</span>
                        <span className="text-base font-bold text-amber-600">{selectedRoute?.real.tempo}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold">Combustível</span>
                      <Fuel className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-muted-foreground">Estimado</span>
                        <span className="text-sm font-medium">{selectedRoute?.estimado.combustivel}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-muted-foreground">Gasto Real</span>
                        <span className="text-base font-bold text-green-600">{selectedRoute?.real.combustivel}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Legenda do Mapa</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px]">
                    <div className="w-3 h-0.5 bg-blue-500 border-t-2 border-dashed"></div>
                    <span>Rota Programada</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <div className="w-3 h-0.5 bg-red-500"></div>
                    <span>Rota Efetiva</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative min-h-[400px]">
              {selectedRoute && (
                <MapContainer 
                  center={selectedRoute.itinerario[0].posicao} 
                  zoom={13} 
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Scheduled Route (Dashed Line) */}
                  <Polyline 
                    positions={selectedRoute.itinerario.map(i => i.posicao)} 
                    color="#3b82f6" 
                    weight={4} 
                    opacity={0.5} 
                    dashArray="10, 10" 
                  />

                  {/* Actual Route (Solid Line) */}
                  <Polyline 
                    positions={selectedRoute.rotaRealizada} 
                    color="#ef4444" 
                    weight={4} 
                    opacity={0.8} 
                  />

                  {selectedRoute.itinerario.map((item, idx) => (
                    <Marker 
                      key={item.id} 
                      position={item.posicao} 
                      icon={createSequenceIcon(idx + 1)}
                    >
                      <Popup className="custom-popup">
                        <div className="p-2 space-y-2 min-w-[200px]">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-sm leading-tight">{item.cliente}</h4>
                            <Badge variant="outline" className={`text-[9px] h-4 whitespace-nowrap ${item.tipo === "Entrega" ? "text-blue-500 border-blue-200" : "text-orange-500 border-orange-200"}`}>
                              {item.tipo}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1.5 pt-1 border-t">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-muted-foreground uppercase font-semibold">Endereço</span>
                              <span className="text-[10px] leading-tight">{item.endereco}</span>
                            </div>

                            {item.tipo === "Entrega" ? (
                              <div className="flex flex-col">
                                <span className="text-[9px] text-muted-foreground uppercase font-semibold">Locatário</span>
                                <span className="text-[10px]">{item.locatario}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-[9px] text-muted-foreground uppercase font-semibold">Destino Final</span>
                                <span className="text-[10px]">{item.destinoFinal}</span>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-muted-foreground uppercase font-semibold">Modelo</span>
                                <span className="text-[10px] font-medium">{item.modelo}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] text-muted-foreground uppercase font-semibold">Equipamento</span>
                                <span className="text-[10px] font-medium">{item.equipamento}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-1">
                            <Badge className="w-full justify-center bg-green-100 text-green-700 hover:bg-green-100 border-0 text-[10px]">
                              Visitado
                            </Badge>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoricoRotas;
