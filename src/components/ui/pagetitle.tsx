import { useEffect } from "react";

interface PageTitleProps {
  title: string;
}

export const PageTitle = ({ title }: PageTitleProps) => {
  useEffect(() => {
    document.title = `${title} | UgoApp`;
  }, [title]);

  return null;
};
