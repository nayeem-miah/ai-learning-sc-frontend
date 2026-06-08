"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, FileText, Users, Sparkles, ArrowRight, Layout,
  TrendingUp, TrendingDown, Clock, Bell, BarChart3, 
  GraduationCap, UserPlus, Activity, ChevronRight,
  CheckCircle, AlertTriangle, Zap, Target, Calendar
} from "lucide-react";
import { useGetDashboardStatsQuery } from "@/lib/feature/courses/coursesApi";
import CourseFileUpload from "./CourseFileUpload";


// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// Mini sparkline component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function AiGeneratorOverview() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setMounted(true), 10); return () => clearTimeout(timer); }, []);

  const { data: dashboardData, isLoading } = useGetDashboardStatsQuery();
  const stats = dashboardData?.data;

  const totalCourses = useAnimatedCounter(stats?.totalCourses || 0);
  const publishedCount = useAnimatedCounter(stats?.publishedCourses || 0);
  const draftCount = useAnimatedCounter(stats?.draftCourses || 0);
  const studentCount = useAnimatedCounter(stats?.totalStudents || 0);
  const avgMastery = useAnimatedCounter(78);
  const avgAttendance = useAnimatedCounter(91);

  const recentCourses = stats?.recentCourses 
    ? stats.recentCourses
        .slice(0, 3)
        .map(course => ({
          name: course.courseName,
          grade: course.targetGradeLevel,
          subject: course.subject,
          chapters: course.totalModules,
          status: course.isPublished ? "Active" : "Draft",
          students: course.class?.totalStudents || 0,
          id: course.id
        }))
    : [];

  const activityFeed = [
    { icon: <UserPlus className="w-4 h-4" />, text: "3 new students enrolled in Algebra", time: "2 min ago", color: "text-[#22C55E]" },
    { icon: <CheckCircle className="w-4 h-4" />, text: "Physics quiz completed by 28 students", time: "15 min ago", color: "text-[#D4AF37]" },
    { icon: <AlertTriangle className="w-4 h-4" />, text: "5 students below 60% mastery in English", time: "1 hr ago", color: "text-[#EF4444]" },
    { icon: <GraduationCap className="w-4 h-4" />, text: "Rahim Ahmed achieved 95% in Module 3", time: "2 hrs ago", color: "text-[#22C55E]" },
    { icon: <BookOpen className="w-4 h-4" />, text: "New course 'Chemistry Basics' saved as draft", time: "3 hrs ago", color: "text-[#8B5CF6]" },
  ];

  const weeklyEnrollment = [12, 18, 14, 22, 28, 24, 32];
  const weeklyMastery = [72, 74, 71, 76, 78, 75, 78];

  return (
    <div className={`min-h-screen text-white transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-1">Dashboard Overview</p>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back, Teacher Jane!</h1>
            <p className="text-gray-400">Here&apos;s what&apos;s happening with your courses today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{mounted ? new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }) : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Courses"
          value={totalCourses.toString()}
          icon={<BookOpen className="w-5 h-5 text-[#D4AF37]" />}
          trend="+2 this month"
          trendUp={true}
          sparkData={[5, 7, 6, 8, 9, 10, 12]}
          sparkColor="#D4AF37"
          delay={0}
        />
        <StatCard
          title="Published"
          value={publishedCount.toString()}
          icon={<Layout className="w-5 h-5 text-[#22C55E]" />}
          trend="+1 this week"
          trendUp={true}
          sparkData={[3, 4, 5, 5, 6, 7, 8]}
          sparkColor="#22C55E"
          delay={100}
        />
        <StatCard
          title="Drafts"
          value={draftCount.toString()}
          icon={<FileText className="w-5 h-5 text-[#F59E0B]" />}
          trend="2 pending review"
          trendUp={false}
          sparkData={[6, 5, 4, 5, 4, 3, 4]}
          sparkColor="#F59E0B"
          delay={200}
        />
        <StatCard
          title="Total Students"
          value={studentCount.toString()}
          icon={<Users className="w-5 h-5 text-[#8B5CF6]" />}
          trend="+24 this month"
          trendUp={true}
          sparkData={[280, 310, 325, 340, 355, 370, 384]}
          sparkColor="#8B5CF6"
          delay={300}
        />
      </div>

      {/* Performance Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/*
        <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 group hover:border-[#22C55E]/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium">Avg. Mastery</p>
              <p className="text-3xl font-bold mt-1 text-white">{avgMastery}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#22C55E]/10 group-hover:bg-[#22C55E]/20 transition-colors">
              <Target className="w-5 h-5 text-[#22C55E]" />
            </div>
          </div>
          <div className="h-2 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full transition-all duration-1000 ease-out" style={{ width: `${avgMastery}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">+3% from last month</p>
        </div>

        <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 group hover:border-[#D4AF37]/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium">Attendance Rate</p>
              <p className="text-3xl font-bold mt-1 text-white">{avgAttendance}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 transition-colors">
              <Activity className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <div className="h-2 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] rounded-full transition-all duration-1000 ease-out" style={{ width: `${avgAttendance}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">+1% from last week</p>
        </div>

        <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 group hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium">Weekly Enrollment</p>
              <p className="text-3xl font-bold mt-1 text-white">+32</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#8B5CF6]/10 group-hover:bg-[#8B5CF6]/20 transition-colors">
              <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
            </div>
          </div>
          <Sparkline data={weeklyEnrollment} color="#8B5CF6" />
          <p className="text-xs text-gray-500 mt-2">Trending upward this week</p>
        </div>
        */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Create with AI Card */}
        <Link href="/admin/ai-generator" className="group block lg:col-span-1">
          <div className="bg-linear-to-br from-[#D4AF37] via-[#d4b57e] to-[#C49B30] rounded-xl p-8 h-full relative overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(212,175,55,0.2)] cursor-pointer text-black">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-black/20 animate-pulse" />
              <div className="absolute bottom-8 left-8 w-20 h-20 rounded-full border-2 border-black/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
              <div className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full border-2 border-black/20 animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-black/10 rounded-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Create with AI</h2>
              <p className="text-black/70 mb-8 text-sm leading-relaxed">
                Generate a complete course structure with lessons, quizzes, and assessments in minutes.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-full font-semibold shadow-lg group-hover:shadow-xl group-hover:bg-white transition-all text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Generate Course</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* Recent Courses */}
        <div className="bg-[#121212] rounded-xl border border-gray-800 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Recent Courses</h2>
              <p className="text-gray-500 text-sm mt-0.5">{recentCourses.length} latest courses</p>
            </div>
            <Link href="/admin/courses" className="text-[#D4AF37] text-sm flex items-center gap-1 hover:gap-2 transition-all font-medium">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-[#1a1a1a] rounded-lg border border-gray-800 animate-pulse" />
                ))}
              </div>
            ) : recentCourses.length > 0 ? (
              recentCourses.map((course, idx) => (
              <Link
                key={course.id}
                href={`/admin/courses/${course.id}`}
                className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4 flex items-center gap-4 hover:border-[#D4AF37]/30 hover:bg-[#1e1e1e] transition-all duration-300 cursor-pointer group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="w-11 h-11 bg-[#2a2a2a] rounded-lg flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-colors shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{course.name}</h3>
                  <p className="text-xs text-gray-400">{course.grade} • {course.subject} • {course.chapters} chapters</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {course.students > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{course.students}</span>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === "Active" 
                      ? "bg-green-900/30 text-green-500" 
                      : "bg-[#D4AF37]/10 text-[#D4AF37]"
                  }`}>
                    {course.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
                </div>
              </Link>
            ))
          ) : (
              <div className="text-center py-10 bg-[#1a1a1a] rounded-lg border border-dashed border-gray-800">
                <p className="text-gray-500 text-sm">No courses found</p>
                <Link href="/admin/ai-generator" className="text-[#D4AF37] text-xs mt-2 inline-block hover:underline">
                  Create your first course
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row - Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        {/*
        <div className="bg-[#121212] rounded-xl border border-gray-800 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4AF37]/10">
                <Bell className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Recent Activity</h2>
                <p className="text-gray-500 text-xs">Live updates from your platform</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-[#22C55E]">
              <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
              Live
            </span>
          </div>

          <div className="space-y-1">
            {activityFeed.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors group cursor-default"
              >
                <div className={`p-2 rounded-lg bg-[#1a1a1a] group-hover:bg-[#222] transition-colors ${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.text}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        */}

        {/* Quick Actions */}
        {/*
        <div className="bg-[#121212] rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold mb-1">Quick Actions</h2>
          <p className="text-gray-500 text-xs mb-6">Common tasks at your fingertips</p>

          <div className="space-y-3">
            <Link href="/admin/ai-generator" className="flex items-center gap-3 p-3.5 rounded-lg bg-[#1a1a1a] border border-gray-800 hover:border-[#D4AF37]/40 hover:bg-[#1e1e1e] transition-all group">
              <div className="p-2 rounded-lg bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 transition-colors">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Generate New Course</p>
                <p className="text-xs text-gray-500">Use AI to create content</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
            </Link>

            <Link href="/admin/students" className="flex items-center gap-3 p-3.5 rounded-lg bg-[#1a1a1a] border border-gray-800 hover:border-[#22C55E]/40 hover:bg-[#1e1e1e] transition-all group">
              <div className="p-2 rounded-lg bg-[#22C55E]/10 group-hover:bg-[#22C55E]/20 transition-colors">
                <Users className="w-4 h-4 text-[#22C55E]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Manage Students</p>
                <p className="text-xs text-gray-500">View & track progress</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#22C55E] transition-colors" />
            </Link>

            <Link href="/admin/courses" className="flex items-center gap-3 p-3.5 rounded-lg bg-[#1a1a1a] border border-gray-800 hover:border-[#8B5CF6]/40 hover:bg-[#1e1e1e] transition-all group">
              <div className="p-2 rounded-lg bg-[#8B5CF6]/10 group-hover:bg-[#8B5CF6]/20 transition-colors">
                <BarChart3 className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Course Analytics</p>
                <p className="text-xs text-gray-500">Performance insights</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#8B5CF6] transition-colors" />
            </Link>

            <Link href="/admin/settings" className="flex items-center gap-3 p-3.5 rounded-lg bg-[#1a1a1a] border border-gray-800 hover:border-gray-600 hover:bg-[#1e1e1e] transition-all group">
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                <GraduationCap className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Team Settings</p>
                <p className="text-xs text-gray-500">Manage access & roles</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
        */}
      </div>
      
      {/* File Upload Section */}
      <CourseFileUpload />
    </div>
  );
}

function StatCard({
  title, value, icon, trend, trendUp, sparkData, sparkColor, delay
}: {
  title: string; value: string; icon: React.ReactNode;
  trend: string; trendUp: boolean; sparkData: number[];
  sparkColor: string; delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`bg-[#121212] border border-gray-800 rounded-xl p-5 flex flex-col justify-between min-h-[140px] hover:border-gray-700 transition-all duration-500 group ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="flex justify-between items-start">
        <span className="text-gray-400 font-medium text-sm">{title}</span>
        <div className="bg-[#1a1a1a] p-2 rounded-lg border border-gray-800 group-hover:border-gray-700 transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold text-white block mb-1">{value}</span>
        <div className="flex items-center justify-between">
          <span className={`text-xs flex items-center gap-1 ${trendUp ? "text-[#22C55E]" : "text-gray-500"}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {trend}
          </span>
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
      </div>
    </div>
  );
}
