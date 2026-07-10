CREATE OR REPLACE FUNCTION public.get_destinos_licenciados_prefeitura(_uid uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  nome text,
  documento text,
  cidade text,
  estado text,
  licenca_status text
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
  roles_destino AS (
    SELECT ur.user_id
    FROM public.user_roles ur
    JOIN locs ON locs.user_id = ur.user_id
    WHERE ur.role = 'destino' AND ur.ativo = true
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
    p.id, p.nome, p.documento, p.cidade, p.estado,
    agg.licenca_status
  FROM roles_destino rd
  JOIN public.profiles p ON p.id = rd.user_id
  LEFT JOIN agg ON agg.user_id = rd.user_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_destinos_licenciados_prefeitura(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_destinos_licenciados_prefeitura(uuid) TO authenticated, service_role;