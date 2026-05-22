interface PageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-primary to-[hsl(155,45%,40%)] p-5 sm:p-6 text-primary-foreground">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
          <p className="text-sm text-white/75">{subtitle}</p>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
