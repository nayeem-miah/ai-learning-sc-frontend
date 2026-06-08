"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useSignInMutation } from "@/lib/feature/auth/authApi";
import { setCredentials } from "@/lib/slice/user/userSlice";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import Logo from "../common/Logo";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    remember: z.boolean()
});

type LoginFormData = z.infer<typeof loginSchema>;

interface ApiError {
    data?: {
        message?: string;
    };
    message?: string;
}

export default function LoginPage() {
    const dispatch = useDispatch();
    const [signIn, { isLoading }] = useSignInMutation();

    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            remember: false
        }
    });

    const onSubmit = async (formData: LoginFormData) => {
        try {
            const response = await signIn({
                email: formData.email,
                password: formData.password
            }).unwrap();

            const result = response?.data?.result;

            if (!result?.accessToken) {
                toast.error("Token missing from server!");
                return;
            }


            if (!result.user || !result.user.role) {
                toast.error("User role is missing from server response!");
                return;
            }

            const userProfile = {
                id: result.user.id,
                email: result.user.email,
                name: `${result.user.firstName} ${result.user.lastName}`,
                role: result.user.role,
            };


            dispatch(
                setCredentials({
                    user: userProfile,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                })
            );

            const userRole = userProfile.role.toLowerCase();
            if (typeof window !== "undefined") {
                localStorage.setItem("user_role", userRole);
                const cookieOptions = {
                    expires: formData.remember ? 7 : 1,
                    path: '/'
                };
                Cookies.set("token", result.accessToken, cookieOptions);
                Cookies.set("user_role", userRole, cookieOptions);
            }

            toast.success("Login successful!");

            let targetPath = "/";
            if (userRole === "admin") {
                targetPath = "/admin/dashboard";
            } else if (userRole === "teacher") {
                targetPath = "/teacher/dashboard";
            } else if (userRole === "student") {
                targetPath = "/student/dashboard";
            }

            window.location.assign(targetPath);

        } catch (err: unknown) {
            const error = err as ApiError;
            const errorMessage = error?.data?.message || error?.message || "Invalid credentials";
            toast.error(errorMessage);
            console.error("Login Error:", error);
        }
    };

    return (
        <main className="relative min-h-screen bg-background flex items-center justify-center p-6">
            <div className="absolute top-6 left-6">
                <Logo />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="bg-card border rounded-2xl p-6 sm:p-7 md:p-8 shadow-[0_4px_4px_0] shadow-primary/20">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-strong mb-2">
                        Welcome Back
                    </h2>

                    <p className="text-stroke-weak text-sm mb-6 sm:mb-7 md:mb-8">
                        Secure access for administrators only.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 md:space-y-6">
                        <div>
                            <label className="block text-text-strong text-sm font-medium mb-2.5">
                                Email
                            </label>
                            <Input
                                {...register("email")}
                                type="email"
                                placeholder="you@example.com"
                                className={`bg-background text-text-strong placeholder:text-stroke-weak rounded-[10px] h-12 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-text-strong text-sm font-medium mb-2.5">
                                Password
                            </label>
                            <Input
                                {...register("password")}
                                type="password"
                                placeholder="••••••••"
                                className={`bg-background text-text-strong placeholder:text-stroke-weak rounded-[10px] h-12 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Controller
                                    name="remember"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            id="remember"
                                            className="border-secondary"
                                        />
                                    )}
                                />
                                <label htmlFor="remember" className="text-sm text-secondary cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <Link href="/forgot-password" title="Go to forgot password page" className="text-primary text-sm font-medium underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || isSubmitting}
                            className="w-full bg-primary hover:bg-primary/90 text-muted font-semibold rounded-2xl h-12 text-base cursor-pointer overflow-hidden group"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={20} />
                                    Signing in...
                                </span>
                            ) : "Log In"}
                            <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <ArrowRight size={28} strokeWidth={2.5} className="ml-2" />
                            </motion.span>
                        </Button>
                    </form>

                    <p className="text-center text-muted-foreground text-sm mt-6">
                        Don&#39;t have an account?{" "}
                        <Link href="/signup" className="text-primary font-medium underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </main>
    );
}