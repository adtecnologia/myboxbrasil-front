import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Sincroniza o tema (claro/escuro/sistema) com a tabela user_preferences.
 * - Ao logar: carrega o tema salvo e aplica.
 * - Ao trocar o tema no app: persiste na tabela.
 */
export const useThemeSync = () => {
  const session = useAuthStore((s) => s.session);
  const { theme, setTheme } = useTheme();
  const userId = session?.user?.id ?? null;
  const loadedForUser = useRef<string | null>(null);

  // Carrega preferência ao logar
  useEffect(() => {
    if (!userId) {
      loadedForUser.current = null;
      return;
    }
    if (loadedForUser.current === userId) return;
    loadedForUser.current = userId;

    (async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("theme")
        .eq("user_id", userId)
        .maybeSingle();

      if (data?.theme) {
        setTheme(data.theme);
      } else {
        // Cria a preferência inicial com o tema atual
        await supabase
          .from("user_preferences")
          .upsert({ user_id: userId, theme: theme ?? "light" }, { onConflict: "user_id" });
      }
    })();
  }, [userId, setTheme, theme]);

  // Persiste mudanças de tema
  useEffect(() => {
    if (!userId || !theme) return;
    if (loadedForUser.current !== userId) return; // aguarda carga inicial
    supabase
      .from("user_preferences")
      .upsert({ user_id: userId, theme }, { onConflict: "user_id" })
      .then(() => {});
  }, [theme, userId]);
};
