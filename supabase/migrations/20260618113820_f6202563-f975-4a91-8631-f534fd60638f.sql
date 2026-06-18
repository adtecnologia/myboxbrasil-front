
-- Função utilitária de updated_at já existe (public.update_updated_at_column)

-- 1) classes_residuo
CREATE TABLE public.classes_residuo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locador_id uuid NOT NULL,
  nome text NOT NULL,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes_residuo TO authenticated;
GRANT ALL ON public.classes_residuo TO service_role;
ALTER TABLE public.classes_residuo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locador gerencia classes" ON public.classes_residuo
  FOR ALL TO authenticated
  USING (locador_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_classes_residuo_updated_at BEFORE UPDATE ON public.classes_residuo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_classes_residuo_locador ON public.classes_residuo(locador_id);

-- 2) tecnologias_tratamento
CREATE TABLE public.tecnologias_tratamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locador_id uuid NOT NULL,
  nome text NOT NULL,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tecnologias_tratamento TO authenticated;
GRANT ALL ON public.tecnologias_tratamento TO service_role;
ALTER TABLE public.tecnologias_tratamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locador gerencia tecnologias" ON public.tecnologias_tratamento
  FOR ALL TO authenticated
  USING (locador_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_tecnologias_updated_at BEFORE UPDATE ON public.tecnologias_tratamento
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_tecnologias_locador ON public.tecnologias_tratamento(locador_id);

-- 3) tipos_veiculos
CREATE TABLE public.tipos_veiculos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locador_id uuid NOT NULL,
  nome text NOT NULL,
  descricao text,
  foto_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tipos_veiculos TO authenticated;
GRANT ALL ON public.tipos_veiculos TO service_role;
ALTER TABLE public.tipos_veiculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locador gerencia tipos_veiculos" ON public.tipos_veiculos
  FOR ALL TO authenticated
  USING (locador_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_tipos_veiculos_updated_at BEFORE UPDATE ON public.tipos_veiculos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_tipos_veiculos_locador ON public.tipos_veiculos(locador_id);

-- 4) tipos_equipamentos
CREATE TABLE public.tipos_equipamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locador_id uuid NOT NULL,
  nome text NOT NULL,
  descricao text,
  foto_url text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tipos_equipamentos TO authenticated;
GRANT ALL ON public.tipos_equipamentos TO service_role;
ALTER TABLE public.tipos_equipamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locador gerencia tipos_equipamentos" ON public.tipos_equipamentos
  FOR ALL TO authenticated
  USING (locador_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_tipos_equipamentos_updated_at BEFORE UPDATE ON public.tipos_equipamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_tipos_equipamentos_locador ON public.tipos_equipamentos(locador_id);

-- 5) modelos_cacamba
CREATE TABLE public.modelos_cacamba (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locador_id uuid NOT NULL,
  modelo text NOT NULL,
  capacidade text NOT NULL,
  medida_a text,
  medida_b text,
  medida_c text,
  medida_d text,
  medida_e text,
  medida_f text,
  preco_minimo numeric(12,2),
  foto_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modelos_cacamba TO authenticated;
GRANT ALL ON public.modelos_cacamba TO service_role;
ALTER TABLE public.modelos_cacamba ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locador gerencia modelos_cacamba" ON public.modelos_cacamba
  FOR ALL TO authenticated
  USING (locador_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_modelos_cacamba_updated_at BEFORE UPDATE ON public.modelos_cacamba
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_modelos_cacamba_locador ON public.modelos_cacamba(locador_id);

-- 6) formas_pagamento
CREATE TABLE public.formas_pagamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locador_id uuid NOT NULL,
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.formas_pagamento TO authenticated;
GRANT ALL ON public.formas_pagamento TO service_role;
ALTER TABLE public.formas_pagamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locador gerencia formas_pagamento" ON public.formas_pagamento
  FOR ALL TO authenticated
  USING (locador_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_formas_pagamento_updated_at BEFORE UPDATE ON public.formas_pagamento
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_formas_pagamento_locador ON public.formas_pagamento(locador_id);
