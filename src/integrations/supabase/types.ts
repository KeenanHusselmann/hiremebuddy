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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          client_id: string
          created_at: string
          id: string
          labourer_id: string
          message: string | null
          service_id: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          client_id: string
          created_at?: string
          id?: string
          labourer_id: string
          message?: string | null
          service_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          client_id?: string
          created_at?: string
          id?: string
          labourer_id?: string
          message?: string | null
          service_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_labourer_id_fkey"
            columns: ["labourer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          is_active: boolean | null
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          platform: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          booking_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string | null
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      namibian_towns: {
        Row: {
          created_at: string
          id: string
          name: string
          region: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          region: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          region?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          target_url: string | null
          type: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          target_url?: string | null
          type: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          target_url?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contact_number: string | null
          created_at: string
          facebook_link: string | null
          first_login_completed: boolean | null
          full_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location_text: string | null
          longitude: number | null
          privacy_accepted_at: string | null
          privacy_version: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          town: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          whatsapp_link: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          contact_number?: string | null
          created_at?: string
          facebook_link?: string | null
          first_login_completed?: boolean | null
          full_name: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location_text?: string | null
          longitude?: number | null
          privacy_accepted_at?: string | null
          privacy_version?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          town?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          contact_number?: string | null
          created_at?: string
          facebook_link?: string | null
          first_login_completed?: boolean | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location_text?: string | null
          longitude?: number | null
          privacy_accepted_at?: string | null
          privacy_version?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          town?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          whatsapp_link?: string | null
        }
        Relationships: []
      }
      provider_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          provider_id: string
          subcategory_id: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          provider_id: string
          subcategory_id?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          provider_id?: string
          subcategory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_categories_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_categories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "service_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          address: string
          budget: string | null
          client_id: string
          created_at: string
          id: string
          labourer_id: string
          phone: string
          preferred_contact: string
          project_description: string
          quote_amount: number | null
          quote_message: string | null
          service_id: string | null
          status: string
          timeline: string | null
          updated_at: string
          urgency: string
        }
        Insert: {
          address: string
          budget?: string | null
          client_id: string
          created_at?: string
          id?: string
          labourer_id: string
          phone: string
          preferred_contact?: string
          project_description: string
          quote_amount?: number | null
          quote_message?: string | null
          service_id?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
          urgency?: string
        }
        Update: {
          address?: string
          budget?: string | null
          client_id?: string
          created_at?: string
          id?: string
          labourer_id?: string
          phone?: string
          preferred_contact?: string
          project_description?: string
          quote_amount?: number | null
          quote_message?: string | null
          service_id?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_labourer_id_fkey"
            columns: ["labourer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_subcategories: {
        Row: {
          category_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          hourly_rate: number | null
          id: string
          is_active: boolean
          labourer_id: string
          portfolio_images: string[] | null
          service_name: string
          subcategory_id: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          labourer_id: string
          portfolio_images?: string[] | null
          service_name: string
          subcategory_id?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          labourer_id?: string
          portfolio_images?: string[] | null
          service_name?: string
          subcategory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_labourer_id_fkey"
            columns: ["labourer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "service_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          created_at: string
          id: string
          is_available: boolean | null
          last_seen: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean | null
          last_seen?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean | null
          last_seen?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          created_at: string
          id: string
          id_document_back_path: string | null
          id_document_front_path: string | null
          profile_id: string
          selfie_image_path: string | null
          submitted_at: string
          updated_at: string
          verification_notes: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          id_document_back_path?: string | null
          id_document_front_path?: string | null
          profile_id: string
          selfie_image_path?: string | null
          submitted_at?: string
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          id_document_back_path?: string | null
          id_document_front_path?: string | null
          profile_id?: string
          selfie_image_path?: string | null
          submitted_at?: string
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_contact_notification: {
        Args: {
          p_category?: string
          p_message: string
          p_target_url?: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          category_param?: string
          message_param: string
          target_url_param?: string
          type_param: string
          user_id_param: string
        }
        Returns: string
      }
      get_completed_jobs: {
        Args: { provider_ids: string[] }
        Returns: {
          completed_count: number
          provider_id: string
        }[]
      }
      get_safe_profiles: {
        Args: { profile_ids: string[] }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          is_verified: boolean
          location_text: string
          town: string
          user_type: Database["public"]["Enums"]["user_type"]
        }[]
      }
      get_service_ratings: {
        Args: { service_ids: string[] }
        Returns: {
          average_rating: number
          review_count: number
          service_id: string
        }[]
      }
      get_user_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_verification_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      update_user_presence: {
        Args: { status_param?: string }
        Returns: undefined
      }
      update_verification_status: {
        Args: { admin_notes?: string; new_status: string; profile_id: string }
        Returns: boolean
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "completed"
        | "cancelled"
      user_type: "client" | "labourer" | "both" | "admin"
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
      booking_status: [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
      ],
      user_type: ["client", "labourer", "both", "admin"],
    },
  },
} as const
