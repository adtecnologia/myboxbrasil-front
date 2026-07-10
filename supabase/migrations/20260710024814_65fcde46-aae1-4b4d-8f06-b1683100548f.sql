
ALTER TABLE public.documentos_licenca_cidade
  ADD COLUMN IF NOT EXISTS motivo_recusa text;

CREATE OR REPLACE FUNCTION public.get_locador_licencas_prefeitura(_locador_id uuid)
 RETURNS TABLE(id uuid, cidade text, estado text, created_at timestamp with time zone, documentos jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cidade text;
  v_estado text;
  v_is_admin boolean;
BEGIN
  IF _locador_id IS NULL THEN
    RETURN;
  END IF;

  v_is_admin := public.is_admin(auth.uid());

  IF NOT v_is_admin THEN
    IF NOT public.has_role(auth.uid(), 'prefeitura') THEN
      RAISE EXCEPTION 'Sem permissão';
    END IF;
    SELECT p.cidade, p.estado INTO v_cidade, v_estado
    FROM public.profiles p WHERE p.id = auth.uid();
    IF v_cidade IS NULL OR v_estado IS NULL THEN
      RAISE EXCEPTION 'Cidade/estado da prefeitura não configurados';
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    lc.id,
    lc.cidade,
    lc.estado,
    lc.created_at,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', d.id,
        'nome', d.nome,
        'status', d.status::text,
        'data_vencimento', d.data_vencimento,
        'arquivo_path', d.arquivo_path,
        'motivo_recusa', d.motivo_recusa,
        'created_at', d.created_at
      ) ORDER BY d.created_at DESC)
      FROM public.documentos_licenca_cidade d
      WHERE d.licenca_cidade_id = lc.id
    ), '[]'::jsonb) AS documentos
  FROM public.licenca_cidade lc
  WHERE lc.user_id = _locador_id
    AND (
      v_is_admin
      OR (lower(lc.cidade) = lower(v_cidade) AND upper(lc.estado) = upper(v_estado))
    )
  ORDER BY lc.estado, lc.cidade;
END;
$function$;

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

  IF _status = 'negado' AND (_motivo IS NULL OR btrim(_motivo) = '') THEN
    RAISE EXCEPTION 'Motivo é obrigatório ao recusar um documento';
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
         motivo_recusa = CASE WHEN _status = 'negado' THEN _motivo ELSE NULL END,
         updated_at = now()
   WHERE id = _doc_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.prefeitura_atualizar_status_documento_licenca(uuid, text, text) TO authenticated;

CREATE POLICY "Prefeitura pode gerenciar documentos da sua cidade"
ON public.documentos_licenca_cidade
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'prefeitura')
  AND EXISTS (
    SELECT 1 FROM public.licenca_cidade lc
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE lc.id = documentos_licenca_cidade.licenca_cidade_id
      AND lower(lc.cidade) = lower(p.cidade)
      AND upper(lc.estado) = upper(p.estado)
  )
)
WITH CHECK (true);
