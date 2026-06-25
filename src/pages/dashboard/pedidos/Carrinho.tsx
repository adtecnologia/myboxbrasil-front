import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { notifyCartChanged } from "@/lib/cart-events";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  obra?: string;
  obraName?: string;
  equipmentType: "cacamba" | "outros";
  locador?: string;
}
import { 
  Trash2, 
  ShoppingCart, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  ArrowRight,
  Package,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  CreditCard,
  Truck,
  AlertCircle,
  FileText,
  TrendingUp,
  QrCode,
  CreditCard as CreditCardIcon,
  Copy,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LOCADORES_INFO: Record<string, { faturamento: boolean; prazos: number[] }> = {};
const FATURAS_EM_ABERTO: Record<string, { valorAtual: number; dataFechamento: string }> = {};

const Carrinho = () => {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.session?.user.id);
  const [items, setItems] = useState<CartItem[]>([]);
  const [carrinhoId, setCarrinhoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    if (!userId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data: cart } = await supabase
      .from("carrinhos")
      .select("id")
      .eq("locatario_id", userId)
      .eq("status", "aberto")
      .maybeSingle();
    if (!cart) { setCarrinhoId(null); setItems([]); setLoading(false); return; }
    setCarrinhoId(cart.id);
    const { data: rows, error: rowsErr } = await supabase
      .from("carrinho_itens")
      .select("id, equipment_type, cacamba_id, equipamento_id, locador_id, obra_id, quantidade, preco_unitario")
      .eq("carrinho_id", cart.id);
    if (rowsErr) {
      toast.error("Erro ao carregar itens: " + rowsErr.message);
      setItems([]); setLoading(false); return;
    }
    const list = rows ?? [];
    const locadorIds = Array.from(new Set(list.map((r: any) => r.locador_id).filter(Boolean)));
    const obraIds = Array.from(new Set(list.map((r: any) => r.obra_id).filter(Boolean)));
    const cacambaIds = Array.from(new Set(list.map((r: any) => r.cacamba_id).filter(Boolean)));
    const equipIds = Array.from(new Set(list.map((r: any) => r.equipamento_id).filter(Boolean)));

    const [profsRes, obrasRes, cacRes, equipRes] = await Promise.all([
      locadorIds.length ? supabase.from("profiles").select("id, nome").in("id", locadorIds) : Promise.resolve({ data: [] as any[] }),
      obraIds.length ? supabase.from("obras").select("id, nome").in("id", obraIds) : Promise.resolve({ data: [] as any[] }),
      cacambaIds.length ? supabase.from("cacambas").select("id, modelo").in("id", cacambaIds) : Promise.resolve({ data: [] as any[] }),
      equipIds.length ? supabase.from("equipamentos").select("id, nome").in("id", equipIds) : Promise.resolve({ data: [] as any[] }),
    ]);
    const nomes = Object.fromEntries(((profsRes as any).data ?? []).map((p: any) => [p.id, p.nome]));
    const obrasMap = Object.fromEntries(((obrasRes as any).data ?? []).map((o: any) => [o.id, o.nome]));
    const cacambasMap = Object.fromEntries(((cacRes as any).data ?? []).map((c: any) => [c.id, c.modelo]));
    const equipMap = Object.fromEntries(((equipRes as any).data ?? []).map((e: any) => [e.id, e.nome]));

    const modeloIds = Array.from(new Set(Object.values(cacambasMap).filter(Boolean) as string[]));
    let modelosMap: Record<string, string> = {};
    if (modeloIds.length) {
      const { data: ms } = await supabase.from("modelos_cacamba").select("id, modelo").in("id", modeloIds);
      modelosMap = Object.fromEntries((ms ?? []).map((m: any) => [m.id, m.modelo]));
    }

    setItems(list.map((r: any) => {
      const modeloId = r.cacamba_id ? cacambasMap[r.cacamba_id] : null;
      const modeloNome = modeloId ? (modelosMap[modeloId] ?? "") : "";
      return {
        id: r.id,
        name: r.equipment_type === "cacamba"
          ? `Caçamba ${modeloNome}`.trim()
          : (equipMap[r.equipamento_id] ?? "Equipamento"),
        price: Number(r.preco_unitario) || 0,
        quantity: r.quantidade,
        obra: r.obra_id ?? undefined,
        obraName: obrasMap[r.obra_id] ?? "—",
        equipmentType: r.equipment_type === "cacamba" ? "cacamba" : "outros",
        locador: nomes[r.locador_id] ?? "Geral",
      };
    }));
    setLoading(false);
  };

  useEffect(() => { loadCart(); }, [userId]);

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("carrinho_itens").delete().eq("id", id);
    if (error) { toast.error("Erro ao remover: " + error.message); return; }
    setItems(prev => prev.filter(i => i.id !== id));
    notifyCartChanged();
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const { error } = await supabase.from("carrinho_itens").update({ quantidade: quantity }).eq("id", id);
    if (error) { toast.error("Erro ao atualizar: " + error.message); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    notifyCartChanged();
  };

  const total = () => items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const clearCart = async () => {
    if (carrinhoId) {
      await supabase.from("carrinhos").update({ status: "confirmado", confirmado_at: new Date().toISOString() }).eq("id", carrinhoId);
    }
    setItems([]);
    setCarrinhoId(null);
    notifyCartChanged();
  };
  const [vendorPaymentMethods, setVendorPaymentMethods] = useState<Record<string, string>>({});
  const [prazosSelecionados, setPrazosSelecionados] = useState<Record<string, string>>({});
  
  // Payment Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"selection" | "pix" | "credit-card">("selection");
  const [pixTimer, setPixTimer] = useState(900); // 15 minutes
  const [cardData, setCardData] = useState({ holder: "", number: "", expiry: "", cvc: "" });

  useEffect(() => {
    let interval: any;
    if (paymentStep === "pix" && pixTimer > 0) {
      interval = setInterval(() => setPixTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [paymentStep, pixTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const itemsWithPrazo = items.filter(item => LOCADORES_INFO[item.locador || "Geral"]?.faturamento);
  const itemsWithoutPrazo = items.filter(item => !LOCADORES_INFO[item.locador || "Geral"]?.faturamento);
  const vendorsWithPrazo = Array.from(new Set(itemsWithPrazo.map(i => i.locador || "Geral")));

  const needsAvistaPayment = itemsWithoutPrazo.length > 0 || vendorsWithPrazo.some(v => vendorPaymentMethods[v] === "avista");

  const isCheckoutDisabled = () => {
    // Check individual choices for vendors with agreement
    for (const vendor of vendorsWithPrazo) {
      const choice = vendorPaymentMethods[vendor];
      if (!choice) return true;
      if (choice === "faturado" && !FATURAS_EM_ABERTO[vendor] && !prazosSelecionados[vendor]) return true;
    }
    return false;
  };

  const handleVendorPaymentChoice = (vendor: string, choice: string) => {
    setVendorPaymentMethods(prev => ({ ...prev, [vendor]: choice }));
    if (choice === "avista") {
      setPrazosSelecionados(prev => {
        const newState = { ...prev };
        delete newState[vendor];
        return newState;
      });
    }
  };

  const handleCheckout = () => {
    if (isCheckoutDisabled()) {
      toast.error("Por favor, selecione as formas de pagamento.");
      return;
    }

    if (needsAvistaPayment) {
      setIsPaymentModalOpen(true);
      setPaymentStep("selection");
    } else {
      finalizeOrder();
    }
  };

  const finalizeOrder = async () => {
    if (!carrinhoId) { toast.error("Carrinho não encontrado."); return; }
    const { error } = await supabase.rpc("confirmar_carrinho", { _carrinho_id: carrinhoId });
    if (error) { toast.error("Erro ao confirmar: " + error.message); return; }
    toast.success("Pedido enviado com sucesso!");
    setItems([]);
    setCarrinhoId(null);
    notifyCartChanged();
    navigate("/dashboard/pedidos");
  };

  const maskCardNumber = (val: string) => {
    return val.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().substring(0, 19);
  };

  const maskExpiry = (val: string) => {
    return val.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").substring(0, 5);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
        <div className="h-32 w-32 bg-muted rounded-full flex items-center justify-center relative">
            <ShoppingCart className="h-16 w-16 text-muted-foreground opacity-20" />
            <div className="absolute inset-0 border-4 border-dashed border-muted-foreground/10 rounded-full animate-spin-slow" />
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tight">Carrinho Vazio</h2>
            <p className="text-muted-foreground font-medium max-w-xs mx-auto">Você ainda não adicionou nenhum equipamento ao seu pedido.</p>
        </div>
        <Link to="/dashboard/pedidos/solicitar">
          <Button className="h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
            Começar a Locação <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    );
  }

  const renderItemCard = (item: CartItem) => (
    <Card key={item.id} className="border-2 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-48 bg-muted flex items-center justify-center p-8 relative">
            {item.equipmentType === "cacamba" ? (
              <Trash2 className="h-16 w-16 text-primary opacity-20" />
            ) : (
              <Package className="h-16 w-16 text-primary opacity-20" />
            )}
            <div className="absolute bottom-4 inset-x-0 flex justify-center">
                <span className="bg-white/80 backdrop-blur-sm text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-border">{item.equipmentType}</span>
            </div>
          </div>
          <div className="flex-1 p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{item.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                     <Building2 className="h-3.5 w-3.5" /> {item.obraName}
                   </div>
                   <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
                     <Truck className="h-3.5 w-3.5" /> {item.locador}
                   </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-2xl w-fit">
                <Button 
                  variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white shadow-sm"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-black w-6 text-center">{item.quantity}</span>
                <Button 
                  variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white shadow-sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Subtotal Item</p>
                <p className="text-2xl font-black text-primary">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const itemsCombinedForAvista = [
    ...itemsWithoutPrazo,
    ...itemsWithPrazo.filter(i => vendorPaymentMethods[i.locador || "Geral"] === "avista")
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-3">
            <ShoppingCart className="h-10 w-10 text-primary" /> Meu Carrinho
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Revise os itens e finalize sua locação.</p>
        </div>
        <Button variant="ghost" className="h-12 rounded-xl text-muted-foreground font-bold hover:text-primary" onClick={() => navigate("/dashboard/pedidos/solicitar")}>
          <Plus className="mr-2 h-5 w-5" /> Adicionar mais itens
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          
          {/* Group: Items to be paid AVISTA */}
          {itemsCombinedForAvista.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Itens com Pagamento à Vista</h2>
                </div>
              </div>
              <div className="space-y-4">
                {itemsCombinedForAvista.map(renderItemCard)}
              </div>
            </div>
          )}

          {/* Group: Vendors WITH agreement that can choose FATURADO */}
          {vendorsWithPrazo.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">Acordos de Faturamento Disponíveis</h2>
              </div>
              
              {vendorsWithPrazo.map(vendor => {
                const isAvista = vendorPaymentMethods[vendor] === "avista";
                const vendorItems = itemsWithPrazo.filter(i => i.locador === vendor);
                
                return (
                  <div key={vendor} className="space-y-4 pl-4 border-l-4 border-emerald-100">
                    <div className="flex items-center gap-2 px-2">
                      <Truck className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-lg font-bold uppercase tracking-tight text-emerald-900">Locador: {vendor}</h3>
                    </div>

                    {!isAvista && (
                      <div className="space-y-4">
                        {vendorItems.map(renderItemCard)}
                      </div>
                    )}

                    <div className="bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-[1.5rem] p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCardIcon className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-black uppercase tracking-tight text-emerald-900">Opção de Pagamento - {vendor}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select 
                          value={vendorPaymentMethods[vendor] || ""} 
                          onValueChange={(val) => handleVendorPaymentChoice(vendor, val)}
                        >
                          <SelectTrigger className="h-12 rounded-xl bg-white border-2 border-emerald-200">
                            <SelectValue placeholder="Escolha faturado ou à vista..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="faturado">Faturado (Usar Acordo a Prazo)</SelectItem>
                            <SelectItem value="avista">Pagar à Vista (Definir na finalização)</SelectItem>
                          </SelectContent>
                        </Select>

                        {vendorPaymentMethods[vendor] === "faturado" && (
                          <div className="space-y-4 animate-in slide-in-from-left duration-300">
                            {!FATURAS_EM_ABERTO[vendor] ? (
                              <Select 
                                value={prazosSelecionados[vendor] || ""} 
                                onValueChange={(val) => setPrazosSelecionados(prev => ({ ...prev, [vendor]: val }))}
                              >
                                <SelectTrigger className="h-12 rounded-xl bg-white border-2 border-emerald-200">
                                  <SelectValue placeholder="Selecione o prazo acordado..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {LOCADORES_INFO[vendor]?.prazos.map(prazo => (
                                    <SelectItem key={prazo} value={prazo.toString()}>{prazo} dias</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="bg-white/80 border border-emerald-100 rounded-xl p-4 space-y-3 shadow-sm">
                                <div className="flex items-center gap-2 text-emerald-700">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-xs font-black uppercase tracking-tight">Fatura em Aberto Detectada</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                  Este pedido será agrupado à fatura que vence em <span className="font-bold text-foreground">{FATURAS_EM_ABERTO[vendor].dataFechamento}</span>.
                                </p>
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                  <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Valor Atual</p>
                                    <p className="text-sm font-bold text-muted-foreground">R$ {FATURAS_EM_ABERTO[vendor].valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                  </div>
                                  <div className="space-y-0.5 border-l pl-3">
                                    <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-1">
                                      Novo Total <TrendingUp className="h-2 w-2" />
                                    </p>
                                    <p className="text-sm font-black text-emerald-700">
                                      R$ {(FATURAS_EM_ABERTO[vendor].valorAtual + vendorItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {isAvista && (
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                          <ArrowRight className="h-3 w-3" /> Itens deste locador movidos para o Pagamento à Vista.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-2 rounded-[2.5rem] p-8 shadow-xl border-primary bg-card sticky top-24">
            <div className="space-y-6">
              <h4 className="text-xl font-black uppercase tracking-tight border-b pb-4">Resumo do Pedido</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-muted-foreground font-medium">
                  <span>Itens ({items.length})</span>
                  <span>R$ {total().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 font-bold text-sm">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Taxas inclusas</span>
                  <span>R$ 0,00</span>
                </div>
                
                <Separator />
                
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Geral</span>
                  <span className="text-4xl font-black text-primary leading-tight whitespace-nowrap">
                    R$ {total().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/30 hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  onClick={handleCheckout}
                  disabled={isCheckoutDisabled()}
                >
                  Confirmar Locação <CheckCircle2 className="ml-2 h-6 w-6" />
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Clock className="h-3 w-3" /> Processamento em até 15 min
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8 border-2">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-center">Finalizar Pagamento</DialogTitle>
            <DialogDescription className="text-center font-medium">
              {paymentStep === "selection" && "Selecione como deseja pagar os itens à vista."}
              {paymentStep === "pix" && "Escaneie o QR Code abaixo para pagar via PIX."}
              {paymentStep === "credit-card" && "Informe os dados do seu cartão de crédito."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {paymentStep === "selection" && (
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 group flex flex-col items-center justify-center gap-2 transition-all"
                  onClick={() => setPaymentStep("pix")}
                >
                  <QrCode className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-black uppercase tracking-widest text-xs">Pagar com PIX</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 group flex flex-col items-center justify-center gap-2 transition-all"
                  onClick={() => setPaymentStep("credit-card")}
                >
                  <CreditCardIcon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-black uppercase tracking-widest text-xs">Cartão de Crédito</span>
                </Button>
              </div>
            )}

            {paymentStep === "pix" && (
              <div className="space-y-8 animate-in zoom-in-95 duration-300">
                <div className="bg-muted rounded-3xl p-8 aspect-square flex items-center justify-center border-2 border-dashed border-primary/20 relative overflow-hidden group">
                  <QrCode className="h-48 w-48 text-primary/80" />
                  <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                    <Button variant="outline" className="rounded-xl font-bold bg-white" onClick={() => toast.success("Código PIX copiado!")}>
                      <Copy className="h-4 w-4 mr-2" /> Copiar Código
                    </Button>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-primary font-black text-xl">
                    <Clock className="h-5 w-5 animate-pulse" /> {formatTime(pixTimer)}
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aguardando pagamento...</p>
                </div>
                <Button className="w-full h-14 rounded-2xl font-black uppercase text-sm shadow-lg" onClick={finalizeOrder}>
                  Já realizei o pagamento
                </Button>
              </div>
            )}

            {paymentStep === "credit-card" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Titular do Cartão</Label>
                    <Input 
                      className="h-12 rounded-xl border-2" 
                      placeholder="NOME COMPLETO" 
                      value={cardData.holder}
                      onChange={e => setCardData(prev => ({ ...prev, holder: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Número do Cartão</Label>
                    <Input 
                      className="h-12 rounded-xl border-2" 
                      placeholder="0000 0000 0000 0000" 
                      value={cardData.number}
                      onChange={e => setCardData(prev => ({ ...prev, number: maskCardNumber(e.target.value) }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Vencimento</Label>
                      <Input 
                        className="h-12 rounded-xl border-2" 
                        placeholder="MM/AA" 
                        value={cardData.expiry}
                        onChange={e => setCardData(prev => ({ ...prev, expiry: maskExpiry(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">CVC</Label>
                      <Input 
                        className="h-12 rounded-xl border-2" 
                        placeholder="123" 
                        maxLength={3}
                        value={cardData.cvc}
                        onChange={e => setCardData(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, "") }))}
                      />
                    </div>
                  </div>
                </div>
                <Button className="w-full h-14 rounded-2xl font-black uppercase text-sm shadow-lg shadow-primary/20" onClick={finalizeOrder}>
                  Finalizar Pagamento <CheckCircle className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
          
          {paymentStep !== "selection" && (
            <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground uppercase" onClick={() => setPaymentStep("selection")}>
              Alterar forma de pagamento
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Carrinho;