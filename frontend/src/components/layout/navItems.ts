import { LayoutDashboard, LucideIcon, PenLine, Table2, UserRound, Wallet } from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/home", icon: LayoutDashboard },
  { name: "Trade Entry", href: "/Trade-Entry", icon: PenLine },
  { name: "Manage Entries", href: "/entry-management", icon: Table2 },
  { name: "Manage Accounts", href: "/account-management", icon: Wallet },
  { name: "Profile", href: "/users", icon: UserRound },
];

// routes that render without the app shell, they are reachable while signed out
export const PUBLIC_ROUTES = ["/", "/signUp"];
