import { LoaderCircle } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  textareaClassName?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

const startAndEndContentDefaultStyles =
  "text-font-200 pointer-events-none absolute top-3 left-3 flex items-center justify-center";

function Textarea({
  className,
  textareaClassName = "",
  isLoading = false,
  isDisabled = false,
  startContent = null,
  endContent = null,
  ...props
}: TextareaProps) {
  return (
    <div
      className={cn(
        "relative w-full [&_svg:not([class*='size-'])]:size-5",
        className
      )}
    >
      {startContent && (
        <div className={cn(startAndEndContentDefaultStyles)}>
          {startContent}
        </div>
      )}

      <textarea
        className={cn(
          "flex min-h-[120px] w-full min-w-0 resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color] selection:bg-primary selection:text-primary-foreground placeholder:text-font-200",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-70",
          startContent && "pl-10",
          (endContent || isLoading) && "pr-10",
          textareaClassName
        )}
        data-slot="textarea"
        disabled={isDisabled}
        {...props}
      />

      {isLoading && (
        <div className="absolute top-3 right-3 text-font-200">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
      )}

      {!isLoading && endContent && (
        <div className="absolute top-3 right-3">{endContent}</div>
      )}
    </div>
  );
}

export { Textarea };
