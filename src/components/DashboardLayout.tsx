import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Users,
  FileBarChart,
  ChevronDown,
  ChevronRight,
  Menu,
  Box,
  Truck,
  Package,
  DollarSign,
  Building2,
  LogOut,
  Search,
  RefreshCw,
  MapPin,
  Settings2,
  ShieldAlert,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useIsMobile } from "@/hooks/use-mobile";
import myboxLogo from "@/assets/mybox-logo.png";
import { NotificacoesPopover } from "@/components/NotificacoesPopover";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";

function CartButton() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
      onClick={() => navigate("/dashboard/pedidos/carrinho")}
    >
      <ShoppingCart className="h-5 w-5" />
      {totalCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
          {totalCount}
        </span>
      )}
    </Button>
  );
}


interface MenuItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: string;
  children?: { label: string; href: string; roles?: string[] }[];
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { label: "Painel", icon: LayoutDashboard, href: "/dashboard" },
  { 
    label: "Operacional", 
    icon: ClipboardList, 
    children: [
      { label: "Entrada de Resíduos", href: "/dashboard/operacional", roles: ["admin", "destino"] },
      { label: "Gestão de Pedidos", href: "/dashboard/pedidos", roles: ["admin", "locador", "locatario"] },
      { label: "Solicitar locação", href: "/dashboard/pedidos/solicitar", roles: ["locatario"] },
      { label: "Ordens de Locação", href: "/dashboard/pedidos/ordens", roles: ["admin", "locador", "destino", "locatario", "prefeitura"] },
      { label: "Ocorrências", href: "/dashboard/pedidos/ocorrencias", roles: ["admin", "locador", "prefeitura"] },
    ],
    roles: ["admin", "locador", "destino", "locatario", "prefeitura"],
  },
  {
    label: "Entidades",
    icon: Building2,
    children: [
      { label: "Locadores", href: "/dashboard/locadores" },
      { label: "Locatários", href: "/dashboard/locatarios", roles: ["admin"] },
      { label: "Prefeituras", href: "/dashboard/prefeituras", roles: ["admin"] },
      { label: "Destino final", href: "/dashboard/destinadores" },
    ],
    roles: ["admin", "prefeitura"],
  },
  {
    label: "Ativos",
    icon: Package,
    children: [
      { label: "Caçambas", href: "/dashboard/cacambas" },
      { label: "Equipamentos", href: "/dashboard/equipamentos", roles: ["admin", "locador"] },
    ],
    roles: ["admin", "locador", "prefeitura"],
  },
  { label: "Veículos", icon: Truck, href: "/dashboard/veiculos", roles: ["locador"] },
  { label: "Documentos", icon: FileText, href: "/dashboard/documentos", roles: ["admin", "locador", "locatario", "destino", "prefeitura"] },
  { label: "Obras", icon: Building2, href: "/dashboard/obras", roles: ["locatario", "admin"] },
  {
    label: "Financeiro",
    icon: DollarSign,
    children: [
      { label: "Gestão Financeira", href: "/dashboard/financeiro", roles: ["admin"] },
      { label: "Minha Conta", href: "/dashboard/financeiro/minha-conta", roles: ["locador"] },
      { label: "Faturamento", href: "/dashboard/financeiro/faturamento", roles: ["locador"] },
      { label: "Transações", href: "/dashboard/financeiro/transacoes", roles: ["locador"] },
      { label: "Extrato", href: "/dashboard/financeiro/extrato", roles: ["locador"] },
      { label: "Faturas", href: "/dashboard/financeiro/faturas", roles: ["locador", "locatario"] },
      { label: "Despesas", href: "/dashboard/financeiro/despesas", roles: ["locatario"] },
    ],
    roles: ["admin", "locatario", "locador"],
  },
  { label: "Rastreamento", icon: MapPin, href: "/dashboard/rastreamento", roles: ["locador", "prefeitura"] },
  {
    label: "Relatórios",
    icon: FileBarChart,
    children: [
      { label: "Locações", href: "/dashboard/relatorios/locacoes", roles: ["admin", "locador"] },
      { label: "Locação por Bairro", href: "/dashboard/relatorios/bairro", roles: ["admin", "locador", "prefeitura"] },
      { label: "Locação por Obra", href: "/dashboard/relatorios/obra", roles: ["admin", "locador", "locatario", "prefeitura"] },
      { label: "Ranking de Clientes", href: "/dashboard/relatorios/ranking", roles: ["admin", "locador"] },
      { label: "Performance Motoristas", href: "/dashboard/relatorios/motoristas", roles: ["admin", "locador"] },
      { label: "Índice de Satisfação", href: "/dashboard/relatorios/satisfacao", roles: ["admin", "locador"] },
      { label: "Destino de Resíduos", href: "/dashboard/relatorios/destino-residuos", roles: ["admin", "locador", "locatario"] },
      { label: "Vencimento de prazo", href: "/dashboard/relatorios/vencimento-prazo", roles: ["prefeitura"] },
      { label: "Destinação de resíduos", href: "/dashboard/relatorios/destinacao-residuos", roles: ["prefeitura"] },
      { label: "Classe de resíduos", href: "/dashboard/relatorios/classe-residuos", roles: ["prefeitura"] },
      { label: "Situação locadores", href: "/dashboard/relatorios/situacao-locadores", roles: ["prefeitura"] },
      { label: "Situação destino final", href: "/dashboard/relatorios/situacao-destino", roles: ["prefeitura"] },
    ],
  },
  {
    label: "Localidades",
    icon: MapPin,
    children: [
      { label: "Estados", href: "/dashboard/localidades/estados" },
      { label: "Cidades", href: "/dashboard/localidades/cidades" },
    ],
    roles: ["admin"],
  },
  {
    label: "Config. Operacionais",
    icon: Settings2,
    children: [
      { label: "Classes de Resíduos", href: "/dashboard/config/residuos" },
      { label: "Tipos de Veículos", href: "/dashboard/config/veiculos" },
      { label: "Tipos de Equipamentos", href: "/dashboard/config/equipamentos" },
      { label: "Modelos de Caçamba", href: "/dashboard/config/modelos-cacamba" },
      { label: "Tecnologias de Tratamento", href: "/dashboard/config/tecnologias" },
      { label: "Formas de Pagamento", href: "/dashboard/config/pagamentos" },
    ],
    roles: ["admin", "locador"],
  },
  {
    label: "LGPD",
    icon: ShieldAlert,
    children: [
      { label: "Termos de Uso", href: "/dashboard/lgpd/termos" },
      { label: "Política de Privacidade", href: "/dashboard/lgpd/privacidade" },
      { label: "Aceites dos Usuários", href: "/dashboard/lgpd/aceites" },
    ],
    roles: ["admin"],
  },
  {
    label: "Usuários",
    icon: Users,
    children: [
      { label: "Listagem", href: "/dashboard/usuarios", roles: ["admin", "locatario", "prefeitura"] },
      { label: "Perfis e Permissões", href: "/dashboard/usuarios/roles", roles: ["admin"] },
    ],
    roles: ["admin", "locatario", "prefeitura"],
  },
];
// Flatten menu items for search
const allSearchItems = menuItems.flatMap((item) =>
  item.children
    ? item.children.map((child) => ({ label: child.label, href: child.href, group: item.label }))
    : [{ label: item.label, href: item.href!, group: "Menu" }]
);

function SearchMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="hidden md:flex h-8 w-48 justify-start gap-2 text-xs text-muted-foreground bg-muted/50 hover:bg-muted">
          <Search className="h-3.5 w-3.5" />
          Buscar...
          <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <Command>
          <CommandInput placeholder="Buscar módulo..." className="h-9 text-xs" />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">Nenhum resultado.</CommandEmpty>
            <CommandGroup heading="Módulos">
              {allSearchItems.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.label}
                  onSelect={() => {
                    navigate(item.href);
                    setOpen(false);
                  }}
                  className="text-xs cursor-pointer"
                >
                  {item.label}
                  <span className="ml-auto text-[10px] text-muted-foreground">{item.group}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

function SidebarNav({ currentPath, collapsed, onNavigate, menuItems }: { currentPath: string; collapsed?: boolean; onNavigate?: () => void; menuItems: MenuItem[] }) {
  return (
    <nav className="space-y-0.5 px-2">
      {menuItems.map((item) =>
        item.children ? (
          collapsed ? (
            <HoverCard key={item.label} openDelay={0} closeDelay={150}>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-full h-10 ${
                    item.children.some((c) => currentPath === c.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent side="right" align="start" className="w-56 p-1" sideOffset={8}>
                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{item.label}</p>
                {item.children!.map((child) => (
                  <Link key={child.href} to={child.href} onClick={onNavigate}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start h-8 text-sm ${
                        currentPath === child.href
                          ? "text-primary font-medium bg-primary/5"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {child.label}
                    </Button>
                  </Link>
                ))}
              </HoverCardContent>
            </HoverCard>
          ) : (
            <SidebarCollapsible key={item.label} item={item} currentPath={currentPath} onNavigate={onNavigate} />
          )
        ) : collapsed ? (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <Link to={item.href!} onClick={onNavigate}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-full h-10 ${
                    currentPath === item.href
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ) : (
          <Link key={item.label} to={item.href!} onClick={onNavigate}>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 h-10 text-sm font-medium ${
                currentPath === item.href
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold bg-primary/10 text-primary border-0">
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        )
      )}
    </nav>
  );
}

function SidebarCollapsible({ item, currentPath, onNavigate }: { item: MenuItem; currentPath: string; onNavigate?: () => void }) {
  const isActive = item.children?.some((c) => currentPath === c.href);
  const [open, setOpen] = useState(isActive);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full justify-between h-10 text-sm font-medium min-w-0 ${
            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <span className="flex items-center gap-3 min-w-0 flex-1">
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </span>
          {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pt-0.5">
        {item.children!.map((child) => (
          <Link key={child.href} to={child.href} onClick={onNavigate}>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start pl-11 h-9 text-sm min-w-0 ${
                currentPath === child.href
                  ? "text-primary font-medium bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`mr-2 h-1.5 w-1.5 shrink-0 rounded-full ${currentPath === child.href ? "bg-primary" : "bg-muted-foreground/30"}`} />
              <span className="truncate">{child.label}</span>
            </Button>
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

const DashboardLayout = ({ children }: DashboardLayoutProps = {}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const activeProfileType = useAuthStore((state) => state.activeProfileType());

  const filteredMenuItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(activeProfileType || "");
      })
      .map((item) => {
        const newItem = { ...item };
        if (newItem.children) {
          newItem.children = newItem.children
            .filter((child) => {
              if (!child.roles) return true;
              return child.roles.includes(activeProfileType || "");
            })
            .map(child => {
              if (child.href === "/dashboard/pedidos" && activeProfileType === "locatario") {
                return { ...child, label: "Meus Pedidos" };
              }
              return child;
            });
        }
        return newItem;
      })
      .filter((item) => !item.children || item.children.length > 0 || item.href);
  }, [activeProfileType]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const desktopMargin = isMobile ? "ml-0" : sidebarOpen ? "ml-64" : "ml-[68px]";

  const currentPageTitle = filteredMenuItems.reduce<string>((acc, item) => {
    if (item.href === location.pathname) return item.label;
    if (item.children) {
      const child = item.children.find((c) => c.href === location.pathname);
      if (child) return child.label;
    }
    return acc;
  }, "Painel");

  const sidebarContent = (collapsed?: boolean) => (
    <>
      {/* Logo */}
      <div className={`flex items-center border-b border-border ${collapsed ? "justify-center px-2 h-[57px]" : "gap-3 px-4 h-[57px]"}`}>
        <img
          src={myboxLogo}
          alt="MyBox"
          className={`transition-all duration-300 ${collapsed ? "h-8 w-8" : "h-10 w-10"}`}
        />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">MyBox</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Gestão de Resíduos</span>
          </div>
        )}
      </div>

      {/* Menu */}
      <ScrollArea className="flex-1 py-3 [&>div>div]:!block [&>div>div]:w-full">
        {!collapsed && (
          <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Menu principal
          </p>
        )}
        <SidebarNav currentPath={location.pathname} collapsed={collapsed} onNavigate={isMobile ? () => setMobileOpen(false) : undefined} menuItems={filteredMenuItems} />
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => navigate("/")}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-muted/40 overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={`fixed left-0 top-0 z-40 flex h-full flex-col overflow-hidden bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-[68px]"
          }`}
        >
          {sidebarContent(!sidebarOpen)}
        </aside>
      )}

      {/* Mobile Sidebar - keep for sheet trigger from hamburger, but primary nav is bottom bar */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            {sidebarContent(false)}
          </SheetContent>
        </Sheet>
      )}

      {/* Main */}
      <div className={`flex flex-1 flex-col transition-all duration-300 min-w-0 h-screen overflow-hidden ${desktopMargin}`}>
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex h-[57px] items-center gap-2 sm:gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-3 sm:px-4 overflow-hidden">
          {isMobile ? (
            <>
              {/* Mobile: Logo à esquerda, título centro, avatar direita */}
              <img src={myboxLogo} alt="MyBox" className="h-8 w-8" />
              <span className="text-sm font-bold text-foreground">MyBox</span>
              <div className="flex-1" />
              <ThemeToggle className="h-8 w-8 text-muted-foreground" />
              {activeProfileType === "locatario" && <CartButton />}
              <NotificacoesPopover />

              <button onClick={() => navigate("/dashboard/perfil")} className="ml-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={myboxLogo} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">MB</AvatarFallback>
                </Avatar>
              </button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-sm font-semibold text-foreground truncate">{currentPageTitle}</h1>
              <div className="flex-1" />
              <SearchMenu />
              <ThemeToggle className="h-9 w-9 text-muted-foreground" />
              {activeProfileType === "locatario" && <CartButton />}
              <NotificacoesPopover />

              <Separator orientation="vertical" className="h-6" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-muted">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={myboxLogo} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">MB</AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left sm:block">
                      <p className="text-xs font-medium text-foreground leading-tight">MyBox Brasil</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {activeProfileType === 'admin' ? 'Administrador' : 
                         activeProfileType === 'locatario' ? 'Locatário' :
                         activeProfileType === 'locador' ? 'Locador' : 
                         activeProfileType === 'prefeitura' ? 'Prefeitura' : 'Destino Final'}
                      </p>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">Minha conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" onClick={() => navigate("/dashboard/perfil")}>
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs" onClick={() => navigate("/dashboard/configuracoes")}>
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" onClick={() => navigate("/selecionar-perfil")}>
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Trocar perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs text-destructive" onClick={() => navigate("/")}>
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">{children || <Outlet />}</main>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default DashboardLayout;
