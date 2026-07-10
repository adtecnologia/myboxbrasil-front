import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/components/DataPagination";
import { DataTable } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLocadorTable } from "@/hooks/useLocadorTable";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Veiculo = Database["public"]["Tables"]["veiculos"]["Row"] & {
  chassi?: string | null;
  cor?: string | null;
  configuracao?: string | null;
  tipo_carroceria?: string | null;
  capacidade_carga?: number | null;
  pbt?: number | null;
  rntrc?: string | null;
  crlv_numero?: string | null;
  crlv_validade?: string | null;
};

const Veiculos = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const { rows: tiposVeiculos, loading: loadingTipos } = useLocadorTable<{ id: string; nome: string; ativo?: boolean }>("tipos_veiculos", "nome");
  const [items, setItems] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Veiculo | null>(null);
  const [ativo, setAtivo] = useState(true);
  const [tab, setTab] = useState("identificacao");

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("veiculos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar veículos: " + error.message);
    setItems((data ?? []) as Veiculo[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      setAtivo(editingItem?.ativo ?? true);
      setTab("identificacao");
    }
  }, [dialogOpen, editingItem]);

  const filtered = items.filter((v) =>
    (v.placa ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (v.modelo ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (v.marca ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filtered, 10);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const f = Object.fromEntries(formData.entries()) as Record<string, string>;

    const currentYear = new Date().getFullYear();
    const minYear = 1900;
    const maxYear = currentYear + 1;
    const ano = f.ano ? Number(f.ano) : null;
    if (ano !== null && (!Number.isInteger(ano) || ano < minYear || ano > maxYear)) {
      toast.error(`Ano inválido. Informe um valor entre ${minYear} e ${maxYear}.`);
      setTab("especificacoes");
      return;
    }

    const payload: any = {
      locador_id: userId,
      tipo_veiculo: f.tipoVeiculo || null,
      placa: f.placa,
      renavam: f.renavam || null,
      chassi: f.chassi || null,
      marca: f.marca || null,
      modelo: f.modelo || null,
      ano_fabricacao: ano,
      ano_modelo: ano,
      cor: f.cor || null,
      combustivel: f.combustivel || null,
      eixos: f.eixos ? Number(f.eixos) : null,
      configuracao: f.configuracao || null,
      tipo_carroceria: f.tipoCarroceria || null,
      capacidade_carga: f.capacidadeCarga ? Number(f.capacidadeCarga) : null,
      pbt: f.pbt ? Number(f.pbt) : null,
      rntrc: f.rntrc || null,
      crlv_numero: f.crlvNumero || null,
      crlv_validade: f.crlvValidade || null,
      ativo,
    };

    const { error } = editingItem
      ? await supabase.from("veiculos").update(payload).eq("id", editingItem.id)
      : await supabase.from("veiculos").insert(payload);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success(editingItem ? "Veículo atualizado!" : "Veículo cadastrado!");
    setDialogOpen(false);
    setEditingItem(null);
    refresh();
  };

  const handleEdit = (item: Veiculo) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return;
    const { error } = await supabase.from("veiculos").delete().eq("id", id);
    if (error) return toast.error("Erro ao excluir: " + error.message);
    toast.success("Veículo excluído");
    refresh();
  };

  const currentYear = new Date().getFullYear();
  const e = editingItem as Veiculo | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold italic">Veículos</h1>
          <p className="text-sm text-white/75">Gestão da frota de veículos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Veículo" : "Cadastrar Veículo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="p-6">
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="identificacao">Identificação</TabsTrigger>
                  <TabsTrigger value="especificacoes">Especificações</TabsTrigger>
                  <TabsTrigger value="tecnicas">Técnicas</TabsTrigger>
                  <TabsTrigger value="documentacao">Documentação</TabsTrigger>
                </TabsList>

                <TabsContent value="identificacao" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipoVeiculo">Tipo de Veículo</Label>
                      <Select name="tipoVeiculo" defaultValue={e?.tipo_veiculo || ""}>
                        <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                        <SelectContent>
                          {loadingTipos && <div className="px-2 py-1.5 text-xs text-muted-foreground">Carregando...</div>}
                          {!loadingTipos && tiposVeiculos.length === 0 && (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">Nenhum tipo cadastrado.</div>
                          )}
                          {tiposVeiculos.map((t) => (
                            <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="placa">Placa *</Label>
                      <Input id="placa" name="placa" defaultValue={e?.placa ?? ""} required placeholder="ABC-1234" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="renavam">Renavam</Label>
                      <Input id="renavam" name="renavam" defaultValue={e?.renavam ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chassi">Chassi</Label>
                      <Input id="chassi" name="chassi" defaultValue={e?.chassi ?? ""} maxLength={17} placeholder="17 caracteres" />
                    </div>
                    <div className="space-y-2 md:col-span-2 flex items-center justify-between rounded-md border p-3">
                      <div>
                        <Label>Status</Label>
                        <p className="text-xs text-muted-foreground">{ativo ? "Veículo ativo na frota" : "Veículo inativo"}</p>
                      </div>
                      <Switch checked={ativo} onCheckedChange={setAtivo} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="especificacoes" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marca">Marca *</Label>
                      <Input id="marca" name="marca" defaultValue={e?.marca ?? ""} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modelo">Modelo *</Label>
                      <Input id="modelo" name="modelo" defaultValue={e?.modelo ?? ""} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ano">Ano *</Label>
                      <Input id="ano" name="ano" type="number" min={1900} max={currentYear + 1} step={1}
                        defaultValue={e?.ano_modelo ?? e?.ano_fabricacao ?? ""} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cor">Cor</Label>
                      <Input id="cor" name="cor" defaultValue={e?.cor ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="combustivel">Combustível</Label>
                      <Select name="combustivel" defaultValue={e?.combustivel ?? ""}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Gasolina">Gasolina</SelectItem>
                          <SelectItem value="Flex">Flex</SelectItem>
                          <SelectItem value="GNV">GNV</SelectItem>
                          <SelectItem value="Elétrico">Elétrico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tecnicas" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eixos">Quantidade de Eixos</Label>
                      <Input id="eixos" name="eixos" type="number" min={1} max={12} defaultValue={e?.eixos ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="configuracao">Configuração</Label>
                      <Select name="configuracao" defaultValue={e?.configuracao ?? ""}>
                        <SelectTrigger><SelectValue placeholder="Ex: 6x2" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4x2">4x2</SelectItem>
                          <SelectItem value="4x4">4x4</SelectItem>
                          <SelectItem value="6x2">6x2</SelectItem>
                          <SelectItem value="6x4">6x4</SelectItem>
                          <SelectItem value="8x2">8x2</SelectItem>
                          <SelectItem value="8x4">8x4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipoCarroceria">Tipo de Carroceria</Label>
                      <Select name="tipoCarroceria" defaultValue={e?.tipo_carroceria ?? ""}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aberta">Aberta</SelectItem>
                          <SelectItem value="Fechada">Fechada</SelectItem>
                          <SelectItem value="Basculante">Basculante</SelectItem>
                          <SelectItem value="Poliguindaste">Poliguindaste</SelectItem>
                          <SelectItem value="Roll-on">Roll-on</SelectItem>
                          <SelectItem value="Prancha">Prancha</SelectItem>
                          <SelectItem value="Baú">Baú</SelectItem>
                          <SelectItem value="Tanque">Tanque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacidadeCarga">Capacidade de Carga (ton)</Label>
                      <Input id="capacidadeCarga" name="capacidadeCarga" type="number" step="0.01" min={0}
                        defaultValue={e?.capacidade_carga ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pbt">PBT (ton)</Label>
                      <Input id="pbt" name="pbt" type="number" step="0.01" min={0} defaultValue={e?.pbt ?? ""} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documentacao" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rntrc">RNTRC</Label>
                      <Input id="rntrc" name="rntrc" defaultValue={e?.rntrc ?? ""} placeholder="Registro ANTT" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crlvNumero">Número do CRLV</Label>
                      <Input id="crlvNumero" name="crlvNumero" defaultValue={e?.crlv_numero ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crlvValidade">Validade do CRLV</Label>
                      <Input id="crlvValidade" name="crlvValidade" type="date" defaultValue={e?.crlv_validade ?? ""} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingItem ? "Salvar Alterações" : "Cadastrar Veículo"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Veiculo>
      loading={loading}
        title={`${items.length} veículos cadastrados`}
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: "Veículo",
            accessor: (v) => (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{v.placa}</p>
                  <p className="text-[11px] text-muted-foreground">{v.marca} {v.modelo}</p>
                </div>
              </div>
            ),
          },
          { header: "Tipo", accessor: "tipo_veiculo" },
          { header: "Ano", accessor: (v) => v.ano_modelo ?? v.ano_fabricacao ?? "-" },
          { header: "Cor", accessor: (v) => v.cor ?? "-" },
          { header: "Combustível", accessor: "combustivel" },
          { header: "Config.", accessor: (v) => v.configuracao ?? "-" },
          { header: "Capac.", accessor: (v) => v.capacidade_carga ? `${v.capacidade_carga}t` : "-" },
          {
            header: "Status",
            accessor: (v) => (
              <Badge variant={v.ativo ? "default" : "secondary"} className="text-[10px]">
                {v.ativo ? "Ativo" : "Inativo"}
              </Badge>
            ),
          },
        ]}
        renderMobileCard={(v) => (
          <div className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-base text-foreground">{v.placa}</p>
                  <p className="text-xs text-muted-foreground">{v.marca} {v.modelo}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEdit(v)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => handleDelete(v.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Ano</p>
                <p className="font-medium">{v.ano_modelo ?? v.ano_fabricacao ?? "-"}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Cor</p>
                <p className="font-medium">{v.cor ?? "-"}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Combustível</p>
                <p className="font-medium">{v.combustivel ?? "-"}</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-muted-foreground mb-0.5">Config/Capac.</p>
                <p className="font-medium">{v.configuracao ?? "-"} / {v.capacidade_carga ? `${v.capacidade_carga}t` : "-"}</p>
              </div>
              <div className="col-span-2">
                <Badge variant={v.ativo ? "default" : "secondary"} className="text-[10px]">
                  {v.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </div>
        )}
        actions={(v) => (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-primary hover:text-primary shadow-sm" onClick={() => handleEdit(v)} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg hover:border-destructive hover:text-destructive shadow-sm text-destructive" onClick={() => handleDelete(v.id)} title="Excluir">
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

export default Veiculos;
