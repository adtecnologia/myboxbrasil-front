CREATE OR REPLACE FUNCTION public.can_select_rota_item(_rota_id uuid, _olu_id uuid)
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
        OR r.destino_final_id = auth.uid()
        OR public.is_admin(auth.uid())
      )
  ) OR EXISTS (
    SELECT 1
    FROM public.ordem_locacao_unidades olu
    JOIN public.ordens_locacao ol ON ol.id = olu.ordem_locacao_id
    JOIN public.pedido_fornecedores pf ON pf.id = ol.pedido_fornecedor_id
    JOIN public.pedidos p ON p.id = pf.pedido_id
    LEFT JOIN public.obras o ON o.id = ol.obra_id
    LEFT JOIN public.profiles pref ON pref.id = auth.uid()
    WHERE olu.id = _olu_id
      AND (
        pf.locador_id = auth.uid()
        OR p.locatario_id = auth.uid()
        OR olu.destino_final_id = auth.uid()
        OR public.is_admin(auth.uid())
        OR (
          public.has_role(auth.uid(), 'prefeitura')
          AND o.id IS NOT NULL
          AND pref.cidade IS NOT NULL
          AND pref.estado IS NOT NULL
          AND lower(o.cidade) = lower(pref.cidade)
          AND upper(o.estado) = upper(pref.estado)
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_rota_item(_rota_id uuid)
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
        OR public.is_admin(auth.uid())
      )
  );
$$;

DROP POLICY IF EXISTS "Acesso via rota" ON public.rota_itens;
DROP POLICY IF EXISTS "Destino final vê itens de suas rotas" ON public.rota_itens;
DROP POLICY IF EXISTS "Partes veem itens de rotas relacionadas" ON public.rota_itens;

CREATE POLICY "Partes veem itens de rotas relacionadas"
ON public.rota_itens
FOR SELECT
TO authenticated
USING (public.can_select_rota_item(rota_id, ordem_locacao_unidade_id));

CREATE POLICY "Locador gerencia itens de suas rotas"
ON public.rota_itens
FOR ALL
TO authenticated
USING (public.can_manage_rota_item(rota_id))
WITH CHECK (public.can_manage_rota_item(rota_id));