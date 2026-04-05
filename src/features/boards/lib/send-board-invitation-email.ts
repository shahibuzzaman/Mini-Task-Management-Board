import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type SendBoardInvitationEmailInput = {
  adminClient: SupabaseClient<Database>;
  emailClient: SupabaseClient<Database> | null;
  email: string;
  redirectTo: string;
};

export async function sendBoardInvitationEmail({
  adminClient,
  emailClient,
  email,
  redirectTo,
}: SendBoardInvitationEmailInput): Promise<void> {
  if (emailClient) {
    const { error: otpError } = await emailClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: false,
      },
    });

    if (!otpError) {
      return;
    }
  }

  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo,
    },
  );

  if (inviteError) {
    throw new Error(inviteError.message);
  }
}
