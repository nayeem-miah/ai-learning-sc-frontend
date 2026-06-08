"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, BookOpen, Target, Layers, Clock, Users, BarChart3, Award, FileText, HelpCircle, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useGetCourseByIdQuery, useUpdateCourseMutation } from "@/lib/feature/courses/coursesApi";
import { toast } from "sonner";

interface CourseDetailsProps {
    passedId?: string;
}

export default function CourseDetails({ passedId }: CourseDetailsProps) {
    const router = useRouter();
    const params = useParams();
    const id = passedId || (params?.id as string);
    const { data: response, isLoading, error } = useGetCourseByIdQuery(id, {
        skip: !id
    });

    const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();

    const course = response?.data;
    const [mounted, setMounted] = useState(false);
    const [animatedStats, setAnimatedStats] = useState({ mastery: 0, modules: 0, lessons: 0, assessments: 0 });

    useEffect(() => {
        setMounted(true);
        if (course) {
            const targets = {
                mastery: course.masteryRequirement || 0,
                modules: course.modules?.length || 0,
                lessons: course.modules?.reduce((acc, m) => acc + (m.studyTopics?.length || 0), 0) || 0,
                assessments: course.modules?.reduce((acc, m) => acc + (m.quizQuestions?.length || 0), 0) || 0
            };
            const duration = 1200;
            const start = Date.now();
            const tick = () => {
                const elapsed = Date.now() - start;
                const p = Math.min(elapsed / duration, 1);
                const e = 1 - Math.pow(1 - p, 3);
                setAnimatedStats({
                    mastery: Math.round(targets.mastery * e),
                    modules: Math.round(targets.modules * e),
                    lessons: Math.round(targets.lessons * e),
                    assessments: Math.round(targets.assessments * e),
                });
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }
    }, [course]);

    const handlePublish = async () => {
        if (!course) return;

        try {
            const result = await updateCourse({
                id: course.id,
                courseName: course.courseName,
                subject: course.subject,
                description: course.description || "Synthesized by AI",
                isPublished: true,
                startDate: course.startDate || "2026-04-01T00:00:00.000Z",
                startTime: course.startTime || "09:00 AM",
                endTime: course.endTime || "11:00 AM",
                teacherId: course.teacherId || "6983160b106883775a56936a"
            }).unwrap();

            if (result.success) {
                toast.success("Course published successfully!");
            }
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to publish course. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
                <p className="text-gray-400 animate-pulse">Loading course details...</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center max-w-2xl mx-auto mt-10">
                <p className="text-red-500 font-medium mb-2">Failed to load course details</p>
                <p className="text-red-400 text-sm">Please check your connection or return to the courses list.</p>
                <div className="bg-red-500/5 mt-4 p-4 rounded text-left overflow-hidden">
                    <p className="text-red-300 text-xs break-all">
                        <strong>Requested ID:</strong> {id || 'undefined'}<br/><br/>
                        <strong>API Error details:</strong><br/>
                        {JSON.stringify(error, null, 2)}
                    </p>
                </div>
                <Button variant="outline" className="mt-6 border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    const totalLessons = course.modules?.reduce((sum, m) => sum + (m.studyTopics?.length || 0), 0) || 0;
    const totalAssessments = course.modules?.reduce((sum, m) => sum + (m.quizQuestions?.length || 0), 0) || 0;

    // Placeholder for completions as they might not be in the current API response structure yet
    const completedLessons = 0;
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className={`space-y-6 transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
            {/* Top Header Card */}
            <div className="p-6 md:p-8 rounded-xl bg-card shadow-[0_4px_4px_0] border shadow-primary/20 hover:border-primary/20 transition-all">
                <button onClick={() => router.back()} type="button" className="flex items-center text-sm font-semibold text-primary hover:text-white mb-5 transition-colors cursor-pointer group">
                    <ChevronLeft className="mr-1 w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-semibold text-primary">{course.courseName}</h1>
                                <p className="text-secondary text-sm font-normal">{course.targetGradeLevel} · {course.courseLength}</p>
                            </div>
                        </div>
                        <p className="text-secondary text-sm font-normal leading-relaxed mt-2 max-w-2xl italic">
                            {course.generatedCourseName}
                        </p>
                    </div>

                    {/* Overall progress ring */}
                    <div className="flex items-center gap-3 bg-primary/5 rounded-xl p-4 border border-primary/10">
                        <div className="relative w-14 h-14">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                                <circle cx="28" cy="28" r="24" fill="none" stroke="#333" strokeWidth="3" />
                                <circle cx="28" cy="28" r="24" fill="none" stroke="#D4AF37" strokeWidth="3"
                                    strokeDasharray={`${overallProgress * 1.508} 150.8`}
                                    strokeLinecap="round" className="transition-all duration-1000" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">{overallProgress}%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Overall</p>
                            <p className="text-sm font-semibold text-white">Progress</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: "Mastery", value: `${animatedStats.mastery}%`, icon: Target, color: "#D4AF37", sub: "Requirement" },
                    { label: "Modules", value: `${animatedStats.modules}/${course.totalModules}`, icon: Layers, color: "#3B82F6", sub: "Generated" },
                    { label: "Topics", value: `${animatedStats.lessons}`, icon: FileText, color: "#22C55E", sub: "Total Topics" },
                    { label: "Questions", value: `${animatedStats.assessments}`, icon: Award, color: "#A855F7", sub: "Total Quizzes" },
                    { label: "Duration", value: course.courseLength, icon: Clock, color: "#F97316", sub: `${course.estimatedDurationMinPerClass} min/class` },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label}
                            className="bg-card rounded-xl p-4 shadow-[0_4px_4px_0] border shadow-primary/20 hover:border-primary/20 transition-all group"
                            style={{ opacity: mounted ? 1 : 0, transition: `opacity 0.4s ${idx * 80}ms` }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${stat.color}15` }}>
                                    <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                                </div>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <p className="text-xl font-bold text-primary">{stat.value}</p>
                            <p className="text-[10px] text-gray-600 font-medium">{stat.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Card */}
            <div className="rounded-xl bg-card shadow-[0_4px_4px_0] border shadow-primary/20 overflow-hidden">
                {/* Syllabus Title */}
                <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-primary text-lg md:text-xl font-semibold uppercase mb-1 flex items-center gap-2">
                                <Layers className="w-5 h-5" />
                                Course Syllabus
                            </h2>
                            <p className="text-foreground text-sm font-normal">Modules, topics, and quiz questions</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-xs text-secondary font-medium uppercase tracking-wider">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> {course.modules?.length} Modules</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> AI Generated</span>
                        </div>
                    </div>
                    <div className="border-b border-primary/20 w-full mt-4" />
                </div>

                {/* Accordion Section */}
                <div className="px-6 md:px-8 py-2">
                    <Accordion type="single" collapsible defaultValue={`module-${course.modules?.[0]?.id}`} className="space-y-3">
                        {course.modules?.map((module, idx) => (
                            <AccordionItem
                                key={module.id}
                                value={`module-${module.id}`}
                                className="border border-primary/20 bg-card-surface overflow-hidden last:border-b-0 cursor-pointer rounded-lg mb-3"
                                style={{ opacity: mounted ? 1 : 0, transition: `opacity 0.3s ${idx * 60}ms` }}
                            >
                                <AccordionTrigger className="hover:no-underline py-4 md:py-5 px-4 md:px-5 [&>svg]:hidden group cursor-pointer">
                                    <div className="flex items-center w-full">
                                        <div className="relative mr-4">
                                            <ChevronRight className="h-5 w-5 shrink-0 text-primary transition-all group-data-[state=open]:hidden" />
                                            <ChevronDown className="h-5 w-5 shrink-0 text-primary transition-all group-data-[state=closed]:hidden" />
                                        </div>
                                        <div className="flex justify-between items-center w-full pr-2 gap-3">
                                            <div className="text-left flex-1">
                                                <h3 className="text-sm md:text-base font-semibold text-foreground">Module {module.moduleNumber}: {module.moduleTitle}</h3>
                                                <p className="text-[11px] text-secondary mt-1 line-clamp-1">{module.introduction}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="hidden sm:flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                        {module.studyTopics?.length} Topics
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-secondary">
                                                    <Clock size={12} className="text-primary" />
                                                    <span className="text-[11px] whitespace-nowrap">{Math.round(module.voiceData?.duration_seconds / 60) || 0} min audio</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="p-0">
                                    <div className="border-t border-primary/20 w-full" />
                                    <div className="px-4 md:px-5 pt-6 pb-8">
                                        {/* Introduction */}
                                        <div className="mb-6 bg-primary/5 p-4 rounded-lg border border-primary/10">
                                            <h4 className="text-xs font-bold text-primary uppercase mb-2 flex items-center gap-2">
                                                <Target className="w-3.5 h-3.5" />
                                                Module Overview
                                            </h4>
                                            <p className="text-sm text-foreground leading-relaxed">
                                                {module.introduction}
                                            </p>
                                        </div>

                                        {/* Topics */}
                                        <div className="mb-8">
                                            <h4 className="text-sm font-medium text-primary uppercase mb-4 px-1 flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                Detailed Topics
                                                <span className="text-[10px] text-gray-500 normal-case font-normal">
                                                    ({module.studyTopics?.length} sections)
                                                </span>
                                            </h4>
                                            <div className="space-y-3">
                                                {module.studyTopics?.map((topic, tidx) => (
                                                    <div key={tidx} className="bg-card border border-primary/10 p-4 rounded-lg hover:border-primary/30 transition-all group">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                                <span className="text-[10px] font-bold text-primary">{tidx + 1}</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{topic.topic_name}</p>
                                                                <p className="text-xs text-secondary mb-2 line-clamp-2">{topic.topic_wise_study_data?.summary}</p>
                                                                <div className="text-[11px] text-gray-500 bg-black/20 p-3 rounded border border-white/5 hidden group-hover:block transition-all animate-in fade-in slide-in-from-top-1">
                                                                    {topic.topic_wise_study_data?.detailed_explanation}
                                                                </div>
                                                                {!topic.topic_wise_study_data?.detailed_explanation && (
                                                                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-500 italic">
                                                                        <Users size={10} />
                                                                        Detailed content ready for review
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quiz Questions */}
                                        {module.quizQuestions && module.quizQuestions.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-primary uppercase mb-4 px-1 flex items-center gap-2">
                                                    <HelpCircle className="w-4 h-4" />
                                                    Quiz Assessment
                                                    <span className="text-[10px] text-gray-500 normal-case font-normal">
                                                        ({module.quizQuestions.length} Questions)
                                                    </span>
                                                </h4>
                                                <div className="space-y-3">
                                                    {module.quizQuestions.map((quiz, qidx) => (
                                                        <div key={qidx} className="flex flex-col gap-2 p-4 rounded-lg bg-black/20 border border-primary/5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-5 h-5 rounded flex items-center justify-center bg-primary/20 text-[10px] font-bold text-primary">Q{quiz.questionNumber}</div>
                                                                <p className="text-xs md:text-sm font-medium text-foreground">{quiz.questionText}</p>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 ml-8">
                                                                {['A', 'B', 'C', 'D'].map((opt) => (
                                                                    <div key={opt} className="text-[11px] text-secondary flex items-center gap-2 bg-card/50 p-2 rounded border border-white/5">
                                                                        <span className="font-bold text-primary/70">{opt}:</span>
                                                                        <span>{quiz[`option${opt}` as keyof typeof quiz] as string}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* Footer Action */}
                <div className="px-6 md:px-8 pb-6 md:pb-8 mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-gray-500 text-center md:text-left">
                        This course was generated on {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}.
                        Review all modules before publishing to students.
                    </p>
                    <Button
                        onClick={handlePublish}
                        disabled={isUpdating || course?.isPublished}
                        type="button"
                        className="h-auto bg-primary hover:bg-primary/80 text-black text-sm md:text-base font-semibold py-3 px-6 rounded-xl flex items-center transition-all group cursor-pointer w-full md:w-auto hover:shadow-lg hover:shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? (
                            <>
                                Publishing...
                                <Loader2 className="ml-2 w-5 h-5 animate-spin" />
                            </>
                        ) : course?.isPublished ? (
                            <>
                                Published
                                <CheckCircle2 size={20} className="ml-2" />
                            </>
                        ) : (
                            <>
                                Publish Course
                                <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}