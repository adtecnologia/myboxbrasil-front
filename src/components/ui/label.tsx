import * as LabelPrimitive from "@radix-ui/react-label";
import type * as React from "react";

import { cn } from "@/lib/utils";

export type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
  isRequired?: boolean;
};

function Label({ className, isRequired = true, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "mb-1.5 flex select-none items-center gap-1 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        !isRequired &&
          'after:text-font-200 after:text-xs after:content-["(opcional)"]',
        className
      )}
      data-slot="label"
      {...props}
    />
  );
}

export { Label };
