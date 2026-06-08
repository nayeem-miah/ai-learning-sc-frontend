/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useGetSingleStudentManagementQuery } from "@/lib/feature/courses/coursesApi";
import { Loader2, Info, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function QuizDetailView() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;

  const { data: singleStudentResponse, isLoading } = useGetSingleStudentManagementQuery(studentId);
  const detailData = singleStudentResponse?.data;

  const currentCourse = detailData?.enrolledCourses.find((c: any) => c.id === courseId);
  const moduleData = currentCourse?.modules?.find((m: any) => m.id === moduleId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D0AD6B]" />
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="py-24 text-center">
        <Info className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 font-bold">Quiz records not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-[#D0AD6B] hover:underline flex items-center gap-2 mx-auto">
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.back()}
          className="p-2 bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h4 className="text-xl font-bold text-white">Module {moduleData.moduleNumber}: {moduleData.moduleTitle}</h4>
          <p className="text-[11px] text-[#D0AD6B] font-bold uppercase mt-1">Detailed Quiz Report</p>
        </div>
      </div>

      <div className="space-y-4">
        {moduleData.quizHistory?.map((quiz: any, qIdx: number) => (
          <div key={qIdx} className="bg-[#141414] rounded-2xl border border-[#222] p-6 shadow-sm">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-3">Question: {qIdx + 1}</p>
            <h5 className="text-[15px] font-bold text-white mb-6 leading-relaxed">{quiz.questionText}</h5>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'A', text: quiz.optionA },
                { label: 'B', text: quiz.optionB },
                { label: 'C', text: quiz.optionC },
                { label: 'D', text: quiz.optionD }
              ].map((opt) => {
                const isSelected = quiz.selectedAnswer === opt.label;
                const isCorrect = quiz.correctAnswer === opt.label;
                const showSuccess = isCorrect;
                const showError = isSelected && !isCorrect;

                return (
                  <div 
                    key={opt.label}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      showSuccess 
                        ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]" 
                        : showError 
                          ? "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]" 
                          : "bg-[#1A1A1A] border-[#222] text-gray-400"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="font-bold opacity-60">{opt.label}:</span>
                      <span className="font-medium">{opt.text}</span>
                    </div>
                    {showSuccess && (
                      <CheckCircle2 size={16} className="text-[#22C55E]" />
                    )}
                    {showError && (
                      <XCircle size={16} className="text-[#EF4444]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
