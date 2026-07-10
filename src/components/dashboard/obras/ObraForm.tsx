import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ObraFormData {
  nome: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  cep: string;
  cidade: string;
  estado: string;
  responsavel: string;
  telefone: string;
  dataInicio: string;
  dataFinalEstimada: string;
}

interface ObraFormProps {
  onSave: (data: ObraFormData) => void;
  initialData?: any;
  submitLabel?: string;
}

const normalizeCityName = (v: string) =>
  v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

export const ObraForm = ({ onSave, initialData, submitLabel = "Salvar Obra" }: ObraFormProps) => {
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("-")) return dateStr;
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const maskPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const [telefone, setTelefone] = useState(maskPhone(initialData?.telefone || ""));

  const maskCep = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  };
  const [cep, setCep] = useState(maskCep(initialData?.cep || ""));
  const [rua, setRua] = useState(initialData?.rua || "");
  const [bairro, setBairro] = useState(initialData?.bairro || "");
  const [cidade, setCidade] = useState(initialData?.cidade || "");
  const [estado, setEstado] = useState(initialData?.estado || "");
  const [cepLoading, setCepLoading] = useState(false);
  const [estados, setEstados] = useState<{ sigla: string; nome: string }[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );
        const data = await resp.json();
        setEstados(data.map((e: any) => ({ sigla: e.sigla, nome: e.nome })));
      } catch {
        // silencioso
      }
    })();
  }, []);

  useEffect(() => {
    if (!estado) {
      setMunicipios([]);
      return;
    }
    (async () => {
      try {
        setLoadingMunicipios(true);
        const resp = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`
        );
        const data = await resp.json();
        setMunicipios(data.map((m: any) => m.nome));
      } catch {
        setMunicipios([]);
      } finally {
        setLoadingMunicipios(false);
      }
    })();
  }, [estado]);

  const cidadeOficial = useMemo(() => {
    if (!cidade) return "";
    return (
      municipios.find((m) => normalizeCityName(m) === normalizeCityName(cidade)) || cidade
    );
  }, [cidade, municipios]);

  useEffect(() => {
    if (cidadeOficial && cidadeOficial !== cidade) setCidade(cidadeOficial);
  }, [cidadeOficial]);

  const handleCepChange = async (value: string) => {
    const masked = maskCep(value);
    setCep(masked);
    const digits = masked.replace(/\D/g, "");
    if (digits.length === 8) {
      try {
        setCepLoading(true);
        const resp = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await resp.json();
        if (data?.erro) {
          toast.error("CEP não encontrado");
          return;
        }
        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setEstado(data.uf || "");
        setCidade(data.localidade || "");
      } catch {
        toast.error("Erro ao buscar CEP");
      } finally {
        setCepLoading(false);
      }
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const data: any = {};
      form.forEach((value, key) => {
        data[key] = value;
      });
      onSave(data as ObraFormData);
    }}>
      <div className="space-y-4 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="nome">Nome da Obra</Label>
          <Input id="nome" name="nome" required defaultValue={initialData?.nome} placeholder="Ex: Residencial Solar" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            name="cep"
            required
            value={cep}
            onChange={(e) => handleCepChange(e.target.value)}
            inputMode="numeric"
            maxLength={9}
            placeholder="00000-000"
            disabled={cepLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="rua">Rua</Label>
          <Input id="rua" name="rua" required value={rua} onChange={(e) => setRua(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <Input id="numero" name="numero" required defaultValue={initialData?.numero} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input id="bairro" name="bairro" required value={bairro} onChange={(e) => setBairro(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input id="complemento" name="complemento" defaultValue={initialData?.complemento} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estado">Estado (UF)</Label>
          <input type="hidden" name="estado" value={estado} />
          <Select value={estado} onValueChange={(v) => { setEstado(v); setCidade(""); }}>
            <SelectTrigger id="estado">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {estados.map((e) => (
                <SelectItem key={e.sigla} value={e.sigla}>{e.sigla} — {e.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <input type="hidden" name="cidade" value={cidade} />
          <Select
            key={`cidade-${estado}-${municipios.length}`}
            value={cidade}
            onValueChange={setCidade}
            disabled={!estado || loadingMunicipios}
          >
            <SelectTrigger id="cidade">
              <SelectValue placeholder={!estado ? "Selecione o estado" : loadingMunicipios ? "Carregando..." : "Selecione a cidade"} />
            </SelectTrigger>
            <SelectContent>
              {cidade && !municipios.includes(cidade) && (
                <SelectItem value={cidade}>{cidade}</SelectItem>
              )}
              {municipios.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="responsavel">Responsável</Label>
          <Input id="responsavel" name="responsavel" required defaultValue={initialData?.responsavel} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            name="telefone"
            required
            value={telefone}
            onChange={(e) => setTelefone(maskPhone(e.target.value))}
            inputMode="tel"
            maxLength={15}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataInicio">Data de Início</Label>
          <Input id="dataInicio" name="dataInicio" type="date" required defaultValue={formatDateForInput(initialData?.dataInicio || "")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataFinalEstimada">Data Final Estimada</Label>
          <Input id="dataFinalEstimada" name="dataFinalEstimada" type="date" required defaultValue={formatDateForInput(initialData?.dataFinalEstimada || "")} />
        </div>
      </div>
      </div>

      <DialogFooter>
        <Button type="submit" className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};

