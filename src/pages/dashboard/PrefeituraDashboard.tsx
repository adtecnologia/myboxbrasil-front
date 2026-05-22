import { useEffect, useRef } from "react";
import {
  Recycle,
  Users,
  Container,
  PackageCheck,
  MapPin,
  Calendar,
  AlertTriangle,
  FileCheck2,
  Building2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const cacambasMes = months.map((m, i) => ({ name: m, value: i < 6 ? [42, 38, 51, 47, 63, 58][i] : 0 }));
const usuariosMes = months.map((m, i) => ({ name: m, value: i < 6 ? [3, 5, 4, 7, 6, 9][i] : 0 }));

const statCards = [
  { label: "Resíduos tratados", value: "22m³", icon: Recycle, change: "+12%", up: true },
  { label: "Locadores", value: 11, icon: Users, change: "+2", up: true, alert: true },
  { label: "Caçambas", value: 568, icon: Container, change: "+23", up: true },
  { label: "Caçambas locadas", value: 10, icon: PackageCheck, change: "-3", up: false },
  { label: "Destino final", value: 1, icon: MapPin, change: "0", up: true, alert: true },
];

const classeResiduos = [
  { name: "Classe A", value: 58, color: "hsl(142, 76%, 36%)" },
  { name: "Classe B", value: 22, color: "hsl(217, 91%, 60%)" },
  { name: "Classe C", value: 12, color: "hsl(47, 95%, 55%)" },
  { name: "Classe D", value: 8, color: "hsl(0, 84%, 60%)" },
];

const ocorrenciasRecentes = [
  { id: "OC-0421", local: "Vila Redentora", fiscal: "Carlos Souza", gravidade: "Alta", status: "Aberta", data: "Hoje 10:24" },
  { id: "OC-0420", local: "Jd. Maria Cândida", fiscal: "Ana Lima", gravidade: "Média", status: "Em análise", data: "Hoje 09:11" },
  { id: "OC-0419", local: "Jd. Soraia", fiscal: "Pedro Reis", gravidade: "Baixa", status: "Resolvida", data: "Ontem" },
  { id: "OC-0418", local: "Solo Sagrado", fiscal: "Carlos Souza", gravidade: "Alta", status: "Em análise", data: "Ontem" },
];

const gravidadeColor: Record<string, string> = {
  Alta: "bg-rose-500/10 text-rose-600 border-rose-200",
  Média: "bg-amber-500/10 text-amber-600 border-amber-200",
  Baixa: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
};
const statusColor: Record<string, string> = {
  "Aberta": "bg-rose-500/10 text-rose-600",
  "Em análise": "bg-amber-500/10 text-amber-600",
  "Resolvida": "bg-emerald-500/10 text-emerald-600",
};

const bairros = [
  { name: "Vila Redentora", count: 86, pct: 100 },
  { name: "Jd. Maria Cândida", count: 64, pct: 74 },
  { name: "Solo Sagrado", count: 41, pct: 48 },
  { name: "Jd. Soraia", count: 28, pct: 33 },
  { name: "Recanto do Lago", count: 17, pct: 20 },
];

const mtrCdf = [
  { label: "MTRs emitidos", value: 142, color: "text-primary", bg: "bg-primary/10" },
  { label: "CDFs emitidos", value: 128, color: "text-blue-600", bg: "bg-blue-500/10" },
  { label: "Pendentes", value: 14, color: "text-amber-600", bg: "bg-amber-500/10" },
];

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => ro.disconnect();
  }, [map]);
  return null;
};

const markers = [
  { pos: [-20.8113, -49.3758] as [number, number], label: "Vila Redentora - 12 caçambas" },
  { pos: [-20.8050, -49.3850] as [number, number], label: "Jd. Maria Cândida - 8 caçambas" },
  { pos: [-20.8200, -49.3650] as [number, number], label: "Solo Sagrado - 5 caçambas" },
  { pos: [-20.7980, -49.3700] as [number, number], label: "Jd. Soraia - 3 caçambas" },
];

const PrefeituraDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Painel da Prefeitura" subtitle="Fiscalização e gestão de resíduos sólidos">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/70 mr-1" />
          <Select defaultValue="5">
            <SelectTrigger className="w-[130px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="2026">
            <SelectTrigger className="w-[100px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label} className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-1">
                  {stat.alert && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-medium border-0 ${stat.up ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                    {stat.up ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {stat.change}
                  </Badge>
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Distribuição Geográfica</CardTitle>
              <CardDescription className="text-sm">Caçambas ativas no município</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold" onClick={() => navigate("/dashboard/rastreamento")}>
              Ver no mapa <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[320px] w-full">
            <MapContainer center={[-20.8113, -49.3758]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <MapResizer />
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {markers.map((m, i) => (
                <Marker key={i} position={m.pos}>
                  <Popup>{m.label}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Novas caçambas por mês / 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={cacambasMes}>
                <defs>
                  <linearGradient id="cacGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#cacGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Novos usuários por mês / 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={usuariosMes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip cursor={{ fill: "hsl(var(--muted)/0.3)" }} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Classe resíduos + MTR/CDF + Bairros */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resíduos por Classe</CardTitle>
            <CardDescription className="text-xs">Distribuição percentual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={classeResiduos} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {classeResiduos.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {classeResiduos.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-auto text-muted-foreground">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">MTR e CDF</CardTitle>
            <CardDescription className="text-xs">Status dos documentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {mtrCdf.map((m) => (
              <div key={m.label} className={`flex items-center justify-between rounded-lg p-3 ${m.bg}`}>
                <div className="flex items-center gap-3">
                  <FileCheck2 className={`h-5 w-5 ${m.color}`} />
                  <span className="text-sm font-medium text-foreground">{m.label}</span>
                </div>
                <span className={`text-xl font-bold ${m.color}`}>{m.value}</span>
              </div>
            ))}
            <Separator className="opacity-50" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Taxa de conformidade</span>
              <span className="font-bold text-primary">90.1%</span>
            </div>
            <Progress value={90} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Bairros</CardTitle>
            <CardDescription className="text-xs">Volume de locações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {bairros.map((b) => (
              <div key={b.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    {b.name}
                  </span>
                  <span className="font-bold">{b.count}</span>
                </div>
                <Progress value={b.pct} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Ocorrências recentes */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
                Ocorrências Recentes
              </CardTitle>
              <CardDescription className="text-sm">Fiscalizações nas últimas 48 horas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold" onClick={() => navigate("/dashboard/pedidos/ocorrencias")}>
              Ver todas <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {ocorrenciasRecentes.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center font-bold text-[10px] text-muted-foreground">
                    {o.id.split("-")[1]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{o.local}</p>
                    <p className="text-[11px] text-muted-foreground">Fiscal: {o.fiscal} · {o.data}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border-0 font-medium ${gravidadeColor[o.gravidade]}`}>
                    {o.gravidade}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border-0 font-medium ${statusColor[o.status]}`}>
                    {o.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrefeituraDashboard;
