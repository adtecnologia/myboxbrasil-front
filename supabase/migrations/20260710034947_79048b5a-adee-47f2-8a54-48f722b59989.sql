REVOKE ALL ON FUNCTION public.can_access_rota(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_rota(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_rota(uuid) TO service_role;