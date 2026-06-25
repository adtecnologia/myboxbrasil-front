import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const feedbackData: { item: string; score: number }[] = [];

const IndiceSatisfacao = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Índice de Satisfação</h1>
        <p className="text-sm text-white/75">O que seus clientes pensam sobre seu serviço</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">NPS Geral</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">— / 5.0</div>
            <p className="text-xs text-muted-foreground mt-1">Sem avaliações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Comentários Positivos</CardTitle>
            <ThumbsUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sugestões Recebidas</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {feedbackData.map((data) => (
            <div key={data.item} className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{data.item}</span>
                <span>{data.score} / 5.0</span>
              </div>
              <Progress value={(data.score / 5) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default IndiceSatisfacao;