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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          page: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          page?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          page?: string | null
          user_id?: string
        }
        Relationships: []
      }
      app_update_reads: {
        Row: {
          id: string
          read_at: string
          update_id: string
          user_id: string
        }
        Insert: {
          id?: string
          read_at?: string
          update_id: string
          user_id: string
        }
        Update: {
          id?: string
          read_at?: string
          update_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_update_reads_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "app_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      app_updates: {
        Row: {
          created_at: string
          description: string
          how_to_use: string | null
          icon: string
          id: string
          title: string
          version: string
        }
        Insert: {
          created_at?: string
          description: string
          how_to_use?: string | null
          icon?: string
          id?: string
          title: string
          version: string
        }
        Update: {
          created_at?: string
          description?: string
          how_to_use?: string | null
          icon?: string
          id?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          color: string
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          is_completed: boolean
          recurrence: string | null
          recurrence_parent_id: string | null
          reminder_minutes: number | null
          start_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          is_completed?: boolean
          recurrence?: string | null
          recurrence_parent_id?: string | null
          reminder_minutes?: number | null
          start_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          is_completed?: boolean
          recurrence?: string | null
          recurrence_parent_id?: string | null
          reminder_minutes?: number | null
          start_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_recurrence_parent_id_fkey"
            columns: ["recurrence_parent_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          created_at: string
          id: string
          likes_count: number
          media_type: string | null
          media_url: string | null
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          likes_count?: number
          media_type?: string | null
          media_url?: string | null
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          likes_count?: number
          media_type?: string | null
          media_url?: string | null
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_completions: {
        Row: {
          all_completed: boolean
          completed_count: number
          completion_date: string
          created_at: string
          id: string
          total_count: number
          user_id: string
        }
        Insert: {
          all_completed?: boolean
          completed_count?: number
          completion_date?: string
          created_at?: string
          id?: string
          total_count?: number
          user_id: string
        }
        Update: {
          all_completed?: boolean
          completed_count?: number
          completion_date?: string
          created_at?: string
          id?: string
          total_count?: number
          user_id?: string
        }
        Relationships: []
      }
      diary_notes: {
        Row: {
          color: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diet_entries: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          description: string
          entry_date: string
          fat: number | null
          id: string
          meal_type: string
          photo_url: string | null
          protein: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          description: string
          entry_date?: string
          fat?: number | null
          id?: string
          meal_type?: string
          photo_url?: string | null
          protein?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          description?: string
          entry_date?: string
          fat?: number | null
          id?: string
          meal_type?: string
          photo_url?: string | null
          protein?: number | null
          user_id?: string
        }
        Relationships: []
      }
      exercise_entries: {
        Row: {
          calories_burned: number | null
          category: string
          created_at: string
          duration_minutes: number | null
          entry_date: string
          exercise_name: string
          id: string
          notes: string | null
          reps: number | null
          sets: number | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          calories_burned?: number | null
          category?: string
          created_at?: string
          duration_minutes?: number | null
          entry_date?: string
          exercise_name: string
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          calories_burned?: number | null
          category?: string
          created_at?: string
          duration_minutes?: number | null
          entry_date?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      finance_entries: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          month: number
          type: string
          user_id: string
          year: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          month: number
          type?: string
          user_id: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          month?: number
          type?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      finance_notes: {
        Row: {
          content: string
          id: string
          month: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          content?: string
          id?: string
          month: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          content?: string
          id?: string
          month?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      goal_tasks: {
        Row: {
          created_at: string
          done: boolean
          goal_id: string
          id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          goal_id: string
          id?: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          goal_id?: string
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_updates: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          new_progress: number
          note: string | null
          previous_progress: number
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          new_progress?: number
          note?: string | null
          previous_progress?: number
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          new_progress?: number
          note?: string | null
          previous_progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_updates_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string
          created_at: string
          id: string
          progress: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          progress?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          progress?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_profiles: {
        Row: {
          activity_level: string
          age: number | null
          created_at: string
          current_weight: number | null
          goal: string
          height_cm: number | null
          id: string
          sex: string
          target_weight: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_level?: string
          age?: number | null
          created_at?: string
          current_weight?: number | null
          goal?: string
          height_cm?: number | null
          id?: string
          sex?: string
          target_weight?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_level?: string
          age?: number | null
          created_at?: string
          current_weight?: number | null
          goal?: string
          height_cm?: number | null
          id?: string
          sex?: string
          target_weight?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          comment_text: string | null
          created_at: string
          from_user_id: string
          id: string
          post_id: string
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          comment_text?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          post_id: string
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          comment_text?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          post_id?: string
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          created_at: string
          id: string
          post_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_position: number
          cover_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_position?: number
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_position?: number
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_stickers: {
        Row: {
          created_at: string
          id: string
          label: string | null
          preview_url: string | null
          type: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          preview_url?: string | null
          type: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          preview_url?: string | null
          type?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      sticker_pack_items: {
        Row: {
          created_at: string
          id: string
          image_url: string
          label: string | null
          pack_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          label?: string | null
          pack_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          label?: string | null
          pack_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sticker_pack_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "sticker_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      sticker_packs: {
        Row: {
          cover_url: string | null
          created_at: string
          id: string
          is_public: boolean
          name: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          name: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          bg_color: string | null
          created_at: string
          id: string
          media_type: string
          media_url: string | null
          text_content: string | null
          user_id: string
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string | null
          text_content?: string | null
          user_id: string
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string | null
          text_content?: string | null
          user_id?: string
        }
        Relationships: []
      }
      story_comments: {
        Row: {
          created_at: string
          id: string
          story_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      supplement_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          id: string
          supplement_id: string
          taken: boolean
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          id?: string
          supplement_id: string
          taken?: boolean
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          id?: string
          supplement_id?: string
          taken?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplement_checkins_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "user_supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_supplements: {
        Row: {
          category: string
          created_at: string
          dose: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          dose?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          dose?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weight_records: {
        Row: {
          created_at: string
          id: string
          note: string | null
          photo_url: string | null
          recorded_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          photo_url?: string | null
          recorded_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          photo_url?: string | null
          recorded_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_streak: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
