import { useState } from "react";
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
  const { user, activeProfile, logout } = useAuthStore();
  const profile = activeProfile();
  const [tipoPessoa, setTipoPessoa] = useState<"fisica" | "juridica">("juridica");
  const [copied, setCopied] = useState(false);
  const sharingCode = "MB-8492-X1";

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
    administrador: "Administrador",
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Perfil atualizado com sucesso!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Senha alterada com sucesso!");
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
              <Badge className="mt-2 bg-primary/10 text-primary border-0 font-medium">
                {perfilLabel[profile?.profileType || "administrador"] || "Administrador"}
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
                  <Input type="password" placeholder="Senha Atual" />
                </Field>
                <Field label="Senha Nova" required>
                  <Input type="password" placeholder="Senha Nova" />
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
                <Field label={tipoPessoa === "fisica" ? "Nome Completo" : "Razão Social"} required>
                  <Input defaultValue="MyBox Brasil" />
                </Field>
                <Field label="Nome Fantasia">
                  <Input placeholder="Nome Fantasia" />
                </Field>
              </div>

              {/* Linha 2: emails e telefones */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Field label="E-mail Principal" required>
                  <Input type="email" defaultValue="contato@myboxbrasil.com" />
                </Field>
                <Field label="E-mail Secundário">
                  <Input type="email" placeholder="E-mail Secundário" />
                </Field>
                <Field label="Celular" required>
                  <Input placeholder="(00) 00000-0000" />
                </Field>
                <Field label="Telefone">
                  <Input placeholder="(00) 0000-0000" />
                </Field>
              </div>

              <Field label="Breve descrição e/ou preferências">
                <Textarea rows={4} placeholder="Breve descrição e/ou preferências" />
              </Field>

              <div>
                <Separator />
                <h4 className="text-sm font-bold text-foreground mt-4 mb-3">Responsável</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Field label="Nome">
                    <Input placeholder="Responsável - Nome" />
                  </Field>
                  <Field label="CPF">
                    <Input placeholder="000.000.000-00" />
                  </Field>
                  <Field label="Cargo">
                    <Input placeholder="Responsável - Cargo" />
                  </Field>
                  <Field label="Departamento">
                    <Input placeholder="Responsável - Departamento" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <Field label="E-mail Principal">
                    <Input type="email" placeholder="Responsável - E-mail Principal" />
                  </Field>
                  <Field label="E-mail Secundário">
                    <Input type="email" placeholder="Responsável - E-mail Secundário" />
                  </Field>
                  <Field label="Telefone">
                    <Input placeholder="(00) 0000-0000" />
                  </Field>
                  <Field label="Celular">
                    <Input placeholder="(00) 00000-0000" />
                  </Field>
                </div>
              </div>

              <div>
                <Separator />
                <h4 className="text-sm font-bold text-foreground mt-4 mb-3">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Field label="CEP" required>
                    <Input placeholder="00000-000" />
                  </Field>
                  <div className="md:col-span-3">
                    <Field label="Logradouro" required>
                      <Input placeholder="Logradouro" />
                    </Field>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <Field label="Número" required>
                    <Input placeholder="Número" />
                  </Field>
                  <Field label="Complemento">
                    <Input placeholder="Complemento" />
                  </Field>
                  <Field label="Bairro" required>
                    <Input placeholder="Bairro" />
                  </Field>
                  <Field label="Cidade - Estado" required>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="srp-sp">São José do Rio Preto - SP</SelectItem>
                        <SelectItem value="mir-sp">Mirassol - SP</SelectItem>
                        <SelectItem value="bad-sp">Bady Bassitt - SP</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" /> Salvar
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
