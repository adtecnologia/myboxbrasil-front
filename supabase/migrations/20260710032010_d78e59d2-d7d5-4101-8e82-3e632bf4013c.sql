
CREATE OR REPLACE FUNCTION public.get_prefeitura_dashboard(_uid uuid DEFAULT auth.uid(), _mes integer DEFAULT NULL::integer, _ano integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cidade text;
  v_estado text;
  v_result jsonb;
  v_end   timestamptz;
BEGIN
  IF _uid IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;

  IF NOT (public.has_role(_uid, 'prefeitura') OR public.is_admin(_uid)) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;

  SELECT cidade, estado INTO v_cidade, v_estado
  FROM public.profiles WHERE id = _uid;

  IF v_cidade IS NULL OR v_estado IS NULL THEN
    RETURN jsonb_build_object(
      'cidade', v_cidade, 'estado', v_estado,
      'stats', jsonb_build_object(
        'residuos_m3', 0, 'locadores', 0, 'locadores_pendentes', 0,
        'cacambas', 0, 'cacambas_locadas', 0,
        'destino_final', 0, 'destino_final_pendentes', 0,
        'total_ordens', 0, 'total_pedidos', 0
      ),
      'top_bairros', '[]'::jsonb,
      'pedidos_recentes', '[]'::jsonb,
      'ordens_por_mes', '[]'::jsonb,
      'classes_residuo', '[]'::jsonb
    );
  END IF;

  IF _ano IS NOT NULL AND _mes IS NOT NULL THEN
    v_end := make_timestamptz(_ano, _mes, 1, 0, 0, 0) + INTERVAL '1 month';
  ELSIF _ano IS NOT NULL THEN
    v_end := make_timestamptz(_ano, 1, 1, 0, 0, 0) + INTERVAL '1 year';
  ELSE
    v_end := NULL;
  END IF;

  WITH obras_cidade AS (
    SELECT id, bairro FROM public.obras
    WHERE lower(cidade) = lower(v_cidade)
      AND upper(estado) = upper(v_estado)
  ),
  ord AS (
    SELECT ol.id, ol.pedido_fornecedor_id, ol.obra_id, ol.created_at
    FROM public.ordens_locacao ol
    WHERE ol.obra_id IN (SELECT id FROM obras_cidade)
      AND (v_end IS NULL OR ol.created_at < v_end)
  ),
  ord_ano AS (
    SELECT ol.id, ol.created_at
    FROM public.ordens_locacao ol
    WHERE ol.obra_id IN (SELECT id FROM obras_cidade)
      AND ol.created_at >= date_trunc('year', make_timestamptz(COALESCE(_ano, extract(year from now())::int), 1, 1, 0, 0, 0))
      AND ol.created_at <  date_trunc('year', make_timestamptz(COALESCE(_ano, extract(year from now())::int), 1, 1, 0, 0, 0)) + INTERVAL '1 year'
  ),
  olus AS (
    SELECT olu.*, ord.pedido_fornecedor_id
    FROM public.ordem_locacao_unidades olu
    JOIN ord ON ord.id = olu.ordem_locacao_id
  ),
  pfs AS (
    SELECT DISTINCT pf.id, pf.locador_id, pf.pedido_id, pf.status::text AS pf_status
    FROM public.pedido_fornecedores pf
    WHERE pf.id IN (SELECT DISTINCT pedido_fornecedor_id FROM ord)
  ),
  -- Licenças da cidade agrupadas por usuário com status agregado
  licencas_agg AS (
    SELECT lc.user_id,
      CASE
        WHEN bool_or(lc.status_prefeitura = 'rejeitado') THEN 'rejeitado'
        WHEN bool_and(lc.status_prefeitura = 'validado') THEN 'validado'
        WHEN COUNT(d.id) = 0 THEN 'sem_documentos'
        WHEN bool_or(d.status = 'negado') THEN 'rejeitado'
        WHEN bool_or(d.status = 'aguardando_validacao') THEN 'aguardando_validacao'
        ELSE 'aguardando_validacao'
      END AS licenca_status
    FROM public.licenca_cidade lc
    LEFT JOIN public.documentos_licenca_cidade d ON d.licenca_cidade_id = lc.id
    WHERE lower(lc.cidade) = lower(v_cidade)
      AND upper(lc.estado) = upper(v_estado)
    GROUP BY lc.user_id
  ),
  locadores_cid AS (
    SELECT DISTINCT la.user_id, la.licenca_status
    FROM licencas_agg la
    JOIN public.user_roles ur ON ur.user_id = la.user_id
    WHERE ur.role = 'locador' AND ur.ativo = true
  ),
  destinos_cid AS (
    SELECT DISTINCT la.user_id, la.licenca_status
    FROM licencas_agg la
    JOIN public.user_roles ur ON ur.user_id = la.user_id
    WHERE ur.role = 'destino' AND ur.ativo = true
  ),
  stats AS (
    SELECT
      COALESCE((SELECT SUM(volume_m3) FROM olus), 0) AS residuos_m3,
      (SELECT COUNT(*) FROM locadores_cid) AS locadores,
      (SELECT COUNT(*) FROM locadores_cid WHERE licenca_status = 'aguardando_validacao') AS locadores_pendentes,
      (SELECT COUNT(DISTINCT cu.cacamba_id)
         FROM olus o JOIN public.cacamba_unidades cu ON cu.id = o.cacamba_unidade_id) AS cacambas,
      (SELECT COUNT(*) FROM olus WHERE status = 'locada') AS cacambas_locadas,
      (SELECT COUNT(*) FROM destinos_cid) AS destino_final,
      (SELECT COUNT(*) FROM destinos_cid WHERE licenca_status = 'aguardando_validacao') AS destino_final_pendentes,
      (SELECT COUNT(*) FROM ord) AS total_ordens,
      (SELECT COUNT(DISTINCT pedido_id) FROM pfs) AS total_pedidos
  ),
  top_bairros AS (
    SELECT bairro, COUNT(*)::int AS count
    FROM ord o JOIN obras_cidade oc ON oc.id = o.obra_id
    WHERE bairro IS NOT NULL AND bairro <> ''
    GROUP BY bairro ORDER BY count DESC LIMIT 10
  ),
  classes AS (
    SELECT COALESCE(r.classe_nome, 'Sem classe') AS nome,
           COALESCE(SUM(r.volume_m3), 0)::numeric AS volume
    FROM public.ordem_locacao_unidade_residuos r
    JOIN olus ON olus.id = r.ordem_locacao_unidade_id
    GROUP BY 1
    ORDER BY volume DESC
    LIMIT 8
  ),
  pedidos_status AS (
    SELECT pedido_id,
           CASE
             WHEN bool_or(pf_status = 'aguardando_aceite') THEN 'aguardando_aceite'
             WHEN bool_or(pf_status = 'recusado') AND NOT bool_or(pf_status = 'aceito') THEN 'recusado'
             WHEN bool_or(pf_status = 'cancelado') AND NOT bool_or(pf_status = 'aceito') THEN 'cancelado'
             WHEN bool_or(pf_status = 'aceito') THEN 'aceito'
             ELSE min(pf_status)
           END AS status
    FROM pfs
    GROUP BY pedido_id
  )
  SELECT jsonb_build_object(
    'cidade', v_cidade,
    'estado', v_estado,
    'stats', to_jsonb(stats.*),
    'top_bairros', COALESCE((SELECT jsonb_agg(to_jsonb(tb.*)) FROM top_bairros tb), '[]'::jsonb),
    'classes_residuo', COALESCE((SELECT jsonb_agg(jsonb_build_object('nome', nome, 'volume', volume)) FROM classes), '[]'::jsonb),
    'pedidos_recentes', COALESCE((
      SELECT jsonb_agg(row_to_json(x))
      FROM (
        SELECT DISTINCT p.id, p.numero, ps.status, p.valor_total, p.created_at,
               prof.nome AS locatario_nome
        FROM pedidos_status ps
        JOIN public.pedidos p ON p.id = ps.pedido_id
        LEFT JOIN public.profiles prof ON prof.id = p.locatario_id
        ORDER BY p.created_at DESC
        LIMIT 10
      ) x
    ), '[]'::jsonb),
    'ordens_por_mes', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('mes', mes, 'value', total) ORDER BY mes)
      FROM (
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS mes, COUNT(*)::int AS total
        FROM ord_ano
        GROUP BY 1
      ) m
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM stats;

  RETURN v_result;
END;
$function$;
