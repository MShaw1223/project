import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description: string;
  loading?: boolean;
  // shown in place of the chart when there is nothing to plot
  empty?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ChartCard({ title, description, loading, empty, className, children }: ChartCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : empty ? (
          <div className="flex h-[240px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            {empty}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
