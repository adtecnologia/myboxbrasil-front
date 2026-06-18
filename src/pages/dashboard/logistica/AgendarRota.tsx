
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Truck, 
  User, 
  MapPin, 
  Package, 
  Search, 
  Plus, 
  ArrowRight,
  GripVertical,
  Navigation,
  Fuel,
  TrendingUp,
  Clock,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

const mockPendentes = [
  { id: "PED-001", cliente: "Construtora Alfa", endereco: "Rua A, 123 - Centro", tipo: "Entrega", modelo: "Caçamba 5m³", data: "22/05/2026", posicao: [-20.8113, -49.3758] as [number, number] },
  { id: "PED-002", cliente: "João da Silva", endereco: "Av. B, 456 - Jd. América", tipo: "Entrega", modelo: "Caçamba 5m³", data: "22/05/2026", posicao: [-20.8150, -49.3850] as [number, number] },
  { id: "PED-003", cliente: "Reforma Central", endereco: "Praça da Sé, 1 - Centro", tipo: "Retirada", modelo: "Caçamba 7m³", data: "22/05/2026", posicao: [-20.8200, -49.3950] as [number, number] },
  { id: "PED-004", cliente: "Escola Municipal", endereco: "Rua Escolar, 50 - Vila Sul", tipo: "Entrega", modelo: "Caçamba 5m³", data: "22/05/2026", posicao: [-20.8250, -49.3850] as [number, number] },
  { id: "PED-005", cliente: "Hospital Regional", endereco: "Av. Saúde, 1000 - Sul", tipo: "Retirada", modelo: "Caçamba 5m³", data: "22/05/2026", posicao: [-20.8300, -49.3900] as [number, number] },
];

interface SortableItemProps {
  id: string;
  item: typeof mockPendentes[0];
  index: number;
  onRemove: (id: string) => void;
}

