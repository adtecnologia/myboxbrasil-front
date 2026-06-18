
CREATE TABLE public.ocorrencias_ativos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locador_id UUID NOT NULL,
  ativo_tipo TEXT NOT NULL CHECK (ativo_tipo IN ('cacamba','equipamento')),
  ativo_id UUID,
  ativo_codigo TEXT,
  data_ocorrencia DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT,
  descricao TEXT,
  gravidade TEXT NOT NULL DEFAULT 'Leve' CHECK (gravidade IN ('Leve','Média','Grave','Crítica')),
  status TEXT NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta','Em Análise','Resolvida')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ocorrencias_ativos TO authenticated;
GRANT ALL ON public.ocorrencias_ativos TO service_role;
ALTER TABLE public.ocorrencias_ativos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia ocorrencias ativos"
  ON public.ocorrencias_ativos FOR ALL TO authenticated
  USING (auth.uid() = locador_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = locador_id OR public.is_admin(auth.uid()));

CREATE INDEX idx_ocorrencias_ativos_locador ON public.ocorrencias_ativos(locador_id);
CREATE INDEX idx_ocorrencias_ativos_ativo ON public.ocorrencias_ativos(ativo_tipo, ativo_id);

CREATE TRIGGER update_ocorrencias_ativos_updated_at
  BEFORE UPDATE ON public.ocorrencias_ativos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.manutencoes_ativos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locador_id UUID NOT NULL,
  ativo_tipo TEXT NOT NULL CHECK (ativo_tipo IN ('cacamba','equipamento')),
  ativo_id UUID,
  ativo_codigo TEXT,
  data_manutencao DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL DEFAULT 'Preventiva' CHECK (tipo IN ('Preventiva','Corretiva','Pintura/Reforma')),
  descricao TEXT,
  valor NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Agendada' CHECK (status IN ('Agendada','Em Execução','Concluída')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.manutencoes_ativos TO authenticated;
GRANT ALL ON public.manutencoes_ativos TO service_role;
ALTER TABLE public.manutencoes_ativos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia manutencoes ativos"
  ON public.manutencoes_ativos FOR ALL TO authenticated
  USING (auth.uid() = locador_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = locador_id OR public.is_admin(auth.uid()));

CREATE INDEX idx_manutencoes_ativos_locador ON public.manutencoes_ativos(locador_id);
CREATE INDEX idx_manutencoes_ativos_ativo ON public.manutencoes_ativos(ativo_tipo, ativo_id);

CREATE TRIGGER update_manutencoes_ativos_updated_at
  BEFORE UPDATE ON public.manutencoes_ativos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
