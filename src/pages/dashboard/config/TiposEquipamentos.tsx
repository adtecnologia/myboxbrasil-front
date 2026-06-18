import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { useLocadorTable } from "@/hooks/useLocadorTable";

interface TipoEquipamento {
  id: string;
  foto_url?: string | null;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

const TiposEquipamentos = () => {
  const { rows: equipamentos, create, update, remove } = useLocadorTable<TipoEquipamento>("tipos_equipamentos");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquip, setEditingEquip] = useState<TipoEquipamento | null>(null);
  const isMobile = useIsMobile();

  const filtered = equipamentos.filter((e) =>
    e.nome.toLowerCase().includes(search.toLowerCase()) ||
    (e.descricao ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nome = form.get("tipo") as string;
    const descricao = form.get("descricao") as string;
    const ativo = (form.get("situacao") as string) === "Ativo";

    const ok = editingEquip
      ? await update(editingEquip.id, { nome, descricao, ativo })
      : await create({ nome, descricao, ativo });
    if (ok) {
      setDialogOpen(false);
      setEditingEquip(null);
    }
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const openEdit = (equip: TipoEquipamento) => {
    setEditingEquip(equip);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Tipos de Equipamentos</h1>
          <p className="text-sm text-white/75">Gestão de equipamentos operacionais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEquip(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Novo Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEquip ? "Editar Equipamento" : "Cadastrar Equipamento"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="foto">Foto do Equipamento</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden">
                    {editingEquip?.foto_url ? (
                      <img src={editingEquip.foto_url} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                    )}
                  </div>
                  <Input id="foto" name="foto" type="file" accept="image/*" className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Equipamento</Label>
                <Input id="tipo" name="tipo" defaultValue={editingEquip?.nome} required placeholder="Ex: Prensa Hidráulica" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" name="descricao" defaultValue={editingEquip?.descricao ?? ""} required placeholder="Descreva a finalidade..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="situacao">Situação</Label>
                <Select name="situacao" defaultValue={editingEquip ? (editingEquip.ativo ? "Ativo" : "Inativo") : "Ativo"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">{editingEquip ? "Salvar Alterações" : "Cadastrar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<TipoEquipamento>
        title={`${equipamentos.length} equipamentos cadastrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Foto",
            accessor: () => (
              <div className="h-10 w-10 mx-auto rounded bg-muted flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
              </div>
            ),
            align: "center",
            className: "w-16",
          },
          { header: "Tipo", accessor: "nome", className: "font-medium w-1/4" },
          { header: "Descrição", accessor: (e) => e.descricao ?? "", className: "text-muted-foreground" },
          {
            header: "Situação",
            accessor: (e) => (
              <Badge variant={e.ativo ? "default" : "secondary"}>
                {e.ativo ? "Ativo" : "Inativo"}
              </Badge>
            ),
            className: "w-24",
          },
        ]}
        renderMobileCard={(e) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 shrink-0 rounded bg-muted flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground truncate">{e.nome}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{e.descricao ?? ""}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(e)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="pt-1">
              <Badge variant={e.ativo ? "default" : "secondary"} className="text-[10px] h-5">
                {e.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        )}
        actions={(e) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => openEdit(e)} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" onClick={() => handleDelete(e.id)} title="Excluir">
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

export default TiposEquipamentos;