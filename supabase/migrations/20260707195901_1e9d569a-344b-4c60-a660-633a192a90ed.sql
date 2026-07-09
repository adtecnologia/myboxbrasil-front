CREATE OR REPLACE FUNCTION public.can_manage_olu_residuos(_olu_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ordem_locacao_unidades olu
    JOIN public.cacamba_unidades cu ON cu.id = olu.cacamba_unidade_id
    JOIN public.cacambas c ON c.id = cu.cacamba_id
    LEFT JOIN public.rota_itens ri ON ri.ordem_locacao_unidade_id = olu.id
    LEFT JOIN public.rotas r ON r.id = ri.rota_id
    WHERE olu.id = _olu_id
      AND (
        c.locador_id = auth.uid()
        OR r.motorista_id = auth.uid()
        OR public.is_admin(auth.uid())
      )
  );
$$;

DROP POLICY IF EXISTS "Partes gerenciam residuos da unidade" ON public.ordem_locacao_unidade_residuos;

CREATE POLICY "Gerenciar residuos da unidade"
  ON public.ordem_locacao_unidade_residuos
  FOR ALL TO authenticated
  USING (public.can_manage_olu_residuos(ordem_locacao_unidade_id))
  WITH CHECK (public.can_manage_olu_residuos(ordem_locacao_unidade_id));