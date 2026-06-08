"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, User, Bell, Trash2, Loader2, ArrowRight } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { format, parse } from "date-fns";
import { useGetCourseByIdQuery, useUpdateCourseMutation, useGetTeachersQuery, useRemoveTeacherMutation } from "@/lib/feature/courses/coursesApi";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomSwitch } from "@/components/ui/custom-switch";

export default function PublishCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const courseId = resolvedParams?.id as string;

    const { data: courseRes, isLoading: isCourseLoading, isError, error: courseError } = useGetCourseByIdQuery(courseId, { skip: !courseId });
    const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
    const { data: teachersRes } = useGetTeachersQuery();
    const [removeTeacher, { isLoading: isRemovingTeacher }] = useRemoveTeacherMutation();

    const course = courseRes?.data;
    const teachers = teachersRes?.data || [];

    const [mounted, setMounted] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    // Form state
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("09:00 AM");
    const [endTime, setEndTime] = useState("11:00 AM");
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        setMounted(true);
        if (course) {
            if (course.startDate) setStartDate(format(new Date(course.startDate), "yyyy-MM-dd"));
            if (course.startTime) setStartTime(course.startTime);
            if (course.endTime) setEndTime(course.endTime);
            if (course.teacherId) setSelectedTeacherId(course.teacherId);
        }
    }, [course]);

    const handleRemoveTeacher = async () => {
        setSelectedTeacherId(null);
        if (!courseId) return;
        try {
            await removeTeacher(courseId).unwrap();
            toast.success("Teacher removed from course");
        } catch (err: any) {
            // Error handling
        }
    };

    const handlePublishCourse = async () => {
        if (!courseId) return;

        setIsFinalizing(true);
        try {
            const updatePayload = {
                id: courseId,
                isPublished: false, // Keep it as draft, admin will publish later from courses list
                startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
                startTime: startTime,
                endTime: endTime,
                teacherId: selectedTeacherId || undefined
            };

            await updateCourse(updatePayload).unwrap();
            toast.success("Course settings saved successfully!");
            router.push("/admin/courses");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to publish course. Please try again.");
        } finally {
            setIsFinalizing(false);
        }
    };

    if (isCourseLoading || !mounted) {
        return (
            <div className="min-h-screen text-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen text-white flex items-center justify-center flex-col gap-4">
                <div className="text-center p-8 bg-red-500/10 rounded-xl border border-red-500/20 max-w-md w-full">
                    <h2 className="text-xl font-bold mb-2 text-red-500">Course not found</h2>
                    {isError && (
                        <p className="text-sm text-red-400 mb-4 break-words">
                            Error: {JSON.stringify(courseError)}
                        </p>
                    )}
                    <button onClick={() => router.push('/admin/courses')} className="text-[#D0AD6B] underline">Go back</button>
                    <button onClick={() => window.location.reload()} className="text-white ml-4 underline">Reload</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white pb-8 transition-opacity duration-500 opacity-100">
            <div>
                {/* Header Section */}
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D0AD6B]/5 blur-3xl rounded-full -mr-32 -mt-32" />
                    <h1 className="text-white text-2xl font-bold mb-2 uppercase">Finalize Setup</h1>
                    <p className="text-gray-400 text-sm">Finalize settings and make {course.courseName || course.subject} available to students</p>
                </div>

                {/* Course Start Date */}
                <div className="bg-[#121212] border border-gray-800 rounded-2xl p-7 mb-6 hover:border-[#D0AD6B]/40 hover:shadow-2xl hover:shadow-[#D0AD6B]/5 transition-all duration-500 group relative overflow-hidden hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D0AD6B]/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[#D0AD6B]/10 transition-colors duration-500" />
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2.5 bg-[#D0AD6B]/10 rounded-xl group-hover:scale-110 group-hover:bg-[#D0AD6B]/20 transition-all duration-300">
                            <Calendar className="w-4 h-4 text-[#D0AD6B]" />
                        </div>
                        <div>
                            <h2 className="text-[#D0AD6B] text-[10px] font-black uppercase">Course Start Date</h2>
                            <p className="text-gray-500 text-[10px] font-medium tracking-tight">Select when students can begin</p>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <DatePicker
                            date={startDate ? parse(startDate, "yyyy-MM-dd", new Date()) : undefined}
                            setDate={(d) => setStartDate(d ? format(d, "yyyy-MM-dd") : "")}
                            placeholder="Select starting date..."
                        />
                    </div>
                </div>

                {/* Course Schedule */}
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 mb-6 relative hover:border-[#D0AD6B]/30 transition-all">
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="w-4 h-4 text-[#D0AD6B]" />
                        <h2 className="text-[#D0AD6B] text-xs font-bold uppercase tracking-wider">COURSE SCHEDULE</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <TimePicker value={startTime} onChange={setStartTime} placeholder="09:00 AM" />
                        </div>
                        <div className="relative">
                            <TimePicker value={endTime} onChange={setEndTime} placeholder="11:00 AM" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-[10px] mt-4 ml-1">Students will gain access to course materials on this time</p>
                </div>

                {/* Assign Teacher */}
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 mb-6 hover:border-[#D0AD6B]/30 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-4 h-4 text-[#D0AD6B]" />
                        <h2 className="text-[#D0AD6B] text-xs font-bold uppercase tracking-wider">ASSIGN TEACHER</h2>
                    </div>

                    {!selectedTeacherId ? (
                        <div className="space-y-4">
                            <Select onValueChange={setSelectedTeacherId} value={selectedTeacherId || ""}>
                                <SelectTrigger className="w-full bg-[#111] border-gray-800 text-gray-300 focus:ring-[#D0AD6B]/20 focus:border-[#D0AD6B] h-12">
                                    <SelectValue placeholder="Search teacher..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111] border-gray-800 text-gray-300">
                                    {teachers.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id} className="hover:bg-primary/10 focus:bg-primary/10">
                                            <div className="flex items-center gap-2 py-1">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#D0AD6B]/10 border border-[#D0AD6B]/20 flex items-center justify-center">
                                                    {t.avatar ? (
                                                        <img src={t.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-[#D0AD6B] uppercase">{t.name?.[0] || t.email?.[0] || "T"}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{t.name || t.email}</span>
                                                    <span className="text-[10px] text-gray-500">{t.role || "Teacher"}</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-gray-800 rounded-xl group hover:border-[#D0AD6B]/40 transition-all">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-lg bg-[#D0AD6B]/10 border border-[#D0AD6B]/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {teachers.find((t: any) => t.id === selectedTeacherId)?.avatar ? (
                                        <img
                                            src={teachers.find((t: any) => t.id === selectedTeacherId)?.avatar}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-[#D0AD6B] text-lg font-bold uppercase select-none">
                                            {teachers.find((t: any) => t.id === selectedTeacherId)?.name?.[0] || teachers.find((t: any) => t.id === selectedTeacherId)?.email?.[0] || "T"}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-200">
                                        {teachers.find((t: any) => t.id === selectedTeacherId)?.name || teachers.find((t: any) => t.id === selectedTeacherId)?.email || "Teacher Name"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {teachers.find((t: any) => t.id === selectedTeacherId)?.role || "Subject Specialist"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleRemoveTeacher}
                                className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all flex-shrink-0 ml-2 disabled:opacity-50"
                                disabled={isRemovingTeacher}
                            >
                                {isRemovingTeacher ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Notification Settings */}
                <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 mb-6 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Bell className="w-4 h-4 text-[#D0AD6B] flex-shrink-0" />
                            <h2 className="text-[#D0AD6B] text-xs font-bold uppercase tracking-wider truncate">NOTIFICATION SETTINGS</h2>
                        </div>
                        <p className="text-gray-500 text-[10px]">Email and in-app notifications enabled for course updates</p>
                    </div>
                    <div className="flex-shrink-0">
                        <CustomSwitch checked={notificationsEnabled} onCheckedChange={() => setNotificationsEnabled(!notificationsEnabled)} />
                    </div>
                </div>

                {/* Publication Summary */}
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 mb-6 hover:border-[#D0AD6B]/20 transition-all">
                    <h2 className="text-[#D0AD6B] text-[10px] font-black uppercase tracking-[0.2em] mb-8">PUBLICATION SUMMARY</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-10 gap-x-8">
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase mb-2 font-black tracking-widest">Course:</p>
                            <p className="text-sm text-gray-200 font-bold">{course.courseName || course.subject}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase mb-2 font-black tracking-widest">Duration:</p>
                            <p className="text-sm text-gray-200 font-bold">{course.courseLength === "6 Months" ? "Semester" : "Full-Year"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase mb-2 font-black tracking-widest">Semester Count:</p>
                            <p className="text-sm text-gray-200 font-bold">{course.semesterCount}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase mb-2 font-black tracking-widest">Modules:</p>
                            <p className="text-sm font-bold text-[#D0AD6B]">{course.totalModules}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase mb-2 font-black tracking-widest">Mastery Requirement:</p>
                            <p className="text-sm font-bold text-[#D0AD6B]">{course.masteryRequirement}%</p>
                        </div>
                    </div>
                </div>

                {/* Process done Button */}
                <div className="flex justify-end pb-12 mt-4 border-t border-white/5 pt-8">
                    <button
                        onClick={handlePublishCourse}
                        disabled={isUpdating || isFinalizing}
                        className="bg-[#D4AF37] hover:bg-[#b89a31] text-black font-bold py-4 px-12 rounded-xl flex items-center gap-3 transition-all shadow-xl hover:shadow-[#D4AF37]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group w-full md:w-auto justify-center"
                    >
                        {isFinalizing || isUpdating ? (
                            <>
                                <span className="text-sm uppercase tracking-widest font-black">Saving...</span>
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </>
                        ) : (
                            <>
                                <span className="text-sm uppercase tracking-widest font-black text-black">Process Done</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>

                {/* Final Generation Overlay */}
                {isFinalizing && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
                            <h2 className="text-white text-xl font-bold mb-2 uppercase">Saving Settings</h2>
                            <p className="text-gray-400 text-sm">Finishing process and remaining as draft...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
