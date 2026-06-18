import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import myboxLogo from "@/assets/mybox-logo.png";

const ResetSenha = () => {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasRecovery, setHasRecovery] = useState(false);

  useEffect(() => {
    // Supabase coloca o token de recovery no hash da URL
    const hash = window.location.hash;
    setHasRecovery(hash.includes("type=recovery") || hash.includes("access_token"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (senha !== confirmar) {
      toast.error("As senhas não conferem");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha atualizada com sucesso");
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <img src={myboxLogo} alt="MyBox" className="w-[180px]" />
        </div>
        <h2 className="text-center text-lg font-semibold mb-6">Definir nova senha</h2>
        {!hasRecovery && (
          <p className="mb-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Abra esta página pelo link enviado ao seu e-mail.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nova senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={show ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="pl-10 pr-10 h-11"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShow(!show)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Confirmar senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={show ? "text" : "password"}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className="pl-10 h-11"
                placeholder="••••••••"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetSenha;
