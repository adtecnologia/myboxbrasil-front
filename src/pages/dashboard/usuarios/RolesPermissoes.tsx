import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Shield, Lock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";

interface RolePermission {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

interface Role {
  id: string;
  nome: string;
  descricao: string;
  isFixed: boolean;
  entidadeAlvo: "Todos" | "Locatários" | "Prefeituras" | "Destinadores" | "Locadores";
  permissoes: RolePermission[];
}

const tiposEntidade = ["Todos", "Locatários", "Prefeituras", "Destinadores", "Locadores"];

const modulosPadrao = [
  "Operacional",
  "Entidades",
  "Ativos",
  "Documentos",
  "Financeiro",
  "Relatórios",
  "Configurações",
  "LGPD",
  "Usuários"
];

const mockRoles: Role[] = [
  { 
    id: "1", 
    nome: "Administrador", 
    descricao: "Acesso total ao sistema e configurações críticas.", 
    isFixed: true,
    entidadeAlvo: "Todos",
    permissoes: modulosPadrao.map(m => ({ module: m, read: true, write: true, delete: true }))
  },
  { 
    id: "2", 
    nome: "Operador", 
    descricao: "Gestão operacional do dia a dia, sem acesso financeiro.", 
    isFixed: true,
    entidadeAlvo: "Todos",
    permissoes: modulosPadrao.map(m => ({ 
      module: m, 
      read: true, 
      write: m === "Operacional" || m === "Ativos", 
      delete: false 
    }))
  },
  { 
    id: "3", 
    nome: "Financeiro", 
    descricao: "Acesso restrito ao módulo financeiro e relatórios.", 
    isFixed: false,
    entidadeAlvo: "Todos",
    permissoes: modulosPadrao.map(m => ({ 
      module: m, 
      read: m === "Financeiro" || m === "Relatórios", 
      write: m === "Financeiro", 
      delete: false 
    }))
  },
];

const RolesPermissoes = () => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const isMobile = useIsMobile();

  const filtered = roles.filter((r) =>
    r.nome.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? {
        ...r,
        nome: form.get("nome") as string,
        descricao: form.get("descricao") as string,
        entidadeAlvo: form.get("entidadeAlvo") as Role["entidadeAlvo"],
      } : r));
    } else {
      const nova: Role = {
        id: String(Date.now()),
        nome: form.get("nome") as string,
        descricao: form.get("descricao") as string,
        entidadeAlvo: form.get("entidadeAlvo") as Role["entidadeAlvo"],
        isFixed: false,
        permissoes: modulosPadrao.map(m => ({ module: m, read: true, write: false, delete: false }))
      };
      setRoles([nova, ...roles]);
    }
    
    setDialogOpen(false);
    setEditingRole(null);
  };

  const handleDelete = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Perfis e Permissões</h1>
          <p className="text-sm text-white/75">Defina o que cada tipo de usuário pode acessar</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingRole(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Novo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingRole ? "Editar Perfil" : "Cadastrar Perfil"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Perfil</Label>
                  <Input id="nome" name="nome" defaultValue={editingRole?.nome} required disabled={editingRole?.isFixed} placeholder="Ex: Supervisor" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entidadeAlvo">Entidade Alvo</Label>
                  <Select name="entidadeAlvo" defaultValue={editingRole?.entidadeAlvo || "Locatários"} disabled={editingRole?.isFixed}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a entidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEntidade.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input id="descricao" name="descricao" defaultValue={editingRole?.descricao} required disabled={editingRole?.isFixed} placeholder="Ex: Responsável pela equipe..." />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm border-b pb-2">Matriz de Permissões</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Módulo</TableHead>
                        <TableHead className="text-center">Visualizar</TableHead>
                        <TableHead className="text-center">Criar/Editar</TableHead>
                        <TableHead className="text-center">Excluir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modulosPadrao.map((modulo) => {
                        const perm = editingRole?.permissoes.find(p => p.module === modulo);
                        return (
                          <TableRow key={modulo}>
                            <TableCell className="font-medium">{modulo}</TableCell>
                            <TableCell className="text-center">
                              <Checkbox checked={perm?.read} disabled={editingRole?.isFixed} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox checked={perm?.write} disabled={editingRole?.isFixed} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox checked={perm?.delete} disabled={editingRole?.isFixed} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <DialogFooter>
                {!editingRole?.isFixed && (
                  <Button type="submit" className="w-full sm:w-auto">{editingRole ? "Salvar Alterações" : "Cadastrar Perfil"}</Button>
                )}
                {editingRole?.isFixed && (
                  <p className="text-xs text-muted-foreground italic text-center w-full">Perfis de sistema (Fixos) não podem ser alterados.</p>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Role>
        title={`${roles.length} perfis configurados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Perfil",
            accessor: (r) => (
              <div className="flex flex-col">
                <span className="font-medium text-sm">{r.nome}</span>
                <span className="text-[10px] text-primary/70 font-semibold uppercase">{r.entidadeAlvo}</span>
              </div>
            ),
            className: "w-1/4",
          },
          { header: "Descrição", accessor: "descricao", className: "text-sm text-muted-foreground" },
          {
            header: "Tipo",
            accessor: (r) => (
              r.isFixed ? (
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 gap-1">
                  <Lock className="h-3 w-3" /> Fixo
                </Badge>
              ) : (
                <Badge variant="outline" className="text-primary border-primary/20">Livre</Badge>
              )
            ),
            align: "center",
            className: "w-32",
          },
        ]}
        renderMobileCard={(r) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    {r.nome}
                    {r.isFixed && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{r.descricao}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => {
                setEditingRole(r);
                setDialogOpen(true);
              }}>
                <Pencil className="mr-1 h-3 w-3" /> {r.isFixed ? "Visualizar" : "Editar"}
              </Button>
              {!r.isFixed && (
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] text-destructive" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="mr-1 h-3 w-3" /> Excluir
                </Button>
              )}
            </div>
          </div>
        )}
        actions={(r) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => {
              setEditingRole(r);
              setDialogOpen(true);
            }} title={r.isFixed ? "Visualizar" : "Editar"}>
              <Pencil className="h-4 w-4" />
            </Button>
            {!r.isFixed && (
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" onClick={() => handleDelete(r.id)} title="Excluir">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
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

export default RolesPermissoes;
