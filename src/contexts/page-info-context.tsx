/** biome-ignore-all lint/nursery/noShadow: ignorar */
import type React from "react";
import { createContext, useEffect, useState } from "react";

export interface BreadcrumbInfo {
  label: string;
  path?: string;
}

interface SetPageInfoProps {
  title: string;
  pageTitle?: string;
  pageDescription?: string;
  showPageTitle?: boolean;
  breadcrumbs?: BreadcrumbInfo[];
}

export interface PageInfoContextType {
  title: string;
  pageTitle: string;
  pageDescription: string | null;
  showPageTitle: boolean;
  breadcrumbs: BreadcrumbInfo[];
  setPageInfo: (data: SetPageInfoProps) => void;
}

const PageInfoContext = createContext<PageInfoContextType | undefined>(
  undefined
);

const TITLE_LAYOUT = "% | Ugo Admin";

const PageInfoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [title, setTitle] = useState<string>("");

  const [pageTitle, setPageTitle] = useState<string>("");
  const [pageDescription, setPageDescription] = useState<string | null>(null);
  const [showPageTitle, setShowPageTitle] = useState<boolean>(true);

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbInfo[]>([]);

  const setPageInfo = ({
    title,
    pageTitle = title,
    pageDescription,
    showPageTitle = true,
    breadcrumbs,
  }: SetPageInfoProps) => {
    setTitle(title);
    setPageTitle(pageTitle);
    setShowPageTitle(showPageTitle);
    if (pageDescription) {
      setPageDescription(pageDescription);
    }
    if (breadcrumbs) {
      setBreadcrumbs(breadcrumbs);
    }
  };

  useEffect(() => {
    if (title) {
      document.title = TITLE_LAYOUT.replace("%", title);
    }
  }, [title]);

  return (
    <PageInfoContext.Provider
      value={{
        title,
        pageTitle,
        pageDescription,
        showPageTitle,
        breadcrumbs,
        setPageInfo,
      }}
    >
      {children}
    </PageInfoContext.Provider>
  );
};

export { PageInfoProvider, PageInfoContext };
