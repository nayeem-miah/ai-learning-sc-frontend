"use client";

import {
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/lib/feature/auth/authApi";
import { logout } from "@/lib/slice/user/userSlice";
import { cn } from "@/utils/utils";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import Logo from "../common/Logo";

// ── Role-specific menu configuration ─────────────────────────────────────
type MenuItem = {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  href: string;
};

const getMenuItems = (role: "admin" | "teacher" | "student"): MenuItem[] => {
  // Common base (Dashboard is always first)
  const base = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: `/${role}/dashboard`,
    },
  ];

  if (role === "admin") {
    return [
      ...base,
      { title: "Courses", icon: BookOpen, href: "/admin/courses" },
      { title: "AI Generator", icon: Brain, href: "/admin/ai-generator" },
      { title: "Students", icon: Users, href: "/admin/students" },
      { title: "Settings", icon: Settings, href: "/admin/settings" },
    ];
  }

  if (role === "teacher") {
    return [
      ...base,
      { title: "My Courses", icon: BookOpen, href: "/teacher/courses" }, // or /teacher/my-courses
      { title: "Students", icon: Users, href: "/teacher/students" },
      { title: "Profile", icon: User, href: "/teacher/profile" },
    ];
  }

  // Student default
  return [
    ...base,
    { title: "My Courses", icon: BookOpen, href: "/student/courses" },
    { title: "Progress", icon: BarChart3, href: "/student/progress" },
    { title: "Attendance", icon: CalendarDays, href: "/student/attendance" },
    { title: "Profile", icon: User, href: "/student/profile" },
  ];
};

interface DashboardSidebarProps {
  role: "admin" | "teacher" | "student" | string; // fallback to string for safety, but ideally should be one of the three
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const menuItems = getMenuItems(role as "admin" | "teacher" | "student");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await logoutApi().unwrap();
      if (response.success) {
        dispatch(logout());
        setMobileMenuOpen(false);
        toast.success(response.message || "Logged out successfully!");
        window.location.href = "/login";
      }
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast.error(error?.data?.message || "Failed to log out");
    }
  };

  const sidebarContent = (
    <>
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 bg-[#1A1A1A]">
        {!collapsed && (
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            window.innerWidth >= 1024
              ? setCollapsed(!collapsed)
              : setMobileMenuOpen(false)
          }
          className="h-9 w-9 text-[#D0AD6B]"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 bg-[#1A1A1A]">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-[#D0AD6B] text-gray-900 shadow-md"
                      : "text-[#D0AD6B] hover:bg-gray-800/50 hover:text-white",
                    collapsed && "justify-center px-3",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive && "text-gray-900",
                    )}
                  />
                  {!collapsed && (
                    <span className="text-base">{item.title}</span>
                  )}

                  {/* Tooltip on collapse */}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                      {item.title}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t bg-[#1A1A1A] border-gray-800">
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="ghost"
          className={cn(
            "w-full justify-center cursor-pointer gap-3 text-red-500 hover:text-red-400 hover:bg-red-950/30 text-sm font-medium",
            collapsed && "justify-center px-3",
          )}
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
          {!collapsed && (
            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <Button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#1A1A1A] p-3 rounded-lg hover:bg-gray-800 transition"
      >
        <Menu className="h-6 w-6 text-[#D0AD6B]" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col shadow-lg transition-all duration-300 lg:relative lg:translate-x-0 bg-[#0f0f0f]",
          collapsed ? "w-20" : "w-72",
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
