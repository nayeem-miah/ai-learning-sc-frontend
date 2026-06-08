"use client";

import useGreeting from "@/hooks/useGreeting";
import { useGetStudentHomeDataQuery } from "@/lib/feature/student/studenthome/studentHomeApi";
import { IMyCourse, IPendingTask } from "@/types/student/getStudentHome";
import {
  BookOpen,
  ChevronRight,
  Clock,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useJoinAttendanceMutation } from "@/lib/feature/attendance/attendanceApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const StudentDashboard = () => {
  const { data, isLoading } = useGetStudentHomeDataQuery(undefined);

  const dashboardData = data?.data;
  const studentInfo = dashboardData?.studentInfo;
  const nextClass = dashboardData?.nextClass;
  const pendingTasks = dashboardData?.pendingTasks || [];
  const myCourses = dashboardData?.myCourses || [];
  const overallMastery = dashboardData?.overallMastery ?? 0;
  
  const router = useRouter();
  const [joinAttendance, { isLoading: isJoining }] = useJoinAttendanceMutation();

  //   const hour = new Date().getHours();
  const greeting = useGreeting();
  //   const greeting =
  //     hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (isLoading) {
    return (
      <div className="p-8 text-white">
        <div className="animate-pulse space-y-8">
          <div className="space-y-3">
            <div className="h-10 w-80 rounded bg-[#1e1e1e]" />
            <div className="h-5 w-64 rounded bg-[#1e1e1e]" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <div className="h-64 rounded-2xl border border-gray-800 bg-[#1e1e1e]" />
              <div className="h-80 rounded-2xl border border-gray-800 bg-[#1e1e1e]" />
              <div className="h-80 rounded-2xl border border-gray-800 bg-[#1e1e1e]" />
            </div>
            <div className="h-64 rounded-2xl border border-gray-800 bg-[#1e1e1e]" />
          </div>
        </div>
      </div>
    );
  }

  const handleJoinClass = async () => {
    if (!nextClass) return;

    try {
      const response = await joinAttendance({
        courseId: nextClass.courseId,
        moduleId: nextClass.moduleId,
      }).unwrap();

      if (response.success) {
        toast.success(response.message || "Joined class successfully");
        router.push(`/student/courses/${nextClass.courseId}/lesson/${nextClass.moduleId}`);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to join class");
      // Still navigate if it's already joined or error but we want to allow entry?
      // For now, let's navigate even on error if the user wants to start lesson
      router.push(`/student/courses/${nextClass.courseId}/lesson/${nextClass.moduleId}`);
    }
  };

  return (
    <div className="p-8 text-white">
      {/* Welcome Header */}
      <header className="mb-10">
        <h1 className="mb-2 text-4xl font-bold">
          {/* {greeting}, {studentInfo?.name || "Student"} ! */}
          Hi {studentInfo?.name || "Student"}, {greeting && greeting + "!"}
        </h1>
        <p className="text-lg text-gray-400">
          Ready to continue your learning journey?
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-8 lg:col-span-2">
          {/* Next Class Card */}
          <section className="rounded-2xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-xl bg-[#2a261d] p-3">
                <BookOpen className="text-[#c5a46d]" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Next Class</h2>
                <p className="text-sm text-gray-500">
                  Join your next scheduled class
                </p>
              </div>
            </div>

            {nextClass ? (
              <>
                <div className="relative mb-6 overflow-hidden rounded-xl bg-[#2a2a2a] p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <span className="text-sm text-gray-400">
                      {nextClass.subject}
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-black">
                      Today
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-semibold">
                    {nextClass.moduleTitle}
                  </h3>

                  <p className="mb-3 text-sm text-[#c5a46d]">
                    {nextClass.courseName}
                  </p>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} />
                    <span className="text-sm">
                      {nextClass.startTime} - {nextClass.endTime}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handleJoinClass}
                  disabled={isJoining}
                  className="w-full rounded-md bg-[#c5a46d] py-4 font-medium text-black transition-all hover:bg-[#b3935d] active:scale-[0.98] disabled:opacity-50"
                >
                  {isJoining ? "Joining..." : "Start Lesson"}
                </button>
              </>
            ) : (
              <div className="rounded-xl border border-gray-800 bg-[#2a2a2a] p-5 text-sm text-gray-400">
                No upcoming class found.
              </div>
            )}
          </section>

          {/* Pending Tasks */}
          <section className="rounded-2xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold">Pending Tasks</h2>

            <div className="space-y-4">
              {pendingTasks.length > 0 ? (
                pendingTasks.map((task: IPendingTask) => (
                  <div
                    key={`${task.courseId}-${task.moduleId}`}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-gray-800 p-5 transition-colors hover:bg-[#252525]"
                  >
                    <div className="space-y-1">
                      <span className="rounded border border-[#c5a46d]/20 bg-[#2a261d] px-2 py-0.5 text-[10px] font-bold uppercase text-[#c5a46d]">
                        {task.type}
                      </span>

                      <h4 className="text-lg font-semibold">
                        {task.moduleTitle}
                      </h4>

                      <p className="text-sm text-gray-500">
                        {task.subject} • Module {task.moduleNumber}
                      </p>

                      <p className="text-xs text-gray-600">
                        {task.startTime} - {task.endTime}
                      </p>
                    </div>

                    <ChevronRight className="text-gray-600 transition-colors group-hover:text-white" />
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-gray-800 bg-[#252525] p-5 text-sm text-gray-400">
                  No pending tasks available.
                </div>
              )}
            </div>
          </section>

          {/* My Courses */}
          <section className="rounded-2xl border border-gray-800 bg-[#1e1e1e] p-6 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold">My Courses</h2>

            <div className="space-y-6">
              {myCourses.length > 0 ? (
                myCourses.map((course: IMyCourse) => (
                  <div
                    key={course.courseId}
                    className="rounded-xl border border-gray-800 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{course.courseName}</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {course.subject}
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-gray-600" />
                    </div>

                    <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        {course.progressPercentage}% Complete
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        {course.mastery}% Mastery
                      </div>
                    </div>

                    <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                      <div
                        className="h-full bg-[#c5a46d]"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Mastery Required</span>
                      <span>{course.masteryRequired}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-gray-800 bg-[#252525] p-5 text-sm text-gray-400">
                  No courses found.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Progress */}
        <div className="lg:col-span-1">
          <section className="sticky top-8 rounded-2xl border border-gray-800 bg-[#1e1e1e] p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-[#2a261d] p-3">
                <GraduationCap className="text-[#c5a46d]" size={22} />
              </div>
              <div>
                <h2 className="font-medium text-gray-300">Your Progress</h2>
                <p className="text-sm text-gray-500">Overall learning status</p>
              </div>
            </div>

            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-6xl font-bold">{overallMastery}%</span>
              <span className="text-sm uppercase tracking-wider text-gray-500">
                Overall Mastery
              </span>
            </div>

            <div className="mb-6 h-2 w-full rounded-full bg-gray-800">
              <div
                className="h-full bg-[#c5a46d]"
                style={{ width: `${overallMastery}%` }}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Grade Level</span>
                <span className="font-medium text-gray-300">
                  {studentInfo?.gradeLevel || "N/A"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Student Name</span>
                <span className="font-medium text-gray-300">
                  {studentInfo?.name || "N/A"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="max-w-45 truncate font-medium text-gray-300">
                  {studentInfo?.email || "N/A"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
