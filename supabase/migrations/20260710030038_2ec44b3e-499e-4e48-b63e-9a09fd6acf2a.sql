
ALTER TABLE public.licenca_cidade
  ADD COLUMN IF NOT EXISTS status_prefeitura text NOT NULL DEFAULT 'aguardando_validacao',
  ADD COLUMN IF NOT EXISTS motivo_prefeitura text,
  ADD COLUMN IF NOT EXISTS validado_em timestamptz,
  ADD COLUMN IF NOT EXISTS validado_por uuid;

DROP FUNCTION IF EXISTS public.get_locador_licencas_prefeitura(uuid);

CREATE OR REPLACE FUNCTION public.get_locador_licencas_prefeitura(_locador_id uuid)
 RETURNS TABLE(
   id uuid, cidade text, estado text, created_at timestamptz,
   status_prefeitura text, motivo_prefeitura text, validado_em timestamptz,
   documentos jsonb
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cidade text;
  v_estado text;
  v_is_admin boolean;
BEGIN
  IF _locador_id IS NULL THEN RETURN; END IF;
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
    lc.id, lc.cidade, lc.estado, lc.created_at,
    lc.status_prefeitura, lc.motivo_prefeitura, lc.validado_em,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', d.id, 'nome', d.nome, 'status', d.status::text,
        'data_vencimento', d.data_vencimento,
        'arquivo_path', d.arquivo_path,
        'motivo_recusa', d.motivo_recusa,
        'created_at', d.created_at
      ) ORDER BY d.created_at DESC)
      FROM public.documentos_licenca_cidade d
      WHERE d.licenca_cidade_id = lc.id
    ), '[]'::jsonb)
  FROM public.licenca_cidade lc
  WHERE lc.user_id = _locador_id
    AND (v_is_admin OR (lower(lc.cidade) = lower(v_cidade) AND upper(lc.estado) = upper(v_estado)))
  ORDER BY lc.estado, lc.cidade;
END;
$function$;

DROP FUNCTION IF EXISTS public.get_locadores_licenciados_prefeitura(uuid);

CREATE OR REPLACE FUNCTION public.get_locadores_licenciados_prefeitura(_uid uuid DEFAULT auth.uid())
 RETURNS TABLE(
   id uuid, nome text, nome_fantasia text, documento text,
   celular text, telefone text, email text, avatar_url text,
   cidade text, estado text, ativo boolean, licenca_status text
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cidade text;
  v_estado text;
BEGIN
  IF _uid IS NULL THEN RETURN; END IF;
  IF NOT (public.has_role(_uid, 'prefeitura') OR public.is_admin(_uid)) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;

  SELECT p.cidade, p.estado INTO v_cidade, v_estado
  FROM public.profiles p WHERE p.id = _uid;

  IF v_cidade IS NULL OR v_estado IS NULL THEN RETURN; END IF;

  RETURN QUERY
  WITH locs AS (
    SELECT DISTINCT lc.user_id, lc.id AS licenca_id, lc.status_prefeitura
    FROM public.licenca_cidade lc
    WHERE lower(lc.cidade) = lower(v_cidade)
      AND upper(lc.estado) = upper(v_estado)
  ),
  roles_locador AS (
    SELECT ur.user_id, bool_or(ur.ativo) AS any_ativo
    FROM public.user_roles ur
    JOIN locs ON locs.user_id = ur.user_id
    WHERE ur.role = 'locador'
    GROUP BY ur.user_id
  ),
  agg AS (
    SELECT locs.user_id,
      CASE
        WHEN bool_or(locs.status_prefeitura = 'rejeitado') THEN 'rejeitado'
        WHEN bool_and(locs.status_prefeitura = 'validado') THEN 'validado'
        WHEN COUNT(d.id) = 0 THEN 'sem_documentos'
        WHEN bool_or(d.status = 'negado') THEN 'rejeitado'
        WHEN bool_or(d.status = 'aguardando_validacao') THEN 'aguardando_validacao'
        ELSE 'aguardando_validacao'
      END AS licenca_status
    FROM locs
    LEFT JOIN public.documentos_licenca_cidade d ON d.licenca_cidade_id = locs.licenca_id
    GROUP BY locs.user_id
  )
  SELECT
    p.id, p.nome, p.nome_fantasia, p.documento,
    p.celular, p.telefone, p.email, p.avatar_url,
    p.cidade, p.estado,
    COALESCE(rl.any_ativo, false),
    agg.licenca_status
  FROM roles_locador rl
  JOIN public.profiles p ON p.id = rl.user_id
  LEFT JOIN agg ON agg.user_id = rl.user_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_locador_licencas_prefeitura(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_locadores_licenciados_prefeitura(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.prefeitura_atualizar_status_licenca(
  _licenca_id uuid,
  _status text,
  _motivo text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_cidade text; v_estado text;
  v_lic_cidade text; v_lic_estado text;
  v_is_admin boolean;
  v_docs_count int;
  v_aceitos_count int;
BEGIN
  IF _licenca_id IS NULL THEN RAISE EXCEPTION 'Licença não informada'; END IF;
  IF _status NOT IN ('validado','rejeitado','aguardando_validacao') THEN
    RAISE EXCEPTION 'Status inválido';
  END IF;
  IF _status IN ('validado','rejeitado') AND (_motivo IS NULL OR btrim(_motivo) = '') THEN
    RAISE EXCEPTION 'Motivo/observação é obrigatório';
  END IF;

  SELECT cidade, estado INTO v_lic_cidade, v_lic_estado
  FROM public.licenca_cidade WHERE id = _licenca_id;
  IF v_lic_cidade IS NULL THEN RAISE EXCEPTION 'Licença não encontrada'; END IF;

  v_is_admin := public.is_admin(auth.uid());
  IF NOT v_is_admin THEN
    IF NOT public.has_role(auth.uid(), 'prefeitura') THEN
      RAISE EXCEPTION 'Sem permissão';
    END IF;
    SELECT p.cidade, p.estado INTO v_cidade, v_estado
    FROM public.profiles p WHERE p.id = auth.uid();
    IF lower(v_cidade) <> lower(v_lic_cidade) OR upper(v_estado) <> upper(v_lic_estado) THEN
      RAISE EXCEPTION 'Sem permissão para gerenciar esta licença';
    END IF;
  END IF;

  IF _status = 'validado' THEN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'aceito')
      INTO v_docs_count, v_aceitos_count
    FROM public.documentos_licenca_cidade
    WHERE licenca_cidade_id = _licenca_id;
    IF v_docs_count = 0 THEN
      RAISE EXCEPTION 'A licença não possui documentos anexados';
    END IF;
    IF v_aceitos_count <> v_docs_count THEN
      RAISE EXCEPTION 'Todos os documentos precisam estar validados';
    END IF;
  END IF;

  UPDATE public.licenca_cidade
     SET status_prefeitura = _status,
         motivo_prefeitura = _motivo,
         validado_em = CASE WHEN _status IN ('validado','rejeitado') THEN now() ELSE NULL END,
         validado_por = CASE WHEN _status IN ('validado','rejeitado') THEN auth.uid() ELSE NULL END,
         updated_at = now()
   WHERE id = _licenca_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.prefeitura_atualizar_status_licenca(uuid, text, text) TO authenticated;
