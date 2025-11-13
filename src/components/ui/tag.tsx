import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const tagVariants = cva(
  "inline-flex select-none items-center justify-center rounded-full font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-200 text-gray-800",
        purple: "bg-purple-200 text-purple-800",
        green: "bg-green-200 text-green-800",
        red: "bg-red-200 text-red-800",
        orange: "bg-orange-200 text-orange-800",
        yellow: "bg-yellow-200 text-yellow-800",
        blue: "bg-blue-200 text-blue-800",
        pink: "bg-pink-200 text-pink-800",
        teal: "bg-teal-200 text-teal-800",
        indigo: "bg-indigo-200 text-indigo-800",
        cyan: "bg-cyan-200 text-cyan-800",
        lime: "bg-lime-200 text-lime-800",
        amber: "bg-amber-200 text-amber-800",
        fuchsia: "bg-fuchsia-200 text-fuchsia-800",
        rose: "bg-rose-200 text-rose-800",
        violet: "bg-violet-200 text-violet-800",
      },
      size: {
        sm: "h-6 px-2 py-1 text-xs",
        md: "h-8 px-3 py-1.5 text-sm",
        lg: "h-10 px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  children: React.ReactNode;
}

export function Tag({
  className,
  variant,
  size,
  children,
  ...props
}: TagProps) {
  return (
    <span className={cn(tagVariants({ variant, size, className }))} {...props}>
      {children}
    </span>
  );
}
