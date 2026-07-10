import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Menu,
  LogOut,
  Search,
  RefreshCw,
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
import { supabase } from "@/integrations/supabase/client";
import { CART_CHANGED_EVENT, CART_CHANGED_STORAGE_KEY } from "@/lib/cart-events";
import {
  type MenuItem,
  getFilteredMenuItems,
} from "@/lib/dashboard-menu";

function CartButton() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!userId) { setTotalCount(0); return; }
    let cartId: string | null = null;

    const fetchCount = async () => {
      const { data: cart } = await supabase
        .from("carrinhos")
        .select("id")
        .eq("locatario_id", userId)
        .eq("status", "aberto")
        .maybeSingle();
      if (!cart) { cartId = null; setTotalCount(0); return; }
      cartId = cart.id;
      const { data: rows } = await supabase
        .from("carrinho_itens")
        .select("quantidade")
        .eq("carrinho_id", cart.id);
      const total = (rows ?? []).reduce((acc, r: any) => acc + (r.quantidade ?? 0), 0);
      setTotalCount(total);
    };

    fetchCount();

    const handleCartChanged = () => { fetchCount(); };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CART_CHANGED_STORAGE_KEY) fetchCount();
    };

    window.addEventListener(CART_CHANGED_EVENT, handleCartChanged);
    window.addEventListener("storage", handleStorage);

    const channel = supabase
      .channel(`cart-count-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "carrinho_itens" }, () => fetchCount())
      .on("postgres_changes", { event: "*", schema: "public", table: "carrinhos", filter: `locatario_id=eq.${userId}` }, () => fetchCount())
      .subscribe();

    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, handleCartChanged);
      window.removeEventListener("storage", handleStorage);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
      asChild
    >
      <Link to="/dashboard/pedidos/carrinho">
        <ShoppingCart className="h-5 w-5" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
            {totalCount}
          </span>
        )}
      </Link>
    </Button>
  );
}

function useAvatarSignedUrl(path?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!path) { setUrl(null); return; }
    if (/^https?:\/\//.test(path)) { setUrl(path); return; }
    (async () => {
      const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
      if (!cancelled) setUrl(data?.signedUrl ?? null);
    })();
    return () => { cancelled = true; };
  }, [path]);
  return url;
}


function SearchMenu({ menuItems }: { menuItems: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const searchItems = useMemo(
    () =>
      menuItems.flatMap((item) =>
        item.children
          ? item.children.map((child) => ({ label: child.label, href: child.href, group: item.label }))
          : [{ label: item.label, href: item.href!, group: "Menu" }]
      ),
    [menuItems]
  );

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
              {searchItems.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.label}
                  asChild
                >
                  <Link to={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                    <span className="ml-auto text-[10px] text-muted-foreground">{item.group}</span>
                  </Link>
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
                  <Button
                    key={child.href}
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start h-8 text-sm ${
                      currentPath === child.href
                        ? "text-primary font-medium bg-primary/5"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    asChild
                  >
                    <Link to={child.href} onClick={onNavigate}>
                      {child.label}
                    </Link>
                  </Button>
                ))}
              </HoverCardContent>
            </HoverCard>
          ) : (
            <SidebarCollapsible key={item.label} item={item} currentPath={currentPath} onNavigate={onNavigate} />
          )
        ) : collapsed ? (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`w-full h-10 ${
                  currentPath === item.href
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                asChild
              >
                <Link to={item.href!} onClick={onNavigate}>
                  <item.icon className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            key={item.label}
            variant="ghost"
            className={`w-full justify-start gap-3 h-10 text-sm font-medium ${
              currentPath === item.href
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            asChild
          >
            <Link to={item.href!} onClick={onNavigate}>
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold bg-primary/10 text-primary border-0">
                  {item.badge}
                </Badge>
              )}
            </Link>
          </Button>
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
          <Button
            key={child.href}
            variant="ghost"
            size="sm"
            className={`w-full justify-start pl-11 h-9 text-sm min-w-0 ${
              currentPath === child.href
                ? "text-primary font-medium bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
            asChild
          >
            <Link to={child.href} onClick={onNavigate}>
              <span className={`mr-2 h-1.5 w-1.5 shrink-0 rounded-full ${currentPath === child.href ? "bg-primary" : "bg-muted-foreground/30"}`} />
              <span className="truncate">{child.label}</span>
            </Link>
          </Button>
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
  const currentUser = useAuthStore((state) => state.user);
  const avatarSignedUrl = useAvatarSignedUrl(currentUser?.avatarUrl);
  const avatarSrc = avatarSignedUrl || myboxLogo;
  const displayName = currentUser?.name || "MyBox Brasil";
  const initials = (displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "MB");

  const filteredMenuItems = useMemo(
    () => getFilteredMenuItems(activeProfileType),
    [activeProfileType]
  );

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
            asChild
          >
            <Link to="/">
              <LogOut className="h-4 w-4" />
              Sair
            </Link>
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

              <Link to="/dashboard/perfil" className="ml-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
              </Link>
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
              <SearchMenu menuItems={filteredMenuItems} />
              <ThemeToggle className="h-9 w-9 text-muted-foreground" />
              {activeProfileType === "locatario" && <CartButton />}
              <NotificacoesPopover />

              <Separator orientation="vertical" className="h-6" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-muted">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={avatarSrc} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left sm:block">
                      <p className="text-xs font-medium text-foreground leading-tight max-w-[140px] truncate">{displayName}</p>
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
                  <DropdownMenuItem className="text-xs" asChild>
                    <Link to="/dashboard/perfil">Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs" asChild>
                    <Link to="/dashboard/configuracoes">Configurações</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" asChild>
                    <Link to="/selecionar-perfil">
                      <RefreshCw className="h-3.5 w-3.5 mr-2" />
                      Trocar perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs text-destructive" asChild>
                    <Link to="/">
                      <LogOut className="h-3.5 w-3.5 mr-2" />
                      Sair
                    </Link>
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
