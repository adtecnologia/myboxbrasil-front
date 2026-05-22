import { useNavigate } from "react-router-dom";
import { Building2, Truck, Factory, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import myboxLogo from "@/assets/mybox-logo.png";
import { useAuthStore, type ProfileType } from "@/stores/useAuthStore";

const profiles = [
  { id: "admin" as ProfileType, title: "Administrador", subtitle: "Gestão total", icon: ShieldCheck },
  { id: "locatario" as ProfileType, title: "Locatário", subtitle: "Pedir caçamba", icon: Building2 },
  { id: "locador" as ProfileType, title: "Locador", subtitle: "Fornecedor", icon: Truck },
  { id: "destino" as ProfileType, title: "Destino Final", subtitle: "Aterro / Recicladora", icon: Factory },
  { id: "prefeitura" as ProfileType, title: "Prefeitura", subtitle: "Fiscalização", icon: Building2 },
  { id: "motorista" as ProfileType, title: "Motorista", subtitle: "Logística e Operação", icon: Truck },
];

const SelecionarPerfil = () => {
  const navigate = useNavigate();
  const { user, setUser, setActiveProfile } = useAuthStore();

  const handleSelect = (profileType: ProfileType) => {
    // Create a mock user with the selected profile if none exists
    const currentUser = user ?? {
      id: "mock-user",
      name: "Alessandra Nair Vera Assis",
      email: "alessandra@email.com",
      profiles: [],
    };

    // Check if profile type already exists, otherwise create one
    let profile = currentUser.profiles.find((p) => p.profileType === profileType);
    if (!profile) {
      profile = {
        id: `profile-${profileType}`,
        tenantId: "tenant-default",
        tenantName: "MyBox Demo",
        profileType,
        role: "admin",
      };
      currentUser.profiles = [...currentUser.profiles, profile];
    }

    setUser(currentUser);
    setActiveProfile(profile.id);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 translate-y-1/3 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="mb-8 flex flex-col items-center">
          <img src={myboxLogo} alt="MyBox" width={180} height={180} className="drop-shadow-sm" />
          <p className="mt-2 text-sm text-muted-foreground">Gestão inteligente de resíduos</p>
        </div>

        <h2 className="text-center text-sm font-bold uppercase tracking-wider text-foreground mb-6">
          Selecione seu perfil
        </h2>

        <div className="space-y-3">
          {profiles.map((profile) => {
            const Icon = profile.icon;
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
                    <p className="text-sm font-semibold text-foreground">{profile.title}</p>
                    <p className="text-xs text-muted-foreground">{profile.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelecionarPerfil;
