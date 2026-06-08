"use client";
import { ChevronRight, Copy, User, Mail, Shield, Camera, Lock, UserCheck, AlertCircle, Save } from "lucide-react";
import Image from "next/image";
import { useRef, useState, ChangeEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import avatarDefault from "/public/assets/avatar.png";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    email: z.string().email("Invalid email address"),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function StudentEditProfile() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState<ProfileFormValues | null>(null);

    useEffect(() => { const timer = setTimeout(() => setMounted(true), 10); return () => clearTimeout(timer); }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "Alex",
            lastName: "Johnson",
            email: "alexjohnson@gmail.com",
        }
    });

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            toast.info("New photo selected! Don't forget to save.", {
                style: { backgroundColor: '#1a1a1a', border: '1px solid #D4AF37', color: '#D4AF37' }
            });
        }
    };

    const onSubmit = (formData: ProfileFormValues) => {
        setPendingData(formData);
        setShowConfirmModal(true);
    };

    const confirmUpdate = () => {
        if (!pendingData) return;
        setIsLoading(true);
        setShowConfirmModal(false);
        
        // Simulate API call
        setTimeout(() => {
            const finalData = { ...pendingData, profilePhoto: imageFile };
            console.log("Submit Data:", finalData);
            setIsLoading(false);
            toast.success("Profile updated successfully!", {
                icon: <UserCheck className="w-5 h-5 text-green-500" />,
                style: { backgroundColor: '#1a1a1a', border: '1px solid #22C55E' }
            });
            setPendingData(null);
        }, 1500);
    };

    const handleCopyId = (userId: string): void => {
        navigator.clipboard.writeText(userId);
        toast.success("User ID copied to clipboard");
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

                {/* Header / Intro Card */}
                <div className="relative overflow-hidden bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-8 md:p-10">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150 rotate-12">
                        <Shield size={160} className="text-primary" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <UserCheck className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold text-white">Security & Profile</h1>
                        </div>
                        <p className="text-gray-400 text-sm md:text-base font-normal max-w-2xl">
                            Updating your profile helps us personalize your learning path. Keep your account secure by using a strong password.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Avatar and Quick Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-8 flex flex-col items-center">
                            <div className="relative group mb-6">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-card shadow-2xl transition-all group-hover:scale-105 group-hover:shadow-primary/20">
                                    <Image
                                        src={selectedImage || avatarDefault}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer"
                                    >
                                        <Camera className="w-8 h-8 text-white mb-1" />
                                        <span className="text-white text-[10px] font-bold uppercase tracking-widest text-center">Change<br/>Photo</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-full border-4 border-card shadow-xl group-hover:scale-110 transition-transform cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <Camera className="w-4 h-4 text-black" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-white">Alex Johnson</h3>
                                <p className="text-primary text-xs font-medium uppercase tracking-[0.2em] mt-1">Grade 9 Student</p>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <AlertCircle size={80} className="text-primary" />
                            </div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3">
                                <AlertCircle className="w-4 h-4" />
                                Security Tip
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Use a unique password you don&apos;t use anywhere else. Enable 2FA in settings for extra safety.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Fields */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Basic Info */}
                        <div className="bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-8">
                            <div className="flex items-center gap-2 mb-8 border-b border-gray-800/50 pb-4">
                                <User className="w-5 h-5 text-gray-400" />
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest text-sm">Personal Information</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">First Name</label>
                                    <div className="group relative">
                                        <Input
                                            {...register("firstName")}
                                            className="w-full h-12 rounded-xl px-4 border-gray-800 bg-[#151515] focus:bg-[#1a1a1a] focus:border-primary/50 transition-all text-white placeholder:text-gray-700 shadow-inner"
                                        />
                                        {errors.firstName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.firstName.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Last Name</label>
                                    <Input
                                        {...register("lastName")}
                                        className="w-full h-12 rounded-xl px-4 border-gray-800 bg-[#151515] focus:bg-[#1a1a1a] focus:border-primary/50 transition-all text-white shadow-inner"
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.lastName.message}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                        <Input
                                            {...register("email")}
                                            className="w-full h-12 rounded-xl pl-11 pr-4 border-gray-800 bg-[#151515] focus:bg-[#1a1a1a] focus:border-primary/50 transition-all text-white shadow-inner"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email.message}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Learning ID <span className="text-gray-700">(Managed)</span></label>
                                    <div className="relative">
                                        <Input
                                            defaultValue="@alexjohnson"
                                            disabled
                                            className="w-full h-12 rounded-xl px-4 border-gray-800 bg-[#1a1a1a]/50 text-gray-600 shadow-inner cursor-not-allowed border-dashed"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleCopyId("@alexjohnson")}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-primary transition-colors active:scale-90"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="bg-card border rounded-xl shadow-[0_4px_4px_0] shadow-primary/20 p-8">
                            <div className="flex items-center gap-2 mb-8 border-b border-gray-800/50 pb-4">
                                <Lock className="w-5 h-5 text-gray-400" />
                                <h2 className="text-lg font-bold text-white uppercase tracking-widest text-sm">Security & Password</h2>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Current Password</label>
                                    <Input
                                        type="password"
                                        placeholder="Confirm existing password"
                                        {...register("currentPassword")}
                                        className="w-full h-12 rounded-xl px-4 border-gray-800 bg-[#151515] focus:bg-[#1a1a1a] focus:border-primary/50 transition-all text-white shadow-inner"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">New Password</label>
                                        <Input
                                            type="password"
                                            placeholder="Min. 8 characters"
                                            {...register("newPassword")}
                                            className="w-full h-12 rounded-xl px-4 border-gray-800 bg-[#151515] focus:bg-[#1a1a1a] focus:border-primary/50 transition-all text-white shadow-inner"
                                        />
                                        {errors.newPassword && <p className="text-red-500 text-xs mt-1.5">{errors.newPassword.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Verify Password</label>
                                        <Input
                                            type="password"
                                            placeholder="Repeat new password"
                                            {...register("confirmPassword")}
                                            className="w-full h-12 rounded-xl px-4 border-gray-800 bg-[#151515] focus:bg-[#1a1a1a] focus:border-primary/50 transition-all text-white shadow-inner"
                                        />
                                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
                            <button 
                                type="button"
                                onClick={() => router.back()}
                                className="w-full sm:w-auto px-8 py-3 border border-gray-800 text-gray-500 rounded-xl font-bold hover:bg-white/5 hover:text-white transition-all order-2 sm:order-1"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className={`w-full sm:w-auto bg-primary hover:bg-primary/90 text-black font-black px-10 py-3 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-[0_8px_30px_rgba(212,175,55,0.1)] group order-1 sm:order-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Update Profile
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <ConfirmModal 
                open={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmUpdate}
                title="Update Profile?"
                description="Are you sure you want to save these changes to your profile? This will update your personal information and security settings."
                variant="edit"
                confirmText="Yes, Update"
                loading={isLoading}
            />
        </>
    );
}

