
-- 1) Enum tipo_pessoa (idempotente)
DO $$ BEGIN
  CREATE TYPE public.tipo_pessoa AS ENUM ('fisica', 'juridica');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Novas colunas em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tipo_pessoa public.tipo_pessoa NOT NULL DEFAULT 'juridica',
  ADD COLUMN IF NOT EXISTS nome_fantasia text,
  ADD COLUMN IF NOT EXISTS email_secundario text,
  ADD COLUMN IF NOT EXISTS descricao text,
  -- responsável
  ADD COLUMN IF NOT EXISTS resp_nome text,
  ADD COLUMN IF NOT EXISTS resp_cpf text,
  ADD COLUMN IF NOT EXISTS resp_cargo text,
  ADD COLUMN IF NOT EXISTS resp_departamento text,
  ADD COLUMN IF NOT EXISTS resp_email text,
  ADD COLUMN IF NOT EXISTS resp_email_secundario text,
  ADD COLUMN IF NOT EXISTS resp_telefone text,
  ADD COLUMN IF NOT EXISTS resp_celular text,
  -- endereço
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS logradouro text,
  ADD COLUMN IF NOT EXISTS numero text,
  ADD COLUMN IF NOT EXISTS complemento text,
  ADD COLUMN IF NOT EXISTS bairro text,
  ADD COLUMN IF NOT EXISTS cidade text,
  ADD COLUMN IF NOT EXISTS estado text;

-- 3) Trigger updated_at (idempotente)
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
