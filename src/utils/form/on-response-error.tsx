/*import type { AxiosError } from "axios";
import { toast } from "sonner";
import Toast from "@/components/ui/toast";

export type ResponseErrorProps = AxiosError<{ message?: string }>;

export const onResponseError = (err: ResponseErrorProps) => {
  const errorMessage = err.response?.data?.message;

  toast.custom(() => (
    <Toast type="danger">{errorMessage || "Existem campos inválidos!"}</Toast>
  ));
};
*/
