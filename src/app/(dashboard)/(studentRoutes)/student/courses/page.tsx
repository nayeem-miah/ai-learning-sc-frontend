"use client";

import React from "react";
import { BookOpen, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useGetStudentPublishedCoursesQuery } from "@/lib/feature/courses/coursesApi";

export default function MyCoursesPage() {
  const { data: response, isLoading } = useGetStudentPublishedCoursesQuery();
  const courses = response?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#C08F42] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold">Loading Courses...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-foreground">
      <div className="mb-8 p-6 bg-[#1C1C1C] border border-[#333] rounded-xl">
        <h1 className="text-xl font-bold text-[#D4AF37] mb-1">My Courses</h1>
        <p className="text-gray-400 text-sm">Track your progress across all subjects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course: any) => {
          const progress = course.overallProgress || course.progress || 0;
          const mastery = course.overallMastery || course.mastery || 0;
          const title = course.courseName || course.title || "Untitled Course";

          return (
            <Link href={`/student/courses/${course.id}`} key={course.id} className="block group">
              <div className="bg-[#1C1C1C] border border-[#333] rounded-xl p-6 transition-all hover:border-[#D4AF37]/50 hover:bg-[#252525]">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-[#2A2A2A] rounded-lg flex items-center justify-center text-gray-300">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
                </div>

                <h2 className="text-lg font-semibold text-[#D4AF37] mb-6">{title}</h2>

                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Progress</span>
                      </div>
                      <span className="text-white font-medium">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
                      <div className="h-full bg-[#22C55E]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Mastery */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Mastery</span>
                      </div>
                      <span className="text-[#D4AF37] font-medium">{mastery}%</span>
                    </div>
                    <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
                      <div className="h-full bg-white" style={{ width: `${mastery}%` }} />
                      {/* Note: Design shows white mastery bar? or light gray. Using white for now based on image 1 description request (looks white in small thumbnail) or maybe sticking to gold if consistent. Image 1 shows Mastery as White bar? Let's check image 1 again. 
                       Actually looking at the small thumbnail, mastery bar seems white. I will stick to white. */}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}