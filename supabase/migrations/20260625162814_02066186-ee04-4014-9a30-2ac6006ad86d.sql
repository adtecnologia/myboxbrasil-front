CREATE POLICY "Locador lê papéis do seu tenant"
ON public.user_roles
FOR SELECT
TO authenticated
USING (locador_id = auth.uid());

CREATE POLICY "Locador gerencia papéis do seu tenant"
ON public.user_roles
FOR ALL
TO authenticated
USING (locador_id = auth.uid())
WITH CHECK (locador_id = auth.uid());