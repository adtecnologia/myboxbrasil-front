
CREATE POLICY "Destino final atualiza sua unidade"
ON public.ordem_locacao_unidades
FOR UPDATE
TO authenticated
USING (
  destino_final_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.rota_itens ri
    JOIN public.rotas r ON r.id = ri.rota_id
    WHERE ri.ordem_locacao_unidade_id = ordem_locacao_unidades.id
      AND r.destino_final_id = auth.uid()
      AND COALESCE(r.status, '') <> 'cancelada'
  )
)
WITH CHECK (
  destino_final_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.rota_itens ri
    JOIN public.rotas r ON r.id = ri.rota_id
    WHERE ri.ordem_locacao_unidade_id = ordem_locacao_unidades.id
      AND r.destino_final_id = auth.uid()
      AND COALESCE(r.status, '') <> 'cancelada'
  )
);
