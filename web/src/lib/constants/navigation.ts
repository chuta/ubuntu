import {
  LayoutDashboard,
  GitBranch,
  Building2,
  Landmark,
  Handshake,
  FileText,
  Calendar,
  Layers,
  BookOpen,
  Settings,
  TrendingUp,
  FileBarChart,
  Scale,
  Network,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

export const mainNavigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pipeline", href: "/pipeline", icon: GitBranch },
  { label: "Governments", href: "/governments", icon: Landmark },
  { label: "Accounts", href: "/accounts", icon: Building2 },
  { label: "Tokenization", href: "/tokenization", icon: Layers },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Regulatory Affairs", href: "/regulatory", icon: Scale },
  { label: "Influence Graph", href: "/influence", icon: Network },
  { label: "Partnerships", href: "/partnerships", icon: Handshake },
  { label: "Knowledge Vault", href: "/knowledge", icon: BookOpen },
];

export const secondaryNavigation: NavItem[] = [
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Forecast", href: "/forecast", icon: TrendingUp },
  { label: "Settings", href: "/settings", icon: Settings },
];
