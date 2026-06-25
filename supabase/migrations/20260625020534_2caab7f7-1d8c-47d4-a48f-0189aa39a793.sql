
CREATE TABLE public.cidades_taxas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_ibge TEXT NOT NULL UNIQUE,
  estado TEXT NOT NULL,
  nome TEXT NOT NULL,
  taxa_operacional NUMERIC(6,3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cidades_taxas TO authenticated;
GRANT ALL ON public.cidades_taxas TO service_role;

ALTER TABLE public.cidades_taxas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage cidades_taxas"
ON public.cidades_taxas
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated can read cidades_taxas"
ON public.cidades_taxas
FOR SELECT
TO authenticated
USING (true);

CREATE TRIGGER update_cidades_taxas_updated_at
BEFORE UPDATE ON public.cidades_taxas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
