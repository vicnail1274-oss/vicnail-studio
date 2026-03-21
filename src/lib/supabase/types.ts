/**
 * Supabase Database 型別定義
 * 對應 supabase/migrations/001_initial_schema.sql
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          locale?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          thumbnail_url: string | null;
          status: "draft" | "published" | "archived";
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          thumbnail_url?: string | null;
          status?: "draft" | "published" | "archived";
          sort_order?: number;
        };
        Update: {
          title?: string;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          thumbnail_url?: string | null;
          status?: "draft" | "published" | "archived";
          sort_order?: number;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          video_id: string | null;
          duration_seconds: number;
          sort_order: number;
          is_preview: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          video_id?: string | null;
          duration_seconds?: number;
          sort_order?: number;
          is_preview?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          video_id?: string | null;
          duration_seconds?: number;
          sort_order?: number;
          is_preview?: boolean;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          order_id: string | null;
          purchased_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          order_id?: string | null;
          expires_at?: string | null;
        };
        Update: {
          expires_at?: string | null;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          progress_pct: number;
          completed: boolean;
          last_watched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          progress_pct?: number;
          completed?: boolean;
        };
        Update: {
          progress_pct?: number;
          completed?: boolean;
          last_watched_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          stock: number;
          category: string | null;
          images: string[];
          variants: { name: string; options: string[] }[];
          status: "draft" | "published" | "archived";
          shipping_weight: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          stock?: number;
          category?: string | null;
          images?: string[];
          variants?: { name: string; options: string[] }[];
          status?: "draft" | "published" | "archived";
          shipping_weight?: number;
        };
        Update: {
          title?: string;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          stock?: number;
          category?: string | null;
          images?: string[];
          variants?: { name: string; options: string[] }[];
          status?: "draft" | "published" | "archived";
          shipping_weight?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          status: "pending" | "paid" | "shipped" | "completed" | "cancelled" | "refunded";
          total: number;
          shipping_fee: number;
          payment_method: string | null;
          payment_id: string | null;
          shipping_name: string | null;
          shipping_phone: string | null;
          shipping_address: string | null;
          shipping_method: string | null;
          tracking_number: string | null;
          notes: string | null;
          paid_at: string | null;
          shipped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_number: string;
          status?: "pending" | "paid" | "shipped" | "completed" | "cancelled" | "refunded";
          total: number;
          shipping_fee?: number;
          payment_method?: string | null;
          shipping_name?: string | null;
          shipping_phone?: string | null;
          shipping_address?: string | null;
          shipping_method?: string | null;
          notes?: string | null;
        };
        Update: {
          status?: "pending" | "paid" | "shipped" | "completed" | "cancelled" | "refunded";
          payment_id?: string | null;
          tracking_number?: string | null;
          paid_at?: string | null;
          shipped_at?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          item_type: "course" | "product";
          item_id: string;
          item_title: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          item_type: "course" | "product";
          item_id: string;
          item_title: string;
          quantity?: number;
          unit_price: number;
          total_price: number;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// 方便用的 Row 型別別名
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type LessonProgress = Database["public"]["Tables"]["lesson_progress"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
