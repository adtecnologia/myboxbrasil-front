import { supabase } from "@/integrations/supabase/client";
import myboxLogo from "@/assets/mybox-logo.png";

const esc = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
  try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return ""; }
};

export async function printCdf(oluId: string) {
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) return;
  win.document.write(
    `<!doctype html><html><head><title>CDF</title></head><body style="font-family:Arial,sans-serif;padding:24px;">Carregando CDF...</body></html>`
  );

  try {
    const { data: cdf, error } = await supabase
      .from("cdf" as any)
      .select("*, cdf_itens(*)")
      .eq("ordem_locacao_unidade_id", oluId)
      .order("data_emissao", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !cdf) throw error ?? new Error("CDF não encontrado");

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

    const m: any = cdf;
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
    const destino = {
      nome: m.destino_nome,
      nome_fantasia: m.destino_nome_fantasia,
      documento: m.destino_documento,
      tipo_documento: m.destino_tipo_documento,
      cidade: m.destino_cidade,
      estado: m.destino_estado,
      resp_nome: m.destino_resp_nome,
    };
    const itens = (m.cdf_itens ?? []).map((it: any) => ({
      classe: it.classe_nome,
      tratamento: it.tratamento_nome,
      peso: it.peso_kg,
      volume: it.volume_m3,
    }));

    const html = renderCdfHtml({
      logoUrl,
      numeroCdf: m.numero,
      dataEmissao: fmtDataBR(m.data_emissao),
      dataRecebimento: fmtDataBR(m.data_recebimento ?? m.data_emissao),
      gerador,
      destino,
      itens,
      declaracao: m.declaracao,
      observacoes: m.observacoes,
      mtrNumero: m.mtr_numero,
    });
    writeAndPrint(win, html);
  } catch (err: any) {
    win.document.body.innerHTML = `<div style="font-family:Arial;padding:24px;color:#b91c1c">Erro ao carregar CDF: ${esc(err?.message ?? err)}</div>`;
  }
}

