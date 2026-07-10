import { useEffect, useMemo, useState } from "react";
import { Plus, Truck, Calendar, Weight, Ruler, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

const tiposResiduo = ["Classe A", "Classe B", "Classe C", "Classe D"];
const classesResiduo = ["Inertes", "Recicláveis", "Não recicláveis", "Perigosos"];

interface Entrada {
  id: string;
  placa: string;
  dataHora: string;
  dataHoraIso: string | null;
  cliente: string;
  transportador: string;
  tipoResiduo: string;
  volume: number;
  peso: number;
  status: string;
}

const statusColor: Record<string, string> = {
  "Recebido": "bg-blue-100 text-blue-700",
  "Destinado": "bg-green-100 text-green-700",
};

const Operacional = () => {
  const user = useAuthStore((s) => s.user);
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: mtrs, error } = await supabase
          .from("mtr")
          .select(
            "id, veiculo_placa, gerador_nome, transportador_nome, ordem_locacao_unidade_id, mtr_itens(classe_nome, peso_kg, volume_m3), ordem_locacao_unidades!inner(status, destino_final_confirmado_em)",
          )
          .eq("destino_final_id", user.id)
          .in("ordem_locacao_unidades.status", ["aguardando_analise", "cdf_emitido"]);
        if (error) throw error;

        if (cancelled) return;
        setEntradas(
          (mtrs ?? [])
            .map((m: any) => {
              const olu = m.ordem_locacao_unidades;
              const itens = m.mtr_itens ?? [];
              const peso = itens.reduce((a: number, i: any) => a + Number(i.peso_kg ?? 0), 0);
              const volume = itens.reduce((a: number, i: any) => a + Number(i.volume_m3 ?? 0), 0);
              const tipos = Array.from(new Set(itens.map((i: any) => i.classe_nome).filter(Boolean))) as string[];
              const dt = olu?.destino_final_confirmado_em ?? null;
              return {
                id: m.id,
                placa: m.veiculo_placa ?? "—",
                dataHora: dt ? new Date(dt).toLocaleString("pt-BR") : "—",
                dataHoraIso: dt,
                cliente: m.gerador_nome ?? "—",
                transportador: m.transportador_nome ?? "—",
                tipoResiduo: tipos.length ? tipos.join(", ") : "—",
                volume: Math.round(volume * 100) / 100,
                peso: Math.round(peso),
                status: olu?.status === "cdf_emitido" ? "Destinado" : "Recebido",
              };
            })
            .sort((a: any, b: any) => (b.dataHoraIso ?? "").localeCompare(a.dataHoraIso ?? "")),
        );
      } catch (e: any) {
        toast.error("Erro ao carregar entradas: " + (e?.message ?? "desconhecido"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = entradas.filter(
    (e) =>
      e.cliente.toLowerCase().includes(search.toLowerCase()) ||
      e.transportador.toLowerCase().includes(search.toLowerCase()) ||
      e.placa.toLowerCase().includes(search.toLowerCase()),
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDialogOpen(false);
    toast.info("Registro manual será integrado à emissão de MTR.");
  };

  const stats = useMemo(() => {
    const hoje = new Date().toDateString();
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    let entradasHoje = 0;
    let volumeTotal = 0;
    let pesoTotal = 0;
    let mes = 0;
    entradas.forEach((e) => {
      const d = (e as any).dataHoraIso ? new Date((e as any).dataHoraIso) : null;
      if (d && d.toDateString() === hoje) entradasHoje += 1;
      if (d && d.getMonth() === mesAtual && d.getFullYear() === anoAtual) mes += 1;
      volumeTotal += e.volume;
      pesoTotal += e.peso;
    });
    return { entradasHoje, volumeTotal, pesoTotal, mes };
  }, [entradas]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Entrada de Resíduos</h1>
          <p className="text-sm text-white/75">Módulo Operacional — Registro de entradas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0"><Plus className="mr-2 h-4 w-4" /> Nova Entrada</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Entrada de Resíduo</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="cliente">Cliente</Label><Input id="cliente" name="cliente" required placeholder="Nome do cliente" /></div>
                <div className="space-y-2"><Label htmlFor="transportador">Transportador</Label><Input id="transportador" name="transportador" required placeholder="Transportador" /></div>
                <div className="space-y-2"><Label htmlFor="gerador">Gerador</Label><Input id="gerador" name="gerador" required placeholder="Gerador" /></div>
                <div className="space-y-2">
                  <Label htmlFor="tipoResiduo">Tipo de Resíduo</Label>
                  <Select name="tipoResiduo" required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{tiposResiduo.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classeResiduo">Classe</Label>
                  <Select name="classeResiduo" required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{classesResiduo.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="volume">Volume (m³)</Label><Input id="volume" name="volume" type="number" step="0.1" required placeholder="0" /></div>
                <div className="space-y-2"><Label htmlFor="peso">Peso (kg)</Label><Input id="peso" name="peso" type="number" required placeholder="0" /></div>
              </div>
              <DialogFooter><Button type="submit" className="w-full sm:w-auto">Registrar Entrada</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Entradas hoje" value={stats.entradasHoje} icon={Truck} />
        <StatCard label="Volume total" value={`${stats.volumeTotal.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} m³`} icon={Ruler} />
        <StatCard label="Peso total" value={`${stats.pesoTotal.toLocaleString("pt-BR")} kg`} icon={Weight} />
        <StatCard label="Este mês" value={stats.mes} icon={Calendar} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando entradas...
        </div>
      ) : (
      <DataTable<Entrada>
        title="Entradas recentes"
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Placa", accessor: "placa", className: "font-medium" },
          { header: "Data/Hora", accessor: "dataHora", className: "text-sm" },
          { header: "Cliente", accessor: "cliente" },
          { header: "Transportador", accessor: "transportador" },
          { header: "Tipo", accessor: "tipoResiduo" },
          { header: "Vol.", accessor: (e) => `${e.volume} m³` },
          { header: "Peso", accessor: (e) => `${e.peso.toLocaleString()} kg` },
          { 
            header: "Status", 
            accessor: (e) => (
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[e.status] || ""}`}>
                {e.status}
              </span>
            ) 
          },
        ]}
        renderMobileCard={(e) => (
          <div className="rounded-lg border border-border bg-background p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">{e.cliente}</p>
                <p className="text-xs text-muted-foreground">{e.placa} · {e.dataHora}</p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[e.status] || ""}`}>{e.status}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Transp: {e.transportador}</span>
              <span>Tipo: {e.tipoResiduo}</span>
            </div>
            <div className="flex gap-4 text-xs font-medium text-foreground pt-1">
              <span>{e.volume} m³</span>
              <span>{e.peso.toLocaleString()} kg</span>
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
      )}
    </div>
  );
};

export default Operacional;
