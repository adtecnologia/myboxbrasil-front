CREATE TABLE public.obras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  rua TEXT NOT NULL,
  numero TEXT NOT NULL,
  bairro TEXT NOT NULL,
  complemento TEXT,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_final_estimada DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa','finalizada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_obras_user_id ON public.obras(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.obras TO authenticated;
GRANT ALL ON public.obras TO service_role;

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem suas próprias obras"
  ON public.obras FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Usuários criam suas próprias obras"
  ON public.obras FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários editam suas próprias obras"
  ON public.obras FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Usuários excluem suas próprias obras"
  ON public.obras FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE TRIGGER update_obras_updated_at
  BEFORE UPDATE ON public.obras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();