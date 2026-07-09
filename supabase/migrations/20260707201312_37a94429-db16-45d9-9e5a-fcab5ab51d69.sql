CREATE OR REPLACE FUNCTION public.confirmar_destino_final(_rota_item_id uuid, _fotos text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_motorista uuid;
  v_locador uuid;
  v_olu uuid;
  v_foto text;
BEGIN
  SELECT r.motorista_id, r.locador_id, ri.ordem_locacao_unidade_id
    INTO v_motorista, v_locador, v_olu
  FROM public.rota_itens ri
  JOIN public.rotas r ON r.id = ri.rota_id
  WHERE ri.id = _rota_item_id;

  IF v_motorista IS NULL THEN
    RAISE EXCEPTION 'Item de rota não encontrado';
  END IF;

  IF auth.uid() <> v_motorista AND auth.uid() <> v_locador AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão para confirmar destino final deste item';
  END IF;

  IF _fotos IS NOT NULL THEN
    FOREACH v_foto IN ARRAY _fotos LOOP
      INSERT INTO public.entrega_fotos (rota_item_id, ordem_locacao_unidade_id, motorista_id, foto_path, tipo)
      VALUES (_rota_item_id, v_olu, v_motorista, v_foto, 'destino_final');
    END LOOP;
  END IF;

  IF v_olu IS NOT NULL THEN
    UPDATE public.ordem_locacao_unidades
       SET status = 'aguardando_analise',
           updated_at = now()
     WHERE id = v_olu;
  END IF;
END;
$$;