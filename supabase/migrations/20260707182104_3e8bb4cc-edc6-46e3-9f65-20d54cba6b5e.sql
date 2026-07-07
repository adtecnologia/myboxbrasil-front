CREATE OR REPLACE FUNCTION public.finalizar_rota_item(_rota_item_id uuid, _fotos text[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_motorista UUID;
  v_locador UUID;
  v_olu UUID;
  v_tipo TEXT;
  v_foto TEXT;
BEGIN
  SELECT r.motorista_id, r.locador_id, ri.ordem_locacao_unidade_id, lower(ri.tipo)
    INTO v_motorista, v_locador, v_olu, v_tipo
  FROM public.rota_itens ri
  JOIN public.rotas r ON r.id = ri.rota_id
  WHERE ri.id = _rota_item_id;

  IF v_motorista IS NULL THEN
    RAISE EXCEPTION 'Item de rota não encontrado';
  END IF;

  IF auth.uid() <> v_motorista AND auth.uid() <> v_locador AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão para finalizar este item';
  END IF;

  IF _fotos IS NOT NULL THEN
    FOREACH v_foto IN ARRAY _fotos LOOP
      INSERT INTO public.entrega_fotos (rota_item_id, ordem_locacao_unidade_id, motorista_id, foto_path, tipo)
      VALUES (_rota_item_id, v_olu, v_motorista, v_foto, COALESCE(v_tipo,'entrega'));
    END LOOP;
  END IF;

  IF v_olu IS NOT NULL THEN
    UPDATE public.ordem_locacao_unidades
       SET status = CASE
             WHEN v_tipo = 'retirada' THEN 'em_transito_analise'
             ELSE 'locada'
           END,
           updated_at = now()
     WHERE id = v_olu;
  END IF;
END;
$function$;