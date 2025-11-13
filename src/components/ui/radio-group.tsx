import { cn } from "@/lib/utils";

export interface RadioOption<T = any> {
  label: string;
  value: T;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T = any> {
  options: RadioOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  name: string;
  className?: string;
  itemClassName?: string;
  direction?: "vertical" | "horizontal";
}

export function RadioGroup<T = any>({
  options,
  value,
  onChange,
  name,
  className,
  itemClassName,
  direction = "vertical",
}: RadioGroupProps<T>) {
  return (
    <div
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col space-y-2" : "flex-row space-x-4",
        className
      )}
      role="radiogroup"
    >
      {options.map((option, index) => {
        const optionId = `${name}-${String(index)}`;

        return (
          <label
            key={optionId}
            htmlFor={optionId}
            className={cn(
              "flex items-start gap-2 cursor-pointer text-sm mt-1.5",
              option.disabled && "opacity-60 cursor-not-allowed",
              itemClassName
            )}
          >
            <input
              type="radio"
              id={optionId}
              name={name}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onChange?.(option.value)}
              className={cn(
                "peer mt-1 h-4 w-4 shrink-0 appearance-none rounded-full border border-input",
                "checked:border-[5px] checked:border-primary",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            />
            <div className="mt-0.5">
              <div className="font-medium text-foreground">{option.label}</div>
              {option.description && (
                <div className="text-xs text-font-200">{option.description}</div>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
