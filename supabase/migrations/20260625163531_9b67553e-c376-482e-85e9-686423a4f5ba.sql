CREATE TABLE public.rotas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motorista_id UUID REFERENCES auth.users(id),
  veiculo_id UUID REFERENCES public.veiculos(id),
  data_programada DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendada',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rotas TO authenticated;
GRANT ALL ON public.rotas TO service_role;

ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locador gerencia suas rotas"
ON public.rotas FOR ALL TO authenticated
USING (locador_id = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (locador_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Motorista lê suas rotas"
ON public.rotas FOR SELECT TO authenticated
USING (motorista_id = auth.uid());

CREATE TRIGGER update_rotas_updated_at BEFORE UPDATE ON public.rotas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_rotas_locador ON public.rotas(locador_id);
CREATE INDEX idx_rotas_motorista ON public.rotas(motorista_id);

CREATE TABLE public.rota_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rota_id UUID NOT NULL REFERENCES public.rotas(id) ON DELETE CASCADE,
  ordem_locacao_unidade_id UUID NOT NULL REFERENCES public.ordem_locacao_unidades(id) ON DELETE CASCADE,
  sequencia INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rota_itens TO authenticated;
GRANT ALL ON public.rota_itens TO service_role;

ALTER TABLE public.rota_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso via rota"
ON public.rota_itens FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.rotas r WHERE r.id = rota_id AND (r.locador_id = auth.uid() OR r.motorista_id = auth.uid() OR public.is_admin(auth.uid()))))
WITH CHECK (EXISTS (SELECT 1 FROM public.rotas r WHERE r.id = rota_id AND (r.locador_id = auth.uid() OR public.is_admin(auth.uid()))));

CREATE INDEX idx_rota_itens_rota ON public.rota_itens(rota_id);
CREATE INDEX idx_rota_itens_unidade ON public.rota_itens(ordem_locacao_unidade_id);