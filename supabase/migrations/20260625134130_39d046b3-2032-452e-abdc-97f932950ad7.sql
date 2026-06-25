
-- Drop old structures
DROP FUNCTION IF EXISTS public.confirmar_carrinho(uuid);
DROP TABLE IF EXISTS public.pedidos CASCADE;
DROP TYPE IF EXISTS public.pedido_status CASCADE;

-- New enums
CREATE TYPE public.pedido_status AS ENUM (
  'aguardando_pagamentos','parcialmente_pago','pago','cancelado','concluido'
);
CREATE TYPE public.pedido_fornecedor_status AS ENUM (
  'aguardando_pagamento','pago','em_separacao','agendado','entregue','cancelado'
);
CREATE TYPE public.ordem_locacao_status AS ENUM (
  'pendente','aceito','em_entrega','ativo','finalizado','cancelado','recusado'
);

-- Master order
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero BIGSERIAL UNIQUE NOT NULL,
  carrinho_id UUID REFERENCES public.carrinhos(id) ON DELETE SET NULL,
  locatario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.pedido_status NOT NULL DEFAULT 'aguardando_pagamentos',
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pedidos_locatario ON public.pedidos(locatario_id);
CREATE INDEX idx_pedidos_status ON public.pedidos(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;
GRANT USAGE, SELECT ON SEQUENCE pedidos_numero_seq TO authenticated;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locatario ve seus pedidos" ON public.pedidos FOR SELECT TO authenticated
  USING (auth.uid() = locatario_id OR public.is_admin(auth.uid()));
CREATE POLICY "Locatario cria pedidos" ON public.pedidos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = locatario_id OR public.is_admin(auth.uid()));
CREATE POLICY "Locatario atualiza pedidos" ON public.pedidos FOR UPDATE TO authenticated
  USING (auth.uid() = locatario_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = locatario_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admin/locatario deletam pedidos" ON public.pedidos FOR DELETE TO authenticated
  USING (auth.uid() = locatario_id OR public.is_admin(auth.uid()));

CREATE TRIGGER trg_pedidos_updated_at BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Supplier sub-order
CREATE TABLE public.pedido_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero BIGSERIAL UNIQUE NOT NULL,
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  locador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.pedido_fornecedor_status NOT NULL DEFAULT 'aguardando_pagamento',
  forma_pagamento_id UUID REFERENCES public.formas_pagamento(id) ON DELETE SET NULL,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pedido_fornecedores_pedido ON public.pedido_fornecedores(pedido_id);
CREATE INDEX idx_pedido_fornecedores_locador ON public.pedido_fornecedores(locador_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_fornecedores TO authenticated;
GRANT ALL ON public.pedido_fornecedores TO service_role;
GRANT USAGE, SELECT ON SEQUENCE pedido_fornecedores_numero_seq TO authenticated;
ALTER TABLE public.pedido_fornecedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partes veem pedido_fornecedores" ON public.pedido_fornecedores FOR SELECT TO authenticated
  USING (
    auth.uid() = locador_id
    OR EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND p.locatario_id = auth.uid())
    OR public.is_admin(auth.uid())
  );
CREATE POLICY "Dono do pedido cria fornecedores" ON public.pedido_fornecedores FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND p.locatario_id = auth.uid())
    OR public.is_admin(auth.uid())
  );
CREATE POLICY "Partes atualizam pedido_fornecedores" ON public.pedido_fornecedores FOR UPDATE TO authenticated
  USING (
    auth.uid() = locador_id
    OR EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND p.locatario_id = auth.uid())
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = locador_id
    OR EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND p.locatario_id = auth.uid())
    OR public.is_admin(auth.uid())
  );
