CREATE OR REPLACE FUNCTION public.get_locador_rotas(_locador uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    jsonb_agg(to_jsonb(rota) - 'sort_created_at' ORDER BY data_programada NULLS LAST, sort_created_at DESC),
    '[]'::jsonb
  )
  FROM (
    SELECT
      r.id,
      r.data_programada,
      r.status,
      r.motorista_id,
      r.created_at AS sort_created_at,
      jsonb_build_object(
        'placa', v.placa,
        'marca', v.marca,
        'modelo', v.modelo
      ) AS veiculo,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', ri.id,
          'sequencia', ri.sequencia,
          'tipo', ri.tipo,
          'cliente', COALESCE(prof.nome, 'Cliente'),
          'endereco', NULLIF(concat_ws(' - ',
            NULLIF(concat_ws(', ', o.rua, o.numero), ''),
            o.bairro,
            NULLIF(concat_ws('/', o.cidade, o.estado), '')
          ), ''),
          'cidade', o.cidade,
          'estado', o.estado,
          'codigo_cacamba', cu.codigo,
          'olu_status', olu.status,
          'destino_final_nome', dprof.nome,
          'destino_final_endereco', NULLIF(concat_ws(' - ',
            NULLIF(concat_ws(', ', dprof.logradouro, dprof.numero), ''),
            dprof.bairro,
            NULLIF(concat_ws('/', dprof.cidade, dprof.estado), '')
          ), ''),
          'residuos', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('id', s.cid, 'nome', s.cnome) ORDER BY s.cnome)
            FROM (
              SELECT DISTINCT
                clr.id AS cid,
                COALESCE(clr.nome, cr.classe) AS cnome
              FROM public.cacamba_residuos cr
              LEFT JOIN public.classes_residuo clr ON clr.id::text = cr.classe
              WHERE cr.cacamba_id = cu.cacamba_id
            ) s
          ), '[]'::jsonb)
        ) ORDER BY ri.sequencia)
        FROM public.rota_itens ri
        LEFT JOIN public.ordem_locacao_unidades olu ON olu.id = ri.ordem_locacao_unidade_id
        LEFT JOIN public.cacamba_unidades cu ON cu.id = olu.cacamba_unidade_id
        LEFT JOIN public.ordens_locacao ol ON ol.id = olu.ordem_locacao_id
        LEFT JOIN public.obras o ON o.id = ol.obra_id
        LEFT JOIN public.pedido_fornecedores pf ON pf.id = ol.pedido_fornecedor_id
        LEFT JOIN public.pedidos p ON p.id = pf.pedido_id
        LEFT JOIN public.profiles prof ON prof.id = p.locatario_id
        LEFT JOIN public.profiles dprof ON dprof.id = COALESCE(olu.destino_final_id, r.destino_final_id)
        WHERE ri.rota_id = r.id
      ), '[]'::jsonb) AS itens
    FROM public.rotas r
    LEFT JOIN public.veiculos v ON v.id = r.veiculo_id
    WHERE r.locador_id = _locador
      AND (
        r.locador_id = auth.uid()
        OR public.has_role_for_locador(auth.uid(), 'locador', r.locador_id)
        OR public.is_admin(auth.uid())
      )
  ) rota;
$function$;

GRANT EXECUTE ON FUNCTION public.get_locador_rotas(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_locador_rotas(uuid) TO service_role;