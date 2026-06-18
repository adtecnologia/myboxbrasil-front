
-- Torna as tabelas de configuração operacional globais:
-- leitura por qualquer autenticado, escrita só por admin.

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['classes_residuo','tecnologias_tratamento','tipos_veiculos','tipos_equipamentos','modelos_cacamba','formas_pagamento']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN locador_id DROP NOT NULL', t);
    EXECUTE format('DROP POLICY IF EXISTS "Locador gerencia %I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Locador gerencia seus %I" ON public.%I', t, t);
    EXECUTE format($p$CREATE POLICY "Autenticado lê %1$I" ON public.%1$I FOR SELECT TO authenticated USING (true)$p$, t);
    EXECUTE format($p$CREATE POLICY "Admin gerencia %1$I" ON public.%1$I FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))$p$, t);
  END LOOP;
END $$;
