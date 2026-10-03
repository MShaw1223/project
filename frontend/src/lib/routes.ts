export const ROUTES = {
  login: "/",
  signup: "/signup",
  dashboard: "/dashboard",
  newTrade: "/trades/new",
  trades: "/trades",
  accounts: "/accounts",
  profile: "/profile",
} as const;

// render without the app shell and are reachable while signed out
export const PUBLIC_ROUTES: string[] = [ROUTES.login, ROUTES.signup];
