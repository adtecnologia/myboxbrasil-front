REVOKE EXECUTE ON FUNCTION public.can_select_rota_item(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_select_rota_item(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.can_select_rota_item(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_select_rota_item(uuid, uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.can_manage_rota_item(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_manage_rota_item(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.can_manage_rota_item(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_rota_item(uuid) TO service_role;