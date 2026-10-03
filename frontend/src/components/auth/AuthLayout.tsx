import { ReactNode } from "react";
import { CandlestickChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

// centred card used by the signed-out pages
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-14 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2 font-semibold">
          <CandlestickChart className="size-5" />
          FXTrax
        </div>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
          {footer && <p className="text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
