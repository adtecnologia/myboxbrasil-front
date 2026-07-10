
ALTER TABLE public.carrinho_itens
  ADD COLUMN IF NOT EXISTS tipo_locacao TEXT,
  ADD COLUMN IF NOT EXISTS dias_locacao INTEGER;

ALTER TABLE public.ordens_locacao
  ADD COLUMN IF NOT EXISTS tipo_locacao TEXT,
  ADD COLUMN IF NOT EXISTS dias_locacao INTEGER;

CREATE OR REPLACE FUNCTION public.confirmar_carrinho(_carrinho_id uuid)
 RETURNS pedidos
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_locatario UUID;
  v_status public.carrinho_status;
  v_pedido public.pedidos;
  v_pf RECORD;
  v_total NUMERIC(12,2);
BEGIN
  SELECT locatario_id, status INTO v_locatario, v_status
  FROM public.carrinhos WHERE id = _carrinho_id;

  IF v_locatario IS NULL THEN RAISE EXCEPTION 'Carrinho nao encontrado'; END IF;
  IF v_locatario <> auth.uid() AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissao para confirmar este carrinho';
  END IF;
  IF v_status <> 'aberto' THEN RAISE EXCEPTION 'Carrinho ja foi %', v_status; END IF;

  SELECT COALESCE(SUM(quantidade * preco_unitario),0) INTO v_total
  FROM public.carrinho_itens WHERE carrinho_id = _carrinho_id;

  INSERT INTO public.pedidos (carrinho_id, locatario_id, valor_total)
  VALUES (_carrinho_id, v_locatario, v_total)
  RETURNING * INTO v_pedido;

  FOR v_pf IN
    SELECT locador_id, SUM(quantidade * preco_unitario) AS total
    FROM public.carrinho_itens
    WHERE carrinho_id = _carrinho_id
    GROUP BY locador_id
  LOOP
    WITH novo_pf AS (
      INSERT INTO public.pedido_fornecedores (pedido_id, locador_id, valor_total)
      VALUES (v_pedido.id, v_pf.locador_id, v_pf.total)
      RETURNING id
    )
    INSERT INTO public.ordens_locacao (
      pedido_fornecedor_id, equipment_type, cacamba_id, equipamento_id,
      obra_id, quantidade, preco_unitario, valor_total, observacoes,
      tipo_locacao, dias_locacao
    )
    SELECT
      (SELECT id FROM novo_pf),
      ci.equipment_type, ci.cacamba_id, ci.equipamento_id,
      (array_agg(ci.obra_id) FILTER (WHERE ci.obra_id IS NOT NULL))[1],
      SUM(ci.quantidade),
      MAX(ci.preco_unitario),
      SUM(ci.quantidade * ci.preco_unitario),
      string_agg(ci.observacoes, ' | '),
      MAX(ci.tipo_locacao),
      MAX(ci.dias_locacao)
    FROM public.carrinho_itens ci
    WHERE ci.carrinho_id = _carrinho_id
      AND ci.locador_id IS NOT DISTINCT FROM v_pf.locador_id
    GROUP BY ci.equipment_type, ci.cacamba_id, ci.equipamento_id;
  END LOOP;

  UPDATE public.carrinhos
    SET status = 'confirmado', confirmado_at = now()
    WHERE id = _carrinho_id;

  RETURN v_pedido;
END;
$function$;
