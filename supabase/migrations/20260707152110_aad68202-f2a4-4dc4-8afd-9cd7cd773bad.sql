
DO $$ BEGIN
  CREATE TYPE public.fatura_status AS ENUM ('pendente','paga','cancelada','vencida');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  pedido_fornecedor_id UUID NOT NULL REFERENCES public.pedido_fornecedores(id) ON DELETE CASCADE,
  locador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  locatario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.fatura_status NOT NULL DEFAULT 'pendente',
  forma_pagamento TEXT,
  vencimento DATE,
  paga_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faturas_locatario ON public.faturas(locatario_id);
CREATE INDEX IF NOT EXISTS idx_faturas_locador ON public.faturas(locador_id);
CREATE INDEX IF NOT EXISTS idx_faturas_pedido ON public.faturas(pedido_id);
CREATE INDEX IF NOT EXISTS idx_faturas_pedido_fornecedor ON public.faturas(pedido_fornecedor_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.faturas TO authenticated;
GRANT ALL ON public.faturas TO service_role;

ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faturas: locatario ve as suas"
  ON public.faturas FOR SELECT TO authenticated
  USING (locatario_id = auth.uid() OR locador_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Faturas: locatario cria as suas"
  ON public.faturas FOR INSERT TO authenticated
  WITH CHECK (locatario_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Faturas: locador ou admin atualiza"
  ON public.faturas FOR UPDATE TO authenticated
  USING (locador_id = auth.uid() OR public.is_admin(auth.uid()) OR locatario_id = auth.uid())
  WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()) OR locatario_id = auth.uid());

CREATE POLICY "Faturas: admin remove"
  ON public.faturas FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_faturas_updated_at
  BEFORE UPDATE ON public.faturas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.gerar_faturas_pedido(_pedido_id UUID, _forma_pagamento TEXT)
RETURNS SETOF public.faturas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locatario UUID;
  v_paga BOOLEAN;
BEGIN
  SELECT locatario_id INTO v_locatario FROM public.pedidos WHERE id = _pedido_id;
  IF v_locatario IS NULL THEN
    RAISE EXCEPTION 'Pedido nao encontrado';
  END IF;
  IF v_locatario <> auth.uid() AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissao para gerar faturas deste pedido';
  END IF;

  v_paga := lower(coalesce(_forma_pagamento,'')) IN ('pix','cartao_credito','cartao','credit_card','credito');

  RETURN QUERY
  INSERT INTO public.faturas (
    pedido_id, pedido_fornecedor_id, locador_id, locatario_id,
    valor_total, status, forma_pagamento, vencimento, paga_em
  )
  SELECT
    pf.pedido_id,
    pf.id,
    pf.locador_id,
    v_locatario,
    pf.valor_total,
    CASE WHEN v_paga THEN 'paga'::public.fatura_status ELSE 'pendente'::public.fatura_status END,
    _forma_pagamento,
    CASE WHEN v_paga THEN CURRENT_DATE ELSE (CURRENT_DATE + INTERVAL '7 days')::date END,
    CASE WHEN v_paga THEN now() ELSE NULL END
  FROM public.pedido_fornecedores pf
  WHERE pf.pedido_id = _pedido_id
    AND NOT EXISTS (
      SELECT 1 FROM public.faturas f WHERE f.pedido_fornecedor_id = pf.id
    )
  RETURNING *;
END;
$$;
