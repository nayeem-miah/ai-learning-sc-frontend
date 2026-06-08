"use client";
import { Clock, ChevronRight, Calendar, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLazyGetCourseByIdQuery, Course } from "@/lib/feature/courses/coursesApi";
import { useStartAttendanceMutation } from "@/lib/feature/attendance/attendanceApi";
import { toast } from "sonner";

interface NextClass {
    courseId: string;
    courseName: string;
    subject: string;
    moduleId: string;
    moduleTitle: string;
    moduleNumber: number;
    startTime: string;
    endTime: string;
    absoluteStart: string;
    type: string;
}

const ClassCard = ({ item, index, onStart, isStarting }: { item: any, index: number, onStart: (courseId: string, moduleId?: string) => void, isStarting: boolean }) => {
    return (
        <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 hover:border-[#C08F42]/30 transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {index === 0 && (
                            <span className="px-3 py-1 bg-[#C08F42] text-black text-[10px] font-black rounded-full uppercase tracking-widest mr-2">
                                Next Up
                            </span>
                        )}
                        <p className="text-xs text-[#C08F42] font-bold uppercase tracking-widest">{item.subject}</p>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#C08F42] transition-colors mb-3">
                        {item.courseName}
                    </h3>
                    {item.moduleTitle && (
                         <p className="text-sm text-zinc-400 mb-3">
                            <span className="text-[#C08F42]">Current Module:</span> {item.moduleTitle}
                         </p>
                    )}
                    <div className="flex items-center gap-4 text-zinc-400 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                            <Clock size={16} className="text-[#C08F42]" />
                            <span className="font-medium">
                                {item.startTime && item.endTime
                                    ? `${item.startTime} - ${item.endTime}`
                                    : item.startTime || item.endTime || "Not Scheduled"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${item.startTime ? "bg-green-500 animate-pulse" : "bg-zinc-600"}`} />
                            <span className="uppercase text-[10px] font-bold tracking-widest text-zinc-500">
                                {item.startTime ? "Scheduled" : "Pending"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="shrink-0">
                    <button
                        onClick={() => onStart(item.id || item.courseId, item.moduleId)}
                        disabled={isStarting}
                        className="px-8 py-4 bg-[#C08F42] hover:bg-[#D4AF37] text-black font-medium rounded-md flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isStarting ? "Loading..." : "Start Lesson"}
                        {!isStarting && <ChevronRight size={20} strokeWidth={3} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function TeacherClass({ nextClasses, nextClass }: { nextClasses?: Course[], nextClass?: NextClass }) {
    const router = useRouter();
    const [getCourse, { isLoading: isFetchingCourse }] = useLazyGetCourseByIdQuery();
    const [startAttendance, { isLoading: isStartingAttendance }] = useStartAttendanceMutation();

    const isStarting = isFetchingCourse || isStartingAttendance;

    const handleStartLesson = async (courseId: string, moduleId?: string) => {
        try {
            let activeModuleId = moduleId;
            
            if (!activeModuleId) {
                const courseResponse = await getCourse(courseId).unwrap();
                const courseData = courseResponse.data;
                activeModuleId = courseData.modules?.[0]?.id;
            }

            if (!activeModuleId) {
                toast.error("No modules found for this course. Please set up modules first.");
                return;
            }

            const attendanceResponse = await startAttendance({
                courseId: courseId,
                moduleId: activeModuleId
            }).unwrap();

            if (attendanceResponse.success) {
                toast.success(attendanceResponse.message || "Class started successfully");
                router.push(`/teacher/dashboard/learning?courseId=${courseId}&moduleId=${activeModuleId}&attendanceId=${attendanceResponse.data.id}`);
            }
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || "Failed to initialize lesson. Please try again.");
        }
    };

    const hasNextClasses = (nextClasses && nextClasses.length > 0) || nextClass;

    if (!hasNextClasses) {
        return (
            <div className="bg-[#121212] border border-white/10 rounded-xl p-8 text-center">
                <Calendar size={28} className="text-[#C08F42] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Upcoming Classes</h2>
                <p className="text-sm text-zinc-400">Your schedule is currently clear. Take this time to prepare for your next sessions!</p>
            </div>
        );
    }

    return (
        <div className="bg-[#121212] border border-white/10 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/5 rounded-xl border border-[#C08F42]/20">
                    <Calendar size={24} className="text-[#C08F42]" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Upcoming Classes</h2>
                    <p className="text-sm text-zinc-400">Manage and join your scheduled lessons</p>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {nextClass && (
                    <ClassCard
                        item={nextClass}
                        index={0}
                        onStart={handleStartLesson}
                        isStarting={isStarting}
                    />
                )}
                {nextClasses && nextClasses.length > 0 && nextClasses.map((item, index) => (
                    <ClassCard
                        key={item.id}
                        item={item}
                        index={nextClass ? index + 1 : index}
                        onStart={handleStartLesson}
                        isStarting={isStarting}
                    />
                ))}
            </div>

            {/* Loading Overlay */}
            {isStarting && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                    <Loader className="w-12 h-12 text-[#C08F42] animate-spin" />
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white">Initializing Lesson...</h3>
                        <p className="text-zinc-400 text-sm mt-1">Preparing your modules and resources</p>
                    </div>
                </div>
            )}
        </div>
    );
}