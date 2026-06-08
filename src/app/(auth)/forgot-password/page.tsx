"use client";

import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { motion, } from "motion/react";
import { formVariants } from "@/lib/motion";
import { useForgetPasswordMutation } from "@/lib/feature/auth/authApi";


const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
})


type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>


export default function ForgotPasswordPage() {
    const router = useRouter()
    const [forgetPassword, { isLoading }] = useForgetPasswordMutation()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });


    const onSubmit = async (formData: ForgotPasswordValues) => {
        try {
            console.log("Forgot Password Data: ", formData)
            // api call

            const response = await forgetPassword({ email: formData.email }).unwrap()
            if (response.success) {
                toast.success(response.message)
            } else {
                toast.error(response.message)
            }
        } catch (error) {
            console.log(error)
            toast.error("Something went wrong. Please try again.");
        }
    }


    return (
        <main className="min-h-screen bg-background flex flex-col p-6">
            {/* logo */}
            <Logo />

            <div className="flex flex-1 items-center justify-center px-6.5">
                {/* Forgot Password Card */}
                <motion.div
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md -translate-y-16">
                    <div className="bg-card border rounded-2xl p-6 sm:p-7 md:p-8 shadow-[0_4px_4px_0] shadow-primary/20">

                        {/* Back Button */}
                        <button onClick={() => router.back()} className="text-foreground hover:text-primary/80 mb-5 flex items-center gap-2 cursor-pointer">
                            <ArrowLeft size={20} />
                        </button>

                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-strong mb-3">
                            Forgot your password?
                        </h2>

                        <p className="text-stroke-weak text-sm mb-6 sm:mb-7 md:mb-8">
                            Enter your email address, and we&#39;ll send you a one-time password (OTP) to reset your password.
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
                                    <p className="text-red-500 text-xs mt-1.5 ml-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-primary hover:bg-primary/90 text-muted font-semibold rounded-2xl h-12 text-base cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed disabled" : ""}`}
                            >
                                {isLoading ? "Sending Link..." : "Send Link"}

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
