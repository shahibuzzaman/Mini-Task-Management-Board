export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TaskStatus = "todo" | "in_progress" | "done";
export type BoardRole = "owner" | "member";

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
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
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
