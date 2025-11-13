interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen bg-linear-to-tl from-secondary to-primary">
      {children}
    </div>
  );
}
