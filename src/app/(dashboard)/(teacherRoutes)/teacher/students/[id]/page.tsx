// app/student-management/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft, BookOpen, TrendingUp,  Clock,
    CheckCircle, Target, BarChart3,  Loader
} from 'lucide-react';
import { useGetSingleStudentManagementQuery } from '@/lib/feature/courses/coursesApi';
import Link from 'next/link';

// Type definitions
interface Module {
    id: string;
    name: string;
    mastery: string;
    attempts?: number;
    date?: string;
}

interface Course {
    id: string;
    name: string;
    mastery: string;
    completion: string;
    modules: Module[];
}

interface StudentDetail {
    id: string;
    name: string;
    grade: string;
    enrolledCourses: number;
    avgProgress: string;
    avgMastery: string;
    attendanceRate: string;
    courses: Course[];
    status: 'active' | 'at-risk';
    lastActive: string;
}

// Helper functions
function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
}
function parsePct(s: string) { return parseInt(s.replace("%", ""), 10); }
function masteryColor(v: number) {
    if (v >= 80) return "#22C55E";
    if (v >= 60) return "#D4AF37";
    return "#EF4444";
}

export default function TeacherStudentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    
    // API Call
    const { data: studentDataResponse, isLoading: isFetchingStudent, error } = useGetSingleStudentManagementQuery(id as string, {
        skip: !id,
    });

    const [student, setStudent] = useState<StudentDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'quiz-history'>('overview');
    const [mounted, setMounted] = useState(false);
    const [animatedStats, setAnimatedStats] = useState({ courses: 0, progress: 0, mastery: 0, attendance: 0 });

    useEffect(() => {
        if (studentDataResponse?.data) {
            const apiData = studentDataResponse.data;
            const mappedStudent: StudentDetail = {
                id: apiData.studentInfo.studentId,
                name: apiData.studentInfo.name,
                grade: apiData.studentInfo.grade.replace('Grade ', ''),
                enrolledCourses: apiData.summaryStats.enrolledCourses,
                avgProgress: `${apiData.summaryStats.avgProgress}%`,
                avgMastery: `${apiData.summaryStats.avgMastery}%`,
                attendanceRate: `${apiData.summaryStats.attendanceRate}%`,
                status: apiData.summaryStats.avgMastery < 60 ? 'at-risk' : 'active',
                lastActive: 'Recently',
                courses: apiData.enrolledCourses.map(course => ({
                    id: course.id,
                    name: course.courseName,
                    mastery: `${course.mastery}%`,
                    completion: `${course.progress}%`,
                    modules: course.modules.map(mod => ({
                        id: mod.id,
                        name: `Module ${mod.moduleNumber} - ${mod.moduleTitle}`,
                        mastery: `${mod.quizScore}%`,
                        attempts: mod.quizHistory?.length ? 1 : 0,
                        date: 'Recently'
                    }))
                }))
            };
            setStudent(mappedStudent);
            setIsLoading(false);
            setMounted(true);
        } else if (error) {
            setIsLoading(false);
        }
    }, [studentDataResponse, error]);

    // Animate counters after data loads
    useEffect(() => {
        if (!student) return;
        const targets = { courses: student.enrolledCourses, progress: parsePct(student.avgProgress) || 0, mastery: parsePct(student.avgMastery) || 0, attendance: parsePct(student.attendanceRate) || 0 };
        const duration = 1200;
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const p = Math.min(elapsed / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setAnimatedStats({
                courses: Math.round(targets.courses * e),
                progress: Math.round(targets.progress * e),
                mastery: Math.round(targets.mastery * e),
                attendance: Math.round(targets.attendance * e),
            });
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [student]);

    if (isLoading || isFetchingStudent) {
        return (
            <div className="space-y-6 flex flex-col items-center justify-center min-h-[60vh]">
                 <Loader className="w-12 h-12 text-primary animate-spin" />
                 <p className="text-gray-400 animate-pulse">Fetching student detail data...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center py-16 text-gray-400">
                <p className="text-2xl font-bold mb-2 text-white">Error Loading Data</p>
                <p>We couldn't retrieve the student data. Please try again later.</p>
            </div>
        );
    }
    
    if (!student) return <div className="text-center py-16 text-gray-500">Student not found</div>;

    const currentCourse = student.courses?.[selectedCourse];
    const completionPct = currentCourse ? parsePct(currentCourse.completion) : 0;
    const totalModules = currentCourse?.modules?.length || 0;
    const completedModules = currentCourse?.modules?.filter(m => parsePct(m.mastery) >= 75)?.length || 0;

    return (
        <div className={`space-y-6 transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>

            {/* Header */}
            <div className="bg-card shadow-[0_4px_4px_0] shadow-primary/20 rounded-xl p-6 md:p-8 border hover:border-primary/20 transition-all">
                <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-white mb-5 transition-colors cursor-pointer group">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Students
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xl font-bold text-primary">{getInitials(student.name)}</span>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-white">{student.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-gray-400 text-sm">ID: #{student.id}</span>
                                <span className="text-gray-600">·</span>
                                <span className="text-gray-400 text-sm">Grade {student.grade}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                                    student.status === "active" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#F97316]/10 text-[#F97316]"
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${student.status === "active" ? "bg-[#22C55E] animate-pulse" : "bg-[#F97316]"}`} />
                                    {student.status === "at-risk" ? "At Risk" : "Active"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        Last active {student.lastActive}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Enrolled Courses", value: animatedStats.courses, icon: BookOpen, color: "#D4AF37" },
                    { label: "Avg Progress", value: `${animatedStats.progress}%`, icon: TrendingUp, color: "#3B82F6" },
                    { label: "Avg Mastery", value: `${animatedStats.mastery}%`, icon: Target, color: "#22C55E" },
                    { label: "Attendance", value: `${animatedStats.attendance}%`, icon: CheckCircle, color: "#A855F7" },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label}
                            className="bg-card shadow-[0_4px_4px_0] shadow-primary/20 rounded-xl p-4 sm:p-5 border hover:border-primary/20 transition-all group"
                            style={{ opacity: mounted ? 1 : 0, transition: `opacity 0.4s ${idx * 80}ms` }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${stat.color}15` }}>
                                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-gray-500 text-[10px]">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content */}
            {student.courses && student.courses.length > 0 ? (
            <div className="bg-card shadow-[0_4px_4px_0] shadow-primary/20 rounded-xl border overflow-hidden">

                {/* Course Selection */}
                <div className="p-5 md:p-6 border-b border-gray-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Course Performance
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {student.courses.map((course, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedCourse(index)}
                                    className={`px-4 py-2 rounded-lg font-medium text-xs transition-all ${
                                        selectedCourse === index
                                            ? 'bg-primary text-black'
                                            : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] hover:text-white border border-gray-800'
                                    }`}
                                >
                                    {course.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-5 md:px-6 pt-4 border-b border-gray-800">
                    <div className="flex gap-0">
                        {(['overview', 'quiz-history'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 px-4 font-medium text-sm transition-all relative ${
                                    activeTab === tab
                                        ? 'text-primary'
                                        : 'text-gray-500 hover:text-white'
                                }`}
                            >
                                {tab === 'overview' ? 'Overview' : 'Quiz History'}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-5 md:p-6">
                    {activeTab === 'overview' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left – Course Cards */}
                            <div>
                                <h4 className="text-sm font-semibold text-white mb-4">Enrolled Courses</h4>
                                <div className="space-y-3">
                                    {student.courses.map((course, index) => {
                                        const cPct = parsePct(course.completion);
                                        const mPct = parsePct(course.mastery);
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedCourse(index)}
                                                className={`rounded-lg p-4 cursor-pointer transition-all hover:border-primary/30 ${
                                                    selectedCourse === index
                                                        ? 'bg-primary/5 border-2 border-primary/30'
                                                        : 'bg-[#1a1a1a] border border-gray-800'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <h5 className="font-medium text-sm">{course.name}</h5>
                                                    <span className="text-xs font-bold" style={{ color: masteryColor(mPct) }}>
                                                        {course.mastery}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden mb-2">
                                                    <div className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B]"
                                                        style={{ width: mounted ? `${cPct}%` : "0%" }} />
                                                </div>
                                                <p className="text-[10px] text-gray-500">{course.completion} complete</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right – Course Detail */}
                            <div className="lg:col-span-2">
                                <div className="bg-[#1a1a1a] rounded-xl p-5 md:p-6 border border-gray-800">
                                    {/* Course header */}
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{currentCourse.name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                    <span className="font-medium" style={{ color: masteryColor(parsePct(currentCourse.mastery)) }}>{currentCourse.mastery} mastery</span>
                                                    <span>·</span>
                                                    <span>{currentCourse.completion} complete</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Mini progress ring */}
                                        <div className="relative w-12 h-12">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                                                <circle cx="24" cy="24" r="20" fill="none" stroke="#2a2a2a" strokeWidth="3" />
                                                <circle cx="24" cy="24" r="20" fill="none" stroke="#D4AF37" strokeWidth="3"
                                                    strokeDasharray={`${completionPct * 1.257} 125.7`}
                                                    strokeLinecap="round" className="transition-all duration-1000" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-primary">{completionPct}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mb-5">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-gray-500">Module Progress</span>
                                            <span className="text-white font-medium">{completedModules}/{totalModules} passed</span>
                                        </div>
                                        <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] rounded-full transition-all duration-1000"
                                                style={{ width: mounted ? `${(completedModules / totalModules) * 100}%` : "0%" }} />
                                        </div>
                                    </div>

                                    {/* Quick info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#222] rounded-lg p-3">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Current Lesson</p>
                                            <p className="text-sm text-white font-medium">Linear Equations: Intro</p>
                                        </div>
                                        <div className="bg-[#222] rounded-lg p-3">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Latest Quiz</p>
                                            <p className="text-sm text-white font-medium">2 attempts</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Quiz History Tab */
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left – Course Cards */}
                            <div>
                                <h4 className="text-sm font-semibold text-white mb-4">Enrolled Courses</h4>
                                <div className="space-y-3">
                                    {student.courses.map((course, index) => {
                                        const cPct = parsePct(course.completion);
                                        const mPct = parsePct(course.mastery);
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedCourse(index)}
                                                className={`rounded-lg p-4 cursor-pointer transition-all hover:border-primary/30 ${
                                                    selectedCourse === index
                                                        ? 'bg-primary/5 border-2 border-primary/30'
                                                        : 'bg-[#1a1a1a] border border-gray-800'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <h5 className="font-medium text-sm">{course.name}</h5>
                                                    <span className="text-xs font-bold" style={{ color: masteryColor(mPct) }}>{course.mastery}</span>
                                                </div>
                                                <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden mb-2">
                                                    <div className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B]"
                                                        style={{ width: mounted ? `${cPct}%` : "0%" }} />
                                                </div>
                                                <p className="text-[10px] text-gray-500">{course.completion} complete</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right – Quiz History */}
                            <div className="lg:col-span-2">
                                <div className="bg-[#1a1a1a] rounded-xl p-5 md:p-6 border border-gray-800">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{currentCourse.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                <span className="font-medium text-primary">{currentCourse.mastery} mastery</span>
                                                <span>·</span>
                                                <span>{currentCourse.completion} complete</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-500 bg-[#222] px-2.5 py-1 rounded-full">
                                            {currentCourse.modules.length} quizzes
                                        </span>
                                    </div>

                                    <div className="space-y-2.5">
                                        {currentCourse.modules.map((module, index) => {
                                            const mVal = parsePct(module.mastery);
                                            const mColor = masteryColor(mVal);
                                            const passed = mVal >= 75;

                                            return (
                                                <div
                                                    key={module.id}
                                                    className={`p-4 rounded-lg transition-all hover:border-primary/20 ${
                                                        index === 0
                                                            ? 'bg-primary/5 border-l-4 border-primary border-r border-t border-b border-r-gray-800 border-t-gray-800 border-b-gray-800'
                                                            : 'bg-[#222] border border-gray-800 hover:bg-[#252525]'
                                                    }`}
                                                    style={{ opacity: mounted ? 1 : 0, transition: `opacity 0.3s ${index * 60}ms` }}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                                passed ? "bg-[#22C55E]/10" : "bg-[#F97316]/10"
                                                            }`}>
                                                                {passed ? <CheckCircle className="w-4 h-4 text-[#22C55E]" /> : <Target className="w-4 h-4 text-[#F97316]" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h5 className="font-medium text-sm truncate">{module.name}</h5>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    {module.attempts && <span className="text-[10px] text-gray-500">{module.attempts} attempt{module.attempts > 1 ? "s" : ""}</span>}
                                                                    {module.date && <span className="text-[10px] text-gray-600">· {module.date}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <div className="w-12 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                                                                <div className="h-full rounded-full transition-all duration-1000"
                                                                    style={{ width: mounted ? `${mVal}%` : "0%", backgroundColor: mColor }} />
                                                            </div>
                                                            <span className="text-sm font-bold min-w-[36px] text-right" style={{ color: mColor }}>
                                                                {module.mastery}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <Link href={`/teacher/students/module-quiz-details?studentId=${id}&courseId=${currentCourse.id}&moduleId=${module.id}`} className="bg-primary text-black px-2 py-1 rounded-sm font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer inline-flex">
                                                                View Quiz
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Summary footer */}
                                    <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <BarChart3 className="w-3.5 h-3.5" />
                                            <span>Avg quiz score: <span className="font-medium text-primary">{currentCourse.mastery}</span></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Passed (≥75%)</span>
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F97316]" /> Needs work</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            ) : (
                <div className="bg-card shadow-[0_4px_4px_0] shadow-primary/20 rounded-xl p-8 border text-center text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" />
                    <p className="text-lg font-medium text-white mb-1">No Courses Found</p>
                    <p>This student is not enrolled in any active courses.</p>
                </div>
            )}
        </div>
    );
}