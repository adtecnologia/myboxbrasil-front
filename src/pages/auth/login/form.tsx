/*
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/input-password";
import Toast from "@/components/ui/toast";
import { type LoginData, loginSchema } from "@/schemas/auth/login";
import { login as loginService } from "@/services/auth/login";
import { useAuthStore } from "@/stores/use-auth";
import { onFormError } from "@/utils/form/on-form-error";
import {
  onResponseError,
  type ResponseErrorProps,
} from "@/utils/form/on-response-error";

export default function LoginForm() {
  const navigate = useNavigate();

  const setAuthentication = useAuthStore((state) => state.setAuthentication);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: LoginData) => loginService({ data: values }),
    onSuccess: (response) => {
      const { data } = response;

      if (!data.accessToken) {
        toast.custom(() => (
          <Toast type="danger">
            Ocorreu um erro, por favor faça o login novamente!
          </Toast>
        ));

        return;
      }

      setAuthentication(data);
      navigate("/dashboard");

      toast.custom(() => (
        <Toast type="success">Login efetuado com sucesso!</Toast>
      ));
    },
    onError: (err: ResponseErrorProps) => onResponseError(err),
  });

  const onSubmit = (values: LoginData) => mutate(values);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)}>
        <div className="space-y-3 p-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Insira seu email"
                    startContent={<User size={18} />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    placeholder="Insira sua senha"
                    startContent={<Lock size={18} />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button asChild className="!p-0 h-fit" type="button" variant="link">
            <Link to="/password/forgot/">Esqueci minha senha</Link>
          </Button>

          <div className="mt-5 flex flex-wrap gap-1">
            <Button className="w-full" isLoading={isPending} size="lg">
              Entrar
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
*/
