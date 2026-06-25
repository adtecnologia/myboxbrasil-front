CREATE OR REPLACE FUNCTION public.can_access_pedido(_pedido_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pedidos p
    WHERE p.id = _pedido_id
      AND (
        p.locatario_id = _user_id
        OR public.is_admin(_user_id)
        OR EXISTS (
          SELECT 1
          FROM public.pedido_fornecedores pf
          WHERE pf.pedido_id = p.id
            AND pf.locador_id = _user_id
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_pedido_fornecedor(_pedido_fornecedor_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pedido_fornecedores pf
    JOIN public.pedidos p ON p.id = pf.pedido_id
    WHERE pf.id = _pedido_fornecedor_id
      AND (
        pf.locador_id = _user_id
        OR p.locatario_id = _user_id
        OR public.is_admin(_user_id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_create_pedido_fornecedor(_pedido_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pedidos p
    WHERE p.id = _pedido_id
      AND (p.locatario_id = _user_id OR public.is_admin(_user_id))
  );
$$;

DROP POLICY IF EXISTS "Locador ve pedidos onde participa" ON public.pedidos;
DROP POLICY IF EXISTS "Locatario ve seus pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Partes veem pedido_fornecedores" ON public.pedido_fornecedores;
DROP POLICY IF EXISTS "Dono do pedido cria fornecedores" ON public.pedido_fornecedores;
DROP POLICY IF EXISTS "Partes atualizam pedido_fornecedores" ON public.pedido_fornecedores;
DROP POLICY IF EXISTS "Partes veem ordens_locacao" ON public.ordens_locacao;
DROP POLICY IF EXISTS "Dono pedido cria ordens" ON public.ordens_locacao;
DROP POLICY IF EXISTS "Partes atualizam ordens" ON public.ordens_locacao;

CREATE POLICY "Partes veem pedidos"
ON public.pedidos
FOR SELECT
TO authenticated
USING (public.can_access_pedido(id, auth.uid()));

CREATE POLICY "Partes veem pedido_fornecedores"
ON public.pedido_fornecedores
FOR SELECT
TO authenticated
USING (public.can_access_pedido_fornecedor(id, auth.uid()));

CREATE POLICY "Dono do pedido cria fornecedores"
ON public.pedido_fornecedores
FOR INSERT
TO authenticated
WITH CHECK (public.can_create_pedido_fornecedor(pedido_id, auth.uid()));

CREATE POLICY "Partes atualizam pedido_fornecedores"
ON public.pedido_fornecedores
FOR UPDATE
TO authenticated
USING (public.can_access_pedido_fornecedor(id, auth.uid()))
WITH CHECK (public.can_access_pedido_fornecedor(id, auth.uid()));

CREATE POLICY "Partes veem ordens_locacao"
ON public.ordens_locacao
FOR SELECT
TO authenticated
USING (public.can_access_pedido_fornecedor(pedido_fornecedor_id, auth.uid()));

CREATE POLICY "Dono pedido cria ordens"
ON public.ordens_locacao
FOR INSERT
TO authenticated
WITH CHECK (public.can_access_pedido_fornecedor(pedido_fornecedor_id, auth.uid()));

CREATE POLICY "Partes atualizam ordens"
ON public.ordens_locacao
FOR UPDATE
TO authenticated
USING (public.can_access_pedido_fornecedor(pedido_fornecedor_id, auth.uid()))
WITH CHECK (public.can_access_pedido_fornecedor(pedido_fornecedor_id, auth.uid()));

REVOKE ALL ON FUNCTION public.can_access_pedido(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_access_pedido_fornecedor(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_create_pedido_fornecedor(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_pedido(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_pedido_fornecedor(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_create_pedido_fornecedor(uuid, uuid) TO authenticated, service_role;