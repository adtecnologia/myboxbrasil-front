import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

type Tipo = "Preventiva" | "Corretiva" | "Pintura/Reforma";
type Status = "Agendada" | "Em Execução" | "Concluída";
type AtivoTipo = "cacamba" | "equipamento";

interface ManutRow {
  id: string;
  data_manutencao: string;
  ativo_tipo: AtivoTipo;
  ativo_id: string | null;
  ativo_codigo: string | null;
  tipo: Tipo;
  descricao: string | null;
  valor: number | null;
  status: Status;
}

interface AtivoOption { id: string; label: string; tipo: AtivoTipo }

const emptyForm = {
  ativoKey: "",
  data_manutencao: new Date().toISOString().slice(0, 10),
  tipo: "Preventiva" as Tipo,
  descricao: "",
  valor: "",
  status: "Agendada" as Status,
};

const ManutencoesAtivos = () => {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<ManutRow[]>([]);
  const [ativos, setAtivos] = useState<AtivoOption[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ManutRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const [{ data: rows }, { data: cs }, { data: eq }] = await Promise.all([
      supabase.from("manutencoes_ativos").select("*").order("data_manutencao", { ascending: false }),
      supabase.from("cacambas").select("id, modelo, cores"),
      supabase.from("equipamentos").select("id, nome"),
    ]);
    setItems((rows ?? []) as ManutRow[]);
    setAtivos([
      ...((cs ?? []).map((c: any) => ({ id: c.id, tipo: "cacamba" as AtivoTipo, label: `Caçamba — ${c.modelo}${c.cores ? " (" + c.cores + ")" : ""}` }))),
      ...((eq ?? []).map((e: any) => ({ id: e.id, tipo: "equipamento" as AtivoTipo, label: `Equipamento — ${e.nome}` }))),
    ]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (m: ManutRow) => {
    setEditing(m);
    setForm({
      ativoKey: m.ativo_id ? `${m.ativo_tipo}:${m.ativo_id}` : "",
      data_manutencao: m.data_manutencao,
      tipo: m.tipo,
      descricao: m.descricao ?? "",
      valor: m.valor != null ? String(m.valor) : "",
      status: m.status,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!user?.id) { toast.error("Sessão inválida."); return; }
    if (!form.ativoKey) { toast.error("Selecione o ativo."); return; }
    const [ativo_tipo, ativo_id] = form.ativoKey.split(":") as [AtivoTipo, string];
    const ativo_codigo = ativos.find((a) => a.id === ativo_id)?.label ?? null;
    const payload = {
      locador_id: user.id,
      ativo_tipo, ativo_id, ativo_codigo,
      data_manutencao: form.data_manutencao,
      tipo: form.tipo,
      descricao: form.descricao,
      valor: form.valor ? Number(String(form.valor).replace(",", ".")) : 0,
      status: form.status,
    };
    const { error } = editing
      ? await supabase.from("manutencoes_ativos").update(payload).eq("id", editing.id)
      : await supabase.from("manutencoes_ativos").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Manutenção atualizada!" : "Manutenção registrada!");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("manutencoes_ativos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Manutenção removida.");
    load();
  };

  const filtered = items.filter((v) =>
    (v.ativo_codigo ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (v.descricao ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Manutenções de Ativos" subtitle="Controle de reparos e reformas de caçambas e equipamentos">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nova Manutenção</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Editar Manutenção" : "Nova Manutenção"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Ativo *</Label>
                <Select value={form.ativoKey} onValueChange={(v) => setForm({ ...form, ativoKey: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o ativo" /></SelectTrigger>
                  <SelectContent>
                    {ativos.length === 0 ? <div className="px-2 py-1.5 text-xs text-muted-foreground">Nenhum ativo cadastrado</div> :
                      ativos.map((a) => <SelectItem key={`${a.tipo}:${a.id}`} value={`${a.tipo}:${a.id}`}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Data</Label>
                  <Input type="date" value={form.data_manutencao} onChange={(e) => setForm({ ...form, data_manutencao: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as Tipo })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(["Preventiva","Corretiva","Pintura/Reforma"] as Tipo[]).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Valor (R$)</Label>
                  <Input value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(["Agendada","Em Execução","Concluída"] as Status[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Descrição do serviço</Label>
                <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit}>{editing ? "Salvar" : "Registrar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <DataTable<ManutRow>
        title={`${totalItems} manutenções registradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Data", accessor: (m) => new Date(m.data_manutencao).toLocaleDateString() },
          { header: "Ativo", accessor: (m) => m.ativo_codigo ?? "—" },
          {
            header: "Tipo",
            accessor: (m) => (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                m.tipo === 'Preventiva' ? 'bg-blue-100 text-blue-700' :
                m.tipo === 'Corretiva' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
              }`}>{m.tipo}</span>
            ),
          },
          { header: "Serviço", accessor: (m) => m.descricao ?? "—" },
          { header: "Valor", accessor: (m) => `R$ ${(Number(m.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
          {
            header: "Status",
            accessor: (m) => (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                m.status === 'Concluída' ? 'bg-emerald-100 text-emerald-700' :
                m.status === 'Em Execução' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
              }`}>{m.status}</span>
            ),
          },
        ]}
        actions={(m) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
          </>
        )}
        pagination={{ totalItems, pageSize, currentPage, onPageChange: setCurrentPage, onPageSizeChange: setPageSize }}
      />
    </div>
  );
};

export default ManutencoesAtivos;