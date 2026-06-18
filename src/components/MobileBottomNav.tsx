import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Bell,
  Menu,
  ChevronRight,
  ChevronLeft,
  LogOut,
  RefreshCw,
  Building2,
  Users,
  DollarSign,
  FileBarChart,
  Package,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

interface SubMenu {
  label: string;
  icon: React.ElementType;
  children: { label: string; href: string }[];
}

interface DirectItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

type MobileMenuItem = (SubMenu | DirectItem) & { roles?: string[] };

const mobileMenuItems: MobileMenuItem[] = [
  { label: "Documentos", icon: FileText, href: "/dashboard/documentos" },
  { label: "Financeiro", icon: DollarSign, href: "/dashboard/financeiro" },
  { label: "Relatórios", icon: FileBarChart, href: "/dashboard/relatorios" },
  {
    label: "Entidades",
    icon: Building2,
    children: [
      { label: "Clientes", href: "/dashboard/clientes" },
      { label: "Transportadores", href: "/dashboard/transportadores" },
      { label: "Geradores", href: "/dashboard/geradores" },
      { label: "Prefeituras", href: "/dashboard/prefeituras" },
      { label: "Destinadores", href: "/dashboard/destinadores" },
    ],
  },
  {
    label: "Ativos",
    icon: Package,
    children: [
      { label: "Caçambas", href: "/dashboard/cacambas" },
      { label: "Equipamentos", href: "/dashboard/equipamentos" },
      { label: "Veículos", href: "/dashboard/veiculos" },
    ],
  },
  {
    label: "Usuários",
    icon: Users,
    href: "/dashboard/usuarios",
    roles: ["admin"],
  },
];

function isSubMenu(item: MobileMenuItem): item is SubMenu {
  return "children" in item;
}

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<SubMenu | null>(null);
  const activeProfileType = useAuthStore((state) => state.activeProfileType());

  const filteredMenuItems = useMemo(() => {
    return mobileMenuItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(activeProfileType || "");
    });
  }, [activeProfileType]);

  const isActive = (href: string) => location.pathname === href;
  const isMoreActive = filteredMenuItems.some((item) =>
    isSubMenu(item)
      ? item.children.some((c) => location.pathname === c.href)
      : location.pathname === item.href
  );

  const handleOpenChange = (open: boolean) => {
    setMoreOpen(open);
    if (!open) setActiveSubmenu(null);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex h-16 items-center justify-around pb-safe">
        {/* Menu */}
        <Sheet open={moreOpen} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <button
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors ${
                isMoreActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Menu className="h-5 w-5" />
              <span>Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl px-0 pt-3 pb-safe overflow-hidden">
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
                <div className="space-y-0.5">
                  {filteredMenuItems.map((item) =>
                    isSubMenu(item) ? (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className={`w-full justify-between h-11 text-sm ${
                          item.children.some((c) => isActive(c.href))
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground"
                        }`}
                        onClick={() => setActiveSubmenu(item)}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    ) : (
                      <Button
                        key={item.href}
                        variant="ghost"
                        className={`w-full justify-start h-11 text-sm gap-3 ${
                          isActive(item.href)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground"
                        }`}
                        asChild
                      >
                        <Link to={item.href} onClick={() => handleOpenChange(false)}>
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </Button>
                    )
                  )}
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
                            {child.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
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

        {/* Center highlighted button - Operacional */}
        <Link
          to="/dashboard/operacional"
          className="flex flex-col items-center justify-center gap-0.5 -mt-4"
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors ${
              isActive("/dashboard/operacional")
                ? "bg-primary text-primary-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            <ClipboardList className="h-6 w-6" />
          </div>
          <span className={`text-[10px] font-medium ${
            isActive("/dashboard/operacional") ? "text-primary" : "text-muted-foreground"
          }`}>
            Operacional
          </span>
        </Link>

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

        {/* Documentos */}
        <Link
          to="/dashboard/documentos"
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors ${
            isActive("/dashboard/documentos") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <FileText className="h-5 w-5" />
          <span>Docs</span>
        </Link>
      </div>
    </nav>
  );
}
