import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import type { MotoristaRotaItem } from "@/hooks/useMotoristaRotas";

export type LocadorRota = {
  id: string;
  data_programada: string | null;
  status: string;
  motorista_id: string | null;
  motorista_nome: string | null;
  veiculo: { placa: string | null; marca: string | null; modelo: string | null } | null;
  itens: MotoristaRotaItem[];
};

export function useLocadorRotas() {
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore((s) => s.activeProfile() ?? s.user?.profiles[0] ?? null);
  const rawTenant = activeProfile?.tenantId;
  const locadorId = rawTenant && rawTenant !== "self" ? rawTenant : user?.id;

  return useQuery({
    queryKey: ["locador-rotas", locadorId],
    enabled: !!locadorId,
    queryFn: async (): Promise<LocadorRota[]> => {
      const { data, error } = await supabase.rpc("get_locador_rotas", {
        _locador: locadorId!,
      });
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      const parsed = rows.map((row) => {
        const rota = row as Partial<LocadorRota>;
        return {
          id: String(rota.id ?? ""),
          data_programada: rota.data_programada ?? null,
          status: String(rota.status ?? ""),
          motorista_id: rota.motorista_id ?? null,
          motorista_nome: null,
          veiculo: rota.veiculo ?? null,
          itens: Array.isArray(rota.itens) ? rota.itens : [],
        };
      });

      const motoristaIds = Array.from(
        new Set(parsed.map((rota) => rota.motorista_id).filter(Boolean)),
      ) as string[];
      if (!motoristaIds.length) return parsed;

      const { data: motoristas } = await supabase
        .from("profiles")
        .select("id, nome")
        .in("id", motoristaIds);
      const nomes = new Map((motoristas ?? []).map((profile) => [profile.id, profile.nome]));

      return parsed.map((rota) => ({
        ...rota,
        motorista_nome: rota.motorista_id ? nomes.get(rota.motorista_id) ?? null : null,
      }));
    },
  });
}