function renderCdfHtml(ctx: {
  logoUrl: string;
  numeroCdf: string;
  dataEmissao: string;
  dataRecebimento: string;
  gerador: any;
  destino: any;
  itens: { classe: string; tratamento: string; peso?: number | null; volume?: number | null }[];
  declaracao?: string | null;
  observacoes?: string | null;
  mtrNumero?: string | null;
}) {
  const { logoUrl, numeroCdf, dataEmissao, dataRecebimento, gerador, destino, itens, declaracao, observacoes, mtrNumero } = ctx;

  const rowsResiduos = itens.length
    ? itens.map((r, i) => {
        const qtd = r.peso ?? r.volume ?? "";
        const un = r.peso != null ? "KG" : r.volume != null ? "M³" : "";
        return `<tr>
          <td class="c">${i + 1}</td>
          <td>${esc(r.classe || "—")}</td>
          <td class="c">${esc(r.classe || "—")}</td>
          <td class="c">${esc(String(qtd))}</td>
          <td class="c">${esc(un)}</td>
          <td>${esc(r.tratamento || "—")}</td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="6" class="c muted">Sem resíduos</td></tr>`;

  const certificaTexto = `${esc(destino.nome_fantasia || destino.nome || "—")}${destino.documento ? `, CPF/CNPJ ${esc(fmtDoc(destino))}` : ""} certifica que recebeu, em sua unidade${destino.cidade ? ` de ${esc(destino.cidade)}${destino.estado ? ` - ${esc(destino.estado)}` : ""}` : ""}, do Gerador indicado e no período relacionado, para tratamento e destinação final, os resíduos listados abaixo.`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>CDF nº ${esc(numeroCdf)}</title>
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
  .periodo { display: flex; justify-content: center; gap: 24px; padding: 8px; border: 1px solid #999; border-radius: 4px; margin-bottom: 8px; font-weight: 600; }
  .certifica { border: 1px solid #999; border-radius: 4px; padding: 10px; margin-bottom: 8px; }
  .section { border: 1px solid #999; border-radius: 4px; margin-bottom: 8px; overflow: hidden; }
  .section-title { background: #f2f2f2; padding: 6px 10px; font-weight: 700; border-bottom: 1px solid #ccc; }
  .grid-2, .grid-3 { display: grid; border-bottom: 1px solid #e5e5e5; }
  .grid-2 { grid-template-columns: 2fr 1fr; }
  .grid-3 { grid-template-columns: 2fr 1fr 1fr; }
  .cell { padding: 6px 10px; border-right: 1px solid #e5e5e5; }
  .cell:last-child { border-right: none; }
  .label { font-size: 10.5px; color: #555; }
  .value { font-weight: 600; }
  table.residuos { width: 100%; border-collapse: collapse; }
  table.residuos th, table.residuos td { border-bottom: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5; padding: 6px 10px; font-size: 11.5px; }
  table.residuos th:last-child, table.residuos td:last-child { border-right: none; }
  table.residuos tbody tr:last-child td { border-bottom: none; }
  table.residuos th { background: #fafafa; text-align: left; font-weight: 600; color: #555; font-size: 10.5px; }
  .c { text-align: center; }
  .muted { color: #888; }
  .box-content { padding: 10px; min-height: 40px; }
  .assinatura-wrap { text-align: center; margin-top: 40px; }
  .assinatura-line { display: inline-block; border-top: 1px solid #333; padding-top: 4px; min-width: 260px; }
  .assinatura-role { font-style: italic; color: #666; font-size: 10.5px; margin-top: 2px; }
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
      <div class="title">Certificado de Destinação Final</div>
      <div class="num">CDF nº ${esc(numeroCdf)}</div>
    </div>
  </div>

  <div class="periodo">
    <span>Período: <b>${esc(dataEmissao)}</b></span>
    <span>até <b>${esc(dataRecebimento)}</b></span>
  </div>

  <div class="certifica">${certificaTexto}</div>

  <div class="section">
    <div class="section-title">Identificação do Gerador</div>
    <div class="grid-2">
      <div class="cell"><div class="label">Razão Social:</div><div class="value">${esc(gerador?.nome_fantasia || gerador?.nome || "—")}</div></div>
      <div class="cell"><div class="label">CPF/CNPJ:</div><div class="value">${esc(fmtDoc(gerador)) || "—"}</div></div>
    </div>
    <div class="grid-3">
      <div class="cell"><div class="label">Endereço:</div><div class="value">${esc(fmtEndereco(gerador) || "—")}</div></div>
      <div class="cell"><div class="label">Município:</div><div class="value">${esc(gerador?.cidade || "—")}</div></div>
      <div class="cell"><div class="label">UF:</div><div class="value">${esc(gerador?.estado || "—")}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Identificação dos Resíduos</div>
    <table class="residuos">
      <thead>
        <tr>
          <th style="width:40px" class="c">#</th>
          <th>Resíduo</th>
          <th style="width:90px" class="c">Classe</th>
          <th style="width:100px" class="c">Quantidade</th>
          <th style="width:80px" class="c">Unidade</th>
          <th style="width:160px">Tecnologia</th>
        </tr>
      </thead>
      <tbody>${rowsResiduos}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Declaração</div>
    <div class="box-content">${esc(declaracao || "—")}</div>
  </div>

  <div class="assinatura-wrap">
    <div class="assinatura-line">
      <div><b>${esc(destino?.resp_nome || destino?.nome || "—")}</b></div>
      <div class="assinatura-role">Responsável Técnico</div>
    </div>
  </div>

  ${mtrNumero ? `
  <div class="section" style="margin-top:16px">
    <div class="section-title">MTRs incluídos</div>
    <div class="box-content">${esc(mtrNumero)}</div>
  </div>` : ""}
</body>
</html>`;
}

function writeAndPrint(win: Window, html: string) {
  win.document.open();
  win.document.write(html);
  win.document.close();
  const triggerPrint = () => { try { win.focus(); win.print(); } catch {} };
  const imgs = Array.from(win.document.images) as HTMLImageElement[];
  Promise.all(
    imgs.map((img) => img.complete ? Promise.resolve() : new Promise<void>((res) => {
      img.addEventListener("load", () => res());
      img.addEventListener("error", () => res());
    }))
  ).then(() => setTimeout(triggerPrint, 200));
}
