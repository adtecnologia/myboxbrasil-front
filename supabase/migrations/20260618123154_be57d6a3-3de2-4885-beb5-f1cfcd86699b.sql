
CREATE TABLE public.equipamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locador_id UUID NOT NULL,
  tipo_equipamento TEXT NOT NULL,
  nome TEXT NOT NULL,
  preco_diario NUMERIC DEFAULT 0,
  preco_semanal NUMERIC DEFAULT 0,
  preco_quinzenal NUMERIC DEFAULT 0,
  preco_mensal NUMERIC DEFAULT 0,
  descricao TEXT,
  orientacoes_operacao TEXT,
  orientacoes_seguranca TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipamentos TO authenticated;
GRANT ALL ON public.equipamentos TO service_role;

ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia seus equipamentos"
  ON public.equipamentos FOR ALL TO authenticated
  USING (auth.uid() = locador_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = locador_id OR public.is_admin(auth.uid()));

CREATE INDEX idx_equipamentos_locador ON public.equipamentos(locador_id);

CREATE TRIGGER update_equipamentos_updated_at
  BEFORE UPDATE ON public.equipamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.equipamento_unidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipamento_id UUID NOT NULL REFERENCES public.equipamentos(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipamento_unidades TO authenticated;
GRANT ALL ON public.equipamento_unidades TO service_role;

ALTER TABLE public.equipamento_unidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia unidades dos seus equipamentos"
  ON public.equipamento_unidades FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.equipamentos e WHERE e.id = equipamento_id AND (e.locador_id = auth.uid() OR public.is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.equipamentos e WHERE e.id = equipamento_id AND (e.locador_id = auth.uid() OR public.is_admin(auth.uid()))));

CREATE INDEX idx_equipamento_unidades_equipamento ON public.equipamento_unidades(equipamento_id);

CREATE TRIGGER update_equipamento_unidades_updated_at
  BEFORE UPDATE ON public.equipamento_unidades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.equipamento_fotos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipamento_id UUID NOT NULL REFERENCES public.equipamentos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipamento_fotos TO authenticated;
GRANT ALL ON public.equipamento_fotos TO service_role;

ALTER TABLE public.equipamento_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia fotos dos seus equipamentos"
  ON public.equipamento_fotos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.equipamentos e WHERE e.id = equipamento_id AND (e.locador_id = auth.uid() OR public.is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.equipamentos e WHERE e.id = equipamento_id AND (e.locador_id = auth.uid() OR public.is_admin(auth.uid()))));

CREATE INDEX idx_equipamento_fotos_equipamento ON public.equipamento_fotos(equipamento_id);
