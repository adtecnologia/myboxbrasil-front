
-- ============ CACAMBAS ============
CREATE TABLE public.cacambas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locador_id UUID NOT NULL,
  modelo TEXT NOT NULL,
  material TEXT,
  peso NUMERIC,
  cores TEXT,
  tipo_tampa TEXT NOT NULL DEFAULT 'sem' CHECK (tipo_tampa IN ('articulada','corredica','sem')),
  tipo_locacao TEXT NOT NULL DEFAULT 'Ambos' CHECK (tipo_locacao IN ('Externo','Interno','Ambos')),
  dias_externo INTEGER DEFAULT 0,
  preco_externo NUMERIC DEFAULT 0,
  dias_interno INTEGER DEFAULT 0,
  preco_interno NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cacambas TO authenticated;
GRANT ALL ON public.cacambas TO service_role;

ALTER TABLE public.cacambas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia suas cacambas"
  ON public.cacambas FOR ALL TO authenticated
  USING (auth.uid() = locador_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = locador_id OR public.is_admin(auth.uid()));

CREATE INDEX idx_cacambas_locador ON public.cacambas(locador_id);

CREATE TRIGGER update_cacambas_updated_at
  BEFORE UPDATE ON public.cacambas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ UNIDADES ============
CREATE TABLE public.cacamba_unidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cacamba_id UUID NOT NULL REFERENCES public.cacambas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  manutencao BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cacamba_unidades TO authenticated;
GRANT ALL ON public.cacamba_unidades TO service_role;

ALTER TABLE public.cacamba_unidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia unidades das suas cacambas"
  ON public.cacamba_unidades FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cacambas c WHERE c.id = cacamba_id AND (c.locador_id = auth.uid() OR public.is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.cacambas c WHERE c.id = cacamba_id AND (c.locador_id = auth.uid() OR public.is_admin(auth.uid()))));

CREATE INDEX idx_cacamba_unidades_cacamba ON public.cacamba_unidades(cacamba_id);

CREATE TRIGGER update_cacamba_unidades_updated_at
  BEFORE UPDATE ON public.cacamba_unidades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ RESIDUOS ============
CREATE TABLE public.cacamba_residuos (
  cacamba_id UUID NOT NULL REFERENCES public.cacambas(id) ON DELETE CASCADE,
  classe TEXT NOT NULL,
  PRIMARY KEY (cacamba_id, classe)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cacamba_residuos TO authenticated;
GRANT ALL ON public.cacamba_residuos TO service_role;

ALTER TABLE public.cacamba_residuos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia residuos das suas cacambas"
  ON public.cacamba_residuos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cacambas c WHERE c.id = cacamba_id AND (c.locador_id = auth.uid() OR public.is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.cacambas c WHERE c.id = cacamba_id AND (c.locador_id = auth.uid() OR public.is_admin(auth.uid()))));

-- ============ FOTOS ============
CREATE TABLE public.cacamba_fotos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cacamba_id UUID NOT NULL REFERENCES public.cacambas(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cacamba_fotos TO authenticated;
GRANT ALL ON public.cacamba_fotos TO service_role;

ALTER TABLE public.cacamba_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia fotos das suas cacambas"
  ON public.cacamba_fotos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cacambas c WHERE c.id = cacamba_id AND (c.locador_id = auth.uid() OR public.is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.cacambas c WHERE c.id = cacamba_id AND (c.locador_id = auth.uid() OR public.is_admin(auth.uid()))));

CREATE INDEX idx_cacamba_fotos_cacamba ON public.cacamba_fotos(cacamba_id);
