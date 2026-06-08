"use client";

import Image from "next/image";
import { 
    Copy, SquarePen, BookOpen, Users, Award, Calendar, 
    Clock, Mail, MapPin, CheckCircle, Shield, Star, 
    Target, Zap, GraduationCap, ChevronRight, UserCheck
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import avatar from "/public/assets/avatar.png";
import Link from "next/link";
import { toast } from "sonner";

export default function TeacherProfile() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [mounted, setMounted] = useState(false);
    const [animatedStats, setAnimatedStats] = useState({ courses: 0, students: 0, mastery: 0, exp: 0 });

    useEffect(() => {
        setMounted(true);
        const targets = { courses: 3, students: 81, mastery: 82, exp: 5 };
        const duration = 1200;
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const p = Math.min(elapsed / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setAnimatedStats({
                courses: Math.round(targets.courses * e),
                students: Math.round(targets.students * e),
                mastery: Math.round(targets.mastery * e),
                exp: Math.round(targets.exp * e),
            });
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText("@alexjohnson");
        toast.success("Teacher ID copied to clipboard");
    };

    const badges = [
        { id: 1, name: "Master Educator", icon: GraduationCap, color: "#D4AF37", date: "Awarded 2025" },
        { id: 2, name: "Student Favorite", icon: Star, color: "#3B82F6", date: "Awarded 2024" },
        { id: 3, name: "Content Pioneer", icon: Zap, color: "#22C55E", date: "Awarded 2024" },
    ];

    const statsConfig = [
        { label: "Active Courses", value: animatedStats.courses, icon: BookOpen, color: "#D4AF37" },
        { label: "Total Students", value: animatedStats.students, icon: Users, color: "#3B82F6" },
        { label: "Avg. Mastery", value: `${animatedStats.mastery}%`, icon: Award, color: "#22C55E" },
        { label: "Years Exp.", value: animatedStats.exp, icon: Calendar, color: "#A855F7" },
    ];

    const details = [
        { label: "Department", value: "Mathematics & Science", icon: Shield },
        { label: "Expertise", value: "Advanced Algebra, Physics", icon: Target },
        { label: "Grade Levels", value: "8, 9, 10, 11", icon: Users },
        { label: "Teaching Hours", value: "1,240+ Total", icon: Clock },
    ];

    return (
        <div className={`space-y-6 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            
            {/* Header / Banner Card */}
            <div className="relative group overflow-hidden bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-8 md:p-10">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <GraduationCap size={160} className="text-primary rotate-12" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary to-primary/0 animate-spin-slow opacity-30" />
                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-card shadow-2xl">
                                <Image
                                    src={avatar}
                                    alt="Alex Johnson"
                                    className="object-cover"
                                    fill
                                    priority
                                />
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                >
                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change</span>
                                </div>
                            </div>
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#22C55E] rounded-full border-4 border-card animate-pulse shadow-lg" />
                            <input type="file" ref={fileInputRef} hidden accept="image/*" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-white leading-none">Alex Johnson</h1>
                                <div className="bg-[#22C55E]/10 text-[#22C55E] p-1 rounded-full border border-[#22C55E]/20">
                                    <UserCheck size={14} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 mb-4 bg-[#1a1a1a] w-fit px-3 py-1 rounded-full border border-gray-800">
                                <span className="text-xs font-mono">@alexjohnson</span>
                                <button onClick={handleCopy} className="text-primary hover:text-white transition-colors cursor-pointer active:scale-90">
                                    <Copy size={13} />
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-primary" />
                                    <span>alex.johnson@school.edu</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-primary" />
                                    <span>New York, USA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link href="/teacher/profile/edit-profile">
                        <button className="bg-white hover:bg-gray-100 text-black font-bold px-6 py-3 rounded-xl transition-all hover:shadow-lg active:scale-[0.98] flex items-center gap-2 group/btn">
                            <SquarePen size={18} />
                            Edit Profile
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Professional Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-8">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                            <Shield className="w-4 h-4 text-primary" />
                            Identity & Role
                        </h3>
                        <div className="space-y-4">
                            {details.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="p-4 bg-white/5 rounded-xl border border-gray-800 transition-all hover:border-primary/20 group">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-none mb-2">{item.label}</p>
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                                            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{item.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recognition / Badges */}
                    <div className="bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-8">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            Recognition
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {badges.map((badge) => {
                                const Icon = badge.icon;
                                return (
                                    <div key={badge.id} className="group relative cursor-help">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] bg-white/5 border border-gray-800 group-hover:border-primary/20">
                                            <Icon size={28} style={{ color: badge.color }} />
                                        </div>
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 scale-0 group-hover:scale-100 bg-black/90 border border-gray-800 text-white text-[10px] py-1.5 px-3 rounded-lg transition-all whitespace-nowrap z-50 shadow-2xl">
                                            <p className="font-bold">{badge.name}</p>
                                            <p className="opacity-50 text-[8px]">{badge.date}</p>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Stats & Experience */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {statsConfig.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} 
                                    className="bg-card border border-gray-800 shadow-primary/5 rounded-2xl p-6 hover:border-primary/30 transition-all group relative overflow-hidden"
                                    style={{ opacity: mounted ? 1 : 0, transition: `all 0.4s ${idx * 80 + 300}ms` }}
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity scale-150 rotate-12">
                                        <Icon size={64} style={{ color: stat.color }} />
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${stat.color}15` }}>
                                            <Icon className="w-6 h-6" style={{ color: stat.color }} />
                                        </div>
                                        <div>
                                            <p className="text-2xl md:text-3xl font-black text-white leading-none">{stat.value}</p>
                                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">{stat.label}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* About / Philosophy */}
                    <div className="bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-8 relative overflow-hidden group">
                        <div className="absolute -right-12 -bottom-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12">
                            <Shield size={200} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-6 border-b border-gray-800 pb-4">Teaching Philosophy</h3>
                        <p className="text-gray-400 leading-relaxed text-sm md:text-base italic">
                            &quot;I believe that mathematics is the language of the universe. My mission is to simplify complex concepts and inspire curiosity in every student. Through personalized learning and active engagement, we don&apos;t just solve equations; we build critical thinking skills for a lifetime.&quot;
                        </p>
                        <div className="mt-8 flex flex-wrap gap-2 text-[10px] font-bold">
                            <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">#ActiveLearning</span>
                            <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">#CriticalThinking</span>
                            <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">#StudentSuccess</span>
                        </div>
                    </div>

                    {/* Performance Insight Card */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:bg-primary/10 transition-colors">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-4 border-card shadow-xl group-hover:scale-110 transition-transform">
                                <Award className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-primary">Top 10% Educator</h4>
                                <p className="text-xs text-secondary mt-1 max-w-xs">Your student mastery improvement rate is 15% higher than the district average this semester.</p>
                            </div>
                        </div>
                        <Link href="/teacher/dashboard">
                            <button className="bg-primary hover:bg-primary/80 text-black font-black px-8 h-12 rounded-xl flex items-center gap-2 transition-all transform active:scale-95 shadow-2xl">
                                Detailed Stats
                                <ChevronRight size={18} />
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}