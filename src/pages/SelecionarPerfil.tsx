import { useNavigate } from "react-router-dom";
import { Building2, Truck, Factory, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore, type ProfileType } from "@/stores/useAuthStore";
import myboxLogo from "@/assets/mybox-logo.png";

const PROFILE_META: Record<ProfileType, { title: string; subtitle: string; icon: typeof Building2 }> = {
  admin:      { title: "Administrador",  subtitle: "Gestão total",            icon: ShieldCheck },
  locador:    { title: "Locador",         subtitle: "Fornecedor",              icon: Truck },
  locatario:  { title: "Locatário",       subtitle: "Pedir caçamba",           icon: Building2 },
  motorista:  { title: "Motorista",       subtitle: "Logística e Operação",    icon: Truck },
  prefeitura: { title: "Prefeitura",      subtitle: "Fiscalização",            icon: Building2 },
  destino:    { title: "Destino Final",   subtitle: "Aterro / Recicladora",    icon: Factory },
};

const SelecionarPerfil = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const setActiveProfile = useAuthStore((s) => s.setActiveProfile);
  const logout = useAuthStore((s) => s.logout);

  const handleSelect = (profileId: string) => {
    setActiveProfile(profileId);
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 translate-y-1/3 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-10">
        <div className="mb-8 flex flex-col items-center">
          <img src={myboxLogo} alt="MyBox" width={180} height={180} className="drop-shadow-sm" />
          <p className="mt-2 text-sm text-muted-foreground">
            Olá, <strong className="text-foreground">{user?.name ?? "Usuário"}</strong>
          </p>
        </div>

        <h2 className="text-center text-sm font-bold uppercase tracking-wider text-foreground mb-6">
          Selecione seu perfil
        </h2>

        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Carregando perfis...</p>
        ) : (user?.profiles.length ?? 0) === 0 ? (
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Sua conta ainda não possui um perfil ativo. Entre em contato com o administrador.
              </p>
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Sair
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {user!.profiles.map((profile) => {
              const meta = PROFILE_META[profile.profileType];
              const Icon = meta.icon;
              return (
                <Card
                  key={profile.id}
                  onClick={() => handleSelect(profile.id)}
                  className="cursor-pointer transition-all duration-200 border-border bg-card hover:border-primary hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]"
                >
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{meta.title}</p>
                      <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Button variant="ghost" className="w-full mt-6 text-xs text-muted-foreground" onClick={handleLogout}>
          Sair da conta
        </Button>
      </div>
    </div>
  );
};

export default SelecionarPerfil;
