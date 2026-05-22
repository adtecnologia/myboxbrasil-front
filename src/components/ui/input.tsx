import * as React from "react";
import { cn } from "@/lib/utils";

export const maskCurrency = (value: string) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  const amount = (Number(digits) / 100).toFixed(2);
  return amount.replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isCurrency?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isCurrency, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isCurrency) {
        const maskedValue = maskCurrency(e.target.value);
        e.target.value = maskedValue;
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
