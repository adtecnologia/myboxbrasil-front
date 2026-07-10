CREATE OR REPLACE FUNCTION public.get_mtr_retirada_transporte(_olu_id uuid)
RETURNS TABLE(
  motorista_id uuid,
  motorista_nome text,
  veiculo_id uuid,
  placa text,
  data_programada timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH acesso AS (
    SELECT EXISTS (
      SELECT 1
      FROM public.ordem_locacao_unidades olu
      JOIN public.ordens_locacao ol ON ol.id = olu.ordem_locacao_id
      WHERE olu.id = _olu_id
        AND (
          public.can_access_pedido_fornecedor(ol.pedido_fornecedor_id)
          OR olu.destino_final_id = auth.uid()
          OR public.is_admin(auth.uid())
        )
    ) OR EXISTS (
      SELECT 1
      FROM public.rota_itens ri
      JOIN public.rotas r ON r.id = ri.rota_id
      LEFT JOIN public.ordem_locacao_unidades olu ON olu.id = ri.ordem_locacao_unidade_id
      WHERE ri.ordem_locacao_unidade_id = _olu_id
        AND COALESCE(r.status, '') <> 'cancelada'
        AND (
          r.motorista_id = auth.uid()
          OR r.destino_final_id = auth.uid()
          OR olu.destino_final_id = auth.uid()
          OR public.is_admin(auth.uid())
        )
    ) AS permitido
  )
  SELECT
    r.motorista_id,
    p.nome AS motorista_nome,
    r.veiculo_id,
    v.placa,
    r.data_programada
  FROM public.rota_itens ri
  JOIN public.rotas r ON r.id = ri.rota_id
  LEFT JOIN public.profiles p ON p.id = r.motorista_id
  LEFT JOIN public.veiculos v ON v.id = r.veiculo_id
  CROSS JOIN acesso a
  WHERE ri.ordem_locacao_unidade_id = _olu_id
    AND a.permitido
    AND COALESCE(r.status, '') <> 'cancelada'
  ORDER BY
    CASE WHEN lower(COALESCE(ri.tipo, '')) = 'retirada' THEN 0 ELSE 1 END,
    r.data_programada DESC NULLS LAST,
    ri.created_at DESC
  LIMIT 1;
$function$;

GRANT EXECUTE ON FUNCTION public.get_mtr_retirada_transporte(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_mtr_retirada_transporte(uuid) TO service_role;