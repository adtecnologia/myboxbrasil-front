import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

export type MotoristaRotaItem = {
  id: string;
  sequencia: number;
  tipo: string;
  cliente: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
};

export type MotoristaRota = {
  id: string;
  data_programada: string | null;
  status: string;
  veiculo: { placa: string | null; marca: string | null; modelo: string | null } | null;
  itens: MotoristaRotaItem[];
};

export function useMotoristaRotas(options?: { includeFinalizadas?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const includeFinalizadas = options?.includeFinalizadas ?? false;
  return useQuery({
    queryKey: ["motorista-rotas", user?.id, includeFinalizadas],
    enabled: !!user?.id,
    queryFn: async (): Promise<MotoristaRota[]> => {
      const { data, error } = await supabase.rpc("get_motorista_rotas", {
        _motorista: user!.id,
      });
      if (error) throw error;
      const all = (data as MotoristaRota[]) ?? [];
      return includeFinalizadas
        ? all
        : all.filter((r) => r.status !== "concluida" && r.status !== "cancelada");
    },
  });
}