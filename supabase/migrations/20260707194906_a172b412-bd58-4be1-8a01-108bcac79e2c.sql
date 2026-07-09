ALTER TABLE public.ordem_locacao_unidades
  ADD COLUMN IF NOT EXISTS peso_kg numeric,
  ADD COLUMN IF NOT EXISTS volume_m3 numeric;