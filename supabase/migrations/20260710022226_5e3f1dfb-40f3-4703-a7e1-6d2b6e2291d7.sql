-- Helper: usuário atual é prefeitura da cidade/estado de uma obra
CREATE OR REPLACE FUNCTION public.is_prefeitura_for_obra(_obra_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.obras o
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE o.id = _obra_id
      AND lower(o.cidade) = lower(p.cidade)
      AND upper(o.estado) = upper(p.estado)
      AND public.has_role(auth.uid(), 'prefeitura')
  );
$$;

-- Helper: prefeitura pode acessar pedido_fornecedor (via qualquer obra da ordem)
CREATE OR REPLACE FUNCTION public.is_prefeitura_for_pf(_pf_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ordens_locacao ol
    JOIN public.obras o ON o.id = ol.obra_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ol.pedido_fornecedor_id = _pf_id
      AND lower(o.cidade) = lower(p.cidade)
      AND upper(o.estado) = upper(p.estado)
      AND public.has_role(auth.uid(), 'prefeitura')
  );
$$;

-- Policies (idempotentes)
DROP POLICY IF EXISTS "Prefeitura vê obras da cidade" ON public.obras;
CREATE POLICY "Prefeitura vê obras da cidade"
  ON public.obras FOR SELECT
  TO authenticated
  USING (public.is_prefeitura_for_obra(id));

DROP POLICY IF EXISTS "Prefeitura vê ordens_locacao da cidade" ON public.ordens_locacao;
CREATE POLICY "Prefeitura vê ordens_locacao da cidade"
  ON public.ordens_locacao FOR SELECT
  TO authenticated
  USING (public.is_prefeitura_for_obra(obra_id));

DROP POLICY IF EXISTS "Prefeitura vê unidades da cidade" ON public.ordem_locacao_unidades;
CREATE POLICY "Prefeitura vê unidades da cidade"
  ON public.ordem_locacao_unidades FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.ordens_locacao ol
    WHERE ol.id = ordem_locacao_unidades.ordem_locacao_id
      AND public.is_prefeitura_for_obra(ol.obra_id)
  ));

DROP POLICY IF EXISTS "Prefeitura vê pedido_fornecedores da cidade" ON public.pedido_fornecedores;
CREATE POLICY "Prefeitura vê pedido_fornecedores da cidade"
  ON public.pedido_fornecedores FOR SELECT
  TO authenticated
  USING (public.is_prefeitura_for_pf(id));

DROP POLICY IF EXISTS "Prefeitura vê pedidos da cidade" ON public.pedidos;
CREATE POLICY "Prefeitura vê pedidos da cidade"
  ON public.pedidos FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pedido_fornecedores pf
    WHERE pf.pedido_id = pedidos.id
      AND public.is_prefeitura_for_pf(pf.id)
  ));