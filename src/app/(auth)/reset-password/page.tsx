"use client";

import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { motion } from "motion/react";
import { useResetPasswordMutation } from "@/lib/feature/auth/authApi";

const newPasswordSchema = z.object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
});

type NewPasswordValues = z.infer<typeof newPasswordSchema>

export default function NewPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [resetPassword, { isLoading }] = useResetPasswordMutation()


    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<NewPasswordValues>({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmNewPassword: "",
        }
    });



    const onSubmit = async (formData: NewPasswordValues) => {

        if (!token) {
            toast.error("Invalid reset link.")
            return
        }


        try {
            console.log("New Password Data: ", formData)
            // api call
            const response = await resetPassword({ password: formData.newPassword, token: token }).unwrap()

            if (response.success) {
                toast.success(response.message)
                router.push("/login")
            } else {
                toast.error(response.message)
            }
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.log(error)
            toast.error(error?.data?.message || "Something went wrong.");
        }
    }


    if (!token) {
        return <div className="flex h-screen items-center justify-center">Invalid reset link.</div>;
    }

    return (
        <main className="min-h-screen bg-background flex flex-col p-6">
            {/* logo */}
            <Logo />

            <div className="flex justify-center items-center px-6.5 flex-1">
                {/* Reset Password Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md -translate-y-16">
                    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 md:p-8 shadow-[0_4px_4px_0] shadow-primary/20">

                        {/* Back Button */}
                        <button onClick={() => router.back()} className="text-foreground hover:text-primary/80 mb-5 flex items-center gap-2 cursor-pointer">
                            <ArrowLeft size={20} />
                        </button>

                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-strong mb-3">
                            Enter new password
                        </h2>

                        <p className="text-stroke-weak text-sm mb-6 sm:mb-7 md:mb-8">
                            Please create a new password to continue.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 md:space-y-6">
                            <div>
                                <label className="block text-text-strong text-sm font-medium mb-2.5">
                                    Enter New Password
                                </label>
                                <Input
                                    {...register("newPassword")}
                                    type="password"
                                    placeholder="••••••••"
                                    className={`bg-background text-text-strong placeholder:text-stroke-weak rounded-[10px] h-12 ${errors.newPassword
                                        ? "border-red-500 focus-visible:ring-red-500" : ""
                                        }`}
                                />
                                {errors.newPassword && (
                                    <p className="text-red-500 text-xs mt-1.5 ml-1">
                                        {errors.newPassword.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-text-strong text-sm font-medium mb-2.5">
                                    Confirm New Password
                                </label>
                                <Input
                                    {...register("confirmNewPassword")}
                                    type="password"
                                    placeholder="••••••••"
                                    className={`bg-background text-text-strong placeholder:text-stroke-weak rounded-[10px] h-12 ${errors.confirmNewPassword
                                        ? "border-red-500 focus-visible:ring-red-500" : ""
                                        }`}
                                />
                                {errors.confirmNewPassword && (
                                    <p className="text-red-500 text-xs mt-1.5 ml-1">
                                        {errors.confirmNewPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || isSubmitting}
                                className="w-full bg-primary hover:bg-primary/90 text-muted font-semibold rounded-2xl h-12 text-base mt-5 cursor-pointer"
                            >
                                {isLoading ? "Updating..." : "Reset Password"}
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <ArrowRight size={28} strokeWidth={2.5} className="ml-2" />
                                </motion.span>
                            </Button>
                        </form>

                        <p className="text-center text-muted-foreground text-sm mt-6">
                            Remember your password?{" "}
                            <Link href="/login" className="text-primary font-medium underline">
                                Log in
                            </Link>
                        </p>

                    </div>
                </motion.div>
            </div>
        </main>
    );
}
