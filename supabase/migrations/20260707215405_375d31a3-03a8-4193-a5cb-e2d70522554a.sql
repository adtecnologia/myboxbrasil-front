
-- Enum de status de validação
DO $$ BEGIN
  CREATE TYPE public.status_documento_licenca AS ENUM ('aguardando_validacao','aceito','negado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Licenças por cidade (uma linha por cidade atendida pelo usuário/locador)
CREATE TABLE IF NOT EXISTS public.licenca_cidade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estado TEXT NOT NULL,
  cidade TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, estado, cidade)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.licenca_cidade TO authenticated;
GRANT ALL ON public.licenca_cidade TO service_role;

ALTER TABLE public.licenca_cidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia suas licenças de cidade"
  ON public.licenca_cidade FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_licenca_cidade_updated
  BEFORE UPDATE ON public.licenca_cidade
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_licenca_cidade_user ON public.licenca_cidade(user_id);

-- Documentos de cada licença por cidade
CREATE TABLE IF NOT EXISTS public.documentos_licenca_cidade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  licenca_cidade_id UUID NOT NULL REFERENCES public.licenca_cidade(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_vencimento DATE,
  arquivo_path TEXT,
  status public.status_documento_licenca NOT NULL DEFAULT 'aguardando_validacao',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos_licenca_cidade TO authenticated;
GRANT ALL ON public.documentos_licenca_cidade TO service_role;

ALTER TABLE public.documentos_licenca_cidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia seus documentos de licença"
  ON public.documentos_licenca_cidade FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin gerencia documentos de licença"
  ON public.documentos_licenca_cidade FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_documentos_licenca_cidade_updated
  BEFORE UPDATE ON public.documentos_licenca_cidade
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_doc_lic_cidade_lic ON public.documentos_licenca_cidade(licenca_cidade_id);
CREATE INDEX IF NOT EXISTS idx_doc_lic_cidade_user ON public.documentos_licenca_cidade(user_id);
