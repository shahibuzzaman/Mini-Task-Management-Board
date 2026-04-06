"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/features/auth/lib/auth-form-schema";
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
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/update-password")}`,
    });

    if (error) {
      showToast("error", error.message);
      return;
    }

    showToast("success", "Password reset link sent.");
    router.replace(`/verify-email?email=${encodeURIComponent(values.email)}&next=/signin`);
  }

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <section className="w-full bg-surface-container-lowest rounded-3xl p-10 flex flex-col shadow-[var(--shadow-atmospheric)] relative z-10 border border-outline-variant/10">
        <div className="flex items-center justify-center gap-3 mb-8 mx-auto">
          <div className="w-10 h-10 bg-[#3525cd] rounded-[10px] flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <span className="text-[22px] font-bold tracking-tight text-on-surface">TaskTrack</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-on-surface mb-2" suppressHydrationWarning>
            Reset Password
          </h1>
          <p className="text-[15px] text-on-surface-variant">
            Enter your email to receive a reset link.
          </p>
        </div>

        <form className="space-y-5" onSubmit={forgotForm.handleSubmit(handleForgot)}>
          <div className="space-y-4">
            <AuthField label="EMAIL ADDRESS" error={forgotForm.formState.errors.email?.message}>
              <input
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                className="mt-1.5 w-full rounded-xl bg-surface-container-low px-4 py-[14px] text-[15px] text-on-surface placeholder:text-on-surface-variant/50 outline-none transition border border-transparent focus:bg-surface-container-lowest focus:border-primary focus:shadow-sm placeholder:font-medium"
                {...forgotForm.register("email")}
              />
            </AuthField>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="mt-4 w-full rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] py-[14px] text-[15px] font-bold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 group"
          >
            {isPending ? "Sending link..." : "Send Reset Link"}
            {!isPending && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            )}
          </button>
          
          <div className="mt-6 pt-5 border-t border-outline-variant/20 w-full flex flex-col items-center gap-3">
            <Link href="/signin" className="text-[13px] font-bold text-[#3525cd] hover:text-[#4f46e5] flex items-center gap-1 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to sign in
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
