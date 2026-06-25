import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Search, 
  MapPin, 
  Calendar,
  Clock,
  Filter,
  Eye,
  User,
  Truck,
  Package,
  FileText,
  Image as ImageIcon,
  History,
  Map as MapIcon,
  Navigation
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/components/DataPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Ocorrencia {
  id: string;
  data: string;
  tipo: "Rota" | "Caçamba";
  subtipo: string;
  fiscal: string;
  locador: string;
  locatario?: string;
  local: string;
  status: "Pendente" | "Resolvida" | "Em Análise";
  gravidade: "Baixa" | "Média" | "Alta";
  descricao: string;
  fotos: string[];
  // Campos específicos de Rota
  residuosEncontrados?: string;
  rotasRelacionadas?: { id: string; locador: string; horarioEntrega: string; horarioRetirada: string }[];
  // Campos específicos de Caçamba
  cacambaId?: string;
  ordemLocacao?: {
    id: string;
    vencimento: string;
    status: string;
    dataInicio: string;
  };
}

const mockOcorrencias: Ocorrencia[] = [];

const Ocorrencias = () => {
  const [search, setSearch] = useState("");
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(mockOcorrencias, 10);

  // Centro padrão: São José do Rio Preto
  const defaultCenter: [number, number] = [-20.8113, -49.3758];
  
  // Coordenadas simuladas por tipo
  const getCoordinates = (ocr: Ocorrencia | null): [number, number] => {
    if (!ocr) return defaultCenter;
    if (ocr.id === "OCR-001") return [-20.8113, -49.3758];
    if (ocr.id === "OCR-002") return [-20.8150, -49.3800];
    return [-20.8200, -49.3700];
  };

  const polyline1: [number, number][] = [
    [-20.8100, -49.3700],
    [-20.8113, -49.3758],
    [-20.8150, -49.3800]
  ];

  const polyline2: [number, number][] = [
    [-20.8200, -49.3700],
    [-20.8113, -49.3758],
    [-20.8050, -49.3850]
  ];

  const gravidadeColor = {
    "Baixa": "bg-blue-100 text-blue-700",
    "Média": "bg-yellow-100 text-yellow-700",
    "Alta": "bg-red-100 text-red-700"
  };

  const statusColor = {
    "Pendente": "bg-orange-100 text-orange-700",
    "Resolvida": "bg-green-100 text-green-700",
    "Em Análise": "bg-blue-100 text-blue-700"
  };

  const handleDetails = (ocr: Ocorrencia) => {
    setSelectedOcorrencia(ocr);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <div>
          <h1 className="text-2xl font-bold italic">Ocorrências</h1>
          <p className="text-sm text-white/75">Gestão de incidentes e fiscalização</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="ID, Local..." className="pl-9 h-9 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Tipo</label>
              <Select>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Rota">Rota</SelectItem>
                  <SelectItem value="Caçamba">Caçamba</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Status</label>
              <Select>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Análise">Em Análise</SelectItem>
                  <SelectItem value="Resolvida">Resolvida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Gravidade</label>
              <Select>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Fiscal</label>
              <Select>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Carlos Lima">Carlos Lima</SelectItem>
                  <SelectItem value="Ana Paula">Ana Paula</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" /> Sem registros
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Em Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Resolvidas (Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <DataTable<Ocorrencia>
        title="Listagem de Ocorrências"
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "ID", accessor: "id", className: "font-medium" },
          { header: "Data", accessor: "data" },
          { 
            header: "Tipo", 
            accessor: (o) => (
              <Badge variant="outline" className="gap-1">
                {o.tipo === "Rota" ? <Truck className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                {o.tipo}
              </Badge>
            )
          },
          { header: "Fiscal", accessor: "fiscal" },
          { header: "Locador", accessor: "locador" },
          { 
            header: "Gravidade", 
            accessor: (o) => (
              <Badge className={`${gravidadeColor[o.gravidade]} border-0 font-medium`}>
                {o.gravidade}
              </Badge>
            )
          },
          { 
            header: "Status", 
            accessor: (o) => (
              <Badge className={`${statusColor[o.status]} border-0 font-medium`}>
                {o.status}
              </Badge>
            )
          },
        ]}
        actions={(o) => (
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDetails(o)}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
        pagination={{
          totalItems,
          pageSize,
          currentPage,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize
        }}
      />

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] text-primary-foreground">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 w-full text-left">
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2 text-primary-foreground">
                    Detalhes da Ocorrência - {selectedOcorrencia?.id}
                    {selectedOcorrencia && (
                      <Badge className="bg-white/20 text-white border-0 font-medium">
                        {selectedOcorrencia.status}
                      </Badge>
                    )}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-white/80">
                  {selectedOcorrencia?.tipo} - {selectedOcorrencia?.subtipo}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedOcorrencia && (
            <ScrollArea className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Informações Gerais */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Data/Hora</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        {selectedOcorrencia.data}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Fiscal Responsável</p>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-primary" />
                        {selectedOcorrencia.fiscal}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Localização Geográfica</p>
                    <div className="aspect-video w-full rounded-lg bg-muted relative overflow-hidden border z-0">
                      <MapContainer 
                        center={getCoordinates(selectedOcorrencia)} 
                        zoom={15} 
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={false}
                      >
                        <MapResizer />
                        <TileLayer
                          attribution='&copy; OpenStreetMap contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={getCoordinates(selectedOcorrencia)}>
                          <Popup>
                            <div className="text-xs font-bold">Local da Ocorrência</div>
                            <div className="text-[10px]">{selectedOcorrencia.local}</div>
                          </Popup>
                        </Marker>

                        {selectedOcorrencia.tipo === "Rota" && (
                          <>
                            <Polyline positions={polyline1} color="hsl(var(--primary))" weight={4} opacity={0.6} />
                            <Polyline positions={polyline2} color="#3b82f6" weight={4} opacity={0.6} />
                          </>
                        )}
                      </MapContainer>
                      
                      {selectedOcorrencia.tipo === "Rota" && (
                        <div className="absolute bottom-2 left-2 z-[1000] bg-background/90 p-1.5 rounded border text-[9px] shadow-sm">
                          <p className="font-bold mb-1">Rotas no Perímetro</p>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-0.5 bg-primary" /> Rota {selectedOcorrencia.rotasRelacionadas?.[0]?.id}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-0.5 bg-blue-500" /> Rota {selectedOcorrencia.rotasRelacionadas?.[1]?.id}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {selectedOcorrencia.local}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Evidências (Fotos)</p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedOcorrencia.fotos.map((_, i) => (
                        <div key={i} className="aspect-square rounded-md bg-muted flex items-center justify-center border border-dashed relative overflow-hidden group cursor-zoom-in">
                          <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Descrição do Fiscal</p>
                    <div className="p-3 rounded-lg bg-muted/50 text-sm border">
                      {selectedOcorrencia.descricao}
                    </div>
                  </div>
                </div>

                {/* Informações Contextuais */}
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border bg-card space-y-4">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" />
                      Dados do Contexto
                    </h3>

                    {selectedOcorrencia.tipo === "Caçamba" ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Identificação Caçamba</p>
                            <Badge variant="secondary" className="font-bold">{selectedOcorrencia.cacambaId}</Badge>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Locador Responsável</p>
                            <p className="text-sm font-medium">{selectedOcorrencia.locador}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Locatário (Cliente)</p>
                            <p className="text-sm font-medium">{selectedOcorrencia.locatario}</p>
                          </div>
                          
                          {selectedOcorrencia.ordemLocacao && (
                            <div className="pt-3 border-t mt-3 space-y-3">
                              <p className="text-[10px] font-bold text-primary uppercase">Dados da Ordem de Locação</p>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <p className="text-[10px] text-muted-foreground uppercase">Nº Ordem</p>
                                  <p className="text-xs font-bold">{selectedOcorrencia.ordemLocacao.id}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-muted-foreground uppercase">Status</p>
                                  <Badge variant="outline" className="text-[10px] h-5">
                                    {selectedOcorrencia.ordemLocacao.status}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-muted-foreground uppercase">Início</p>
                                  <p className="text-xs">{selectedOcorrencia.ordemLocacao.dataInicio}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-muted-foreground uppercase">Vencimento</p>
                                  <p className="text-xs font-bold text-destructive">
                                    {selectedOcorrencia.ordemLocacao.vencimento}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Resíduos Detectados</p>
                          <p className="text-sm">{selectedOcorrencia.residuosEncontrados}</p>
                        </div>
                        
                        <div className="space-y-3 pt-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Rotas Vinculadas ao Período (Clique para ver Ordens)</p>
                          <div className="space-y-2">
                            {selectedOcorrencia.rotasRelacionadas?.map((rota) => (
                              <Dialog key={rota.id}>
                                <DialogTrigger asChild>
                                  <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-primary">{rota.id}</span>
                                      <span className="text-muted-foreground font-medium">{rota.locador}</span>
                                    </div>
                                    <div className="flex gap-4 pt-1">
                                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> E: {rota.horarioEntrega}</span>
                                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> R: {rota.horarioRetirada}</span>
                                    </div>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Ordens da Rota {rota.id}</DialogTitle>
                                    <DialogDescription>
                                      Detalhamento das ordens de locação vinculadas a esta rota. Selecione para notificar {rota.locador}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="rounded-md border overflow-hidden">
                                      <Table>
                                        <TableHeader className="bg-muted/50">
                                          <TableRow>
                                            <TableHead className="w-12 text-center">Sel.</TableHead>
                                            <TableHead className="text-xs uppercase font-bold">Ordem/Pedido</TableHead>
                                            <TableHead className="text-xs uppercase font-bold">Gerador (Obra)</TableHead>
                                            <TableHead className="text-xs uppercase font-bold">Locatário</TableHead>
                                            <TableHead className="text-xs uppercase font-bold">Resíduos</TableHead>
                                            <TableHead className="text-xs uppercase font-bold">Vencimento</TableHead>
                                            <TableHead className="text-xs uppercase font-bold text-center">Status</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          <TableRow>
                                            <TableCell className="text-center"><Checkbox id="ord1" /></TableCell>
                                            <TableCell>
                                              <div className="flex flex-col">
                                                <span className="font-bold text-xs">ORD-9921</span>
                                                <span className="text-[10px] text-muted-foreground">PED-2039</span>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex flex-col">
                                                <span className="font-medium text-xs">Residencial Solar</span>
                                                <span className="text-[10px] text-muted-foreground">Av. Brasil, 100</span>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-xs">Construtora Alpha</TableCell>
                                            <TableCell>
                                              <Badge variant="secondary" className="text-[9px] h-4">Classe A</Badge>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-destructive">25/05/2026</TableCell>
                                            <TableCell className="text-center">
                                              <Badge className="text-[9px] h-4 bg-green-100 text-green-700 border-0">Ativa</Badge>
                                            </TableCell>
                                          </TableRow>
                                          <TableRow>
                                            <TableCell className="text-center"><Checkbox id="ord2" /></TableCell>
                                            <TableCell>
                                              <div className="flex flex-col">
                                                <span className="font-bold text-xs">ORD-8854</span>
                                                <span className="text-[10px] text-muted-foreground">PED-2045</span>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex flex-col">
                                                <span className="font-medium text-xs">Edifício Mar</span>
                                                <span className="text-[10px] text-muted-foreground">Rua das Ostras, 50</span>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-xs">Engenharia Beta</TableCell>
                                            <TableCell>
                                              <Badge variant="secondary" className="text-[9px] h-4">Classe B</Badge>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold">28/05/2026</TableCell>
                                            <TableCell className="text-center">
                                              <Badge className="text-[9px] h-4 bg-green-100 text-green-700 border-0">Ativa</Badge>
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </div>
                                    <Button className="w-full">Notificar Locador sobre Ordens Selecionadas</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Notificar Locador</Button>
                    <Button variant="outline" className="flex-1">Gerar PDF</Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ocorrencias;
