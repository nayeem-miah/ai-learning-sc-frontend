"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/utils";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Globe,
  Info,
  XCircle,
  Loader,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useGetStudentAttendanceQuery } from "@/lib/feature/attendance/attendanceApi";
import { useGetStudentPublishedCoursesQuery } from "@/lib/feature/courses/coursesApi";

export default function StudentAttendancePage() {
  // Constants
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Start at Mar 2026
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");

  const { data: coursesResponse, isLoading: isCoursesLoading } = useGetStudentPublishedCoursesQuery();
  const { data: attendanceResponse, isLoading: isAttendanceLoading, error } = useGetStudentAttendanceQuery(
      selectedCourseId === "all" ? undefined : selectedCourseId
  );

  const isLoading = isCoursesLoading || isAttendanceLoading;

  const selectedMonthIndex = currentDate.getMonth();
  const selectedYear = currentDate.getFullYear();

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(selectedYear, selectedMonthIndex - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(selectedYear, selectedMonthIndex + 1, 1));
  };

  const handleMonthChange = (monthIdx: string) => {
    setCurrentDate(new Date(selectedYear, parseInt(monthIdx), 1));
  };

  const handleYearChange = (year: string) => {
    setCurrentDate(new Date(parseInt(year), selectedMonthIndex, 1));
  };

  // Generate years for dropdown (e.g., 2020 to 2030)
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  // Calendar engine (6 rows = 42 cells to fit all months)
  const daysInMonth = new Date(
    selectedYear,
    selectedMonthIndex + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    selectedYear,
    selectedMonthIndex,
    1,
  ).getDay(); // 0 = Sunday

  const daysInPrevMonth = new Date(
    selectedYear,
    selectedMonthIndex,
    0,
  ).getDate();
  const prevMonthDays = Array.from(
    { length: firstDayOfMonth },
    (_, i) => daysInPrevMonth - firstDayOfMonth + i + 1,
  );
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const totalCells = 42; // 6 rows to always fit every month
  const remainingCells = Math.max(
    0,
    totalCells - (prevMonthDays.length + currentMonthDays.length),
  );
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => i + 1);

  const statusMap = (() => {
    const map: Record<number, "present" | "late" | "absent" | "holiday"> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = new Date(selectedYear, selectedMonthIndex, i).getDay();
      if (dayOfWeek === 0) {
        map[i] = "holiday";
      }
    }

    const activeCourseName = selectedCourseId !== "all" 
      ? coursesResponse?.data?.find((c: any) => c.id === selectedCourseId)?.courseName 
      : null;

    if (attendanceResponse?.data?.calendar) {
      attendanceResponse.data.calendar.forEach((record) => {
        // Fallback frontend filter in case backend API doesn't filter by query param natively
        if (activeCourseName && record.courseName !== activeCourseName) return;

        const recordDate = new Date(record.date);
        if (recordDate.getFullYear() === selectedYear && recordDate.getMonth() === selectedMonthIndex) {
          map[recordDate.getDate()] = record.status.toLowerCase() as any;
        }
      });
    }

    return map;
  })();

  const stats = attendanceResponse?.data?.summary || {
    present: 0,
    late: 0,
    absent: 0,
    total: 0,
    attendanceRate: 0,
  };

  const attendanceRate = stats.attendanceRate;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-[#1a3824] border-[#22C55E] text-[#22C55E]";
      case "late":
        return "bg-[#3A3324] border-[#D4AF37] text-[#D4AF37]";
      case "absent":
        return "bg-[#381a1a] border-[#EF4444] text-[#EF4444]";
      case "holiday":
        return "bg-[#1e1e2e] border-[#444] text-gray-500";
      default:
        return "bg-[#1C1C1C] border-[#333] text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-white">
        <Loader className="w-12 h-12 text-[#C08F42] animate-spin mb-4" />
        <h2 className="text-xl font-bold">Loading Attendance...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Attendance</h2>
        <p className="text-gray-400">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-foreground p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Attendance</h1>
        <p className="text-gray-400 text-sm">Your learning activity tracking</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Present */}
        <div className="bg-[#1C1C1C] border border-[#333] rounded-xl p-6 flex justify-between items-start">
          <div>
            <span className="text-gray-300 font-medium block mb-2">
              Present
            </span>
            <span className="text-4xl font-bold text-white">
              {stats.present}
            </span>
          </div>
          <div className="p-2 bg-[#22C55E]/10 rounded-lg">
            <CheckCircle className="w-6 h-6 text-[#22C55E]" />
          </div>
        </div>
        {/* Late */}
        <div className="bg-[#1C1C1C] border border-[#333] rounded-xl p-6 flex justify-between items-start">
          <div>
            <span className="text-gray-300 font-medium block mb-2">Late</span>
            <span className="text-4xl font-bold text-white">{stats.late}</span>
          </div>
          <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-[#D4AF37]" />
          </div>
        </div>
        {/* Absent */}
        <div className="bg-[#1C1C1C] border border-[#333] rounded-xl p-6 flex justify-between items-start">
          <div>
            <span className="text-gray-300 font-medium block mb-2">Absent</span>
            <span className="text-4xl font-bold text-white">
              {stats.absent}
            </span>
          </div>
          <div className="p-2 bg-[#EF4444]/10 rounded-lg">
            <XCircle className="w-6 h-6 text-[#EF4444]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Card */}
        <div className="lg:col-span-8 bg-[#1C1C1C] border border-[#333] rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-[#222] border border-[#333] rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#333]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextMonth}
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#333]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={selectedMonthIndex.toString()}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="w-auto bg-transparent border-none text-white font-semibold hover:bg-white/5 focus-visible:ring-0 px-2 py-1 h-auto gap-2 text-lg shadow-none">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#333] text-white">
                    {months.map((month, idx) => (
                      <SelectItem key={month} value={idx.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedYear.toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="w-auto bg-transparent border-none text-gray-500 font-medium hover:bg-white/5 focus-visible:ring-0 px-2 py-1 h-auto gap-2 text-lg shadow-none">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#333] text-white">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#222] px-4 py-1.5 rounded-full border border-[#333]">
              <Globe className="w-4 h-4 text-gray-400" />
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-auto min-w-[120px] bg-transparent border-none text-gray-300 text-sm font-medium hover:text-white focus-visible:ring-0 p-0 h-auto gap-2 shadow-none tracking-tight">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#333] text-white">
                  <SelectItem value="all">All Courses</SelectItem>
                  {coursesResponse?.data?.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.courseName}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d} className="text-gray-500 text-sm font-medium">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Previous Month Days */}
            {prevMonthDays.map((day) => (
              <div
                key={`prev-${day}`}
                className="aspect-square rounded-lg border border-[#333] flex items-center justify-center font-semibold text-sm text-gray-700 opacity-40 cursor-default"
              >
                {day}
              </div>
            ))}

            {/* Current Month Days */}
            {currentMonthDays.map((day) => (
              <div
                key={`current-${day}`}
                className={cn(
                  "aspect-square rounded-lg border flex items-center justify-center font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer",
                  getStatusColor(statusMap[day] || "none"),
                )}
              >
                {day}
              </div>
            ))}

            {/* Next Month Days */}
            {nextMonthDays.map((day) => (
              <div
                key={`next-${day}`}
                className="aspect-square rounded-lg border border-[#333] flex items-center justify-center font-semibold text-sm text-gray-700 opacity-40 cursor-default"
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Right Details Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Legend */}
          <div className="bg-[#1C1C1C] border border-[#333] rounded-xl p-8">
            <div className="flex items-center gap-2 text-gray-300 mb-6">
              <Info className="w-4 h-4" />
              <span className="text-sm">How Attendance Works</span>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[#22C55E] font-medium mb-1">Present</h4>
                <p className="text-gray-400 text-sm">You were marked present</p>
              </div>
              <div>
                <h4 className="text-[#D4AF37] font-medium mb-1">Late</h4>
                <p className="text-gray-400 text-sm">You were marked late</p>
              </div>
              <div>
                <h4 className="text-[#EF4444] font-medium mb-1">Absent</h4>
                <p className="text-gray-400 text-sm">You were marked absent</p>
              </div>
            </div>
          </div>

          {/* Rate */}
          <div className="bg-[#1C1C1C] border border-[#333] rounded-xl p-8">
            <h3 className="text-gray-300 font-medium mb-4">Attendance Rate</h3>
            <div className="text-4xl font-bold text-[#22C55E] mb-2">
              {attendanceRate}%
            </div>
            <div className="text-sm text-gray-500 mb-6">This month</div>

            <div className="h-2 w-full bg-[#333] rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-[#22C55E] transition-all duration-500"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>

            <p className="text-white text-sm">
              {attendanceRate > 90
                ? "Great consistency! Keep it up."
                : attendanceRate > 75
                  ? "Good progress, try to minimize absences."
                  : "Your attendance needs improvement."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
