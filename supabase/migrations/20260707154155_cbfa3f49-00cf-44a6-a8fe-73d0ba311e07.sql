CREATE POLICY "Locadores veem obras de suas ordens"
ON public.obras
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.ordens_locacao o
    JOIN public.pedido_fornecedores pf ON pf.id = o.pedido_fornecedor_id
    WHERE o.obra_id = obras.id
      AND pf.locador_id = auth.uid()
  )
);