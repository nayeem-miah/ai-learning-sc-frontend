"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMeQuery } from "@/lib/feature/auth/authApi";
import { useGetAllCoursesQuery } from "@/lib/feature/courses/coursesApi";
import { socket } from "@/lib/socket";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function DashboardHeader() {
  const router = useRouter();
  const { data: userData, isLoading } = useGetMeQuery();
  const { data: coursesData, refetch: refetchCourses } = useGetAllCoursesQuery(
    undefined,
    {
      skip: isLoading || !userData?.data || userData.data.role !== "ADMIN",
    },
  );

  const user = userData?.data;

  // Socket.IO implementation
  useEffect(() => {
    if (user) {
      socket.connect();

      socket.on(
        "course-generated",
        (data: { message: string; courseId: string }) => {
          toast.success(data.message, {
            description: "Click here to view and publish.",
            action: {
              label: "View",
              onClick: () =>
                router.push(`/admin/courses/${data.courseId}/publish`),
            },
          });
          refetchCourses();
        },
      );

      return () => {
        socket.off("course-generated");
        socket.disconnect();
      };
    }
  }, [user, refetchCourses, router]);

  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem("read_notifications");
    if (stored) {
      try {
        setReadNotifications(JSON.parse(stored));
      } catch (e) { }
    }
  }, []);

  const unreadCourses = useMemo(() => {
    // Filter to show only unpublished AND UNREAD notifications
    return (
      coursesData?.data
        ?.filter(
          (c: any) => !c.isPublished && !readNotifications.includes(c.id),
        )
        .slice(0, 5) || []
    );
  }, [coursesData, readNotifications]);

  const hasUnread = unreadCourses.length > 0;

  const handleMarkAsRead = (courseId: string) => {
    if (!readNotifications.includes(courseId)) {
      const newRead = [...readNotifications, courseId];
      setReadNotifications(newRead);
      localStorage.setItem("read_notifications", JSON.stringify(newRead));
    }
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Admin";
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "A";

  if (isLoading) {
    return (
      <header className="bg-[#1A1A1A] border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex animate-pulse items-center justify-between">
          <div className="h-8 w-48 bg-gray-700 rounded ml-16" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-700 rounded-full" />
            <div className="h-4 w-24 bg-gray-700 rounded" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-[#1A1A1A] border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Greeting + Date/Time */}
        {/* Left: Greeting */}
        <div className="flex-1 shrink-0">
          <h1 className="text-xl font-bold ml-16 text-white truncate">
            Welcome back,{" "}
            <span className="text-[#D0AD6B]">
              {user?.firstName || "Admin"}!
            </span>
          </h1>
        </div>

        {/* Right: Notifications + Avatar */}
        <div className="flex items-center gap-4">
          {user?.role === "ADMIN" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Bell className="w-5 h-5 text-gray-300" />
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border border-[#1A1A1A] text-[10px] font-bold flex items-center justify-center text-white">
                      {unreadCourses.length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 bg-[#1A1A1A] border-gray-800 text-white"
              >
                <div className="p-3 border-b border-gray-800">
                  <h3 className="font-semibold text-[#D0AD6B]">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {unreadCourses.length > 0 ? (
                    unreadCourses.map((course) => {
                      return (
                        <DropdownMenuItem
                          key={course.id}
                          className="flex flex-col items-start p-3 border-b border-gray-800/50 cursor-pointer focus:bg-[#D0AD6B]/10 transition-colors bg-[#D0AD6B]/5 hover:bg-[#D0AD6B]/10 border-l-2 border-l-[#D0AD6B]"
                          onClick={() => {
                            handleMarkAsRead(course.id);
                            router.push(`/admin/courses/${course.id}/publish`);
                          }}
                        >
                          <div className="flex justify-between w-full items-center mb-1">
                            <p className="font-semibold text-sm line-clamp-1 text-[#D0AD6B]">
                              {course.courseName || course.subject} Generated!
                            </p>
                            <span className="w-2 h-2 rounded-full bg-[#D0AD6B] flex-shrink-0"></span>
                          </div>
                          <p className="text-xs mt-1 line-clamp-2 text-gray-400">
                            This course has been successfully generated by AI.
                            Click to publish.
                          </p>
                        </DropdownMenuItem>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No new notifications
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Avatar + Info */}
          <div className="flex items-center gap-3">
            {/* <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-[#D0AD6B]">{fullName}</p>
              <p className="text-xs font-semibold text-[#D0AD6B]">
                {user?.role}
              </p>
            </div> */}
            <Avatar className="h-8 w-8 ring-2 ring-[#314B79] hidden sm:block ring-offset-2">
              <AvatarImage
                src={user?.profilePicture || ""}
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-[#314B79] text-white font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[#D0AD6B]">{fullName}</p>
              <p className="text-xs font-semibold text-[#D0AD6B]">
                Role: {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
