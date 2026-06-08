"use client";

import React, { use } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetStudentCourseDetailsQuery, useCompleteLessonMutation } from "@/lib/feature/courses/coursesApi";
import { toast } from "sonner";

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
    const router = useRouter();
    const { courseId } = use(params);
    const { data: response, isLoading } = useGetStudentCourseDetailsQuery(courseId);
    const [completeLesson, { isLoading: isCompleting }] = useCompleteLessonMutation();

    const apiCourse = response?.data;
    const course = apiCourse ? {
        title: apiCourse.courseName || "Untitled Course",
        description: apiCourse.description || "No description provided.",
        progress: apiCourse.overallProgress || 0,
        mastery: apiCourse.overallMastery || 0,
        modules: apiCourse.modules?.map(m => ({
            id: m.id,
            number: m.moduleNumber,
            title: m.moduleTitle || `Module ${m.moduleNumber}`,
            duration: "3 weeks",
            lessonsTotal: m.studyTopics?.length || 0,
            lessonsCompleted: m.lessonProgresses?.filter((lp: any) => lp.isCompleted).length || 0,
            lessons: m.studyTopics?.map((t: any, idx: number) => ({
                id: m.id, // Using module ID as lesson ID per backend logic
                title: t.topic_name,
                type: "Lecture",
                duration: "60 min",
                completed: m.lessonProgresses?.some((lp: any) => lp.lessonId === m.id && lp.isCompleted) || false,
            })) || [],
            quiz: m.quizQuestions && m.quizQuestions.length > 0 ? {
                id: m.id,
                title: `Quiz ${m.moduleNumber}: Fundamentals`,
                score: m.quizScore || 0
            } : null
        })) || [],
        masteryRequirement: apiCourse.stats?.masteryRequirement || apiCourse.masteryRequirement || 0,
        averageMastery: apiCourse.stats?.averageMastery || 0,
        modulesTotal: apiCourse.stats?.modulesTotal || 0,
        modulesCompleted: apiCourse.stats?.modulesCompleted || 0,
        lessonsTotal: apiCourse.stats?.lessonsTotal || 0,
        lessonsCompleted: apiCourse.stats?.lessonsCompleted || 0,
        assessmentsTotal: apiCourse.stats?.assessmentsTotal || 0,
        assessmentsCompleted: apiCourse.stats?.assessmentsCompleted || 0,
        courseLength: apiCourse.stats?.courseLength || apiCourse.courseLength || "Full-Year",
    } : null;

    if (isLoading) return <div className="p-8 text-white">Loading course details...</div>;
    if (!course) return <div className="p-8 text-white">Course not found</div>;

    const handleCompleteAndContinue = async () => {
        const uncompletedModuleIndex = course.modules.findIndex(m => m.lessonsCompleted < m.lessonsTotal);
        const activeModuleIndex = uncompletedModuleIndex !== -1 ? uncompletedModuleIndex : 0;
        const currentModule = course.modules[activeModuleIndex];

        if (!currentModule) return;

        try {
            const res = await completeLesson({ lessonId: currentModule.id }).unwrap();
            if (res.success) {
                toast.success(res.message || "Lesson marked as completed");
                const nextModule = course.modules[activeModuleIndex + 1];
                if (nextModule) {
                    router.push(`/student/courses/${courseId}/lesson/${nextModule.id}`);
                } else {
                    router.push(`/student/courses/${courseId}/lesson/${currentModule.id}`);
                }
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to complete lesson");
        }
    };

    return (
        <div className="min-h-screen bg-[#111] text-foreground pb-20">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-[#D4AF37] mb-4 hover:underline"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                </button>
                <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">{course.title}</h1>
                <p className="text-gray-400 max-w-3xl">{course.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Learning Overview */}
                <div className="col-span-1 md:col-span-2 bg-[#1C1C1C] border border-[#333] rounded-xl p-6">
                    <h2 className="text-[#D4AF37] font-medium mb-6">Learning Overview</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-gray-400 text-sm">Progress</span>
                                <span className="text-3xl font-bold text-white">{course.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
                                <div className="h-full bg-[#6366F1]" style={{ width: `${course.progress}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-gray-400 text-sm">Mastery Level</span>
                                <span className="text-3xl font-bold text-[#22C55E]">{course.mastery}%</span>
                            </div>
                            <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
                                <div className="h-full bg-[#22C55E]" style={{ width: `${course.mastery}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                    {/* What to do next */}
                    <div className="bg-[#1C1C1C] border border-[#333] rounded-xl p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-gray-300 font-medium mb-2">What to do next</h2>
                            <p className="text-sm text-gray-500 mb-6">Continue with your next lesson:</p>
                        </div>
                        {(() => {
                            const uncompletedModuleIndex = course.modules.findIndex(m => m.lessonsCompleted < m.lessonsTotal);
                            const activeModuleIndex = uncompletedModuleIndex !== -1 ? uncompletedModuleIndex : 0;
                            const currentModule = course.modules[activeModuleIndex];

                            return (
                                <Link href={`/student/courses/${courseId}/lesson/${currentModule?.id || "l1"}`}>
                                    <Button className="w-full bg-[#D4AF37] hover:bg-[#c4a02f] text-black font-bold h-10 rounded-full">
                                        Start: {currentModule?.title || "Lesson"}
                                    </Button>
                                </Link>
                            );
                        })()}
                    </div>
            </div>

            {/* Syllabus */}
            <div className="bg-[#1C1C1C] border border-[#333] rounded-xl p-6 mb-8">
                <h2 className="text-[#D4AF37] font-semibold text-lg mb-1">COURSE SYLLABUS</h2>
                <p className="text-sm text-gray-500 mb-6">Modules, lessons, and assessments</p>

                <Accordion type="single" collapsible defaultValue={course.modules[0]?.id} className="bg-transparent border-none">
                    {course.modules.map((module) => (
                        <AccordionItem key={module.id} value={module.id} className="border border-[#333] rounded-lg mb-4 data-[state=open]:bg-[#1e1e1e] overflow-hidden px-0">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-[#2A2A2A]">
                                <div className="flex justify-between items-center w-full pr-4">
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-gray-200 text-sm">Module {module.number}: {module.title}</span>
                                        <span className="text-xs text-gray-500 mt-1.5">{module.lessonsCompleted} of {module.lessonsTotal} lessons completed</span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-normal">{module.duration}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0">
                                <div className="bg-[#181818] border-t border-[#333]">
                                    <h3 className="text-[#D4AF37] text-xs font-medium uppercase tracking-wider px-6 py-4">LESSONS</h3>
                                    {module.lessons.map((lesson) => (
                                        <Link
                                            href={`/student/courses/${courseId}/lesson/${lesson.id}`}
                                            key={lesson.id}
                                            className="flex items-center justify-between px-6 py-4 border-l-2 border-transparent hover:border-[#D4AF37] hover:bg-[#222] transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                {lesson.completed ? (
                                                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                                                ) : (
                                                    <Circle className="w-5 h-5 text-gray-600 group-hover:text-[#D4AF37]" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${lesson.completed ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                                        {lesson.title}
                                                    </span>
                                                    <span className="text-xs text-gray-600 mt-0.5">{lesson.type}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">{lesson.duration}</span>
                                        </Link>
                                    ))}
                                    {!module.lessons.length && (
                                        <div className="px-6 py-4 text-sm text-gray-500 italic">No lessons available yet.</div>
                                    )}

                                    {module.quiz && (
                                        <>
                                            <h3 className="text-[#D4AF37] text-xs font-medium uppercase tracking-wider px-6 py-4 mt-2 border-t border-[#222]">ASSESSMENTS</h3>
                                            <Link
                                                href={`/student/courses/${courseId}/quiz/${module.quiz.id}`}
                                                className="flex items-center justify-between px-6 py-4 border-l-2 border-transparent hover:border-[#D4AF37] hover:bg-[#222] transition-colors group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    {module.lessonsCompleted === module.lessonsTotal && module.lessonsTotal > 0 ? (
                                                        <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-gray-600 group-hover:text-[#D4AF37]" />
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200">
                                                            {module.quiz.title}
                                                        </span>
                                                        <span className="text-xs text-gray-600 mt-0.5">Quiz</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium text-gray-400 group-hover:text-white">Mastery: {module.quiz.score}%</span>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            {/* Footer Stats - matching the bottom of the design */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 border-t border-[#333] pt-8 mt-8 pb-12">
                <div className="text-center">
                    <div className="text-2xl font-bold text-[#D4AF37]">{course.masteryRequirement}%</div>
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest mt-2">Mastery Requirement</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-[#D4AF37]">{course.averageMastery}%</div>
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest mt-2">Average Mastery</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-[#D4AF37]">{course.modulesTotal}/{course.modulesCompleted}</div>
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest mt-2">Modules/Completed</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-[#D4AF37]">{course.lessonsTotal}/{course.lessonsCompleted}</div>
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest mt-2">Lessons/Completed</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-[#D4AF37]">{course.assessmentsTotal}/{course.assessmentsCompleted}</div>
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest mt-2">Assessments/Completed</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-[#D4AF37]">{course.courseLength}</div>
                    <div className="text-[10px] uppercase text-gray-500 tracking-widest mt-2">Course Length</div>
                </div>
            </div>

            {/* Floating continue button if needed or bottom action */}
            <div className="flex justify-end mt-4">
                <Button 
                    onClick={handleCompleteAndContinue}
                    disabled={isCompleting}
                    className="bg-[#D4AF37] hover:bg-[#c4a02f] text-black font-bold flex items-center gap-2 px-8 h-12 rounded-full"
                >
                    {isCompleting ? "Completing..." : "Continue to Next Lecture"}
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
