import { useState } from "react";
import { Link, Outlet } from "react-router-dom";

import { usePageInfo } from "@/hooks/use-page-info";

export default function AppLayout() {
  const { pageTitle, pageDescription, showPageTitle, breadcrumbs } =
    usePageInfo();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-neutral-100">
      <div className="flex flex-1 overflow-hidden">
        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto p-4 transition-all duration-300 ease-in-out">
          <div className="mb-4 space-y-2">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1 text-muted-foreground text-sm">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <span className="flex items-center gap-1" key={crumb.label}>
                      {!isLast && crumb.path ? (
                        <Link className="hover:underline" to={crumb.path}>
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-foreground">{crumb.label}</span>
                      )}

                      {!isLast && <span className="mx-1">/</span>}
                    </span>
                  );
                })}
              </nav>
            )}
            {showPageTitle && (
              <h1 className="font-bold text-3xl leading-none">{pageTitle}</h1>
            )}
            {pageDescription && <p>{pageDescription}</p>}
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
