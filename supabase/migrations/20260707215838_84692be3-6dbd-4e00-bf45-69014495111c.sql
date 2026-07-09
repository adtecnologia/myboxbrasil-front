
CREATE POLICY "Usuário lê seus documentos legais"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documentos-legais' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuário envia seus documentos legais"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos-legais' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuário atualiza seus documentos legais"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documentos-legais' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuário remove seus documentos legais"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documentos-legais' AND auth.uid()::text = (storage.foldername(name))[1]);
