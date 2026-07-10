import { Fragment, useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { supabase } from "@/integrations/supabase/client";
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
  file_path?: string;
  expiry?: string;
  status?: "aguardando_validacao" | "aceito" | "negado";
  motivo_recusa?: string | null;
}

interface CityConfig {
  id?: string;
  name: string;
  state: string;
  licenses: LicenseDoc[];
  status_prefeitura?: string | null;
  motivo_prefeitura?: string | null;
}

const Configuracoes = () => {
  const { activeProfileType } = useAuthStore();
  const role = activeProfileType();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id ?? null;

  const [prefs, setPrefs] = useState({
    notif_email: true,
    notif_push: true,
    notif_prazo: true,
    seg_2fa: false,
    seg_sessoes_unicas: false,
    seg_compartilhar_dados: true,
    op_disponibilidade_auto: true,
    op_visibilidade_frota: true,
    op_aceite_auto: false,
  });
  const setPref = <K extends keyof typeof prefs>(k: K, v: (typeof prefs)[K]) =>
    setPrefs((p) => ({ ...p, [k]: v }));

  const [adminSettings, setAdminSettings] = useState({
    aprovacao_automatica: false,
    logs_auditoria: true,
    manutencao_sistema: false,
  });
  const setAdmin = <K extends keyof typeof adminSettings>(k: K, v: (typeof adminSettings)[K]) =>
    setAdminSettings((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (role !== "admin") return;
    (async () => {
      const { data } = await supabase
        .from("system_settings")
        .select("aprovacao_automatica, logs_auditoria, manutencao_sistema")
        .eq("singleton", true)
        .maybeSingle();
      if (data) {
        setAdminSettings({
          aprovacao_automatica: data.aprovacao_automatica ?? false,
          logs_auditoria: data.logs_auditoria ?? true,
          manutencao_sistema: data.manutencao_sistema ?? false,
        });
      }
    })();
  }, [role]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("notif_email, notif_push, notif_prazo, seg_2fa, seg_sessoes_unicas, seg_compartilhar_dados, op_disponibilidade_auto, op_visibilidade_frota, op_aceite_auto")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) {
        setPrefs({
          notif_email: data.notif_email ?? true,
          notif_push: data.notif_push ?? true,
          notif_prazo: data.notif_prazo ?? true,
          seg_2fa: data.seg_2fa ?? false,
          seg_sessoes_unicas: data.seg_sessoes_unicas ?? false,
          seg_compartilhar_dados: data.seg_compartilhar_dados ?? true,
          op_disponibilidade_auto: data.op_disponibilidade_auto ?? true,
          op_visibilidade_frota: data.op_visibilidade_frota ?? true,
          op_aceite_auto: data.op_aceite_auto ?? false,
        });
      }
    })();
  }, [userId]);

  const [selectedCities, setSelectedCities] = useState<CityConfig[]>([]);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
  const [wasteSearch, setWasteSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedState, setSelectedState] = useState<string>("SP");
  const [manageCity, setManageCity] = useState<CityConfig | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingLicenseId, setPendingLicenseId] = useState<string | null>(null);

  const [states, setStates] = useState<string[]>([]);
  const [citiesInState, setCitiesInState] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=sigla");
        const data: { sigla: string }[] = await res.json();
        setStates(data.map((s) => s.sigla).sort((a, b) => a.localeCompare(b)));
      } catch {
        toast.error("Erro ao carregar estados do IBGE");
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedState) return;
    setLoadingCities(true);
    (async () => {
      try {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`);
        const data: { nome: string }[] = await res.json();
        setCitiesInState(data.map((c) => c.nome));
      } catch {
        setCitiesInState([]);
        toast.error("Erro ao carregar cidades do IBGE");
      } finally {
        setLoadingCities(false);
      }
    })();
  }, [selectedState]);

  const [wasteTypes, setWasteTypes] = useState<{ id: string; label: string; description: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("classes_residuo")
        .select("id, nome, descricao")
        .order("nome", { ascending: true });
      if (error) {
        toast.error("Erro ao carregar tipos de resíduos");
        return;
      }
      setWasteTypes((data ?? []).map((r) => ({
        id: r.id,
        label: r.nome,
        description: r.descricao ?? "",
      })));
    })();
  }, []);

  // Carrega resíduos atendidos pelo locador
  useEffect(() => {
    if (!userId || wasteTypes.length === 0) return;
    (async () => {
      const { data, error } = await supabase
        .from("locador_residuos")
        .select("classe_residuo_id")
        .eq("user_id", userId);
      if (error) {
        toast.error("Erro ao carregar resíduos: " + error.message);
        return;
      }
      const idToLabel = new Map(wasteTypes.map((w) => [w.id, w.label]));
      setSelectedWasteTypes(
        (data ?? [])
          .map((r) => idToLabel.get(r.classe_residuo_id))
          .filter((l): l is string => !!l),
      );
    })();
  }, [userId, wasteTypes]);

  // Carrega licenças por cidade e documentos do usuário
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data: cidades, error: e1 } = await supabase
        .from("licenca_cidade")
        .select("id, estado, cidade, status_prefeitura, motivo_prefeitura")
        .eq("user_id", userId);
      if (e1) {
        toast.error("Erro ao carregar cidades: " + e1.message);
        return;
      }
      const ids = (cidades ?? []).map((c) => c.id);
      const { data: docs } = ids.length
        ? await supabase
            .from("documentos_licenca_cidade")
            .select("id, licenca_cidade_id, nome, data_vencimento, arquivo_path, status, motivo_recusa")
            .in("licenca_cidade_id", ids)
        : { data: [] as any[] };
      setSelectedCities(
        (cidades ?? []).map((c) => ({
          id: c.id,
          name: c.cidade,
          state: c.estado,
          status_prefeitura: (c as { status_prefeitura?: string | null }).status_prefeitura ?? null,
          motivo_prefeitura: (c as { motivo_prefeitura?: string | null }).motivo_prefeitura ?? null,
          licenses: (docs ?? [])
            .filter((d: any) => d.licenca_cidade_id === c.id)
            .map((d: any) => ({
              id: d.id,
              name: d.nome ?? "",
              expiry: d.data_vencimento ?? undefined,
              file_path: d.arquivo_path ?? undefined,
              file: d.arquivo_path ? d.arquivo_path.split("/").pop() : undefined,
              status: d.status ?? "aguardando_validacao",
              motivo_recusa: d.motivo_recusa ?? null,
            })),
        }))
      );
    })();
  }, [userId]);

  const handleSave = async () => {
    if (userId) {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({ user_id: userId, ...prefs }, { onConflict: "user_id" });
      if (error) {
        toast.error("Erro ao salvar preferências");
        return;
      }

      // Sincroniza resíduos atendidos
      const labelToId = new Map(wasteTypes.map((w) => [w.label, w.id]));
      const selectedIds = selectedWasteTypes
        .map((l) => labelToId.get(l))
        .filter((id): id is string => !!id);

      const { data: current, error: e1 } = await supabase
        .from("locador_residuos")
        .select("classe_residuo_id")
        .eq("user_id", userId);
      if (e1) {
        toast.error("Erro ao salvar resíduos: " + e1.message);
        return;
      }
      const currentIds = new Set((current ?? []).map((r) => r.classe_residuo_id));
      const toInsert = selectedIds.filter((id) => !currentIds.has(id));
      const toDelete = [...currentIds].filter((id) => !selectedIds.includes(id));

      if (toDelete.length) {
        const { error: eDel } = await supabase
          .from("locador_residuos")
          .delete()
          .eq("user_id", userId)
          .in("classe_residuo_id", toDelete);
        if (eDel) {
          toast.error("Erro ao remover resíduos: " + eDel.message);
          return;
        }
      }
      if (toInsert.length) {
        const { error: eIns } = await supabase
          .from("locador_residuos")
          .insert(toInsert.map((id) => ({ user_id: userId, classe_residuo_id: id })));
        if (eIns) {
          toast.error("Erro ao adicionar resíduos: " + eIns.message);
          return;
        }
      }
    }

    if (role === "admin") {
      const { error: eAdmin } = await supabase
        .from("system_settings")
        .update(adminSettings)
        .eq("singleton", true);
      if (eAdmin) {
        toast.error("Erro ao salvar administração: " + eAdmin.message);
        return;
      }
    }

    toast.success("Configurações salvas com sucesso!");
  };

  const toggleCity = async (cityName: string) => {
    if (!userId) return;
    const existing = selectedCities.find(c => c.name === cityName && c.state === selectedState);
    if (existing) {
      const { error } = await supabase.from("licenca_cidade").delete().eq("id", existing.id!);
      if (error) return toast.error("Erro ao remover: " + error.message);
      setSelectedCities(prev => prev.filter(c => c.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from("licenca_cidade")
        .upsert(
          { user_id: userId, estado: selectedState, cidade: cityName },
          { onConflict: "user_id,estado,cidade" }
        )
        .select("id")
        .single();
      if (error) return toast.error("Erro ao adicionar: " + error.message);
      setSelectedCities(prev =>
        prev.some(c => c.id === data.id)
          ? prev
          : [...prev, { id: data.id, name: cityName, state: selectedState, licenses: [] }]
      );
    }
  };

  const allStateSelected = citiesInState.length > 0 && citiesInState.every(name => 
    selectedCities.some(c => c.name === name && c.state === selectedState)
  );

  const toggleAllStateCities = async () => {
    if (!userId) return;
    if (allStateSelected) {
      const { error } = await supabase
        .from("licenca_cidade")
        .delete()
        .eq("user_id", userId)
        .eq("estado", selectedState);
      if (error) return toast.error("Erro ao remover cidades: " + error.message);
      setSelectedCities(prev => prev.filter(c => c.state !== selectedState));
    } else {
      const missing = citiesInState.filter(
        name => !selectedCities.some(c => c.name === name && c.state === selectedState)
      );
      if (missing.length === 0) return;
      const { data, error } = await supabase
        .from("licenca_cidade")
        .upsert(
          missing.map(name => ({ user_id: userId, estado: selectedState, cidade: name })),
          { onConflict: "user_id,estado,cidade" }
        )
        .select("id, estado, cidade");
      if (error) return toast.error("Erro ao adicionar cidades: " + error.message);
      setSelectedCities(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const additions = (data ?? [])
          .filter(d => !existingIds.has(d.id))
          .map(d => ({ id: d.id, name: d.cidade, state: d.estado, licenses: [] }));
        return [...prev, ...additions];
      });
    }
  };

  const removeCity = async (cityName: string, state: string) => {
    const city = selectedCities.find(c => c.name === cityName && c.state === state);
    if (!city?.id) return;
    const { error } = await supabase.from("licenca_cidade").delete().eq("id", city.id);
    if (error) return toast.error("Erro ao remover: " + error.message);
    setSelectedCities(prev => prev.filter(c => c.id !== city.id));
  };

  const resetCityStatus = async (cityId: string) => {
    const { error } = await supabase
      .from("licenca_cidade")
      .update({
        status_prefeitura: "aguardando_validacao",
        motivo_prefeitura: null,
        validado_em: null,
        validado_por: null,
      })
      .eq("id", cityId);
    if (error) {
      toast.error("Erro ao atualizar status: " + error.message);
      return;
    }
    setSelectedCities(prev => prev.map(c =>
      c.id === cityId ? { ...c, status_prefeitura: "aguardando_validacao", motivo_prefeitura: null } : c
    ));
    setManageCity(prev => prev && prev.id === cityId
      ? { ...prev, status_prefeitura: "aguardando_validacao", motivo_prefeitura: null }
      : prev);
  };

  const addLicense = async (cityName: string, state: string) => {
    if (!userId) return;
    const city = selectedCities.find(c => c.name === cityName && c.state === state);
    if (!city?.id) return;
    const { data, error } = await supabase
      .from("documentos_licenca_cidade")
      .insert({ licenca_cidade_id: city.id, user_id: userId, nome: "" })
      .select("id, status")
      .single();
    if (error) return toast.error("Erro ao adicionar documento: " + error.message);
    const newLicense: LicenseDoc = { id: data.id, name: "", status: data.status };
    setSelectedCities(prev => prev.map(c =>
      c.id === city.id ? { ...c, licenses: [...c.licenses, newLicense] } : c
    ));
    setManageCity(prev => prev ? { ...prev, licenses: [...prev.licenses, newLicense] } : prev);
    await resetCityStatus(city.id);
  };

  const updateLicense = async (cityName: string, state: string, licenseId: string, field: keyof LicenseDoc, value: string) => {
    const city = selectedCities.find(c => c.name === cityName && c.state === state);
    setSelectedCities(prev => prev.map(c =>
      c.name === cityName && c.state === state
        ? { ...c, licenses: c.licenses.map(l => l.id === licenseId ? { ...l, [field]: value, status: "aguardando_validacao", motivo_recusa: null } : l) }
        : c
    ));
    setManageCity(prev => prev && prev.name === cityName ? {
      ...prev,
      licenses: prev.licenses.map(l => l.id === licenseId ? { ...l, [field]: value, status: "aguardando_validacao", motivo_recusa: null } : l)
    } : prev);
    const dbField =
      field === "name" ? "nome" :
      field === "expiry" ? "data_vencimento" :
      field === "status" ? "status" : null;
    if (!dbField) return;
    const val = value === "" ? null : value;
    const payload =
      dbField === "nome"
        ? { nome: val as string | null, status: "aguardando_validacao" as const, motivo_recusa: null }
        : dbField === "data_vencimento"
        ? { data_vencimento: val as string | null, status: "aguardando_validacao" as const, motivo_recusa: null }
        : { status: val as "aguardando_validacao" | "aceito" | "negado" };
    const { error } = await supabase
      .from("documentos_licenca_cidade")
      .update(payload)
      .eq("id", licenseId);
    if (error) toast.error("Erro ao salvar: " + error.message);
    if (city?.id && dbField !== "status") await resetCityStatus(city.id);
  };

  const removeLicense = async (cityName: string, state: string, licenseId: string) => {
    const city = selectedCities.find(c => c.name === cityName && c.state === state);
    const { error } = await supabase.from("documentos_licenca_cidade").delete().eq("id", licenseId);
    if (error) return toast.error("Erro ao remover documento: " + error.message);
    setSelectedCities(prev => prev.map(c =>
      c.name === cityName && c.state === state
        ? { ...c, licenses: c.licenses.filter(l => l.id !== licenseId) }
        : c
    ));
    setManageCity(prev => prev && prev.name === cityName ? {
      ...prev,
      licenses: prev.licenses.filter(l => l.id !== licenseId)
    } : prev);
    if (city?.id) await resetCityStatus(city.id);
  };

  const triggerFileUpload = (licenseId: string) => {
    setPendingLicenseId(licenseId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const licId = pendingLicenseId;
    setPendingLicenseId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file || !licId || !manageCity || !userId) return;
    const path = `${userId}/licencas/${licId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from("documentos-legais")
      .upload(path, file, { upsert: true });
    if (upErr) return toast.error("Erro ao enviar arquivo: " + upErr.message);
    const { error } = await supabase
      .from("documentos_licenca_cidade")
      .update({ arquivo_path: path, status: "aguardando_validacao", motivo_recusa: null })
      .eq("id", licId);
    if (error) return toast.error("Erro ao salvar arquivo: " + error.message);
    setSelectedCities(prev => prev.map(c =>
      c.name === manageCity.name && c.state === manageCity.state
        ? { ...c, licenses: c.licenses.map(l => l.id === licId ? { ...l, file: file.name, file_path: path, status: "aguardando_validacao", motivo_recusa: null } : l) }
        : c
    ));
    setManageCity(prev => prev ? {
      ...prev,
      licenses: prev.licenses.map(l => l.id === licId ? { ...l, file: file.name, file_path: path, status: "aguardando_validacao", motivo_recusa: null } : l)
    } : prev);
    const cityId = manageCity.id;
    if (cityId) await resetCityStatus(cityId);
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
                  <Switch checked={prefs.notif_email} onCheckedChange={(v) => setPref("notif_email", v)} />
                </ConfigField>
                <Separator />
                <ConfigField 
                  title="Notificações Push" 
                  description="Receba alertas em tempo real no seu navegador"
                >
                  <Switch checked={prefs.notif_push} onCheckedChange={(v) => setPref("notif_push", v)} />
                </ConfigField>
                <Separator />
                <ConfigField 
                  title="Alertas de Prazo" 
                  description="Avisar 24h antes do vencimento de documentos"
                >
                  <Switch checked={prefs.notif_prazo} onCheckedChange={(v) => setPref("notif_prazo", v)} />
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
                    <Switch checked={adminSettings.aprovacao_automatica} onCheckedChange={(v) => setAdmin("aprovacao_automatica", v)} />
                  </ConfigField>
                  <Separator />
                  <ConfigField 
                    title="Logs de Auditoria" 
                    description="Manter registro detalhado de todas as ações dos usuários"
                  >
                    <Switch checked={adminSettings.logs_auditoria} onCheckedChange={(v) => setAdmin("logs_auditoria", v)} />
                  </ConfigField>
                  <Separator />
                  <ConfigField 
                    title="Manutenção do Sistema" 
                    description="Ativar modo de manutenção (apenas admins podem logar)"
                  >
                    <Switch checked={adminSettings.manutencao_sistema} onCheckedChange={(v) => setAdmin("manutencao_sistema", v)} />
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
                              <TableHead className="text-xs h-9 w-32 text-center">Situação</TableHead>
                              <TableHead className="text-xs h-9 w-32 text-right pr-3">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedCities.map((city) => {
                              const hasDocs = city.licenses.length > 0;
                              const statusMeta = (s?: string) => {
                                switch (s) {
                                  case "aceito":
                                    return { label: "Aceito", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
                                  case "negado":
                                    return { label: "Negado", cls: "bg-red-100 text-red-700 border-red-200" };
                                  default:
                                    return { label: "Aguardando validação", cls: "bg-amber-100 text-amber-700 border-amber-200" };
                                }
                              };
                              const cityStatus = city.status_prefeitura === "validado"
                                ? { label: "Aprovada", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" }
                                : city.status_prefeitura === "rejeitado"
                                ? { label: "Não aprovada", cls: "bg-red-100 text-red-700 border-red-200" }
                                : !hasDocs
                                ? { label: "Sem documentos", cls: "bg-muted text-muted-foreground border-border" }
                                : { label: "Aguardando validação", cls: "bg-amber-100 text-amber-700 border-amber-200" };
                              return (
                                <Fragment key={`${city.state}-${city.name}`}>
                                <TableRow className="hover:bg-muted/30">
                                  <TableCell className="text-xs font-medium py-2.5">{city.name}</TableCell>
                                  <TableCell className="text-xs text-center text-muted-foreground py-2.5">{city.state}</TableCell>
                                  <TableCell className="text-center py-2.5">
                                     <Badge variant="outline" className={`text-[10px] h-5 px-1.5 whitespace-nowrap ${cityStatus.cls}`}>
                                      {cityStatus.label}
                                    </Badge>
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
                                {hasDocs && city.licenses.map((lic) => {
                                  const m = statusMeta(lic.status);
                                  return (
                                    <TableRow key={`${city.state}-${city.name}-${lic.id}`} className="bg-muted/20 hover:bg-muted/30">
                                       <TableCell className="py-1.5 text-[11px] text-muted-foreground" colSpan={2}>
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-3 w-3 text-primary/70" />
                                          <span className="truncate max-w-[220px]">{lic.name || "Sem nome"}</span>
                                          {lic.expiry && (
                                            <span className="text-[10px] text-muted-foreground/70">
                                              · vence {new Date(lic.expiry).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                      </TableCell>
                                       <TableCell className="py-1.5 text-right pr-3" colSpan={2}>
                                         <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${m.cls}`}>
                                           {m.label}
                                         </Badge>
                                       </TableCell>
                                    </TableRow>
                                  );
                                })}
                                </Fragment>
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
                      <Switch checked={prefs.op_disponibilidade_auto} onCheckedChange={(v) => setPref("op_disponibilidade_auto", v)} />
                    </ConfigField>
                    <Separator />
                    <ConfigField 
                      title="Visibilidade de Frota" 
                      description="Permitir que locatários vejam a localização aproximada da frota"
                    >
                      <Switch checked={prefs.op_visibilidade_frota} onCheckedChange={(v) => setPref("op_visibilidade_frota", v)} />
                    </ConfigField>
                    <Separator />
                    <ConfigField 
                      title="Aceite Automático" 
                      description="Aceitar pedidos automaticamente dentro da área de cobertura"
                    >
                      <Switch checked={prefs.op_aceite_auto} onCheckedChange={(v) => setPref("op_aceite_auto", v)} />
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
                  <Switch checked={prefs.seg_2fa} onCheckedChange={(v) => setPref("seg_2fa", v)} />
                </ConfigField>
                <Separator />
                <ConfigField 
                  title="Sessões Ativas" 
                  description="Deslogar de outros dispositivos ao entrar em um novo"
                >
                  <Switch checked={prefs.seg_sessoes_unicas} onCheckedChange={(v) => setPref("seg_sessoes_unicas", v)} />
                </ConfigField>
                <Separator />
                <ConfigField 
                  title="Compartilhamento de Dados" 
                  description="Permitir uso anônimo de dados para melhoria da plataforma"
                >
                  <Switch checked={prefs.seg_compartilhar_dados} onCheckedChange={(v) => setPref("seg_compartilhar_dados", v)} />
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
            <DialogTitle>
              Licenças - {manageCity?.name} / {manageCity?.state}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            <p className="text-sm text-muted-foreground">
              Adicione todos os documentos exigidos para operar nesta cidade.
            </p>
            {manageCity?.status_prefeitura === "validado" && manageCity?.motivo_prefeitura && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/30 p-3">
                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  Locador aprovado pela prefeitura
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 whitespace-pre-wrap">
                  {manageCity.motivo_prefeitura}
                </p>
              </div>
            )}
            {manageCity?.status_prefeitura === "rejeitado" && manageCity?.motivo_prefeitura && (
              <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30 p-3">
                <p className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                  Locador rejeitado pela prefeitura
                </p>
                <p className="text-xs text-red-800 dark:text-red-300 mt-1 whitespace-pre-wrap">
                  {manageCity.motivo_prefeitura}
                </p>
              </div>
            )}
            {manageCity?.licenses.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-muted/20">
                <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum documento adicionado.</p>
              </div>
            )}
            {manageCity?.licenses.map((lic, idx) => (
              <div key={lic.id} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">Documento #{idx + 1}</Badge>
                    {lic.status === "aceito" && (
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-emerald-100 text-emerald-700 border-emerald-200">Aceito</Badge>
                    )}
                    {lic.status === "negado" && (
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-red-100 text-red-700 border-red-200">Negado</Badge>
                    )}
                    {(!lic.status || lic.status === "aguardando_validacao") && (
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-amber-100 text-amber-700 border-amber-200">Aguardando validação</Badge>
                    )}
                  </div>
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

                {lic.motivo_recusa && (lic.status === "aceito" || lic.status === "negado") && (
                  <div className={`rounded-md border p-2.5 ${
                    lic.status === "aceito"
                      ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/30"
                      : "border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30"
                  }`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-wide ${
                      lic.status === "aceito" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                    }`}>
                      {lic.status === "aceito" ? "Observação da validação" : "Motivo da recusa"}
                    </p>
                    <p className={`text-xs mt-1 whitespace-pre-wrap ${
                      lic.status === "aceito" ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"
                    }`}>
                      {lic.motivo_recusa}
                    </p>
                  </div>
                )}

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