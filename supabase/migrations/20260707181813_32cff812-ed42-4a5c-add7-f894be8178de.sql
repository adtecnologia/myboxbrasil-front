
-- 1) Tabela de fotos de entrega/retirada
CREATE TABLE public.entrega_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rota_item_id UUID NOT NULL REFERENCES public.rota_itens(id) ON DELETE CASCADE,
  ordem_locacao_unidade_id UUID REFERENCES public.ordem_locacao_unidades(id) ON DELETE SET NULL,
  motorista_id UUID NOT NULL,
  foto_path TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrega','retirada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entrega_fotos_rota_item ON public.entrega_fotos(rota_item_id);
CREATE INDEX idx_entrega_fotos_olu ON public.entrega_fotos(ordem_locacao_unidade_id);

GRANT SELECT, INSERT ON public.entrega_fotos TO authenticated;
GRANT ALL ON public.entrega_fotos TO service_role;

ALTER TABLE public.entrega_fotos ENABLE ROW LEVEL SECURITY;

-- Motorista da rota pode inserir/ler suas fotos; admin/locador/locatário envolvidos podem ler
CREATE POLICY "Motorista insere suas fotos"
ON public.entrega_fotos FOR INSERT TO authenticated
WITH CHECK (
  motorista_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.rota_itens ri
    JOIN public.rotas r ON r.id = ri.rota_id
    WHERE ri.id = rota_item_id AND r.motorista_id = auth.uid()
  )
);

CREATE POLICY "Envolvidos veem fotos"
ON public.entrega_fotos FOR SELECT TO authenticated
USING (
  motorista_id = auth.uid()
  OR public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.rota_itens ri
    JOIN public.rotas r ON r.id = ri.rota_id
    LEFT JOIN public.ordem_locacao_unidades olu ON olu.id = ri.ordem_locacao_unidade_id
    LEFT JOIN public.ordens_locacao ol ON ol.id = olu.ordem_locacao_id
    LEFT JOIN public.pedido_fornecedores pf ON pf.id = ol.pedido_fornecedor_id
    LEFT JOIN public.pedidos p ON p.id = pf.pedido_id
    WHERE ri.id = entrega_fotos.rota_item_id
      AND (r.locador_id = auth.uid() OR pf.locador_id = auth.uid() OR p.locatario_id = auth.uid())
  )
);

-- 2) Função de finalização
CREATE OR REPLACE FUNCTION public.finalizar_rota_item(
  _rota_item_id UUID,
  _fotos TEXT[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_motorista UUID;
  v_locador UUID;
  v_olu UUID;
  v_tipo TEXT;
  v_status_atual TEXT;
  v_foto TEXT;
BEGIN
  SELECT r.motorista_id, r.locador_id, ri.ordem_locacao_unidade_id, lower(ri.tipo)
    INTO v_motorista, v_locador, v_olu, v_tipo
  FROM public.rota_itens ri
  JOIN public.rotas r ON r.id = ri.rota_id
  WHERE ri.id = _rota_item_id;

  IF v_motorista IS NULL THEN
    RAISE EXCEPTION 'Item de rota não encontrado';
  END IF;

  IF auth.uid() <> v_motorista AND auth.uid() <> v_locador AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão para finalizar este item';
  END IF;

  -- Insere fotos
  IF _fotos IS NOT NULL THEN
    FOREACH v_foto IN ARRAY _fotos LOOP
      INSERT INTO public.entrega_fotos (rota_item_id, ordem_locacao_unidade_id, motorista_id, foto_path, tipo)
      VALUES (_rota_item_id, v_olu, v_motorista, v_foto, COALESCE(v_tipo,'entrega'));
    END LOOP;
  END IF;

  -- Atualiza status da OLU
  IF v_olu IS NOT NULL THEN
    SELECT status INTO v_status_atual FROM public.ordem_locacao_unidades WHERE id = v_olu;

    UPDATE public.ordem_locacao_unidades
       SET status = CASE
             WHEN v_tipo = 'retirada' THEN 'cdf_emitido'
             ELSE 'locada'
           END,
           updated_at = now()
     WHERE id = v_olu;
  END IF;
END;
$$;

-- 3) Políticas do bucket privado entregas-fotos
-- Estrutura de path esperada: {rota_item_id}/{arquivo}
CREATE POLICY "Motorista envia fotos entregas"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'entregas-fotos'
  AND EXISTS (
    SELECT 1 FROM public.rota_itens ri
    JOIN public.rotas r ON r.id = ri.rota_id
    WHERE ri.id::text = (storage.foldername(name))[1]
      AND r.motorista_id = auth.uid()
  )
);

CREATE POLICY "Motorista ve fotos entregas"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'entregas-fotos'
  AND EXISTS (
    SELECT 1 FROM public.rota_itens ri
    JOIN public.rotas r ON r.id = ri.rota_id
    WHERE ri.id::text = (storage.foldername(name))[1]
      AND (r.motorista_id = auth.uid() OR r.locador_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);
