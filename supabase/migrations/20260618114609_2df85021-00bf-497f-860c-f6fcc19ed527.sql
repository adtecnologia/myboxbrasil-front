
-- Amplia SELECT em profiles para qualquer usuário autenticado (leitura de entidades)
DROP POLICY IF EXISTS "Usuário lê o próprio perfil" ON public.profiles;
CREATE POLICY "Autenticado lê perfis" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);
