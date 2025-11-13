import { Bell, Menu, X } from "lucide-react";
import type { FC } from "react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  icon: string;
}

const TopBar: FC<TopBarProps> = ({ isSidebarOpen, setIsSidebarOpen, icon }) => {
  return (
    <header className="z-10 flex h-16 items-center justify-between bg-[#002346] px-5 text-white shadow-md">
      {/* Menu (aparece em telas pequenas) */}
      <div className="flex items-center gap-5">
        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          size="icon"
          variant="ghost"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
        <div className="flex h-12">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-gray-700">
            <img
              alt="Avatar"
              className="h-full w-full object-cover"
              src={icon}
            />
          </div>
          <div
            className={
              "ml-3 opacity-100 transition-opacity duration-300 ease-in-out"
            }
          >
            <p className="whitespace-nowrap font-semibold text-base">
              João Silva
            </p>
            <p className="whitespace-nowrap text-gray-400 text-sm">
              CEO. UgoApp
            </p>
          </div>
        </div>
      </div>
      {/* Avatar e notificações */}
      <div className="flex items-center gap-4">
        <Bell className="h-6 w-6 text-gray-200" />
      </div>
    </header>
  );
};

export default TopBar;
