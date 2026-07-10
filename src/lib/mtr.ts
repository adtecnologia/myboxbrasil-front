import { supabase } from "@/integrations/supabase/client";
import myboxLogo from "@/assets/mybox-logo.png";

const esc = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

const fmtEndereco = (p: any): string => {
  if (!p) return "";
  const linha1 = [p.logradouro, p.numero].filter(Boolean).join(", ");
  const extras = [p.complemento, p.bairro].filter(Boolean).join(" - ");
  return [linha1, extras].filter(Boolean).join(" - ");
};

const fmtDoc = (p: any): string => {
  if (!p?.documento) return "";
  const d = String(p.documento).replace(/\D/g, "");
  if (p.tipo_documento === "cnpj" || d.length === 14) {
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5");
  }
  return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4");
};

const fmtDataBR = (d?: string | null) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
};

export async function printMtr(oluId: string) {
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) return;
  win.document.write(
    `<!doctype html><html><head><title>MTR</title></head><body style="font-family:Arial,sans-serif;padding:24px;">Carregando MTR...</body></html>`
  );

  try {
    // 1) Tenta carregar snapshot salvo em `mtr` + `mtr_itens`
    const { data: mtrSnap } = await supabase
      .from("mtr")
      .select("*, mtr_itens(*)")
      .eq("ordem_locacao_unidade_id", oluId)
      .order("data_emissao", { ascending: false })
      .limit(1)
      .maybeSingle();

    let logoUrl = new URL(myboxLogo, window.location.origin).href;
    try {
      const resp = await fetch(logoUrl);
      const blob = await resp.blob();
      logoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {}

    if (mtrSnap) {
      const m: any = mtrSnap;
      const gerador = {
        nome: m.gerador_nome,
        nome_fantasia: m.gerador_nome_fantasia,
        documento: m.gerador_documento,
        tipo_documento: m.gerador_tipo_documento,
        telefone: m.gerador_telefone,
        celular: m.gerador_celular,
        resp_nome: m.gerador_resp_nome,
        logradouro: m.obra_logradouro,
        numero: m.obra_numero,
        complemento: m.obra_complemento,
        bairro: m.obra_bairro,
        cidade: m.obra_cidade,
        estado: m.obra_estado,
        cep: m.obra_cep,
      };
      const transportador = {
        nome: m.transportador_nome,
        nome_fantasia: m.transportador_nome_fantasia,
        documento: m.transportador_documento,
        tipo_documento: m.transportador_tipo_documento,
        telefone: m.transportador_telefone,
        celular: m.transportador_celular,
        resp_nome: m.transportador_resp_nome,
        logradouro: m.transportador_logradouro,
        numero: m.transportador_numero,
        complemento: m.transportador_complemento,
        bairro: m.transportador_bairro,
        cidade: m.transportador_cidade,
        estado: m.transportador_estado,
        cep: m.transportador_cep,
      };
      const destino = {
        nome: m.destino_nome,
        nome_fantasia: m.destino_nome_fantasia,
        documento: m.destino_documento,
        tipo_documento: m.destino_tipo_documento,
        telefone: m.destino_telefone,
        celular: m.destino_celular,
        resp_nome: m.destino_resp_nome,
        logradouro: m.destino_logradouro,
        numero: m.destino_numero,
        complemento: m.destino_complemento,
        bairro: m.destino_bairro,
        cidade: m.destino_cidade,
        estado: m.destino_estado,
        cep: m.destino_cep,
      };
      const motorista = m.motorista_nome ? { nome: m.motorista_nome } : null;
      const residuos = (m.mtr_itens ?? []).map((it: any) => ({
        nome: it.classe_nome,
        peso: it.peso_kg,
        volume: it.volume_m3,
      }));
      const html = renderMtrHtml({
        logoUrl,
        numeroMtr: m.numero,
        dataEmissao: fmtDataBR(m.data_emissao),
        dataTransporte: fmtDataBR(m.data_transporte ?? m.data_emissao),
        gerador,
        transportador,
        destino,
        motorista,
        placaVeiculo: m.veiculo_placa ?? "",
        residuos,
      });
      writeAndPrint(win, html);
      return;
    }

    // Unidade + relacionamentos base
    const { data: olu, error: e1 } = await supabase
      .from("ordem_locacao_unidades")
      .select(
        `id, peso_kg, volume_m3, destino_final_id, updated_at, created_at,
         cacamba_unidades ( codigo, cacamba_id ),
         ordens_locacao (
           pedido_fornecedor_id,
           obras ( rua, numero, complemento, bairro, cidade, estado, cep ),
           pedido_fornecedores ( locador_id, pedidos ( numero, locatario_id ) )
         )`
      )
      .eq("id", oluId)
      .maybeSingle();
    if (e1 || !olu) throw e1 ?? new Error("Unidade não encontrada");

    const locatarioId = (olu as any).ordens_locacao?.pedido_fornecedores?.pedidos?.locatario_id;
    const locadorId = (olu as any).ordens_locacao?.pedido_fornecedores?.locador_id;
    const destinoId = (olu as any).destino_final_id;
    const pedidoNum = (olu as any).ordens_locacao?.pedido_fornecedores?.pedidos?.numero;
    const codigoCacamba = (olu as any).cacamba_unidades?.codigo;
    const cacambaId = (olu as any).cacamba_unidades?.cacamba_id;
    const obra = (olu as any).ordens_locacao?.obras ?? null;

    // Perfis: locatário e destino
    const perfilIds = [locatarioId, destinoId, locadorId].filter(Boolean) as string[];
    const perfis = new Map<string, any>();
    if (perfilIds.length) {
      const { data } = await supabase.from("profiles").select("*").in("id", perfilIds);
      (data ?? []).forEach((p: any) => perfis.set(p.id, p));
    }
    const geradorBase = locatarioId ? perfis.get(locatarioId) : null;
    // Endereço do gerador vem da obra da unidade (não do perfil)
    const gerador = geradorBase
      ? {
          ...geradorBase,
          logradouro: obra?.rua ?? geradorBase.logradouro,
          numero: obra?.numero ?? geradorBase.numero,
          complemento: obra?.complemento ?? geradorBase.complemento,
          bairro: obra?.bairro ?? geradorBase.bairro,
          cidade: obra?.cidade ?? geradorBase.cidade,
          estado: obra?.estado ?? geradorBase.estado,
          cep: obra?.cep ?? geradorBase.cep,
        }
      : null;
    const destino = destinoId ? perfis.get(destinoId) : null;
    const transportadorProfile = locadorId ? perfis.get(locadorId) : null;

    // Rota de retirada -> motorista + veículo salvos na rota vinculada ao item
    const { data: transporteRetirada } = await supabase
      .rpc("get_mtr_retirada_transporte", { _olu_id: oluId })
      .maybeSingle();
    const motorista = transporteRetirada?.motorista_nome
      ? { nome: transporteRetirada.motorista_nome }
      : null;
    const placaVeiculo = transporteRetirada?.placa ?? "";
    const dataRetirada = transporteRetirada?.data_programada;

    // Resíduos da unidade: preferir olu_residuos; fallback para cacamba_residuos
    const { data: oluResiduos } = await supabase
      .from("ordem_locacao_unidade_residuos")
      .select("classe_nome, peso_kg, volume_m3")
      .eq("ordem_locacao_unidade_id", oluId);

    let residuos: { nome: string; peso?: number | null; volume?: number | null }[] = (oluResiduos ?? []).map(
      (r: any) => ({ nome: r.classe_nome, peso: r.peso_kg, volume: r.volume_m3 })
    );
    if (residuos.length === 0 && cacambaId) {
      const { data: cr } = await supabase
        .from("cacamba_residuos")
        .select("classe")
        .eq("cacamba_id", cacambaId);
      const ids = (cr ?? []).map((r: any) => r.classe);
      const nomes = new Map<string, string>();
      if (ids.length) {
        const { data: cls } = await supabase
          .from("classes_residuo")
          .select("id, nome")
          .in("id", ids);
        (cls ?? []).forEach((c: any) => nomes.set(c.id, c.nome));
      }
      residuos = (cr ?? []).map((r: any) => ({
        nome: nomes.get(r.classe) ?? r.classe,
        peso: (olu as any).peso_kg,
        volume: (olu as any).volume_m3,
      }));
    }

    const numeroMtr = `${(pedidoNum ?? "").toString().padStart(6, "0")}-${(codigoCacamba ?? oluId.slice(0, 6)).toString().toUpperCase()}`;
    const dataEmissao = fmtDataBR(new Date().toISOString());
    const dataTransporte = fmtDataBR(dataRetirada ?? (olu as any).updated_at);
    const html = renderMtrHtml({
      logoUrl,
      numeroMtr,
      dataEmissao,
      dataTransporte,
      gerador,
      transportador: transportadorProfile,
      destino,
      motorista,
      placaVeiculo,
      residuos,
    });
    writeAndPrint(win, html);
  } catch (err: any) {
    win.document.body.innerHTML = `<div style="font-family:Arial;padding:24px;color:#b91c1c">Erro ao carregar MTR: ${esc(err?.message ?? err)}</div>`;
  }
}

