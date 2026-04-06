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
    <div className="w-full max-w-[420px] mx-auto">
      <section className="w-full bg-surface-container-lowest rounded-3xl p-10 flex flex-col shadow-[var(--shadow-atmospheric)] relative z-10 border border-outline-variant/10">
        <div className="flex items-center justify-center gap-3 mb-8 mx-auto">
          <div className="w-10 h-10 bg-[#3525cd] rounded-[10px] flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <span className="text-[22px] font-bold tracking-tight text-on-surface">TaskFlow</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-on-surface mb-2" suppressHydrationWarning>
            Set new password
          </h1>
          <p className="text-[15px] text-on-surface-variant">
            Enter your new secure password.
          </p>
        </div>

        <form className="space-y-5" onSubmit={updateForm.handleSubmit(handleUpdate)}>
          <div className="space-y-4">
            <AuthField label="NEW PASSWORD" error={updateForm.formState.errors.password?.message}>
              <div className="relative">
                <PasswordInput
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="mt-1.5 w-full rounded-xl bg-surface-container-low px-4 py-[14px] text-[15px] text-on-surface placeholder:text-on-surface-variant/40 outline-none transition border border-transparent focus:bg-surface-container-lowest focus:border-primary focus:shadow-sm placeholder:tracking-[0.2em]"
                  {...updateForm.register("password")}
                />
                <p className="mt-2.5 text-[11px] text-on-surface-variant italic font-medium">Must be at least 8 characters with 1 symbol.</p>
              </div>
            </AuthField>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-4 w-full rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] py-[14px] text-[15px] font-bold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 group"
          >
            {isPending ? "Updating password..." : "Update Password"}
            {!isPending && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
