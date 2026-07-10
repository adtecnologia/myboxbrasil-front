
CREATE POLICY "Destino final vê suas unidades"
ON public.ordem_locacao_unidades
FOR SELECT
TO authenticated
USING (destino_final_id = auth.uid());

CREATE POLICY "Destino final vê residuos de suas unidades"
ON public.ordem_locacao_unidade_residuos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ordem_locacao_unidades olu
    WHERE olu.id = ordem_locacao_unidade_residuos.ordem_locacao_unidade_id
      AND olu.destino_final_id = auth.uid()
  )
);
