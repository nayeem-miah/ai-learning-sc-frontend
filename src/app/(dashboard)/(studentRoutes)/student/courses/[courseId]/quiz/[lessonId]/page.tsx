"use client";

import React, { use, useState, useEffect } from "react";
import { 
  CheckCircle, 
  ChevronLeft, 
  HelpCircle,
  Loader2, 
  Play,
  X, 
  Award 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { useGetStudentCourseDetailsQuery, useSubmitQuizMutation } from "@/lib/feature/courses/coursesApi";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface QuizPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default function StudentQuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  const { courseId, lessonId } = use(params);
  
  const { data: response, isLoading: isCourseLoading } = useGetStudentCourseDetailsQuery(courseId);
  const [submitQuiz, { isLoading: isSubmitting }] = useSubmitQuizMutation();
  
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [viewState, setViewState] = useState<"quiz" | "result">("quiz");
  
  const courseData = response?.data;
  const currentLessonIndex = courseData?.modules?.findIndex((m: any) => m.id === lessonId) ?? 0;
  const currentModule = courseData?.modules?.[currentLessonIndex] as any;
  const courseTitle = courseData?.courseName || "Course Name";
  const currentModuleTitle = currentModule?.moduleTitle || "Module Title";

  useEffect(() => {
    if (currentModule) {
      if (currentModule.isCompleted || (currentModule.quizScore !== null && currentModule.quizScore !== undefined)) {
        setViewState("result");
      }
    }
  }, [currentModule]);

  if (isCourseLoading) return <div className="p-8 text-white h-screen flex items-center justify-center bg-[#111]">Loading quiz...</div>;
  if (!courseData || !currentModule) return <div className="p-8 text-white h-screen flex items-center justify-center bg-[#111]">Quiz not found</div>;

  const quizQuestions = currentModule.quizQuestions?.map((q: any) => ({
    questionId: q.questionId,
    question: q.questionText,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    correctAnswer: ["A", "B", "C", "D"].indexOf(q.correctAnswer)
  })) || [];

  const allQuestionsAnswered = quizQuestions.length > 0 && 
                               Object.keys(answers).length === quizQuestions.length;

  const handleLessonChange = (idx: number) => {
    const targetModule = courseData.modules[idx];
    if (targetModule) {
      router.push(`/student/courses/${courseId}/lesson/${targetModule.id}`);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!allQuestionsAnswered) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    const payload = {
      unique_user_id: courseData.uniqueUserId,
      unique_session_id: courseData.uniqueSessionId,
      module_id: lessonId,
      answers: quizQuestions.map((q: any, idx: number) => {
        const selectedIdx = answers[idx];
        return {
          question_id: q.questionId,
          selected_answer: ["A", "B", "C", "D"][selectedIdx ?? 0]
        };
      })
    };

    try {
      const res = await submitQuiz(payload).unwrap();
      if (res.success) {
        setQuizResult(res.data);
        setViewState("result");
        toast.success(res.message || "Quiz submitted successfully");
      }
    } catch (err: any) {
      console.error("Quiz submission error:", err);
      toast.error(err?.data?.message || "Failed to submit quiz");
    }
  };

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  return (
    <div className="flex h-screen text-foreground overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-[320px] bg-[#1C1C1C] border-r border-[#333] flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-[#333]">
          <Link
            href={`/student/courses/${courseId}`}
            className="text-sm text-gray-400 hover:text-[#D4AF37] flex items-center gap-2 mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Course
          </Link>
          <h2 className="text-[#D4AF37] font-semibold text-lg">
            Lesson Quiz
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {courseTitle} - {currentModuleTitle}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          <Accordion type="single" collapsible defaultValue={`module-${currentLessonIndex}`} className="space-y-1">
            {courseData.modules?.map((m: any, mIdx: number) => (
              <AccordionItem key={m.id || mIdx} value={`module-${mIdx}`} className="border-none">
                <AccordionTrigger className="hover:no-underline py-2 px-3 rounded-lg hover:bg-[#252525] text-left transition-all data-[state=open]:bg-[#252525] [&>svg]:w-3 [&>svg]:h-3">
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider">Module {m.moduleNumber}</span>
                    <span className="text-xs font-semibold text-gray-200 line-clamp-1">{m.moduleTitle}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-2 px-1 space-y-0.5 animate-none">
                  {m.studyTopics?.map((topic: any, tIdx: number) => (
                    <div
                      key={tIdx}
                      onClick={() => router.push(`/student/courses/${courseId}/lesson/${m.id}`)}
                      className={cn(
                        "group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all border border-transparent hover:bg-[#202020] text-gray-400 hover:text-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-[#333] text-gray-500 group-hover:bg-[#444] group-hover:text-gray-300"
                      )}>
                        {tIdx + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                         <span className="text-[11px] font-medium leading-tight">Lesson {tIdx + 1}</span>
                         <span className="text-[9px] opacity-60 line-clamp-1 leading-tight">{topic.topic_name}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Quiz Item */}
                  {m.quizQuestions?.length > 0 && (
                     <div
                        onClick={() => {
                           if (mIdx !== currentLessonIndex) {
                              router.push(`/student/courses/${courseId}/quiz/${m.id}`);
                           }
                        }}
                        className={cn(
                          "group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all mt-1 border border-transparent",
                          mIdx === currentLessonIndex 
                            ? "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]" 
                            : "hover:bg-[#202020] text-gray-400 hover:text-gray-200"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                          mIdx === currentLessonIndex
                            ? "bg-[#D4AF37] text-black" 
                            : "bg-[#333] text-gray-500 group-hover:bg-[#444] group-hover:text-gray-300"
                        )}>
                          <HelpCircle className="w-3 h-3" />
                        </div>
                        <div className="flex flex-col min-w-0">
                           <span className="text-[11px] font-medium leading-tight">Module Quiz</span>
                           <span className="text-[9px] opacity-60 leading-tight">{m.quizQuestions.length} Questions</span>
                        </div>
                      </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#111]">
        <div className="max-w-4xl mx-auto p-8">
          {viewState === "quiz" ? (
            <div className="space-y-8">
              {quizQuestions.map((q: any, qIdx: number) => (
                <div
                  key={qIdx}
                  className="bg-[#1C1C1C] border border-[#333] rounded-2xl p-8"
                >
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                    Question {qIdx + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-8">
                    {q.question}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {q.options.map((option: string, oIdx: number) => (
                      <div
                        key={oIdx}
                        onClick={() => handleOptionSelect(qIdx, oIdx)}
                        className={cn(
                          "p-5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all",
                          answers[qIdx] === oIdx
                            ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]"
                            : "bg-[#181818] border-[#222] text-gray-400 hover:border-[#444]"
                        )}
                      >
                        <span className="font-medium">
                          {["A", "B", "C", "D"][oIdx]}) {option}
                        </span>
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                          answers[qIdx] === oIdx ? "border-[#D4AF37]" : "border-gray-600"
                        )}>
                          {answers[qIdx] === oIdx && <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-col items-end gap-3 pb-20">
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || !allQuestionsAnswered}
                  className="bg-[#D4AF37] hover:bg-[#c4a02f] text-black font-bold h-14 px-10 rounded-xl text-lg min-w-[200px] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
                {!allQuestionsAnswered && (
                  <p className="text-gray-500 text-sm">Please answer all questions to submit</p>
                )}
              </div>
            </div>
          ) : (
            /* Result View */
            <div className="space-y-10">
              <div className="relative border-2 border-dashed border-[#22D3EE] rounded-3xl p-10 text-center bg-[#161616]">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#111] border-2 border-[#D4AF37] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-black" />
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold text-white mt-6 mb-2">Quiz Complete!</h2>
                <p className="text-gray-400">Great job! Here&#39;s how you did:</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                  <div className="bg-[#1C1C1C] border border-dashed border-gray-700 rounded-xl p-6">
                    <div className="text-4xl font-bold text-white">
                      {quizResult ? quizResult.correct_answers * 10 : (currentModule.quizScore || 0) * 10}
                    </div>
                    <div className="text-xs uppercase text-[#D4AF37] font-semibold tracking-widest mt-2">Points Earned</div>
                  </div>
                  <div className="bg-[#1C1C1C] border border-dashed border-gray-700 rounded-xl p-6">
                    <div className="text-4xl font-bold text-white">
                      {quizResult ? `${quizResult.correct_answers}/${quizResult.total_questions}` : currentModule.correctAnswersCount || "0/0"}
                    </div>
                    <div className="text-xs uppercase text-[#D4AF37] font-semibold tracking-widest mt-2">Correct Answers</div>
                  </div>
                  <div className="bg-[#1C1C1C] border border-dashed border-gray-700 rounded-xl p-6">
                    <div className="text-4xl font-bold text-white">
                      {quizResult ? quizResult.score_percentage : currentModule.accuracy || 0}%
                    </div>
                    <div className="text-xs uppercase text-[#D4AF37] font-semibold tracking-widest mt-2">Accuracy</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {quizQuestions.map((q: any, qIdx: number) => {
                  const apiDetail = quizResult?.details?.find((d: any) => d.question_id === q.questionId);
                  const backendResult = currentModule.quizResult?.find((r: any) => r.questionId === q.questionId);
                  
                  const isCorrect = apiDetail ? apiDetail.is_correct : (backendResult ? backendResult.isCorrect : false);
                  const selectedLabel = apiDetail ? apiDetail.selected_answer : (backendResult ? backendResult.selectedAnswer : null);
                  const selectedIdx = ["A", "B", "C", "D"].indexOf(selectedLabel || "");
                  
                  const correctLabel = apiDetail ? apiDetail.correct_answer : (backendResult ? backendResult.correctAnswer : ["A", "B", "C", "D"][q.correctAnswer]);
                  const correctIdx = ["A", "B", "C", "D"].indexOf(correctLabel || "");

                  return (
                    <div key={qIdx} className="bg-[#161616] border-2 border-dashed border-[#22D3EE]/30 rounded-2xl p-8">
                      <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-widest mb-4">Question: {qIdx + 1}</h3>
                      <p className="text-2xl font-bold text-white mb-8">{q.question}</p>
                      <div className="space-y-4">
                        {q.options.map((option: string, oIdx: number) => {
                          const isActuallySelected = selectedIdx === oIdx;
                          const isTheCorrectOption = oIdx === correctIdx;
                          
                          let cardStyle = "bg-[#1C1C1C] border-[#333] text-gray-400";
                          if (isActuallySelected && isCorrect) cardStyle = "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]";
                          if (isActuallySelected && !isCorrect) cardStyle = "bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]";
                          if (!isActuallySelected && isTheCorrectOption && !isCorrect) cardStyle = "bg-[#22C55E]/5 border-[#22C55E]/30 text-[#22C55E]";

                          return (
                            <div key={oIdx} className={cn("p-5 rounded-xl border flex justify-between items-center transition-all", cardStyle)}>
                              <span className="font-medium">{["A", "B", "C", "D"][oIdx]}) {option}</span>
                              {isActuallySelected && isCorrect && <CheckCircle className="w-5 h-5" />}
                              {isActuallySelected && !isCorrect && <X className="w-5 h-5" />}
                              {!isActuallySelected && isTheCorrectOption && !isCorrect && <CheckCircle className="w-5 h-5 opacity-50" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-4 pb-20">
                {courseData.retestingAllowed && (
                  <Button
                    onClick={() => {
                      setViewState("quiz");
                      setAnswers({});
                      setQuizResult(null);
                    }}
                    variant="outline"
                    className="border-[#333] bg-transparent text-[#D4AF37] hover:bg-[#D4AF37]/10 h-14 px-10 rounded-xl"
                  >
                    Try Again
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/student/courses/${courseId}`)}
                  className="bg-[#D4AF37] hover:bg-[#c4a02f] text-black font-bold h-14 px-10 rounded-xl"
                >
                  Go Back to Course
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
