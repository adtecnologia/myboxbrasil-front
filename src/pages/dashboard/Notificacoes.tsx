import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Filter, Package, FileText, AlertTriangle, Users, DollarSign, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "operacional" | "documento" | "alerta" | "financeiro" | "sistema" | "usuario";
}

const typeConfig: Record<Notification["type"], { icon: React.ElementType; color: string; label: string }> = {
  operacional: { icon: Package, color: "text-primary", label: "Operacional" },
  documento: { icon: FileText, color: "text-blue-500", label: "Documento" },
  alerta: { icon: AlertTriangle, color: "text-destructive", label: "Alerta" },
  financeiro: { icon: DollarSign, color: "text-amber-500", label: "Financeiro" },
  sistema: { icon: Info, color: "text-muted-foreground", label: "Sistema" },
  usuario: { icon: Users, color: "text-violet-500", label: "Usuário" },
};

const mockNotifications: Notification[] = [
  { id: "1", title: "Nova ordem de serviço criada", description: "OS #1234 foi criada para o cliente ABC Construtora.", time: "Há 5 minutos", read: false, type: "operacional" },
  { id: "2", title: "MTR pendente de assinatura", description: "O MTR #5678 aguarda assinatura do transportador.", time: "Há 15 minutos", read: false, type: "documento" },
  { id: "3", title: "Licença ambiental vencendo", description: "A licença do destino final XYZ vence em 15 dias.", time: "Há 1 hora", read: false, type: "alerta" },
  { id: "4", title: "Pagamento recebido", description: "Pagamento de R$ 2.500,00 do cliente DEF confirmado.", time: "Há 2 horas", read: true, type: "financeiro" },
  { id: "5", title: "Novo transportador cadastrado", description: "Transportes GHI foi adicionado ao sistema.", time: "Há 3 horas", read: true, type: "usuario" },
  { id: "6", title: "Atualização do sistema", description: "Versão 2.1.0 disponível com melhorias de performance.", time: "Há 5 horas", read: true, type: "sistema" },
  { id: "7", title: "Caçamba devolvida com atraso", description: "Caçamba #89 devolvida 2 dias após o prazo.", time: "Há 6 horas", read: false, type: "alerta" },
  { id: "8", title: "CDF emitido", description: "Certificado de Destinação Final #901 emitido com sucesso.", time: "Há 8 horas", read: true, type: "documento" },
  { id: "9", title: "Fatura gerada", description: "Fatura #456 no valor de R$ 8.200,00 gerada.", time: "Ontem", read: true, type: "financeiro" },
  { id: "10", title: "Coleta finalizada", description: "Coleta da OS #1230 finalizada pelo motorista.", time: "Ontem", read: true, type: "operacional" },
];

const Notificacoes = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>("todas");
  const isMobile = useIsMobile();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selected.has(n.id)));
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = (items: Notification[]) => {
    const allIds = items.map((n) => n.id);
    const allSelected = allIds.every((id) => selected.has(id));
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...allIds]));
    }
  };

  const filteredNotifications = filterType === "todas"
    ? notifications
    : notifications.filter((n) => n.type === filterType);

  const renderNotification = (n: Notification) => {
    const config = typeConfig[n.type];
    const Icon = config.icon;
    return (
      <div
        key={n.id}
        className={`flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 ${
          !n.read ? "bg-primary/[0.03]" : ""
        }`}
      >
        <Checkbox
          checked={selected.has(n.id)}
          onCheckedChange={() => toggleSelect(n.id)}
          className="mt-1"
        />
        <div className={`mt-0.5 rounded-lg p-2 ${!n.read ? "bg-primary/10" : "bg-muted"}`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm ${!n.read ? "font-semibold text-foreground" : "text-foreground/80"}`}>
              {n.title}
            </p>
            {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              {config.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{n.time}</span>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => toggleRead(n.id)}
            >
              {n.read ? <Bell className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{n.read ? "Marcar como não lida" : "Marcar como lida"}</TooltipContent>
        </Tooltip>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Notificações</h1>
          <p className="text-sm text-white/75">
            {unreadCount > 0 ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""}` : "Todas as notificações foram lidas"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] h-9 text-xs bg-white/15 border-white/20 text-white">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" className="h-9 text-xs gap-1.5 bg-white/20 hover:bg-white/30 text-white border-0" onClick={markAllRead} disabled={unreadCount === 0}>
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Marcar lidas</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Marcar todas como lidas</TooltipContent>
          </Tooltip>
          {selected.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-9 text-xs gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir ({selected.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir notificações</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir {selected.size} notificação{selected.size > 1 ? "ões" : ""}? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteSelected}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-none bg-transparent -mt-3 sm:border sm:shadow-sm sm:bg-card sm:rounded-lg sm:mt-0">
        <Tabs defaultValue="todas">
          <CardHeader className="pb-0 px-0 pt-0 sm:px-6 sm:pt-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="todas" className="text-xs">
                Todas
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{filteredNotifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="nao-lidas" className="text-xs">
                Não lidas
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{filteredNotifications.filter((n) => !n.read).length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="lidas" className="text-xs">
                Lidas
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{filteredNotifications.filter((n) => n.read).length}</Badge>
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            {(["todas", "nao-lidas", "lidas"] as const).map((tab) => {
              const items =
                tab === "todas"
                  ? filteredNotifications
                  : tab === "nao-lidas"
                  ? filteredNotifications.filter((n) => !n.read)
                  : filteredNotifications.filter((n) => n.read);
              return (
                <TabsContent key={tab} value={tab} className="mt-0">
                  {items.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                      <Checkbox
                        checked={items.length > 0 && items.every((n) => selected.has(n.id))}
                        onCheckedChange={() => selectAll(items)}
                      />
                      <span className="text-xs text-muted-foreground">Selecionar todas</span>
                    </div>
                  )}
                  {isMobile ? (
                    items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Bell className="h-10 w-10 mb-3 opacity-30" />
                        <p className="text-sm font-medium">Nenhuma notificação</p>
                        <p className="text-xs mt-1">Você está em dia!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border pb-24">
                        {items.map(renderNotification)}
                      </div>
                    )
                  ) : (
                    <ScrollArea className="max-h-[600px]">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                          <Bell className="h-10 w-10 mb-3 opacity-30" />
                          <p className="text-sm font-medium">Nenhuma notificação</p>
                          <p className="text-xs mt-1">Você está em dia!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {items.map(renderNotification)}
                        </div>
                      )}
                    </ScrollArea>
                  )}
                </TabsContent>
              );
            })}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Notificacoes;
