
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
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

type Pendente = {
  id: string;
  cliente: string;
  endereco: string;
  tipo: "Entrega" | "Retirada";
  modelo: string;
  data: string;
  posicao: [number, number];
};

type Motorista = { id: string; nome: string };
type VeiculoOpt = { id: string; label: string };

function useLocadorId() {
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore(
    (s) => s.activeProfile() ?? s.user?.profiles[0] ?? null
  );
  const rawTenant = activeProfile?.tenantId;
  return rawTenant && rawTenant !== "self" ? rawTenant : user?.id;
}

function useMotoristas(): Motorista[] {
  const locadorId = useLocadorId();
  const { data = [] } = useQuery({
    queryKey: ["motoristas", locadorId],
    enabled: !!locadorId,
    queryFn: async (): Promise<Motorista[]> => {
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
      return (profs ?? []).map((p: any) => ({ id: p.id, nome: p.nome }));
    },
  });
  return data;
}

function useVeiculosAtivos(): VeiculoOpt[] {
  const locadorId = useLocadorId();
  const { data = [] } = useQuery({
    queryKey: ["veiculos-ativos", locadorId],
    enabled: !!locadorId,
    queryFn: async (): Promise<VeiculoOpt[]> => {
      const { data, error } = await supabase
        .from("veiculos")
        .select("id, placa, marca, modelo")
        .eq("locador_id", locadorId!)
        .eq("ativo", true)
        .order("placa");
      if (error) throw error;
      return (data ?? []).map((v: any) => ({
        id: v.id,
        label: `${v.placa}${v.marca || v.modelo ? ` (${[v.marca, v.modelo].filter(Boolean).join(" ")})` : ""}`,
      }));
    },
  });
  return data;
}

function usePendentesEntrega(): Pendente[] {
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore(
    (s) => s.activeProfile() ?? s.user?.profiles[0] ?? null
  );
  const rawTenant = activeProfile?.tenantId;
  const locadorId =
    rawTenant && rawTenant !== "self" ? rawTenant : user?.id;

  const { data = [] } = useQuery({
    queryKey: ["agendar-rota-pendentes", locadorId],
    enabled: !!locadorId,
    queryFn: async (): Promise<Pendente[]> => {
      const { data: rows, error } = await supabase
        .from("ordem_locacao_unidades")
        .select(
          `id, status, created_at,
           cacamba_unidades ( codigo, cacambas ( modelo ) ),
           ordens_locacao!inner (
             id, equipment_type,
             obras ( rua, numero, bairro, cidade, estado ),
             pedido_fornecedores!inner (
               id, status, locador_id,
               pedidos!inner ( id, locatario_id )
             )
           )`
        )
        .eq("status", "entrega_pendente")
        .eq("ordens_locacao.pedido_fornecedores.locador_id", locadorId!);
      if (error) throw error;

      const aceitos = (rows ?? []).filter(
        (r: any) => r.ordens_locacao?.pedido_fornecedores?.status === "aceito"
      );

      // Remove unidades que já estão em alguma rota
      const unidadeIds = aceitos.map((r: any) => r.id);
      const jaEmRota = new Set<string>();
      if (unidadeIds.length) {
        const { data: existentes } = await supabase
          .from("rota_itens")
          .select("ordem_locacao_unidade_id")
          .in("ordem_locacao_unidade_id", unidadeIds);
        (existentes ?? []).forEach((x: any) =>
          jaEmRota.add(x.ordem_locacao_unidade_id)
        );
      }
      const disponiveis = aceitos.filter((r: any) => !jaEmRota.has(r.id));

      const locIds = Array.from(
        new Set(
          disponiveis
            .map((r: any) => r.ordens_locacao?.pedido_fornecedores?.pedidos?.locatario_id)
            .filter(Boolean)
        )
      );
      const nomes = new Map<string, string>();
      if (locIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nome")
          .in("id", locIds as string[]);
        (profs ?? []).forEach((p: any) => nomes.set(p.id, p.nome));
      }

      return disponiveis.map((r: any, idx: number): Pendente => {
        const ol = r.ordens_locacao ?? {};
        const pf = ol.pedido_fornecedores ?? {};
        const ped = pf.pedidos ?? {};
        const obra = ol.obras ?? {};
        const cu = r.cacamba_unidades ?? {};
        const cac = cu.cacambas ?? {};
        const endereco = obra
          ? [
              [obra.rua, obra.numero].filter(Boolean).join(", "),
              obra.bairro,
              [obra.cidade, obra.estado].filter(Boolean).join("/"),
            ]
              .filter(Boolean)
              .join(" - ")
          : "—";
        // pseudo-posicionamento determinístico ao redor de SJRP
        const h = r.id.split("").reduce((a: number, c: string) => (a * 31 + c.charCodeAt(0)) | 0, 0);
        const center: [number, number] = [-20.8113, -49.3758];
        const dLat = ((Math.abs(h) % 1000) / 1000 - 0.5) * 0.06;
        const dLng = (((Math.abs(h) >> 10) % 1000) / 1000 - 0.5) * 0.06;
        return {
          id: r.id,
          cliente: nomes.get(ped.locatario_id) ?? "—",
          endereco,
          tipo: "Entrega",
          modelo: cac.modelo ?? ol.equipment_type ?? "—",
          data: r.created_at ? new Date(r.created_at).toLocaleDateString("pt-BR") : "",
          posicao: [center[0] + dLat, center[1] + dLng],
        };
      });
    },
  });
  return data;
}

