ALTER TABLE public.carrinho_itens REPLICA IDENTITY FULL;
ALTER TABLE public.carrinhos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.carrinho_itens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.carrinhos;