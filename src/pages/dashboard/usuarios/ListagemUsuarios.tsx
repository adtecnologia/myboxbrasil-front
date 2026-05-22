import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination, usePagination } from "@/components/DataPagination";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import InputMask from "react-input-mask";

interface UsuarioTenant {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  documento: string;
  tipoDocumento: "cpf" | "cnpj";
  status: "ativo" | "inativo";
  ultimoAcesso: string;
}

const mockUsuarios: UsuarioTenant[] = [
  { id: "1", nome: "Admin do Sistema", email: "admin@empresa.com", perfil: "Administrador", status: "ativo", ultimoAcesso: "14/05/2026 10:30", documento: "123.456.789-00", tipoDocumento: "cpf" },
  { id: "2", nome: "Carlos Operador", email: "carlos@empresa.com", perfil: "Operador", status: "ativo", ultimoAcesso: "13/05/2026 15:45", documento: "11.222.333/0001-99", tipoDocumento: "cnpj" },
  { id: "3", nome: "Mariana Financeiro", email: "mariana@empresa.com", perfil: "Financeiro", status: "inativo", ultimoAcesso: "01/05/2026 09:00", documento: "987.654.321-11", tipoDocumento: "cpf" },
];

const ListagemUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioTenant[]>(mockUsuarios);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioTenant | null>(null);
  const [documento, setDocumento] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<"cpf" | "cnpj">("cpf");
  const [userFound, setUserFound] = useState<UsuarioTenant | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  const isMobile = useIsMobile();

  const filtered = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSearchDocument = () => {
    if (!documento) return;
    setIsSearching(true);
    
    // Simular busca
    setTimeout(() => {
      const found = usuarios.find(u => u.documento === documento);
      if (found) {
        setUserFound(found);
        setShowFullForm(false);
      } else {
        setUserFound(null);
        setShowFullForm(true);
      }
      setIsSearching(false);
    }, 600);
  };

  const handleEdit = (u: UsuarioTenant) => {
    setEditingUser(u);
    setDocumento(u.documento);
    setTipoDocumento(u.tipoDocumento);
    setUserFound(null);
    setShowFullForm(true);
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nome = form.get("nome") as string;
    const email = form.get("email") as string;
    const perfil = form.get("perfil") as string;
    const doc = form.get("documento") as string;
    const tipoDoc = form.get("tipoDocumento") as "cpf" | "cnpj";
    
    if (editingUser) {
      setUsuarios(usuarios.map(u => u.id === editingUser.id ? { 
        ...u, 
        nome: nome || u.nome, 
        email: email || u.email, 
        perfil, 
        documento: doc || u.documento, 
        tipoDocumento: tipoDoc || u.tipoDocumento 
      } : u));
    } else if (userFound) {
      setUsuarios(usuarios.map(u => u.id === userFound.id ? { ...u, perfil } : u));
    } else {
      const novo: UsuarioTenant = {
        id: Math.random().toString(36).substr(2, 9),
        nome,
        email,
        perfil,
        documento: doc,
        tipoDocumento: tipoDoc,
        status: "ativo",
        ultimoAcesso: "Nunca"
      };
      setUsuarios([novo, ...usuarios]);
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDocumento("");
    setTipoDocumento("cpf");
    setUserFound(null);
    setShowFullForm(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Gestão de Usuários</h1>
          <p className="text-sm text-white/75">Gerencie os usuários que acessam este ambiente</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuário" : "Cadastrar Usuário"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!editingUser && !userFound && !showFullForm && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Documento</Label>
                    <Select 
                      value={tipoDocumento} 
                      onValueChange={(value: "cpf" | "cnpj") => {
                        setTipoDocumento(value);
                        setDocumento("");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documento">{tipoDocumento === "cpf" ? "CPF" : "CNPJ"}</Label>
                    <div className="flex gap-2">
                      <InputMask
                        mask={tipoDocumento === "cpf" ? "999.999.999-99" : "99.999.999/9999-99"}
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        alwaysShowMask={false}
                        maskChar={null}
                      >
                        {(inputProps: any) => (
                          <Input 
                            {...inputProps}
                            id="documento" 
                            placeholder={tipoDocumento === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"} 
                          />
                        )}
                      </InputMask>
                      <Button onClick={handleSearchDocument} disabled={isSearching || !documento}>
                        {isSearching ? "Buscando..." : "Pesquisar"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {(editingUser || userFound || showFullForm) && (
                <form onSubmit={handleSave} className="space-y-4">
                  <input type="hidden" name="tipoDocumento" value={tipoDocumento} />
                  <input type="hidden" name="documento" value={documento} />
                  {userFound ? (
                    <div className="rounded-lg bg-muted p-3 space-y-1">
                      <p className="text-sm font-medium">{userFound.nome}</p>
                      <p className="text-xs text-muted-foreground">{userFound.email}</p>
                      <p className="text-[10px] text-primary font-bold uppercase mt-2 italic">Usuário já cadastrado</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Documento</Label>
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 border-dashed border-primary/20">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-primary uppercase leading-none mb-1">
                              {tipoDocumento.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-foreground tracking-wide">
                              {documento}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input id="nome" name="nome" required defaultValue={editingUser?.nome} placeholder="Ex: João da Silva" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" name="email" type="email" required defaultValue={editingUser?.email} placeholder="Ex: joao@empresa.com" />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="perfil">Perfil de Acesso</Label>
                    <Select name="perfil" defaultValue={editingUser?.perfil || userFound?.perfil || "Operador"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                        <SelectItem value="Operador">Operador</SelectItem>
                        <SelectItem value="Financeiro">Financeiro</SelectItem>
                        <SelectItem value="Consulta">Somente Consulta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter className="flex gap-2">
                    {!editingUser && <Button type="button" variant="ghost" onClick={resetForm}>Voltar</Button>}
                    <Button type="submit" className="flex-1">
                      {editingUser ? "Salvar Alterações" : userFound ? "Confirmar Perfil" : "Cadastrar Usuário"}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<UsuarioTenant>
        title={`${usuarios.length} usuários cadastrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome ou e-mail..."
        columns={[
          {
            header: "Usuário",
            accessor: (u) => (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm leading-none mb-1">{u.nome}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
            ),
          },
          {
            header: "Perfil",
            accessor: (u) => <Badge variant="outline" className="font-normal">{u.perfil}</Badge>,
          },
          {
            header: "Status",
            accessor: (u) => (
              <Badge variant={u.status === "ativo" ? "default" : "secondary"}>
                {u.status}
              </Badge>
            ),
          },
          {
            header: "Último Acesso",
            accessor: "ultimoAcesso",
            className: "text-xs text-muted-foreground",
          },
        ]}
        renderMobileCard={(u) => (
          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{u.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
              </div>
              <Badge variant={u.status === "ativo" ? "default" : "secondary"} className="text-[10px]">
                {u.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center pt-2 border-t text-[10px]">
              <span className="text-primary font-semibold uppercase">{u.perfil}</span>
              <span className="text-muted-foreground">Último acesso: {u.ultimoAcesso}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => handleEdit(u)}><Pencil className="mr-1 h-3 w-3" /> Editar</Button>
              <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] text-destructive hover:text-destructive"><Trash2 className="mr-1 h-3 w-3" /> Excluir</Button>
            </div>
          </div>
        )}
        actions={(u) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" title="Editar" onClick={() => handleEdit(u)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" title="Excluir">
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

export default ListagemUsuarios;
