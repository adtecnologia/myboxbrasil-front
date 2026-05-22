import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Save, Bell, Shield, Eye, Globe, MapPin, Recycle, Search, FileText, Calendar as CalendarIcon, ChevronDown, Upload, Plus, Trash2, Paperclip, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRef } from "react";

const ConfigField = ({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode 
}) => (
  <div className="flex items-center justify-between py-4">
    <div className="space-y-0.5">
      <Label className="text-sm font-medium">{title}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    {children}
  </div>
);

interface LicenseDoc {
  id: string;
  name: string;
  file?: string;
  expiry?: string;
}

interface CityConfig {
  name: string;
  state: string;
  licenses: LicenseDoc[];
}

const Configuracoes = () => {
  const { activeProfileType } = useAuthStore();
  const role = activeProfileType();

  const [selectedCities, setSelectedCities] = useState<CityConfig[]>([
    { 
      name: "São José do Rio Preto", state: "SP",
      licenses: [
        { id: "l1", name: "Licença de Operação", file: "LO-2024.pdf", expiry: "2025-12-31" },
        { id: "l2", name: "Alvará Municipal", file: "alvara-srp.pdf", expiry: "2025-10-01" }
      ]
    },
    { 
      name: "Mirassol", state: "SP",
      licenses: [
        { id: "l3", name: "Licença Ambiental", file: "LIC-MIR-088.pdf", expiry: "2025-06-15" }
      ]
    }
  ]);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>(["Classe II A", "Classe II B"]);
  const [wasteSearch, setWasteSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedState, setSelectedState] = useState<string>("SP");
  const [manageCity, setManageCity] = useState<CityConfig | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingLicenseId, setPendingLicenseId] = useState<string | null>(null);

  const statesData: Record<string, string[]> = {
    SP: ["São José do Rio Preto", "Mirassol", "Bady Bassitt", "Cedral", "Guapiaçu", "Ipiguá", "Jaci", "Neves Paulista", "Nova Aliança", "Onda Verde", "Palestina", "Potirendaba"],
    MG: ["Uberlândia", "Uberaba", "Araguari", "Ituiutaba", "Patos de Minas"],
    RJ: ["Rio de Janeiro", "Niterói", "Petrópolis", "Volta Redonda", "Nova Iguaçu"],
  };

  const states = Object.keys(statesData);
  const citiesInState = statesData[selectedState] || [];

  const wasteTypes = [
    { id: "c1", label: "Classe I - Perigosos", description: "Resíduos que apresentam inflamabilidade, corrosividade, reatividade ou toxicidade." },
    { id: "c2", label: "Classe II A - Não Inertes", description: "Resíduos com propriedades de biodegradabilidade, combustibilidade ou solubilidade em água." },
    { id: "c3", label: "Classe II B - Inertes", description: "Resíduos que não se decompõem ou sofrem qualquer alteração física, química ou biológica." },
    { id: "c4", label: "Resíduos de Construção Civil (RCC)", description: "Tijolos, blocos cerâmicos, concreto, solos, rochas e madeiras de obras." },
    { id: "c5", label: "Resíduos Verdes / Podas", description: "Galhos, folhas, grama e materiais vegetais de limpeza de jardins." },
    { id: "c6", label: "Resíduos Volumosos", description: "Móveis, colchões e outros itens de grande porte não recolhidos pelo lixo comum." }
  ];

  const handleSave = () => {
    console.log("Saving configurations:", { selectedCities, selectedWasteTypes });
    toast.success("Configurações salvas com sucesso!");
  };

  const toggleCity = (cityName: string) => {
    setSelectedCities(prev => 
      prev.some(c => c.name === cityName && c.state === selectedState)
        ? prev.filter(c => !(c.name === cityName && c.state === selectedState))
        : [...prev, { name: cityName, state: selectedState, licenses: [] }]
    );
  };

  const allStateSelected = citiesInState.length > 0 && citiesInState.every(name => 
    selectedCities.some(c => c.name === name && c.state === selectedState)
  );

  const toggleAllStateCities = () => {
    if (allStateSelected) {
      setSelectedCities(prev => prev.filter(c => c.state !== selectedState));
    } else {
      const toAdd = citiesInState
        .filter(name => !selectedCities.some(c => c.name === name && c.state === selectedState))
        .map(name => ({ name, state: selectedState, licenses: [] }));
      setSelectedCities(prev => [...prev, ...toAdd]);
    }
  };

  const removeCity = (cityName: string, state: string) => {
    setSelectedCities(prev => prev.filter(c => !(c.name === cityName && c.state === state)));
  };

  const addLicense = (cityName: string, state: string) => {
    const newLicense = { id: `l${Date.now()}`, name: "" };
    setSelectedCities(prev => prev.map(c => 
      c.name === cityName && c.state === state
        ? { ...c, licenses: [...c.licenses, newLicense] }
        : c
    ));
    setManageCity(prev => prev ? { ...prev, licenses: [...prev.licenses, newLicense] } : prev);
  };

  const updateLicense = (cityName: string, state: string, licenseId: string, field: keyof LicenseDoc, value: string) => {
    setSelectedCities(prev => prev.map(c => 
      c.name === cityName && c.state === state
        ? { ...c, licenses: c.licenses.map(l => l.id === licenseId ? { ...l, [field]: value } : l) }
        : c
    ));
    setManageCity(prev => prev && prev.name === cityName ? {
      ...prev,
      licenses: prev.licenses.map(l => l.id === licenseId ? { ...l, [field]: value } : l)
    } : prev);
  };

  const removeLicense = (cityName: string, state: string, licenseId: string) => {
    setSelectedCities(prev => prev.map(c => 
      c.name === cityName && c.state === state
        ? { ...c, licenses: c.licenses.filter(l => l.id !== licenseId) }
        : c
    ));
    setManageCity(prev => prev && prev.name === cityName ? {
      ...prev,
      licenses: prev.licenses.filter(l => l.id !== licenseId)
    } : prev);
  };

  const triggerFileUpload = (licenseId: string) => {
    setPendingLicenseId(licenseId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingLicenseId && manageCity) {
      updateLicense(manageCity.name, manageCity.state, pendingLicenseId, "file", file.name);
    }
    setPendingLicenseId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleWaste = (label: string) => {
    setSelectedWasteTypes(prev => 
      prev.includes(label) ? prev.filter(w => w !== label) : [...prev, label]
    );
  };

  const filteredCities = citiesInState.filter(city => 
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Configurações" 
        subtitle="Personalize sua experiência e gerencie as preferências da plataforma"
      >
        <Button 
          onClick={handleSave} 
          className="gap-2 bg-white/20 hover:bg-white/30 text-white border-none shadow-none"
        >
          <Save className="h-4 w-4" /> Salvar Alterações
        </Button>
      </PageHeader>
        {/* Notificações - Comum a todos */}
      <Accordion type="multiple" className="space-y-4">
        {/* Notificações - Comum a todos */}
        <AccordionItem value="notifications" className="border-none">
          <Card className="border-none shadow-sm overflow-hidden">
            <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-all py-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <div className="text-left">
                  <CardTitle className="text-base">Notificações</CardTitle>
                  <CardDescription className="text-xs">Escolha como deseja ser avisado sobre as atividades</CardDescription>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-0">
              <div className="space-y-0">
                <ConfigField 
                  title="Notificações via E-mail" 
                  description="Receba atualizações sobre pedidos e documentos por e-mail"
                >
                  <Switch defaultChecked />
                </ConfigField>
                <Separator />
                <ConfigField 
                  title="Notificações Push" 
                  description="Receba alertas em tempo real no seu navegador"
                >
                  <Switch defaultChecked />
                </ConfigField>
                <Separator />
                <ConfigField 
                  title="Alertas de Prazo" 
                  description="Avisar 24h antes do vencimento de documentos"
                >
                  <Switch defaultChecked />
                </ConfigField>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Configurações específicas por Perfil */}
        {role === "admin" && (
          <AccordionItem value="admin-global" className="border-none">
            <Card className="border-none shadow-sm overflow-hidden">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-all py-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <div className="text-left">
                    <CardTitle className="text-base">Administração Global</CardTitle>
                    <CardDescription className="text-xs">Configurações exclusivas para administradores do sistema</CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0">
                <div className="space-y-0">
                  <ConfigField 
                    title="Aprovação Automática" 
                    description="Aprovar novos cadastros de usuários automaticamente"
                  >
                    <Switch />
                  </ConfigField>
                  <Separator />
                  <ConfigField 
                    title="Logs de Auditoria" 
                    description="Manter registro detalhado de todas as ações dos usuários"
                  >
                    <Switch defaultChecked />
                  </ConfigField>
                  <Separator />
                  <ConfigField 
                    title="Manutenção do Sistema" 
                    description="Ativar modo de manutenção (apenas admins podem logar)"
                  >
                    <Switch />
                  </ConfigField>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        )}

        {(role === "locador" || role === "destino") && (
          <AccordionItem value="locador-docs" className="border-none">
            <Card className="border-none shadow-sm overflow-hidden">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-all py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div className="text-left">
                    <CardTitle className="text-base">Documentação e Área de Atuação</CardTitle>
                    <CardDescription className="text-xs">Cidades atendidas e licenças ambientais</CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-4">
                  {/* Seleção de Cidades */}
                  <div className="space-y-3 lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selecionar Municípios</Label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger className="h-8 w-[110px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar cidade..."
                        className="pl-9 text-xs"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                      />
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full h-8 text-xs gap-2"
                      onClick={toggleAllStateCities}
                    >
                      {allStateSelected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                      {allStateSelected ? `Desmarcar todas de ${selectedState}` : `Selecionar todas de ${selectedState}`}
                    </Button>
                    
                    <ScrollArea className="h-[280px] pr-4 border rounded-md p-3">
                      <div className="space-y-3">
                        {filteredCities.map((cityName) => (
                          <div key={cityName} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`city-${selectedState}-${cityName}`} 
                              checked={selectedCities.some(c => c.name === cityName && c.state === selectedState)}
                              onCheckedChange={() => toggleCity(cityName)}
                            />
                            <label
                              htmlFor={`city-${selectedState}-${cityName}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {cityName}
                            </label>
                          </div>
                        ))}
                        {filteredCities.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-4">Nenhuma cidade encontrada.</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Licenças por Cidade */}
                  <div className="space-y-3 lg:col-span-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Licenças por Cidade ({selectedCities.length})
                      </Label>
                    </div>

                    {selectedCities.length > 0 ? (
                      <div className="rounded-md border border-border overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="text-xs h-9">Cidade</TableHead>
                              <TableHead className="text-xs h-9 w-16 text-center">UF</TableHead>
                              <TableHead className="text-xs h-9 w-28 text-center">Documentos</TableHead>
                              <TableHead className="text-xs h-9 w-32 text-right pr-3">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedCities.map((city) => {
                              const hasDocs = city.licenses.length > 0;
                              const allComplete = hasDocs && city.licenses.every(l => l.file && l.expiry && l.name);
                              return (
                                <TableRow key={`${city.state}-${city.name}`} className="hover:bg-muted/30">
                                  <TableCell className="text-xs font-medium py-2.5">{city.name}</TableCell>
                                  <TableCell className="text-xs text-center text-muted-foreground py-2.5">{city.state}</TableCell>
                                  <TableCell className="text-center py-2.5">
                                    {hasDocs ? (
                                      <Badge variant={allComplete ? "default" : "secondary"} className="text-[10px] h-5 px-1.5">
                                        {city.licenses.length} {city.licenses.length === 1 ? "doc" : "docs"}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-destructive/30 text-destructive">
                                        Pendente
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 pr-3">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button 
                                        type="button"
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 text-[11px] gap-1.5"
                                        onClick={() => setManageCity(city)}
                                      >
                                        <Paperclip className="h-3 w-3" /> Licenças
                                      </Button>
                                      <Button 
                                        type="button"
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => removeCity(city.name, city.state)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
                        <MapPin className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">Selecione cidades ao lado para configurar as licenças</p>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        )}

        {role === "locador" && (
          <AccordionItem value="locador-ops" className="border-none">
              <Card className="border-none shadow-sm overflow-hidden">
                <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-all py-4">
                  <div className="flex items-center gap-2">
                    <Recycle className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <CardTitle className="text-base">Operação e Resíduos</CardTitle>
                      <CardDescription className="text-xs">Tipos de resíduos e regras de atendimento</CardDescription>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0 space-y-6">
                  <div className="space-y-4 pt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipos de Resíduos Atendidos</Label>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar resíduo..."
                          className="pl-9 h-9 text-xs"
                          value={wasteSearch}
                          onChange={(e) => setWasteSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <ScrollArea className="h-[250px] pr-4 border rounded-md p-4 bg-muted/10">
                      <div className="space-y-1">
                        {wasteTypes
                          .filter(w => w.label.toLowerCase().includes(wasteSearch.toLowerCase()) || w.description.toLowerCase().includes(wasteSearch.toLowerCase()))
                          .map((waste) => (
                          <div 
                            key={waste.id} 
                            className="flex items-center space-x-3 p-3 rounded-md border border-border/50 bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => toggleWaste(waste.label)}
                          >
                            <Checkbox 
                              id={waste.id} 
                              checked={selectedWasteTypes.includes(waste.label)}
                              onCheckedChange={() => toggleWaste(waste.label)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 space-y-1">
                              <label
                                htmlFor={waste.id}
                                className="text-sm font-medium leading-none cursor-pointer block"
                              >
                                {waste.label}
                              </label>
                              <p className="text-xs text-muted-foreground line-clamp-1">{waste.description}</p>
                            </div>
                            {selectedWasteTypes.includes(waste.label) && (
                              <Badge variant="default" className="text-[10px] h-5">Selecionado</Badge>
                            )}
                          </div>
                        ))}
                        {wasteTypes.filter(w => w.label.toLowerCase().includes(wasteSearch.toLowerCase()) || w.description.toLowerCase().includes(wasteSearch.toLowerCase())).length === 0 && (
                          <div className="text-center py-10 text-muted-foreground text-sm">
                            Nenhum resíduo encontrado.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="space-y-0">
                    <ConfigField 
                      title="Disponibilidade Automática" 
                      description="Marcar caçambas como disponíveis logo após a coleta"
                    >
                      <Switch defaultChecked />
                    </ConfigField>
                    <Separator />
                    <ConfigField 
                      title="Visibilidade de Frota" 
                      description="Permitir que locatários vejam a localização aproximada da frota"
                    >
                      <Switch defaultChecked />
                    </ConfigField>
                    <Separator />
                    <ConfigField 
                      title="Aceite Automático" 
                      description="Aceitar pedidos automaticamente dentro da área de cobertura"
                    >
                      <Switch />
                    </ConfigField>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
        )}

        {role === "locatario" && (
          <AccordionItem value="locatario-prefs" className="border-none">
            <Card className="border-none shadow-sm overflow-hidden">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-all py-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <div className="text-left">
                    <CardTitle className="text-base">Preferências de Locatário</CardTitle>
                    <CardDescription className="text-xs">Ajuste sua experiência de contratação</CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0">
                <div className="space-y-0">
                  <ConfigField 
                    title="Preferência por Sustentabilidade" 
                    description="Priorizar transportadores com selo eco-friendly"
                  >
                    <Switch defaultChecked />
                  </ConfigField>
                  <Separator />
                  <ConfigField 
                    title="Relatórios Mensais" 
                    description="Gerar e enviar relatório de resíduos mensalmente por e-mail"
                  >
                    <Switch defaultChecked />
                  </ConfigField>
                  <Separator />
                  <ConfigField 
                    title="Confirmação de Entrega" 
                    description="Exigir foto e assinatura digital na entrega da caçamba"
                  >
                    <Switch defaultChecked />
                  </ConfigField>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        )}

        {role === "destino" && (
          <AccordionItem value="destino-ops" className="border-none">
            <Card className="border-none shadow-sm overflow-hidden">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-all py-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <div className="text-left">
                    <CardTitle className="text-base">Operação de Destino Final</CardTitle>
                    <CardDescription className="text-xs">Configurações para recebimento de resíduos</CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0">
                <div className="space-y-0">
                  <ConfigField 
                    title="Integração MTR" 
                    description="Sincronizar automaticamente com o sistema de MTR estadual"
                  >
                    <Switch defaultChecked />
                  </ConfigField>
                  <Separator />
                  <ConfigField 
                    title="Limite de Capacidade" 
                    description="Bloquear novos agendamentos quando atingir 90% da capacidade"
                  >
                    <Switch defaultChecked />
                  </ConfigField>
                  <Separator />
                  <ConfigField 
                    title="Auto-faturamento" 
                    description="Gerar faturas automaticamente após a pesagem do resíduo"
                  >
                    <Switch />
                  </ConfigField>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        )}

        {/* Segurança - Comum a todos */}
        <AccordionItem value="security" className="border-none">
          <Card className="border-none shadow-sm overflow-hidden">
            <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 transition-all py-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <div className="text-left">
                  <CardTitle className="text-base">Privacidade e Segurança</CardTitle>
                  <CardDescription className="text-xs">Proteja sua conta e seus dados</CardDescription>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-0">
              <div className="space-y-0">
                <ConfigField 
                  title="Autenticação em Duas Etapas (2FA)" 
                  description="Adicione uma camada extra de segurança à sua conta"
                >
                  <Switch />
                </ConfigField>
                <Separator />
                <ConfigField 
                  title="Sessões Ativas" 
                  description="Deslogar de outros dispositivos ao entrar em um novo"
                >
                  <Switch />
                </ConfigField>
                <Separator />
                <ConfigField 
                  title="Compartilhamento de Dados" 
                  description="Permitir uso anônimo de dados para melhoria da plataforma"
                >
                  <Switch defaultChecked />
                </ConfigField>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange} 
      />

      <Dialog open={!!manageCity} onOpenChange={(open) => !open && setManageCity(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Licenças - {manageCity?.name} / {manageCity?.state}
            </DialogTitle>
            <DialogDescription>
              Adicione todos os documentos exigidos para operar nesta cidade.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {manageCity?.licenses.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-muted/20">
                <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum documento adicionado.</p>
              </div>
            )}
            {manageCity?.licenses.map((lic, idx) => (
              <div key={lic.id} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">Documento #{idx + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeLicense(manageCity.name, manageCity.state, lic.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nome / Tipo do Documento</Label>
                    <Input
                      placeholder="Ex: Licença de Operação"
                      className="h-9 text-xs"
                      value={lic.name}
                      onChange={(e) => updateLicense(manageCity.name, manageCity.state, lic.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Data de Vencimento</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="date"
                        className="h-9 text-xs pl-9"
                        value={lic.expiry || ""}
                        onChange={(e) => updateLicense(manageCity.name, manageCity.state, lic.id, "expiry", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Arquivo</Label>
                  {lic.file ? (
                    <div className="flex items-center justify-between p-2 border border-border rounded-md bg-background">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs font-medium truncate">{lic.file}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px]"
                        onClick={() => triggerFileUpload(lic.id)}
                      >
                        Substituir
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full h-9 text-xs gap-2 border-dashed"
                      onClick={() => triggerFileUpload(lic.id)}
                    >
                      <Upload className="h-3.5 w-3.5" /> Enviar arquivo (PDF, JPG, PNG)
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => manageCity && addLicense(manageCity.name, manageCity.state)}
            >
              <Plus className="h-4 w-4" /> Adicionar Documento
            </Button>
            <Button type="button" onClick={() => setManageCity(null)} className="gap-2">
              <Save className="h-4 w-4" /> Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Configuracoes;