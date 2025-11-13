import { toast } from "sonner";

import Toast from "@/components/ui/toast";

export const onFormError = (err: Record<string, { message?: string }>) => {
  if (Object.values(err).length === 0) {
    return;
  }

  const errorMessage: string | null = Object.values(err)[0]?.message || null;

  toast.custom(() => (
    <Toast type="danger">{errorMessage || "Existem campos inválidos!"}</Toast>
  ));
};
