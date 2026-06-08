"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  FileText,
  Folder,
  HelpCircle,
  PanelRightClose,
  PanelRightOpen,
  Squircle,
  X,
  Loader,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import Quiz from "../dashboard/quiz/Quiz";
import { useGetTeacherCourseDetailsQuery } from "@/lib/feature/courses/coursesApi";
import { useGetJoinedStudentsQuery, useMarkJoinedPresentMutation } from "@/lib/feature/attendance/attendanceApi";

// --- Interfaces ---
interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  moduleTitle: string;
  content: {
    summary: string;
    detailed: string;
  };
}

// remove the static students array


export default function Learning({ courseId, moduleId, attendanceId }: { courseId: string; moduleId: string; attendanceId: string }) {
  const { data: courseResponse, isLoading, error } = useGetTeacherCourseDetailsQuery(courseId);
  const { data: joinedStudentsResponse, isLoading: isJoinedLoading } = useGetJoinedStudentsQuery(attendanceId, {
    pollingInterval: 5000, 
  });
  const [markJoinedPresent, { isLoading: isMarkingPresent }] = useMarkJoinedPresentMutation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const router = useRouter();

  const course = courseResponse?.data;
  const joinedStudents = joinedStudentsResponse?.data || [];
  
  const lessons: Lesson[] = useMemo(() => {
    return course?.modules?.flatMap((module) => 
      module.studyTopics.map((topic, index) => ({
        id: `${module.id}-${index}`,
        moduleId: module.id,
        title: topic.topic_name,
        moduleTitle: module.moduleTitle,
        content: {
          summary: topic.topic_wise_study_data.summary,
          detailed: topic.topic_wise_study_data.detailed_explanation
        }
      }))
    ) || [];
  }, [course]);

  const activeLesson = useMemo(() => 
    lessons.find(l => l.id === activeLessonId)
  , [lessons, activeLessonId]);

  const activeQuizQuestions = useMemo(() => {
    if (!showQuiz || !activeLessonId?.startsWith('quiz-')) return [];
    const moduleId = activeLessonId.replace('quiz-', '');
    return course?.modules?.find(m => m.id === moduleId)?.quizQuestions || [];
  }, [showQuiz, activeLessonId, course]);

  const activeModuleTitle = useMemo(() => {
    if (showQuiz && activeLessonId?.startsWith('quiz-')) {
      const moduleId = activeLessonId.replace('quiz-', '');
      return course?.modules?.find(m => m.id === moduleId)?.moduleTitle || "Module Assessment";
    }
    return activeLesson?.moduleTitle || "Course Material";
  }, [showQuiz, activeLessonId, course, activeLesson]);

  useEffect(() => {
    if (lessons.length > 0 && activeLessonId === null) {
      if (moduleId) {
        const moduleLesson = lessons.find(l => l.moduleId === moduleId);
        if (moduleLesson) {
          setActiveLessonId(moduleLesson.id);
          return;
        }
      }
      const firstId = lessons[0].id;
      setActiveLessonId(firstId);
    }
  }, [lessons, activeLessonId, moduleId]);

  useEffect(() => {
    const checkMobile = (): void => {
      const isMob = window.innerWidth < 1024;
      setIsMobile(prev => prev !== isMob ? isMob : prev);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-white">
        <Loader className="w-12 h-12 text-[#C08F42] animate-spin mb-4" />
        <h2 className="text-xl font-bold">Loading Classroom...</h2>
        <p className="text-zinc-400">Preparing your modules and resources</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to load course</h2>
        <p className="text-zinc-400 max-w-md mx-auto">We couldn't retrieve the curriculum data. Please try refreshing or return to the dashboard.</p>
        <Button onClick={() => router.push("/teacher/dashboard")} className="mt-6 bg-[#C08F42] text-black hover:bg-[#D4AF37]">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const toggleAttendance = (name: string): void => {
    // Logic for toggling attendance manually if needed, but for now we're just reading joined students
    toast.info(`Attendance status for ${name} is managed automatically`);
  };

  const handleMarkAllPresent = async () => {
    try {
      const response = await markJoinedPresent(attendanceId).unwrap();
      if (response.success) {
        toast.success(response.message || "Attendance marked successfully");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark attendance");
    }
  };

  const toggleAllAttendance = () => {
    // No-op for now as it's automated
  };

  const handleQuizClick = (moduleId: string): void => {
    setShowQuiz(true);
    setActiveLessonId(`quiz-${moduleId}`);
    if (isMobile) setLeftSidebarOpen(false);
  };

  const handleLessonClick = (lessonId: string): void => {
    setShowQuiz(false);
    setActiveLessonId(lessonId);
    if (isMobile) setLeftSidebarOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ---------- Header Section ---------- */}
      <div className="bg-card shadow-[0_4px_4px_0] border shadow-primary/20 rounded-xl p-4 md:p-6 mb-4 md:mb-7">
        <button
          onClick={() => router.back()}
          type="button"
          className="flex items-center text-sm md:text-base font-semibold text-primary hover:text-white mb-4 md:mb-6 transition-colors cursor-pointer"
        >
          <ChevronLeft className="mr-1 w-4 h-4 md:w-6 md:h-6" /> Back
        </button>

        <div className="flex justify-between items-start md:items-center">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-primary capitalize">
              {course.subject}
            </h1>
            <p className="text-sm md:text-base font-normal text-foreground">
              {showQuiz ? `${activeModuleTitle} - Assessment` : activeModuleTitle}
            </p>
          </div>

          <div className="text-right hidden md:block">
            <h2 className="text-2xl font-semibold text-primary">
              Total Students: {course.class?.totalStudents || 0}
            </h2>
            <p className="text-xs font-normal text-foreground">
              {course.courseName}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile View Buttons */}
      {isMobile && (
        <div className="flex justify-between items-center gap-3 mb-4">
          <button
            onClick={() => setLeftSidebarOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary/10 text-primary px-5 py-3 rounded-lg flex-1"
          >
            <span className="text-sm font-semibold">Modules</span>
          </button>
          {!showQuiz && (
            <button
              onClick={() => setRightSidebarOpen(true)}
              className="flex items-center justify-center gap-2 bg-primary/10 text-primary px-5 py-3 rounded-lg flex-1"
            >
              <span className="text-sm font-semibold">Attendance</span>
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-240px)]">
        {/* ---------- Left Sidebar (Desktop) ---------- */}
        {!isMobile && (
          <aside
            className={cn(
              "bg-card shadow-[0_4px_4px_0] border shadow-primary/20 rounded-xl py-6 flex flex-col transition-all duration-300",
              isCollapsed ? "col-span-1" : "col-span-3",
            )}
          >
            {!isCollapsed && (
              <div className="px-6 mb-6 flex justify-between items-center border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-base font-normal text-secondary mb-1">
                    Modules
                  </h3>
                  <p className="text-xs text-secondary font-normal">
                    {course.modules?.length || 0} modules • {lessons.length} topics
                  </p>
                </div>
                <PanelRightOpen
                  size={24}
                  className="text-foreground hover:text-primary cursor-pointer"
                  onClick={() => setIsCollapsed(true)}
                />
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center mb-6">
                <PanelRightClose
                  size={24}
                  className="text-foreground hover:text-primary cursor-pointer"
                  onClick={() => setIsCollapsed(false)}
                />
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
              <Accordion
                type="multiple"
                defaultValue={course.modules?.[0]?.id ? [`module-${course.modules[0].id}`] : []}
                className="space-y-4"
              >
                {course.modules?.map((module, mIdx) => (
                  <AccordionItem key={module.id} value={`module-${module.id}`} className="border-none">
                    <AccordionTrigger className="hover:no-underline p-0 py-2 group [&>svg]:hidden cursor-pointer">
                      <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                        <ChevronDown
                          size={24}
                          className="group-data-[state=closed]:-rotate-90 transition-transform text-primary"
                        />
                        <Folder
                          size={24}
                          className="text-primary fill-primary/10"
                        />
                        {!isCollapsed && <span className="text-start line-clamp-1">{mIdx + 1}. {module.moduleTitle}</span>}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pl-4 space-y-1">
                      {lessons
                        .filter((l) => l.moduleId === module.id)
                        .map((lesson, idx) => (
                          <div
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson.id)}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-md text-xs font-normal cursor-pointer transition-all",
                              activeLessonId === lesson.id
                                ? "bg-primary/20 text-primary border border-primary/50"
                                : "text-foreground hover:text-secondary",
                            )}
                          >
                            <FileText size={20} />
                            {!isCollapsed && (
                              <span className="line-clamp-2">
                                {mIdx + 1}.{idx + 1} {lesson.title}
                              </span>
                            )}
                          </div>
                        ))}
                      <div
                        onClick={() => handleQuizClick(module.id)}
                        className={cn(
                          "flex items-center gap-3 p-2 text-xs font-semibold cursor-pointer rounded-md transition-all",
                          activeLessonId === `quiz-${module.id}`
                            ? "bg-primary text-black"
                            : "text-primary hover:bg-primary/10",
                        )}
                      >
                        <HelpCircle size={20} />
                        {!isCollapsed && <span>Module {mIdx + 1} Quiz</span>}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </aside>
        )}

        {/* ---------- Left Sidebar Drawer (Mobile/Tablet) ---------- */}
        {isMobile && (
          <>
            {/* Backdrop */}
            {leftSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setLeftSidebarOpen(false)}
              />
            )}
            {/* Drawer */}
            <aside
              className={cn(
                "fixed top-0 left-0 h-full w-80 bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
                leftSidebarOpen ? "translate-x-0" : "-translate-x-full",
              )}
            >
              <div className="px-6 py-6 flex justify-between items-center border-b border-foreground/10">
                <div>
                  <h3 className="text-base font-normal text-secondary mb-1">
                    Modules
                  </h3>
                  <p className="text-xs text-secondary font-normal">
                    {course.modules?.length || 0} modules • {lessons.length} topics
                  </p>
                </div>
                <X
                  size={24}
                  className="text-foreground hover:text-primary cursor-pointer"
                  onClick={() => setLeftSidebarOpen(false)}
                />
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
                <Accordion
                  type="multiple"
                  defaultValue={course.modules?.[0]?.id ? [`module-${course.modules[0].id}`] : []}
                  className="space-y-4"
                >
                  {course.modules?.map((module, mIdx) => (
                    <AccordionItem key={module.id} value={`module-${module.id}`} className="border-none">
                      <AccordionTrigger className="hover:no-underline p-0 py-2 group [&>svg]:hidden cursor-pointer">
                        <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                          <ChevronDown
                            size={24}
                            className="group-data-[state=closed]:-rotate-90 transition-transform text-primary"
                          />
                          <Folder
                            size={24}
                            className="text-primary fill-primary/10"
                          />
                          <span className="text-start">{mIdx + 1}. {module.moduleTitle}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pl-4 space-y-1">
                        {lessons
                          .filter((l) => l.moduleId === module.id)
                          .map((lesson, idx) => (
                            <div
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson.id)}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-md text-xs font-normal cursor-pointer transition-all",
                                activeLessonId === lesson.id
                                  ? "bg-primary/20 text-primary border border-primary/50"
                                  : "text-foreground hover:text-secondary",
                              )}
                            >
                              <FileText size={20} />
                              <span className="line-clamp-2">
                                {mIdx + 1}.{idx + 1} {lesson.title}
                              </span>
                            </div>
                          ))}
                        <div
                          onClick={() => handleQuizClick(module.id)}
                          className={cn(
                            "flex items-center gap-3 p-2 text-xs font-semibold cursor-pointer rounded-md",
                            activeLessonId === `quiz-${module.id}`
                              ? "bg-primary text-black"
                              : "text-primary hover:bg-primary/10",
                          )}
                        >
                          <HelpCircle size={20} />
                          <span>Module {mIdx + 1} Quiz</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </aside>
          </>
        )}

        {/* ---------- Main Content ---------- */}
        <main
          className={cn(
            "overflow-y-auto custom-scrollbar",
            showQuiz
              ? "p-0"
              : "bg-card shadow-[0_4px_4px_0] shadow-primary/20 rounded-xl p-5 md:p-10 border",
            isMobile
              ? "col-span-12"
              : showQuiz
                ? isCollapsed
                  ? "col-span-11"
                  : "col-span-9"
                : isCollapsed && isRightCollapsed
                  ? "col-span-10"
                  : isCollapsed || isRightCollapsed
                    ? "col-span-8"
                    : "col-span-6",
          )}
        >
          {showQuiz ? (
            <Quiz key={activeLessonId} questions={activeQuizQuestions} />
          ) : activeLesson ? (
            <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <p className="text-[#C08F42] text-sm font-bold uppercase tracking-widest">{activeLesson.moduleTitle}</p>
                <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                  {activeLesson.title}
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-[#C08F42] rounded-full" />
                    Summary
                  </h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                    {activeLesson.content.summary}
                  </p>
                </div>

                <div className="prose prose-invert max-w-none">
                  <h3 className="text-xl font-bold text-white mb-6">Detailed Explanation</h3>
                  <div className="text-zinc-300 text-lg leading-relaxed space-y-4">
                    {activeLesson.content.detailed.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-secondary text-center space-y-4">
              <Folder size={48} className="text-primary/20" />
              <p>Please select a module topic to start learning.</p>
            </div>
          )}
        </main>

        {/* ---------- Right Sidebar (Desktop) ---------- */}
        {!isMobile && !showQuiz && (
          <section
            className={cn(
              "bg-card shadow-[0_4px_4px_0] border shadow-primary/20 rounded-xl flex flex-col overflow-hidden transition-all duration-300",
              isRightCollapsed ? "col-span-1" : "col-span-3",
            )}
          >
            <div className="p-5">
              {!isRightCollapsed ? (
                <div className="flex justify-between items-center gap-2">
                  <h3 className="font-normal text-foreground text-[18px]">
                    Student Attendance
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleMarkAllPresent}
                      disabled={isMarkingPresent}
                      className="bg-primary h-auto text-background text-base font-normal px-4 py-2 rounded cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {isMarkingPresent ? "Marking..." : "Mark as present"}
                    </Button>
                    <PanelRightClose
                      size={24}
                      className="text-foreground hover:text-primary cursor-pointer shrink-0"
                      onClick={() => setIsRightCollapsed(true)}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <PanelRightOpen
                    size={24}
                    className="text-foreground hover:text-primary cursor-pointer"
                    onClick={() => setIsRightCollapsed(false)}
                  />
                </div>
              )}

              {!isRightCollapsed && (
                <div className="flex justify-between items-center text-base font-normal text-foreground mt-8 border-b border-foreground/10 pb-4">
                  <h3>Total Joined</h3>
                  <div className="text-primary font-bold">
                    {joinedStudents.length}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 px-4 custom-scrollbar pb-6">
              {joinedStudents.map((item, index) => {
                const name = `${item.student.firstName} ${item.student.lastName}`;
                const isPresent = item.status === "PRESENT" || item.status === "LATE";
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors",
                      isRightCollapsed ? "justify-center" : "justify-between",
                      isPresent && !isRightCollapsed && "bg-primary/5",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all overflow-hidden relative",
                            isPresent
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-white/10 bg-muted text-muted-foreground",
                          )}
                        >
                          <Image
                            src={item.student.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                            className={cn(
                              "w-full h-full object-cover transition-opacity",
                              isPresent ? "opacity-40" : "opacity-100",
                            )}
                            alt="avatar"
                            width={32}
                            height={32}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
                            }}
                          />
                          <span className="absolute z-0">
                            {getInitials(name)}
                          </span>
                        </div>
                      </div>
                      {!isRightCollapsed && (
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isPresent ? "text-primary" : "text-foreground",
                            )}
                          >
                            {name}
                          </span>
                          <span className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">
                            {item.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {joinedStudents.length === 0 && !isRightCollapsed && (
                <div className="py-10 text-center text-zinc-500 text-xs italic">
                  Waiting for students to join...
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------- Right Sidebar Drawer (Mobile/Tablet) ---------- */}
        {isMobile && !showQuiz && (
          <>
            {/* Backdrop */}
            {rightSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setRightSidebarOpen(false)}
              />
            )}
            {/* Drawer */}
            <section
              className={cn(
                "fixed top-0 right-0 h-full w-80 bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
                rightSidebarOpen ? "translate-x-0" : "translate-x-full",
              )}
            >
              <div className="p-5 border-b border-foreground/10">
                <div className="flex justify-between items-center gap-2">
                  <h3 className="font-normal text-foreground text-[18px]">
                    Student Attendance
                  </h3>
                  <div className="flex items-center gap-2">
                    <X
                      size={24}
                      className="text-foreground hover:text-primary cursor-pointer shrink-0"
                      onClick={() => setRightSidebarOpen(false)}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-base font-normal text-foreground mt-6">
                  <h3>Total Joined</h3>
                  <div className="text-primary font-bold">
                    {joinedStudents.length}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 px-4 py-4 custom-scrollbar">
                {joinedStudents.map((item, index) => {
                  const name = `${item.student.firstName} ${item.student.lastName}`;
                  const isPresent = item.status === "PRESENT" || item.status === "LATE";
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors justify-between",
                        isPresent && "bg-primary/5",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all overflow-hidden relative",
                              isPresent
                                ? "border-primary bg-primary/20 text-primary"
                                : "border-white/10 bg-muted text-muted-foreground",
                            )}
                          >
                            <Image
                              src={item.student.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                              className={cn(
                                "w-full h-full object-cover transition-opacity",
                                isPresent ? "opacity-40" : "opacity-100",
                              )}
                              alt="avatar"
                              width={32}
                              height={32}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
                              }}
                            />
                            <span className="absolute z-0">
                              {getInitials(name)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isPresent ? "text-primary" : "text-foreground",
                            )}
                          >
                            {name}
                          </span>
                          <span className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C08F42;
        }
      `}</style>
    </div>
  );
}
