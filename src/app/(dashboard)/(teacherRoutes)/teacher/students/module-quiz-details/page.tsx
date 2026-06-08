'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ChevronLeft, Loader, Send } from 'lucide-react';
import { useGetSingleStudentManagementQuery, useAddFeedbackMutation } from '@/lib/feature/courses/coursesApi';
import { toast } from 'sonner';

const QuizDetailsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const studentId = searchParams.get('studentId');
  const courseId = searchParams.get('courseId');
  const moduleId = searchParams.get('moduleId');

  const { data: response, isLoading, error } = useGetSingleStudentManagementQuery(studentId as string, {
    skip: !studentId,
  });

  const [feedbackText, setFeedbackText] = React.useState("");
  const [addFeedback, { isLoading: isSubmitting }] = useAddFeedbackMutation();

  const enrolledCourses = response?.data?.enrolledCourses;
  const targetCourse = enrolledCourses?.find((c: any) => c.id === courseId);
  const targetModule = targetCourse?.modules?.find((m: any) => m.id === moduleId);

  React.useEffect(() => {
    if (targetModule?.teacherFeedback) {
        setFeedbackText(targetModule.teacherFeedback);
    }
  }, [targetModule?.teacherFeedback]);

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
        toast.error("Feedback cannot be empty");
        return;
    }
    try {
        await addFeedback({ 
            studentId: studentId as string, 
            courseId: courseId as string, 
            moduleId: moduleId as string, 
            content: feedbackText 
        }).unwrap();
        toast.success("Feedback submitted successfully");
    } catch (err: any) {
        toast.error(err?.data?.message || err?.message || "Failed to submit feedback");
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <Loader className="w-12 h-12 text-primary animate-spin" />
            <p className="text-gray-400 mt-4 animate-pulse">Loading quiz details...</p>
        </div>
    );
  }

  if (error || !response?.data) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
              <h1 className="text-2xl text-white mb-2">Error Loading Quiz Details</h1>
              <p className="text-gray-400 mb-6">Could not retrieve the quiz details for this module.</p>
              <button onClick={() => router.back()} className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white hover:bg-[#2a2a2a] transition">Go Back</button>
          </div>
      );
  }

  if (!targetModule) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-xl text-white mb-2">Module Not Found</h1>
            <p className="text-gray-400 mb-6">Could not locate the requested module details.</p>
            <button onClick={() => router.back()} className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white hover:bg-[#2a2a2a] transition">Go Back</button>
        </div>
    );
  }

  const { quizHistory = [], teacherFeedback, moduleNumber, moduleTitle } = targetModule;

  return (
    <div className="min-h-[80vh] text-zinc-300 p-4 md:p-8">
      <div className="space-y-6">
        
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-white mb-5 transition-colors cursor-pointer group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Student Details
        </button>

        <h1 className="text-2xl font-medium text-white mb-8">
          Module {moduleNumber} - {moduleTitle}
        </h1>

        {/* Question Cards */}
        {quizHistory.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-lg font-medium text-white mb-1">No Quiz Available</p>
            <p className="text-gray-500 text-sm">The student hasn't taken a quiz for this module yet.</p>
          </div>
        ) : (
            quizHistory.map((q: any, idx: number) => (
              <div key={idx} className="bg-card border border-gray-800 rounded-xl p-6 shadow-[0_4px_4px_0] shadow-primary/10">
                <p className="text-zinc-500 text-sm mb-1">Question {idx + 1}</p>
                <h2 className="text-lg font-medium text-white mb-4">{q.questionText}</h2>
                
                <div className="space-y-3">
                  {[
                      { key: 'A', text: q.optionA },
                      { key: 'B', text: q.optionB },
                      { key: 'C', text: q.optionC },
                      { key: 'D', text: q.optionD }
                  ].map((option, i) => {
                    
                    const isCorrectAnswer = option.key === q.correctAnswer;
                    const isSelectedAnswer = option.key === q.selectedAnswer;
                    
                    let state = 'default';
                    if (isCorrectAnswer && isSelectedAnswer) state = 'correct';
                    else if (isCorrectAnswer && !isSelectedAnswer) state = 'success-faint';
                    else if (!isCorrectAnswer && isSelectedAnswer) state = 'incorrect';

                    const isCorrect = state === 'correct';
                    const isIncorrect = state === 'incorrect';
                    const isSuccessFaint = state === 'success-faint';

                    return (
                      <div
                        key={i}
                        className={`
                          flex items-center justify-between p-4 rounded-lg border transition-colors
                          ${isCorrect ? 'bg-[#1b3321] border-green-900/50 text-green-400' : 
                            isIncorrect ? 'bg-[#331b1b] border-red-900/50 text-red-400' :
                            isSuccessFaint ? 'bg-[#1b2b21] border-green-900/30 text-green-700' :
                            'bg-[#262626] border-gray-800 text-zinc-400'}
                        `}
                      >
                        <span className="text-sm font-medium">{option.key}) {option.text}</span>
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {isIncorrect && <XCircle className="w-4 h-4 text-red-500" />}
                        {isSuccessFaint && <CheckCircle2 className="w-4 h-4 text-green-700" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        )}

        {/* Teacher's Feedback Section */}
        <div className="mt-12 bg-card border border-gray-800 rounded-xl p-6 shadow-[0_4px_4px_0] shadow-primary/10">
          <h3 className="text-lg font-medium text-white mb-4">Teacher's Feedback</h3>
          <div className="space-y-4">
            <textarea
              className="w-full min-h-[120px] bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-y placeholder:text-gray-600 transition-all"
              placeholder="Add your feedback and recommendations for this student..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <button
                onClick={handleFeedbackSubmit}
                disabled={isSubmitting || !feedbackText.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const ModuleQuizDetails = () => {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader className="w-12 h-12 text-primary animate-spin" />
            </div>
        }>
            <QuizDetailsContent />
        </Suspense>
    );
};

export default ModuleQuizDetails;