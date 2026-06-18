
CREATE POLICY "Autenticado lê cacambas" ON public.cacambas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticado lê cacamba_unidades" ON public.cacamba_unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticado lê cacamba_residuos" ON public.cacamba_residuos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticado lê cacamba_fotos" ON public.cacamba_fotos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticado lê equipamentos" ON public.equipamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticado lê equipamento_unidades" ON public.equipamento_unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticado lê equipamento_fotos" ON public.equipamento_fotos FOR SELECT TO authenticated USING (true);
