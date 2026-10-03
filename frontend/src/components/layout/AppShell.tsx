import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { CandlestickChart, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NAV_ITEMS } from "@/components/layout/navItems";
import { FormError } from "@/components/form/FormFeedback";
import { useSession } from "@/hooks/useSession";
import { logout } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const Brand = () => (
  <Link to={ROUTES.dashboard} className="flex items-center gap-2 font-semibold">
    <CandlestickChart className="size-5" />
    <span>FXTrax</span>
  </Link>
);

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav className="grid gap-1">
      {NAV_ITEMS.map(({ name, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            to={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              active && "bg-accent font-medium text-accent-foreground"
            )}
          >
            <Icon className="size-4" />
            {name}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  async function handleLogout() {
    // the login page is still the right place to land if this fails, the cookie expires on its own
    await logout().catch(() => undefined);
    // leave the signed-in pages before clearing, so nothing refetches, then drop this user's data
    await navigate(ROUTES.login);
    queryClient.clear();
  }
  return (
    <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground" onClick={handleLogout}>
      <LogOut />
      Log out
    </Button>
  );
}

// signed-in layout: fixed sidebar on desktop, a top bar with a slide-out menu on mobile. Every page
// inside it is guarded by the session cookie and only renders once the user is known
export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useSession();
  const signedOut = session.isSuccess && session.data === null;

  useEffect(() => {
    if (signedOut) navigate(ROUTES.login, { replace: true });
  }, [signedOut, navigate]);

  if (session.isError) {
    return (
      <div className="mx-auto max-w-md p-8">
        <FormError message="Unable to reach the server. Please try again." />
      </div>
    );
  }
  if (!session.data) return null;

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r bg-card md:flex">
        <div className="flex h-14 items-center border-b px-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <div className="flex items-center gap-1 border-t p-3">
          <LogoutButton />
          <ThemeToggle />
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-sm md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-64 flex-col p-0">
            <div className="flex h-14 items-center border-b px-5">
              <SheetTitle asChild>
                <div>
                  <Brand />
                </div>
              </SheetTitle>
            </div>
            <div className="flex-1 p-3">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t p-3">
              <LogoutButton />
            </div>
          </SheetContent>
        </Sheet>
        <Brand />
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <main className="md:pl-60">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
