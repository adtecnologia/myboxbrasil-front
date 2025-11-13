import { CircleAlert, CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ToastTypes = "info" | "success" | "warning" | "danger";

interface ToastProps {
  children: ReactNode;
  defaultIcon?: boolean;
  type?: ToastTypes;
}

export default function Toast({
  children,
  defaultIcon = true,
  type = "warning",
  ...props
}: ToastProps) {
  const styles = {
    info: {
      icon: <CircleAlert className="size-5" />,
      color: "bg-blue-500",
    },
    success: {
      icon: <CircleCheck className="size-5" />,
      color: "bg-green-600",
    },
    warning: {
      icon: <TriangleAlert className="size-5" />,
      color: "bg-yellow-500",
    },
    danger: {
      icon: <CircleX className="size-5" />,
      color: "bg-red-700",
    },
  };

  return (
    !closed && (
      <div
        className={cn(
          "relative flex items-center gap-3 rounded-lg px-6 py-4 font-medium text-sm text-white",
          styles[type].color
        )}
        {...props}
      >
        {defaultIcon && styles[type].icon}

        {children}
      </div>
    )
  );
}
