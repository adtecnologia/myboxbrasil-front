import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ObraFormData {
  nome: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
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

export const ObraForm = ({ onSave, initialData, submitLabel = "Salvar Obra" }: ObraFormProps) => {
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("-")) return dateStr;
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
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
    }} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Obra</Label>
        <Input id="nome" name="nome" required defaultValue={initialData?.nome} placeholder="Ex: Residencial Solar" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="rua">Rua</Label>
          <Input id="rua" name="rua" required defaultValue={initialData?.rua} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <Input id="numero" name="numero" required defaultValue={initialData?.numero} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input id="bairro" name="bairro" required defaultValue={initialData?.bairro} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input id="complemento" name="complemento" defaultValue={initialData?.complemento} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" name="cidade" required defaultValue={initialData?.cidade} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado">Estado (UF)</Label>
          <Input id="estado" name="estado" required maxLength={2} defaultValue={initialData?.estado} placeholder="SP" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="responsavel">Responsável</Label>
          <Input id="responsavel" name="responsavel" required defaultValue={initialData?.responsavel} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" name="telefone" required defaultValue={initialData?.telefone} placeholder="(11) 99999-9999" />
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

      <Button type="submit" className="w-full mt-4">
        {submitLabel}
      </Button>
    </form>
  );
};

