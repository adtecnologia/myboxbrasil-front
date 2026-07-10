
-- Tabela principal do MTR (snapshot)
CREATE TABLE public.mtr (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  ordem_locacao_unidade_id UUID NOT NULL REFERENCES public.ordem_locacao_unidades(id) ON DELETE CASCADE,

  -- Referências (para consultas/relatórios); dados abaixo são snapshot
  locatario_id UUID REFERENCES auth.users(id),
  locador_id UUID REFERENCES auth.users(id),
  destino_final_id UUID REFERENCES auth.users(id),
  motorista_id UUID REFERENCES auth.users(id),
  veiculo_id UUID REFERENCES public.veiculos(id),
  cacamba_unidade_id UUID REFERENCES public.cacamba_unidades(id),

  -- Datas
  data_emissao TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_transporte TIMESTAMPTZ,

  -- Snapshot: Gerador (perfil do locatário)
  gerador_nome TEXT,
  gerador_nome_fantasia TEXT,
  gerador_documento TEXT,
  gerador_tipo_documento TEXT,
  gerador_telefone TEXT,
  gerador_celular TEXT,
  gerador_email TEXT,
  gerador_resp_nome TEXT,

  -- Snapshot: Obra (endereço de coleta)
  obra_logradouro TEXT,
  obra_numero TEXT,
  obra_complemento TEXT,
  obra_bairro TEXT,
  obra_cidade TEXT,
  obra_estado TEXT,
  obra_cep TEXT,

  -- Snapshot: Destino Final
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

  -- Snapshot: Transportador (locador)
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

  -- Snapshot: Motorista + Veículo
  motorista_nome TEXT,
  motorista_documento TEXT,
  veiculo_placa TEXT,
  veiculo_marca TEXT,
  veiculo_modelo TEXT,

  -- Snapshot: Caçamba
  cacamba_codigo TEXT,

  observacoes TEXT,
  emitido_por UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtr_olu ON public.mtr(ordem_locacao_unidade_id);
CREATE INDEX idx_mtr_locatario ON public.mtr(locatario_id);
CREATE INDEX idx_mtr_locador ON public.mtr(locador_id);
CREATE INDEX idx_mtr_destino ON public.mtr(destino_final_id);
CREATE INDEX idx_mtr_data_emissao ON public.mtr(data_emissao DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mtr TO authenticated;
GRANT ALL ON public.mtr TO service_role;

ALTER TABLE public.mtr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MTR: partes envolvidas podem ver"
ON public.mtr FOR SELECT
TO authenticated
USING (
  locatario_id = auth.uid()
  OR locador_id = auth.uid()
  OR destino_final_id = auth.uid()
  OR motorista_id = auth.uid()
  OR public.is_admin(auth.uid())
);

CREATE POLICY "MTR: locador emite"
ON public.mtr FOR INSERT
TO authenticated
WITH CHECK (
  locador_id = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "MTR: locador atualiza"
ON public.mtr FOR UPDATE
TO authenticated
USING (locador_id = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "MTR: admin apaga"
ON public.mtr FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_mtr_updated_at
BEFORE UPDATE ON public.mtr
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Itens do MTR
CREATE TABLE public.mtr_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mtr_id UUID NOT NULL REFERENCES public.mtr(id) ON DELETE CASCADE,
  classe_id TEXT,
  classe_nome TEXT NOT NULL,
  peso_kg NUMERIC(12,3),
  volume_m3 NUMERIC(12,3),
  valor NUMERIC(12,2),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtr_itens_mtr ON public.mtr_itens(mtr_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mtr_itens TO authenticated;
GRANT ALL ON public.mtr_itens TO service_role;

ALTER TABLE public.mtr_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MTR itens: acesso via MTR"
ON public.mtr_itens FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mtr m
    WHERE m.id = mtr_itens.mtr_id
      AND (
        m.locatario_id = auth.uid()
        OR m.locador_id = auth.uid()
        OR m.destino_final_id = auth.uid()
        OR m.motorista_id = auth.uid()
        OR public.is_admin(auth.uid())
      )
  )
);

CREATE POLICY "MTR itens: locador gerencia"
ON public.mtr_itens FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mtr m
    WHERE m.id = mtr_itens.mtr_id
      AND (m.locador_id = auth.uid() OR public.is_admin(auth.uid()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.mtr m
    WHERE m.id = mtr_itens.mtr_id
      AND (m.locador_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);

CREATE TRIGGER update_mtr_itens_updated_at
BEFORE UPDATE ON public.mtr_itens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
