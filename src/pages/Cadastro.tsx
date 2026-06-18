import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Truck, Factory, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  formatCPF, formatCNPJ, formatCelular, formatTelefone, formatCEP, validarDocumento,
} from "@/lib/auth-utils";
import myboxLogo from "@/assets/mybox-logo.png";

type Role = "locatario" | "locador" | "destino" | null;
type PersonType = "pf" | "pj";

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

interface FormData {
  documento: string;
  nome: string;
  email: string;
  celular: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
}

const initialForm: FormData = {
  documento: "", nome: "", email: "", celular: "", telefone: "", senha: "", confirmarSenha: "",
};

const Cadastro = () => {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.signUpWithDocumento);

  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [personType, setPersonType] = useState<PersonType>("pf");
  const [currentStep, setCurrentStep] = useState("dados");
  const [showBankFields, setShowBankFields] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const roles = [
    { id: "locatario" as Role, title: "Locatário", subtitle: "Pedir caçamba", icon: Building2 },
    { id: "locador" as Role, title: "Locador", subtitle: "Fornecedor", icon: Truck },
    { id: "destino" as Role, title: "Destino Final", subtitle: "Aterro / Recicladora", icon: Factory },
  ];

  const getSteps = () => {
    const needsLicencaConta = selectedRole === "destino" || selectedRole === "locador";
    if (personType === "pf") {
      return needsLicencaConta ? ["dados", "endereco", "licenca", "conta"] : ["dados", "endereco"];
    }
    if (needsLicencaConta) return ["dados", "endereco", "responsavel", "licenca", "conta"];
    return ["dados", "endereco", "responsavel"];
  };

  const stepLabels: Record<string, string> = {
    dados: "Seus dados", endereco: "Endereço", responsavel: "Responsável",
    licenca: "Licença ambiental", conta: "Conta corrente",
  };

  const steps = getSteps();
  const currentIndex = steps.indexOf(currentStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  const handleNext = () => { if (!isLast) setCurrentStep(steps[currentIndex + 1]); };
  const handleBack = () => { if (!isFirst) setCurrentStep(steps[currentIndex - 1]); };

  const handleCreateAccount = async () => {
    if (!selectedRole) return;
    if (!validarDocumento(form.documento)) {
      toast.error("Informe um CPF/CNPJ válido");
      setCurrentStep("dados");
      return;
    }
    if (!form.nome.trim()) {
      toast.error("Informe seu nome");
      setCurrentStep("dados");
      return;
    }
    if (form.senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      setCurrentStep("dados");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      toast.error("As senhas não conferem");
      setCurrentStep("dados");
      return;
    }
    setLoading(true);
    const { error } = await signUp({
      documento: form.documento,
      nome: form.nome,
      senha: form.senha,
      emailContato: form.email || undefined,
      celular: form.celular || undefined,
      telefone: form.telefone || undefined,
      initialRole: selectedRole,
    });
    setLoading(false);
    if (error) {
      const msg = /already registered|exists/i.test(error)
        ? "Já existe uma conta com este documento"
        : error;
      toast.error(msg);
      return;
    }
    toast.success("Conta criada! Selecione seu perfil para continuar");
    navigate("/selecionar-perfil");
  };

  const senhaFields = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground"><span className="text-destructive">*</span> Senha</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={form.senha}
            onChange={(e) => update("senha", e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="pr-10"
          />
          <Button type="button" variant="ghost" size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground"><span className="text-destructive">*</span> Confirmar senha</Label>
        <Input
          type={showPassword ? "text" : "password"}
          value={form.confirmarSenha}
          onChange={(e) => update("confirmarSenha", e.target.value)}
          placeholder="Repita a senha"
        />
      </div>
    </div>
  );

  const renderDadosPF = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground"><span className="text-destructive">*</span> CPF</Label>
          <Input placeholder="000.000.000-00" value={form.documento}
            onChange={(e) => update("documento", formatCPF(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground"><span className="text-destructive">*</span> Nome</Label>
          <Input placeholder="Nome completo" value={form.nome}
            onChange={(e) => update("nome", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">E-mail</Label>
          <Input type="email" placeholder="seu@email.com" value={form.email}
            onChange={(e) => update("email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground"><span className="text-destructive">*</span> Celular</Label>
          <Input placeholder="(00) 00000-0000" value={form.celular}
            onChange={(e) => update("celular", formatCelular(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Telefone</Label>
          <Input placeholder="(00) 0000-0000" value={form.telefone}
            onChange={(e) => update("telefone", formatTelefone(e.target.value))} />
        </div>
      </div>
      {senhaFields}
    </div>
  );

  const renderDadosPJ = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground"><span className="text-destructive">*</span> CNPJ</Label>
          <Input placeholder="00.000.000/0000-00" value={form.documento}
            onChange={(e) => update("documento", formatCNPJ(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground"><span className="text-destructive">*</span> Razão Social</Label>
          <Input placeholder="Razão Social" value={form.nome}
            onChange={(e) => update("nome", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">E-mail</Label>
          <Input type="email" placeholder="contato@empresa.com" value={form.email}
            onChange={(e) => update("email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground"><span className="text-destructive">*</span> Celular</Label>
          <Input placeholder="(00) 00000-0000" value={form.celular}
            onChange={(e) => update("celular", formatCelular(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Telefone</Label>
          <Input placeholder="(00) 0000-0000" value={form.telefone}
            onChange={(e) => update("telefone", formatTelefone(e.target.value))} />
        </div>
      </div>
      {senhaFields}
    </div>
  );

  const renderEndereco = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">CEP</Label>
          <Input placeholder="00000-000" onChange={(e) => { e.target.value = formatCEP(e.target.value); }} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Logradouro</Label>
          <Input placeholder="Logradouro" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Número</Label><Input placeholder="Número" /></div>
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Complemento</Label><Input placeholder="Complemento" /></div>
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Bairro</Label><Input placeholder="Bairro" /></div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">UF</Label>
          <Select><SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
            <SelectContent>{ESTADOS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">* Endereço será detalhado após a criação da conta.</p>
    </div>
  );

  const renderResponsavel = () => (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Cadastre o responsável legal da empresa após criar a conta.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Nome</Label><Input placeholder="Nome do responsável" /></div>
        <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">CPF</Label><Input placeholder="000.000.000-00" onChange={(e) => { e.target.value = formatCPF(e.target.value); }} /></div>
      </div>
    </div>
  );

  const renderLicenca = () => (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">A licença ambiental poderá ser enviada após a criação da conta, em Documentos → Minhas Licenças.</p>
      <Button variant="outline" className="w-full justify-center gap-2" type="button" disabled>
        <Upload className="h-4 w-4" /> Anexar licença (em breve)
      </Button>
    </div>
  );

  const renderConta = () => (
    <div className="space-y-4">
      <Label className="text-xs text-muted-foreground">Deseja cadastrar conta corrente agora?</Label>
      <RadioGroup defaultValue="nao" onValueChange={(v) => setShowBankFields(v === "sim")} className="flex gap-4">
        <div className="flex items-center gap-2"><RadioGroupItem value="sim" id="sim" /><Label htmlFor="sim" className="text-sm">Sim</Label></div>
        <div className="flex items-center gap-2"><RadioGroupItem value="nao" id="nao" /><Label htmlFor="nao" className="text-sm">Depois</Label></div>
      </RadioGroup>
      {showBankFields && (
        <p className="text-xs text-muted-foreground">Os dados bancários serão preenchidos após o cadastro, em Financeiro → Minha Conta.</p>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case "dados": return personType === "pf" ? renderDadosPF() : renderDadosPJ();
      case "endereco": return renderEndereco();
      case "responsavel": return renderResponsavel();
      case "licenca": return renderLicenca();
      case "conta": return renderConta();
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative flex w-full flex-col items-center justify-center px-6 sm:px-10 lg:w-[22%] lg:min-w-[280px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
          <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[260px]">
          <div className="mb-6 flex flex-col items-center">
            <img src={myboxLogo} alt="MyBox" className="drop-shadow-sm w-[140px] lg:w-[160px]" />
          </div>

          <h2 className="text-center text-sm font-bold uppercase tracking-wider text-foreground mb-5">
            Cadastrar-se como
          </h2>

          <div className="space-y-3">
            {roles.map((role) => {
              const Icon = role.icon;
              const isActive = selectedRole === role.id;
              return (
                <Card
                  key={role.id}
                  onClick={() => { setSelectedRole(role.id); setCurrentStep("dados"); }}
                  className={`cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                  }`}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-white/20" : "bg-primary/10"}`}>
                      <Icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{role.title}</p>
                      <p className={`text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{role.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já possui conta?{" "}
            <Button variant="link" className="h-auto p-0 font-semibold text-primary" onClick={() => navigate("/")}>
              Entre aqui!
            </Button>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-primary to-[hsl(155,45%,38%)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
        </div>

        {selectedRole ? (
          <div className="relative z-10 flex items-center justify-center w-full px-8 py-12">
            <Card className="w-full max-w-3xl shadow-2xl border-border/50 bg-background/95 backdrop-blur-md">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold text-foreground mb-3 text-center">PREENCHA SEUS DADOS</h3>

                <Tabs value={personType} onValueChange={(v) => { setPersonType(v as PersonType); setCurrentStep("dados"); }} className="mb-4 flex justify-center">
                  <TabsList className="h-9">
                    <TabsTrigger value="pf" className="text-xs font-medium px-4">Pessoa física</TabsTrigger>
                    <TabsTrigger value="pj" className="text-xs font-medium px-4">Pessoa jurídica</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Tabs value={currentStep} onValueChange={setCurrentStep} className="mb-6">
                  <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none border-b border-border">
                    {steps.map((step) => (
                      <TabsTrigger key={step} value={step}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs font-medium">
                        {stepLabels[step]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="min-h-[180px]">{renderStepContent()}</div>

                <Separator className="mt-6" />
                <div className="flex justify-end gap-3 mt-4">
                  {!isFirst && <Button variant="outline" size="sm" onClick={handleBack}>Voltar</Button>}
                  {isLast ? (
                    <Button size="sm" onClick={handleCreateAccount} disabled={loading}>
                      {loading ? "Criando..." : "Criar conta"}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleNext}>Próximo</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-primary-foreground">
            <h2 className="text-3xl xl:text-4xl font-bold mb-4 text-center leading-tight">Selecione seu perfil<br />para começar</h2>
            <p className="text-base xl:text-lg text-white/80 text-center max-w-md">Escolha o tipo de cadastro que melhor se aplica ao seu negócio.</p>
          </div>
        )}
      </div>

      {selectedRole && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col lg:hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSelectedRole(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-sm font-bold text-foreground flex-1 text-center pr-9">PREENCHA SEUS DADOS</h3>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <Tabs value={personType} onValueChange={(v) => { setPersonType(v as PersonType); setCurrentStep("dados"); }} className="mb-4 flex justify-center">
              <TabsList className="h-9">
                <TabsTrigger value="pf" className="text-xs font-medium px-4">Pessoa física</TabsTrigger>
                <TabsTrigger value="pj" className="text-xs font-medium px-4">Pessoa jurídica</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center justify-center gap-1.5 mb-5">
              {steps.map((step, i) => (
                <button key={step} onClick={() => setCurrentStep(step)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentStep === step ? "w-6 bg-primary" : i < currentIndex ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted-foreground/20"
                  }`} />
              ))}
            </div>

            <p className="text-xs font-semibold text-primary mb-4 text-center">{stepLabels[currentStep]}</p>
            <div className="min-h-[200px]">{renderStepContent()}</div>
          </div>

          <div className="border-t border-border px-4 py-3 flex gap-3">
            {!isFirst && <Button variant="outline" className="flex-1 h-11" onClick={handleBack}>Voltar</Button>}
            {isLast ? (
              <Button className="flex-1 h-11 font-semibold" onClick={handleCreateAccount} disabled={loading}>
                {loading ? "Criando..." : "Criar conta"}
              </Button>
            ) : (
              <Button className="flex-1 h-11 font-semibold" onClick={handleNext}>Próximo</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cadastro;
