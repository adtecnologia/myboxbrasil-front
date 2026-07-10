import { Bell, Check, Package, FileText, AlertTriangle, DollarSign, Info, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  operacional: { icon: Package, color: "text-primary" },
  documento: { icon: FileText, color: "text-blue-500" },
  alerta: { icon: AlertTriangle, color: "text-destructive" },
  financeiro: { icon: DollarSign, color: "text-amber-500" },
  sistema: { icon: Info, color: "text-muted-foreground" },
  usuario: { icon: Users, color: "text-violet-500" },
};

const recentNotifications: Array<{
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: string;
}> = [];

export function NotificacoesPopover() {
  const navigate = useNavigate();
  const unreadCount = recentNotifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Notificações</TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Notificações</p>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{unreadCount} novas</Badge>
            )}
          </div>
        </div>
        <Separator />
        <ScrollArea className="max-h-[320px]">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs font-medium">Nenhuma notificação</p>
            </div>
          ) : (
          <div className="divide-y divide-border">
            {recentNotifications.map((n) => {
              const config = typeConfig[n.type] || typeConfig.sistema;
              const Icon = config.icon;
              return (
                <button
                  key={n.id}
                  className={`flex items-start gap-3 w-full text-left px-4 py-3 transition-colors hover:bg-muted/50 ${
                    !n.read ? "bg-primary/[0.03]" : ""
                  }`}
                  onClick={() => navigate("/dashboard/notificacoes")}
                >
                  <div className={`mt-0.5 rounded-lg p-1.5 ${!n.read ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs ${!n.read ? "font-semibold text-foreground" : "text-foreground/80"} truncate`}>
                        {n.title}
                      </p>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{n.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{n.time}</span>
                </button>
              );
            })}
          </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-primary hover:text-primary"
            onClick={() => navigate("/dashboard/notificacoes")}
          >
            Ver todas as notificações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
