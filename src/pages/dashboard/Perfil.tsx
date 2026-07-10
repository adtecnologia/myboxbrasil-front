import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { Camera, LogOut, Moon, Sun, RefreshCw, Trash2, KeyRound, Save, Share2, Copy, Check } from "lucide-react";
import { useTheme } from "next-themes";
import myboxLogo from "@/assets/mybox-logo.png";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatCPF, formatCNPJ, formatCelular, formatTelefone, formatCEP } from "@/lib/auth-utils";
import Cropper, { type Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

const normalizeCityName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

async function getCroppedBlob(src: string, area: { x: number; y: number; width: number; height: number }): Promise<Blob | null> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
  const size = Math.min(area.width, area.height);
  const out = Math.min(size, 512);
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, out, out);
  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92));
}

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-foreground/80">
      {required && <span className="text-destructive mr-0.5">*</span>}
      {label}
    </Label>
    {children}
  </div>
);

const Perfil = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, activeProfile, logout, refreshUser } = useAuthStore();
  const profile = activeProfile();
  const isPrefeitura = profile?.profileType === "prefeitura";
  const isAdmin = profile?.profileType === "admin";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [form, setForm] = useState({
    tipo_pessoa: "juridica" as "fisica" | "juridica",
    nome: "",
    documento: "",
    tipo_documento: "" as "cpf" | "cnpj" | "",
    nome_fantasia: "",
    email: "",
    email_secundario: "",
    celular: "",
    telefone: "",
    descricao: "",
    resp_nome: "",
    resp_cpf: "",
    resp_cargo: "",
    resp_departamento: "",
    resp_email: "",
    resp_email_secundario: "",
    resp_telefone: "",
    resp_celular: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    estado: "",
    cidade: "",
  });
  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const [cepLoading, setCepLoading] = useState(false);
  const [estados, setEstados] = useState<{ sigla: string; nome: string }[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  const ufSelecionada = form.estado;
  const cidadeSelecionada = form.cidade.trim();
  const cidadeOficialSelecionada = cidadeSelecionada
    ? municipios.find((municipio) => normalizeCityName(municipio) === normalizeCityName(cidadeSelecionada))
    : "";
  const cidadeSelectValue = cidadeOficialSelecionada || cidadeSelecionada;

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );
        const data = await resp.json();
        setEstados(data.map((e: any) => ({ sigla: e.sigla, nome: e.nome })));
      } catch {
        // silencioso
      }
    })();
  }, []);

  useEffect(() => {
    if (!ufSelecionada) {
      setMunicipios([]);
      return;
    }
    (async () => {
      try {
        setLoadingMunicipios(true);
        const resp = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSelecionada}/municipios`
        );
        const data = await resp.json();
        setMunicipios(data.map((m: any) => m.nome));
      } catch {
        setMunicipios([]);
      } finally {
        setLoadingMunicipios(false);
      }
    })();
  }, [ufSelecionada]);

  useEffect(() => {
    if (!cidadeSelecionada || municipios.length === 0) return;
    if (cidadeOficialSelecionada && cidadeOficialSelecionada !== form.cidade) {
      setField("cidade", cidadeOficialSelecionada);
    }
  }, [cidadeOficialSelecionada, cidadeSelecionada, municipios.length]);

  const handleCepChange = async (value: string) => {
    const masked = formatCEP(value);
    setField("cep", masked);
    const digits = masked.replace(/\D/g, "");
    if (digits.length === 8) {
      try {
        setCepLoading(true);
        const resp = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await resp.json();
        if (data?.erro) {
          toast.error("CEP não encontrado");
          return;
        }
        setForm((prev) => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          estado: isPrefeitura ? prev.estado : (data.uf || prev.estado),
          cidade: isPrefeitura ? prev.cidade : (data.localidade || prev.cidade),
        }));
      } catch {
        toast.error("Erro ao buscar CEP");
      } finally {
        setCepLoading(false);
      }
    }
  };

  const [copied, setCopied] = useState(false);
  const sharingCode = "MB-8492-X1";

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        toast.error("Não foi possível carregar o perfil.");
      } else if (data) {
        setForm({
          tipo_pessoa: (data.tipo_pessoa as "fisica" | "juridica") ?? "juridica",
          nome: data.nome ?? "",
          documento: data.documento ?? "",
          tipo_documento: (data.tipo_documento as "cpf" | "cnpj") ?? "",
          nome_fantasia: data.nome_fantasia ?? "",
          email: data.email ?? "",
          email_secundario: data.email_secundario ?? "",
          celular: data.celular ?? "",
          telefone: data.telefone ?? "",
          descricao: data.descricao ?? "",
          resp_nome: data.resp_nome ?? "",
          resp_cpf: data.resp_cpf ?? "",
          resp_cargo: data.resp_cargo ?? "",
          resp_departamento: data.resp_departamento ?? "",
          resp_email: data.resp_email ?? "",
          resp_email_secundario: data.resp_email_secundario ?? "",
          resp_telefone: data.resp_telefone ?? "",
          resp_celular: data.resp_celular ?? "",
          cep: data.cep ?? "",
          logradouro: data.logradouro ?? "",
          numero: data.numero ?? "",
          complemento: data.complemento ?? "",
          bairro: data.bairro ?? "",
          estado: data.estado ?? "",
          cidade: data.cidade ?? "",
        });
        if (data.avatar_url) {
          setAvatarPath(data.avatar_url);
          const { data: signed } = await supabase.storage
            .from("avatars")
            .createSignedUrl(data.avatar_url, 60 * 60);
          if (!cancelled && signed?.signedUrl) setAvatarUrl(signed.signedUrl);
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sharingCode);
    setCopied(true);
    toast.success("Código copiado com sucesso!");
    setTimeout(() => setCopied(false), 2000);
  };

  const perfilLabel: Record<string, string> = {
    locatario: "Locatário PF",
    locador: "Locador",
    destino: "Destino Final",
    admin: "Administrador",
    prefeitura: "Prefeitura",
    motorista: "Motorista",
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    const cidade = form.cidade || null;
    const estado = form.estado || null;
    const { error } = await supabase
      .from("profiles")
      .update({
        tipo_pessoa: form.tipo_pessoa,
        nome: form.nome,
        nome_fantasia: form.nome_fantasia || null,
        email: form.email || null,
        email_secundario: form.email_secundario || null,
        celular: form.celular || null,
        telefone: form.telefone || null,
        descricao: form.descricao || null,
        resp_nome: form.resp_nome || null,
        resp_cpf: form.resp_cpf || null,
        resp_cargo: form.resp_cargo || null,
        resp_departamento: form.resp_departamento || null,
        resp_email: form.resp_email || null,
        resp_email_secundario: form.resp_email_secundario || null,
        resp_telefone: form.resp_telefone || null,
        resp_celular: form.resp_celular || null,
        cep: form.cep || null,
        logradouro: form.logradouro || null,
        numero: form.numero || null,
        complemento: form.complemento || null,
        bairro: form.bairro || null,
        cidade: cidade || null,
        estado: estado || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Perfil atualizado com sucesso!");
      await refreshUser();
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const formEl = e.target as HTMLFormElement;
    const novaSenha = (formEl.elements.namedItem("nova_senha") as HTMLInputElement)?.value;
    if (!novaSenha || novaSenha.length < 6) {
      toast.error("A nova senha precisa ter ao menos 6 caracteres.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) {
      toast.error("Erro ao alterar senha: " + error.message);
    } else {
      toast.success("Senha alterada com sucesso!");
      formEl.reset();
    }
  };

  const handleDelete = () => {
    toast.error("Solicitação de exclusão enviada.");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user?.id) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmCrop = async () => {
    if (!cropSrc || !croppedAreaPixels || !user?.id) return;
    setUploadingAvatar(true);
    const blob = await getCroppedBlob(cropSrc, croppedAreaPixels);
    if (!blob) {
      setUploadingAvatar(false);
      toast.error("Erro ao processar imagem.");
      return;
    }
    const path = `${user.id}/avatar-${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    if (upErr) {
      setUploadingAvatar(false);
      toast.error("Erro ao enviar foto: " + upErr.message);
      return;
    }
    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ avatar_url: path })
      .eq("id", user.id);
    if (dbErr) {
      setUploadingAvatar(false);
      toast.error("Erro ao salvar foto: " + dbErr.message);
      return;
    }
    if (avatarPath && avatarPath !== path) {
      await supabase.storage.from("avatars").remove([avatarPath]);
    }
    const { data: signed } = await supabase.storage
      .from("avatars")
      .createSignedUrl(path, 60 * 60);
    setAvatarPath(path);
    setAvatarUrl(signed?.signedUrl ?? null);
    setUploadingAvatar(false);
    setCropSrc(null);
    toast.success("Foto atualizada!");
    await refreshUser();
  };

  return (
    <>
    <div className="space-y-6 pb-10">
      <PageHeader title="Meu Perfil" subtitle="Gerencie suas informações pessoais e preferências">
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-md gap-2"
          onClick={() => navigate("/selecionar-perfil")}
        >
          <RefreshCw className="h-4 w-4" /> Trocar perfil
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-md gap-2"
          onClick={() => { logout(); navigate("/"); }}
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* ===== Coluna esquerda ===== */}
        <div className="space-y-6">
          {/* Card identidade */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-28 w-28 ring-4 ring-primary/10">
                  <AvatarImage src={avatarUrl || myboxLogo} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">MB</AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition disabled:opacity-60"
                  aria-label="Alterar foto"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                {user?.name || "MyBox Brasil"}
              </h3>
              {form.documento && (
                <p className="mt-1 text-xs font-mono text-muted-foreground">
                  {form.tipo_documento?.toUpperCase()}{form.tipo_documento ? ": " : ""}
                  {form.tipo_documento === "cnpj"
                    ? formatCNPJ(form.documento)
                    : form.tipo_documento === "cpf"
                    ? formatCPF(form.documento)
                    : form.documento}
                </p>
              )}
              <Badge className="mt-2 bg-primary/10 text-primary border-0 font-medium">
                {perfilLabel[profile?.profileType || "admin"] || "Administrador"}
              </Badge>
            </CardContent>
          </Card>

          {/* Card código de compartilhamento (Apenas para Locatário) */}
          {profile?.profileType === "locatario" && (
            <Card className="border-none shadow-sm bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Share2 className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">Código de Compartilhamento</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Compartilhe este código com seu locador para que ele possa vincular sua conta a um acordo.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-background border rounded-md px-3 py-2 text-sm font-mono flex items-center justify-center tracking-wider font-bold">
                    {sharingCode}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleCopyCode}
                    className="shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card mudar senha */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-bold text-foreground">Mudar senha</h4>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <Field label="Senha Atual" required>
                  <Input type="password" name="senha_atual" placeholder="Senha Atual" />
                </Field>
                <Field label="Senha Nova" required>
                  <Input type="password" name="nova_senha" placeholder="Senha Nova" />
                </Field>
                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm">Alterar</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Card preferências */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-foreground">Preferências</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-foreground">Modo escuro</span>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card deletar conta */}
          {!isAdmin && (
            <Card className="border-none shadow-sm border-l-4 border-l-destructive/60">
              <CardContent className="p-6">
                <h4 className="text-sm font-bold text-foreground mb-3">Deletar minha conta</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Esta ação é permanente e não poderá ser desfeita.
                </p>
                <Button
                  variant="outline"
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 gap-2"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Quero deletar minha conta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ===== Coluna direita ===== */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Linha 1: razão e fantasia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={form.tipo_pessoa === "fisica" ? "Nome Completo" : "Razão Social"} required>
                  <Input
                    value={form.nome}
                    onChange={(e) => setField("nome", e.target.value)}
                    disabled={loading}
                  />
                </Field>
                <Field label="Nome Fantasia">
                  <Input
                    value={form.nome_fantasia}
                    onChange={(e) => setField("nome_fantasia", e.target.value)}
                    placeholder="Nome Fantasia"
                  />
                </Field>
              </div>

              {/* Linha 2: emails e telefones */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Field label="E-mail Principal" required>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                </Field>
                <Field label="E-mail Secundário">
                  <Input
                    type="email"
                    value={form.email_secundario}
                    onChange={(e) => setField("email_secundario", e.target.value)}
                    placeholder="E-mail Secundário"
                  />
                </Field>
                <Field label="Celular" required>
                  <Input
                    value={form.celular}
                    onChange={(e) => setField("celular", formatCelular(e.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                </Field>
                <Field label="Telefone">
                  <Input
                    value={form.telefone}
                    onChange={(e) => setField("telefone", formatTelefone(e.target.value))}
                    placeholder="(00) 0000-0000"
                  />
                </Field>
              </div>

              <Field label="Breve descrição e/ou preferências">
                <Textarea
                  rows={4}
                  value={form.descricao}
                  onChange={(e) => setField("descricao", e.target.value)}
                  placeholder="Breve descrição e/ou preferências"
                />
              </Field>

              <div>
                <Separator />
                <h4 className="text-sm font-bold text-foreground mt-4 mb-3">Responsável</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Field label="Nome">
                    <Input
                      value={form.resp_nome}
                      onChange={(e) => setField("resp_nome", e.target.value)}
                      placeholder="Responsável - Nome"
                    />
                  </Field>
                  <Field label="CPF">
                    <Input
                      value={form.resp_cpf}
                      onChange={(e) => setField("resp_cpf", formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                    />
                  </Field>
                  <Field label="Cargo">
                    <Input
                      value={form.resp_cargo}
                      onChange={(e) => setField("resp_cargo", e.target.value)}
                      placeholder="Responsável - Cargo"
                    />
                  </Field>
                  <Field label="Departamento">
                    <Input
                      value={form.resp_departamento}
                      onChange={(e) => setField("resp_departamento", e.target.value)}
                      placeholder="Responsável - Departamento"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <Field label="E-mail Principal">
                    <Input
                      type="email"
                      value={form.resp_email}
                      onChange={(e) => setField("resp_email", e.target.value)}
                      placeholder="Responsável - E-mail Principal"
                    />
                  </Field>
                  <Field label="E-mail Secundário">
                    <Input
                      type="email"
                      value={form.resp_email_secundario}
                      onChange={(e) => setField("resp_email_secundario", e.target.value)}
                      placeholder="Responsável - E-mail Secundário"
                    />
                  </Field>
                  <Field label="Telefone">
                    <Input
                      value={form.resp_telefone}
                      onChange={(e) => setField("resp_telefone", formatTelefone(e.target.value))}
                      placeholder="(00) 0000-0000"
                    />
                  </Field>
                  <Field label="Celular">
                    <Input
                      value={form.resp_celular}
                      onChange={(e) => setField("resp_celular", formatCelular(e.target.value))}
                      placeholder="(00) 00000-0000"
                    />
                  </Field>
                </div>
              </div>

              <div>
                <Separator />
                <h4 className="text-sm font-bold text-foreground mt-4 mb-3">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Field label="CEP" required>
                    <Input
                      value={form.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      disabled={cepLoading}
                    />
                  </Field>
                  <div className="md:col-span-3">
                    <Field label="Logradouro" required>
                      <Input
                        value={form.logradouro}
                        onChange={(e) => setField("logradouro", e.target.value)}
                        placeholder="Logradouro"
                      />
                    </Field>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Field label="Número" required>
                    <Input
                      value={form.numero}
                      onChange={(e) => setField("numero", e.target.value)}
                      placeholder="Número"
                    />
                  </Field>
                  <Field label="Complemento">
                    <Input
                      value={form.complemento}
                      onChange={(e) => setField("complemento", e.target.value)}
                      placeholder="Complemento"
                    />
                  </Field>
                  <Field label="Bairro" required>
                    <Input
                      value={form.bairro}
                      onChange={(e) => setField("bairro", e.target.value)}
                      placeholder="Bairro"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Field label="Estado" required>
                    <Select
                      value={ufSelecionada}
                      onValueChange={(uf) => setForm((p) => ({ ...p, estado: uf, cidade: "" }))}
                      disabled={isPrefeitura}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((e) => (
                          <SelectItem key={e.sigla} value={e.sigla}>
                            {e.sigla} - {e.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Cidade" required>
                    <Select
                      key={`cidade-${ufSelecionada}-${loadingMunicipios ? "loading" : "ready"}-${cidadeSelectValue}-${municipios.length}`}
                      value={cidadeSelectValue || undefined}
                      onValueChange={(c) => setField("cidade", c)}
                      disabled={!ufSelecionada || loadingMunicipios || isPrefeitura}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingMunicipios ? "Carregando..." : "Cidade"}>
                          {cidadeSelectValue || undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {cidadeSelectValue && !municipios.includes(cidadeSelectValue) && (
                          <SelectItem value={cidadeSelectValue}>{cidadeSelectValue}</SelectItem>
                        )}
                        {municipios.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" className="gap-2" disabled={saving || loading}>
                  <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>

      <Dialog open={!!cropSrc} onOpenChange={(o) => !o && !uploadingAvatar && setCropSrc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajustar foto</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="relative w-full h-72 bg-muted rounded-lg overflow-hidden">
              {cropSrc && (
                <Cropper
                  image={cropSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, area) => setCroppedAreaPixels(area)}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Zoom</Label>
              <Slider value={[zoom]} min={1} max={3} step={0.01} onValueChange={(v) => setZoom(v[0])} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCropSrc(null)} disabled={uploadingAvatar}>Cancelar</Button>
            <Button onClick={handleConfirmCrop} disabled={uploadingAvatar}>
              {uploadingAvatar ? "Enviando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Perfil;
