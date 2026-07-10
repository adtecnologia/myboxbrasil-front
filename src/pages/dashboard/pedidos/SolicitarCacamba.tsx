import { useEffect, useState } from "react";
import { 
  Building2, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  MapPin, 
  ShoppingCart,
  CheckCircle2,
  HardHat,
  Package,
  ArrowRight,
  Info,
  Star,
  Globe,
  Home,
  Search,
  Minus,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ObraForm } from "@/components/dashboard/obras/ObraForm";
import { Progress } from "@/components/ui/progress";
import imgCacamba from "@/assets/equipamento-cacamba.jpg";
import imgMaquinas from "@/assets/equipamento-maquinas.jpg";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { notifyCartChanged } from "@/lib/cart-events";


const SolicitarCacamba = () => {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.session?.user.id);
  const [step, setStep] = useState(1);
  const [selectedObra, setSelectedObra] = useState("");
  const [equipmentType, setEquipmentType] = useState<"cacamba" | "outros" | null>(null);
  const [locacaoType, setLocacaoType] = useState<"interna" | "externa" | "">("");
  const [selectedModelo, setSelectedModelo] = useState("");
  const [selectedResiduos, setSelectedResiduos] = useState<string[]>([]);
  const [selectedLocador, setSelectedLocador] = useState("");
  const [locadorSearch, setLocadorSearch] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const [isNewObraOpen, setIsNewObraOpen] = useState(false);
  
  const [obras, setObras] = useState<{ id: string; nome: string; endereco: string }[]>([]);
  const [modelosCacamba, setModelosCacamba] = useState<{ id: string; label: string; modelo: string; description: string; preco: number; popular: boolean }[]>([]);
  const [disponiveisPorModelo, setDisponiveisPorModelo] = useState<Record<string, number>>({});
  const [residuos, setResiduos] = useState<{ id: string; label: string; icon: string }[]>([]);
  const [locadores, setLocadores] = useState<{ id: string; nome: string; rating: number; reviews: number; logo: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string; icon: string; nome: string }[]>([]);
  const [cacambasDisponiveis, setCacambasDisponiveis] = useState<{ id: string; nome: string; locador: string; locador_id: string; modelo: string; tipo_locacao: string; status: string; price: string; precoNumber: number; residuos: string[]; dias_externo: number; dias_interno: number }[]>([]);
  const [loadingCacambas, setLoadingCacambas] = useState(false);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<{ id: string; nome: string; locador: string; locador_id: string; tipo_equipamento: string; status: string; price: string }[]>([]);

  const initialsFrom = (n: string) => n.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const fmtBRL = (n: number) => `R$ ${(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  // Load obras (only user's own — RLS already enforces this)
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("obras")
        .select("id, nome, rua, numero, bairro, cidade, estado")
        .order("created_at", { ascending: false });
      setObras((data ?? []).map((o: any) => ({
        id: o.id,
        nome: o.nome,
        endereco: `${o.rua}, ${o.numero} - ${o.bairro}, ${o.cidade}/${o.estado}`,
      })));
    })();
  }, [userId]);

  // Load modelos de caçamba
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("modelos_cacamba")
        .select("id, modelo, capacidade, preco_minimo")
        .order("modelo");
      setModelosCacamba((data ?? []).map((m: any) => ({
        id: m.id,
        label: m.modelo,
        modelo: m.modelo,
        description: m.capacidade ? `Capacidade de ${m.capacidade}` : "",
        preco: Number(m.preco_minimo) || 0,
        popular: false,
      })));
    })();
  }, []);

  // Compute available units per modelo (disponivel=true, sem manutenção e sem OLU ativa)
  useEffect(() => {
    (async () => {
      const ATIVOS = [
        "entrega_pendente",
        "em_transito_locacao",
        "locada",
        "aguardando_retirada",
        "em_transito_retirada",
        "em_transito_analise",
        "aguardando_analise",
      ];
      const [{ data: unidades }, { data: olus }] = await Promise.all([
        supabase
          .from("cacamba_unidades")
          .select("id, cacamba_id, disponivel, manutencao, cacambas!inner(modelo)")
          .eq("disponivel", true)
          .eq("manutencao", false),
        supabase
          .from("ordem_locacao_unidades")
          .select("cacamba_unidade_id, status")
          .in("status", ATIVOS),
      ]);
      const ocupadas = new Set((olus ?? []).map((o: any) => o.cacamba_unidade_id));
      const counts: Record<string, number> = {};
      (unidades ?? []).forEach((u: any) => {
        if (ocupadas.has(u.id)) return;
        const modeloId = u.cacambas?.modelo;
        if (!modeloId) return;
        counts[modeloId] = (counts[modeloId] ?? 0) + 1;
      });
      setDisponiveisPorModelo(counts);
    })();
  }, []);

  // Load classes de resíduo
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("classes_residuo")
        .select("id, nome")
        .order("nome");
      setResiduos((data ?? []).map((r: any) => ({
        id: r.id,
        label: r.nome,
        icon: "♻️",
      })));
    })();
  }, []);

  // Load locadores (profiles with locador role)
  useEffect(() => {
    (async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "locador")
        .eq("ativo", true);
      const ids = Array.from(new Set((roles ?? []).map((r: any) => r.user_id)));
      if (!ids.length) { setLocadores([]); return; }
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, nome")
        .in("id", ids);
      setLocadores((profs ?? []).map((p: any) => ({
        id: p.id,
        nome: p.nome,
        rating: 0,
        reviews: 0,
        logo: initialsFrom(p.nome || "L"),
      })));
    })();
  }, []);

  // Load tipos de equipamentos (categories)
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("tipos_equipamentos")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      setCategories((data ?? []).map((t: any) => ({
        id: t.id,
        nome: t.nome,
        label: t.nome,
        icon: "🛠️",
      })));
    })();
  }, []);

  // Load caçambas (step 7) — filtered by previously chosen modelo / locador / locacao / residuos
  useEffect(() => {
    if (equipmentType !== "cacamba" || step < 7) return;
    (async () => {
      setLoadingCacambas(true);
      const { data, error } = await supabase
        .from("cacambas")
        .select("id, locador_id, modelo, tipo_locacao, preco_externo, preco_interno, dias_externo, dias_interno");
      if (error) {
        toast.error("Erro ao carregar caçambas: " + error.message);
      }
      const filtered = data ?? [];
      const locadorIds = Array.from(new Set(filtered.map((c: any) => c.locador_id)));
      let nomes: Record<string, string> = {};
      if (locadorIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id, nome").in("id", locadorIds);
        nomes = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p.nome]));
      }
      setCacambasDisponiveis(filtered.map((c: any) => {
        const preco = locacaoType === "externa" ? Number(c.preco_externo) : Number(c.preco_interno) || Number(c.preco_externo) || 0;
        const modeloNome = modelosCacamba.find(m => m.id === c.modelo)?.modelo ?? c.modelo;
        return {
          id: c.id,
          nome: `Caçamba ${modeloNome}`,
          locador: nomes[c.locador_id] ?? "—",
          locador_id: c.locador_id,
          modelo: c.modelo,
          tipo_locacao: c.tipo_locacao,
          status: "Disponível",
          price: fmtBRL(preco),
          precoNumber: preco,
          residuos: [],
          dias_externo: Number(c.dias_externo) || 0,
          dias_interno: Number(c.dias_interno) || 0,
        };
      }));
      setLoadingCacambas(false);
    })();
  }, [step, equipmentType, selectedModelo, selectedLocador, locacaoType, selectedResiduos, modelosCacamba]);

  // Load equipamentos (step 5 for "outros") — filtered by tipo + locador
  useEffect(() => {
    if (equipmentType !== "outros" || step < 5) return;
    (async () => {
      const tipoName = categories.find(c => c.id === selectedEquipmentCategory)?.nome;
      let query = supabase
        .from("equipamentos")
        .select("id, locador_id, nome, tipo_equipamento, preco_diario");
      if (tipoName) query = query.eq("tipo_equipamento", tipoName);
      if (selectedLocador) query = query.eq("locador_id", selectedLocador);
      const { data } = await query;
      const rows = data ?? [];
      const locadorIds = Array.from(new Set(rows.map((c: any) => c.locador_id)));
      let nomes: Record<string, string> = {};
      if (locadorIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id, nome").in("id", locadorIds);
        nomes = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p.nome]));
      }
      setEquipamentosDisponiveis(rows.map((e: any) => ({
        id: e.id,
        nome: e.nome,
        locador: nomes[e.locador_id] ?? "—",
        locador_id: e.locador_id,
        tipo_equipamento: e.tipo_equipamento,
        status: "Disponível",
        price: fmtBRL(Number(e.preco_diario) || 0),
      })));
    })();
  }, [step, equipmentType, selectedEquipmentCategory, selectedLocador, categories]);

  const equipmentTypes = [
    { 
      id: "cacamba", 
      label: "Caçamba de Entulho", 
      description: "Ideal para resíduos de construção e reformas",
      icon: Trash2, 
      img: imgCacamba,
    },
    { 
      id: "outros", 
      label: "Máquinas e Ferramentas", 
      description: "Escavadeiras, compressores e ferramentas diversas",
      icon: HardHat, 
      img: imgMaquinas,
    },
  ];

  const locacaoTypes = [
    { id: "interna", label: "Locação Interna", description: "Dentro do canteiro de obras", icon: Home },
    { id: "externa", label: "Locação Externa", description: "Em via pública ou calçada", icon: Globe },
  ];

  const totalSteps = equipmentType === "cacamba" ? 8 : 6;
  const progress = (step / totalSteps) * 100;

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleNewObra = (data: any) => {
    const nova = {
      id: Math.random().toString(36).substr(2, 9),
      nome: data.nome,
      endereco: `${data.rua}, ${data.numero} - ${data.bairro}, ${data.cidade}/${data.estado}`
    };
    setObras([nova, ...obras]);
    setSelectedObra(nova.id);
    setIsNewObraOpen(false);
    toast.success("Obra cadastrada com sucesso!");
  };

  const StepHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight md:text-4xl text-foreground break-words px-2">
        {title}
      </h2>
      <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed px-4">
        {subtitle}
      </p>
    </div>
  );

  const renderProductDetails = () => {
    if (!selectedProduct) return null;

    const obra = obras.find(o => o.id === selectedObra);
    const priceNumber = parseFloat(selectedProduct.price.replace("R$ ", "").replace(".", "").replace(",", "."));

    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
        <StepHeader 
          title="Confira seu Pedido" 
          subtitle="Verifique os detalhes abaixo antes de adicionar ao carrinho."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Product Card */}
          <div className="md:col-span-1 lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="border-2 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-lg border-primary/20 bg-card">
              <div className="aspect-[4/3] sm:aspect-video bg-muted flex items-center justify-center relative">
                {selectedProduct.equipmentType === "cacamba" ? (
                  <Trash2 className="h-32 w-32 text-primary opacity-20" />
                ) : (
                  <Package className="h-32 w-32 text-primary opacity-20" />
                )}
                <div className="absolute top-6 left-6">
                    <span className="bg-primary text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Lançamento</span>
                </div>
              </div>
              <CardContent className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-3">
                    <h3 className="text-xl sm:text-3xl font-black tracking-tight mb-1 uppercase break-words">{selectedProduct.nome}</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold border border-border">
                        {selectedProduct.locador.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wide">{selectedProduct.locador}</p>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="ml-1 text-xs font-bold">4.9 (256 avaliações)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right bg-primary/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/10 min-w-[140px] sm:min-w-[160px]">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">Preço unitário</p>
                    <p className="text-2xl sm:text-3xl font-black text-primary leading-none">{selectedProduct.price}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2">Destino e Logística</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-bold text-foreground">{obra?.nome}</p>
                          <p className="text-muted-foreground leading-tight">{obra?.endereco}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-sm font-medium">Cidade: {obra?.endereco.split(" - ")[1]?.split(",")[1]?.trim().split("/")[0]}</span>
                      </div>
                    </div>
                  </div>

                  {selectedProduct.equipmentType === "cacamba" && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2">Especificações Técnicas</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm font-medium">Locação: <span className="capitalize">{locacaoType || "Padrão"}</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm font-medium">
                            Prazo de locação:{" "}
                            <span className="font-bold">
                              {(() => {
                                const dias = locacaoType === "externa"
                                  ? selectedProduct.dias_externo
                                  : selectedProduct.dias_interno;
                                return dias > 0 ? `${dias} ${dias === 1 ? "dia" : "dias"}` : "Não informado";
                              })()}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-bold">Resíduos selecionados:</p>
                            <p className="text-muted-foreground capitalize">{selectedResiduos.map(id => residuos.find(r => r.id === id)?.label || id).join(", ") || "Não informados"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Card */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-2 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-xl border-primary bg-primary/5 md:sticky md:top-24">
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center space-y-2">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary">Quantidade</h4>
                  <div className="flex items-center justify-center gap-4 sm:gap-6">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl border-2 hover:bg-white transition-all shadow-md active:scale-95"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4 sm:h-6 sm:w-6" />
                    </Button>
                    <span className="text-3xl sm:text-5xl font-black min-w-[40px] sm:min-w-[60px]">{quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl border-2 hover:bg-white transition-all shadow-md active:scale-95"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4 sm:h-6 sm:w-6" />
                    </Button>
                  </div>
                </div>

                <Separator className="bg-primary/20" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{quantity}x {selectedProduct.price}</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-2">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Total</span>
                    <span className="text-2xl sm:text-4xl font-black text-primary leading-tight whitespace-nowrap">
                      R$ {(priceNumber * quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    className="w-full h-14 sm:h-16 text-lg sm:text-xl font-black rounded-xl sm:rounded-2xl shadow-xl shadow-primary/30 hover:translate-y-[-2px] active:translate-y-[0px] transition-all bg-primary hover:bg-primary/90"
                    onClick={async () => {
                      if (!userId) {
                        toast.error("Faça login para adicionar ao carrinho.");
                        return;
                      }
                      // 1) Buscar carrinho aberto do locatário ou criar um novo
                      let carrinhoId: string | null = null;
                      const { data: existing, error: findErr } = await supabase
                        .from("carrinhos")
                        .select("id")
                        .eq("locatario_id", userId)
                        .eq("status", "aberto")
                        .maybeSingle();
                      if (findErr) {
                        toast.error("Erro ao acessar carrinho: " + findErr.message);
                        return;
                      }
                      if (existing) {
                        carrinhoId = existing.id;
                      } else {
                        const { data: novo, error: insErr } = await supabase
                          .from("carrinhos")
                          .insert({ locatario_id: userId })
                          .select("id")
                          .single();
                        if (insErr || !novo) {
                          toast.error("Erro ao criar carrinho: " + (insErr?.message ?? ""));
                          return;
                        }
                        carrinhoId = novo.id;
                      }
                      // 2) Inserir item no carrinho
                      const isCacamba = selectedProduct.equipmentType === "cacamba";
                      const { error: itemErr } = await supabase
                        .from("carrinho_itens")
                        .insert({
                          carrinho_id: carrinhoId,
                          equipment_type: isCacamba ? "cacamba" : "equipamento",
                          cacamba_id: isCacamba ? selectedProduct.id : null,
                          equipamento_id: !isCacamba ? selectedProduct.id : null,
                          locador_id: selectedProduct.locador_id ?? null,
                          obra_id: selectedObra || null,
                          quantidade: quantity,
                          preco_unitario: priceNumber,
                          tipo_locacao: isCacamba ? (locacaoType || null) : null,
                          dias_locacao: isCacamba
                            ? (locacaoType === "externa"
                                ? Number(selectedProduct.dias_externo) || null
                                : Number(selectedProduct.dias_interno) || null)
                            : null,
                        });
                      if (itemErr) {
                        toast.error("Erro ao adicionar item: " + itemErr.message);
                        return;
                      }
                      notifyCartChanged();
                      toast.success("Adicionado ao carrinho!");
                      navigate("/dashboard/pedidos/carrinho");
                    }}
                  >
                    <ShoppingCart className="mr-3 h-6 w-6" /> Finalizar Pedido
                  </Button>
                  <Button variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground font-bold" onClick={prevStep}>
                    Alterar Equipamento
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            <StepHeader 
              title="Onde será a entrega?" 
              subtitle="Selecione o endereço da obra que receberá o equipamento."
            />
            
            <div className="grid gap-4 sm:gap-6">
              <div className="bg-card border-2 border-border/60 rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base font-semibold">Obra cadastrada</Label>
                  <Select value={selectedObra} onValueChange={setSelectedObra}>
                    <SelectTrigger className="h-14 sm:h-16 text-base sm:text-lg rounded-xl border-2 transition-all focus:ring-primary/20">
                      <SelectValue placeholder="Toque para selecionar a obra..." />
                    </SelectTrigger>
                    <SelectContent>
                      {obras.map(o => (
                        <SelectItem key={o.id} value={o.id} className="py-3">
                          <div className="flex flex-col">
                            <span className="font-bold">{o.nome}</span>
                            <span className="text-xs text-muted-foreground">{o.endereco}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedObra && (
                   <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 animate-in zoom-in-95 duration-300">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-bold text-primary">Local de entrega confirmado:</p>
                        <p className="text-muted-foreground">{obras.find(o => o.id === selectedObra)?.endereco}</p>
                      </div>
                   </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-dashed" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground font-medium">Ou cadastre agora</span></div>
                </div>

                <Dialog open={isNewObraOpen} onOpenChange={setIsNewObraOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-16 border-2 border-dashed rounded-xl text-lg font-medium hover:bg-primary/5 hover:border-primary hover:text-primary transition-all group">
                      <Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Cadastrar nova obra
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Nova Obra</DialogTitle>
                    </DialogHeader>
                    <ObraForm onSave={handleNewObra} />
                  </DialogContent>
                </Dialog>
              </div>

              <Button 
                disabled={!selectedObra} 
                onClick={nextStep}
                className="h-14 sm:h-16 text-lg sm:text-xl font-black rounded-xl sm:rounded-2xl shadow-xl shadow-primary/25 hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
              >
                Próximo Passo <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            <StepHeader 
              title="O que deseja locar?" 
              subtitle="Selecione a categoria do equipamento que você precisa hoje."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {equipmentTypes.map((type) => (
                <Card 
                  key={type.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-2xl hover:border-primary/50 overflow-hidden group border-4 rounded-2xl sm:rounded-3xl",
                    equipmentType === type.id ? "border-primary bg-primary/5 shadow-xl" : "border-border shadow-md"
                  )}
                  onClick={() => {
                    setEquipmentType(type.id as any);
                    nextStep();
                  }}
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img src={type.img} alt={type.label} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                      <div className="flex items-center gap-2">
                        <type.icon className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-black uppercase tracking-tight">{type.label}</h3>
                      </div>
                      <p className="text-sm text-white/80 font-medium leading-tight">{type.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Button variant="ghost" onClick={prevStep} className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="mr-2 h-5 w-5" /> Voltar
              </Button>
            </div>
          </div>
        );

      case 3:
        if (equipmentType === "cacamba") {
          return (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
              <StepHeader 
                title="Tipo de Locação" 
                subtitle="Onde o equipamento ficará posicionado?"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {locacaoTypes.map((t) => (
                  <Card 
                    key={t.id}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary border-2 rounded-2xl group",
                      locacaoType === t.id ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border"
                    )}
                    onClick={() => {
                        setLocacaoType(t.id as any);
                        nextStep();
                    }}
                  >
                    <CardContent className="p-8 text-center space-y-4">
                      <div className={cn("h-16 w-16 mx-auto rounded-xl flex items-center justify-center transition-colors", locacaoType === t.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary")}>
                         <t.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <span className="text-xl font-black uppercase">{t.label}</span>
                        <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex flex-col gap-4 mt-12 items-center">
                <Button variant="ghost" className="h-14 rounded-xl text-muted-foreground hover:text-primary" onClick={nextStep}>
                  Pular este passo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" onClick={prevStep} className="h-14 rounded-xl w-full max-w-xs">
                  <ChevronLeft className="mr-2 h-5 w-5" /> Voltar
                </Button>
              </div>
            </div>
          );
        } else {
            const filteredCategories = categories.filter(c => 
              c.label.toLowerCase().includes(equipmentSearch.toLowerCase())
            );

            return (
              <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                <StepHeader 
                  title="Tipo de Equipamento" 
                  subtitle="Selecione a categoria de equipamento que você está procurando."
                />

                <div className="relative mb-8 max-w-md mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar tipo de equipamento..." 
                    className="h-14 pl-12 rounded-2xl border-2 focus:ring-primary/20 text-lg"
                    value={equipmentSearch}
                    onChange={(e) => setEquipmentSearch(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((c) => (
                      <Card 
                        key={c.id}
                        className={cn(
                          "cursor-pointer transition-all hover:border-primary border-2 rounded-2xl group",
                          selectedEquipmentCategory === c.id ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border"
                        )}
                        onClick={() => {
                            setSelectedEquipmentCategory(c.id);
                            nextStep();
                        }}
                      >
                        <CardContent className="p-8 text-center space-y-4">
                          <div className="text-5xl group-hover:scale-110 transition-transform">{c.icon}</div>
                          <span className="text-xl font-black uppercase tracking-tight block">{c.label}</span>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-muted/30 rounded-3xl border-2 border-dashed">
                      <p className="text-muted-foreground font-medium">Nenhum tipo de equipamento encontrado.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center mt-12">
                  <Button variant="outline" onClick={prevStep} className="h-14 rounded-xl px-12">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Voltar
                  </Button>
                </div>
              </div>
            );
        }

      case 4:
        if (equipmentType === "cacamba") {
          return (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
              <StepHeader 
                title="Escolha o modelo" 
                subtitle="Selecione o tamanho ideal para sua necessidade."
              />

              <div className="grid gap-6">
                {modelosCacamba.map(m => {
                  const disp = disponiveisPorModelo[m.id] ?? 0;
                  const indisponivel = disp === 0;
                  return (
                  <Card 
                    key={m.id}
                    className={cn(
                      "transition-all border-2 rounded-2xl group",
                      indisponivel
                        ? "opacity-60 cursor-not-allowed border-border"
                        : "cursor-pointer hover:border-primary",
                      selectedModelo === m.id ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border"
                    )}
                    onClick={() => {
                        if (indisponivel) return;
                        setSelectedModelo(m.id);
                        nextStep();
                    }}
                  >
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={cn("h-16 w-16 rounded-xl flex items-center justify-center transition-colors", selectedModelo === m.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary")}>
                           <Trash2 className="h-8 w-8" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-black">{m.label}</span>
                            {m.popular && <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-primary/20">Mais pedido</span>}
                          </div>
                          <p className="text-muted-foreground font-medium">{m.description}</p>
                          <p className={cn("text-xs font-bold mt-1", indisponivel ? "text-destructive" : "text-primary")}>
                            {indisponivel ? "Nenhum disponível" : `${disp} ${disp === 1 ? "disponível" : "disponíveis"}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">A partir de</p>
                        <p className="text-2xl font-black text-primary">R$ {m.preco}</p>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
                
                <div className="flex flex-col gap-4 mt-6">
                  <Button variant="ghost" className="h-14 rounded-xl text-muted-foreground hover:text-primary" onClick={nextStep}>
                    Não sei o modelo, quero pular <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" onClick={prevStep} className="h-14 rounded-xl">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Voltar
                  </Button>
                </div>
              </div>
            </div>
          );
        } else {
            // STEP 4 for OTHERS: Select Locador
            const filteredLocadores = locadores.filter(l => 
              l.nome.toLowerCase().includes(locadorSearch.toLowerCase())
            );
            return (
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <StepHeader 
                    title="Escolha um Locador" 
                    subtitle="Filtre pelos parceiros com melhores avaliações na região."
                  />
                  
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar locador por nome..." 
                      className="h-14 pl-12 rounded-2xl border-2 focus:ring-primary/20 text-lg"
                      value={locadorSearch}
                      onChange={(e) => setLocadorSearch(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4">
                    {filteredLocadores.length > 0 ? (
                      filteredLocadores.map(l => (
                        <Card 
                          key={l.id} 
                          className={cn("cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all border-2 rounded-2xl", selectedLocador === l.id && "border-primary bg-primary/5")}
                          onClick={() => { setSelectedLocador(l.id); nextStep(); }}
                        >
                          <CardContent className="p-6 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-xl font-black text-muted-foreground">
                                      {l.logo}
                                  </div>
                                  <div>
                                      <h4 className="text-xl font-bold">{l.nome}</h4>
                                      <div className="flex items-center gap-2 text-sm">
                                          <div className="flex items-center text-yellow-500">
                                              <Star className="h-4 w-4 fill-current" />
                                              <span className="ml-1 font-bold">{l.rating}</span>
                                          </div>
                                          <span className="text-muted-foreground">({l.reviews} avaliações)</span>
                                      </div>
                                  </div>
                              </div>
                              <ChevronRight className="h-6 w-6 text-muted-foreground" />
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-muted/30 rounded-3xl border-2 border-dashed">
                        <p className="text-muted-foreground font-medium">Nenhum locador encontrado com este nome.</p>
                      </div>
                    )}
                    <div className="flex flex-col gap-4 mt-8">
                        <Button variant="ghost" className="h-14 rounded-xl" onClick={() => { setSelectedLocador(""); nextStep(); }}>
                        Ver todos sem filtrar por locador <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button variant="outline" className="h-14 rounded-xl" onClick={prevStep}>
                        <ChevronLeft className="mr-2 h-5 w-5" /> Voltar
                        </Button>
                    </div>
                  </div>
                </div>
            );
        }

      case 5:
        if (equipmentType === "cacamba") {
            return (
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <StepHeader 
                    title="O que você vai descartar?" 
                    subtitle="O preço pode variar dependendo do tipo de resíduo."
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {residuos.map(r => (
                      <Card 
                        key={r.id} 
                        className={cn(
                          "cursor-pointer transition-all border-2 rounded-2xl hover:border-primary group relative",
                          selectedResiduos.includes(r.id) ? "border-primary bg-primary/5 shadow-md" : "border-border"
                        )}
                        onClick={() => {
                            setSelectedResiduos(prev => 
                              prev.includes(r.id) 
                                ? prev.filter(id => id !== r.id) 
                                : [...prev, r.id]
                            );
                        }}
                      >
                        {selectedResiduos.includes(r.id) && (
                          <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-1 animate-in zoom-in duration-300">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                        <CardContent className="p-8 text-center space-y-4">
                          <div className="text-5xl group-hover:scale-110 transition-transform">{r.icon}</div>
                          <span className="text-xl font-black uppercase tracking-tight block">{r.label}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="flex flex-col gap-4 mt-12 items-center">
                    <Button 
                      disabled={selectedResiduos.length === 0}
                      onClick={nextStep}
                      className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/25 max-w-sm"
                    >
                      Confirmar Resíduos <ChevronRight className="ml-2 h-6 w-6" />
                    </Button>
                    <Button variant="link" className="text-lg text-muted-foreground" onClick={nextStep}>Pular este passo</Button>
                    <Button variant="outline" className="w-full h-14 rounded-xl max-w-sm" onClick={prevStep}>
                      <ChevronLeft className="mr-2 h-5 w-5" /> Voltar
                    </Button>
                  </div>
                </div>
              );
        } else {
            // STEP 5 for OTHERS: List Available equipments
            return (
              <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                <StepHeader 
                  title="Selecione o equipamento" 
                  subtitle="Confira os detalhes e adicione ao seu pedido."
                />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipamentosDisponiveis.map(e => (
                  <Card key={e.id} className="group border-2 rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:border-primary/40">
                    <div className="h-40 bg-muted flex items-center justify-center relative">
                        <Package className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 right-4">
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase border border-emerald-200">Em estoque</span>
                        </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h4 className="text-lg font-black leading-tight mb-1">{e.nome}</h4>
                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> {e.locador}
                            </p>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-2xl font-black text-primary">{e.price}</span>
                            <Button onClick={() => {
                              setSelectedProduct({...e, equipmentType: "outros"});
                              nextStep();
                            }} className="rounded-xl shadow-lg shadow-primary/20">Escolher</Button>
                        </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center mt-12">
                <Button variant="outline" className="h-14 rounded-xl px-12" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-5 w-5" /> Voltar
                </Button>
              </div>
            </div>
          );
        }

      case 6:
        if (equipmentType === "outros") {
          return renderProductDetails();
        }
        if (equipmentType === "cacamba") {
          const filteredLocadores = locadores.filter(l => 
            l.nome.toLowerCase().includes(locadorSearch.toLowerCase())
          );
          
          return (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
              <StepHeader 
                title="Escolha um Locador" 
                subtitle="Filtre pelos parceiros com melhores avaliações na região."
              />
              
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Buscar locador por nome..." 
                  className="h-14 pl-12 rounded-2xl border-2 focus:ring-primary/20 text-lg"
                  value={locadorSearch}
                  onChange={(e) => setLocadorSearch(e.target.value)}
                />
              </div>

              <div className="grid gap-4">
                {filteredLocadores.length > 0 ? (
                  filteredLocadores.map(l => (
                    <Card 
                      key={l.id} 
                      className={cn("cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all border-2 rounded-2xl", selectedLocador === l.id && "border-primary bg-primary/5")}
                      onClick={() => { setSelectedLocador(l.id); nextStep(); }}
                    >
                      <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-xl font-black text-muted-foreground">
                                  {l.logo}
                              </div>
                              <div>
                                  <h4 className="text-xl font-bold">{l.nome}</h4>
                                  <div className="flex items-center gap-2 text-sm">
                                      <div className="flex items-center text-yellow-500">
                                          <Star className="h-4 w-4 fill-current" />
                                          <span className="ml-1 font-bold">{l.rating}</span>
                                      </div>
                                      <span className="text-muted-foreground">({l.reviews} avaliações)</span>
                                  </div>
                              </div>
                          </div>
                          <ChevronRight className="h-6 w-6 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-3xl border-2 border-dashed">
                    <p className="text-muted-foreground font-medium">Nenhum locador encontrado com este nome.</p>
                  </div>
                )}
                <div className="flex flex-col gap-4 mt-8">
                    <Button variant="ghost" className="h-14 rounded-xl" onClick={() => { setSelectedLocador(""); nextStep(); }}>
                    Ver todos sem filtrar por locador <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button variant="outline" className="h-14 rounded-xl" onClick={prevStep}>
                    <ChevronLeft className="mr-2 h-5 w-5" /> Voltar
                    </Button>
                </div>
              </div>
            </div>
          );
        }
        return null;

      case 7:
        if (equipmentType === "cacamba") {
          return (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
              <StepHeader 
                title="Caçambas Disponíveis" 
                subtitle="Selecione o equipamento ideal para finalizar seu pedido."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingCacambas && (
                  <>
                    {[0, 1, 2].map(i => (
                      <Card key={i} className="border-2 rounded-3xl overflow-hidden animate-pulse">
                        <div className="h-40 bg-muted" />
                        <CardContent className="p-6 space-y-4">
                          <div className="h-5 w-2/3 bg-muted rounded" />
                          <div className="h-4 w-1/2 bg-muted rounded" />
                          <div className="flex justify-between pt-2">
                            <div className="h-7 w-24 bg-muted rounded" />
                            <div className="h-9 w-24 bg-muted rounded-xl" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
                {!loadingCacambas && cacambasDisponiveis.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-muted/30 rounded-3xl border-2 border-dashed">
                    <p className="text-muted-foreground font-medium">Nenhuma caçamba disponível com os filtros selecionados.</p>
                  </div>
                )}
                {!loadingCacambas && cacambasDisponiveis.map(e => (
                  <Card key={e.id} className="group border-2 rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:border-primary/40">
                    <div className="h-40 bg-muted flex items-center justify-center relative">
                        <Trash2 className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 right-4">
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase border border-emerald-200">Disponível</span>
                        </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h4 className="text-lg font-black mb-1">{e.nome}</h4>
                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> {e.locador}
                            </p>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-2xl font-black text-primary">{e.price}</span>
                            <Button onClick={() => {
                                setSelectedProduct({...e, equipmentType: "cacamba"});
                                nextStep();
                            }} className="rounded-xl shadow-lg shadow-primary/20 font-bold">Escolher</Button>
                        </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center mt-12">
                <Button variant="outline" className="h-14 rounded-xl px-12" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-5 w-5" /> Voltar
                </Button>
              </div>
            </div>
          );
        }
        return null;

      case 8:
        return renderProductDetails();

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background/50 pb-20 pt-4 sm:pt-8 md:pt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-card border border-border/50 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-3 sm:gap-5">
                <div className="h-10 w-10 sm:h-16 sm:w-16 bg-primary rounded-lg sm:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 shrink-0">
                    <ShoppingCart className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-3xl font-black tracking-tight uppercase leading-none mb-1 truncate">Solicitar Locação</h1>
                    <p className="text-[10px] sm:text-sm text-muted-foreground font-medium truncate">Pedido rápido em poucos passos</p>
                </div>
            </div>
            <div className="flex flex-col sm:items-end gap-1 sm:gap-1.5 min-w-[120px] sm:min-w-[140px]">
                <div className="flex items-center justify-between sm:justify-end gap-2 text-[10px] sm:text-sm font-black text-primary uppercase tracking-wider">
                    <span className="bg-primary/10 px-1.5 py-0.5 rounded sm:rounded-lg border border-primary/20">Passo {step}/{totalSteps}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 sm:h-2.5 w-full sm:w-48 bg-muted rounded-full overflow-hidden border border-border/50" />
            </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="min-h-[500px]">
          {renderStep()}
        </div>

        {/* Help Tip */}
        {step < totalSteps && (
            <div className="max-w-2xl mx-auto flex items-center justify-center gap-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-2xl text-blue-700 dark:text-blue-300 text-sm font-medium animate-in slide-in-from-top-4 duration-500">
                <span className="shrink-0"><Info className="h-5 w-5" /></span>
                <p>Precisa de ajuda? Fale agora com nossa central via WhatsApp clicando no botão flutuante.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SolicitarCacamba;
