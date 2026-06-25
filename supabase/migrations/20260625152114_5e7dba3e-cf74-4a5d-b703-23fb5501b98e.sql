-- Reshape pedido_fornecedor_status: pagamento já confirmado antes do pedido,
-- então o status reflete a aceitação pelo locador.
ALTER TABLE public.pedido_fornecedores ALTER COLUMN status DROP DEFAULT;
ALTER TYPE public.pedido_fornecedor_status RENAME TO pedido_fornecedor_status_old;
CREATE TYPE public.pedido_fornecedor_status AS ENUM (
  'aguardando_aceite','aceito','recusado','em_separacao','agendado','entregue','cancelado'
);
ALTER TABLE public.pedido_fornecedores
  ALTER COLUMN status TYPE public.pedido_fornecedor_status
  USING (CASE status::text
    WHEN 'aguardando_pagamento' THEN 'aguardando_aceite'
    WHEN 'pago' THEN 'aceito'
    ELSE status::text
  END)::public.pedido_fornecedor_status;
ALTER TABLE public.pedido_fornecedores
  ALTER COLUMN status SET DEFAULT 'aguardando_aceite'::public.pedido_fornecedor_status;
DROP TYPE public.pedido_fornecedor_status_old;

-- Pedido master já entra como pago.
ALTER TABLE public.pedidos
  ALTER COLUMN status SET DEFAULT 'pago'::public.pedido_status;