
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Navigation,
  Phone
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MotoristaDashboard = () => {
  const nextTask = {
    id: "#LOC-9928",
    type: "Entrega",
    client: "Construtora Silva",
    address: "Rua das Flores, 123 - Centro",
    time: "09:30",
    distance: "2.5 km",
    status: "Pendente"
  };

  const tasks = [
    { id: "#LOC-9927", type: "Retirada", client: "João da Silva", address: "Av. Brasil, 450", status: "Em rota", time: "10:45" },
    { id: "#LOC-9926", type: "Entrega", client: "Reforma Jd. América", address: "Rua Chile, 88", status: "Pendente", time: "11:30" },
    { id: "#LOC-9925", type: "Troca", client: "Hospital Municipal", address: "Rua Saúde, 10", status: "Pendente", time: "13:00" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Olá, João Silva" 
        subtitle="Sua jornada de hoje: 8 tarefas programadas"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Task Card */}
        <Card className="md:col-span-2 border-primary/20 bg-primary/5 shadow-lg overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="mb-2 bg-primary">Próxima Atividade</Badge>
                <CardTitle className="text-2xl font-bold">{nextTask.type}: {nextTask.id}</CardTitle>
                <CardDescription className="text-base mt-1">{nextTask.client}</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{nextTask.time}</p>
                <p className="text-xs text-muted-foreground">Horário Previsto</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">{nextTask.address}</p>
                  <p className="text-sm text-muted-foreground">{nextTask.distance} de distância</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Navigation className="h-4 w-4" /> Iniciar Rota
                </Button>
                <Button variant="outline" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progresso do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mb-2">
                <p className="text-2xl font-bold text-foreground">3/8</p>
                <p className="text-xs text-muted-foreground">37% completo</p>
              </div>
              <Progress value={37} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 text-rose-600">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Ocorrências Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">01</p>
              <p className="text-xs text-muted-foreground mt-1">Clique para ver detalhes</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" /> Próximas Tarefas
        </h3>
        <div className="grid gap-3">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary uppercase">{task.type}</span>
                      <span className="text-xs text-muted-foreground">{task.id}</span>
                    </div>
                    <p className="font-semibold">{task.client}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {task.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{task.time}</p>
                    <Badge variant="outline" className={
                      task.status === "Em rota" ? "bg-blue-50 text-blue-600 border-blue-200" : ""
                    }>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary">
            Ver cronograma completo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MotoristaDashboard;
