CREATE OR REPLACE FUNCTION public.can_access_rota(_rota_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.rotas r
    WHERE r.id = _rota_id
      AND (
        r.locador_id = auth.uid()
        OR r.motorista_id = auth.uid()
        OR public.is_admin(auth.uid())
      )
  ) OR EXISTS (
    SELECT 1
    FROM public.rota_itens ri
    JOIN public.ordem_locacao_unidades olu ON olu.id = ri.ordem_locacao_unidade_id
    JOIN public.ordens_locacao ol ON ol.id = olu.ordem_locacao_id
    WHERE ri.rota_id = _rota_id
      AND (
        public.can_access_pedido_fornecedor(ol.pedido_fornecedor_id)
        OR public.is_prefeitura_for_obra(ol.obra_id)
      )
  );
$$;

DROP POLICY IF EXISTS "Partes veem rotas relacionadas" ON public.rotas;
CREATE POLICY "Partes veem rotas relacionadas"
ON public.rotas
FOR SELECT
TO authenticated
USING (public.can_access_rota(id));

DROP POLICY IF EXISTS "Partes veem itens de rotas relacionadas" ON public.rota_itens;
CREATE POLICY "Partes veem itens de rotas relacionadas"
ON public.rota_itens
FOR SELECT
TO authenticated
USING (public.can_access_rota(rota_id));