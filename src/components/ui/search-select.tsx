/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import { useState } from "react";
import type { RefCallBack } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SearchableSelectProps<T> = {
  items: T[];
  value?: string | number;
  onChange: (value: string) => void;
  itemLabel: keyof T | string;
  itemValue: keyof T | string;
  itemKey?: keyof T | string;
  placeholder?: string;
  ref?: RefCallBack;
  disabled?: boolean;
  filter?: boolean;
  name?: string;
};

function getNestedValue<T>(obj: T, path: string): any {
  return path.split(".").reduce((acc: any, key) => acc?.[key], obj);
}

export function SearchableSelect<T>({
  items,
  value,
  onChange,
  ref,
  itemLabel,
  itemValue,
  itemKey,
  disabled,
  filter,
  name,
  placeholder = "Selecione...",
}: SearchableSelectProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) => {
    const labelValue = String(getNestedValue(item, String(itemLabel)) ?? "");
    return labelValue.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Select
      isDisabled={disabled}
      name={name}
      onValueChange={onChange}
      value={String(value)}
    >
      <SelectTrigger ref={ref} value={undefined}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {/* Campo de busca */}
        <div className="px-2 py-1">
          <input
            className="w-full rounded-md border px-2 py-1 text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Buscar..."
            type="text"
            value={searchTerm}
          />
        </div>

        {filter && <SelectItem value="null">{placeholder}</SelectItem>}

        {/* Itens filtrados */}
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <SelectItem
              key={String(getNestedValue(item, String(itemKey)) ?? index)}
              value={String(getNestedValue(item, String(itemValue)) ?? "")}
            >
              {String(getNestedValue(item, String(itemLabel)) ?? "")}
            </SelectItem>
          ))
        ) : (
          <div className="px-2 py-2 text-muted-foreground text-sm">
            Nenhum resultado encontrado.
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
