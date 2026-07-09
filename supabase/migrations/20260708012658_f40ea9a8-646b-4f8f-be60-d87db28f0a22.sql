
CREATE OR REPLACE FUNCTION public.get_prefeitura_dashboard(_uid uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cidade text;
  v_estado text;
  v_result jsonb;
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
      'cidade', v_cidade,
      'estado', v_estado,
      'stats', jsonb_build_object(
        'residuos_m3', 0,
        'locadores', 0,
        'cacambas', 0,
        'cacambas_locadas', 0,
        'destino_final', 0,
        'total_ordens', 0,
        'total_pedidos', 0
      ),
      'top_bairros', '[]'::jsonb,
      'pedidos_recentes', '[]'::jsonb,
      'ordens_por_mes', '[]'::jsonb
    );
  END IF;

  WITH obras_cidade AS (
    SELECT id, bairro
    FROM public.obras
    WHERE lower(cidade) = lower(v_cidade)
      AND upper(estado) = upper(v_estado)
  ),
  ord AS (
    SELECT ol.id, ol.pedido_fornecedor_id, ol.obra_id, ol.created_at
    FROM public.ordens_locacao ol
    WHERE ol.obra_id IN (SELECT id FROM obras_cidade)
  ),
  olus AS (
    SELECT olu.*, ord.pedido_fornecedor_id
    FROM public.ordem_locacao_unidades olu
    JOIN ord ON ord.id = olu.ordem_locacao_id
  ),
  pfs AS (
    SELECT DISTINCT pf.id, pf.locador_id, pf.pedido_id
    FROM public.pedido_fornecedores pf
    WHERE pf.id IN (SELECT DISTINCT pedido_fornecedor_id FROM ord)
  ),
  stats AS (
    SELECT
      COALESCE((SELECT SUM(volume_m3) FROM olus), 0) AS residuos_m3,
      (SELECT COUNT(DISTINCT locador_id) FROM pfs) AS locadores,
      (SELECT COUNT(DISTINCT cu.cacamba_id)
         FROM olus o JOIN public.cacamba_unidades cu ON cu.id = o.cacamba_unidade_id) AS cacambas,
      (SELECT COUNT(*) FROM olus WHERE status = 'locada') AS cacambas_locadas,
      (SELECT COUNT(DISTINCT destino_final_id) FROM olus WHERE destino_final_id IS NOT NULL) AS destino_final,
      (SELECT COUNT(*) FROM ord) AS total_ordens,
      (SELECT COUNT(DISTINCT pedido_id) FROM pfs) AS total_pedidos
  ),
  top_bairros AS (
    SELECT bairro, COUNT(*)::int AS count
    FROM ord o JOIN obras_cidade oc ON oc.id = o.obra_id
    WHERE bairro IS NOT NULL AND bairro <> ''
    GROUP BY bairro ORDER BY count DESC LIMIT 5
  ),
  pedidos_recentes AS (
    SELECT p.id, p.numero, p.status::text AS status, p.valor_total, p.created_at,
           prof.nome AS locatario_nome
    FROM public.pedidos p
    JOIN prof_locatario_join pf_j ON true
    WHERE false
    LIMIT 0
  )
  SELECT jsonb_build_object(
    'cidade', v_cidade,
    'estado', v_estado,
    'stats', to_jsonb(stats.*),
    'top_bairros', COALESCE((SELECT jsonb_agg(to_jsonb(tb.*)) FROM top_bairros tb), '[]'::jsonb),
    'pedidos_recentes', COALESCE((
      SELECT jsonb_agg(row_to_json(x))
      FROM (
        SELECT DISTINCT p.id, p.numero, p.status::text AS status, p.valor_total, p.created_at,
               prof.nome AS locatario_nome
        FROM pfs
        JOIN public.pedidos p ON p.id = pfs.pedido_id
        LEFT JOIN public.profiles prof ON prof.id = p.locatario_id
        ORDER BY p.created_at DESC
        LIMIT 10
      ) x
    ), '[]'::jsonb),
    'ordens_por_mes', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('mes', mes, 'value', total) ORDER BY mes)
      FROM (
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS mes, COUNT(*)::int AS total
        FROM ord
        WHERE created_at >= date_trunc('year', now())
        GROUP BY 1
      ) m
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM stats;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_prefeitura_dashboard(uuid) TO authenticated;
