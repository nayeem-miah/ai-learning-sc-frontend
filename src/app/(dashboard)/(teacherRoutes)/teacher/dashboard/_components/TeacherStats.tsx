"use client";
import { BookOpen, Users } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  Icon: any;
}

const StatCard = ({ title, value, Icon }: StatCardProps) => {
  return (
    <div className="flex-1 bg-[#121212] border border-white/10 rounded-lg p-6 flex items-center justify-between">
      <div>
        <h3 className="text-sm text-zinc-400">{title}</h3>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
      </div>

      <div className="p-3 bg-white/5 rounded-lg">
        <Icon size={24} className="text-zinc-300" />
      </div>
    </div>
  );
};

export default function TeacherStats({ summary }: { summary?: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <StatCard title="Total Courses" value={summary?.totalCourses?.toString() || "0"} Icon={BookOpen} />
      <StatCard title="Total Students" value={summary?.totalStudents?.toString() || "0"} Icon={Users} />
    </div>
  );
}