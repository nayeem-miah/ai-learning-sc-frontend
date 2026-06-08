'use client';
import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { motion } from "motion/react";
import { useSignUpMutation, useAcceptInviteMutation } from "@/lib/feature/auth/authApi";
import { useGetClassesQuery } from "@/lib/feature/courses/coursesApi";
import { UserRegistrationBase } from "@/types/auth";
import { Suspense } from "react";

const signupSchema = z.object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    email: z.string().email("Invalid email address"),
    grade: z.string().optional(),
    subject: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignupSchema = z.infer<typeof signupSchema>;

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const invite = (searchParams.get("invite") ?? "").replace(/\/+$/, "");
    const role = searchParams.get("role") ?? "";
    const isTeacher = role.toUpperCase().includes("TEACHER") || invite.toUpperCase().includes("TEACHER");

    const { data: classesRes, isLoading: isClassesLoading } = useGetClassesQuery();
    const classes = classesRes?.data || [];

    const [signUp, { isLoading: isSigningUp }] = useSignUpMutation();
    const [acceptInvite, { isLoading: isAcceptingInvite }] = useAcceptInviteMutation();
    const isLoading = isSigningUp || isAcceptingInvite;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupSchema>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            grade: "",
            subject: "",
            email: "",
            password: "",
            confirmPassword: "",
        }
    });

    const onSubmit = async (formData: SignupSchema) => {
        try {
            if (isTeacher) {
                const payload = {
                    token: invite,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    subjectsType: formData.subject ? [formData.subject] : [],
                };
                const response = await acceptInvite(payload).unwrap();
                toast.success(response.message || "Invite accepted successfully!");
            } else {
                const payload: UserRegistrationBase = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    gradeLevel: formData.grade,
                };
                const response = await signUp(payload).unwrap();
                toast.success(response.message || "Account created successfully!");
            }
            router.push("/login");
        } catch (error: any) {
            const errorMessage = error?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="bg-card border rounded-2xl p-6 sm:p-7 md:p-8 shadow-[0_4px_4px_0] shadow-primary/20">
            <button onClick={() => router.back()} className="text-foreground hover:text-primary/80 mb-5 flex items-center gap-2 cursor-pointer">
                <ArrowLeft size={20} />
            </button>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-strong mb-2">
                Set up Your Account
            </h2>

            <p className="text-stroke-weak text-sm mb-6 sm:mb-7 md:mb-8">
                Get started by creating your account in just simple steps.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">

                {/* First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-text-strong text-sm font-medium mb-2.5">First Name</label>
                        <Input
                            {...register("firstName")}
                            placeholder="Scott"
                            className={`bg-background text-text-strong placeholder:text-stroke-weak rounded-[10px] h-12 ${errors.firstName ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-primary"}`}
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label className="block text-text-strong text-sm font-medium mb-2.5">Last Name</label>
                        <Input
                            {...register("lastName")}
                            placeholder="Friedman"
                            className={`bg-background text-text-strong placeholder:text-stroke-weak rounded-[10px] h-12 ${errors.lastName ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-primary"}`}
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.lastName.message}</p>}
                    </div>
                </div>

                {/* Subject — only for teachers */}
                {isTeacher && (
                    <div>
                        <label className="block text-text-strong text-sm font-medium mb-2.5">Subject</label>
                        <Input
                            {...register("subject")}
                            placeholder="e.g. Mathematics"
                            className={`bg-background text-text-strong placeholder:text-stroke-weak rounded-[10px] h-12 ${errors.subject ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-primary"}`}
                        />
                        {errors.subject && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.subject.message}</p>}
                    </div>
                )}

                {/* Email */}
                <div>
                    <label className="block text-text-strong text-sm font-medium mb-2.5">Email</label>
                    <Input
                        type="email"
                        {...register("email")}
                        placeholder="example@mail.com"
                        className={`bg-background text-text-strong placeholder:text-stroke-weak rounded-[10px] h-12 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-primary"}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.email.message}</p>}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-text-strong text-sm font-medium mb-2.5">Password</label>
                        <Input
                            {...register("password")}
                            type="password"
                            placeholder="••••••••"
                            className={`bg-background text-text-strong placeholder:text-stroke-weak rounded-[10px] h-12 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-primary"}`}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label className="block text-text-strong text-sm font-medium mb-2.5">Confirm Password</label>
                        <Input
                            {...register("confirmPassword")}
                            type="password"
                            placeholder="••••••••"
                            className={`bg-background text-text-strong placeholder:text-stroke-weak rounded-[10px] h-12 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-primary"}`}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.confirmPassword.message}</p>}
                    </div>
                </div>

                {/* Grade — only for students */}
                {!isTeacher && (
                    <div>
                        <label className="block text-text-strong text-sm font-medium mb-2.5">Select Grade</label>
                        <div className="relative">
                            <select
                                {...register("grade")}
                                disabled={isClassesLoading}
                                className={`w-full bg-background text-text-strong rounded-[10px] h-12 px-3 pr-10 focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-all border ${errors.grade
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-primary/50 focus:border-primary focus:ring-primary/20"
                                    }`}
                            >
                                <option value="">
                                    {isClassesLoading ? "Loading grades..." : "Select your grade"}
                                </option>
                                {classes.map((cls: any) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.gradeLevel}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        {errors.grade && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.grade.message}</p>}
                    </div>
                )}

                {/* Submit */}
                <Button
                    disabled={isLoading}
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-muted font-semibold rounded-2xl h-12 text-base mt-5 cursor-pointer"
                >
                    {isLoading ? (
                        <>
                            <Loader className="mr-2 h-5 w-5 animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        <>
                            Create Account
                            <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <ArrowRight size={28} strokeWidth={2.5} className="ml-2" />
                            </motion.span>
                        </>
                    )}
                </Button>
            </form>

            <p className="text-muted-foreground text-sm mt-6 text-center">
                Already you have an account?{" "}
                <Link href="/login" className="text-primary font-medium underline">Log In</Link>
            </p>
        </div>
    );
}

export default function SignupPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col p-6">
            <Logo />
            <div className="flex flex-1 items-center justify-center px-6.5 pb-7">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-lg translate-y-0 md:-translate-y-12"
                >
                    <Suspense fallback={
                        <div className="bg-card border rounded-2xl p-8 flex items-center justify-center">
                            <Loader className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    }>
                        <SignupForm />
                    </Suspense>
                </motion.div>
            </div>
        </main>
    );
}