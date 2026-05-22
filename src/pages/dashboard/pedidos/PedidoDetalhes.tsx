import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { mockPedidos } from "./PedidosList";

const mockCacambasDisponiveis = [
  "U7U4SDNVPE9OGFE1",
  "U4ECBITUO52ASP72",
  "PBUGKV6R1RMQ2ILK",
  "GEVR3GCP4423DHPG",
  "XBVCFJ2IOPGAKKS9",
  "MU3UJ2YY3RTG1JKG",
];

const PedidoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pedido = mockPedidos.find((p) => String(p.id) === id);

  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmadas, setConfirmadas] = useState<string[]>([]);

  const filtered = useMemo(
    () => mockCacambasDisponiveis.filter((c) => c.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  if (!pedido) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/dashboard/pedidos")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <p>Pedido não encontrado.</p>
      </div>
    );
  }

  const isAguardando = pedido.status === "aguardando";
  const qtdNecessaria = pedido.quantidade;

  const toggle = (codigo: string) => {
    setSelected((prev) =>
      prev.includes(codigo)
        ? prev.filter((c) => c !== codigo)
        : prev.length < qtdNecessaria
        ? [...prev, codigo]
        : prev
    );
  };

  const handleConfirmar = () => {
    setConfirmadas(selected);
    setModalOpen(false);
    toast({
      title: "Caçambas selecionadas",
      description: `${selected.length} caçamba(s) atribuída(s) ao pedido.`,
    });
  };

  const cacambasExibir = confirmadas.length > 0 ? confirmadas : (pedido.cacamba !== "—" ? [pedido.cacamba] : []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Pedido nº {pedido.id}</h1>
          <p className="text-sm text-white/75">Detalhes da ordem de locação</p>
        </div>
        <Button
          className="bg-white/20 hover:bg-white/30 text-white border-0"
          onClick={() => navigate("/dashboard/pedidos")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-[200px,1fr] gap-6">
            <div className="flex items-start justify-center">
              <div className="h-40 w-40 rounded-lg bg-yellow-100 flex items-center justify-center text-6xl">🟨</div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Modelo {pedido.modelo}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Estoque</p>
                  <p className="text-muted-foreground">{mockCacambasDisponiveis.length} disponíveis</p>
                  <p className="font-semibold mt-3">Quantidade pedida</p>
                  <p className="text-muted-foreground">{pedido.quantidade} pedidas</p>
                  <p className="font-semibold mt-3">Tipo de locação</p>
                  <Badge className="bg-primary/80 text-white mt-1">Locação Externa | até 8 dias</Badge>
                  <p className="font-semibold mt-3">Classes de resíduo</p>
                  <Badge className="bg-secondary text-secondary-foreground mt-1">Classe A1</Badge>
                  <p className="font-semibold mt-3">Endereço de entrega</p>
                  <p className="text-primary">{pedido.endereco}</p>
                  <p className="font-semibold mt-3">Valor do pedido</p>
                  <p>R$ {pedido.valorTotal}</p>
                  <p className="font-semibold mt-3">Caçambas</p>
                  {isAguardando ? (
                    <div className="mt-1 space-y-2">
                      {cacambasExibir.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {cacambasExibir.map((c) => (
                            <Badge key={c} variant="outline" className="text-primary border-primary/40 font-mono text-[10px]">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Nenhuma caçamba selecionada</p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-primary border-primary/40 hover:bg-primary/10"
                        onClick={() => {
                          setSelected(confirmadas);
                          setModalOpen(true);
                        }}
                      >
                        Selecionar caçambas
                      </Button>
                    </div>
                  ) : (
                    <p className="text-primary text-xs">
                      {pedido.cacamba} - {pedido.situacaoCacamba}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-semibold">Detalhes</p>
                  <p className="text-muted-foreground">Tipo de tampa: Tampa Corrediça</p>
                  <p className="text-muted-foreground">Cor: Preto</p>
                  <p className="text-muted-foreground">Material: Metal</p>
                </div>
                <div>
                  <p className="font-semibold">Dimensões</p>
                  <p className="text-muted-foreground">Comprimento: 2,60 m</p>
                  <p className="text-muted-foreground">Largura: 1,80 m</p>
                  <p className="text-muted-foreground">Altura: 1,19 m</p>
                </div>
              </div>

              {isAguardando && (
                <div className="flex justify-end pt-4">
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    disabled={confirmadas.length < qtdNecessaria}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Aceitar pedido
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60">
            <DialogTitle className="text-base font-semibold">Selecionar caçambas</DialogTitle>
          </DialogHeader>

          <div className="px-6 pt-4 pb-2 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar caçamba"
                className="pl-9 h-10 rounded-lg border-primary/40 focus-visible:ring-primary/30"
              />
            </div>

            <p className="text-[11px] text-muted-foreground">
              Selecione até {qtdNecessaria} caçamba(s) • {selected.length}/{qtdNecessaria} selecionada(s)
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2 -mx-1 px-1">
              {filtered.map((codigo) => {
                const checked = selected.includes(codigo);
                const disabled = !checked && selected.length >= qtdNecessaria;
                return (
                  <label
                    key={codigo}
                    className={`flex items-center gap-3 rounded-lg border px-3 h-11 cursor-pointer transition-all ${
                      checked
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/70 hover:border-primary/50 hover:bg-muted/40"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={() => toggle(codigo)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="font-mono text-[13px] font-bold text-primary tracking-wide">{codigo}</span>
                  </label>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">Nenhuma caçamba encontrada</p>
              )}
            </div>
          </div>

          <div className="px-6 pb-5 pt-3">
            <Button
              className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 font-semibold shadow-md disabled:opacity-60"
              disabled={selected.length === 0}
              onClick={handleConfirmar}
            >
              Selecionar caçambas
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PedidoDetalhes;
