GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_fornecedores TO authenticated;
GRANT ALL ON public.pedido_fornecedores TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ordens_locacao TO authenticated;
GRANT ALL ON public.ordens_locacao TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;