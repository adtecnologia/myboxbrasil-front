ALTER TABLE public.ordem_locacao_unidades
  DROP CONSTRAINT IF EXISTS ordem_locacao_unidades_status_check;

ALTER TABLE public.ordem_locacao_unidades
  ADD CONSTRAINT ordem_locacao_unidades_status_check
  CHECK (status = ANY (ARRAY[
    'entrega_pendente'::text,
    'em_transito_locacao'::text,
    'locada'::text,
    'aguardando_retirada'::text,
    'em_transito_retirada'::text,
    'em_transito_analise'::text,
    'em_transito_destino_final'::text,
    'aguardando_analise'::text,
    'cdf_emitido'::text,
    'cancelada'::text
  ]));