"use client";

import { useState, useEffect } from "react";
import { useGetSingleStudentManagementQuery } from "@/lib/feature/courses/coursesApi";
import {
  Loader2, Info, BookOpen, TrendingUp, Brain,
  CalendarCheck, GraduationCap, User
} from "lucide-react";
import { useRouter } from "next/navigation";

interface StudentDetailProps {
  studentId: string;
}

export default function StudentDetail({ studentId }: StudentDetailProps) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "quiz-history">("overview");

  const { data: singleStudentResponse, isLoading: isDetailLoading } =
    useGetSingleStudentManagementQuery(studentId);
  const detailData = singleStudentResponse?.data;

  useEffect(() => {
    if (detailData?.enrolledCourses?.length && !selectedCourseId) {
      setSelectedCourseId(detailData.enrolledCourses[0].id);
    }
  }, [detailData, selectedCourseId]);

  const handleBackToList = () => router.push("/admin/students");

  if (!detailData && !isDetailLoading) {
    return (
      <div className="py-24 text-center bg-[#0D0D0D] min-h-screen text-white">
        <span className="flex items-center justify-center mb-4">
          <Info className="w-16 h-16 text-[#2D2D2D]" />
        </span>
        <p className="text-[#A0A0A0] font-bold">Student records not found.</p>
        <button onClick={handleBackToList} className="mt-4 text-[#D0AD6B] hover:underline">
          Back to list
        </button>
      </div>
    );
  }

  const currentCourse =
    detailData?.enrolledCourses.find((c: any) => c.id === selectedCourseId) ||
    detailData?.enrolledCourses[0];

  return (
    <div className="text-white">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">Student Management</h1>
        <p className="text-[#666] text-sm font-medium">Manage student records and academics easily.</p>
      </div>

      {/* Profile + Stats Card */}
      <div className="bg-[#141414] rounded-2xl border border-[#222] p-4 mb-4 relative overflow-hidden">
        {isDetailLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#141414]/90 z-10 rounded-2xl">
            <Loader2 className="w-7 h-7 animate-spin text-[#D0AD6B]" />
          </div>
        )}

        {/* Profile Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-[#333] shrink-0">
            {detailData?.studentInfo.profilePicture ? (
              <img
                src={detailData.studentInfo.profilePicture}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center text-xl font-bold text-[#D0AD6B]">
                {detailData?.studentInfo.name?.charAt(0) ?? "M"}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">
              {detailData?.studentInfo.name}
            </h2>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-0.5">
              <span>Student ID: {detailData?.studentInfo.studentId}</span>
              <span className="text-[#444] text-[8px]">●</span>
              <span>
                Grade: {detailData?.studentInfo.grade?.replace("Grade ", "")}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox
            icon={<BookOpen size={15} />}
            label="Enrolled Courses"
            value={detailData?.summaryStats.enrolledCourses ?? 0}
          />
          <StatBox
            icon={<TrendingUp size={15} />}
            label="Avg Progress"
            value={`${detailData?.summaryStats.avgProgress ?? 0}%`}
          />
          <StatBox
            icon={<Brain size={15} />}
            label="Avg Mastery"
            value={`${detailData?.summaryStats.avgMastery ?? 0}%`}
          />
          <StatBox
            icon={<CalendarCheck size={15} />}
            label="Attendance Rate"
            value={`${detailData?.summaryStats.attendanceRate ?? 0}%`}
          />
        </div>
      </div>

      {/* Lower Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Sidebar */}
        <div className="lg:col-span-3 bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] p-6 h-fit shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <User size={13} className="text-[#D0AD6B]" />
            <span className="text-[11px] font-bold uppercase text-[#D0AD6B]">
              Enrolled Courses
            </span>
          </div>

          <div className="space-y-3">
            {detailData?.enrolledCourses.map((course) => {
              const isActive = selectedCourseId === course.id;
              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${isActive
                    ? "bg-[#D0AD6B] border-[#D0AD6B] text-black shadow-lg"
                    : "bg-[#D0AD6B]/20 border-transparent text-white hover:border-[#D0AD6B]/40"
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`font-bold text-[15px] leading-tight ${isActive ? "text-black" : "text-white"}`}>
                      {course.courseName}
                    </span>
                    <GraduationCap
                      size={16}
                      className={isActive ? "text-black/50" : "text-[#D0AD6B]/60"}
                    />
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-[11px] font-semibold mb-3 ${isActive ? "text-black/60" : "text-gray-400"
                      }`}
                  >
                    <span>{course.mastery}% mastery</span>
                    <span className="opacity-40 text-[8px]">●</span>
                    <span>{course.progress}% complete</span>
                  </div>

                  <div
                    className={`h-[6px] w-full rounded-full overflow-hidden ${isActive ? "bg-black/15" : "bg-black/30"
                      }`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-white"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-9">
          {currentCourse && (
            <div>
              <div className="mb-4">
                <h3 className="text-[28px] font-bold leading-tight mb-1">
                  {currentCourse.courseName}
                </h3>
                <div className="flex items-center gap-2 text-gray-400 text-[13px] font-semibold">
                  <span>{currentCourse.mastery}% mastery</span>
                  <span className="text-gray-600 text-[8px]">●</span>
                  <span>{currentCourse.progress}% complete</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-[#222] mb-4">
                <TabButton
                  active={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}
                  label="Overview"
                />
                <TabButton
                  active={activeTab === "quiz-history"}
                  onClick={() => setActiveTab("quiz-history")}
                  label="Quiz History"
                />
              </div>

              {/* Tab Content */}
              {activeTab === "overview" ? (
                <div className="space-y-4">
                  <div className="bg-[#1A1A1A] rounded-xl border border-[#2D2D2D] p-5 shadow-xl relative overflow-hidden">
                    <h4 className="text-base font-bold text-white mb-4">Course Progress</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div>
                        <p className="text-[10px] font-bold text-white uppercase mb-2">
                          Module Completed
                        </p>
                        <p className="text-3xl font-bold text-white leading-none">
                          {currentCourse.modulesCompleted}/{currentCourse.modulesTotal}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white uppercase mb-2">
                          Lessons Completed
                        </p>
                        <p className="text-3xl font-bold text-white leading-none">
                          {currentCourse.lessonsCompleted ?? 0}/{currentCourse.lessonsTotal ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white uppercase mb-2">
                          Latest Quiz Score
                        </p>
                        <p className="text-3xl font-bold text-[#D0AD6B] leading-none">
                          {currentCourse.modules?.[0]?.quizScore ?? 0}%
                        </p>
                      </div>
                    </div>

                    <div className="h-[8px] w-full bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-700"
                        style={{ width: `${currentCourse.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentCourse.modules?.map((module: any, mIdx: number) => (
                    <button
                      key={mIdx}
                      onClick={() => router.push(`/admin/students/${studentId}/courses/${selectedCourseId || currentCourse.id}/modules/${module.id}`)}
                      className="w-full bg-[#1A1A1A] rounded-xl border border-[#2D2D2D] p-5 flex items-center justify-between shadow-xl transition-all group hover:bg-[#D0AD6B]/10 active:scale-[0.99]"
                    >
                      <div className="text-left">
                        <span className="text-[10px] font-bold uppercase mb-1 block text-[#D0AD6B]">
                          Module {module.moduleNumber} - Quiz 1: {module.moduleTitle.split(' ').slice(0, 2).join(' ')}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-[#D0AD6B]">
                          Module {module.moduleNumber}: {module.moduleTitle}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase mb-1 text-gray-500">Score</p>
                        <p className="text-lg font-bold text-[#D0AD6B]">{module.quizScore}%</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-[#D0AD6B]/20 rounded-xl border border-[#D0AD6B]/10 p-5 flex flex-col gap-4 transition-all hover:bg-[#D0AD6B]/25">
      <div className="flex items-center gap-2 text-white/70">
        <span className="opacity-80">{icon}</span>
        <span className="text-[12px] font-bold uppercase">{label}</span>
      </div>
      <p className="text-[32px] font-bold text-white leading-none">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-[14px] font-bold relative transition-all ${active ? "text-white" : "text-gray-500 hover:text-gray-300"
        }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#D0AD6B] rounded-full" />
      )}
    </button>
  );
}