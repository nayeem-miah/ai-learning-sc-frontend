"use client";

import Image from "next/image";
import {
    Copy, SquarePen, Award, BookOpen, Target, Flame,
    Zap, Star, Shield, TrendingUp, Clock, CheckCircle,
    ChevronRight, MapPin, Calendar, Mail, User
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import avatar from "/public/assets/avatar.png";
import Link from "next/link";
import { toast } from "sonner";
import { useGetMeQuery } from "@/lib/feature/auth/authApi";

export default function StudentProfile() {
    const { data: user } = useGetMeQuery();
    console.log(user?.data);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [mounted, setMounted] = useState(false);
    const [animatedStats, setAnimatedStats] = useState({ xp: 0, courses: 0, streak: 0, rank: 0 });

    useEffect(() => {
        setMounted(true);
        // Animate stats
        const targets = { xp: 12450, courses: 14, streak: 12, rank: 4 };
        const duration = 1200;
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const p = Math.min(elapsed / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setAnimatedStats({
                xp: Math.round(targets.xp * e),
                courses: Math.round(targets.courses * e),
                streak: Math.round(targets.streak * e),
                rank: Math.round(targets.rank * e),
            });
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, []);

    const handleCopyId = () => {
        navigator.clipboard.writeText("@alexjohnson");
        toast.success("User ID copied to clipboard");
    };

    const badges = [
        { id: 1, name: "Fast Learner", icon: Zap, color: "#D4AF37", date: "Jan 12, 2026" },
        { id: 2, name: "Early Bird", icon: Clock, color: "#3B82F6", date: "Feb 05, 2026" },
        { id: 3, name: "Top Performer", icon: Star, color: "#22C55E", date: "Feb 14, 2026" },
    ];

    const statsConfig = [
        { label: "Total XP", value: animatedStats.xp.toLocaleString(), icon: Zap, color: "#D4AF37" },
        { label: "Rank", value: `#${animatedStats.rank}`, icon: Shield, color: "#8B5CF6" },
        { label: "Mastery", value: "82%", icon: Target, color: "#22C55E" },
        { label: "Attendance", value: "96%", icon: Calendar, color: "#3B82F6" },
    ];

    return (
        <div className={`space-y-6 transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>

            {/* Header / Banner Card */}
            <div className="relative group overflow-hidden bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-8 md:p-10 mb-6">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <User size={160} className="text-primary rotate-12" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Profile</h1>
                        <p className="text-gray-400 text-sm md:text-base font-normal">
                            Manage your learning progress and personal information
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold leading-none border border-primary/20">
                                {user?.data?.studentProfile?.gradeLevel}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Member since {user?.data?.createdAt}</span>
                            </div>
                        </div>
                    </div>
                    <Link href="/student/profile/edit-profile">
                        <button className="bg-white hover:bg-gray-100 text-black font-bold px-6 py-3 rounded-xl transition-all hover:shadow-lg active:scale-[0.98] flex items-center gap-2 group/btn">
                            <SquarePen size={18} />
                            Edit Profile
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Identity Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-8 flex flex-col items-center text-center group">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-primary/0 animate-spin-slow opacity-0 group-hover:opacity-40 transition-opacity" />
                            <div className="absolute -inset-2 rounded-full border-2 border-primary/20 border-dashed animate-spin-slow" />
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-card shadow-2xl transition-transform group-hover:scale-105">
                                <Image
                                    src={avatar}
                                    alt="Alex Johnson"
                                    className="object-cover"
                                    fill
                                    priority
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                >
                                    <span className="text-white text-xs font-bold uppercase tracking-widest">Change</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#22C55E] rounded-full border-4 border-card animate-pulse" />
                            <input type="file" ref={fileInputRef} hidden accept="image/*" />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1">{user?.data?.firstName} {user?.data?.lastName}</h2>
                        <div className="flex items-center gap-2 text-gray-500 mb-6 bg-[#1a1a1a] px-3 py-1 rounded-full border border-gray-800">
                            <span className="text-xs font-mono">@{user?.data?.id}</span>
                            <button onClick={handleCopyId} className="text-primary hover:text-white transition-colors cursor-pointer active:scale-90">
                                <Copy size={13} />
                            </button>
                        </div>

                        <div className="w-full space-y-4 text-left">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-gray-800 transition-colors group/row hover:border-primary/20">
                                <Mail className="w-4 h-4 text-primary" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-none mb-1">Email</p>
                                    <p className="text-sm font-medium text-white group-hover/row:text-primary transition-colors truncate">{user?.data?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Achievements Summary */}
                    <div className="bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-6">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            Achievements
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {badges.map((badge) => {
                                const Icon = badge.icon;
                                return (
                                    <div key={badge.id} className="group flex flex-col items-center gap-2 cursor-help">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]" style={{ backgroundColor: `${badge.color}15` }}>
                                            <Icon size={24} style={{ color: badge.color }} />
                                        </div>
                                        <div className="absolute scale-0 group-hover:scale-100 bg-black/90 border border-gray-800 text-white text-[10px] py-1 px-2 rounded-lg -mt-16 transition-transform whitespace-nowrap z-50">
                                            {badge.name} · {badge.date}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Stats & Learning Activity */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {statsConfig.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label}
                                    className="bg-card border border-gray-800 shadow-primary/5 rounded-xl p-5 hover:border-primary/30 transition-all group relative overflow-hidden"
                                    style={{ opacity: mounted ? 1 : 0, transition: `all 0.4s ${idx * 80 + 200}ms` }}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Icon size={48} style={{ color: stat.color }} />
                                    </div>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${stat.color}10` }}>
                                            <Icon className="w-5 h-5" style={{ color: stat.color }} />
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-white leading-none">{stat.value}</p>
                                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1.5">{stat.label}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Learning Trends */}
                    <div className="bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white">Learning Activity</h3>
                                <p className="text-secondary text-xs">Total streaks and completion details</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-center px-4 py-2 bg-[#22C55E]/5 rounded-lg border border-[#22C55E]/10 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                                    <span className="text-[#22C55E] text-xs font-bold leading-none">12 Day Streak</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { name: "English", progress: 70, mastery: 85, color: "#D4AF37" },
                                { name: "Mathematics", progress: 65, mastery: 82, color: "#3B82F6" },
                                { name: "General Science", progress: 52, mastery: 75, color: "#22C55E" },
                            ].map((subject, idx) => (
                                <div key={subject.name} className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{subject.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-primary">{subject.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden relative">
                                        <div className="absolute inset-0 bg-white/5 z-0" style={{ width: `${subject.mastery}%` }} />
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                                            style={{
                                                width: mounted ? `${subject.progress}%` : "0%",
                                                backgroundColor: subject.color
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] text-gray-600 font-medium">
                                        <span>Current Module: {idx + 1}</span>
                                        <span>Mastery: {subject.mastery}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats Summary Footer */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Award className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-primary">Top 5% Performer!</h4>
                                <p className="text-xs text-secondary mt-1">You are doing better than 95% of Grade 9 students.</p>
                            </div>
                        </div>
                        <Link href="/student/progress">
                            <Button className="bg-primary hover:bg-primary/80 text-black font-bold px-6 h-10 rounded-lg flex items-center gap-2 transition-all">
                                View Full Progress
                                <ChevronRight size={16} />
                            </Button>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}

const Button = ({ children, className, ...props }: any) => (
    <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`} {...props}>
        {children}
    </button>
)