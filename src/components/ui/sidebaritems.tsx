import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";

interface ItemsSidebarProps {
  Icon: LucideIcon;
  title: string;
  isSidebarOpen: boolean;
  route?: string;
  options?: {
    route: string;
    name: string;
  }[];
}

export default function ItemsSidebar({
  Icon,
  title,
  isSidebarOpen,
  options,
  route,
}: ItemsSidebarProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const categoryBtnRef = useRef<HTMLButtonElement | null>(null);
  const [submenuPos, setSubmenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (!isSidebarOpen) {
      setIsOpen(false);
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isOpen && categoryBtnRef.current) {
      const rect = categoryBtnRef.current.getBoundingClientRect();
      setSubmenuPos({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  }, [isOpen, isSidebarOpen]);

  return (
    <>
      <li>
        <Button
          className={"flex w-full items-center gap-3 px-2 text-left"}
          onClick={() => (options ? setIsOpen(!isOpen) : navigate(route!))}
          ref={categoryBtnRef}
          size="icon"
          variant="ghost"
        >
          <div
            className={`flex w-10 flex-1 items-center ${
              isSidebarOpen ? "justify-start" : "justify-center"
            } gap-3`}
          >
            <Icon className="h-5 w-5 min-w-5" />
            {isSidebarOpen && (
              <span className="overflow-hidden overflow-ellipsis text-base">
                {title}
              </span>
            )}
          </div>

          {options &&
            isSidebarOpen &&
            (isOpen ? (
              <ChevronDown className="h-5 w-5 min-w-5" />
            ) : (
              <ChevronRight className="h-5 w-5 min-w-5" />
            ))}
        </Button>
      </li>

      <li className="relative">
        {isSidebarOpen && (
          <ul
            className={`mb-2 ml-8 flex flex-col gap-2 overflow-hidden transition-all duration-300 ${
              isOpen ? "max-h-100 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {options?.map((item) => (
              <li key={item.route}>
                <Button
                  className="w-full justify-start px-2 text-sm hover:bg-white hover:text-black"
                  onClick={() => navigate(item.route)}
                  size="icon"
                  variant="ghost"
                >
                  {item.name}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </li>
      {!isSidebarOpen && isOpen && (
        <div
          className="fixed z-[9999] flex flex-col rounded-lg border border-gray-700 bg-gradient-to-b from-[#002346] to-[#25003D] shadow-lg"
          style={{
            top: submenuPos.top,
            left: submenuPos.left,
          }}
        >
          {options?.map((item) => (
            <Button
              className="w-full justify-start px-4 py-2 text-sm hover:bg-white hover:text-black"
              key={item.route}
              onClick={() => {
                navigate(item.route);
                setIsOpen(false);
              }}
              size="icon"
              variant="ghost"
            >
              {item.name}
            </Button>
          ))}
        </div>
      )}
    </>
  );
}
