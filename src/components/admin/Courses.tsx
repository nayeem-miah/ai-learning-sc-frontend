"use client";

import { Button } from "@/components/ui/button";
import { Trash2, BookOpen, Users, BarChart3, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useGetAllCoursesQuery, useUpdateCourseMutation, useDeleteCourseMutation } from "@/lib/feature/courses/coursesApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function Courses() {
    const { data: response, isLoading, error } = useGetAllCoursesQuery();
    const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
    const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
    const courses = response?.data || [];

    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const [publishingId, setPublishingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleConfirmDelete = async () => {
        if (!courseToDelete) return;

        const idToDelete = courseToDelete;
        setDeletingId(idToDelete);

        try {
            await deleteCourse(idToDelete).unwrap();
            toast.success("Course deleted successfully!");
            setCourseToDelete(null); // Close modal only after success
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete course");
        } finally {
            setDeletingId(null);
        }
    }

    const handleTogglePublish = async (course: any) => {
        setPublishingId(course.id);
        const newStatus = !course.isPublished;
        try {
            await updateCourse({
                id: course.id,
                courseName: course.courseName,
                subject: course.subject,
                description: course.description || "Synthesized by AI",
                isPublished: newStatus,
                startDate: course.startDate || new Date().toISOString(),
                startTime: course.startTime || "10:20 AM",
                endTime: course.endTime || "12:20 PM",
                teacherId: course.teacherId || "6983160b106883775a56936a"
            }).unwrap();
            toast.success(`Course ${newStatus ? "activated" : "deactivated"} successfully!`);
        } catch (err: any) {
            toast.error(err?.data?.message || `Failed to change status`);
        } finally {
            setPublishingId(null);
        }
    };

    const getStatusStyles = (status: boolean) => {
        if (status) return "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20";
        return "bg-[#D0AD6B]/10 text-[#D0AD6B] border-[#D0AD6B]/20";
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
                <p className="text-gray-400 animate-pulse">Fetching your courses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
                <p className="text-red-500 font-medium mb-2">Failed to load courses</p>
                <p className="text-red-400 text-sm">Please check your connection and try again.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-0">
            {/* Header Section */}
            <div className="bg-card shadow-[0_4px_4px_0] border shadow-primary/20 rounded-xl p-6 md:p-8 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-[#D4AF37] text-xs font-medium tracking-wider uppercase mb-1">Curriculum</p>
                    <h2 className="text-primary text-xl md:text-2xl font-semibold mb-1">Your Courses</h2>
                    <p className="text-secondary text-xs md:text-sm">
                        {courses.length} courses • {courses.filter(c => c.isPublished).length} active
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link href="/admin/ai-generator" className="flex-1 md:flex-none">
                        <button className="w-full flex items-center justify-center gap-2 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] px-5 py-2 rounded-2xl text-sm font-medium cursor-pointer hover:bg-[#D4AF37]/10 transition-all">
                            <Sparkles className="w-4 h-4" />
                            AI Generate
                        </button>
                    </Link>
                    <Link href="/admin/courses/config" className="flex-1 md:flex-none">
                        <button className="w-full bg-primary text-black px-6 py-2 rounded-2xl text-base font-normal cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-all">
                            Configure
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {courses.map((course, idx) => (
                    <div
                        key={course.id}
                        className="bg-card shadow-[0_4px_4px_0] border shadow-primary/20 rounded-xl p-5 md:p-6 flex flex-col h-full min-h-62.5 group hover:border-[#D4AF37]/30 transition-all duration-300"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className={`px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-medium border ${getStatusStyles(course.isPublished)}`}>
                                {course.isPublished && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22C55E] mr-1.5 animate-pulse" />}
                                {course.isPublished ? "Active" : "Draft"}
                            </span>
                            <button
                                onClick={() => setCourseToDelete(course.id)}
                                className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg active:scale-90 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                disabled={isDeleting && deletingId === course.id}
                            >
                                {isDeleting && deletingId === course.id ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Trash2 size={18} strokeWidth={1.5} />
                                )}
                            </button>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-foreground text-base md:text-xl font-semibold mb-1 group-hover:text-[#D4AF37] transition-colors line-clamp-1">{course.courseName}</h3>
                            <p className="text-primary text-sm font-medium mb-2">{course.class?.gradeLevel || course.targetGradeLevel}</p>
                            <p className="text-secondary text-sm font-normal leading-relaxed line-clamp-2 italic">
                                {course.generatedCourseName}
                            </p>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-gray-400">Course Progress</span>
                                <span className="text-white font-medium">0%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#2D2D2D] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `0%` }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-4 mt-auto">
                            <div className="flex items-center gap-1.5 text-secondary text-xs font-normal">
                                <BookOpen size={14} className="text-[#D4AF37]" /> {course.totalModules} modules
                            </div>
                            <div className="flex items-center gap-1.5 text-secondary text-xs font-normal">
                                <Users size={14} className="text-[#D4AF37]" /> {course.class?.totalStudents || 0} students
                            </div>
                            <div className="flex items-center gap-1.5 text-secondary text-xs font-normal">
                                <Clock size={14} className="text-[#D4AF37]" /> {course.estimatedDurationMinPerClass} min/class
                            </div>
                            <div className="flex items-center gap-1.5 text-secondary text-xs font-normal">
                                <BarChart3 size={14} className="text-[#D4AF37]" /> {course.masteryRequirement}% Mastery
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <Button
                                onClick={() => handleTogglePublish(course)}
                                disabled={isUpdating && publishingId === course.id}
                                className={`h-auto py-2 md:py-2.5 rounded-2xl text-sm font-medium active:scale-95 transition-all cursor-pointer shadow-lg disabled:opacity-50 ${
                                    !course.isPublished 
                                    ? "bg-[#22C55E] text-white hover:bg-[#16a34a] hover:shadow-[#22C55E]/30" 
                                    : "bg-[#D0AD6B] text-black hover:bg-[#D0AD6B]/90 hover:shadow-[#D0AD6B]/20"
                                }`}
                            >
                                {isUpdating && publishingId === course.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    course.isPublished ? "Inactive Course" : "Active Course"
                                )}
                            </Button>

                            <Button
                                asChild
                                variant="outline"
                                className="h-auto border-foreground/20 text-foreground py-2 md:py-2.5 rounded-2xl text-sm font-medium hover:text-primary hover:border-primary/30 hover:bg-transparent active:scale-95 transition-all cursor-pointer"
                            >
                                <Link href={`/admin/courses/${course.id}`}>
                                    View
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-card rounded-xl border border-dashed border-gray-700">
                        <BookOpen className="w-12 h-12 text-gray-600 mb-4" />
                        <p className="text-secondary text-center font-medium">No courses available yet.</p>
                        <p className="text-gray-500 text-sm mt-1">Start by generating a course with AI.</p>
                    </div>
                )}
            </div>

            <AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
                <AlertDialogContent className="bg-card border shadow-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-primary">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-secondary">
                            This action cannot be undone. This will permanently delete the course
                            and remove all associated data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-primary/20 text-foreground hover:bg-primary/10" disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmDelete();
                            }}
                            className="bg-destructive text-white hover:bg-destructive/90 transition-all min-w-[120px]"
                            disabled={isDeleting}
                        >
                            {isDeleting && deletingId === courseToDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Course"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
