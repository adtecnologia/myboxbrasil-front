import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium text-sm outline-none transition-colors",
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "cursor-pointer duration-500 ease-in-out",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-destructive/20",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-600",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-600",
        outline: "border bg-background hover:bg-background-100",
        muted: "border bg-background-100 hover:bg-background-200",
        ghost: "hover:bg-background-200",
        link: "text-primary underline-offset-4 hover:underline",
        info: "bg-blue-500 text-white hover:bg-blue-600",
        success: "bg-green-500 text-white hover:bg-green-600",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
        danger: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "h-8 gap-1.5 rounded-md px-3",
        md: "!px-4 h-10 rounded-md",
        lg: "!px-6 h-12 py-2",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends Omit<React.ComponentProps<"button">, "disabled">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  isDisabled = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