CREATE POLICY "Admin deleta pedido_fornecedores" ON public.pedido_fornecedores FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_pedido_fornecedores_updated_at BEFORE UPDATE ON public.pedido_fornecedores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Rental order (1 per cacamba model within a supplier order)
CREATE TABLE public.ordens_locacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero BIGSERIAL UNIQUE NOT NULL,
  pedido_fornecedor_id UUID NOT NULL REFERENCES public.pedido_fornecedores(id) ON DELETE CASCADE,
  equipment_type public.item_tipo NOT NULL,
  cacamba_id UUID REFERENCES public.cacambas(id) ON DELETE SET NULL,
  equipamento_id UUID REFERENCES public.equipamentos(id) ON DELETE SET NULL,
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  preco_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.ordem_locacao_status NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ordens_locacao_pf ON public.ordens_locacao(pedido_fornecedor_id);
CREATE INDEX idx_ordens_locacao_status ON public.ordens_locacao(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ordens_locacao TO authenticated;
GRANT ALL ON public.ordens_locacao TO service_role;
GRANT USAGE, SELECT ON SEQUENCE ordens_locacao_numero_seq TO authenticated;
ALTER TABLE public.ordens_locacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partes veem ordens_locacao" ON public.ordens_locacao FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pedido_fornecedores pf
      JOIN public.pedidos p ON p.id = pf.pedido_id
      WHERE pf.id = pedido_fornecedor_id
        AND (p.locatario_id = auth.uid() OR pf.locador_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );
CREATE POLICY "Dono pedido cria ordens" ON public.ordens_locacao FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pedido_fornecedores pf
      JOIN public.pedidos p ON p.id = pf.pedido_id
      WHERE pf.id = pedido_fornecedor_id
        AND (p.locatario_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );
CREATE POLICY "Partes atualizam ordens" ON public.ordens_locacao FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pedido_fornecedores pf
      JOIN public.pedidos p ON p.id = pf.pedido_id
      WHERE pf.id = pedido_fornecedor_id
        AND (p.locatario_id = auth.uid() OR pf.locador_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pedido_fornecedores pf
      JOIN public.pedidos p ON p.id = pf.pedido_id
      WHERE pf.id = pedido_fornecedor_id
        AND (p.locatario_id = auth.uid() OR pf.locador_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );
CREATE POLICY "Admin deleta ordens" ON public.ordens_locacao FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_ordens_locacao_updated_at BEFORE UPDATE ON public.ordens_locacao
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- New confirmar_carrinho: builds master order + per-supplier orders + rental orders
CREATE OR REPLACE FUNCTION public.confirmar_carrinho(_carrinho_id UUID)
RETURNS public.pedidos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locatario UUID;
  v_status public.carrinho_status;
  v_pedido public.pedidos;
  v_pf RECORD;
  v_total NUMERIC(12,2);
BEGIN
  SELECT locatario_id, status INTO v_locatario, v_status
  FROM public.carrinhos WHERE id = _carrinho_id;

  IF v_locatario IS NULL THEN RAISE EXCEPTION 'Carrinho nao encontrado'; END IF;
  IF v_locatario <> auth.uid() AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissao para confirmar este carrinho';
  END IF;
  IF v_status <> 'aberto' THEN RAISE EXCEPTION 'Carrinho ja foi %', v_status; END IF;

  SELECT COALESCE(SUM(quantidade * preco_unitario),0) INTO v_total
  FROM public.carrinho_itens WHERE carrinho_id = _carrinho_id;

  INSERT INTO public.pedidos (carrinho_id, locatario_id, valor_total)
  VALUES (_carrinho_id, v_locatario, v_total)
  RETURNING * INTO v_pedido;

  -- 1 pedido_fornecedor por locador
  FOR v_pf IN
    SELECT locador_id, SUM(quantidade * preco_unitario) AS total
    FROM public.carrinho_itens
    WHERE carrinho_id = _carrinho_id
    GROUP BY locador_id
  LOOP
    WITH novo_pf AS (
      INSERT INTO public.pedido_fornecedores (pedido_id, locador_id, valor_total)
      VALUES (v_pedido.id, v_pf.locador_id, v_pf.total)
      RETURNING id
    )
    -- 1 ordem_locacao por modelo (cacamba_id/equipamento_id) deste fornecedor
    INSERT INTO public.ordens_locacao (
      pedido_fornecedor_id, equipment_type, cacamba_id, equipamento_id,
      obra_id, quantidade, preco_unitario, valor_total, observacoes
    )
    SELECT
      (SELECT id FROM novo_pf),
      ci.equipment_type, ci.cacamba_id, ci.equipamento_id,
      MAX(ci.obra_id), SUM(ci.quantidade),
      MAX(ci.preco_unitario), SUM(ci.quantidade * ci.preco_unitario),
      string_agg(ci.observacoes, ' | ')
    FROM public.carrinho_itens ci
    WHERE ci.carrinho_id = _carrinho_id
      AND ci.locador_id IS NOT DISTINCT FROM v_pf.locador_id
    GROUP BY ci.equipment_type, ci.cacamba_id, ci.equipamento_id;
  END LOOP;

  UPDATE public.carrinhos
    SET status = 'confirmado', confirmado_at = now()
    WHERE id = _carrinho_id;

  RETURN v_pedido;
END;
$$;
