CREATE OR REPLACE FUNCTION public.get_locatario_proximas_movimentacoes(_locatario uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(item ORDER BY data_programada NULLS LAST, sequencia), '[]'::jsonb)
  FROM (
    SELECT
      ri.id,
      ri.sequencia,
      ri.tipo,
      r.data_programada,
      r.status AS rota_status,
      olu.status AS olu_status,
      cu.codigo AS codigo_cacamba,
      o.nome AS obra_nome,
      NULLIF(concat_ws(', ', o.rua, o.numero), '') AS endereco,
      o.cidade,
      o.estado
    FROM rota_itens ri
    JOIN rotas r ON r.id = ri.rota_id
    JOIN ordem_locacao_unidades olu ON olu.id = ri.ordem_locacao_unidade_id
    JOIN ordens_locacao ol ON ol.id = olu.ordem_locacao_id
    JOIN pedido_fornecedores pf ON pf.id = ol.pedido_fornecedor_id
    JOIN pedidos p ON p.id = pf.pedido_id
    LEFT JOIN cacamba_unidades cu ON cu.id = olu.cacamba_unidade_id
    LEFT JOIN obras o ON o.id = ol.obra_id
    WHERE p.locatario_id = _locatario
      AND r.status NOT IN ('cancelada','concluida')
      AND olu.status IN ('entrega_pendente','em_transito_locacao','aguardando_retirada','em_transito_retirada')
  ) item;
$$;

GRANT EXECUTE ON FUNCTION public.get_locatario_proximas_movimentacoes(uuid) TO authenticated;