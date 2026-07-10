
CREATE OR REPLACE FUNCTION public.is_destino_for_pf(_pf_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ordens_locacao ol
    JOIN public.ordem_locacao_unidades olu ON olu.ordem_locacao_id = ol.id
    WHERE ol.pedido_fornecedor_id = _pf_id
      AND olu.destino_final_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_destino_for_obra(_obra_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ordens_locacao ol
    JOIN public.ordem_locacao_unidades olu ON olu.ordem_locacao_id = ol.id
    WHERE ol.obra_id = _obra_id
      AND olu.destino_final_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_destino_for_pedido(_pedido_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pedido_fornecedores pf
    JOIN public.ordens_locacao ol ON ol.pedido_fornecedor_id = pf.id
    JOIN public.ordem_locacao_unidades olu ON olu.ordem_locacao_id = ol.id
    WHERE pf.pedido_id = _pedido_id
      AND olu.destino_final_id = auth.uid()
  );
$$;

CREATE POLICY "Destino final vê ordens_locacao"
ON public.ordens_locacao FOR SELECT TO authenticated
USING (public.is_destino_for_pf(pedido_fornecedor_id));

CREATE POLICY "Destino final vê pedido_fornecedores"
ON public.pedido_fornecedores FOR SELECT TO authenticated
USING (public.is_destino_for_pf(id));

CREATE POLICY "Destino final vê pedidos"
ON public.pedidos FOR SELECT TO authenticated
USING (public.is_destino_for_pedido(id));

CREATE POLICY "Destino final vê obras"
ON public.obras FOR SELECT TO authenticated
USING (public.is_destino_for_obra(id));
