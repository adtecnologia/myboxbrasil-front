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

type Gravidade = "Leve" | "Média" | "Grave" | "Crítica";
type Status = "Aberta" | "Em Análise" | "Resolvida";
type AtivoTipo = "cacamba" | "equipamento";

interface OcorrenciaRow {
  id: string;
  data_ocorrencia: string;
  ativo_tipo: AtivoTipo;
  ativo_id: string | null;
  ativo_codigo: string | null;
  tipo: string | null;
  descricao: string | null;
  gravidade: Gravidade;
  status: Status;
}

interface AtivoOption { id: string; label: string; tipo: AtivoTipo }

const emptyForm = {
  ativoKey: "",
  data_ocorrencia: new Date().toISOString().slice(0, 10),
  tipo: "",
  descricao: "",
  gravidade: "Leve" as Gravidade,
  status: "Aberta" as Status,
};

const OcorrenciasAtivos = () => {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<OcorrenciaRow[]>([]);
  const [ativos, setAtivos] = useState<AtivoOption[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OcorrenciaRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const [{ data: ocor }, { data: cs }, { data: eq }] = await Promise.all([
      supabase.from("ocorrencias_ativos").select("*").order("data_ocorrencia", { ascending: false }),
      supabase.from("cacambas").select("id, modelo, cores"),
      supabase.from("equipamentos").select("id, nome"),
    ]);
    setItems((ocor ?? []) as OcorrenciaRow[]);
    const list: AtivoOption[] = [
      ...((cs ?? []).map((c: any) => ({ id: c.id, tipo: "cacamba" as AtivoTipo, label: `Caçamba — ${c.modelo}${c.cores ? " (" + c.cores + ")" : ""}` }))),
      ...((eq ?? []).map((e: any) => ({ id: e.id, tipo: "equipamento" as AtivoTipo, label: `Equipamento — ${e.nome}` }))),
    ];
    setAtivos(list);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (o: OcorrenciaRow) => {
    setEditing(o);
    setForm({
      ativoKey: o.ativo_id ? `${o.ativo_tipo}:${o.ativo_id}` : "",
      data_ocorrencia: o.data_ocorrencia,
      tipo: o.tipo ?? "",
      descricao: o.descricao ?? "",
      gravidade: o.gravidade,
      status: o.status,
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
      data_ocorrencia: form.data_ocorrencia,
      tipo: form.tipo,
      descricao: form.descricao,
      gravidade: form.gravidade,
      status: form.status,
    };
    const { error } = editing
      ? await supabase.from("ocorrencias_ativos").update(payload).eq("id", editing.id)
      : await supabase.from("ocorrencias_ativos").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Ocorrência atualizada!" : "Ocorrência registrada!");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("ocorrencias_ativos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Ocorrência removida.");
    load();
  };

  const filtered = items.filter((v) =>
    (v.ativo_codigo ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (v.tipo ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Ocorrências de Ativos" subtitle="Registro e controle de incidentes com caçambas e equipamentos">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nova Ocorrência</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Editar Ocorrência" : "Nova Ocorrência"}</DialogTitle></DialogHeader>
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
                  <Input type="date" value={form.data_ocorrencia} onChange={(e) => setForm({ ...form, data_ocorrencia: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Input value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="Ex: Avaria" />
                </div>
                <div className="space-y-1.5">
                  <Label>Gravidade</Label>
                  <Select value={form.gravidade} onValueChange={(v) => setForm({ ...form, gravidade: v as Gravidade })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(["Leve","Média","Grave","Crítica"] as Gravidade[]).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(["Aberta","Em Análise","Resolvida"] as Status[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Descrição</Label>
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

      <DataTable<OcorrenciaRow>
        title={`${totalItems} ocorrências registradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Data", accessor: (o) => new Date(o.data_ocorrencia).toLocaleDateString() },
          { header: "Ativo", accessor: (o) => o.ativo_codigo ?? "—" },
          { header: "Tipo", accessor: (o) => o.tipo ?? "—" },
          {
            header: "Gravidade",
            accessor: (o) => (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                o.gravidade === 'Crítica' ? 'bg-red-100 text-red-700' :
                o.gravidade === 'Grave' ? 'bg-orange-100 text-orange-700' :
                o.gravidade === 'Média' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
              }`}>{o.gravidade}</span>
            ),
          },
          {
            header: "Status",
            accessor: (o) => (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                o.status === 'Resolvida' ? 'bg-emerald-100 text-emerald-700' :
                o.status === 'Em Análise' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'
              }`}>{o.status}</span>
            ),
          },
        ]}
        actions={(o) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(o)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(o.id)}><Trash2 className="h-4 w-4" /></Button>
          </>
        )}
        pagination={{ totalItems, pageSize, currentPage, onPageChange: setCurrentPage, onPageSizeChange: setPageSize }}
      />
    </div>
  );
};

export default OcorrenciasAtivos;