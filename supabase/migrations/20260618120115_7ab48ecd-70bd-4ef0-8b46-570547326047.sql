
CREATE TABLE public.veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_veiculo TEXT,
  placa TEXT NOT NULL,
  renavam TEXT,
  marca TEXT,
  modelo TEXT,
  versao TEXT,
  ano_fabricacao INT,
  ano_modelo INT,
  combustivel TEXT,
  motor TEXT,
  eixos INT,
  lotacao NUMERIC(10,2),
  tara NUMERIC(10,2),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_veiculos_locador ON public.veiculos(locador_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.veiculos TO authenticated;
GRANT ALL ON public.veiculos TO service_role;

ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia seus veiculos" ON public.veiculos
  FOR ALL TO authenticated
  USING (locador_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE TRIGGER update_veiculos_updated_at
  BEFORE UPDATE ON public.veiculos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
