
-- Motivo de recusa no subpedido
ALTER TABLE public.pedido_fornecedores
  ADD COLUMN IF NOT EXISTS motivo_recusa TEXT;

-- Vínculo entre ordens de locação e as unidades físicas de caçamba designadas pelo locador
CREATE TABLE IF NOT EXISTS public.ordem_locacao_unidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_locacao_id UUID NOT NULL REFERENCES public.ordens_locacao(id) ON DELETE CASCADE,
  cacamba_unidade_id UUID NOT NULL REFERENCES public.cacamba_unidades(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ordem_locacao_id, cacamba_unidade_id)
);

CREATE INDEX IF NOT EXISTS idx_olu_ordem ON public.ordem_locacao_unidades(ordem_locacao_id);
CREATE INDEX IF NOT EXISTS idx_olu_unidade ON public.ordem_locacao_unidades(cacamba_unidade_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ordem_locacao_unidades TO authenticated;
GRANT ALL ON public.ordem_locacao_unidades TO service_role;

ALTER TABLE public.ordem_locacao_unidades ENABLE ROW LEVEL SECURITY;

-- Quem pode ver/gerenciar: locador dono da caçamba ou partes do pedido
CREATE POLICY "Locador gerencia unidades das ordens"
ON public.ordem_locacao_unidades
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.cacamba_unidades cu
    JOIN public.cacambas c ON c.id = cu.cacamba_id
    WHERE cu.id = ordem_locacao_unidades.cacamba_unidade_id
      AND (c.locador_id = auth.uid() OR public.is_admin(auth.uid()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cacamba_unidades cu
    JOIN public.cacambas c ON c.id = cu.cacamba_id
    WHERE cu.id = ordem_locacao_unidades.cacamba_unidade_id
      AND (c.locador_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);

CREATE POLICY "Partes veem unidades das ordens"
ON public.ordem_locacao_unidades
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.ordens_locacao ol
    WHERE ol.id = ordem_locacao_unidades.ordem_locacao_id
      AND public.can_access_pedido_fornecedor(ol.pedido_fornecedor_id)
  )
);

CREATE TRIGGER trg_olu_updated_at
BEFORE UPDATE ON public.ordem_locacao_unidades
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
