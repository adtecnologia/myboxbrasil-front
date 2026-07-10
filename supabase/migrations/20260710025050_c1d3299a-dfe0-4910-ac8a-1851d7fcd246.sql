
CREATE OR REPLACE FUNCTION public.prefeitura_atualizar_status_documento_licenca(
  _doc_id uuid,
  _status text,
  _motivo text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cidade text;
  v_estado text;
  v_doc_cidade text;
  v_doc_estado text;
  v_is_admin boolean;
BEGIN
  IF _doc_id IS NULL THEN
    RAISE EXCEPTION 'Documento não informado';
  END IF;

  IF _status NOT IN ('aceito','negado','aguardando_validacao') THEN
    RAISE EXCEPTION 'Status inválido';
  END IF;

  IF _status IN ('aceito','negado') AND (_motivo IS NULL OR btrim(_motivo) = '') THEN
    RAISE EXCEPTION 'Motivo/observação é obrigatório';
  END IF;

  v_is_admin := public.is_admin(auth.uid());

  SELECT lc.cidade, lc.estado INTO v_doc_cidade, v_doc_estado
  FROM public.documentos_licenca_cidade d
  JOIN public.licenca_cidade lc ON lc.id = d.licenca_cidade_id
  WHERE d.id = _doc_id;

  IF v_doc_cidade IS NULL THEN
    RAISE EXCEPTION 'Documento não encontrado';
  END IF;

  IF NOT v_is_admin THEN
    IF NOT public.has_role(auth.uid(), 'prefeitura') THEN
      RAISE EXCEPTION 'Sem permissão';
    END IF;
    SELECT p.cidade, p.estado INTO v_cidade, v_estado
    FROM public.profiles p WHERE p.id = auth.uid();
    IF v_cidade IS NULL OR lower(v_cidade) <> lower(v_doc_cidade) OR upper(v_estado) <> upper(v_doc_estado) THEN
      RAISE EXCEPTION 'Sem permissão para gerenciar este documento';
    END IF;
  END IF;

  UPDATE public.documentos_licenca_cidade
     SET status = _status::public.status_documento_licenca,
         motivo_recusa = CASE WHEN _status IN ('aceito','negado') THEN _motivo ELSE NULL END,
         updated_at = now()
   WHERE id = _doc_id;
END;
$function$;
