"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useGetMe } from "@/hooks/useGetMe";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useGetMe();
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.user?.role) {
      const userRole = user.user.role.toLowerCase() as "student" | "teacher" | "admin";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole(userRole);
      setIsLoading(false);
    } else if (user === null) {
      // User is not authenticated
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f0f] text-white">
      <DashboardSidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}