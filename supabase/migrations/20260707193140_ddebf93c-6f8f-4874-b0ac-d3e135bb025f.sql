ALTER TABLE public.rotas ADD COLUMN IF NOT EXISTS destino_final_id uuid REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_rotas_destino_final ON public.rotas(destino_final_id);