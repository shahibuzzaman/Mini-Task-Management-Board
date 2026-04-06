"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/features/auth/lib/auth-form-schema";
import { getAuthCallbackUrl } from "@/features/auth/lib/auth-redirect-url";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/store/use-toast";
import { AuthField } from "./auth-fields";

export function ForgotPasswordForm() {
  const router = useRouter();
  const showToast = useToast();
  const supabase = getSupabaseBrowserClient();
  
  const forgotForm = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const isPending = forgotForm.formState.isSubmitting;

  async function handleForgot(values: ForgotPasswordSchema) {
    if (!supabase) {
      showToast("error", "Supabase is not configured.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: getAuthCallbackUrl("/update-password"),
    });

    if (error) {
      showToast("error", error.message);
      return;
    }

    showToast("success", "Password reset link sent.");
    router.replace(`/verify-email?email=${encodeURIComponent(values.email)}&next=/signin`);
  }

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <section className="relative z-10 flex w-full flex-col rounded-[2rem] border border-slate-100 bg-white p-8 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="mx-auto mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-sm ring-1 ring-primary/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <span className="text-[24px] font-bold tracking-tight text-slate-900">TaskTrack</span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-[26px] font-bold tracking-tight text-slate-900" suppressHydrationWarning>
            Reset Password
          </h1>
          <p className="text-[14px] text-slate-500">
            Enter your email to receive a reset link.
          </p>
        </div>

        <form className="mt-2 space-y-6" onSubmit={forgotForm.handleSubmit(handleForgot)}>
          <div className="space-y-5">
            <AuthField label="Email Address" error={forgotForm.formState.errors.email?.message}>
              <input
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3.5 text-[14px] font-medium text-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
                {...forgotForm.register("email")}
              />
            </AuthField>
          </div>
          
          <button
            type="submit"
            disabled={isPending}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Sending link..." : "Send Reset Link"}
            {!isPending && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            )}
          </button>
          
          <div className="mt-8 flex w-full flex-col items-center gap-3 border-t border-slate-100 pt-6">
            <Link href="/signin" className="flex items-center gap-1.5 text-[14px] font-bold text-primary transition hover:text-primary/80">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to sign in
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
