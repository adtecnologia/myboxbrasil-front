import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  FileText,
  FileCheck,
  FileClock,
  AlertCircle,
  Search,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  Settings,
  CalendarClock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

type DocRow = {
  id: string;
  numero: string | null;
  data_emissao: string | null;
  created_at: string | null;
  ordem_locacao_unidade_id: string | null;
  gerador_nome: string | null;
};

type LicencaVencendo = {
  id: string;
  nome: string | null;
  data_vencimento: string;
  cidade: string | null;
  estado: string | null;
  responsavel: string | null;
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const PainelDocumentos = () => {
  const user = useAuthStore((s) => s.user);
  const activeProfileType = useAuthStore((s) => s.activeProfileType)();
  const [loading, setLoading] = useState(true);
  const [mtrs, setMtrs] = useState<DocRow[]>([]);
  const [cdfs, setCdfs] = useState<DocRow[]>([]);
  const [licencasVencendo, setLicencasVencendo] = useState<LicencaVencendo[]>([]);

  const isDestino = activeProfileType === "destino";
  const isLocador = activeProfileType === "locador";
  const isLocatario = activeProfileType === "locatario";
  const isPrefeitura = activeProfileType === "prefeitura";
  const isRecebido = isLocatario || isPrefeitura;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const cols = "id, numero, data_emissao, created_at, ordem_locacao_unidade_id, gerador_nome";
        let mtrQ = supabase.from("mtr").select(cols).order("data_emissao", { ascending: false });
        let cdfQ = supabase.from("cdf").select(cols).order("data_emissao", { ascending: false });

        if (activeProfileType === "locatario") {
          mtrQ = mtrQ.eq("locatario_id", user.id);
          cdfQ = cdfQ.eq("locatario_id", user.id);
        } else if (activeProfileType === "locador") {
          mtrQ = mtrQ.eq("locador_id", user.id);
          cdfQ = cdfQ.eq("locador_id", user.id);
        } else if (activeProfileType === "destino") {
          mtrQ = mtrQ.eq("destino_final_id", user.id);
          cdfQ = cdfQ.eq("destino_final_id", user.id);
        } else if (activeProfileType === "prefeitura") {
          const { data: prof } = await supabase
            .from("profiles")
            .select("cidade, estado")
            .eq("id", user.id)
            .maybeSingle();
          const cidade = prof?.cidade ?? "";
          const estado = prof?.estado ?? "";
          mtrQ = mtrQ.ilike("obra_cidade", cidade).ilike("obra_estado", estado);
          cdfQ = cdfQ.ilike("obra_cidade", cidade).ilike("obra_estado", estado);
        }

        const [{ data: mt, error: me }, { data: cd, error: ce }] = await Promise.all([mtrQ, cdfQ]);
        if (me) throw me;
        if (ce) throw ce;
        if (cancelled) return;
        setMtrs((mt ?? []) as DocRow[]);
        setCdfs((cd ?? []) as DocRow[]);

        // Licenças vencendo em 30 dias
        if (
          activeProfileType === "locador" ||
          activeProfileType === "destino" ||
          activeProfileType === "admin" ||
          activeProfileType === "prefeitura"
        ) {
          const in30 = new Date();
          in30.setDate(in30.getDate() + 30);
          let licQ = supabase
            .from("documentos_licenca_cidade")
            .select("id, nome, data_vencimento, licenca_cidade!inner(user_id, cidade, estado)")
            .not("data_vencimento", "is", null)
            .lte("data_vencimento", in30.toISOString().slice(0, 10))
            .gte("data_vencimento", new Date().toISOString().slice(0, 10));
          if (activeProfileType === "prefeitura") {
            const { data: prof } = await supabase
              .from("profiles")
              .select("cidade, estado")
              .eq("id", user.id)
              .maybeSingle();
            licQ = licQ
              .ilike("licenca_cidade.cidade", prof?.cidade ?? "")
              .ilike("licenca_cidade.estado", prof?.estado ?? "");
          }
          const { data: lics } = await licQ;
          const filtered = (lics ?? []).filter((l: any) => {
            if (activeProfileType === "admin" || activeProfileType === "prefeitura") return true;
            return l.licenca_cidade?.user_id === user.id;
          });
          const ownerIds = Array.from(
            new Set(filtered.map((l: any) => l.licenca_cidade?.user_id).filter(Boolean)),
          );
          let ownerMap = new Map<string, string>();
          if (ownerIds.length > 0) {
            const { data: profs } = await supabase
              .from("profiles")
              .select("id, nome")
              .in("id", ownerIds);
            (profs ?? []).forEach((p: any) => {
              ownerMap.set(p.id, p.nome || "");
            });
          }
          if (!cancelled)
            setLicencasVencendo(
              filtered.map((l: any) => ({
                id: l.id,
                nome: l.nome,
                data_vencimento: l.data_vencimento,
                cidade: l.licenca_cidade?.cidade ?? null,
                estado: l.licenca_cidade?.estado ?? null,
                responsavel: ownerMap.get(l.licenca_cidade?.user_id) ?? null,
              })),
            );
        } else {
          setLicencasVencendo([]);
        }
      } catch (e: any) {
        toast.error("Erro ao carregar painel: " + (e?.message ?? "desconhecido"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user, activeProfileType]);

  const stats = useMemo(() => {
    const now = Date.now();
    const in30 = now - 30 * 24 * 60 * 60 * 1000;
    const emitidosSrc = isDestino ? cdfs : isLocador ? mtrs : [...mtrs, ...cdfs];
    const emitidos30 = emitidosSrc.filter((d) => {
      const t = new Date(d.data_emissao ?? d.created_at ?? "").getTime();
      return !isNaN(t) && t >= in30;
    }).length;
    const cdfIds = new Set(cdfs.map((c) => c.ordem_locacao_unidade_id).filter(Boolean));
    const pendentes = mtrs.filter((m) => m.ordem_locacao_unidade_id && !cdfIds.has(m.ordem_locacao_unidade_id)).length;
    return { emitidos30, cdfsConcluidos: cdfs.length, pendentes };
  }, [mtrs, cdfs, isDestino, isLocador]);

  const dataTipos = useMemo(
    () =>
      isDestino
        ? [
            { name: "CDF", value: cdfs.length, color: "#8b5cf6" },
            { name: "Licenças", value: licencasVencendo.length, color: "#10b981" },
          ]
        : isLocatario
        ? [
            { name: "MTR", value: mtrs.length, color: "#3b82f6" },
            { name: "CDF", value: cdfs.length, color: "#8b5cf6" },
          ]
        : [
            { name: "MTR", value: mtrs.length, color: "#3b82f6" },
            { name: "CDF", value: cdfs.length, color: "#8b5cf6" },
            { name: "NF", value: 0, color: "#f59e0b" },
            { name: "Licenças", value: licencasVencendo.length, color: "#10b981" },
          ],
    [mtrs.length, cdfs.length, licencasVencendo.length, isDestino, isLocatario]
  );

  const dataEmissoes = useMemo(() => {
    const buckets: { name: string; valor: number; key: string }[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      buckets.push({
        name: MESES[d.getMonth()],
        valor: 0,
        key: `${d.getFullYear()}-${d.getMonth()}`,
      });
    }
    const src = isDestino ? cdfs : isLocador ? mtrs : [...mtrs, ...cdfs];
    src.forEach((row) => {
      const t = new Date(row.data_emissao ?? row.created_at ?? "");
      if (isNaN(t.getTime())) return;
      const key = `${t.getFullYear()}-${t.getMonth()}`;
      const b = buckets.find((x) => x.key === key);
      if (b) b.valor += 1;
    });
    return buckets;
  }, [mtrs, cdfs, isDestino, isLocador]);

  const recentes = useMemo(() => {
    const arr = isDestino
      ? cdfs.map((c) => ({ ...c, tipo: "CDF" as const }))
      : [
          ...mtrs.map((m) => ({ ...m, tipo: "MTR" as const })),
          ...cdfs.map((c) => ({ ...c, tipo: "CDF" as const })),
        ];
    return arr
      .sort((a, b) => (b.data_emissao ?? b.created_at ?? "").localeCompare(a.data_emissao ?? a.created_at ?? ""))
      .slice(0, 5);
  }, [mtrs, cdfs, isDestino]);

  const fmtDate = (v: string | null) => {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando painel...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Documentos"
        subtitle="Controle e monitoramento de MTRs, CDFs e documentação legal"
      />

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isLocatario ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isRecebido ? "Total Recebidos" : "Total Emitidos"}
              </p>
              <h3 className="text-3xl font-bold">{stats.emitidos30}</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isLocador || isRecebido ? "CDFs Recebidos" : "CDFs Concluídos"}
              </p>
              <h3 className="text-3xl font-bold text-emerald-600">{stats.cdfsConcluidos}</h3>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">
              {stats.cdfsConcluidos === 0 ? "Sem dados" : isLocador || isRecebido ? "Total recebido" : "Total emitido"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <FileClock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isDestino ? "CDFs Pendentes" : "MTRs Pendentes"}
              </p>
              <h3 className="text-3xl font-bold text-orange-600">{stats.pendentes}</h3>
            </div>
            <p className="text-[10px] text-orange-500 font-medium">
              {stats.pendentes === 0 ? "Sem pendências" : "Aguardando CDF"}
            </p>
          </CardContent>
        </Card>

        {!isLocatario && <Card>
          <CardContent className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vencimento Licenças</p>
              <h3 className="text-3xl font-bold text-red-600">{licencasVencendo.length}</h3>
            </div>
            <p className="text-[10px] text-red-500 font-medium">
              {licencasVencendo.length === 0 ? "Sem vencimentos" : "Próximos 30 dias"}
            </p>
          </CardContent>
        </Card>}
      </div>

      {(activeProfileType === "locador" || activeProfileType === "destino" || activeProfileType === "admin" || activeProfileType === "prefeitura") && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-red-600" />
                  Vencimento de Licenças
                </CardTitle>
                <CardDescription>Documentos com vencimento nos próximos 30 dias</CardDescription>
              </div>
              {activeProfileType !== "prefeitura" && (
              <Button size="sm" variant="outline" asChild>
                <Link to="/dashboard/configuracoes">
                  <Settings className="h-4 w-4 mr-2" />
                  Gerenciar
                </Link>
              </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {licencasVencendo.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum documento de licença com vencimento nos próximos 30 dias.
              </p>
            ) : (
              <div className="space-y-2">
                {licencasVencendo.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{l.nome ?? "Documento"}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.responsavel ? `${l.responsavel} · ` : ""}
                        {l.cidade ?? "—"}
                        {l.estado ? `/${l.estado}` : ""}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-red-600 whitespace-nowrap">
                      {fmtDate(l.data_vencimento)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Distribuição por Tipo</CardTitle>
                <CardDescription>Volume de documentos gerados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataTipos} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {dataTipos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {dataTipos.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-muted-foreground">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Histórico de Emissão</CardTitle>
                <CardDescription>Volume mensal de documentos</CardDescription>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataEmissoes}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Documentos Recentes</CardTitle>
            <CardDescription>Últimas emissões do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum documento emitido.</p>
              )}
              {recentes.map((item) => (
                <div key={`${item.tipo}-${item.id}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.numero ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.tipo} · {item.gerador_nome ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">{fmtDate(item.data_emissao ?? item.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-3">
            <Button className="h-14 justify-start gap-4 px-4 text-base" asChild>
              <Link to="/dashboard/documentos/listagem">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Search className="h-5 w-5" />
                </div>
                Consultar Documentos
              </Link>
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelDocumentos;