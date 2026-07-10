CREATE OR REPLACE FUNCTION public.get_locadores_licenciados_prefeitura(_uid uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  nome text,
  nome_fantasia text,
  documento text,
  celular text,
  telefone text,
  email text,
  avatar_url text,
  cidade text,
  estado text,
  ativo boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cidade text;
  v_estado text;
BEGIN
  IF _uid IS NULL THEN
    RETURN;
  END IF;

  IF NOT (public.has_role(_uid, 'prefeitura') OR public.is_admin(_uid)) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;

  SELECT p.cidade, p.estado INTO v_cidade, v_estado
  FROM public.profiles p WHERE p.id = _uid;

  IF v_cidade IS NULL OR v_estado IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH locs AS (
    SELECT DISTINCT lc.user_id
    FROM public.licenca_cidade lc
    WHERE lower(lc.cidade) = lower(v_cidade)
      AND upper(lc.estado) = upper(v_estado)
  ),
  roles_locador AS (
    SELECT ur.user_id, bool_or(ur.ativo) AS any_ativo
    FROM public.user_roles ur
    JOIN locs ON locs.user_id = ur.user_id
    WHERE ur.role = 'locador'
    GROUP BY ur.user_id
  )
  SELECT
    p.id,
    p.nome,
    p.nome_fantasia,
    p.documento,
    p.celular,
    p.telefone,
    p.email,
    p.avatar_url,
    p.cidade,
    p.estado,
    COALESCE(rl.any_ativo, false) AS ativo
  FROM roles_locador rl
  JOIN public.profiles p ON p.id = rl.user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_locadores_licenciados_prefeitura(uuid) TO authenticated;