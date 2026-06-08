// app/student-management/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search, Users, TrendingUp, Clock, CheckCircle, ChevronLeft, ChevronRight,
  Eye, BookOpen, Award, BarChart3, ArrowUpRight, ArrowDownRight, Filter, Loader, AlertCircle
} from "lucide-react";
import { useGetStudentManagementQuery } from "@/lib/feature/courses/coursesApi";
import Image from "next/image";

// Type definitions
interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  mastery: number;
  profilePicture: string;
}

// Helper: get initials
function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

// Helper: color from name
function nameToColor(name: string) {
  const colors = ["#D4AF37", "#3B82F6", "#22C55E", "#A855F7", "#F97316", "#EF4444", "#06B6D4", "#EC4899"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}


// Helper: mastery color
function masteryColor(v: number) {
  if (v >= 80) return "#22C55E";
  if (v >= 60) return "#D4AF37";
  return "#EF4444";
}



export default function TeacherStudentManagementPage() {
  const router = useRouter();
  const { data, isLoading, error } = useGetStudentManagementQuery({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "mastery">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-white">
        <Loader className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-400 animate-pulse">Fetching student management data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-2" />
        <h2 className="text-2xl font-bold">Error Loading Students</h2>
        <p className="text-gray-400 max-w-md">
          {(error as any)?.data?.message || "We couldn't retrieve the student management data. Please try again later."}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const summary = data?.data?.summary;
  const students: Student[] = data?.data?.students || [];

  // Filter
  const filteredStudents = students.filter(
    (student) =>
      (student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.studentId.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedClass === "All Classes" || student.class === selectedClass),
  );

  // Sort
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "name") cmp = a.name.localeCompare(b.name);
    else cmp = a.mastery - b.mastery;
    return sortDir === "desc" ? -cmp : cmp;
  });

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

  const handleSort = (col: "name" | "mastery") => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const statCards = [
    { label: "Total Students", value: summary?.totalStudents || 0, icon: Users, color: "#D4AF37", trend: "+5 this month", trendUp: true },
    { label: "Engaged", value: summary?.engaged || 0, icon: TrendingUp, color: "#22C55E", trend: `${Math.round(((summary?.engaged || 0) / (summary?.totalStudents || 1)) * 100)}% of total`, trendUp: true },
    { label: "No activity", value: summary?.noActivity || 0, icon: Clock, color: "#F97316", trend: "Needs attention", trendUp: false },
    { label: "Attendance Rate", value: `${summary?.attendanceRate || 0}%`, icon: CheckCircle, color: "#3B82F6", trend: "Stability check", trendUp: true },
  ];

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>

      {/* Header */}
      <div className="bg-card shadow-[0_4px_4px_0] shadow-primary/20 rounded-xl p-6 md:p-8 border hover:border-primary/20 transition-all">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Student Management
            </h1>
            <p className="text-gray-400 mt-1 text-sm">Manage student records and track academic performance</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            Last updated just now
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label}
              className="bg-card shadow-[0_4px_4px_0] shadow-primary/20 rounded-xl p-4 sm:p-5 border hover:border-primary/20 transition-all group"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transition: `all 0.4s ${idx * 80}ms` }}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-2xl font-medium">{stat.label}</p>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</p>
              <div className="flex items-center gap-1 text-[10px]">
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3 text-[#22C55E]" /> : <ArrowDownRight className="w-3 h-3 text-[#F97316]" />}
                <span className="text-gray-500">{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-card shadow-[0_4px_4px_0] shadow-primary/20 rounded-xl p-4 md:p-5 border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 pl-10 placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="All Classes">All Classes</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>
        </div>
        {searchQuery && (
          <p className="text-[10px] text-gray-600 mt-2">
            Showing {sortedStudents.length} result{sortedStudents.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-card shadow-[0_4px_4px_0] shadow-primary/20 rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-6 text-[10px] text-gray-500 font-semibold uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1">
                    Student {sortBy === "name" && <span className="text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">ID</th>
                <th className="text-left py-4 px-6 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Class</th>
                <th className="text-left py-4 px-6 text-[10px] text-gray-500 font-semibold uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("mastery")}>
                  <div className="flex items-center gap-1">
                    Mastery {sortBy === "mastery" && <span className="text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
                <th className="text-center py-4 px-6 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student, idx) => {
                const mVal = student.mastery;
                const mColor = masteryColor(mVal);
                const avatarColor = nameToColor(student.name);

                return (
                  <tr
                    key={student.id}
                    className="border-b border-gray-800/50 hover:bg-primary/5 transition-all group cursor-pointer"
                    style={{ opacity: mounted ? 1 : 0, transition: `opacity 0.3s ${idx * 60}ms` }}
                    onClick={() => router.push(`/teacher/students/${student.id}`)}
                  >
                    {/* Name + Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold flex-shrink-0 bg-primary/10 border border-primary/20">
                          {student.profilePicture ? (
                            <Image src={student.profilePicture} alt={student.name} width={36} height={36} className="w-full h-full object-cover" />
                          ) : (
                            <span style={{ color: avatarColor }}>{getInitials(student.name)}</span>
                          )}
                        </div>
                        <span className="font-medium text-sm group-hover:text-primary transition-colors">{student.name}</span>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-mono text-gray-400 bg-[#1a1a1a] px-2 py-1 rounded">#{student.studentId}</span>
                    </td>

                    {/* Class */}
                    <td className="py-4 px-6">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{student.class}</span>
                    </td>

                    {/* Mastery with bar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: mounted ? `${student.mastery}%` : "0%", backgroundColor: mColor }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: mColor }}>{student.mastery}%</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/teacher/students/${student.id}`); }}
                        className="p-2 rounded-lg hover:bg-primary/10 text-gray-500 hover:text-primary transition-all group-hover:text-primary"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between py-4 px-6 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Showing {indexOfFirstStudent + 1}-{Math.min(indexOfLastStudent, sortedStudents.length)} of {sortedStudents.length} students
            </p>
            <nav className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors disabled:opacity-30 flex items-center justify-center border border-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${currentPage === page
                      ? "bg-primary text-black"
                      : "bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-400 border border-gray-800"
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors disabled:opacity-30 flex items-center justify-center border border-gray-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}

        {sortedStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No students match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
