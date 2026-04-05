import { redirect } from "next/navigation";
import { getAuthRedirectPath } from "@/features/auth/lib/get-auth-redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignInForm } from "@/features/auth/components/sign-in-form";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
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

  const { next } = await searchParams;

  return (
    <div className="w-full flex-1 flex flex-col justify-center">
      <SignInForm nextPath={next} />
    </div>
  );
}
