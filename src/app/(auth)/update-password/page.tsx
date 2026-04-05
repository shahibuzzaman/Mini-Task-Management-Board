import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";

export default async function UpdatePasswordPage() {
  const supabase = await createSupabaseServerClient();
  
  if (!supabase) {
    redirect("/signin");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Cannot update password if not securely authenticated by the reset token callback
    redirect("/signin");
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-center">
      <UpdatePasswordForm />
    </div>
  );
}
