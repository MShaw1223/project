import { LayoutDashboard, LucideIcon, PenLine, Table2, UserRound, Wallet } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard },
  { name: "New Trade", href: ROUTES.newTrade, icon: PenLine },
  { name: "Trades", href: ROUTES.trades, icon: Table2 },
  { name: "Accounts", href: ROUTES.accounts, icon: Wallet },
  { name: "Profile", href: ROUTES.profile, icon: UserRound },
];
