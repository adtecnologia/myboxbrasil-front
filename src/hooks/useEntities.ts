import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export type EntityRole = Database["public"]["Enums"]["app_role"];
export type EntityProfile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Lista perfis (profiles) filtrados por papel em user_roles.
 * Ex.: useEntities('locador') retorna todos os perfis cujo usuário tem o papel 'locador' ativo.
 */
export function useEntities(role: EntityRole) {
  const [rows, setRows] = useState<EntityProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: roleRows, error: rolesErr } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", role)
      .eq("ativo", true);
    if (rolesErr) {
      toast.error("Erro ao carregar papéis: " + rolesErr.message);
      setRows([]);
      setLoading(false);
      return;
    }
    const ids = Array.from(new Set((roleRows ?? []).map((r) => r.user_id)));
    if (ids.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("id", ids)
      .order("nome", { ascending: true });
    if (error) {
      toast.error("Erro ao carregar entidades: " + error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as EntityProfile[]);
    }
    setLoading(false);
  }, [role]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(
    async (id: string, values: Partial<EntityProfile>) => {
      const { error } = await supabase.from("profiles").update(values).eq("id", id);
      if (error) {
        toast.error("Erro ao atualizar: " + error.message);
        return false;
      }
      toast.success("Atualizado!");
      await refresh();
      return true;
    },
    [refresh]
  );

  return { rows, loading, refresh, update };
}