
CREATE TABLE public.termos_uso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  versao TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  situacao TEXT NOT NULL DEFAULT 'ativo' CHECK (situacao IN ('ativo','historico')),
  upload_por TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.termos_uso TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.termos_uso TO authenticated;
GRANT ALL ON public.termos_uso TO service_role;
ALTER TABLE public.termos_uso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Termos de uso são públicos" ON public.termos_uso FOR SELECT USING (true);
CREATE POLICY "Admins gerenciam termos de uso" ON public.termos_uso FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER update_termos_uso_updated_at BEFORE UPDATE ON public.termos_uso FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.politica_privacidade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  versao TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  situacao TEXT NOT NULL DEFAULT 'ativo' CHECK (situacao IN ('ativo','historico')),
  upload_por TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.politica_privacidade TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.politica_privacidade TO authenticated;
GRANT ALL ON public.politica_privacidade TO service_role;
ALTER TABLE public.politica_privacidade ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Política de privacidade é pública" ON public.politica_privacidade FOR SELECT USING (true);
CREATE POLICY "Admins gerenciam política de privacidade" ON public.politica_privacidade FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER update_politica_privacidade_updated_at BEFORE UPDATE ON public.politica_privacidade FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.termos_uso (titulo, versao, conteudo, situacao, upload_por) VALUES
('Termos de Uso Geral v2.1', '2.1.0', 'Conteúdo inicial dos Termos de Uso. Edite no painel administrativo.', 'ativo', 'Admin Sistema');

INSERT INTO public.politica_privacidade (titulo, versao, conteudo, situacao, upload_por) VALUES
('Política de Privacidade v1.2', '1.2.0', 'Conteúdo inicial da Política de Privacidade. Edite no painel administrativo.', 'ativo', 'DPO Empresa');
