CREATE POLICY "Locador ve pedidos onde participa"
ON public.pedidos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pedido_fornecedores pf
    WHERE pf.pedido_id = pedidos.id
      AND pf.locador_id = auth.uid()
  )
);