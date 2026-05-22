import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import logoMyBox from "@/assets/mybox-logo.png";
import { 
  Box, 
  Image as ImageIcon, 
  Hash, 
  Upload, 
  Trash2, 
  Plus,
  Recycle,
  DollarSign,
  Palette,
  Sparkles,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";

export interface CacambaFormData {
  modelo: string;
  material: string;
  peso: string;
  cores: string;
  tipoTampa: "articulada" | "corredica" | "sem";
  tipoLocacao: "Externo" | "Interno" | "Ambos";
  diasExterno: string;
  precoExterno: string;
  diasInterno: string;
  precoInterno: string;
  residuos: string[];
  fotos: string[];
  unidades: { id: string; codigo: string; disponivel: boolean; manutencao: boolean }[];
}

interface CacambaFormProps {
  initialData?: Partial<CacambaFormData>;
  onSubmit: (data: CacambaFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const RESIDUOS_CLASSES = [
  { id: "A1", titulo: "Classe A1", descricao: "Resíduos reutilizáveis ou recicláveis como agregados de construção, demolição, reformas e reparos de pavimentação e de outras obras de infra-estrutura, inclusive solos provenientes de terraplanagem." },
  { id: "A2", titulo: "Classe A2", descricao: "Resíduos reutilizáveis ou recicláveis como agregados de construção, demolição, reformas e reparos de edificações: componentes cerâmicos (tijolos, blocos, telhas, placas de revestimento etc.), argamassa e concreto." },
  { id: "A3", titulo: "Classe A3", descricao: "Resíduos reutilizáveis ou recicláveis como agregados de processo de fabricação e/ou demolição de peças pré-moldadas em concreto (blocos, tubos, meios-fios etc.) produzidas nos canteiros de obras." },
  { id: "B", titulo: "Classe B", descricao: "Resíduos recicláveis para outras destinações, tais como: plásticos, papel/papelão, metais, vidros, madeiras e outros." },
  { id: "C", titulo: "Classe C", descricao: "Resíduos para os quais não foram desenvolvidas tecnologias ou aplicações economicamente viáveis que permitam a sua reciclagem/recuperação, tais como: os produtos oriundos do gesso." },
  { id: "D", titulo: "Classe D", descricao: "Resíduos perigosos oriundos do processo de construção, tais como: tintas (com solventes), solventes, óleos e outros, ou aqueles contaminados oriundos de demolições, reformas e reparos de clínicas radiológicas, instalações industriais e outros." },
];

export const CacambaForm: React.FC<CacambaFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [activeTab, setActiveTab] = React.useState("dados");
  
  // Dados básicos
  const [modelo, setModelo] = React.useState(initialData?.modelo || "");
  const [material, setMaterial] = React.useState(initialData?.material || "");
  const [peso, setPeso] = React.useState(initialData?.peso || "");
  const [cores, setCores] = React.useState(initialData?.cores || "");
  const [tipoTampa, setTipoTampa] = React.useState<CacambaFormData["tipoTampa"]>(initialData?.tipoTampa || "sem");
  
  // Locação
  const [tipoLocacao, setTipoLocacao] = React.useState<CacambaFormData["tipoLocacao"]>(initialData?.tipoLocacao || "Ambos");
  const [diasExterno, setDiasExterno] = React.useState(initialData?.diasExterno || "");
  const [precoExterno, setPrecoExterno] = React.useState(initialData?.precoExterno || "");
  const [diasInterno, setDiasInterno] = React.useState(initialData?.diasInterno || "");
  const [precoInterno, setPrecoInterno] = React.useState(initialData?.precoInterno || "");

  // Resíduos
  const [residuosSelecionados, setResiduosSelecionados] = React.useState<string[]>(initialData?.residuos || []);

  // Fotos
  const [fotos, setFotos] = React.useState<string[]>(initialData?.fotos || []);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Unidades
  const [unidades, setUnidades] = React.useState(initialData?.unidades || []);
  const [showGerarCodigos, setShowGerarCodigos] = React.useState(false);
  const [qtdCodigos, setQtdCodigos] = React.useState(1);
  const [tamCodigos, setTamCodigos] = React.useState(12);
  const [selecionados, setSelecionados] = React.useState<Set<string>>(new Set());

  const toggleResiduo = (id: string) => {
    setResiduosSelecionados(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

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
        manutencao: false,
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

  const toggleUnidadeStatus = (id: string, field: "disponivel" | "manutencao") => {
    setUnidades(prev => prev.map(u => 
      u.id === id ? { ...u, [field]: !u[field] } : u
    ));
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
    
    if (!modelo || !material || !peso || !cores) {
      toast.error("Preencha todos os campos obrigatórios da aba Caçamba");
      setActiveTab("dados");
      return;
    }

    onSubmit({
      modelo,
      material,
      peso,
      cores,
      tipoTampa,
      tipoLocacao,
      diasExterno,
      precoExterno,
      diasInterno,
      precoInterno,
      residuos: residuosSelecionados,
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
              <Box className="h-4 w-4" />
              <span className="hidden sm:inline">Caçamba</span>
            </TabsTrigger>
            <TabsTrigger value="galeria" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Galeria</span>
              {fotos.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{fotos.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unidades" className="gap-2">
              <Hash className="h-4 w-4" />
              <span className="hidden sm:inline">Unidades</span>
              {unidades.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{unidades.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* ========== ABA: CAÇAMBA ========== */}
        <TabsContent value="dados" className="space-y-6 mt-0 outline-none">
          {/* Especificações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Especificações</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo <span className="text-destructive">*</span></Label>
                <Select value={modelo} onValueChange={setModelo}>
                  <SelectTrigger id="modelo">
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mini-3m">Mini 3m³</SelectItem>
                    <SelectItem value="padrao-4m">Padrão 4m³</SelectItem>
                    <SelectItem value="media-5m">Média 5m³</SelectItem>
                    <SelectItem value="grande-7m">Grande 7m³</SelectItem>
                    <SelectItem value="extra-10m">Extra 10m³</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material <span className="text-destructive">*</span></Label>
                <Input 
                  id="material" 
                  value={material} 
                  onChange={(e) => setMaterial(e.target.value)} 
                  placeholder="Ex: Aço carbono" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg) <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input 
                    id="peso" 
                    type="number" 
                    value={peso} 
                    onChange={(e) => setPeso(e.target.value)} 
                    placeholder="0" 
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cores" className="flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  Cores <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="cores" 
                  value={cores} 
                  onChange={(e) => setCores(e.target.value)} 
                  placeholder="Ex: Azul, Verde" 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Tipo de Tampa</Label>
                <RadioGroup 
                  value={tipoTampa} 
                  onValueChange={(v) => setTipoTampa(v as CacambaFormData["tipoTampa"])}
                  className="flex flex-wrap gap-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="articulada" id="articulada" />
                    <Label htmlFor="articulada" className="font-normal cursor-pointer">Articulada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="corredica" id="corredica" />
                    <Label htmlFor="corredica" className="font-normal cursor-pointer">Corrediça</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sem" id="sem" />
                    <Label htmlFor="sem" className="font-normal cursor-pointer">Sem Tampa</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <Separator />

          {/* Locação */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Locação e Preços</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipoLocacao">Tipo de Locação</Label>
              <Select value={tipoLocacao} onValueChange={(v) => setTipoLocacao(v as CacambaFormData["tipoLocacao"])}>
                <SelectTrigger id="tipoLocacao" className="md:w-1/3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Externo">Apenas Externo</SelectItem>
                  <SelectItem value="Interno">Apenas Interno</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(tipoLocacao === "Externo" || tipoLocacao === "Ambos") && (
                <Card className="p-4 space-y-3 bg-muted/30">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Locação Externa</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="diasExterno" className="text-xs">Dias</Label>
                      <Input 
                        id="diasExterno" 
                        type="number" 
                        value={diasExterno} 
                        onChange={(e) => setDiasExterno(e.target.value)} 
                        placeholder="Ex: 3" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="precoExterno" className="text-xs">Preço</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                        <Input 
                          id="precoExterno" 
                          value={precoExterno} 
                          onChange={(e) => setPrecoExterno(e.target.value)} 
                          placeholder="0,00" 
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {(tipoLocacao === "Interno" || tipoLocacao === "Ambos") && (
                <Card className="p-4 space-y-3 bg-muted/30">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Locação Interna</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="diasInterno" className="text-xs">Dias</Label>
                      <Input 
                        id="diasInterno" 
                        type="number" 
                        value={diasInterno} 
                        onChange={(e) => setDiasInterno(e.target.value)} 
                        placeholder="Ex: 5" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="precoInterno" className="text-xs">Preço</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                        <Input 
                          id="precoInterno" 
                          value={precoInterno} 
                          onChange={(e) => setPrecoInterno(e.target.value)} 
                          placeholder="0,00" 
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          <Separator />

          {/* Resíduos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Recycle className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Resíduos Aceitos</h3>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {residuosSelecionados.length} selecionado{residuosSelecionados.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {RESIDUOS_CLASSES.map((classe) => {
                const ativo = residuosSelecionados.includes(classe.id);
                return (
                  <Card 
                    key={classe.id}
                    className={`p-4 cursor-pointer transition-all ${
                      ativo ? "border-primary/50 bg-primary/5" : "hover:border-border/80"
                    }`}
                    onClick={() => toggleResiduo(classe.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm mb-1">{classe.titulo}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{classe.descricao}</p>
                      </div>
                      <Switch 
                        checked={ativo} 
                        onCheckedChange={() => toggleResiduo(classe.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ========== ABA: GALERIA ========== */}
        <TabsContent value="galeria" className="space-y-6 mt-0 outline-none">
          <div>
            <h3 className="text-sm font-semibold mb-1">Galeria de Fotos</h3>
            <p className="text-xs text-muted-foreground mb-4">Adicione fotos para apresentar suas caçambas aos clientes.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {fotos.map((foto, idx) => (
              <Card key={idx} className="group relative aspect-square overflow-hidden">
                <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon" 
                    className="h-9 w-9"
                    onClick={() => removeFoto(idx)}
                  >
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFotoUpload}
          />

          {fotos.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-4">
              Nenhuma foto adicionada ainda. Clique em "Nova foto" para começar.
            </p>
          )}
        </TabsContent>

        {/* ========== ABA: UNIDADES ========== */}
        <TabsContent value="unidades" className="space-y-4 mt-0 outline-none">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold">Unidades Físicas</h3>
              <p className="text-xs text-muted-foreground">Gere códigos únicos para cada caçamba do seu inventário.</p>
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
                  <Input 
                    id="qtdCodigos" 
                    type="number" 
                    min={1} 
                    max={100}
                    value={qtdCodigos} 
                    onChange={(e) => setQtdCodigos(Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tamCodigos" className="text-xs">Caracteres por código</Label>
                  <Input 
                    id="tamCodigos" 
                    type="number" 
                    min={6} 
                    max={20}
                    value={tamCodigos} 
                    onChange={(e) => setTamCodigos(Number(e.target.value))} 
                  />
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
          {isLoading ? "Salvando..." : "Salvar Caçamba"}
        </Button>
      </div>
    </form>
  );
};
