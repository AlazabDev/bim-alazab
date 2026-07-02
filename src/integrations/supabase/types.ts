export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          description: string
          id: string
          metadata: Json | null
          project_id: string | null
          target: string | null
          user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          target?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          target?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          assignee_id: string | null
          comment: string | null
          created_at: string
          decided_at: string | null
          file_id: string | null
          id: string
          project_id: string
          role_required: string | null
          status: Database["public"]["Enums"]["approval_status"]
          step_name: string
          step_order: number
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          comment?: string | null
          created_at?: string
          decided_at?: string | null
          file_id?: string | null
          id?: string
          project_id: string
          role_required?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          step_name: string
          step_order?: number
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          comment?: string | null
          created_at?: string
          decided_at?: string | null
          file_id?: string | null
          id?: string
          project_id?: string
          role_required?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          step_name?: string
          step_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      file_versions: {
        Row: {
          created_at: string
          file_id: string
          id: string
          notes: string | null
          size_bytes: number | null
          storage_path: string | null
          uploaded_by: string | null
          version: string
        }
        Insert: {
          created_at?: string
          file_id: string
          id?: string
          notes?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          uploaded_by?: string | null
          version: string
        }
        Update: {
          created_at?: string
          file_id?: string
          id?: string
          notes?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          uploaded_by?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_versions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          category: Database["public"]["Enums"]["file_category"]
          created_at: string
          current_version: string | null
          id: string
          mime_type: string | null
          name: string
          project_id: string
          size_bytes: number | null
          status: Database["public"]["Enums"]["file_status"]
          storage_path: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["file_category"]
          created_at?: string
          current_version?: string | null
          id?: string
          mime_type?: string | null
          name: string
          project_id: string
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["file_status"]
          storage_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["file_category"]
          created_at?: string
          current_version?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          project_id?: string
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["file_status"]
          storage_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assignee_id: string | null
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["issue_priority"]
          project_id: string
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          type: Database["public"]["Enums"]["issue_type"]
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["issue_priority"]
          project_id: string
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
          type?: Database["public"]["Enums"]["issue_type"]
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["issue_priority"]
          project_id?: string
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          type?: Database["public"]["Enums"]["issue_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notif_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notif_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notif_type"]
          user_id?: string
        }
        Relationships: []
      }
      plumbing_checks: {
        Row: {
          check_type: string
          created_at: string
          evidence_id: string | null
          id: string
          input_data: Json
          notes: string | null
          project_id: string
          result_data: Json
          status: string
          updated_at: string
        }
        Insert: {
          check_type: string
          created_at?: string
          evidence_id?: string | null
          id?: string
          input_data?: Json
          notes?: string | null
          project_id: string
          result_data?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          check_type?: string
          created_at?: string
          evidence_id?: string | null
          id?: string
          input_data?: Json
          notes?: string | null
          project_id?: string
          result_data?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plumbing_checks_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "technical_evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plumbing_checks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      plumbing_fixtures: {
        Row: {
          cold_water: boolean | null
          created_at: string
          drain_diameter_mm: number | null
          drain_required: boolean | null
          drainage_fixture_units: number | null
          evidence_id: string | null
          fixture_type: string
          hot_water: boolean | null
          id: string
          notes: string | null
          project_id: string
          quantity: number
          space_name: string
          updated_at: string
          water_fixture_units: number | null
        }
        Insert: {
          cold_water?: boolean | null
          created_at?: string
          drain_diameter_mm?: number | null
          drain_required?: boolean | null
          drainage_fixture_units?: number | null
          evidence_id?: string | null
          fixture_type: string
          hot_water?: boolean | null
          id?: string
          notes?: string | null
          project_id: string
          quantity?: number
          space_name: string
          updated_at?: string
          water_fixture_units?: number | null
        }
        Update: {
          cold_water?: boolean | null
          created_at?: string
          drain_diameter_mm?: number | null
          drain_required?: boolean | null
          drainage_fixture_units?: number | null
          evidence_id?: string | null
          fixture_type?: string
          hot_water?: boolean | null
          id?: string
          notes?: string | null
          project_id?: string
          quantity?: number
          space_name?: string
          updated_at?: string
          water_fixture_units?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plumbing_fixtures_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "technical_evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plumbing_fixtures_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          job_title: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          added_at: string
          id: string
          project_id: string
          project_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          project_id: string
          project_role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          project_id?: string
          project_role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string | null
          code: string
          conformity: number
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          location: string | null
          manager_id: string | null
          name: string
          progress: number
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          code: string
          conformity?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          manager_id?: string | null
          name: string
          progress?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          code?: string
          conformity?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          manager_id?: string | null
          name?: string
          progress?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      supcloud_keepalive: {
        Row: {
          id: number
          marker: string
        }
        Insert: {
          id: number
          marker?: string
        }
        Update: {
          id?: number
          marker?: string
        }
        Relationships: []
      }
      technical_evidence: {
        Row: {
          approved_by: string | null
          created_at: string
          decision_notes: string | null
          description: string | null
          discipline: string
          evidence_type: string
          id: string
          metadata: Json
          prepared_by: string | null
          project_id: string
          report_version: string | null
          reviewed_by: string | null
          source_software: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          decision_notes?: string | null
          description?: string | null
          discipline: string
          evidence_type: string
          id?: string
          metadata?: Json
          prepared_by?: string | null
          project_id: string
          report_version?: string | null
          reviewed_by?: string | null
          source_software?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          decision_notes?: string | null
          description?: string | null
          discipline?: string
          evidence_type?: string
          id?: string
          metadata?: Json
          prepared_by?: string | null
          project_id?: string
          report_version?: string | null
          reviewed_by?: string | null
          source_software?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_evidence_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_evidence_files: {
        Row: {
          created_at: string
          evidence_id: string
          file_id: string | null
          file_name: string | null
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string | null
        }
        Insert: {
          created_at?: string
          evidence_id: string
          file_id?: string | null
          file_name?: string | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
        }
        Update: {
          created_at?: string
          evidence_id?: string
          file_id?: string | null
          file_name?: string | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_evidence_files_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "technical_evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_evidence_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_project: {
        Args: { _project: string; _user: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "upload"
        | "approve"
        | "reject"
        | "comment"
        | "edit"
        | "create"
        | "delete"
        | "invite"
      app_role: "admin" | "owner" | "editor" | "viewer"
      approval_status: "waiting" | "pending" | "approved" | "rejected"
      file_category:
        | "site_photos"
        | "bim"
        | "drawings"
        | "reports"
        | "documents"
      file_status: "draft" | "in_review" | "approved" | "rejected"
      issue_priority: "low" | "medium" | "high" | "critical"
      issue_status: "open" | "in_progress" | "resolved" | "closed"
      issue_type: "issue" | "rfi" | "submittal"
      notif_type: "info" | "success" | "warning" | "danger"
      project_status:
        | "draft"
        | "in_review"
        | "in_progress"
        | "approved"
        | "completed"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "upload",
        "approve",
        "reject",
        "comment",
        "edit",
        "create",
        "delete",
        "invite",
      ],
      app_role: ["admin", "owner", "editor", "viewer"],
      approval_status: ["waiting", "pending", "approved", "rejected"],
      file_category: ["site_photos", "bim", "drawings", "reports", "documents"],
      file_status: ["draft", "in_review", "approved", "rejected"],
      issue_priority: ["low", "medium", "high", "critical"],
      issue_status: ["open", "in_progress", "resolved", "closed"],
      issue_type: ["issue", "rfi", "submittal"],
      notif_type: ["info", "success", "warning", "danger"],
      project_status: [
        "draft",
        "in_review",
        "in_progress",
        "approved",
        "completed",
        "rejected",
      ],
    },
  },
} as const
