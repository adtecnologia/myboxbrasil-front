import { Home, LogOut, MapPin, Settings, Users } from "lucide-react";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/stores/use-auth";

import ItemsSidebar from "./sidebaritems";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ isSidebarOpen }) => {
  const navigate = useNavigate();

  // stores
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside
      className={`fixed top-0 left-0 z-20 flex h-full flex-col bg-gradient-to-b from-[#002346] to-[#25003D] py-4 text-white transition-all duration-300 ease-in-out md:relative ${isSidebarOpen ? "w-64" : "w-0 md:w-20"} overflow-hidden`}
    >
      {/* Navegação */}
      <nav className="flex-1 overflow-hidden overflow-y-auto px-4">
        <ul className="space-y-1">
          <ItemsSidebar
            Icon={Home}
            title="Dashboard"
            {...{ isSidebarOpen }}
            route="/dashboard"
          />

          <ItemsSidebar
            Icon={MapPin}
            route="/cidades"
            title="Cidades"
            {...{ isSidebarOpen }}
          />

          <ItemsSidebar
            Icon={Users}
            title="Cadastros"
            {...{ isSidebarOpen }}
            options={[
              { name: "Usuários", route: "/usuarios" },
              { name: "Motoristas", route: "/motoristas" },
              { name: "Passageiros", route: "/passageiros" },
            ]}
          />

          <ItemsSidebar
            Icon={Settings}
            title="Gerenciamento"
            {...{ isSidebarOpen }}
            options={[
              { name: "Categorias", route: "/categorias" },
              { name: "Opcionais", route: "/opcionais" },
              { name: "Formas de pagamento", route: "/formas-de-pagamento" },
            ]}
          />
        </ul>
      </nav>

      {/* Logout */}
      <div className="bottom-4 left-0 mt-2 w-full px-4">
        <Button
          className={`flex w-full items-center gap-2 px-2 ${
            isSidebarOpen ? "justify-start" : "justify-center"
          } text-left text-red-500 hover:bg-red-600 hover:text-white`}
          onClick={() => {
            logout();
            navigate("/");
          }}
          size="icon"
          variant="ghost"
        >
          <LogOut />
          {isSidebarOpen && <span className="text-base">Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
