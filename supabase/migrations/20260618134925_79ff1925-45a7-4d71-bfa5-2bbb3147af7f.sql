
-- ENUMS
CREATE TYPE public.carrinho_status AS ENUM ('aberto','confirmado','cancelado');
CREATE TYPE public.pedido_status AS ENUM ('pendente','aceito','em_entrega','ativo','finalizado','cancelado','recusado');
CREATE TYPE public.item_tipo AS ENUM ('cacamba','equipamento');

-- CARRINHOS
CREATE TABLE public.carrinhos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locatario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.carrinho_status NOT NULL DEFAULT 'aberto',
  confirmado_at TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_carrinhos_locatario ON public.carrinhos(locatario_id);
CREATE INDEX idx_carrinhos_status ON public.carrinhos(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.carrinhos TO authenticated;
GRANT ALL ON public.carrinhos TO service_role;
ALTER TABLE public.carrinhos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locatario gerencia seus carrinhos"
  ON public.carrinhos FOR ALL TO authenticated
  USING (auth.uid() = locatario_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = locatario_id OR public.is_admin(auth.uid()));

-- CARRINHO_ITENS
CREATE TABLE public.carrinho_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrinho_id UUID NOT NULL REFERENCES public.carrinhos(id) ON DELETE CASCADE,
  equipment_type public.item_tipo NOT NULL,
  cacamba_id UUID REFERENCES public.cacambas(id) ON DELETE SET NULL,
  equipamento_id UUID REFERENCES public.equipamentos(id) ON DELETE SET NULL,
  locador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  preco_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_carrinho_itens_carrinho ON public.carrinho_itens(carrinho_id);
CREATE INDEX idx_carrinho_itens_cacamba ON public.carrinho_itens(cacamba_id);
CREATE INDEX idx_carrinho_itens_equipamento ON public.carrinho_itens(equipamento_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.carrinho_itens TO authenticated;
GRANT ALL ON public.carrinho_itens TO service_role;
ALTER TABLE public.carrinho_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dono do carrinho gerencia itens"
  ON public.carrinho_itens FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.carrinhos c
    WHERE c.id = carrinho_itens.carrinho_id
      AND (c.locatario_id = auth.uid() OR public.is_admin(auth.uid()))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.carrinhos c
    WHERE c.id = carrinho_itens.carrinho_id
      AND (c.locatario_id = auth.uid() OR public.is_admin(auth.uid()))
  ));

-- PEDIDOS
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero BIGSERIAL UNIQUE,
  carrinho_id UUID REFERENCES public.carrinhos(id) ON DELETE SET NULL,
  carrinho_item_id UUID REFERENCES public.carrinho_itens(id) ON DELETE SET NULL,
  locatario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  locador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  equipment_type public.item_tipo NOT NULL,
  cacamba_id UUID REFERENCES public.cacambas(id) ON DELETE SET NULL,
  equipamento_id UUID REFERENCES public.equipamentos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  preco_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.pedido_status NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pedidos_locatario ON public.pedidos(locatario_id);
CREATE INDEX idx_pedidos_locador ON public.pedidos(locador_id);
CREATE INDEX idx_pedidos_carrinho ON public.pedidos(carrinho_id);
CREATE INDEX idx_pedidos_status ON public.pedidos(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locatario ve seus pedidos"
  ON public.pedidos FOR SELECT TO authenticated
  USING (auth.uid() = locatario_id OR auth.uid() = locador_id OR public.is_admin(auth.uid()));

CREATE POLICY "Locatario cria pedidos do seu carrinho"
  ON public.pedidos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = locatario_id OR public.is_admin(auth.uid()));

CREATE POLICY "Locador/locatario atualizam pedidos"
  ON public.pedidos FOR UPDATE TO authenticated
  USING (auth.uid() = locatario_id OR auth.uid() = locador_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = locatario_id OR auth.uid() = locador_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admin/locatario deletam pedidos"
  ON public.pedidos FOR DELETE TO authenticated
  USING (auth.uid() = locatario_id OR public.is_admin(auth.uid()));

-- TRIGGERS updated_at
CREATE TRIGGER trg_carrinhos_updated_at BEFORE UPDATE ON public.carrinhos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_carrinho_itens_updated_at BEFORE UPDATE ON public.carrinho_itens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pedidos_updated_at BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC: confirma o carrinho e gera 1 pedido por item
CREATE OR REPLACE FUNCTION public.confirmar_carrinho(_carrinho_id UUID)
RETURNS SETOF public.pedidos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locatario UUID;
  v_status public.carrinho_status;
BEGIN
  SELECT locatario_id, status INTO v_locatario, v_status
  FROM public.carrinhos WHERE id = _carrinho_id;

  IF v_locatario IS NULL THEN
    RAISE EXCEPTION 'Carrinho nao encontrado';
  END IF;
  IF v_locatario <> auth.uid() AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissao para confirmar este carrinho';
  END IF;
  IF v_status <> 'aberto' THEN
    RAISE EXCEPTION 'Carrinho ja foi % ', v_status;
  END IF;

  RETURN QUERY
  WITH inseridos AS (
    INSERT INTO public.pedidos (
      carrinho_id, carrinho_item_id, locatario_id, locador_id, obra_id,
      equipment_type, cacamba_id, equipamento_id,
      quantidade, preco_unitario, valor_total, observacoes
    )
    SELECT
      ci.carrinho_id, ci.id, v_locatario, ci.locador_id, ci.obra_id,
      ci.equipment_type, ci.cacamba_id, ci.equipamento_id,
      ci.quantidade, ci.preco_unitario, ci.preco_unitario * ci.quantidade, ci.observacoes
    FROM public.carrinho_itens ci
    WHERE ci.carrinho_id = _carrinho_id
    RETURNING *
  )
  SELECT * FROM inseridos;

  UPDATE public.carrinhos
    SET status = 'confirmado', confirmado_at = now()
    WHERE id = _carrinho_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirmar_carrinho(UUID) TO authenticated;
