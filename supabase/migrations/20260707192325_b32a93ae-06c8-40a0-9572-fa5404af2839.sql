CREATE OR REPLACE FUNCTION public.get_destinos_finais()
RETURNS TABLE(id uuid, nome text, documento text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.nome, p.documento
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  WHERE ur.role = 'destino' AND ur.ativo = true
  ORDER BY p.nome;
$$;

GRANT EXECUTE ON FUNCTION public.get_destinos_finais() TO authenticated;