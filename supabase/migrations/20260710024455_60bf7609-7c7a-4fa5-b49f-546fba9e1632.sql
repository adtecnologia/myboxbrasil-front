CREATE OR REPLACE FUNCTION public.get_locador_licencas_prefeitura(_locador_id uuid)
RETURNS TABLE(
  id uuid,
  cidade text,
  estado text,
  created_at timestamptz,
  documentos jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cidade text;
  v_estado text;
  v_ok boolean;
BEGIN
  IF _locador_id IS NULL THEN
    RETURN;
  END IF;

  IF public.is_admin(auth.uid()) THEN
    v_ok := true;
  ELSIF public.has_role(auth.uid(), 'prefeitura') THEN
    SELECT p.cidade, p.estado INTO v_cidade, v_estado
    FROM public.profiles p WHERE p.id = auth.uid();
    IF v_cidade IS NULL OR v_estado IS NULL THEN
      RAISE EXCEPTION 'Cidade/estado da prefeitura não configurados';
    END IF;
    SELECT EXISTS (
      SELECT 1 FROM public.licenca_cidade lc
      WHERE lc.user_id = _locador_id
        AND lower(lc.cidade) = lower(v_cidade)
        AND upper(lc.estado) = upper(v_estado)
    ) INTO v_ok;
  ELSE
    v_ok := false;
  END IF;

  IF NOT v_ok THEN
    RAISE EXCEPTION 'Sem permissão';
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
        'created_at', d.created_at
      ) ORDER BY d.created_at DESC)
      FROM public.documentos_licenca_cidade d
      WHERE d.licenca_cidade_id = lc.id
    ), '[]'::jsonb) AS documentos
  FROM public.licenca_cidade lc
  WHERE lc.user_id = _locador_id
  ORDER BY lc.estado, lc.cidade;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_locador_licencas_prefeitura(uuid) TO authenticated;