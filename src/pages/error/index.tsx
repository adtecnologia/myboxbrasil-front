import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorPage() {
  const error = useRouteError();

  let title = "Ocorreu um erro inesperado";
  let message = "Algo deu errado ao carregar esta página.";

  if (isRouteErrorResponse(error)) {
    title = `Erro ${error.status}`;
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-linear-to-tl from-secondary to-primary">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{message}</p>
          <div className="flex gap-2">
            <Link to={"/"}>
              <Button variant={"outline"}>Voltar para tela inicial</Button>
            </Link>
            <Button
              onClick={() => window.location.reload()}
              variant={"primary"}
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
