
CREATE POLICY "Prefeitura visualiza licencas da sua cidade"
  ON public.licenca_cidade FOR SELECT
  USING (
    has_role(auth.uid(), 'prefeitura'::app_role)
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND lower(p.cidade) = lower(licenca_cidade.cidade)
        AND upper(p.estado) = upper(licenca_cidade.estado)
    )
  );

CREATE POLICY "Prefeitura visualiza documentos de licenca da sua cidade"
  ON public.documentos_licenca_cidade FOR SELECT
  USING (
    has_role(auth.uid(), 'prefeitura'::app_role)
    AND EXISTS (
      SELECT 1 FROM licenca_cidade lc
      JOIN profiles p ON p.id = auth.uid()
      WHERE lc.id = documentos_licenca_cidade.licenca_cidade_id
        AND lower(lc.cidade) = lower(p.cidade)
        AND upper(lc.estado) = upper(p.estado)
    )
  );
