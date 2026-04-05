export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TaskStatus = "todo" | "in_progress" | "done";
export type BoardRole = "owner" | "admin" | "member";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      boards: {
        Row: {
          id: string;
          name: string;
          description: string;
          owner_id: string;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          owner_id: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          owner_id?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      board_members: {
        Row: {
          board_id: string;
          user_id: string;
          role: BoardRole;
          created_at: string;
        };
        Insert: {
          board_id: string;
          user_id: string;
          role?: BoardRole;
          created_at?: string;
        };
        Update: {
          board_id?: string;
          user_id?: string;
          role?: BoardRole;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          board_id: string;
          title: string;
          description: string;
          status: TaskStatus;
          position: number;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          title: string;
          description?: string;
          status?: TaskStatus;
          position: number;
          created_by?: string;
          updated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          title?: string;
          description?: string;
          status?: TaskStatus;
          position?: number;
          created_by?: string;
          updated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      board_invitations: {
        Row: {
          id: string;
          board_id: string;
          email: string;
          role: BoardRole;
          invited_by: string;
          invited_user_id: string | null;
          created_at: string;
          accepted_at: string | null;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          board_id: string;
          email: string;
          role?: BoardRole;
          invited_by: string;
          invited_user_id?: string | null;
          created_at?: string;
          accepted_at?: string | null;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          board_id?: string;
          email?: string;
          role?: BoardRole;
          invited_by?: string;
          invited_user_id?: string | null;
          created_at?: string;
          accepted_at?: string | null;
          revoked_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_current_user_profile: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      create_board_with_owner: {
        Args: {
          target_name: string;
          target_description?: string;
        };
        Returns: string;
      };
      accept_pending_board_invitations: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      transfer_board_ownership: {
        Args: {
          target_board_id: string;
          target_user_id: string;
        };
        Returns: string;
      };
      lookup_board_member_candidate: {
        Args: {
          target_board_id: string;
          target_email: string;
        };
        Returns: {
          id: string;
          display_name: string | null;
          email: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
