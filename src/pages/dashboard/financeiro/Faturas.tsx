import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Download, Filter, Building2, CreditCard, Search, Printer } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/components/DataPagination";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import myboxLogo from "@/assets/mybox-logo.png";

type FaturaRow = {
  id: string;
  locador: string;
  status: string;
  vencimento: string;
  paga_em: string | null;
  valor: number;
  itens: number;
  tipo: "faturado" | "a_vista";
  forma?: string;
  pedido_fornecedor_id: string | null;
};

type OrdemDetalhe = {
  id: string;
  descricao: string;
  obra: string;
  quantidade: number;
  preco_unitario: number;
  valor_total: number;
};

const formatDate = (d?: string | null) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("pt-BR");
};

const formaLabel = (f?: string | null) => {
  if (!f) return "";
  if (f === "pix") return "PIX";
  if (f === "cartao_credito") return "Crédito";
  if (f === "cartao_debito") return "Débito";
  if (f === "boleto") return "Boleto";
  if (f === "dinheiro") return "Dinheiro";
  return f;
};

const Faturas = () => {
  const [search, setSearch] = useState("");
  const [faturas, setFaturas] = useState<FaturaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("faturas")
        .select("id, locador_id, valor_total, status, forma_pagamento, vencimento, paga_em, pedido_fornecedor_id")
        .order("created_at", { ascending: false });
      if (error || !data) {
        setFaturas([]);
        setLoading(false);
        return;
      }

      const locadorIds = Array.from(new Set(data.map((f) => f.locador_id).filter(Boolean))) as string[];
      const pfIds = Array.from(new Set(data.map((f) => f.pedido_fornecedor_id).filter(Boolean))) as string[];

      const [{ data: profs }, { data: pfs }] = await Promise.all([
        locadorIds.length
          ? supabase.from("profiles").select("id, nome, nome_fantasia").in("id", locadorIds)
          : Promise.resolve({ data: [] as any[] }),
        pfIds.length
          ? supabase.from("pedido_fornecedores").select("id, quantidade").in("id", pfIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const profMap = new Map((profs ?? []).map((p: any) => [p.id, p.nome_fantasia || p.nome || "—"]));
      const pfMap = new Map((pfs ?? []).map((p: any) => [p.id, Number(p.quantidade) || 0]));

      const rows: FaturaRow[] = data.map((f: any) => {
        const forma = f.forma_pagamento as string | null;
        const tipo: "faturado" | "a_vista" =
          forma === "pix" || forma === "cartao_credito" || forma === "cartao_debito" ? "a_vista" : "faturado";
        return {
          id: f.id,
          locador: (f.locador_id && profMap.get(f.locador_id)) || "—",
          status: f.status,
          vencimento: formatDate(f.vencimento),
          paga_em: f.paga_em,
          valor: Number(f.valor_total) || 0,
          itens: pfMap.get(f.pedido_fornecedor_id) ?? 1,
          tipo,
          forma: formaLabel(forma),
          pedido_fornecedor_id: f.pedido_fornecedor_id ?? null,
        };
      });

      setFaturas(rows);
      setLoading(false);
    };
    load();
  }, []);
  
  const filteredData = useMemo(() => {
    return faturas.filter(f => 
      f.locador.toLowerCase().includes(search.toLowerCase()) ||
      f.status.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, faturas]);

  const { paginatedData, currentPage, pageSize, setCurrentPage, setPageSize, totalItems } = usePagination(filteredData, 10);

  const kpis = useMemo(() => {
    const abertas = faturas.filter((f) => f.status === "pendente");
    const totalAbertas = abertas.reduce((s, f) => s + f.valor, 0);
    const hoje = new Date();
    const em30 = new Date();
    em30.setDate(em30.getDate() + 30);
    const aVencer = faturas.filter((f) => {
      if (f.status !== "pendente" || f.vencimento === "-") return false;
      const [d, m, y] = f.vencimento.split("/").map(Number);
      const dt = new Date(y, m - 1, d);
      return dt >= hoje && dt <= em30;
    });
    const totalAVencer = aVencer.reduce((s, f) => s + f.valor, 0);
    const proxVenc = aVencer
      .map((f) => f.vencimento)
      .sort((a, b) => {
        const [da, ma, ya] = a.split("/").map(Number);
        const [db, mb, yb] = b.split("/").map(Number);
        return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
      })[0];

    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const pagoMes = faturas
      .filter((f) => {
        if (f.status !== "paga" || !f.paga_em) return false;
        const dt = new Date(f.paga_em);
        return dt.getMonth() === mesAtual && dt.getFullYear() === anoAtual;
      })
      .reduce((s, f) => s + f.valor, 0);

    const locadoresAcordo = new Set(
      faturas.filter((f) => f.tipo === "faturado" && f.locador !== "—").map((f) => f.locador),
    ).size;

    return { totalAbertas, qtdAbertas: abertas.length, totalAVencer, proxVenc, pagoMes, locadoresAcordo };
  }, [faturas]);

  const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const [detalheFatura, setDetalheFatura] = useState<FaturaRow | null>(null);
  const [detalheOrdens, setDetalheOrdens] = useState<OrdemDetalhe[]>([]);
  const [detalheLoading, setDetalheLoading] = useState(false);

  const fetchOrdens = async (pfId: string): Promise<OrdemDetalhe[]> => {
    const { data } = await supabase
      .from("ordens_locacao")
      .select(
        "id, equipment_type, quantidade, preco_unitario, valor_total, cacamba_id, equipamento_id, obra:obra_id(nome, rua, numero, bairro, cidade, estado)",
      )
      .eq("pedido_fornecedor_id", pfId);
    const ordens = (data ?? []) as any[];
    const cacIds = ordens.filter((o) => o.cacamba_id).map((o) => o.cacamba_id);
    const eqpIds = ordens.filter((o) => o.equipamento_id).map((o) => o.equipamento_id);
    const [{ data: cacs }, { data: eqps }] = await Promise.all([
      cacIds.length
        ? supabase.from("cacambas").select("id, modelo").in("id", cacIds)
        : Promise.resolve({ data: [] as any[] }),
      eqpIds.length
        ? supabase.from("equipamentos").select("id, nome").in("id", eqpIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const modeloIds = Array.from(
      new Set((cacs ?? []).map((c: any) => c.modelo).filter((m: any) => typeof m === "string" && /^[0-9a-f-]{36}$/i.test(m))),
    );
    const { data: modelos } = modeloIds.length
      ? await supabase.from("modelos_cacamba").select("id, modelo, capacidade").in("id", modeloIds as string[])
      : { data: [] as any[] };
    const modeloMap = new Map((modelos ?? []).map((m: any) => [m.id, m]));
    const cacMap = new Map((cacs ?? []).map((c: any) => [c.id, c]));
    const eqpMap = new Map((eqps ?? []).map((e: any) => [e.id, e]));
    return ordens.map((o) => {
      let descricao = "—";
      if (o.equipment_type === "cacamba" && o.cacamba_id) {
        const c: any = cacMap.get(o.cacamba_id);
        const m: any = c ? modeloMap.get(c?.modelo) : null;
        const partes = ["Caçamba"];
        if (m?.modelo) partes.push(m.modelo);
        else if (c?.modelo && !m) partes.push(c.modelo);
        if (m?.capacidade) {
          const cap = String(m.capacidade).trim();
          partes.push(/m³/i.test(cap) ? cap : `${cap}m³`);
        }
        descricao = partes.join(" ");
      } else if (o.equipamento_id) {
        const e: any = eqpMap.get(o.equipamento_id);
        descricao = e?.nome ?? "Equipamento";
      }
      const ob = o.obra;
      const obra = ob
        ? [
            ob.nome,
            [ob.rua, ob.numero].filter(Boolean).join(", "),
            ob.bairro,
            [ob.cidade, ob.estado].filter(Boolean).join("/"),
          ]
            .filter(Boolean)
            .join(" - ")
        : "—";
      return {
        id: o.id,
        descricao,
        obra,
        quantidade: Number(o.quantidade) || 0,
        preco_unitario: Number(o.preco_unitario) || 0,
        valor_total: Number(o.valor_total) || 0,
      };
    });
  };

  const openDetalhes = async (f: FaturaRow) => {
    setDetalheFatura(f);
    setDetalheOrdens([]);
    if (!f.pedido_fornecedor_id) return;
    setDetalheLoading(true);
    try {
      setDetalheOrdens(await fetchOrdens(f.pedido_fornecedor_id));
    } finally {
      setDetalheLoading(false);
    }
  };

  const printFatura = async (f: FaturaRow) => {
    const ordens = f.pedido_fornecedor_id ? await fetchOrdens(f.pedido_fornecedor_id) : [];
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    const logoUrl = new URL(myboxLogo, window.location.origin).href;
    const nowStr = new Date().toLocaleString("pt-BR");
    const rowsHtml = ordens
      .map(
        (o) => `
          <tr>
            <td>${o.descricao}</td>
            <td>${o.obra}</td>
            <td style="text-align:right">${o.quantidade}</td>
            <td style="text-align:right">${brl(o.preco_unitario)}</td>
            <td style="text-align:right">${brl(o.valor_total)}</td>
          </tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Fatura ${f.id.slice(0, 8)}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#111}
        .brand{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #16a34a;padding-bottom:12px;margin-bottom:16px}
        .brand-left{display:flex;align-items:center;gap:12px}
        .brand-left img{height:44px;width:auto}
        .brand-name{font-size:20px;font-weight:700;color:#16a34a;letter-spacing:.5px}
        .brand-right{font-size:11px;color:#555;text-align:right}
        h1{margin:0 0 4px;font-size:18px}
        .meta{color:#555;font-size:12px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ddd;padding:8px;text-align:left}
        th{background:#f4f4f5}
        tfoot td{font-weight:bold;background:#fafafa}
      </style></head><body>
      <div class="brand">
        <div class="brand-left">
          <img src="${logoUrl}" alt="MyBox" />
          <span class="brand-name">MyBox Brasil</span>
        </div>
        <div class="brand-right">
          <div><strong>Impresso em</strong></div>
          <div>${nowStr}</div>
        </div>
      </div>
      <h1>Fatura #${f.id.slice(0, 8).toUpperCase()}</h1>
      <div class="meta">
        <div><strong>Locador:</strong> ${f.locador}</div>
        <div><strong>Vencimento:</strong> ${f.vencimento} &nbsp; | &nbsp; <strong>Status:</strong> ${f.status.toUpperCase()}</div>
        <div><strong>Forma:</strong> ${f.forma || "—"}</div>
      </div>
      <table>
        <thead><tr><th>Descrição</th><th>Obra</th><th style="text-align:right">Qtd</th><th style="text-align:right">Preço</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${rowsHtml || `<tr><td colspan="5" style="text-align:center;color:#888">Sem itens</td></tr>`}</tbody>
        <tfoot><tr><td colspan="4" style="text-align:right">Valor Total</td><td style="text-align:right">${brl(f.valor)}</td></tr></tfoot>
      </table>
      <script>window.onload=()=>{setTimeout(()=>window.print(),300);}</script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Gestão de Faturas" subtitle="Faturas de locadores com contrato de faturamento" />

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Abertas</p>
            {loading ? (
              <>
                <Skeleton className="h-7 w-32 mt-1" />
                <Skeleton className="h-3 w-24 mt-2" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold mt-1">{brl(kpis.totalAbertas)}</p>
                <p className="text-[10px] text-amber-600 mt-1 font-medium">
                  {kpis.qtdAbertas} {kpis.qtdAbertas === 1 ? "fatura pendente" : "faturas pendentes"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">A Vencer</p>
            {loading ? (
              <>
                <Skeleton className="h-7 w-32 mt-1" />
                <Skeleton className="h-3 w-24 mt-2" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold mt-1 text-foreground">{brl(kpis.totalAVencer)}</p>
                <p className="text-[10px] text-primary mt-1 font-medium">
                  {kpis.proxVenc ? `Próximo venc: ${kpis.proxVenc.slice(0, 5)}` : "Sem vencimentos"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Pago (Mês)</p>
            {loading ? (
              <Skeleton className="h-7 w-32 mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1 text-emerald-600">{brl(kpis.pagoMes)}</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-muted/50">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Locatários com Acordo</p>
            {loading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1">{String(kpis.locadoresAcordo).padStart(2, "0")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <DataTable
      loading={loading}
        title="Histórico de Faturas"
        data={paginatedData}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por locador ou status..."
        columns={[
          {
            header: "Locador",
            accessor: (f) => (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="font-medium text-xs">{f.locador}</span>
              </div>
            ),
          },
          {
            header: "Status",
            accessor: (f) => (
              <div className="flex flex-col gap-1">
                <Badge 
                  variant="outline" 
                  className={`font-semibold text-[10px] w-fit ${
                    f.status === 'pendente' ? 'bg-amber-500/10 text-amber-600 border-0' :
                    f.status === 'vencida' ? 'bg-red-500/10 text-red-600 border-0' :
                    f.status === 'cancelada' ? 'bg-muted text-muted-foreground border-0' :
                    f.status === 'paga' ? 'bg-emerald-500/10 text-emerald-600 border-0' :
                    'bg-blue-500/10 text-blue-600 border-0'
                  }`}
                >
                  {f.status.toUpperCase()}
                </Badge>
                {f.tipo === "a_vista" && (
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    À Vista ({f.forma})
                  </span>
                )}
                {f.tipo === "faturado" && (
                  <span className="text-[10px] font-medium text-muted-foreground italic">
                    Faturamento
                  </span>
                )}
              </div>
            ),
          },
          {
            header: "Vencimento",
            accessor: (f) => <span className="text-xs text-muted-foreground">{f.vencimento}</span>,
          },
          {
            header: "Itens",
            accessor: (f) => <span className="text-xs text-muted-foreground">{f.itens} locações</span>,
          },
          {
            header: "Valor Total",
            accessor: (f) => <span className="text-xs font-bold">R$ {f.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>,
          },
        ]}
        actions={(f) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver Detalhes" onClick={() => openDetalhes(f)}>
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Imprimir" onClick={() => printFatura(f)}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        )}
        pagination={{
          totalItems,
          pageSize,
          currentPage,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <Dialog open={!!detalheFatura} onOpenChange={(o) => !o && setDetalheFatura(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Fatura</DialogTitle>
            <DialogDescription>
              {detalheFatura ? `Locador: ${detalheFatura.locador} • Vencimento: ${detalheFatura.vencimento}` : ""}
            </DialogDescription>
          </DialogHeader>
          {detalheLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalheOrdens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground text-sm">
                        Sem itens.
                      </TableCell>
                    </TableRow>
                  ) : (
                    detalheOrdens.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="text-xs">{o.descricao}</TableCell>
                        <TableCell className="text-xs">{o.obra}</TableCell>
                        <TableCell className="text-xs text-right">{o.quantidade}</TableCell>
                        <TableCell className="text-xs text-right">{brl(o.preco_unitario)}</TableCell>
                        <TableCell className="text-xs text-right font-semibold">{brl(o.valor_total)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {detalheFatura && (
                <div className="flex justify-end mt-4 pt-4 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground mr-2">Valor Total:</span>
                    <span className="font-bold">{brl(detalheFatura.valor)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Faturas;