import { useEffect, useRef, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

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
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_prefeitura_dashboard" as any);
      if (!error) setData(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <DashboardSkeleton title="Painel da Prefeitura" subtitle="Fiscalização e gestão de resíduos sólidos" statCount={5} />;
  }

  const stats = data?.stats ?? {};
  const topBairros: { bairro: string; count: number }[] = data?.top_bairros ?? [];
  const pedidosRecentes: any[] = data?.pedidos_recentes ?? [];
  const ordensPorMes: { mes: string; value: number }[] = data?.ordens_por_mes ?? [];
  const maxBairro = Math.max(1, ...topBairros.map((b) => b.count));

  const ordensMesChart = months.map((m, i) => {
    const key = `${new Date().getFullYear()}-${String(i + 1).padStart(2, "0")}`;
    const found = ordensPorMes.find((o) => o.mes === key);
    return { name: m, value: found?.value ?? 0 };
  });

  const statCards = [
    { label: "Resíduos tratados", value: `${Number(stats.residuos_m3 ?? 0).toFixed(0)}m³`, icon: Recycle },
    { label: "Locadores", value: stats.locadores ?? 0, icon: Users },
    { label: "Caçambas", value: stats.cacambas ?? 0, icon: Container },
    { label: "Caçambas locadas", value: stats.cacambas_locadas ?? 0, icon: PackageCheck },
    { label: "Destino final", value: stats.destino_final ?? 0, icon: MapPin },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Painel da Prefeitura"
        subtitle={
          data?.cidade
            ? `${data.cidade}/${data.estado} · ${stats.total_pedidos ?? 0} pedidos · ${stats.total_ordens ?? 0} ordens`
            : "Cadastre a cidade no seu perfil para ver os dados"
        }
      >
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
            <CardTitle className="text-base">Ordens por mês / {new Date().getFullYear()}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={ordensMesChart}>
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
            <CardTitle className="text-base">Top Bairros com Ordens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {topBairros.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">Nenhuma ordem encontrada para sua cidade.</p>
            )}
            {topBairros.map((b) => (
              <div key={b.bairro} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    {b.bairro}
                  </span>
                  <span className="font-bold">{b.count}</span>
                </div>
                <Progress value={(b.count / maxBairro) * 100} className="h-1.5" />
              </div>
            ))}
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

      {/* Pedidos recentes */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                Pedidos Recentes na Cidade
              </CardTitle>
              <CardDescription className="text-sm">Últimos pedidos com obras em {data?.cidade ?? "sua cidade"}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold" onClick={() => navigate("/dashboard/pedidos")}> 
              Ver todos <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {pedidosRecentes.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">Nenhum pedido encontrado para sua cidade.</div>
            )}
            {pedidosRecentes.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/dashboard/pedidos/${p.id}`)}
                className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                    #{p.numero}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.locatario_nome ?? "Locatário"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("pt-BR")} · R$ {Number(p.valor_total ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-0 font-medium bg-primary/10 text-primary">
                  {p.status}
                </Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrefeituraDashboard;
