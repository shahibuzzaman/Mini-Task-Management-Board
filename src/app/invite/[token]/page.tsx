import { notFound } from "next/navigation";
import { InviteAcceptanceCard } from "@/components/board/invite-acceptance-card";
import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

type InvitationPreviewRow = {
  id: string;
  email: string;
  role: "admin" | "member" | "owner";
  token: string;
  token_expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  board: {
    id: string;
    name: string;
    description: string;
  } | null;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const config = getSupabaseBrowserConfig();

  if (!config.isConfigured) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-10 sm:px-8">
        <SupabaseSetupNotice
          isConfigured={config.isConfigured}
          missingEnvVars={config.missingEnvVars}
        />
      </main>
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-10 sm:px-8">
        <SupabaseSetupNotice
          isConfigured={false}
          missingEnvVars={["SUPABASE_SERVICE_ROLE_KEY"]}
        />
      </main>
    );
  }

  const { token } = await params;
  const { data: invitation, error } = await adminClient
    .from("board_invitations")
    .select(
      "id, email, role, token, token_expires_at, accepted_at, revoked_at, board:boards(id, name, description)",
    )
    .eq("token", token)
    .maybeSingle<InvitationPreviewRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!invitation || !invitation.board) {
    notFound();
  }

  const { data: isExpired, error: expirationError } = await adminClient.rpc(
    "is_board_invitation_expired",
    {
      target_token: token,
    },
  );

  if (expirationError) {
    throw new Error(expirationError.message);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  const status =
    invitation.revoked_at !== null
      ? "revoked"
      : invitation.accepted_at !== null
        ? "accepted"
        : isExpired
          ? "expired"
          : "pending";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-10 sm:px-8">
      <InviteAcceptanceCard
        boardName={invitation.board.name}
        boardDescription={invitation.board.description}
        invitedEmail={invitation.email}
        role={invitation.role === "owner" ? "admin" : invitation.role}
        token={invitation.token}
        status={status}
        isAuthenticated={Boolean(user)}
        signedInEmail={user?.email ?? null}
      />
    </main>
  );
}
