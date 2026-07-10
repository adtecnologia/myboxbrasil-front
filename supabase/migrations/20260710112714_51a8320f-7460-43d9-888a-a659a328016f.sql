CREATE OR REPLACE FUNCTION public.is_destino_for_pf(_pf_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ordens_locacao ol
    JOIN public.ordem_locacao_unidades olu ON olu.ordem_locacao_id = ol.id
    WHERE ol.pedido_fornecedor_id = _pf_id
      AND olu.destino_final_id = auth.uid()
  ) OR EXISTS (
    SELECT 1
    FROM public.ordens_locacao ol
    JOIN public.ordem_locacao_unidades olu ON olu.ordem_locacao_id = ol.id
    JOIN public.rota_itens ri ON ri.ordem_locacao_unidade_id = olu.id
    JOIN public.rotas r ON r.id = ri.rota_id
    WHERE ol.pedido_fornecedor_id = _pf_id
      AND r.destino_final_id = auth.uid()
      AND COALESCE(r.status, '') <> 'cancelada'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_destino_for_obra(_obra_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ordens_locacao ol
    JOIN public.ordem_locacao_unidades olu ON olu.ordem_locacao_id = ol.id
    WHERE ol.obra_id = _obra_id
      AND olu.destino_final_id = auth.uid()
  ) OR EXISTS (
    SELECT 1
    FROM public.ordens_locacao ol
    JOIN public.ordem_locacao_unidades olu ON olu.ordem_locacao_id = ol.id
    JOIN public.rota_itens ri ON ri.ordem_locacao_unidade_id = olu.id
    JOIN public.rotas r ON r.id = ri.rota_id
    WHERE ol.obra_id = _obra_id
      AND r.destino_final_id = auth.uid()
      AND COALESCE(r.status, '') <> 'cancelada'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_destino_for_pedido(_pedido_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pedido_fornecedores pf
    JOIN public.ordens_locacao ol ON ol.pedido_fornecedor_id = pf.id
    JOIN public.ordem_locacao_unidades olu ON olu.ordem_locacao_id = ol.id
    WHERE pf.pedido_id = _pedido_id
      AND olu.destino_final_id = auth.uid()
  ) OR EXISTS (
    SELECT 1
    FROM public.pedido_fornecedores pf
    JOIN public.ordens_locacao ol ON ol.pedido_fornecedor_id = pf.id
    JOIN public.ordem_locacao_unidades olu ON olu.ordem_locacao_id = ol.id
    JOIN public.rota_itens ri ON ri.ordem_locacao_unidade_id = olu.id
    JOIN public.rotas r ON r.id = ri.rota_id
    WHERE pf.pedido_id = _pedido_id
      AND r.destino_final_id = auth.uid()
      AND COALESCE(r.status, '') <> 'cancelada'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_destino_for_pf(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_destino_for_obra(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_destino_for_pedido(uuid) TO authenticated;

DROP POLICY IF EXISTS "Destino final vê unidades por rota" ON public.ordem_locacao_unidades;
CREATE POLICY "Destino final vê unidades por rota"
ON public.ordem_locacao_unidades
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rota_itens ri
    JOIN public.rotas r ON r.id = ri.rota_id
    WHERE ri.ordem_locacao_unidade_id = ordem_locacao_unidades.id
      AND r.destino_final_id = auth.uid()
      AND COALESCE(r.status, '') <> 'cancelada'
  )
);