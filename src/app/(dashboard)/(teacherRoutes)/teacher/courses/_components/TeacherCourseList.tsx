"use client"
import { Eye, Trash2, AlertCircle, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetTeacherPublishedCoursesQuery, useRemoveTeacherMutation } from '@/lib/feature/courses/coursesApi';
import { useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';

const CourseCard = ({
    id,
    title,
    grade,
    description,
    studentCount,
    moduleCount,
    onDelete
}: {
    id: string;
    title: string;
    grade: string;
    description: string;
    studentCount: number;
    moduleCount: number;
    onDelete: (id: string, title: string) => void;
}) => {
    const router = useRouter();
    return (
        <div className="relative flex flex-col w-full max-w-[480px] min-h-[260px] p-6 bg-[#121212] border border-white/10 rounded-xl transition-all hover:border-white/20">
            {/* Student Count - Top Right */}
            <div className="absolute top-4 right-6 text-zinc-400 text-sm font-light">
                {studentCount} students
            </div>

            {/* Title */}
            <h2 className="mt-8 text-xl font-semibold text-zinc-100 tracking-tight">
                {title}
            </h2>

            {/* Grade Level */}
            <p className="mt-2 text-[#C08F42] font-medium text-sm">
                Grade {grade}
            </p>

            {/* Description */}
            <p className="mt-4 text-zinc-400 leading-relaxed text-[15px] grow line-clamp-3">
                {description}
            </p>

            {/* Footer: Module Count and Delete Action */}
            <div className="mt-6 flex justify-between items-end">
                <span className="text-zinc-500 text-sm font-light">
                    {moduleCount} modules
                </span>
                <div className='flex gap-2'>
                    <button
                        onClick={() => router.push(`/teacher/courses/${id}`)}
                        className="p-2 cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors bg-white/5 rounded-lg border border-white/5"
                        aria-label="View course"
                    >
                        <Eye size={20} />
                    </button>

                    <button
                        onClick={() => onDelete(id, title)}
                        className="p-2 cursor-pointer text-red-500/80 hover:text-red-500 transition-colors bg-white/5 rounded-lg border border-white/5"
                        aria-label="Delete course"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function TeacherCourseList() {
    const { data, isLoading: itemsLoading, error } = useGetTeacherPublishedCoursesQuery();
    const [removeTeacher, { isLoading: isRemoving }] = useRemoveTeacherMutation();
    
    const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string } | null>(null);

    const handleDelete = async () => {
        if (!selectedCourse) return;

        try {
            await removeTeacher(selectedCourse.id).unwrap();
            toast.success(`You have been removed from "${selectedCourse.title}" successfully.`);
            setSelectedCourse(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to remove course. Please try again.");
        }
    };

    if (itemsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
                <Loader className="w-10 h-10 text-[#C08F42] animate-spin" />
                <p className="text-zinc-400 animate-pulse">Loading your courses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4 p-10">
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl flex flex-col items-center gap-3 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <h3 className="text-zinc-100 font-semibold text-lg">Failed to load courses</h3>
                    <p className="text-zinc-400 text-sm">
                        {(error as any)?.data?.message || "Something went wrong while fetching your courses. Please try again later."}
                    </p>
                </div>
            </div>
        );
    }

    const courses = data?.data || [];

    return (
        <div className="p-10">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Your Courses</h2>
                <p className="text-zinc-400 mt-2">View your assigned curriculum and course structures</p>
            </div>
            
            <main className="flex gap-6 flex-wrap">
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <CourseCard 
                            key={course.id} 
                            id={course.id}
                            title={course.courseName}
                            grade={course.targetGradeLevel}
                            description={course.description || course.generatedCourseName}
                            studentCount={course.class?.totalStudents || 0}
                            moduleCount={course.totalModules}
                            onDelete={(id, title) => setSelectedCourse({ id, title })}
                        />
                    ))
                ) : (
                    <div className="w-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
                        <p className="text-zinc-500">No published courses found.</p>
                    </div>
                )}
            </main>

            <ConfirmModal 
                open={!!selectedCourse}
                onClose={() => setSelectedCourse(null)}
                onConfirm={handleDelete}
                loading={isRemoving}
                title="Remove from Course"
                description={`Are you sure you want to remove yourself from "${selectedCourse?.title}"? This will unassign you as the teacher for this course.`}
                confirmText="Remove Me"
                variant="delete"
            />
        </div>
    );
}