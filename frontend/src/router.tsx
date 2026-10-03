import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet, RouteObject } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import LoginPage from "@/pages/index";
import NotFoundPage from "@/pages/notFound";
import SignupPage from "@/pages/signup";
import { ROUTES } from "@/lib/routes";

// the signed-in pages load on demand, so the login page doesn't ship the charts and tables
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const TradeEntryPage = lazy(() => import("@/pages/trades/new"));
const TradesPage = lazy(() => import("@/pages/trades/index"));
const AccountsPage = lazy(() => import("@/pages/accounts"));
const ProfilePage = lazy(() => import("@/pages/profile"));

// the old page paths, so bookmarks keep working. Paths match case-insensitively, so the old /signUp
// already lands on /signup
const LEGACY_PATHS = {
  "/home": ROUTES.dashboard,
  "/Trade-Entry": ROUTES.newTrade,
  "/entry-management": ROUTES.trades,
  "/account-management": ROUTES.accounts,
  "/users": ROUTES.profile,
};

export const routes: RouteObject[] = [
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.signup, element: <SignupPage /> },
  {
    // every other page renders inside the app shell, which guards it with the session
    element: (
      <AppShell>
        <Suspense>
          <Outlet />
        </Suspense>
      </AppShell>
    ),
    children: [
      { path: ROUTES.dashboard, element: <DashboardPage /> },
      { path: ROUTES.newTrade, element: <TradeEntryPage /> },
      { path: ROUTES.trades, element: <TradesPage /> },
      { path: ROUTES.accounts, element: <AccountsPage /> },
      { path: ROUTES.profile, element: <ProfilePage /> },
    ],
  },
  ...Object.entries(LEGACY_PATHS).map(([path, to]) => ({ path, element: <Navigate to={to} replace /> })),
  { path: "*", element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routes);
