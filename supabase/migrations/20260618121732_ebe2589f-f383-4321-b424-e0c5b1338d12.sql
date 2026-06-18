
CREATE TABLE public.ocorrencias_frota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
  data_ocorrencia DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT,
  descricao TEXT,
  gravidade TEXT NOT NULL DEFAULT 'Leve' CHECK (gravidade IN ('Leve','Média','Grave','Crítica')),
  status TEXT NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta','Em Análise','Resolvida')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ocorrencias_frota_locador ON public.ocorrencias_frota(locador_id);
CREATE INDEX idx_ocorrencias_frota_veiculo ON public.ocorrencias_frota(veiculo_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ocorrencias_frota TO authenticated;
GRANT ALL ON public.ocorrencias_frota TO service_role;
ALTER TABLE public.ocorrencias_frota ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locador gerencia ocorrencias_frota" ON public.ocorrencias_frota
  FOR ALL TO authenticated
  USING (locador_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE TRIGGER update_ocorrencias_frota_updated_at BEFORE UPDATE ON public.ocorrencias_frota
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.manutencoes_frota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
  data_manutencao DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL DEFAULT 'Preventiva' CHECK (tipo IN ('Preventiva','Corretiva','Revisão')),
  descricao TEXT,
  valor NUMERIC(12,2),
  km INT,
  oficina TEXT,
  status TEXT NOT NULL DEFAULT 'Agendada' CHECK (status IN ('Agendada','Em Execução','Concluída')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_manutencoes_frota_locador ON public.manutencoes_frota(locador_id);
CREATE INDEX idx_manutencoes_frota_veiculo ON public.manutencoes_frota(veiculo_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.manutencoes_frota TO authenticated;
GRANT ALL ON public.manutencoes_frota TO service_role;
ALTER TABLE public.manutencoes_frota ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locador gerencia manutencoes_frota" ON public.manutencoes_frota
  FOR ALL TO authenticated
  USING (locador_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE TRIGGER update_manutencoes_frota_updated_at BEFORE UPDATE ON public.manutencoes_frota
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
