
CREATE TABLE public.locador_residuos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  classe_residuo_id UUID NOT NULL REFERENCES public.classes_residuo(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, classe_residuo_id)
);

CREATE INDEX idx_locador_residuos_user ON public.locador_residuos(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.locador_residuos TO authenticated;
GRANT ALL ON public.locador_residuos TO service_role;

ALTER TABLE public.locador_residuos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia seus resíduos"
  ON public.locador_residuos
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