const SortableItem = ({ id, item, index, onRemove }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center gap-3 p-3 bg-white border-2 rounded-xl group hover:border-primary/30 transition-all shadow-sm mb-3"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs truncate">{item.cliente}</h4>
          <Badge variant="outline" className={`text-[8px] px-1 h-3.5 ${item.tipo === "Entrega" ? "text-blue-500 border-blue-100 bg-blue-50/30" : "text-orange-500 border-orange-100 bg-orange-50/30"}`}>
            {item.tipo}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5" /> {item.endereco}
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-muted-foreground hover:text-red-500"
        onClick={() => onRemove(id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

const AgendarRota = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedItems = useMemo(() => {
    return selectedIds.map(id => mockPendentes.find(i => i.id === id)!).filter(Boolean);
  }, [selectedIds]);

  const toggleItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedIds((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      toast.error("Selecione pelo menos um serviço para a rota.");
      return;
    }
    toast.success("Rota criada e agendada com sucesso!");
    setSelectedIds([]);
  };

  const filteredItems = mockPendentes.filter(i => 
    !selectedIds.includes(i.id) && (
      i.cliente.toLowerCase().includes(search.toLowerCase()) || 
      i.endereco.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Mocks para estatísticas
  const kmEstimados = selectedIds.length * 4.5;
  const litrosEstimados = (kmEstimados / 4.2).toFixed(1);
  const duracaoEstimada = selectedIds.length * 35;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Agendar Nova Rota" 
        subtitle="Organize as entregas e retiradas pendentes em um itinerário inteligente"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        {/* Coluna 1: Pendentes */}
        <div className="lg:col-span-3 h-full flex flex-col space-y-4">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Pendentes ({filteredItems.length})
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-8 h-8 text-xs bg-muted/50 border-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="group p-3 rounded-lg border bg-white hover:border-primary/50 transition-all cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-xs truncate flex-1">{item.cliente}</h4>
                        <Plus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mb-2">{item.endereco}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[8px] h-4 ${item.tipo === "Entrega" ? "text-blue-500 border-blue-100 bg-blue-50/50" : "text-orange-500 border-orange-100 bg-orange-50/50"}`}>
                          {item.tipo}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{item.modelo}</span>
                      </div>
                    </div>
                  ))}
                  {filteredItems.length === 0 && (
                    <div className="text-center py-10 opacity-40">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-[10px]">Tudo organizado!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2: Ordenação e Mapa */}
        <div className="lg:col-span-6 h-full flex flex-col space-y-4">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
              {/* Lista Ordenável */}
              <div className="border-r flex flex-col overflow-hidden bg-muted/10">
                <div className="p-4 border-b bg-white">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    Itinerário Sugerido
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1">Arraste para reorganizar a ordem de parada</p>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                  <ScrollArea className="h-full pr-3">
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={selectedIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {selectedItems.map((item, index) => (
                          <SortableItem 
                            key={item.id} 
                            id={item.id} 
                            item={item} 
                            index={index}
                            onRemove={toggleItem}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    {selectedIds.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                        <Plus className="h-10 w-10 mb-2" />
                        <p className="text-xs">Selecione itens à esquerda para começar</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>

              {/* Mini Mapa */}
              <div className="h-full relative bg-muted">
                <MapContainer 
                  center={[-20.8113, -49.3758]} 
                  zoom={12} 
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {selectedItems.map((item, idx) => (
                    <Marker 
                      key={item.id} 
                      position={item.posicao} 
                      icon={createSequenceIcon(idx + 1)}
                    >
                      <Popup>
                        <div className="p-1">
                          <p className="font-bold text-xs">{item.cliente}</p>
                          <p className="text-[10px]">{item.endereco}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {selectedItems.length > 1 && (
                    <Polyline 
                      positions={selectedItems.map(i => i.posicao)} 
                      color="#3b82f6" 
                      weight={3} 
                      opacity={0.6} 
                      dashArray="8, 8" 
                    />
                  )}
                </MapContainer>
                
                {/* Overlay Estatísticas Mockadas */}
                <div className="absolute bottom-4 left-4 right-4 z-[1000] grid grid-cols-3 gap-2">
                  <div className="bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border flex flex-col items-center">
                    <TrendingUp className="h-3 w-3 text-primary mb-1" />
                    <span className="text-[10px] font-bold">{kmEstimados} km</span>
                    <span className="text-[8px] text-muted-foreground">Distância</span>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border flex flex-col items-center">
                    <Fuel className="h-3 w-3 text-orange-500 mb-1" />
                    <span className="text-[10px] font-bold">{litrosEstimados} L</span>
                    <span className="text-[8px] text-muted-foreground">Combustível</span>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border flex flex-col items-center">
                    <Clock className="h-3 w-3 text-blue-500 mb-1" />
                    <span className="text-[10px] font-bold">{Math.floor(duracaoEstimada / 60)}h {duracaoEstimada % 60}m</span>
                    <span className="text-[8px] text-muted-foreground">Duração</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna 3: Configurações e Envio */}
        <div className="lg:col-span-3 h-full flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Dados da Rota
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between p-4">
              <form onSubmit={handleCreateRoute} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nome" className="text-xs">Identificação</Label>
                  <Input id="nome" placeholder="Ex: Rota Sul - Manhã" className="h-8 text-xs" required />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Motorista</Label>
                  <Select required>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">João Silva</SelectItem>
                      <SelectItem value="2">Ricardo Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Veículo</Label>
                  <Select required>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">ABC-1234 (MB)</SelectItem>
                      <SelectItem value="2">XYZ-9876 (VW)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="data" className="text-xs">Data Programada</Label>
                  <Input id="data" type="date" className="h-8 text-xs" required />
                </div>

                {selectedItems.some(i => i.tipo === "Retirada") && (
                  <div className="space-y-1.5 pt-2 border-t">
                    <Label className="text-xs">Destino Final</Label>
                    <Select required>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Ecoponto / Aterro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Ecoponto Municipal</SelectItem>
                        <SelectItem value="2">Aterro Regional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form>

              <div className="pt-4 space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-medium">Pontos Totais</span>
                  <Badge variant="default" className="h-5 px-2">{selectedIds.length}</Badge>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gap-2 h-10 text-sm font-bold shadow-lg shadow-primary/20"
                  onClick={handleCreateRoute}
                  disabled={selectedIds.length === 0}
                >
                  Confirmar Agendamento
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgendarRota;
