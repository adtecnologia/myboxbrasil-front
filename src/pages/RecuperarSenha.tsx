import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import myboxLogo from "@/assets/mybox-logo.png";

const RecuperarSenha = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setEnviado(true);
  };

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Formulário */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 sm:px-12 lg:w-[45%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[380px]">
          <div className="mb-8 flex flex-col items-center">
            <img src={myboxLogo} alt="MyBox" width={220} height={220} className="drop-shadow-sm" />
            <p className="mt-2 text-sm text-muted-foreground">Gestão inteligente de resíduos</p>
          </div>

          {!enviado ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold text-foreground">Recuperar senha</h2>
                  <p className="text-sm text-muted-foreground">
                    Informe seu e-mail para receber as instruções de redefinição de senha.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      E-mail
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                    {loading ? "Enviando..." : "Enviar link de recuperação"}
                  </Button>
                </form>

                <Button
                  variant="ghost"
                  className="w-full gap-2 text-sm text-muted-foreground"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar ao login
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">E-mail enviado!</h2>
                <p className="text-sm text-muted-foreground">
                  Se o e-mail <strong className="text-foreground">{email}</strong> estiver cadastrado, você receberá as instruções para redefinir sua senha.
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar ao login
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Lado direito - Painel visual */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-primary to-[hsl(155,45%,38%)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 80C360 20 720 100 1440 40V120H0Z" fill="white" fillOpacity="0.06" />
          <path d="M0 90C480 40 960 110 1440 60V120H0Z" fill="white" fillOpacity="0.04" />
        </svg>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-primary-foreground">
          <h2 className="text-3xl xl:text-4xl font-bold mb-4 text-center leading-tight">
            Recupere seu acesso<br />de forma segura
          </h2>
          <p className="text-base xl:text-lg text-white/80 text-center max-w-md">
            Enviaremos um link para seu e-mail com as instruções de redefinição.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;
