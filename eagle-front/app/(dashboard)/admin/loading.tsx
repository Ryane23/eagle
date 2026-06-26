import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminDashboardLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Header Skeleton */}
      <div className="border-b p-4">
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Alert */}
        <Skeleton className="h-16 w-full rounded-lg" />

        {/* Stats Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-2 overflow-x-auto">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="rounded-xl flex-shrink-0 min-w-[180px]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-12 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-7 w-28" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-3 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

