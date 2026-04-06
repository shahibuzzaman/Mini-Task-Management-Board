import { redirect } from "next/navigation";
import { getAuthRedirectPath } from "@/features/auth/lib/get-auth-redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

type SignUpPageProps = {
  searchParams: Promise<{
    next?: string;
    email?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
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

  const { next, email } = await searchParams;

  return (
    <div className="w-full flex-1 flex flex-col justify-center">
      <SignUpForm nextPath={next} initialEmail={email} />
    </div>
  );
}
