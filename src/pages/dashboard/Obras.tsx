import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, MapPin, Building2, Phone, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePagination } from "@/components/DataPagination";
import { ObraForm } from "@/components/dashboard/obras/ObraForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

interface Obra {
  id: string;
  nome: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string | null;
  cidade: string;
  estado: string;
  responsavel: string;
  telefone: string;
  dataInicio: string;
  dataFinalEstimada: string;
  status: "ativa" | "finalizada";
}

const formatDateBR = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const Obras = () => {
  const userId = useAuthStore((s) => s.session?.user.id);
  const [obras, setObras] = useState<Obra[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("obras")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar obras");
      return;
    }
    setObras(
      (data ?? []).map((o: any) => ({
        id: o.id,
        nome: o.nome,
        rua: o.rua,
        numero: o.numero,
        bairro: o.bairro,
        complemento: o.complemento,
        cidade: o.cidade,
        estado: o.estado,
        responsavel: o.responsavel,
        telefone: o.telefone,
        dataInicio: formatDateBR(o.data_inicio),
        dataFinalEstimada: formatDateBR(o.data_final_estimada),
        status: o.status,
      }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = obras.filter((o) =>
    o.nome.toLowerCase().includes(search.toLowerCase()) ||
    o.rua.toLowerCase().includes(search.toLowerCase()) ||
    o.cidade.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = async (data: any) => {
    if (!userId) {
      toast.error("Você precisa estar autenticado");
      return;
    }
    const payload = {
      user_id: userId,
      nome: data.nome,
      rua: data.rua,
      numero: data.numero,
      bairro: data.bairro,
      complemento: data.complemento || null,
      cidade: data.cidade,
      estado: data.estado,
      responsavel: data.responsavel,
      telefone: data.telefone,
      data_inicio: data.dataInicio,
      data_final_estimada: data.dataFinalEstimada,
    };
    if (editingObra) {
      const { error } = await supabase.from("obras").update(payload).eq("id", editingObra.id);
      if (error) return toast.error("Erro ao atualizar obra");
      toast.success("Obra atualizada");
    } else {
      const { error } = await supabase.from("obras").insert(payload);
      if (error) return toast.error("Erro ao cadastrar obra");
      toast.success("Obra cadastrada");
    }
    setDialogOpen(false);
    setEditingObra(null);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("obras").delete().eq("id", id);
    if (error) return toast.error("Erro ao excluir obra");
    toast.success("Obra excluída");
    load();
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Obras</h1>
          <p className="text-sm text-white/75">Gerencie seus canteiros de obras e locais de entrega</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingObra(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Nova Obra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingObra ? "Editar Obra" : "Cadastrar Nova Obra"}</DialogTitle>
            </DialogHeader>
            <div className="px-1">
              <ObraForm 
                onSave={handleSave} 
                initialData={editingObra} 
                submitLabel={editingObra ? "Salvar Alterações" : "Cadastrar Obra"} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Obra>
        title={`${obras.length} obras cadastradas`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, rua ou cidade..."
        columns={[
          {
            header: "Obra",
            accessor: (o) => (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm leading-none mb-1">{o.nome}</p>
                  <div className="flex items-center text-[10px] text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3" />
                    {o.rua}, {o.numero} - {o.bairro}, {o.cidade}/{o.estado}
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: "Responsável",
            accessor: (o) => (
              <div className="space-y-1">
                <p className="text-sm">{o.responsavel}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Phone className="mr-1 h-3 w-3" />
                  {o.telefone}
                </div>
              </div>
            ),
          },
          {
            header: "Cronograma",
            accessor: (o) => (
              <div className="space-y-1">
                <div className="flex items-center text-xs">
                  <Calendar className="mr-1.5 h-3 w-3 text-primary" />
                  <span className="text-muted-foreground mr-1">Início:</span> {o.dataInicio}
                </div>
                <div className="flex items-center text-xs">
                  <Clock className="mr-1.5 h-3 w-3 text-orange-500" />
                  <span className="text-muted-foreground mr-1">Fim est.:</span> {o.dataFinalEstimada}
                </div>
              </div>
            ),
          },
          {
            header: "Status",
            accessor: (o) => (
              <Badge variant={o.status === "ativa" ? "default" : "secondary"}>
                {o.status === "ativa" ? "Ativa" : "Finalizada"}
              </Badge>
            ),
          },
        ]}
        actions={(o) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
              setEditingObra(o);
              setDialogOpen(true);
            }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => handleDelete(o.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
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

export default Obras;