interface SortableItemProps {
  id: string;
  item: Pendente;
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
  const pendentes = usePendentesEntrega();
  const motoristas = useMotoristas();
  const veiculos = useVeiculosAtivos();
  const locadorId = useLocadorId();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [motoristaId, setMotoristaId] = useState<string>("");
  const [veiculoId, setVeiculoId] = useState<string>("");
  const [dataProgramada, setDataProgramada] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedItems = useMemo(() => {
    return selectedIds.map(id => pendentes.find(i => i.id === id)!).filter(Boolean);
  }, [selectedIds, pendentes]);

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

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      toast.error("Selecione pelo menos um serviço para a rota.");
      return;
    }
    if (!motoristaId || !veiculoId || !dataProgramada) {
      toast.error("Preencha motorista, veículo e data.");
      return;
    }
    if (!locadorId) return;

    try {
      setSaving(true);
      const { data: rota, error: rotaErr } = await supabase
        .from("rotas")
        .insert({
          locador_id: locadorId,
          motorista_id: motoristaId,
          veiculo_id: veiculoId,
          data_programada: dataProgramada,
          status: "agendada",
        })
        .select("id")
        .single();
      if (rotaErr || !rota) throw rotaErr ?? new Error("Erro ao criar rota");

      const itens = selectedIds.map((id, idx) => {
        const it = pendentes.find((p) => p.id === id);
        return {
          rota_id: rota.id,
          ordem_locacao_unidade_id: id,
          sequencia: idx + 1,
          tipo: it?.tipo ?? "Entrega",
        };
      });
      const { error: itensErr } = await supabase.from("rota_itens").insert(itens);
      if (itensErr) throw itensErr;

      const { error: updErr } = await supabase
        .from("ordem_locacao_unidades")
        .update({ status: "em_transito_locacao" })
        .in("id", selectedIds);
      if (updErr) throw updErr;

      toast.success("Rota criada e agendada com sucesso!");
      setSelectedIds([]);
      setMotoristaId("");
      setVeiculoId("");
      setDataProgramada("");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar rota");
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = pendentes.filter(i => 
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
                  <Select required value={motoristaId} onValueChange={setMotoristaId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={motoristas.length ? "Selecione" : "Nenhum motorista"} />
                    </SelectTrigger>
                    <SelectContent>
                      {motoristas.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Veículo</Label>
                  <Select required value={veiculoId} onValueChange={setVeiculoId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={veiculos.length ? "Selecione" : "Nenhum veículo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {veiculos.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="data" className="text-xs">Data Programada</Label>
                  <Input id="data" type="date" className="h-8 text-xs" required value={dataProgramada} onChange={(e) => setDataProgramada(e.target.value)} />
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
                  disabled={selectedIds.length === 0 || saving}
                >
                  {saving ? "Salvando..." : "Confirmar Agendamento"}
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
