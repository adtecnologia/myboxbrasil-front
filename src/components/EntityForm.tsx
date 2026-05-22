import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EntityFormData {
  tipoDocumento: string;
  documento: string;
  nomeRazaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento?: string;
  cidade: string;
  estado: string;
  nomeResponsavel: string;
  cpfResponsavel: string;
}

interface EntityFormProps {
  initialData?: Partial<EntityFormData>;
  onSubmit: (data: EntityFormData) => void;
  isLoading?: boolean;
}

export const EntityForm: React.FC<EntityFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [tipoDocumento, setTipoDocumento] = React.useState(initialData?.tipoDocumento || "CNPJ");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as unknown as EntityFormData;
    onSubmit(data);
  };

  const isCNPJ = tipoDocumento === "CNPJ";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
          <Select 
            name="tipoDocumento" 
            defaultValue={tipoDocumento}
            onValueChange={(value) => setTipoDocumento(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CPF">CPF</SelectItem>
              <SelectItem value="CNPJ">CNPJ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="documento">Documento ({tipoDocumento})</Label>
          <Input 
            id="documento" 
            name="documento" 
            defaultValue={initialData?.documento} 
            required 
            placeholder={isCNPJ ? "00.000.000/0000-00" : "000.000.000-00"} 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nomeRazaoSocial">{isCNPJ ? "Razão Social" : "Nome"}</Label>
          <Input id="nomeRazaoSocial" name="nomeRazaoSocial" defaultValue={initialData?.nomeRazaoSocial} required placeholder={isCNPJ ? "Ex: Nome da Empresa Ltda" : "Ex: João Silva"} />
        </div>

        {isCNPJ && (
          <>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input id="nomeFantasia" name="nomeFantasia" defaultValue={initialData?.nomeFantasia} placeholder="Ex: Nome Comercial" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
              <Input id="inscricaoEstadual" name="inscricaoEstadual" defaultValue={initialData?.inscricaoEstadual} placeholder="Isento ou número" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
              <Input id="inscricaoMunicipal" name="inscricaoMunicipal" defaultValue={initialData?.inscricaoMunicipal} placeholder="Número da IM" />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={initialData?.email} required placeholder="contato@exemplo.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone / Celular</Label>
          <Input id="telefone" name="telefone" defaultValue={initialData?.telefone} required placeholder="(00) 00000-0000" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <Input id="cep" name="cep" defaultValue={initialData?.cep} required placeholder="00000-000" />
        </div>
        <div className="space-y-2 flex-1">
          <Label htmlFor="logradouro">Logradouro</Label>
          <Input id="logradouro" name="logradouro" defaultValue={initialData?.logradouro} required placeholder="Rua, Avenida, etc." />
        </div>

        <div className="grid grid-cols-3 gap-2 md:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" name="numero" defaultValue={initialData?.numero} required placeholder="123" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" name="bairro" defaultValue={initialData?.bairro} required placeholder="Nome do Bairro" />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input id="complemento" name="complemento" defaultValue={initialData?.complemento} placeholder="Apto, Sala, Bloco..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" name="cidade" defaultValue={initialData?.cidade} required placeholder="Cidade" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Input id="estado" name="estado" defaultValue={initialData?.estado} required placeholder="UF" maxLength={2} />
        </div>

        {isCNPJ && (
          <>
            <div className="space-y-2">
              <Label htmlFor="nomeResponsavel">Nome do Responsável</Label>
              <Input id="nomeResponsavel" name="nomeResponsavel" defaultValue={initialData?.nomeResponsavel} required placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpfResponsavel">CPF do Responsável</Label>
              <Input id="cpfResponsavel" name="cpfResponsavel" defaultValue={initialData?.cpfResponsavel} required placeholder="000.000.000-00" />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? "Salvando..." : "Salvar Cadastro"}
        </button>
      </div>
    </form>
  );
};
