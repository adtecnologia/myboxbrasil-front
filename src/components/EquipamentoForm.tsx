import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import logoMyBox from "@/assets/mybox-logo.png";
import {
  Wrench,
  Image as ImageIcon,
  Hash,
  Upload,
  Trash2,
  Plus,
  DollarSign,
  Sparkles,
  QrCode,
  ShieldAlert,
  BookOpen,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export interface EquipamentoFormData {
  tipoEquipamento: string;
  nome: string;
  precoDiario: string;
  precoSemanal: string;
  precoQuinzenal: string;
  precoMensal: string;
  descricao: string;
  orientacoesOperacao: string;
  orientacoesSeguranca: string;
  fotos: string[];
  unidades: { id: string; codigo: string; disponivel: boolean }[];
}

interface EquipamentoFormProps {
  initialData?: Partial<EquipamentoFormData>;
  onSubmit: (data: EquipamentoFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const PrecoInput = ({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-xs">
      {label} <span className="text-destructive">*</span>
    </Label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "0,00"} className="pl-9" />
    </div>
  </div>
);

export const EquipamentoForm: React.FC<EquipamentoFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [activeTab, setActiveTab] = React.useState("dados");
  const [tipos, setTipos] = React.useState<Array<{ id: string; nome: string }>>([]);

  React.useEffect(() => {
    supabase
      .from("tipos_equipamentos")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome", { ascending: true })
      .then(({ data }) => setTipos(data ?? []));
  }, []);

  const [tipoEquipamento, setTipoEquipamento] = React.useState(initialData?.tipoEquipamento || "");
  const [nome, setNome] = React.useState(initialData?.nome || "");
  const [precoDiario, setPrecoDiario] = React.useState(initialData?.precoDiario || "");
  const [precoSemanal, setPrecoSemanal] = React.useState(initialData?.precoSemanal || "");
  const [precoQuinzenal, setPrecoQuinzenal] = React.useState(initialData?.precoQuinzenal || "");
  const [precoMensal, setPrecoMensal] = React.useState(initialData?.precoMensal || "");
  const [descricao, setDescricao] = React.useState(initialData?.descricao || "");
  const [orientacoesOperacao, setOrientacoesOperacao] = React.useState(initialData?.orientacoesOperacao || "");
  const [orientacoesSeguranca, setOrientacoesSeguranca] = React.useState(initialData?.orientacoesSeguranca || "");

  const [fotos, setFotos] = React.useState<string[]>(initialData?.fotos || []);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [unidades, setUnidades] = React.useState(initialData?.unidades || []);
  const [showGerarCodigos, setShowGerarCodigos] = React.useState(false);
  const [qtdCodigos, setQtdCodigos] = React.useState(1);
  const [tamCodigos, setTamCodigos] = React.useState(12);
  const [selecionados, setSelecionados] = React.useState<Set<string>>(new Set());

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const gerarCodigos = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const novosCodigos = Array.from({ length: qtdCodigos }, () => {
      const codigo = Array.from({ length: tamCodigos }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join("");
      return {
        id: Math.random().toString(36).substr(2, 9),
        codigo,
        disponivel: true,
      };
    });
    setUnidades(prev => [...prev, ...novosCodigos]);
    setShowGerarCodigos(false);
    toast.success(`${qtdCodigos} código(s) gerado(s) com sucesso!`);
  };

  const removeUnidade = (id: string) => {
    setUnidades(prev => prev.filter(u => u.id !== id));
    setSelecionados(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleSelecionado = (id: string) => {
    setSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelecionarTodos = () => {
    if (selecionados.size === unidades.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(unidades.map(u => u.id)));
    }
  };

  const baixarQrCodes = () => {
    const itens = unidades.filter(u => selecionados.has(u.id));
    if (itens.length === 0) {
      toast.error("Selecione ao menos uma unidade.");
      return;
    }
    const logoUrl = window.location.origin + logoMyBox;
    const labelsHtml = itens.map(u => `
      <div class="label">
        <img class="logo" src="${logoUrl}" alt="MyBox" />
        <img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=${encodeURIComponent(u.codigo)}" alt="${u.codigo}" />
        <div class="code">${u.codigo}</div>
      </div>
    `).join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>Etiquetas QR Code - MyBox</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; }
  .toolbar { position: sticky; top: 0; background: #fff; padding: 12px 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.1); margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
  .toolbar h1 { margin: 0; font-size: 16px; }
  .toolbar button { background: #16a34a; color: #fff; border: 0; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .label { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; page-break-inside: avoid; }
  .logo { height: 32px; object-fit: contain; }
  .qr { width: 180px; height: 180px; }
  .code { font-family: 'Courier New', monospace; font-weight: 700; font-size: 14px; letter-spacing: 1px; color: #111; }
  @media print {
    body { background: #fff; padding: 0; }
    .toolbar { display: none; }
    .label { border: 1px solid #ccc; }
  }
</style>
</head>
<body>
  <div class="toolbar">
    <h1>Etiquetas QR Code (${itens.length})</h1>
    <button onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>
  <div class="grid">${labelsHtml}</div>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Permita pop-ups para baixar os QR Codes.");
      return;
    }
    w.document.write(html);
    w.document.close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoEquipamento || !nome || !precoDiario || !precoSemanal || !precoQuinzenal || !precoMensal) {
      toast.error("Preencha todos os campos obrigatórios da aba Equipamento");
      setActiveTab("dados");
      return;
    }
    onSubmit({
      tipoEquipamento,
      nome,
      precoDiario,
      precoSemanal,
      precoQuinzenal,
      precoMensal,
      descricao,
      orientacoesOperacao,
      orientacoesSeguranca,
      fotos,
      unidades,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 shrink-0 bg-muted/20 border-b">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados" className="gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Equipamento</span>
            </TabsTrigger>
            <TabsTrigger value="galeria" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Galeria</span>
              {fotos.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{fotos.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="estoque" className="gap-2">
              <Hash className="h-4 w-4" />
              <span className="hidden sm:inline">Estoque</span>
              {unidades.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{unidades.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* ========== ABA: EQUIPAMENTO ========== */}
          <TabsContent value="dados" className="space-y-6 mt-0 outline-none">
            {/* Identificação */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Identificação</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoEquipamento">
                    Tipo de equipamento <span className="text-destructive">*</span>
                  </Label>
                  <Select value={tipoEquipamento} onValueChange={setTipoEquipamento}>
                    <SelectTrigger id="tipoEquipamento">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.length === 0 ? (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          Nenhum tipo cadastrado
                        </div>
                      ) : (
                        tipos.map((t) => (
                          <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Prensa modelo X-500" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Preços */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Valores de Locação</h3>
              </div>
              <Card className="p-4 bg-muted/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <PrecoInput id="precoDiario" label="Preço diário" value={precoDiario} onChange={setPrecoDiario} />
                  <PrecoInput id="precoSemanal" label="Preço semanal" value={precoSemanal} onChange={setPrecoSemanal} />
                  <PrecoInput id="precoQuinzenal" label="Preço quinzenal" value={precoQuinzenal} onChange={setPrecoQuinzenal} />
                  <PrecoInput id="precoMensal" label="Preço mensal" value={precoMensal} onChange={setPrecoMensal} />
                </div>
              </Card>
            </div>

            <Separator />

            {/* Descrição */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Descrição</h3>
              </div>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o equipamento, suas características e aplicações..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Orientações de operação */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Orientações de operação</h3>
              </div>
              <Textarea
                value={orientacoesOperacao}
                onChange={(e) => setOrientacoesOperacao(e.target.value)}
                placeholder="Como operar o equipamento corretamente..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Orientações de segurança */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <h3 className="text-sm font-semibold">Orientações de segurança</h3>
              </div>
              <Textarea
                value={orientacoesSeguranca}
                onChange={(e) => setOrientacoesSeguranca(e.target.value)}
                placeholder="EPIs necessários, cuidados e procedimentos de segurança..."
                rows={4}
                className="resize-none"
              />
            </div>
          </TabsContent>

          {/* ========== ABA: GALERIA ========== */}
          <TabsContent value="galeria" className="space-y-6 mt-0 outline-none">
            <div>
              <h3 className="text-sm font-semibold mb-1">Galeria de Fotos</h3>
              <p className="text-xs text-muted-foreground mb-4">Adicione fotos para apresentar seu equipamento aos clientes.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {fotos.map((foto, idx) => (
                <Card key={idx} className="group relative aspect-square overflow-hidden">
                  <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="destructive" size="icon" className="h-9 w-9" onClick={() => removeFoto(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs font-medium">Nova foto</span>
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFotoUpload} />

            {fotos.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">
                Nenhuma foto adicionada ainda. Clique em "Nova foto" para começar.
              </p>
            )}
          </TabsContent>

          {/* ========== ABA: ESTOQUE ========== */}
          <TabsContent value="estoque" className="space-y-4 mt-0 outline-none">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-sm font-semibold">Unidades em Estoque</h3>
                <p className="text-xs text-muted-foreground">Gere códigos únicos para cada equipamento do seu inventário.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={baixarQrCodes}
                  disabled={selecionados.size === 0}
                  className="gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Baixar QR Codes
                  {selecionados.size > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{selecionados.size}</Badge>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setShowGerarCodigos(!showGerarCodigos)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Gerar Códigos
                </Button>
              </div>
            </div>

            {showGerarCodigos && (
              <Card className="p-4 bg-muted/30 border-primary/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="qtdCodigos" className="text-xs">Quantidade de códigos</Label>
                    <Input id="qtdCodigos" type="number" min={1} max={100} value={qtdCodigos} onChange={(e) => setQtdCodigos(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tamCodigos" className="text-xs">Caracteres por código</Label>
                    <Input id="tamCodigos" type="number" min={6} max={20} value={tamCodigos} onChange={(e) => setTamCodigos(Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowGerarCodigos(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" size="sm" onClick={gerarCodigos}>
                    Gerar
                  </Button>
                </div>
              </Card>
            )}

            {unidades.length > 0 ? (
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="w-12 p-3 text-center">
                          <Checkbox
                            checked={unidades.length > 0 && selecionados.size === unidades.length}
                            onCheckedChange={toggleSelecionarTodos}
                            aria-label="Selecionar todos"
                          />
                        </th>
                        <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider">Código</th>
                        <th className="text-center p-3 font-semibold text-xs uppercase tracking-wider">Disponível</th>
                        <th className="w-12 p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {unidades.map((u) => (
                        <tr key={u.id} className="border-t hover:bg-muted/40 transition-colors">
                          <td className="p-3 text-center">
                            <Checkbox
                              checked={selecionados.has(u.id)}
                              onCheckedChange={() => toggleSelecionado(u.id)}
                              aria-label={`Selecionar ${u.codigo}`}
                            />
                          </td>
                          <td className="p-3 font-mono text-xs">{u.codigo}</td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={u.disponivel ? "default" : "secondary"}
                              className={u.disponivel ? "bg-primary/10 text-primary hover:bg-primary/15 border-primary/20" : ""}
                            >
                              {u.disponivel ? "Sim" : "Não"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeUnidade(u.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed">
                <Hash className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium mb-1">Nenhuma unidade cadastrada</p>
                <p className="text-xs text-muted-foreground">Clique em "Gerar Códigos" para criar unidades automaticamente.</p>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex justify-end gap-3 p-6 border-t bg-background shrink-0">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Equipamento"}
        </Button>
      </div>
    </form>
  );
};
