import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Recycle, Truck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatCPF, formatCNPJ, validarDocumento } from "@/lib/auth-utils";
import myboxLogo from "@/assets/mybox-logo.png";

const Index = () => {
  const [tab, setTab] = useState<"pf" | "pj">("pf");
  const [showPassword, setShowPassword] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signInWithDocumento);

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = tab === "pf" ? formatCPF(e.target.value) : formatCNPJ(e.target.value);
    setCpfCnpj(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarDocumento(cpfCnpj)) {
      toast.error("Informe um CPF ou CNPJ válido");
      return;
    }
    if (password.length < 6) {
      toast.error("Senha deve ter ao menos 6 caracteres");
      return;
    }
    setLoading(true);
    const { error } = await signIn(cpfCnpj, password);
    setLoading(false);
    if (error) {
      toast.error("Credenciais inválidas");
      return;
    }
    navigate("/selecionar-perfil");
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative flex w-full flex-col items-center justify-center px-6 sm:px-12 lg:w-[45%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
          <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[380px]">
          <div className="mb-8 flex flex-col items-center">
            <img src={myboxLogo} alt="MyBox" className="drop-shadow-sm w-[180px] lg:w-[220px]" />
          </div>

          <Tabs value={tab} onValueChange={(v) => { setTab(v as "pf" | "pj"); setCpfCnpj(""); }} className="mb-6">
            <TabsList className="w-full h-11">
              <TabsTrigger value="pf" className="flex-1 text-sm font-medium">Pessoa Física</TabsTrigger>
              <TabsTrigger value="pj" className="flex-1 text-sm font-medium">Pessoa Jurídica</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {tab === "pf" ? "CPF" : "CNPJ"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={tab === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                  value={cpfCnpj}
                  onChange={handleCpfCnpjChange}
                  className="pl-10 h-11"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Button type="button" variant="link" className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-primary" onClick={() => navigate("/recuperar-senha")}>
                Esqueceu a senha?
              </Button>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Button variant="link" className="h-auto p-0 font-semibold text-primary" onClick={() => navigate("/cadastro")}>
              Crie sua conta
            </Button>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-primary to-[hsl(155,45%,38%)]">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-primary-foreground">
          <h2 className="text-3xl xl:text-4xl font-bold mb-4 text-center leading-tight">
            Gestão completa de<br />resíduos sólidos
          </h2>
          <p className="text-base xl:text-lg text-white/80 text-center max-w-md mb-12">
            Controle operacional, documentação e financeiro em uma única plataforma.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-lg w-full">
            {[
              { Icon: Recycle, label: "Controle de Resíduos" },
              { Icon: Truck, label: "Gestão de Transporte" },
              { Icon: BarChart3, label: "Relatórios Inteligentes" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-5 text-center border border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 80C360 20 720 100 1440 40V120H0Z" fill="white" fillOpacity="0.06" />
          <path d="M0 90C480 40 960 110 1440 60V120H0Z" fill="white" fillOpacity="0.04" />
        </svg>
      </div>
    </div>
  );
};

export default Index;
