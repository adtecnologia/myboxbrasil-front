import { ImageIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ImageUploadInputProps
  extends Omit<ComponentProps<"input">, "value" | "onChange"> {
  className?: string;
  value?: string | null;
  onChange?: (value: string) => void;
  previewClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  startContent?: ReactNode;
  endContent?: ReactNode;
}

export function ImageUploadInput({
  className,
  value,
  onChange,
  previewClassName,
  disabled = false,
  placeholder = "Sem ícone",
  startContent,
  endContent,
  ...props
}: ImageUploadInputProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {/* Preview da imagem */}
      <div
        className={cn(
          "flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground text-xs",
          previewClassName
        )}
      >
        {value ? (
          <img alt="Ícone" className="h-full w-full object-cover" src={value} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            {placeholder}
          </div>
        )}
      </div>

      {/* Upload */}
      <div>
        <input
          accept="image/*"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) {
              return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              onChange?.(result);
            };
            reader.readAsDataURL(file);
          }}
          type="file"
          {...props}
        />
      </div>
    </div>
  );
}
