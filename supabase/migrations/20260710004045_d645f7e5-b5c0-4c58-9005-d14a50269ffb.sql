
ALTER TABLE public.veiculos
  ADD COLUMN IF NOT EXISTS chassi text,
  ADD COLUMN IF NOT EXISTS cor text,
  ADD COLUMN IF NOT EXISTS configuracao text,
  ADD COLUMN IF NOT EXISTS tipo_carroceria text,
  ADD COLUMN IF NOT EXISTS capacidade_carga numeric,
  ADD COLUMN IF NOT EXISTS pbt numeric,
  ADD COLUMN IF NOT EXISTS rntrc text,
  ADD COLUMN IF NOT EXISTS crlv_numero text,
  ADD COLUMN IF NOT EXISTS crlv_validade date;
