"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  useGetStudentManagementQuery,
  useGetSingleStudentManagementQuery,
  useGetClassesQuery,
  useGetAllCoursesQuery
} from "@/lib/feature/courses/coursesApi";
import {
  Loader2,
  Search,
  Eye,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Info,
  Users,
  UserCheck,
  UserMinus,
  Clock
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function StudentManagementPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);
  const studentsPerPage = 10;
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) setSearchQuery(query);
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClass]);

  const { data: studentResponse, isLoading } = useGetStudentManagementQuery({
    page: currentPage,
    limit: studentsPerPage,
    searchTerm: searchQuery.trim(),
    sortBy: sortBy,
    sortOrder: sortOrder,
    classId: selectedClass === "all" ? undefined : selectedClass,
  });

  const { data: classesResponse } = useGetClassesQuery();

  const classes = classesResponse?.data || [];

  const studentData = studentResponse?.data;
  const students = studentData?.students || [];
  const summary = studentData?.summary;

  const totalPages = studentData?.meta?.totalPage || 1;

  const handleViewClick = (id: string) => {
    router.push(`/admin/students/${id}`);
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return "text-[#22C55E]";
    if (mastery >= 60) return "text-[#D0AD6B]";
    return "text-[#EF4444]";
  };

  const getMasteryBg = (mastery: number) => {
    if (mastery >= 80) return "bg-[#22C55E]";
    if (mastery >= 60) return "bg-[#D0AD6B]";
    return "bg-[#EF4444]";
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#2D2D2D] pb-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[#D0AD6B] text-sm font-medium uppercase mb-1">Management</p>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-[#A0A0A0] mt-1">
              Manage student records and academic performance.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-4">
        <div>
          {/* Search and Filters */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-[#2D2D2D] border border-[#3A3A3A] rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D0AD6B]/50 pl-10 transition-all font-medium"
              />
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0]" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px] h-12 bg-[#2D2D2D] border-[#3A3A3A] text-white rounded-xl focus:ring-[#D0AD6B]/50">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-[#3A3A3A] text-white rounded-xl">
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.gradeLevel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2D2D2D] p-6 hover:border-[#D0AD6B]/30 transition-all duration-300 group shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#A0A0A0] text-sm uppercase font-semibold mb-2">Total Students</p>
                  <p className="text-3xl font-bold text-white">{summary?.totalStudents || 0}</p>
                </div>
                <div className="bg-[#D0AD6B]/10 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-[#D0AD6B]" />
                </div>
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-xl border border-[#2D2D2D] p-6 hover:border-[#22C55E]/30 transition-all duration-300 group shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#A0A0A0] text-sm uppercase font-semibold mb-2">Engaged</p>
                  <p className="text-3xl font-bold text-[#22C55E]">{summary?.engaged || 0}</p>
                </div>
                <div className="bg-[#22C55E]/10 p-3 rounded-xl">
                  <UserCheck className="h-6 w-6 text-[#22C55E]" />
                </div>
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-xl border border-[#2D2D2D] p-6 hover:border-[#EF4444]/30 transition-all duration-300 group shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#A0A0A0] text-sm uppercase font-semibold mb-2">Activity</p>
                  <p className="text-3xl font-bold text-[#EF4444]">{summary?.noActivity || 0}</p>
                </div>
                <div className="bg-[#EF4444]/10 p-3 rounded-xl">
                  <UserMinus className="h-6 w-6 text-[#EF4444]" />
                </div>
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-xl border border-[#2D2D2D] p-6 hover:border-[#8B5CF6]/30 transition-all duration-300 group shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#A0A0A0] text-sm uppercase font-semibold mb-2">Avg. Attendance</p>
                  <p className="text-3xl font-bold text-[#8B5CF6]">{summary?.attendanceRate || 0}%</p>
                </div>
                <div className="bg-[#8B5CF6]/10 p-3 rounded-xl">
                  <Clock className="h-6 w-6 text-[#8B5CF6]" />
                </div>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-[#1E1E1E] rounded-xl border border-[#2D2D2D] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2D2D2D] bg-[#1a1a1a]">
                    <th className="text-left py-4 px-6 text-[#A0A0A0] font-semibold text-xs uppercase">Student Name</th>
                    <th className="text-left py-4 px-6 text-[#A0A0A0] font-semibold text-xs uppercase">Student ID</th>
                    <th className="text-left py-4 px-6 text-[#A0A0A0] font-semibold text-xs uppercase">Class</th>
                    <th className="text-left py-4 px-6 text-[#A0A0A0] font-semibold text-xs uppercase">Mastery</th>
                    <th className="text-left py-4 px-6 text-[#A0A0A0] font-semibold text-xs uppercase">Progress</th>
                    <th className="text-left py-4 px-6 text-[#A0A0A0] font-semibold text-xs uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2D2D]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#D0AD6B]" />
                        <p className="text-[#A0A0A0] mt-4">Loading students...</p>
                      </td>
                    </tr>
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-[#2D2D2D]/30 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {student.profilePicture ? (
                              <img src={student.profilePicture} alt={student.name} className="w-9 h-9 rounded-full object-cover border border-[#3A3A3A]" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#D0AD6B]/10 flex items-center justify-center text-[#D0AD6B] text-xs font-bold border border-[#D0AD6B]/20">
                                {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                            )}
                            <p className="font-semibold text-white group-hover:text-[#D0AD6B] transition-colors">{student.name}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-400 font-mono text-sm">{student.studentId}</td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-1 bg-[#2D2D2D] rounded-lg text-[10px] font-bold text-gray-400 uppercase border border-[#3A3A3A]">
                            {student.class}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-bold text-sm ${getMasteryColor(student.mastery)}`}>
                            {student.mastery}%
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-[#2D2D2D] rounded-full overflow-hidden border border-[#3A3A3A]">
                              <div className={`h-full rounded-full ${getMasteryBg(student.mastery)} shadow-[0_0_8px_rgba(212,175,55,0.2)]`} style={{ width: `${student.mastery}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleViewClick(student.id)}
                            className="p-2 rounded-lg text-[#A0A0A0] hover:text-[#D0AD6B] hover:bg-[#D0AD6B]/10 transition-all"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-gray-500">
                        <Info className="w-10 h-10 mx-auto mb-4 opacity-20" />
                        <p>No students found matching your criteria.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center py-6 bg-[#1a1a1a] border-t border-[#2D2D2D]">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-[#2D2D2D] hover:bg-[#3A3A3A] transition-colors disabled:opacity-30 border border-[#3A3A3A]"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition-all font-bold text-sm ${currentPage === page
                        ? "bg-[#D0AD6B] text-black shadow-lg shadow-[#D0AD6B]/20"
                        : "bg-[#2D2D2D] text-[#A0A0A0] hover:bg-[#3A3A3A] hover:text-white"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-[#2D2D2D] hover:bg-[#3A3A3A] transition-colors disabled:opacity-30 border border-[#3A3A3A]"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
