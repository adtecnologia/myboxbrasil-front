import { LoaderCircle } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  inputClassName?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

const startAndEndContentDefaultStyles =
  "text-font-200 pointer-events-none absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center";

function Input({
  className,
  inputClassName = "",
  type = "text",
  isLoading = false,
  isDisabled = false,
  startContent = null,
  endContent = null,

  ...props
}: InputProps) {
  return (
    <div
      className={cn(
        "relative w-full [&_svg:not([class*='size-'])]:size-5",
        className
      )}
    >
      {startContent && (
        <div className={cn(startAndEndContentDefaultStyles, "left-0")}>
          {startContent}
        </div>
      )}

      <input
        className={cn(
          "flex h-10 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none transition-[color] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-font-200 dark:bg-input/30",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          // 'aria-invalid:border-red-100 aria-invalid:ring-red-500/20',
          "disabled:cursor-not-allowed disabled:opacity-70",
          startContent && "pl-9",
          (endContent || isLoading) && "pr-12",
          inputClassName
        )}
        data-slot="input"
        disabled={isDisabled}
        type={type}
        {...props}
      />

      {isLoading && (
        <div
          className={cn(
            startAndEndContentDefaultStyles,
            "right-0 text-font-200"
          )}
        >
          <LoaderCircle className="size-5 animate-spin" />
        </div>
      )}

      {!isLoading && endContent && (
        <div className={cn(startAndEndContentDefaultStyles, "right-0")}>
          {endContent}
        </div>
      )}
    </div>
  );
}

export { Input };
