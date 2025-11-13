/** biome-ignore-all lint/nursery/noReactForwardRef: ignorar */
import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";

// Estendendo o InputProps ao invés de ComponentProps<"input">
const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handlePasswordToggle = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <Input
        className={className}
        endContent={
          <Button
            className="pointer-events-auto absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={handlePasswordToggle}
            size="sm"
            type="button"
            variant="ghost"
          >
            {showPassword ? (
              <EyeIcon aria-hidden="true" className="size-5" />
            ) : (
              <EyeOffIcon aria-hidden="true" className="size-5" />
            )}
            <span className="sr-only">
              {showPassword ? "Esconder senha" : "Mostrar senha"}
            </span>
          </Button>
        }
        ref={ref}
        type={showPassword ? "text" : "password"}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
