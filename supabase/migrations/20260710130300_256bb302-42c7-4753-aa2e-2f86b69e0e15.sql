
-- CDF (Certificado de Destinação Final) — snapshot pattern espelhando MTR
CREATE TABLE public.cdf (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  mtr_id UUID REFERENCES public.mtr(id) ON DELETE SET NULL,
  ordem_locacao_unidade_id UUID NOT NULL REFERENCES public.ordem_locacao_unidades(id) ON DELETE CASCADE,
  locatario_id UUID,
  locador_id UUID,
  destino_final_id UUID,
  motorista_id UUID,
  cacamba_unidade_id UUID,
  data_emissao TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_recebimento TIMESTAMPTZ,
  -- Gerador (snapshot)
  gerador_nome TEXT,
  gerador_nome_fantasia TEXT,
  gerador_documento TEXT,
  gerador_tipo_documento TEXT,
  gerador_telefone TEXT,
  gerador_celular TEXT,
  gerador_email TEXT,
  gerador_resp_nome TEXT,
  -- Obra (snapshot)
  obra_logradouro TEXT,
  obra_numero TEXT,
  obra_complemento TEXT,
  obra_bairro TEXT,
  obra_cidade TEXT,
  obra_estado TEXT,
  obra_cep TEXT,
  -- Destino final (snapshot)
  destino_nome TEXT,
  destino_nome_fantasia TEXT,
  destino_documento TEXT,
  destino_tipo_documento TEXT,
  destino_telefone TEXT,
  destino_celular TEXT,
  destino_email TEXT,
  destino_resp_nome TEXT,
  destino_logradouro TEXT,
  destino_numero TEXT,
  destino_complemento TEXT,
  destino_bairro TEXT,
  destino_cidade TEXT,
  destino_estado TEXT,
  destino_cep TEXT,
  -- Transportador (snapshot)
  transportador_nome TEXT,
  transportador_nome_fantasia TEXT,
  transportador_documento TEXT,
  transportador_tipo_documento TEXT,
  transportador_telefone TEXT,
  transportador_celular TEXT,
  transportador_email TEXT,
  transportador_resp_nome TEXT,
  transportador_logradouro TEXT,
  transportador_numero TEXT,
  transportador_complemento TEXT,
  transportador_bairro TEXT,
  transportador_cidade TEXT,
  transportador_estado TEXT,
  transportador_cep TEXT,
  veiculo_id UUID,
  veiculo_placa TEXT,
  veiculo_marca TEXT,
  veiculo_modelo TEXT,
  -- Caçamba (snapshot)
  cacamba_codigo TEXT,
  mtr_numero TEXT,
  -- Declaração + observações
  declaracao TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX cdf_olu_idx ON public.cdf(ordem_locacao_unidade_id);
CREATE INDEX cdf_mtr_idx ON public.cdf(mtr_id);
CREATE INDEX cdf_destino_idx ON public.cdf(destino_final_id);
CREATE INDEX cdf_locador_idx ON public.cdf(locador_id);
CREATE INDEX cdf_locatario_idx ON public.cdf(locatario_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cdf TO authenticated;
GRANT ALL ON public.cdf TO service_role;

ALTER TABLE public.cdf ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CDF: partes envolvidas podem ver" ON public.cdf
  FOR SELECT TO authenticated
  USING (
    locatario_id = auth.uid()
    OR locador_id = auth.uid()
    OR destino_final_id = auth.uid()
    OR motorista_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "CDF: destino final emite" ON public.cdf
  FOR INSERT TO authenticated
  WITH CHECK (destino_final_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "CDF: destino final atualiza" ON public.cdf
  FOR UPDATE TO authenticated
  USING (destino_final_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (destino_final_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "CDF: admin apaga" ON public.cdf
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_cdf_updated_at BEFORE UPDATE ON public.cdf
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- cdf_itens
CREATE TABLE public.cdf_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cdf_id UUID NOT NULL REFERENCES public.cdf(id) ON DELETE CASCADE,
  classe_id TEXT,
  classe_nome TEXT,
  tratamento_id TEXT,
  tratamento_nome TEXT,
  peso_kg NUMERIC(12,3),
  volume_m3 NUMERIC(12,3),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX cdf_itens_cdf_idx ON public.cdf_itens(cdf_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cdf_itens TO authenticated;
GRANT ALL ON public.cdf_itens TO service_role;

ALTER TABLE public.cdf_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CDF itens: acesso via CDF" ON public.cdf_itens
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.cdf c
    WHERE c.id = cdf_itens.cdf_id
      AND (
        c.locatario_id = auth.uid()
        OR c.locador_id = auth.uid()
        OR c.destino_final_id = auth.uid()
        OR c.motorista_id = auth.uid()
        OR public.is_admin(auth.uid())
      )
  ));

CREATE POLICY "CDF itens: destino final gerencia" ON public.cdf_itens
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.cdf c
    WHERE c.id = cdf_itens.cdf_id
      AND (c.destino_final_id = auth.uid() OR public.is_admin(auth.uid()))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cdf c
    WHERE c.id = cdf_itens.cdf_id
      AND (c.destino_final_id = auth.uid() OR public.is_admin(auth.uid()))
  ));

CREATE TRIGGER update_cdf_itens_updated_at BEFORE UPDATE ON public.cdf_itens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
