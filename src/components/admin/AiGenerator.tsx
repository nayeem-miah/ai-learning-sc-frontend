"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ArrowRight, Sparkles, BookOpen, Brain, Target, Layers } from "lucide-react";
import { useSetupCourseMutation, coursesApi, useGetClassesQuery } from "@/lib/feature/courses/coursesApi";
import { useGetKnowledgeFilesQuery, useDeleteKnowledgeFileMutation } from "@/lib/feature/knowledge/knowledgeApi";
import { toast } from "sonner";
import CustomFileIcon from "../icons/CustomFileIcon";
import TrashIcon from "../icons/TrashIcon";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { CustomSwitch } from "@/components/ui/custom-switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const steps = [
    { label: "Analyzing subject & grade level", icon: <Brain className="w-4 h-4" /> },
    { label: "Creating syllabus structure", icon: <Layers className="w-4 h-4" /> },
    { label: "Structuring modules & lessons", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Generating quiz questions", icon: <Target className="w-4 h-4" /> },
    { label: "Polishing & final review", icon: <Check className="w-4 h-4" /> },
];

const courseSchema = z.object({
    course_name: z.string().min(1, "Course name is required"),
    subject: z.string().min(1, "Subject is required"),
    target_grade_level: z.string().min(1, "Grade level is required"),
    course_length: z.enum(["semester", "full"]),
    semester_count: z.number().optional(),
    diagnostic_test_before_course: z.boolean(),
    retesting_allowed: z.boolean(),
    retesting_count: z.number().min(0),
    quizzes_per_module: z.number().min(1).max(10),
    midterm_examination: z.boolean(),
    final_examination: z.boolean(),
    total_quiz_questions: z.number().min(1),
    mastery_requirement: z.number().min(0).max(100),
    total_modules: z.number().min(1),
    estimated_duration_min_per_class: z.number().min(1),
    user_instration: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

const findIdInfo = (obj: any): { realId: string | null; sessionId: string | null } => {
    let realId: string | null = null;
    let sessionId: string | null = null;

    if (!obj || typeof obj !== "object") return { realId: null, sessionId: null };

    const isMongoId = (val: any) => typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val) && !val.startsWith("SES-") && !val.startsWith("USR-");

    sessionId = obj.unique_session_id || obj.uniqueSessionId || null;
    realId = isMongoId(obj.id) ? obj.id : (isMongoId(obj._id) ? obj._id : null);

    if (!realId || !sessionId) {
        for (const key in obj) {
            const val = obj[key];
            if (!realId && isMongoId(val)) realId = val;
            if (!sessionId && (key === "unique_session_id" || key === "uniqueSessionId")) sessionId = val;

            if (val && typeof val === "object" && (!realId || !sessionId)) {
                const nested = findIdInfo(val);
                if (!realId) realId = nested.realId;
                if (!sessionId) sessionId = nested.sessionId;
            }
        }
    }
    return { realId, sessionId };
};

export default function AiGenerator() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const [isGenerating, setIsGenerating] = useState(false);
    const generatingRef = useRef(false);

    const [activeSection, setActiveSection] = useState<"basics" | "config">("basics");
    const [mounted, setMounted] = useState(false);

    const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>([]);

    const { register, control, handleSubmit, watch, setValue } = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            course_name: "",
            subject: "",
            target_grade_level: "",
            course_length: "full",
            semester_count: 1,
            diagnostic_test_before_course: false,
            retesting_allowed: true,
            retesting_count: 1,
            quizzes_per_module: 5,
            midterm_examination: true,
            final_examination: true,
            total_quiz_questions: 25,
            mastery_requirement: 70,
            total_modules: 5,
            estimated_duration_min_per_class: 60,
            user_instration: ""
        }
    });

    const watchedValues = watch();

    const [setupCourse] = useSetupCourseMutation();
    const { data: classesRes, isLoading: isClassesLoading } = useGetClassesQuery();
    const { data: knowledgeFilesRes } = useGetKnowledgeFilesQuery();
    const [deleteKnowledgeFile] = useDeleteKnowledgeFileMutation();
    const classes = classesRes?.data || [];
    const knowledgeFiles = knowledgeFilesRes?.data || [];

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)) + ' ' + sizes[i];
    };

    const handleDeleteFile = async (id: string) => {
        try {
            await deleteKnowledgeFile(id).unwrap();
            toast.success("File deleted successfully");
        } catch {
            toast.error("Failed to delete file");
        }
    };

    // Set default grade level when classes are loaded
    useEffect(() => {
        if (classes.length > 0 && !watchedValues.target_grade_level) {
            setValue("target_grade_level", classes[0].id);
        }
    }, [classes, watchedValues.target_grade_level, setValue]);

    useEffect(() => { const timer = setTimeout(() => setMounted(true), 10); return () => clearTimeout(timer); }, []);

    // Generation Progress/Overlay State
    const [generationStep, setGenerationStep] = useState(0);
    const [progress, setProgress] = useState(0);

    const handleGenerate = handleSubmit(async (data) => {
        if (isGenerating || generatingRef.current) return;

        const payload = {
            ...data,
            course_length: data.course_length === "semester" ? "6 Months" : "1 Year",
            semester_count: data.course_length === "semester" ? 1 : (data.semester_count || 1),
            knowledge_bases: selectedKnowledgeBases,
        };

        setIsGenerating(true);
        generatingRef.current = true;
        setGenerationStep(0);
        setProgress(0);

        let currentProgress = 0;
        const interval = setInterval(() => {
            let increment = 1;
            if (currentProgress < 30) increment = 2;
            else if (currentProgress > 70) increment = 0.5;
            else if (currentProgress > 90) increment = 0.1;

            currentProgress = Math.min(currentProgress + increment, 95);
            setProgress(Math.floor(currentProgress));

            if (currentProgress > 20 && currentProgress < 40) setGenerationStep(1);
            else if (currentProgress >= 40 && currentProgress < 60) setGenerationStep(2);
            else if (currentProgress >= 60 && currentProgress < 80) setGenerationStep(3);
            else if (currentProgress >= 80) setGenerationStep(4);
        }, 150);

        try {
            const res = await setupCourse(payload).unwrap();
            const { realId, sessionId } = findIdInfo(res);

            let finalId = realId;
            if (!finalId && sessionId) {
                try {
                    const allCoursesRes = await dispatch(coursesApi.endpoints.getAllCourses.initiate()).unwrap();
                    const matchedCourse = allCoursesRes.data?.find((c: any) =>
                        c.uniqueSessionId === sessionId || c.unique_session_id === sessionId
                    );
                    if (matchedCourse?.id) finalId = matchedCourse.id;
                } catch {
                    // Fallback
                }
            }

            clearInterval(interval);
            setProgress(100);
            setGenerationStep(4);

            if (finalId) {
                setTimeout(() => {
                    toast.success("AI Content Generated & Drafted!", {
                        duration: 5000,
                    });
                    router.push(`/admin/courses/${finalId}/publish`);
                }, 500);
            } else {
                toast.error("Course metadata sync failed. Please refresh the page.");
                setIsGenerating(false);
                generatingRef.current = false;
            }
        } catch (error: any) {
            setIsGenerating(false);
            generatingRef.current = false;
            clearInterval(interval);
            toast.error(error?.data?.message || "Failed to generate course content.");
        }
    });

    const onStopGeneration = () => {
        setIsGenerating(false);
        generatingRef.current = false;
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen">
            <div className="flex flex-col gap-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-gray-800">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-linear-to-br from-[#D0AD6B] to-[#F59E0B] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D0AD6B]/20 transform rotate-3">
                            <Sparkles className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
                                AI Course <span className="text-[#D0AD6B]">Generator</span>
                            </h1>
                            <p className="text-gray-400 text-sm">Build your course with AI-powered generation</p>
                        </div>
                    </div>
                </div>

                {/* Section Tabs (Mobile) */}
                <div className="flex lg:hidden gap-2 mb-6">
                    <button
                        onClick={() => setActiveSection("basics")}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === "basics" ? "bg-[#D0AD6B] text-black" : "bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:text-white"}`}
                    >
                        Course Basics
                    </button>
                    <button
                        onClick={() => setActiveSection("config")}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === "config" ? "bg-[#D0AD6B] text-black" : "bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:text-white"}`}
                    >
                        AI Config
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Course Basics */}
                    <div className={`bg-[#121212] border border-gray-800 rounded-xl p-8 hover:border-gray-700 transition-all duration-300 ${activeSection !== "basics" ? "hidden lg:block" : ""}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4 text-[#D0AD6B]" />
                            <h2 className="text-[#D0AD6B] text-sm font-bold tracking-wider">COURSE BASICS</h2>
                        </div>
                        <p className="text-gray-500 text-xs mb-6">Define the fundamental course structure</p>

                        <div className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-gray-300 group-focus-within:text-[#D0AD6B] transition-colors">COURSE NAME</label>
                                <input
                                    {...register("course_name")}
                                    placeholder="e.g. English 101"
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#D0AD6B] focus:ring-1 focus:ring-[#D0AD6B]/20 transition-all"
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-gray-300 group-focus-within:text-[#D0AD6B] transition-colors">SUBJECT</label>
                                <input
                                    {...register("subject")}
                                    placeholder="e.g. English"
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#D0AD6B] focus:ring-1 focus:ring-[#D0AD6B]/20 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-300">TARGET GRADE / LEVEL</label>
                                <select
                                    {...register("target_grade_level")}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#D0AD6B] focus:ring-1 focus:ring-[#D0AD6B]/20 transition-all appearance-none cursor-pointer"
                                    disabled={isClassesLoading}
                                >
                                    {isClassesLoading ? (
                                        <option>Loading levels...</option>
                                    ) : (
                                        classes.map((cls: any) => (
                                            <option key={cls.id} value={cls.id} className="bg-[#1a1a1a] text-white">
                                                {cls.gradeLevel}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-300">COURSE LENGTH</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setValue("course_length", "semester")}
                                        className={`rounded-lg py-3 text-sm font-bold transition-all duration-200 ${watchedValues.course_length === "semester"
                                            ? "bg-[#D0AD6B] text-black border border-[#D0AD6B] shadow-lg shadow-[#D0AD6B]/20"
                                            : "bg-[#1a1a1a] border border-gray-700 text-white hover:bg-[#222] hover:border-gray-600"
                                            }`}
                                    >
                                        SEMESTER
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue("course_length", "full")}
                                        className={`rounded-lg py-3 text-sm font-bold transition-all duration-200 ${watchedValues.course_length === "full"
                                            ? "bg-[#D0AD6B] text-black border border-[#D0AD6B] shadow-lg shadow-[#D0AD6B]/20"
                                            : "bg-[#1a1a1a] border border-gray-700 text-white hover:bg-[#222] hover:border-gray-600"
                                            }`}
                                    >
                                        FULL YEAR
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-300">SEMESTER COUNT</label>
                                <select
                                    {...register("semester_count", { valueAsNumber: true })}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#D0AD6B] transition-all"
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between py-3 px-4 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                                <label className="text-xs font-bold text-gray-300">DIAGNOSTIC TEST BEFORE COURSE</label>
                                <Controller
                                    name="diagnostic_test_before_course"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSwitch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>

                            <div className="flex items-center justify-between py-3 px-4 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                                <label className="text-xs font-bold text-gray-300">RETESTING ALLOWED</label>
                                <Controller
                                    name="retesting_allowed"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSwitch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-300">RETESTING COUNT</label>
                                <select
                                    {...register("retesting_count", { valueAsNumber: true })}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#D0AD6B] transition-all"
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                </select>
                            </div>

                            {knowledgeFiles.length > 0 && (
                                <div className="space-y-3 mt-4">
                                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Knowledge Files</label>
                                    {knowledgeFiles.map((file) => {
                                        const fileId = file.id || (file as any)._id;
                                        const isSelected = selectedKnowledgeBases.includes(fileId);
                                        return (
                                            <div
                                                key={fileId}
                                                onClick={() => {
                                                    setSelectedKnowledgeBases(prev =>
                                                        prev.includes(fileId)
                                                            ? prev.filter(id => id !== fileId)
                                                            : [...prev, fileId]
                                                    );
                                                }}
                                                className={`self-stretch pl-4 pr-2 py-3 rounded-[10px] border transition-all cursor-pointer group flex justify-between items-center ${isSelected
                                                    ? "bg-[#D0AD6B]/20 border-[#D0AD6B]/50 hover:bg-[#D0AD6B]/30"
                                                    : "bg-[#D0AD6B] border-[#D0AD6B]/50 shadow-lg shadow-[#D0AD6B]/30"
                                                    }`}
                                            >
                                                <div className="flex justify-start items-center gap-0">
                                                    <div className="shrink-0 scale-90 origin-left -mr-14">
                                                        <CustomFileIcon
                                                            fileName=""
                                                            fileSize=""
                                                            className="w-24 h-11"
                                                        />
                                                    </div>
                                                    <div className="inline-flex flex-col justify-center items-start gap-0.5">
                                                        <div className={`text-sm font-bold tracking-wide truncate max-w-[180px] lg:max-w-[220px] transition-colors ${isSelected ? "text-white" : "text-black"}`}>
                                                            {file.fileName}
                                                        </div>
                                                        <div className={`text-[10px] font-medium uppercase tracking-tight ${isSelected ? "text-[#A5A5A5]" : "text-black/70"}`}>
                                                            {formatFileSize(file.fileSize)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteFile(fileId); }}
                                                    className={`p-2 rounded-lg transition-all ${isSelected ? "hover:bg-black/20 text-[#A5A5A5] hover:text-red-400" : "hover:bg-black/10 text-black"}`}
                                                    title="Delete file"
                                                >
                                                    <TrashIcon className="w-5 h-5 transition-colors" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: AI Config */}
                    <div className={`flex flex-col h-full ${activeSection !== "config" ? "hidden lg:flex" : ""}`}>
                        <div className="bg-[#121212] border border-gray-800 rounded-xl p-8 flex-1 hover:border-gray-700 transition-all duration-300">
                            <div className="flex items-center gap-2 mb-1">
                                <Brain className="w-4 h-4 text-[#D0AD6B]" />
                                <h2 className="text-[#D0AD6B] text-sm font-bold tracking-wider">AI CONFIGURATION</h2>
                            </div>
                            <p className="text-gray-500 text-xs mb-6">Define curriculum structure and assessment rules</p>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-[#D0AD6B] text-xs font-bold mb-4 uppercase flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5" />
                                        Assessment Rules
                                    </h3>

                                    <div className="mb-6">
                                        <div className="flex justify-between mb-2">
                                            <div>
                                                <label className="text-xs font-bold text-gray-300">QUIZZES PER MODULE</label>
                                                <p className="text-[9px] text-gray-500 italic mt-0.5">Note: Total Quizzes = {watchedValues.quizzes_per_module} x {watchedValues.total_modules} Modules</p>
                                            </div>
                                            <span className="text-[#D0AD6B] font-bold text-lg">{watchedValues.quizzes_per_module}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            {...register("quizzes_per_module", { valueAsNumber: true })}
                                            className="w-full accent-[#D0AD6B] h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                            <span>1</span>
                                            <span>5</span>
                                            <span>10</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-3 px-4 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors mb-3">
                                        <label className="text-xs font-bold text-gray-300">MIDTERM EXAMINATION</label>
                                        <Controller
                                            name="midterm_examination"
                                            control={control}
                                            render={({ field }) => (
                                                <CustomSwitch checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-3 px-4 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors mb-4">
                                        <label className="text-xs font-bold text-gray-300">FINAL EXAMINATION</label>
                                        <Controller
                                            name="final_examination"
                                            control={control}
                                            render={({ field }) => (
                                                <CustomSwitch checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2 mb-4 group">
                                        <label className="text-xs font-bold text-gray-300">TOTAL QUIZ QUESTIONS</label>
                                        <input
                                            type="number"
                                            {...register("total_quiz_questions", { valueAsNumber: true })}
                                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#D0AD6B] focus:ring-1 focus:ring-[#D0AD6B]/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[#D0AD6B] text-xs font-bold mb-4 uppercase flex items-center gap-2">
                                        <Layers className="w-3.5 h-3.5" />
                                        Learning Benchmarks
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-bold text-gray-300">MASTERY REQUIREMENT</label>
                                            <span className="text-[#D0AD6B] text-xs font-bold">{watchedValues.mastery_requirement}%</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                {...register("mastery_requirement", { valueAsNumber: true })}
                                                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#D0AD6B] focus:ring-1 focus:ring-[#D0AD6B]/20 transition-all"
                                            />
                                            <span className="absolute right-3 top-3 text-gray-500 text-sm">%</span>
                                        </div>
                                        {/* Visual mastery bar */}
                                        <div className="h-1.5 w-full bg-[#2a2a2a] rounded-full overflow-hidden mt-2">
                                            <div className="h-full bg-linear-to-r from-[#D0AD6B] to-[#F59E0B] rounded-full transition-all duration-300" style={{ width: `${Math.min(watchedValues.mastery_requirement, 100)}%` }} />
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <label className="text-xs font-bold text-gray-300">TOTAL MODULES</label>
                                        <input
                                            type="number"
                                            {...register("total_modules", { valueAsNumber: true })}
                                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#D0AD6B] focus:ring-1 focus:ring-[#D0AD6B]/20 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <label className="text-xs font-bold text-gray-300">ESTIMATED DURATION (min per class)</label>
                                        <input
                                            type="number"
                                            {...register("estimated_duration_min_per_class", { valueAsNumber: true })}
                                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#D0AD6B] focus:ring-1 focus:ring-[#D0AD6B]/20 transition-all"
                                        />
                                    </div>
                                </div>


                            </div>
                        </div>

                        {/* Prompt Section */}
                        <div className="self-stretch py-4 border-t border-primary/20 flex flex-col justify-start items-start gap-4 mt-6">
                            <div className="justify-start text-[#D0AD6B] text-base font-medium font-['Roboto'] leading-6 uppercase tracking-wider">Prompt (Optional)</div>
                            <div className="self-stretch h-44 flex flex-col justify-start items-start gap-4">
                                <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-2">
                                    <textarea
                                        {...register("user_instration")}
                                        className="self-stretch flex-1 px-4 py-3 bg-[#121212] rounded border border-primary/30 text-white text-sm focus:outline-none focus:border-primary/60 transition-all resize-none"
                                        placeholder="Enter your custom prompt here..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleGenerate}
                                className="bg-[#D0AD6B] hover:bg-[#b89a58] text-black font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#D0AD6B]/20 active:scale-[0.98]"
                                disabled={isGenerating}
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>Generate Course</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Generating Overlay */}
            {isGenerating && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 max-w-md w-full relative overflow-hidden shadow-2xl">
                        {/* Glowing Circle Animation */}
                        <div className="flex justify-center mb-8 relative">
                            <div className="w-20 h-20 rounded-full border-2 border-[#D0AD6B] flex items-center justify-center relative z-10 bg-[#1a1a1a]">
                                <Loader2 className="w-8 h-8 text-[#D0AD6B] animate-spin" />
                            </div>
                            <div className="absolute inset-0 bg-[#D0AD6B]/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-[#D0AD6B] text-xl font-bold mb-2">GENERATING YOUR COURSE</h2>
                            <p className="text-gray-400 text-xs">AI is crafting <span className="text-white font-medium">{watchedValues.course_name}</span> for you</p>
                        </div>

                        <div className="space-y-3 mb-8">
                            {steps.map((step, index) => (
                                <div key={index} className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${index <= generationStep ? "bg-[#222]" : ""}`}>
                                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${index < generationStep || (index === generationStep && progress === 100)
                                        ? "bg-[#D0AD6B] border-[#D0AD6B] text-black"
                                        : index === generationStep
                                            ? "border-[#D0AD6B] text-[#D0AD6B]"
                                            : "border-gray-700 text-gray-700"
                                        }`}>
                                        {index < generationStep || (index === generationStep && progress === 100) ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            step.icon
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${index <= generationStep ? "text-white" : "text-gray-600"}`}>
                                                {step.label}
                                            </span>
                                            {index === generationStep && progress < 100 && (
                                                <span className="text-[10px] text-[#D0AD6B] font-mono">{progress}%</span>
                                            )}
                                            {index < generationStep || (index === generationStep && progress === 100) ? (
                                                <span className="text-[10px] text-green-500 font-bold">DONE</span>
                                            ) : null}
                                        </div>
                                        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-[#D0AD6B] transition-all duration-300 ${index < generationStep ? "w-full" : index === generationStep ? "" : "w-0"}`}
                                                style={{ width: index === generationStep ? `${progress}%` : undefined }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={onStopGeneration}
                                className="text-gray-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 group"
                            >
                                <span className="w-4 h-px bg-gray-800 group-hover:bg-gray-600 transition-colors"></span>
                                Stop Generation
                                <span className="w-4 h-px bg-gray-800 group-hover:bg-gray-600 transition-colors"></span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
