
CREATE POLICY "MTR: prefeitura da cidade visualiza"
  ON public.mtr FOR SELECT
  USING (
    has_role(auth.uid(), 'prefeitura'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND lower(p.cidade) = lower(mtr.obra_cidade)
        AND upper(p.estado) = upper(mtr.obra_estado)
    )
  );

CREATE POLICY "CDF: prefeitura da cidade visualiza"
  ON public.cdf FOR SELECT
  USING (
    has_role(auth.uid(), 'prefeitura'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND lower(p.cidade) = lower(cdf.obra_cidade)
        AND upper(p.estado) = upper(cdf.obra_estado)
    )
  );
