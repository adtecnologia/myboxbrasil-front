import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Ocorrencia = Database["public"]["Tables"]["ocorrencias_frota"]["Row"];
type Veiculo = Database["public"]["Tables"]["veiculos"]["Row"];

const GRAVIDADES = ["Leve", "Média", "Grave", "Crítica"] as const;
const STATUSES = ["Aberta", "Em Análise", "Resolvida"] as const;

const OcorrenciasFrota = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const [items, setItems] = useState<Ocorrencia[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ocorrencia | null>(null);

  const refresh = async () => {
    const [{ data: ocorr }, { data: veics }] = await Promise.all([
      supabase.from("ocorrencias_frota").select("*").order("data_ocorrencia", { ascending: false }),
      supabase.from("veiculos").select("*").order("placa"),
    ]);
    setItems((ocorr ?? []) as Ocorrencia[]);
    setVeiculos((veics ?? []) as Veiculo[]);
  };

  useEffect(() => { if (userId) refresh(); }, [userId]);

  const placaDe = (id: string) => veiculos.find((v) => v.id === id)?.placa ?? "—";

  const filtered = items.filter((v) => {
    const placa = placaDe(v.veiculo_id).toLowerCase();
    return placa.includes(search.toLowerCase()) || (v.tipo ?? "").toLowerCase().includes(search.toLowerCase());
  });

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const payload = {
      locador_id: userId,
      veiculo_id: f.veiculo_id,
      data_ocorrencia: f.data_ocorrencia,
      tipo: f.tipo || null,
      descricao: f.descricao || null,
      gravidade: f.gravidade,
      status: f.status,
    };
    const { error } = editing
      ? await supabase.from("ocorrencias_frota").update(payload).eq("id", editing.id)
      : await supabase.from("ocorrencias_frota").insert(payload);
    if (error) return toast.error("Erro: " + error.message);
    toast.success(editing ? "Atualizado!" : "Cadastrado!");
    setDialogOpen(false); setEditing(null); refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta ocorrência?")) return;
    const { error } = await supabase.from("ocorrencias_frota").delete().eq("id", id);
    if (error) return toast.error("Erro: " + error.message);
    toast.success("Excluída"); refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Ocorrências da Frota</h1>
          <p className="text-sm text-white/75">Registro e controle de incidentes com veículos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0"><Plus className="mr-2 h-4 w-4" /> Nova Ocorrência</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nova"} Ocorrência</DialogTitle></DialogHeader>
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
                  <Label htmlFor="data_ocorrencia">Data</Label>
                  <Input id="data_ocorrencia" name="data_ocorrencia" type="date" defaultValue={editing?.data_ocorrencia ?? new Date().toISOString().slice(0, 10)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Input id="tipo" name="tipo" defaultValue={editing?.tipo ?? ""} placeholder="Ex.: Avaria Mecânica" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gravidade">Gravidade</Label>
                  <Select name="gravidade" defaultValue={editing?.gravidade ?? "Leve"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{GRAVIDADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editing?.status ?? "Aberta"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
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

      <DataTable<Ocorrencia>
        title={`${totalItems} ocorrências registradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          { header: "Data", accessor: (o) => new Date(o.data_ocorrencia).toLocaleDateString("pt-BR") },
          { header: "Veículo", accessor: (o) => placaDe(o.veiculo_id) },
          { header: "Tipo", accessor: (o) => o.tipo ?? "—" },
          { 
            header: "Gravidade", 
            accessor: (o) => (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                o.gravidade === 'Crítica' ? 'bg-red-100 text-red-700' :
                o.gravidade === 'Grave' ? 'bg-orange-100 text-orange-700' :
                o.gravidade === 'Média' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {o.gravidade}
              </span>
            )
          },
          { 
            header: "Status", 
            accessor: (o) => (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                o.status === 'Resolvida' ? 'bg-emerald-100 text-emerald-700' :
                o.status === 'Em Análise' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'
              }`}>
                {o.status}
              </span>
            )
          },
        ]}
        actions={(o) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shadow-sm" onClick={() => { setEditing(o); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg text-destructive shadow-sm" onClick={() => handleDelete(o.id)}><Trash2 className="h-4 w-4" /></Button>
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

export default OcorrenciasFrota;