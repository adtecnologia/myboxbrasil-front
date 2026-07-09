ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS op_disponibilidade_auto BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS op_visibilidade_frota BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS op_aceite_auto BOOLEAN NOT NULL DEFAULT false;