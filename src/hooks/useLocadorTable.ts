import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

type ConfigTable =
  | "classes_residuo"
  | "tecnologias_tratamento"
  | "tipos_veiculos"
  | "tipos_equipamentos"
  | "modelos_cacamba"
  | "formas_pagamento";

/**
 * Hook genérico de CRUD para tabelas de configuração isoladas por Locador.
 * - lista (com filtro por locador via RLS)
 * - cria preenchendo locador_id = user.id (assume role 'locador' ou admin)
 * - atualiza / remove
 */
export function useLocadorTable<T extends { id: string }>(table: ConfigTable, orderBy: string = "created_at") {
  const user = useAuthStore((s) => s.user);
  const profileType = useAuthStore((s) => s.activeProfileType());
  const tenantId = useAuthStore((s) => s.activeTenantId());

  const locadorId =
    profileType === "locador" || tenantId === "self" ? user?.id ?? null : tenantId;

  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderBy, { ascending: false });
    if (error) {
      toast.error("Erro ao carregar: " + error.message);
      setRows([]);
    } else {
      setRows(((data ?? []) as unknown) as T[]);
    }
    setLoading(false);
  }, [table, orderBy, user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (values: Record<string, unknown>) => {
      const { error } = await supabase.from(table).insert(values as never);
      if (error) {
        toast.error("Erro ao salvar: " + error.message);
        return false;
      }
      toast.success("Cadastrado com sucesso!");
      await refresh();
      return true;
    },
    [table, refresh]
  );

  const update = useCallback(
    async (id: string, values: Record<string, unknown>) => {
      const { error } = await supabase.from(table).update(values as never).eq("id", id);
      if (error) {
        toast.error("Erro ao atualizar: " + error.message);
        return false;
      }
      toast.success("Atualizado com sucesso!");
      await refresh();
      return true;
    },
    [table, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        toast.error("Erro ao excluir: " + error.message);
        return false;
      }
      toast.success("Excluído.");
      await refresh();
      return true;
    },
    [table, refresh]
  );

  return { rows, loading, refresh, create, update, remove, locadorId };
}