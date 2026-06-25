ALTER TABLE public.ordem_locacao_unidades
  DROP CONSTRAINT IF EXISTS ordem_locacao_unidades_status_check;

ALTER TABLE public.ordem_locacao_unidades
  ADD CONSTRAINT ordem_locacao_unidades_status_check
  CHECK (status IN (
    'entrega_pendente',
    'em_transito_locacao',
    'locada',
    'aguardando_retirada',
    'em_transito_retirada',
    'em_transito_destino_final',
    'aguardando_analise',
    'cdf_emitido',
    'cancelada'
  ));