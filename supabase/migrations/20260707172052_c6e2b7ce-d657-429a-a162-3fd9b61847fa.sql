
CREATE OR REPLACE FUNCTION public.iniciar_rota(_rota_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_motorista uuid;
  v_locador uuid;
  v_status text;
BEGIN
  SELECT motorista_id, locador_id, status
    INTO v_motorista, v_locador, v_status
  FROM public.rotas WHERE id = _rota_id;

  IF v_motorista IS NULL THEN
    RAISE EXCEPTION 'Rota não encontrada';
  END IF;

  IF auth.uid() <> v_motorista AND auth.uid() <> v_locador AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão para iniciar esta rota';
  END IF;

  IF v_status = 'cancelada' OR v_status = 'concluida' THEN
    RAISE EXCEPTION 'Rota já está %', v_status;
  END IF;

  UPDATE public.rotas
     SET status = 'em_andamento', updated_at = now()
   WHERE id = _rota_id;

  UPDATE public.ordem_locacao_unidades olu
     SET status = CASE
            WHEN olu.status = 'entrega_pendente' THEN 'em_transito_locacao'
            WHEN olu.status = 'aguardando_retirada' THEN 'em_transito_retirada'
            ELSE olu.status
          END,
         updated_at = now()
    FROM public.rota_itens ri
   WHERE ri.rota_id = _rota_id
     AND ri.ordem_locacao_unidade_id = olu.id
     AND olu.status IN ('entrega_pendente','aguardando_retirada');
END;
$$;

GRANT EXECUTE ON FUNCTION public.iniciar_rota(uuid) TO authenticated;
