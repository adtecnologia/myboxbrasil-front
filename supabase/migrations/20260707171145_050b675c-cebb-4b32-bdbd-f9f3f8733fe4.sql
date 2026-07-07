CREATE OR REPLACE FUNCTION public.get_motorista_rotas(_motorista uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(jsonb_agg(rota ORDER BY data_programada NULLS LAST), '[]'::jsonb)
  FROM (
    SELECT
      r.id,
      r.data_programada,
      r.status,
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
          'olu_status', olu.status
        ) ORDER BY ri.sequencia)
        FROM rota_itens ri
        LEFT JOIN ordem_locacao_unidades olu ON olu.id = ri.ordem_locacao_unidade_id
        LEFT JOIN cacamba_unidades cu ON cu.id = olu.cacamba_unidade_id
        LEFT JOIN ordens_locacao ol ON ol.id = olu.ordem_locacao_id
        LEFT JOIN obras o ON o.id = ol.obra_id
        LEFT JOIN pedido_fornecedores pf ON pf.id = ol.pedido_fornecedor_id
        LEFT JOIN pedidos p ON p.id = pf.pedido_id
        LEFT JOIN profiles prof ON prof.id = p.locatario_id
        WHERE ri.rota_id = r.id
      ), '[]'::jsonb) AS itens
    FROM rotas r
    LEFT JOIN veiculos v ON v.id = r.veiculo_id
    WHERE r.motorista_id = _motorista
  ) rota;
$function$;