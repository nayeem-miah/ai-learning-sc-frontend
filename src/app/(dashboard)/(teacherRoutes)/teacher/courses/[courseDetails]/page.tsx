"use client";
import { useState, use } from 'react';
import { ChevronLeft, ChevronDown, ChevronRight, CheckCircle2, Loader, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetTeacherCourseDetailsQuery } from '@/lib/feature/courses/coursesApi';

// --- Sub-components ---

const LessonItem = ({ title, type, duration, isCompleted = true }: { title: string; type: string; duration?: string; isCompleted?: boolean }) => (
  <div className="flex items-center justify-between  p-4 bg-[#1A1A1A]/40 border-l-2 border-[#C08F42] hover:bg-[#1A1A1A] transition-colors mb-1">
    <div className="flex items-center gap-4">
      <CheckCircle2 size={18} className={isCompleted ? "text-[#C08F42]" : "text-zinc-600"} />
      <div>
        <h4 className="text-zinc-200 text-sm font-medium">{title}</h4>
        <p className="text-zinc-500 text-xs mt-0.5">{type}</p>
      </div>
    </div>
    <span className="text-zinc-500 text-xs">{duration}</span>
  </div>
);

const ModuleAccordion = ({ title, progress, duration, isOpen, onClick, children }: { title: string; progress: string; duration: string; isOpen: boolean; onClick: () => void; children?: React.ReactNode }) => (
  <div className="border border-white/10 rounded-lg overflow-hidden mb-3">
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 bg-[#121212] hover:bg-[#181818] transition-colors"
    >
      <div className="flex items-center gap-4">
        {isOpen ? <ChevronDown size={20} className="text-[#C08F42]" /> : <ChevronRight size={20} className="text-zinc-400" />}
        <div className="text-left">
          <h3 className="text-zinc-100 font-semibold text-[15px]">{title}</h3>
          <p className="text-zinc-500 text-xs mt-1">{progress}</p>
        </div>
      </div>
      <span className="text-zinc-500 text-xs font-light">{duration}</span>
    </button>
    {isOpen && (
      <div className="bg-[#0F0F0F] p-4 border-t border-white/5">
        {children}
      </div>
    )}
  </div>
);

// --- Main Page Component ---

export default function CourseSyllabus({ params }: { params: Promise<{ courseDetails: string }> }) {
  const router = useRouter();
  const { courseDetails: courseId } = use(params);
  
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);

  const { data, isLoading, error } = useGetTeacherCourseDetailsQuery(courseId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <Loader className="w-12 h-12 text-[#C08F42] animate-spin" />
        <p className="text-zinc-400 animate-pulse">Fetching syllabus details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Error Loading Syllabus</h2>
        <p className="text-zinc-400 max-w-md">
          {(error as any)?.data?.message || "We couldn't retrieve the course details. Please try again later."}
        </p>
        <button 
          onClick={() => router.back()}
          className="mt-8 px-6 py-2 bg-[#C08F42]/10 border border-[#C08F42]/20 text-[#C08F42] rounded-lg hover:bg-[#C08F42]/20 transition-all font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const course = data?.data;
  if (!course) return null;

  const stats = [
    { label: "MASTERY REQUIREMENT", value: `${course.stats?.masteryRequirement || 0}%` },
    { label: "MODULES/COMPLETED", value: `${course.stats?.modulesTotal || 0}` },
    { label: "LESSONS/COMPLETED", value: `${course.stats?.lessonsTotal || 0}` },
    { label: "ASSESSMENTS/COMPLETED", value: `${course.stats?.assessmentsTotal || 0}` },
    { label: "COURSE LENGTH", value: course.stats?.courseLength || course.courseLength, primary: true },
  ];

  return (
    <div className=" bg-[#0A0A0A] text-zinc-300 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 p-8 bg-[#121212] border border-white/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <div className="text-8xl font-black text-[#C08F42] select-none uppercase tracking-tighter font-sans">
                {course.subject}
             </div>
          </div>
          
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#C08F42] text-sm font-medium mb-6 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          <h1 className="text-4xl font-bold text-[#C08F42] mb-3">{course.courseName}</h1>
          <p className="text-zinc-400 max-w-3xl leading-relaxed">
            {course.description || course.generatedCourseName}
          </p>
          
          <div className="mt-6 flex gap-4 text-xs font-medium uppercase tracking-widest text-zinc-500">
             <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#C08F42]" /> {course.targetGradeLevel}</span>
             <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#C08F42]" /> {course.courseLength}</span>
             <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#C08F42]" /> {course.semesterCount} Semesters</span>
          </div>
        </header>

        {/* Syllabus Container */}
        <section className="bg-[#121212] border border-white/10 rounded-xl p-8">
          <div className="mb-8">
            <h2 className="text-[#C08F42] font-bold tracking-widest text-2xl mb-1 uppercase">COURSE SYLLABUS</h2>
            <p className="text-zinc-500 text-sm uppercase tracking-tight">Modules, lessons, and assessments</p>
            <hr className="mt-6 border-white/5" />
          </div>

          {/* Modules */}
          {course.modules?.map((module, mIdx) => (
            <ModuleAccordion 
              key={module.id}
              title={`Module ${module.moduleNumber}: ${module.moduleTitle}`} 
              progress={`${module.studyTopics?.length || 0} Topics`} 
              duration={module.voiceData?.duration_seconds ? `${Math.ceil(module.voiceData.duration_seconds / 60)} min audio` : ""}
              isOpen={openModuleIndex === mIdx}
              onClick={() => setOpenModuleIndex(openModuleIndex === mIdx ? null : mIdx)}
            >
              {module.introduction && (
                <p className="text-zinc-400 text-sm italic mb-6 leading-relaxed border-l-2 border-white/5 pl-4 py-1">
                  &quot;{module.introduction}&quot;
                </p>
              )}

              {module.studyTopics && module.studyTopics.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-[#C08F42] text-[10px] font-bold tracking-[0.2em] mb-4">LESSONS / TOPICS</h5>
                  {module.studyTopics.map((topic, tIdx) => (
                    <LessonItem 
                      key={tIdx} 
                      title={topic.topic_name} 
                      type="Topic" 
                      isCompleted={false} 
                    />
                  ))}
                </div>
              )}

              {module.quizQuestions && module.quizQuestions.length > 0 && (
                <div>
                  <h5 className="text-[#C08F42] text-[10px] font-bold tracking-[0.2em] mb-4">ASSESSMENTS</h5>
                  {module.quizQuestions.map((quiz, qIdx) => (
                    <LessonItem 
                      key={qIdx} 
                      title={`Quiz Question ${quiz.questionNumber}`} 
                      type="Quiz" 
                      isCompleted={false}
                    />
                  ))}
                </div>
              )}
            </ModuleAccordion>
          ))}

          {/* Stats Footer */}
          <footer className="mt-12 pt-8 border-t border-white/5 flex flex-wrap justify-between gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="flex-1 min-w-[120px]">
                <div className="text-2xl font-bold text-[#C08F42]">
                  {stat.value}
                </div>
                <div className="text-[13px] font-medium text-zinc-500 mt-2 tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </footer>
        </section>
      </div>
    </div>
  );
}