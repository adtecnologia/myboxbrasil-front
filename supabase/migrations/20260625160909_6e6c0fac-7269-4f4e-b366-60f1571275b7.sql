ALTER TABLE public.ordem_locacao_unidades
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'entrega_pendente'
  CHECK (status IN ('entrega_pendente','em_entrega','entregue','em_retirada','retirada','cancelada'));

CREATE INDEX IF NOT EXISTS idx_olu_status ON public.ordem_locacao_unidades(status);