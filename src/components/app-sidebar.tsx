import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, FolderKanban, FileStack, ImageIcon, CheckCircle2,
  Users, Bell, Shield, BarChart3, MessageSquare, FileQuestion, FileCheck2,
  Building2, LogOut, Plus, ChevronsUpDown, Settings, UserCircle2, LifeBuoy, Droplets,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type NavItem = {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  badgeKey?: "unread" | "openIssues" | "pendingApprovals";
};

type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "نظرة عامة",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "لوحة القيادة" },
      { to: "/analytics", icon: BarChart3, label: "التحليلات والتقارير" },
    ],
  },
  {
    label: "إدارة المشاريع",
    items: [
      { to: "/projects", icon: FolderKanban, label: "المشاريع" },
      { to: "/files", icon: FileStack, label: "الملفات والمستندات" },
      { to: "/technical-evidence", icon: FileCheck2, label: "الأدلة الفنية" },
      { to: "/plumbing-system", icon: Droplets, label: "نظام السباكة" },
      { to: "/field-analysis", icon: ImageIcon, label: "التحليل الميداني AI" },
    ],
  },
  {
    label: "التعاون والمتابعة",
    items: [
      { to: "/approvals", icon: CheckCircle2, label: "الموافقات", badgeKey: "pendingApprovals" },
      { to: "/issues", icon: MessageSquare, label: "القضايا", badgeKey: "openIssues" },
      { to: "/rfis", icon: FileQuestion, label: "طلبات المعلومات" },
      { to: "/submittals", icon: FileCheck2, label: "المعتمدات" },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { to: "/members", icon: Users, label: "الأعضاء والصلاحيات" },
      { to: "/activity", icon: Shield, label: "سجل النشاط" },
      { to: "/notifications", icon: Bell, label: "الإشعارات", badgeKey: "unread" },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, profile, roles, signOut } = useAuth();

  const { data: counts } = useQuery({
    queryKey: ["sidebar-counts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [unread, openIssues, pendingApprovals] = await Promise.all([
        supabase.from("notifications").select("*", { count: "exact", head: true })
          .eq("user_id", user!.id).eq("read", false),
        supabase.from("issues").select("*", { count: "exact", head: true })
          .in("status", ["open", "in_progress"]),
        supabase.from("approvals").select("*", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);
      return {
        unread: unread.count ?? 0,
        openIssues: openIssues.count ?? 0,
        pendingApprovals: pendingApprovals.count ?? 0,
      };
    },
  });

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "مستخدم";
  const initials = displayName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const roleLabel = roles.includes("admin") ? "مسؤول النظام"
    : roles.includes("owner") ? "مالك"
    : roles.includes("editor") ? "محرر"
    : "مشاهد";

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  return (
    <Sidebar side="right" collapsible="icon" className="border-l border-sidebar-border">
      {/* Brand */}
      <SidebarHeader className="bg-gradient-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-3 px-1 py-1.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-elevated ring-1 ring-white/10">
            <Building2 className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold tracking-tight">bim.alazab</div>
              <div className="flex items-center gap-1.5 text-[10px] text-sidebar-foreground/60">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                <span className="truncate">منصة BIM • متصل</span>
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            asChild
            size="sm"
            className="mt-1 h-9 w-full justify-start gap-2 rounded-lg bg-primary/95 font-semibold text-primary-foreground shadow-elevated hover:bg-primary"
          >
            <Link to="/projects/new">
              <Plus className="h-4 w-4" />
              مشروع جديد
            </Link>
          </Button>
        )}
        {collapsed && (
          <Button asChild size="icon" className="mt-1 h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/projects/new" aria-label="مشروع جديد">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </SidebarHeader>

      <SidebarSeparator className="bg-sidebar-border" />

      <SidebarContent className="bg-gradient-sidebar text-sidebar-foreground">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  const badgeVal = item.badgeKey ? counts?.[item.badgeKey] ?? 0 : 0;
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className={`group/btn relative h-10 rounded-lg text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold data-[active=true]:shadow-[inset_3px_0_0_0_var(--color-primary)]`}
                      >
                        <Link to={item.to}>
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {badgeVal > 0 && (
                        <SidebarMenuBadge
                          className={
                            item.badgeKey === "unread"
                              ? "bg-destructive text-destructive-foreground"
                              : item.badgeKey === "openIssues"
                              ? "bg-warning text-warning-foreground"
                              : "bg-primary text-primary-foreground"
                          }
                        >
                          {badgeVal > 99 ? "99+" : badgeVal}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="bg-gradient-sidebar text-sidebar-foreground">
        <SidebarSeparator className="bg-sidebar-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex w-full items-center gap-2 rounded-lg p-2 text-right transition-colors hover:bg-sidebar-accent/60 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <Avatar className="h-9 w-9 ring-2 ring-sidebar-border">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1 text-right">
                    <div className="truncate text-sm font-semibold">{displayName}</div>
                    <div className="truncate text-[10px] text-sidebar-foreground/60">{roleLabel}</div>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-foreground/60" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="font-semibold">{displayName}</div>
              <div className="truncate text-xs font-normal text-muted-foreground">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/profile"><UserCircle2 className="ml-2 h-4 w-4" />الملف الشخصي</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/settings"><Settings className="ml-2 h-4 w-4" />الإعدادات</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/help"><LifeBuoy className="ml-2 h-4 w-4" />المساعدة والدعم</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="ml-2 h-4 w-4" />تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
