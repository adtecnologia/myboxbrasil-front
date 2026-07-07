ALTER TABLE public.ordem_locacao_unidades
  ADD COLUMN IF NOT EXISTS retirada_solicitada_em timestamptz;

CREATE OR REPLACE FUNCTION public.solicitar_retirada_por_codigo(_codigo text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_olu_id uuid;
  v_locatario uuid;
  v_status text;
BEGIN
  SELECT olu.id, p.locatario_id, olu.status
    INTO v_olu_id, v_locatario, v_status
  FROM ordem_locacao_unidades olu
  JOIN cacamba_unidades cu ON cu.id = olu.cacamba_unidade_id
  JOIN ordens_locacao ol ON ol.id = olu.ordem_locacao_id
  JOIN pedido_fornecedores pf ON pf.id = ol.pedido_fornecedor_id
  JOIN pedidos p ON p.id = pf.pedido_id
  WHERE upper(cu.codigo) = upper(_codigo)
    AND olu.status = 'locada'
  ORDER BY olu.updated_at DESC
  LIMIT 1;

  IF v_olu_id IS NULL THEN
    RAISE EXCEPTION 'Caçamba não encontrada ou não está locada';
  END IF;

  IF auth.uid() <> v_locatario AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão para solicitar retirada desta caçamba';
  END IF;

  UPDATE ordem_locacao_unidades
     SET status = 'aguardando_retirada',
         retirada_solicitada_em = now(),
         updated_at = now()
   WHERE id = v_olu_id;

  RETURN v_olu_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.solicitar_retirada_por_codigo(text) TO authenticated;