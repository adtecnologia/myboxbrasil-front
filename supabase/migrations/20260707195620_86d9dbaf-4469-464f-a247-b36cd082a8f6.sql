-- 1) Tabela de resíduos por unidade (para retirada)
CREATE TABLE IF NOT EXISTS public.ordem_locacao_unidade_residuos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_locacao_unidade_id uuid NOT NULL REFERENCES public.ordem_locacao_unidades(id) ON DELETE CASCADE,
  classe_id uuid REFERENCES public.classes_residuo(id) ON DELETE SET NULL,
  classe_nome text NOT NULL,
  peso_kg numeric,
  volume_m3 numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ordem_locacao_unidade_id, classe_nome)
);

CREATE INDEX IF NOT EXISTS idx_olur_olu ON public.ordem_locacao_unidade_residuos(ordem_locacao_unidade_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ordem_locacao_unidade_residuos TO authenticated;
GRANT ALL ON public.ordem_locacao_unidade_residuos TO service_role;

ALTER TABLE public.ordem_locacao_unidade_residuos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partes veem residuos da unidade"
  ON public.ordem_locacao_unidade_residuos
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.ordem_locacao_unidades olu
    JOIN public.ordens_locacao ol ON ol.id = olu.ordem_locacao_id
    WHERE olu.id = ordem_locacao_unidade_residuos.ordem_locacao_unidade_id
      AND public.can_access_pedido_fornecedor(ol.pedido_fornecedor_id)
  ));

CREATE POLICY "Partes gerenciam residuos da unidade"
  ON public.ordem_locacao_unidade_residuos
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.ordem_locacao_unidades olu
    JOIN public.cacamba_unidades cu ON cu.id = olu.cacamba_unidade_id
    JOIN public.cacambas c ON c.id = cu.cacamba_id
    LEFT JOIN public.rota_itens ri ON ri.ordem_locacao_unidade_id = olu.id
    LEFT JOIN public.rotas r ON r.id = ri.rota_id
    WHERE olu.id = ordem_locacao_unidade_residuos.ordem_locacao_unidade_id
      AND (
        c.locador_id = auth.uid()
        OR r.motorista_id = auth.uid()
        OR public.is_admin(auth.uid())
      )
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.ordem_locacao_unidades olu
    JOIN public.cacamba_unidades cu ON cu.id = olu.cacamba_unidade_id
    JOIN public.cacambas c ON c.id = cu.cacamba_id
    LEFT JOIN public.rota_itens ri ON ri.ordem_locacao_unidade_id = olu.id
    LEFT JOIN public.rotas r ON r.id = ri.rota_id
    WHERE olu.id = ordem_locacao_unidade_residuos.ordem_locacao_unidade_id
      AND (
        c.locador_id = auth.uid()
        OR r.motorista_id = auth.uid()
        OR public.is_admin(auth.uid())
      )
  ));

CREATE TRIGGER trg_olur_updated_at
  BEFORE UPDATE ON public.ordem_locacao_unidade_residuos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Atualiza RPC para retornar id + nome dos resíduos
CREATE OR REPLACE FUNCTION public.get_motorista_rotas(_motorista uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(jsonb_agg(rota ORDER BY data_programada NULLS LAST), '[]'::jsonb)
  FROM (
    SELECT
      r.id,
      r.data_programada,
      r.status,
      jsonb_build_object(
        'placa', v.placa,
        'marca', v.marca,
        'modelo', v.modelo
      ) AS veiculo,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', ri.id,
          'sequencia', ri.sequencia,
          'tipo', ri.tipo,
          'cliente', COALESCE(prof.nome, 'Cliente'),
          'endereco', NULLIF(concat_ws(' - ',
            NULLIF(concat_ws(', ', o.rua, o.numero), ''),
            o.bairro,
            NULLIF(concat_ws('/', o.cidade, o.estado), '')
          ), ''),
          'cidade', o.cidade,
          'estado', o.estado,
          'codigo_cacamba', cu.codigo,
          'olu_status', olu.status,
          'residuos', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('id', s.cid, 'nome', s.cnome) ORDER BY s.cnome)
            FROM (
              SELECT DISTINCT
                clr.id AS cid,
                COALESCE(clr.nome, cr.classe) AS cnome
              FROM cacamba_residuos cr
              LEFT JOIN classes_residuo clr ON clr.id::text = cr.classe
              WHERE cr.cacamba_id = cu.cacamba_id
            ) s
          ), '[]'::jsonb)
        ) ORDER BY ri.sequencia)
        FROM rota_itens ri
        LEFT JOIN ordem_locacao_unidades olu ON olu.id = ri.ordem_locacao_unidade_id
        LEFT JOIN cacamba_unidades cu ON cu.id = olu.cacamba_unidade_id
        LEFT JOIN ordens_locacao ol ON ol.id = olu.ordem_locacao_id
        LEFT JOIN obras o ON o.id = ol.obra_id
        LEFT JOIN pedido_fornecedores pf ON pf.id = ol.pedido_fornecedor_id
        LEFT JOIN pedidos p ON p.id = pf.pedido_id
        LEFT JOIN profiles prof ON prof.id = p.locatario_id
        WHERE ri.rota_id = r.id
      ), '[]'::jsonb) AS itens
    FROM rotas r
    LEFT JOIN veiculos v ON v.id = r.veiculo_id
    WHERE r.motorista_id = _motorista
  ) rota;
$function$;