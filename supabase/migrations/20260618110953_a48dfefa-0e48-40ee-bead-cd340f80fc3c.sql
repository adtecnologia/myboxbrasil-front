
-- =========================================================
-- FASE 1 — Auth + Perfis Multi-tenant (Mybox)
-- =========================================================

-- 1) Enum de papéis do app
CREATE TYPE public.app_role AS ENUM (
  'admin', 'locador', 'locatario', 'motorista', 'prefeitura', 'destino'
);

CREATE TYPE public.tipo_documento AS ENUM ('cpf', 'cnpj');

-- 2) Função genérica updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3) Tabela profiles (1:1 com auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  documento TEXT NOT NULL UNIQUE,
  tipo_documento public.tipo_documento NOT NULL,
  email TEXT,
  celular TEXT,
  telefone TEXT,
  avatar_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_documento ON public.profiles(documento);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Tabela user_roles (papéis por locador/tenant)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  locador_id UUID,                 -- NULL para admin/papéis sem tenant
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, locador_id)
);

CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_locador ON public.user_roles(locador_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5) Funções SECURITY DEFINER para checagem de papel (evita recursão em RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND ativo = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role_for_locador(
  _user_id UUID, _role public.app_role, _locador_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND ativo = true
      AND (locador_id = _locador_id OR locador_id IS NULL)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin' AND ativo = true
  );
$$;

-- 6) RLS — profiles
CREATE POLICY "Usuário lê o próprio perfil"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Usuário atualiza o próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin gerencia todos os perfis"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 7) RLS — user_roles
CREATE POLICY "Usuário lê os próprios papéis"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admin gerencia todos os papéis"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Permite o usuário inserir o papel inicial para si mesmo no momento do cadastro
-- (apenas papéis não-admin para evitar escalonamento)
CREATE POLICY "Usuário cria papel inicial para si"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role <> 'admin'
  );

-- 8) Trigger que cria profile automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, documento, tipo_documento, email, celular, telefone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Sem nome'),
    COALESCE(NEW.raw_user_meta_data->>'documento', NEW.id::text),
    COALESCE((NEW.raw_user_meta_data->>'tipo_documento')::public.tipo_documento, 'cpf'),
    NEW.raw_user_meta_data->>'email_contato',
    NEW.raw_user_meta_data->>'celular',
    NEW.raw_user_meta_data->>'telefone'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Se veio um papel inicial nos metadados, registra
  IF NEW.raw_user_meta_data ? 'initial_role' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'initial_role')::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
