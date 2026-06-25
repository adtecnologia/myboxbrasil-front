
ALTER TABLE public.termos_uso ALTER COLUMN conteudo DROP NOT NULL;
ALTER TABLE public.termos_uso ADD COLUMN IF NOT EXISTS arquivo_url TEXT;
ALTER TABLE public.politica_privacidade ALTER COLUMN conteudo DROP NOT NULL;
ALTER TABLE public.politica_privacidade ADD COLUMN IF NOT EXISTS arquivo_url TEXT;

CREATE POLICY "Public read documentos-legais"
ON storage.objects FOR SELECT
USING (bucket_id = 'documentos-legais');

CREATE POLICY "Admins upload documentos-legais"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos-legais' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins update documentos-legais"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos-legais' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins delete documentos-legais"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos-legais' AND public.is_admin(auth.uid()));
