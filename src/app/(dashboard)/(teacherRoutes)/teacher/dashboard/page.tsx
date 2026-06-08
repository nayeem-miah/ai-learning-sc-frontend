"use client"
import TeacherStats from './_components/TeacherStats';
import TeacherClass from './_components/TeacherClass';

import { useGetTeacherDashboardSummaryQuery } from '@/lib/feature/courses/coursesApi';
import { useGetMeQuery } from '@/lib/feature/auth/authApi';
import { Loader, AlertCircle } from 'lucide-react';

const TeacherDashboardPage = () => {
  const { data, isLoading, error } = useGetTeacherDashboardSummaryQuery();
  const { data: userData } = useGetMeQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <Loader className="w-12 h-12 text-[#C08F42] animate-spin" />
        <p className="text-zinc-400 animate-pulse">Loading dashboard summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Error Loading Dashboard</h2>
        <p className="text-zinc-400 max-w-md">
          {(error as any)?.data?.message || "We couldn't retrieve the dashboard summary. Please try again later."}
        </p>
      </div>
    );
  }

  const summary = data?.data;

  return (
    <div className="p-8 md:p-12 text-white">
      <div className="">
        
        {/* Welcome Text */}
        <div className="mb-14">
            <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
            Welcome back,  <span className="text-[#C08F42]">{userData?.data?.firstName + " " + userData?.data?.lastName}!</span>
            </h1>
        </div>

        {/* Stats Grid */}
        <TeacherStats summary={summary} />

        {/* Next Class Section */}
        <TeacherClass 
          nextClasses={summary?.nextClasses} 
          nextClass={summary?.nextClass} 
        />

      </div>
    </div>
  );
}

export default TeacherDashboardPage;
