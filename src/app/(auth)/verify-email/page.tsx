import { redirect } from "next/navigation";
import { getAuthRedirectPath } from "@/features/auth/lib/get-auth-redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VerifyEmailView } from "@/features/auth/components/verify-email-view";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const supabase = await createSupabaseServerClient();
  
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { next } = await searchParams;
      redirect(getAuthRedirectPath(next ?? null));
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-center">
      <VerifyEmailView />
    </div>
  );
}
