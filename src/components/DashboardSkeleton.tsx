import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
  title?: string;
  subtitle?: string;
  statCount?: number;
  showCharts?: boolean;
  showList?: boolean;
}

export const DashboardSkeleton = ({
  title = "Carregando...",
  subtitle = "Buscando dados",
  statCount = 4,
  showCharts = true,
  showList = true,
}: DashboardSkeletonProps) => {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <PageHeader title={title} subtitle={subtitle} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: statCount }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 text-center space-y-3">
              <Skeleton className="mx-auto h-12 w-12 rounded-full" />
              <Skeleton className="mx-auto h-3 w-24" />
              <Skeleton className="mx-auto h-8 w-16" />
              <Skeleton className="mx-auto h-2 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[260px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showList && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-2 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSkeleton;