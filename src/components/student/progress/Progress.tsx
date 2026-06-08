"use client";

import { useGetStudentProgressQuery } from "@/lib/feature/student/progress/progressApi";
import { ArrowUpRight, Target, Timer, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function Progress() {
  const { data: studentProgress, isLoading } = useGetStudentProgressQuery();

  const progress = studentProgress?.data;

  const overallMastery = progress?.overallMastery ?? 0;
  const completedModules = progress?.modulesComplete?.completed ?? 0;
  const totalModules = progress?.modulesComplete?.total ?? 0;
  const totalHoursThisWeek = progress?.timeSpent?.totalHoursThisWeek ?? 0;
  const averagePerDay = progress?.timeSpent?.averagePerDay ?? 0;
  const activityData = progress?.timeSpent?.chartData ?? [];
  const courseMastery = progress?.masteryByCourse ?? [];
  const recentImprovements = progress?.recentImprovements ?? [];

  const maxHours =
    activityData.length > 0
      ? Math.max(...activityData.map((item) => item.hours), 1)
      : 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111] text-foreground">
        <div className="mb-8 rounded-xl border border-[#333] bg-[#1C1C1C] p-6">
          <h1 className="mb-1 text-xl font-bold text-[#D4AF37]">
            Your Progress
          </h1>
          <p className="text-sm text-gray-400">Track your learning journey</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-xl border border-[#333] bg-[#1C1C1C]"
            />
          ))}
        </div>

        <div className="mb-8 h-105 animate-pulse rounded-xl border border-[#333] bg-[#1C1C1C]" />
        <div className="mb-8 h-80 animate-pulse rounded-xl border border-[#333] bg-[#1C1C1C]" />
        <div className="h-65 animate-pulse rounded-xl border border-[#333] bg-[#1C1C1C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-foreground">
      <div className="mb-8 rounded-xl border border-[#333] bg-[#1C1C1C] p-6">
        <h1 className="mb-1 text-xl font-bold text-[#D4AF37]">Your Progress</h1>
        <p className="text-sm text-gray-400">Track your learning journey</p>
      </div>

      {/* Top Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Overall Mastery */}
        <div className="rounded-xl border border-[#333] bg-[#1C1C1C] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <Target className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <span className="font-medium text-gray-300">Overall Mastery</span>
          </div>

          <div className="mb-2 text-4xl font-bold text-[#D4AF37]">
            {overallMastery}%
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[#333]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallMastery}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-[#D4AF37]"
            />
          </div>
        </div>

        {/* Modules Complete */}
        <div className="rounded-xl border border-[#333] bg-[#1C1C1C] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <span className="font-medium text-gray-300">Modules Complete</span>
          </div>

          <div className="mb-2 text-4xl font-bold text-[#D4AF37]">
            {completedModules}
          </div>

          <div className="text-sm text-gray-500">of {totalModules} total</div>
        </div>

        {/* This Week */}
        <div className="rounded-xl border border-[#333] bg-[#1C1C1C] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <Timer className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <span className="font-medium text-gray-300">This Week</span>
          </div>

          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#D4AF37]">
              {totalHoursThisWeek} hrs
            </span>
          </div>

          <div className="text-sm text-gray-500">
            {averagePerDay} hrs average/day
          </div>
        </div>
      </div>

      {/* Time Spent Chart */}
      <div className="group relative mb-8 overflow-hidden rounded-xl border border-[#333] bg-[#1C1C1C] p-8">
        <div className="absolute right-0 top-0 p-8 opacity-5">
          <Zap size={120} className="text-[#D4AF37]" />
        </div>

        <div className="relative z-10 mb-10 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Zap className="h-5 w-5 text-[#D4AF37]" />
            Time Spent
          </h2>

          <div className="flex gap-2">
            <button className="rounded-md border border-primary bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase text-primary">
              Weekly
            </button>
          </div>
        </div>

        <div className="relative mt-4 flex h-70 w-full items-end">
          {/* Y Axis Labels */}
          <div className="absolute bottom-12 left-0 top-0 z-10 flex flex-col justify-between text-[10px] font-bold uppercase tracking-widest text-gray-600">
            <span>{maxHours}h</span>
            <span>{Math.floor(maxHours / 2)}h</span>
            <span>0h</span>
          </div>

          {/* Bars Container */}
          <div className="ml-10 flex h-full flex-1 items-end justify-around border-b border-gray-800/50 pb-12">
            {activityData.map((data, idx) => {
              const heightPct = (data.hours / maxHours) * 100;

              return (
                <div
                  key={data.day}
                  className="group/bar flex h-full w-10 flex-col items-center justify-end gap-3 sm:w-14"
                >
                  <div
                    className="relative flex w-full items-end justify-center"
                    style={{ height: `${heightPct}%` }}
                  >
                    <motion.div
                      key={data.day}
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{
                        duration: 0.8,
                        delay: idx * 0.05,
                        ease: "circOut",
                      }}
                      className="relative w-full cursor-pointer rounded-t-md bg-linear-to-t from-[#D4AF37]/40 to-[#D4AF37] transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover/bar:brightness-110"
                    >
                      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#333] bg-[#222] px-2.5 py-1.5 text-[10px] font-bold text-white opacity-0 scale-75 shadow-2xl transition-all group-hover/bar:scale-100 group-hover/bar:opacity-100">
                        {data.hours} hrs
                      </div>
                    </motion.div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-600 transition-colors group-hover/bar:text-primary">
                    {data.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mastery by Course */}
      <div className="mb-8 rounded-xl border border-[#333] bg-[#1C1C1C] p-8">
        <h2 className="mb-6 text-lg font-semibold text-white">
          Mastery by Course
        </h2>

        <div className="space-y-6">
          {courseMastery.length > 0 ? (
            courseMastery.map((course, idx) => (
              <div key={`${course.courseName}-${idx}`}>
                <div className="mb-2 flex items-end justify-between">
                  <span className="font-medium text-gray-300">
                    {course.courseName}
                  </span>
                  <span className="text-sm text-[#D4AF37]">
                    Mastery {course.mastery}%
                  </span>
                </div>

                <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#333]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${course.mastery}%` }}
                    transition={{
                      duration: 0.8,
                      delay: idx * 0.1,
                      ease: "easeOut",
                    }}
                    className="h-full bg-[#22C55E]"
                  />
                  <div className="absolute right-0 top-0 h-full w-12 bg-white/10" />
                </div>

                <div className="mt-1 text-[10px] uppercase tracking-wide text-gray-500">
                  Mastery Required: {course.masteryRequired}%
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-[#333] bg-[#111] p-4 text-sm text-gray-500">
              No mastery data found.
            </div>
          )}
        </div>
      </div>

      {/* Recent Improvements */}
      <div className="rounded-xl border border-[#333] bg-[#1C1C1C] p-8">
        <h2 className="mb-6 text-lg font-semibold text-white">
          Recent Improvements
        </h2>

        <div className="space-y-4">
          {recentImprovements.length > 0 ? (
            recentImprovements.map((item, idx) => (
              <motion.div
                key={`${item.courseName}-${item.moduleName}-${item.quizName}-${idx}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group flex items-center justify-between rounded-xl border border-[#22C55E]/30 bg-[#1a3824]/30 p-4 transition-colors hover:bg-[#1a3824]/50"
              >
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-200">
                    <span>{item.courseName}</span>
                    <span className="text-gray-600">•</span>
                    <span>{item.moduleName}</span>
                    <span className="text-gray-600">•</span>
                    <span>{item.quizName}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.description}
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-md bg-[#22C55E]/10 px-2 py-1 text-sm font-bold text-[#22C55E]">
                  <ArrowUpRight className="h-4 w-4" />+{item.improvement}%
                </div>
              </motion.div>
            ))
          ) : (
            <div className="rounded-xl border border-[#333] bg-[#111] p-4 text-sm text-gray-500">
              No recent improvements found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
