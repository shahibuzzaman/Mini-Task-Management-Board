import { redirect } from "next/navigation";
import { getAuthRedirectPath } from "@/features/auth/lib/get-auth-redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default async function ForgotPasswordPage() {
  const supabase = await createSupabaseServerClient();
  
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If already logged in, no need to rest password this way
    if (user) {
      redirect("/board");
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-center">
      <ForgotPasswordForm />
    </div>
  );
}
