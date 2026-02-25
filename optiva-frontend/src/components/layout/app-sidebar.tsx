import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Scale,
  UtensilsCrossed,
  Dumbbell,
  Target,
  BookOpen,
  Cigarette,
  Wine,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/auth-context";

const mainNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Calendar", icon: CalendarDays, path: "/calendar" },
];

const trackingNav = [
  { label: "Weight", icon: Scale, path: "/weight" },
  { label: "Meals", icon: UtensilsCrossed, path: "/meals" },
  { label: "Workouts", icon: Dumbbell, path: "/workouts" },
  { label: "Habits", icon: Target, path: "/habits" },
  { label: "Journal", icon: BookOpen, path: "/journal" },
];

const substanceNav = [
  { label: "Smoking", icon: Cigarette, path: "/smoking" },
  { label: "Alcohol", icon: Wine, path: "/alcohol" },
];

const accountNav = [
  { label: "Profile", icon: User, path: "/profile" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const renderNavItems = (
    items: {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      path: string;
    }[],
  ) =>
    items.map((item) => (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton
          isActive={location.pathname === item.path}
          onClick={() => navigate(item.path)}
          className="transition-all duration-200"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img src="/mind.png" alt="Optivita" className="h-8 w-8 dark:invert" />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">Optivita</span>
            <span className="text-[10px] text-muted-foreground">
              Lifestyle Transformation
            </span>
          </div>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(mainNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tracking</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(trackingNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Substance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(substanceNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(accountNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Separator className="mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-xs">
            <span className="font-medium">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-muted-foreground truncate max-w-[140px]">
              {user?.email}
            </span>
          </div>
          <SidebarMenuButton
            onClick={handleLogout}
            className="h-8 w-8 p-0 flex items-center justify-center"
          >
            <LogOut className="h-4 w-4" />
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
