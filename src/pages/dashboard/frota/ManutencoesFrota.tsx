import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Manutencao = Database["public"]["Tables"]["manutencoes_frota"]["Row"];
type Veiculo = Database["public"]["Tables"]["veiculos"]["Row"];

const TIPOS = ["Preventiva", "Corretiva", "Revisão"] as const;
const STATUSES = ["Agendada", "Em Execução", "Concluída"] as const;

const ManutencoesFrota = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const [items, setItems] = useState<Manutencao[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Manutencao | null>(null);

  const refresh = async () => {
    const [{ data: m }, { data: v }] = await Promise.all([
      supabase.from("manutencoes_frota").select("*").order("data_manutencao", { ascending: false }),
      supabase.from("veiculos").select("*").order("placa"),
    ]);
    setItems((m ?? []) as Manutencao[]);
    setVeiculos((v ?? []) as Veiculo[]);
  };

  useEffect(() => { if (userId) refresh(); }, [userId]);

  const placaDe = (id: string) => veiculos.find((v) => v.id === id)?.placa ?? "—";

  const filtered = items.filter((v) =>
    placaDe(v.veiculo_id).toLowerCase().includes(search.toLowerCase()) ||
    (v.descricao ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const payload = {
      locador_id: userId,
      veiculo_id: f.veiculo_id,
      data_manutencao: f.data_manutencao,
      tipo: f.tipo,
      descricao: f.descricao || null,
      valor: f.valor ? Number(f.valor) : null,
      km: f.km ? Number(f.km) : null,
      oficina: f.oficina || null,
      status: f.status,
    };
    const { error } = editing
      ? await supabase.from("manutencoes_frota").update(payload).eq("id", editing.id)
      : await supabase.from("manutencoes_frota").insert(payload);
    if (error) return toast.error("Erro: " + error.message);
    toast.success(editing ? "Atualizado!" : "Cadastrado!");
    setDialogOpen(false); setEditing(null); refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta manutenção?")) return;
    const { error } = await supabase.from("manutencoes_frota").delete().eq("id", id);
    if (error) return toast.error("Erro: " + error.message);
    toast.success("Excluída"); refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Manutenções</h1>
          <p className="text-sm text-white/75">Controle de manutenções preventivas e corretivas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0"><Plus className="mr-2 h-4 w-4" /> Nova Manutenção</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nova"} Manutenção</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="veiculo_id">Veículo</Label>
                  <Select name="veiculo_id" defaultValue={editing?.veiculo_id} required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {veiculos.map((v) => <SelectItem key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_manutencao">Data</Label>
                  <Input id="data_manutencao" name="data_manutencao" type="date" defaultValue={editing?.data_manutencao ?? new Date().toISOString().slice(0, 10)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select name="tipo" defaultValue={editing?.tipo ?? "Preventiva"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editing?.status ?? "Agendada"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="km">KM</Label>
                  <Input id="km" name="km" type="number" defaultValue={editing?.km ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input id="valor" name="valor" type="number" step="0.01" defaultValue={editing?.valor ?? ""} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="oficina">Oficina</Label>
                  <Input id="oficina" name="oficina" defaultValue={editing?.oficina ?? ""} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" name="descricao" defaultValue={editing?.descricao ?? ""} rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editing ? "Salvar" : "Cadastrar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Manutencao>
        title={`${totalItems} manutenções registradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Data", accessor: (m) => new Date(m.data_manutencao).toLocaleDateString("pt-BR") },
          { header: "Veículo", accessor: (m) => placaDe(m.veiculo_id) },
          { 
            header: "Tipo", 
            accessor: (m) => (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                m.tipo === 'Preventiva' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {m.tipo}
              </span>
            )
          },
          { header: "Serviço", accessor: (m) => m.descricao ?? "—" },
          { header: "KM", accessor: (m) => m.km ? m.km.toLocaleString() : "—" },
          { 
            header: "Valor", 
            accessor: (m) => m.valor != null ? `R$ ${Number(m.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "—"
          },
          { 
            header: "Status", 
            accessor: (m) => (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                m.status === 'Concluída' ? 'bg-emerald-100 text-emerald-700' :
                m.status === 'Em Execução' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {m.status}
              </span>
            )
          },
        ]}
        actions={(m) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shadow-sm" onClick={() => { setEditing(m); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg text-destructive shadow-sm" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4" /></Button>
          </>
        )}
        pagination={{
          totalItems,
          pageSize,
          currentPage,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
};

export default ManutencoesFrota;