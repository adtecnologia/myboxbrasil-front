import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Menu,
  ChevronRight,
  ChevronLeft,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { getFilteredMenuItems, type MenuItem } from "@/lib/dashboard-menu";

interface ActiveSubmenu {
  label: string;
  icon: React.ElementType;
  children: { label: string; href: string }[];
}

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<ActiveSubmenu | null>(null);
  const activeProfileType = useAuthStore((state) => state.activeProfileType());

  const filteredMenuItems = useMemo(
    () => getFilteredMenuItems(activeProfileType),
    [activeProfileType]
  );

  const isActive = (href: string) => location.pathname === href;

  // Quick-access items on the bottom bar: derived from the sidebar top-level items
  // (skip "Painel" and "Operacional" which have dedicated buttons)
  const quickItems = useMemo(() => {
    const skip = new Set(["Painel", "Operacional"]);
    return filteredMenuItems.filter((i) => !skip.has(i.label)).slice(0, 2);
  }, [filteredMenuItems]);

  const hasOperacional = filteredMenuItems.some((i) => i.label === "Operacional");

  const handleOpenChange = (open: boolean) => {
    setMoreOpen(open);
    if (!open) setActiveSubmenu(null);
  };

  const handleTopLevelClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      setActiveSubmenu({
        label: item.label,
        icon: item.icon,
        children: item.children,
      });
    } else if (item.href) {
      navigate(item.href);
      handleOpenChange(false);
    }
  };

  const isTopLevelActive = (item: MenuItem) =>
    (item.href && location.pathname === item.href) ||
    (item.children?.some((c) => location.pathname === c.href) ?? false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex h-16 items-center justify-around pb-safe">
        {/* Menu */}
        <Sheet open={moreOpen} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-[10px] font-medium text-muted-foreground transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span>Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl px-0 pt-3 pb-safe overflow-hidden max-h-[85vh]">
            <div className="relative">
              {/* Main menu */}
              <div
                className="px-4 pb-4 transition-transform duration-300 ease-in-out"
                style={{
                  transform: activeSubmenu ? "translateX(-100%)" : "translateX(0)",
                  opacity: activeSubmenu ? 0 : 1,
                  position: activeSubmenu ? "absolute" : "relative",
                  width: "100%",
                }}
              >
                <ScrollArea className="max-h-[65vh] pr-1">
                  <div className="space-y-0.5">
                    {filteredMenuItems.map((item) => {
                      const hasChildren = item.children && item.children.length > 0;
                      const active = isTopLevelActive(item);
                      return hasChildren ? (
                        <Button
                          key={item.label}
                          variant="ghost"
                          className={`w-full justify-between h-11 text-sm ${
                            active ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                          }`}
                          onClick={() => handleTopLevelClick(item)}
                        >
                          <span className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      ) : (
                        <Button
                          key={item.href ?? item.label}
                          variant="ghost"
                          className={`w-full justify-start h-11 text-sm gap-3 ${
                            active ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                          }`}
                          asChild
                        >
                          <Link to={item.href!} onClick={() => handleOpenChange(false)}>
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="space-y-0.5">
                  <div className="my-3 border-t border-border" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-11 text-sm text-muted-foreground gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/selecionar-perfil");
                      handleOpenChange(false);
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Trocar perfil
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-11 text-sm text-destructive gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/");
                      handleOpenChange(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>
              </div>

              {/* Submenu */}
              <div
                className="px-4 pb-4 transition-transform duration-300 ease-in-out"
                style={{
                  transform: activeSubmenu ? "translateX(0)" : "translateX(100%)",
                  opacity: activeSubmenu ? 1 : 0,
                  position: activeSubmenu ? "relative" : "absolute",
                  top: activeSubmenu ? undefined : 0,
                  width: "100%",
                }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start h-11 text-sm text-muted-foreground gap-2 mb-1"
                  onClick={() => setActiveSubmenu(null)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </Button>
                {activeSubmenu && (
                  <>
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {activeSubmenu.label}
                    </p>
                    <ScrollArea className="max-h-[60vh] pr-1">
                      <div className="space-y-0.5">
                        {activeSubmenu.children.map((child) => (
                          <Button
                            key={child.href}
                            variant="ghost"
                            className={`w-full justify-start h-11 text-sm ${
                              isActive(child.href)
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground"
                            }`}
                            asChild
                          >
                            <Link to={child.href} onClick={() => handleOpenChange(false)}>
                              <span className={`mr-2 h-1.5 w-1.5 shrink-0 rounded-full ${isActive(child.href) ? "bg-primary" : "bg-muted-foreground/30"}`} />
                              {child.label}
                            </Link>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Painel */}
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors ${
            isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Painel</span>
        </Link>

        {/* Center highlighted button - Operacional (only when role has it) */}
        {hasOperacional && (
          <Link
            to="/dashboard/operacional"
            className="flex flex-col items-center justify-center gap-0.5 -mt-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              {(() => {
                const op = filteredMenuItems.find((i) => i.label === "Operacional");
                const Icon = op?.icon;
                return Icon ? <Icon className="h-6 w-6" /> : null;
              })()}
            </div>
            <span className={`text-[10px] font-medium ${
              isActive("/dashboard/operacional") ? "text-primary" : "text-muted-foreground"
            }`}>
              Operacional
            </span>
          </Link>
        )}

        {/* Notificações */}
        <Link
          to="/dashboard/notificacoes"
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors ${
            isActive("/dashboard/notificacoes") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Bell className="h-5 w-5" />
          <span>Notificações</span>
        </Link>

        {/* Role-specific quick access (first sidebar section after Painel/Operacional) */}
        {quickItems[0] && (() => {
          const q = quickItems[0];
          const href = q.href ?? q.children?.[0]?.href;
          if (!href) return null;
          const active = isTopLevelActive(q);
          const Icon = q.icon;
          return (
            <Link
              to={href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate max-w-[64px]">{q.label}</span>
            </Link>
          );
        })()}
      </div>
    </nav>
  );
}
