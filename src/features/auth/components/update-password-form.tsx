"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  updatePasswordSchema,
  type UpdatePasswordSchema,
} from "@/features/auth/lib/auth-form-schema";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/store/use-toast";
import { AuthField, PasswordInput } from "./auth-fields";

export function UpdatePasswordForm() {
  const router = useRouter();
  const showToast = useToast();
  const supabase = getSupabaseBrowserClient();
  
  const updateForm = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "" },
  });

  const isPending = updateForm.formState.isSubmitting;

  async function handleUpdate(values: UpdatePasswordSchema) {
    if (!supabase) {
      showToast("error", "Supabase is not configured.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      showToast("error", error.message);
      return;
    }

    showToast("success", "Password updated successfully.");
    router.replace("/dashboard");
    router.refresh();
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
            Set new password
          </h1>
          <p className="text-[14px] text-slate-500">
            Enter your new secure password.
          </p>
        </div>

        <form className="mt-2 space-y-6" onSubmit={updateForm.handleSubmit(handleUpdate)}>
          <div className="space-y-5">
            <AuthField label="New Password" error={updateForm.formState.errors.password?.message}>
              <div className="relative">
                <PasswordInput
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3.5 text-[14px] font-medium text-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] outline-none transition placeholder:tracking-[0.2em] placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
                  {...updateForm.register("password")}
                />
                <p className="mt-2 text-[11px] font-medium italic text-slate-500">Must be at least 8 characters with 1 symbol.</p>
              </div>
            </AuthField>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Updating password..." : "Update Password"}
            {!isPending && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
