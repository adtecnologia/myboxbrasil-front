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
import { Skeleton } from "@/components/ui/skeleton";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const CLASSE_COLORS = [
  "hsl(142, 76%, 36%)",
  "hsl(217, 91%, 60%)",
  "hsl(47, 95%, 55%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 65%, 55%)",
  "hsl(180, 65%, 45%)",
  "hsl(30, 90%, 55%)",
  "hsl(200, 20%, 45%)",
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

const MapRecenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 12);
  }, [center, map]);
  return null;
};

async function geocode(query: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

const PrefeituraDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const now = new Date();
  const [mes, setMes] = useState<string>(String(now.getMonth() + 1));
  const [ano, setAno] = useState<string>(String(now.getFullYear()));
  const [mapCenter, setMapCenter] = useState<[number, number]>([-15.7801, -47.9292]);
  const [mapMarkers, setMapMarkers] = useState<{ pos: [number, number]; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_prefeitura_dashboard" as any, {
        _mes: Number(mes),
        _ano: Number(ano),
      });
      if (!error) setData(data);
      setLoading(false);
    })();
  }, [mes, ano]);

  // Geocode a cidade da prefeitura e os bairros para o mapa
  useEffect(() => {
    const cidade = data?.cidade;
    const estado = data?.estado;
    if (!cidade || !estado) return;
    let cancelled = false;
    (async () => {
      const c = await geocode(`${cidade}, ${estado}, Brasil`);
      if (!cancelled && c) setMapCenter(c);

      // Busca obras com caçambas locadas / aguardando retirada / em trânsito para retirada
      const RELEVANT = ["locada", "aguardando_retirada", "em_transito_retirada"];
      const { data: obras } = await supabase
        .from("obras")
        .select("id, nome, rua, numero, bairro")
        .ilike("cidade", cidade)
        .ilike("estado", estado);
      const obraIds = (obras ?? []).map((o: any) => o.id);
      if (!obraIds.length) {
        if (!cancelled) setMapMarkers([]);
        return;
      }
      const { data: ordens } = await supabase
        .from("ordens_locacao")
        .select("id, obra_id")
        .in("obra_id", obraIds);
      const olIds = (ordens ?? []).map((o: any) => o.id);
      if (!olIds.length) {
        if (!cancelled) setMapMarkers([]);
        return;
      }
      const { data: unidades } = await supabase
        .from("ordem_locacao_unidades")
        .select("ordem_locacao_id, status")
        .in("ordem_locacao_id", olIds)
        .in("status", RELEVANT);
      const olToObra = new Map<string, string>((ordens ?? []).map((o: any) => [o.id, o.obra_id]));
      const obraById = new Map<string, any>((obras ?? []).map((o: any) => [o.id, o]));
      const perObra = new Map<string, { obra: any; locadas: number; aguardando: number; transito: number; total: number }>();
      (unidades ?? []).forEach((u: any) => {
        const obraId = olToObra.get(u.ordem_locacao_id);
        if (!obraId) return;
        const obra = obraById.get(obraId);
        if (!obra) return;
        const entry = perObra.get(obraId) ?? { obra, locadas: 0, aguardando: 0, transito: 0, total: 0 };
        if (u.status === "locada") entry.locadas += 1;
        else if (u.status === "aguardando_retirada") entry.aguardando += 1;
        else if (u.status === "em_transito_retirada") entry.transito += 1;
        entry.total += 1;
        perObra.set(obraId, entry);
      });

      const entries = Array.from(perObra.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 15);

      const results: { pos: [number, number]; label: string }[] = [];
      for (const e of entries) {
        const parts = [
          [e.obra.rua, e.obra.numero].filter(Boolean).join(", "),
          e.obra.bairro,
          cidade,
          estado,
          "Brasil",
        ].filter(Boolean);
        const q = parts.join(", ");
        const p = await geocode(q);
        if (p) {
          const detalhes = [
            e.locadas ? `${e.locadas} locada(s)` : null,
            e.aguardando ? `${e.aguardando} aguardando retirada` : null,
            e.transito ? `${e.transito} em trânsito p/ retirada` : null,
          ].filter(Boolean).join(" · ");
          results.push({ pos: p, label: `${e.obra.nome ?? "Obra"} — ${detalhes}` });
        }
      }
      if (!cancelled) setMapMarkers(results);
    })();
    return () => { cancelled = true; };
  }, [data?.cidade, data?.estado]);

  if (loading) {
    return (
      <div className="space-y-6 pb-10" aria-busy="true" aria-live="polite">
        <PageHeader title="Painel da Prefeitura" subtitle="Carregando dados do município...">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[130px] bg-white/20" />
            <Skeleton className="h-9 w-[100px] bg-white/20" />
          </div>
        </PageHeader>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-7 w-20 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Skeleton className="h-[320px] w-full rounded-none" />
          </CardContent>
        </Card>

        {/* Charts row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-44" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[240px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const topBairros: { bairro: string; count: number }[] = data?.top_bairros ?? [];
  const pedidosRecentes: any[] = data?.pedidos_recentes ?? [];
  const ordensPorMes: { mes: string; value: number }[] = data?.ordens_por_mes ?? [];
  const maxBairro = Math.max(1, ...topBairros.map((b) => b.count));
  const classesResiduoRaw: { nome: string; volume: number }[] = data?.classes_residuo ?? [];
  const totalVolClasses = classesResiduoRaw.reduce((acc, c) => acc + Number(c.volume ?? 0), 0);
  const classeResiduos = classesResiduoRaw.map((c, i) => ({
    name: c.nome,
    value: totalVolClasses > 0 ? Math.round((Number(c.volume) / totalVolClasses) * 100) : 0,
    volume: Number(c.volume ?? 0),
    color: CLASSE_COLORS[i % CLASSE_COLORS.length],
  }));

  const ordensMesChart = months.map((m, i) => {
    const key = `${new Date().getFullYear()}-${String(i + 1).padStart(2, "0")}`;
    const found = ordensPorMes.find((o) => o.mes === key);
    return { name: m, value: found?.value ?? 0 };
  });

  const statCards = [
    { label: "Resíduos tratados", value: `${Number(stats.residuos_m3 ?? 0).toFixed(0)}m³`, icon: Recycle, pending: 0, href: "/dashboard/relatorios/destinacao-residuos" },
    { label: "Locadores", value: stats.locadores ?? 0, icon: Users, pending: Number(stats.locadores_pendentes ?? 0), href: "/dashboard/locadores" },
    { label: "Caçambas", value: stats.cacambas ?? 0, icon: Container, pending: 0, href: "/dashboard/cacambas" },
    { label: "Caçambas locadas", value: stats.cacambas_locadas ?? 0, icon: PackageCheck, pending: 0, href: "/dashboard/pedidos/ordens" },
    { label: "Destino final", value: stats.destino_final ?? 0, icon: MapPin, pending: Number(stats.destino_final_pendentes ?? 0), href: "/dashboard/destinadores" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Painel da Prefeitura"
        subtitle={
          data?.cidade
            ? `${data.cidade}/${data.estado}`
            : "Cadastre a cidade no seu perfil para ver os dados"
        }
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/70 mr-1" />
          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger className="w-[130px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ano} onValueChange={setAno}>
            <SelectTrigger className="w-[100px] h-9 text-xs bg-white/15 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }).map((_, i) => {
                const y = now.getFullYear() - i;
                return <SelectItem key={y} value={String(y)}>{y}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            onClick={() => stat.href && navigate(stat.href)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && stat.href) { e.preventDefault(); navigate(stat.href); } }}
            className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                {stat.pending > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 px-1.5 gap-1 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400"
                    title={`${stat.pending} aguardando validação`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {stat.pending}
                  </Badge>
                )}
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
            <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
              <MapResizer />
              <MapRecenter center={mapCenter} />
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {mapMarkers.map((m, i) => (
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

      {/* Resíduos por Classe */}
      <div className="grid gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resíduos por Classe</CardTitle>
            <CardDescription className="text-xs">
              Distribuição por volume {totalVolClasses > 0 ? `· ${totalVolClasses.toFixed(1)}m³ total` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classeResiduos.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-10">
                Sem registros de resíduos no período.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-[240px_1fr] items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={classeResiduos} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                      {classeResiduos.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} formatter={(v: any, _n, p: any) => [`${v}% · ${p.payload.volume.toFixed(1)}m³`, p.payload.name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {classeResiduos.map((c) => (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="font-medium truncate">{c.name}</span>
                      <span className="ml-auto text-muted-foreground shrink-0">{c.value}% · {c.volume.toFixed(1)}m³</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                <Badge
                  variant="outline"
                  className={`text-[10px] px-2 py-0.5 border-0 font-medium ${
                    p.status === "aceito"
                      ? "bg-primary/10 text-primary"
                      : p.status === "aguardando_aceite"
                      ? "bg-amber-500/10 text-amber-600"
                      : p.status === "recusado"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {p.status === "aguardando_aceite"
                    ? "Aguardando aceite"
                    : p.status === "aceito"
                    ? "Aceito"
                    : p.status === "recusado"
                    ? "Recusado"
                    : p.status === "cancelado"
                    ? "Cancelado"
                    : p.status}
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