function renderMtrHtml(ctx: {
  logoUrl: string;
  numeroMtr: string;
  dataEmissao: string;
  dataTransporte: string;
  gerador: any;
  transportador: any;
  destino: any;
  motorista: any;
  placaVeiculo: string;
  residuos: { nome: string; peso?: number | null; volume?: number | null }[];
}) {
  const { logoUrl, numeroMtr, dataEmissao, dataTransporte, gerador, transportador, destino, motorista, placaVeiculo, residuos } = ctx;
  const bloco = (titulo: string, perfil: any, extras: { data?: string; motorista?: any; placa?: string } = {}) => `
      <div class="section">
        <div class="section-title">${esc(titulo)}</div>
        <div class="grid-2">
          <div class="cell wide">
            <div class="label">Razão Social:</div>
            <div class="value">${esc(perfil?.nome_fantasia || perfil?.nome || "—")}</div>
          </div>
          <div class="cell">
            <div class="label">CPF/CNPJ:</div>
            <div class="value">${esc(fmtDoc(perfil))}</div>
          </div>
        </div>
        <div class="grid-3">
          <div class="cell">
            <div class="label">Endereço:</div>
            <div class="value">${esc(fmtEndereco(perfil) || "—")}</div>
          </div>
          <div class="cell">
            <div class="label">Telefone:</div>
            <div class="value">${esc(perfil?.telefone || perfil?.celular || "—")}</div>
          </div>
          <div class="cell">
            <div class="label">${titulo.includes("Transportador") ? "Data do transporte" : "Data da emissão"}:</div>
            <div class="value">${esc(extras.data || dataEmissao)}</div>
          </div>
        </div>
        <div class="grid-3">
          <div class="cell">
            <div class="label">Município:</div>
            <div class="value">${esc(perfil?.cidade || "—")}</div>
          </div>
          <div class="cell small">
            <div class="label">UF:</div>
            <div class="value">${esc(perfil?.estado || "—")}</div>
          </div>
          <div class="cell">
            <div class="label">CEP:</div>
            <div class="value">${esc(perfil?.cep || "—")}</div>
          </div>
        </div>
        ${
          extras.motorista !== undefined
            ? `<div class="grid-2">
                 <div class="cell">
                   <div class="label">Nome do Motorista:</div>
                   <div class="value">${esc(extras.motorista?.nome || "—")}</div>
                 </div>
                 <div class="cell">
                   <div class="label">Placa do Veículo:</div>
                   <div class="value">${esc(extras.placa || "—")}</div>
                 </div>
               </div>`
            : `<div class="grid-2">
                 <div class="cell wide">
                   <div class="label">Nome do Responsável pela Emissão:</div>
                   <div class="value">${esc(perfil?.resp_nome || perfil?.nome || "—")}</div>
                 </div>
               </div>`
        }
        <div class="assinatura">assinatura do responsável</div>
      </div>
    `;

    const rowsResiduos = residuos.length
      ? residuos
          .map((r, i) => {
            const qtd = r.peso ?? r.volume ?? "";
            const un = r.peso != null ? "KG" : r.volume != null ? "M³" : "";
            return `<tr>
              <td class="c">${i + 1}</td>
              <td>${esc(r.nome)}</td>
              <td class="c">${esc(String(qtd))}</td>
              <td class="c">${esc(un)}</td>
            </tr>`;
          })
          .join("")
      : `<tr><td colspan="4" class="c muted">Sem resíduos cadastrados</td></tr>`;

    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>MTR nº ${esc(numeroMtr)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 24px; background: #fff; font-size: 12px; }
  .header { display: flex; align-items: center; gap: 20px; border: 1px solid #999; border-radius: 6px; padding: 14px 20px; margin-bottom: 14px; }
  .header .brand { display: flex; align-items: center; gap: 12px; min-width: 200px; }
  .header .brand img { height: 44px; width: auto; }
  .header .brand .name { font-weight: 800; font-size: 20px; color: #16a34a; letter-spacing: 0.5px; }
  .header .title-wrap { flex: 1; text-align: center; }
  .header .title { font-weight: 700; font-size: 16px; }
  .header .num { font-weight: 600; font-size: 13px; color: #555; margin-top: 4px; }
  .section { border: 1px solid #999; border-radius: 4px; margin-bottom: 8px; overflow: hidden; }
  .section-title { background: #f2f2f2; padding: 6px 10px; font-weight: 700; border-bottom: 1px solid #ccc; }
  .grid-2, .grid-3 { display: grid; border-bottom: 1px solid #e5e5e5; }
  .grid-2 { grid-template-columns: 2fr 1fr; }
  .grid-3 { grid-template-columns: 2fr 1fr 1fr; }
  .cell { padding: 6px 10px; border-right: 1px solid #e5e5e5; }
  .cell:last-child { border-right: none; }
  .cell.small { max-width: 100px; }
  .cell.wide { grid-column: span 1; }
  .label { font-size: 10.5px; color: #555; }
  .value { font-weight: 600; }
  .assinatura { text-align: right; padding: 18px 10px 8px; font-style: italic; color: #666; font-size: 10.5px; }
  table.residuos { width: 100%; border-collapse: collapse; }
  table.residuos th, table.residuos td { border-bottom: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5; padding: 6px 10px; font-size: 11.5px; }
  table.residuos th:last-child, table.residuos td:last-child { border-right: none; }
  table.residuos tbody tr:last-child td { border-bottom: none; }
  table.residuos th { background: #fafafa; text-align: left; font-weight: 600; color: #555; font-size: 10.5px; }
  .c { text-align: center; }
  .muted { color: #888; }
  .residuos-title { margin-top: 14px; font-weight: 700; }
  @media print { body { padding: 12px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <img src="${esc(logoUrl)}" alt="MyBox" />
      <div class="name">MyBox</div>
    </div>
    <div class="title-wrap">
      <div class="title">Manifesto de Transporte de Resíduos - MTR</div>
      <div class="num">MTR nº ${esc(numeroMtr)}</div>
    </div>
  </div>

  ${bloco("Identificação do Gerador", gerador)}
  ${bloco("Identificação do Transportador", transportador, {
    data: dataTransporte,
    motorista,
    placa: placaVeiculo,
  })}
  ${bloco("Identificação do Destinador", destino)}

  <div class="section">
    <div class="section-title">Identificação dos Resíduos</div>
    <table class="residuos">
      <thead>
        <tr>
          <th style="width:40px" class="c">Item</th>
          <th>Resíduo</th>
          <th style="width:120px" class="c">Qtde</th>
          <th style="width:80px" class="c">Unidade</th>
        </tr>
      </thead>
      <tbody>${rowsResiduos}</tbody>
    </table>
  </div>
</body>
</html>`;
}

function writeAndPrint(win: Window, html: string) {
  win.document.open();
  win.document.write(html);
  win.document.close();
  const triggerPrint = () => {
    try { win.focus(); win.print(); } catch {}
  };
  const imgs = Array.from(win.document.images) as HTMLImageElement[];
  Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener("load", () => res());
            img.addEventListener("error", () => res());
          })
    )
  ).then(() => setTimeout(triggerPrint, 200));
}