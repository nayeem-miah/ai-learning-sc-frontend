"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, User, Bell, ArrowRight, Trash2, CheckCircle, Clock, Eye, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { useGetCourseByIdQuery, useUpdateCourseMutation, useGetTeachersQuery, useRemoveTeacherMutation } from "@/lib/feature/courses/coursesApi";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function CoursePublish() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const { data: courseRes, isLoading: isFetching } = useGetCourseByIdQuery(id as string, { skip: !id });
    const [updateCourse, { isLoading }] = useUpdateCourseMutation();

    const course = courseRes?.data;
    const [mounted, setMounted] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const { data: teachersRes } = useGetTeachersQuery();
    const [removeTeacher, { isLoading: isRemovingTeacher }] = useRemoveTeacherMutation();
    const teachers = teachersRes?.data || [];

    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("11:00");
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

    useEffect(() => { const timer = setTimeout(() => setMounted(true), 10); return () => clearTimeout(timer); }, []);

    const completionSteps = [
        { label: "Start Date", done: startDate !== "" },
        { label: "Schedule", done: startTime !== "" && endTime !== "" },
        { label: "Teacher", done: selectedTeacherId !== null },
    ];
    const completionPercent = Math.round((completionSteps.filter(s => s.done).length / completionSteps.length) * 100);

    useEffect(() => {
        if (course) {
            setStartDate(course.startDate ? course.startDate.split('T')[0] : "");
            setStartTime(course.startTime || "09:00");
            setEndTime(course.endTime || "11:00");
            setSelectedTeacherId(course.teacherId || null);
        }
    }, [course]);

    const handleRemoveTeacherAction = async () => {
        setSelectedTeacherId(null);
        if (!id) return;
        try {
            await removeTeacher(id).unwrap();
            toast.success("Teacher removed from course");
        } catch (err: any) {
            // Silently fail teacher remove
        }
    };

    const handlePublish = async () => {
        if (!id) {
            toast.error("No course ID provided");
            return;
        }

        try {
            await updateCourse({
                id: id as string,
                courseName: course?.courseName,
                subject: course?.subject,
                description: course?.description || "Updated course details",
                isPublished: false, // Strictly keep as draft
                startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
                startTime,
                endTime,
                teacherId: selectedTeacherId || undefined
            }).unwrap();

            setShowSuccess(true);
            setTimeout(() => router.push("/admin/courses"), 1000);
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to save settings");
        }
    };

    return (
        <div className={`min-h-screen text-white p-4 md:p-8 pb-24 transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
            <div className="max-w-7xl space-y-6">

                {/* Header */}
                <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <div>
                                <h1 className="text-[#d4b57e] font-bold text-lg uppercase tracking-wider">Finalize Setup</h1>
                                <p className="text-gray-400 text-sm">Assign a teacher and schedule for this course draft</p>
                            </div>
                        </div>
                        {/* Completion indicator */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Readiness</p>
                                <p className="text-[#D4AF37] font-bold">{completionPercent}%</p>
                            </div>
                            <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/30 flex items-center justify-center relative">
                                <svg className="w-12 h-12 -rotate-90 absolute" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15" fill="none" stroke="#333" strokeWidth="2" />
                                    <circle cx="18" cy="18" r="15" fill="none" stroke="#D4AF37" strokeWidth="2"
                                        strokeDasharray={`${completionPercent * 0.94} 94`}
                                        strokeLinecap="round"
                                        className="transition-all duration-500"
                                    />
                                </svg>
                                <Eye className="w-4 h-4 text-[#D4AF37] z-10" />
                            </div>
                        </div>
                    </div>

                    {/* Step indicators */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800">
                        {completionSteps.map((step, i) => (
                            <div key={i} className="flex-1">
                                <div className={`h-1 rounded-full transition-all duration-500 ${step.done ? "bg-[#D4AF37]" : "bg-[#2a2a2a]"}`} />
                                <p className={`text-[10px] mt-1.5 ${step.done ? "text-[#D4AF37]" : "text-gray-600"}`}>{step.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Start Date */}
                <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all group">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-[#D4AF37]/10 rounded-md group-hover:bg-[#D4AF37]/20 transition-colors">
                            <Calendar className="w-4 h-4 text-[#d4b57e]" />
                        </div>
                        <h2 className="text-[#d4b57e] font-bold text-xs uppercase">Course Start Date</h2>
                    </div>
                    <div className="relative">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-[#d4b57e] focus:ring-1 focus:ring-[#d4b57e]/20 placeholder-gray-500 transition-all"
                            placeholder="mm/dd/yyyy"
                        />
                    </div>
                    <p className="text-gray-500 text-[10px] mt-2">Students will gain access to course materials on this date</p>
                </div>

                {/* Course Schedule */}
                <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all group">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-[#D4AF37]/10 rounded-md group-hover:bg-[#D4AF37]/20 transition-colors">
                            <Clock className="w-4 h-4 text-[#d4b57e]" />
                        </div>
                        <h2 className="text-[#d4b57e] font-bold text-xs uppercase">Course Schedule</h2>
                        {startTime && endTime && (
                            <span className="ml-auto text-xs text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded-md">
                                Duration: {(() => {
                                    const [sh, sm] = startTime.split(":").map(Number);
                                    const [eh, em] = endTime.split(":").map(Number);
                                    const diff = (eh * 60 + em) - (sh * 60 + sm);
                                    return diff > 0 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : "—";
                                })()}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-500 block mb-1.5">Start Time</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-[#d4b57e] focus:ring-1 focus:ring-[#d4b57e]/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 block mb-1.5">End Time</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-[#d4b57e] focus:ring-1 focus:ring-[#d4b57e]/20 transition-all"
                            />
                        </div>
                    </div>
                </div>


                {/* Assign Teacher */}
                <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all group">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-[#D4AF37]/10 rounded-md group-hover:bg-[#D4AF37]/20 transition-colors">
                            <User className="w-4 h-4 text-[#d4b57e]" />
                        </div>
                        <h2 className="text-[#d4b57e] font-bold text-xs uppercase">Assign Teacher</h2>
                    </div>

                    {!selectedTeacherId ? (
                        <div className="space-y-4">
                            <Select onValueChange={setSelectedTeacherId} value={selectedTeacherId || ""}>
                                <SelectTrigger className="w-full bg-[#1a1a1a] border-gray-700 text-gray-300 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]">
                                    <SelectValue placeholder="Select a teacher..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-gray-800 text-gray-300">
                                    {teachers.map((t: any) => (
                                        <SelectItem
                                            key={t.id}
                                            value={t.id}
                                            className="hover:bg-[#D4AF37]/10 focus:bg-[#D4AF37]/10 data-[highlighted]:bg-[#D4AF37]/20 cursor-pointer transition-colors [&>span]:w-full"
                                        >
                                            <div className="flex items-center gap-2 py-1">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                                                    {t.avatar ? (
                                                        <img src={t.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-[#D4AF37] uppercase">
                                                            {t.name?.[0] || t.email?.[0] || "T"}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-medium text-gray-300 data-[highlighted]:text-white transition-colors truncate">
                                                        {t.name || t.email}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-500 data-[highlighted]:text-gray-200 transition-colors uppercase tracking-wider">
                                                        {t.role || "TEACHER"}
                                                    </span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-lg border border-[#D4AF37]/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {teachers.find((t: any) => t.id === selectedTeacherId)?.avatar ? (
                                        <img
                                            src={teachers.find((t: any) => t.id === selectedTeacherId)?.avatar}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-[#D4AF37] text-sm font-bold uppercase select-none">
                                            {teachers.find((t: any) => t.id === selectedTeacherId)?.name?.[0] || teachers.find((t: any) => t.id === selectedTeacherId)?.email?.[0] || "T"}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-200 truncate">
                                        {teachers.find((t: any) => t.id === selectedTeacherId)?.name || teachers.find((t: any) => t.id === selectedTeacherId)?.email || "Teacher Unnamed"}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {teachers.find((t: any) => t.id === selectedTeacherId)?.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleRemoveTeacherAction}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all disabled:opacity-50"
                                disabled={isRemovingTeacher}
                            >
                                {isRemovingTeacher ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Notification Settings */}
                <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 flex items-center justify-between hover:border-gray-700 transition-all">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#D4AF37]/10 rounded-md">
                                <Bell className="w-4 h-4 text-[#d4b57e]" />
                            </div>
                            <h2 className="text-[#d4b57e] font-bold text-xs uppercase">Notification Settings</h2>
                        </div>
                        <p className="text-gray-500 text-[10px] ml-9">Email and in-app notifications enabled for course updates</p>
                    </div>
                    <Switch defaultChecked />
                </div>

                {/* Publication Summary */}
                <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
                    <div className="flex items-center gap-2 mb-6">
                        <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                        <h2 className="text-[#d4b57e] font-bold text-xs uppercase">Publication Summary</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { label: "Course", value: course?.courseName || "—", highlight: false },
                            { label: "Duration", value: course?.courseLength || "—", highlight: false },
                            { label: "Schedule", value: `${course?.startTime || "—"} - ${course?.endTime || "—"}`, highlight: false },
                            {
                                label: "Teacher",
                                value: teachers.find((t: any) => t.id === selectedTeacherId)
                                    ? (teachers.find((t: any) => t.id === selectedTeacherId)?.name || teachers.find((t: any) => t.id === selectedTeacherId)?.email)
                                    : "Not Assigned",
                                highlight: true
                            },
                            { label: "Modules", value: String(course?.totalModules || "—"), highlight: true },
                            { label: "Mastery Requirement", value: `${course?.masteryRequirement || "—"}%`, highlight: true },
                        ].map((item, i) => (
                            <div key={i} className="p-3 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                                <label className="text-gray-500 text-[10px] block mb-1">{item.label}</label>
                                <p className={`font-semibold text-sm ${item.highlight ? "text-[#D4AF37]" : "text-white"}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handlePublish}
                        disabled={isLoading || course?.isPublished}
                        className="bg-[#d4b57e] hover:bg-[#c4a56e] text-black font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#d4b57e]/20 active:scale-[0.98]"
                    >
                        <span>{isLoading ? "Saving..." : "Process Done"}</span>
                        {!isLoading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </div>

            </div>

            {/* Success Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-[#22C55E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Process Completed!</h2>
                        <p className="text-gray-400 text-sm">Course remains as draft. Redirecting...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function Switch({ defaultChecked = false }: { defaultChecked?: boolean }) {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <button
            onClick={() => setChecked(!checked)}
            className={`w-12 h-6 rounded-full p-1 transition-all duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#d4b57e] shadow-lg shadow-[#d4b57e]/20' : 'bg-gray-700'}`}
        >
            <div
                className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`}
            />
        </button>
    );
}
