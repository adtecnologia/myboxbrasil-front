CREATE OR REPLACE FUNCTION public.can_access_rota(_rota_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.rotas r
    WHERE r.id = _rota_id
      AND (
        r.locador_id = auth.uid()
        OR r.motorista_id = auth.uid()
        OR r.destino_final_id = auth.uid()
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
        OR olu.destino_final_id = auth.uid()
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.can_access_rota(uuid) TO authenticated;

DROP POLICY IF EXISTS "Destino final vê suas rotas" ON public.rotas;
CREATE POLICY "Destino final vê suas rotas"
ON public.rotas
FOR SELECT
TO authenticated
USING (destino_final_id = auth.uid());

DROP POLICY IF EXISTS "Destino final vê itens de suas rotas" ON public.rota_itens;
CREATE POLICY "Destino final vê itens de suas rotas"
ON public.rota_itens
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rotas r
    WHERE r.id = rota_itens.rota_id
      AND r.destino_final_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.ordem_locacao_unidades olu
    WHERE olu.id = rota_itens.ordem_locacao_unidade_id
      AND olu.destino_final_id = auth.uid()
  )
);