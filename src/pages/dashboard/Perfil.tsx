import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    cidade_estado: "",
  });
  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
          cidade_estado: data.cidade && data.estado ? `${data.cidade} - ${data.estado}` : "",
        });
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
    const [cidade, estado] = form.cidade_estado.includes(" - ")
      ? form.cidade_estado.split(" - ")
      : [form.cidade_estado || null, null];
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

  return (
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
                  <AvatarImage src={myboxLogo} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">MB</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition"
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
                      onChange={(e) => setField("cep", formatCEP(e.target.value))}
                      placeholder="00000-000"
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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
                  <Field label="Cidade - Estado" required>
                    <Select
                      value={form.cidade_estado}
                      onValueChange={(v) => setField("cidade_estado", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="São José do Rio Preto - SP">São José do Rio Preto - SP</SelectItem>
                        <SelectItem value="Mirassol - SP">Mirassol - SP</SelectItem>
                        <SelectItem value="Bady Bassitt - SP">Bady Bassitt - SP</SelectItem>
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
  );
};

export default Perfil;
