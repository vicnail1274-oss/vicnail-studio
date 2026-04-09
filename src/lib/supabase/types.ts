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
          purchase_type: "instock" | "preorder" | "proxy";
          preorder_deadline: string | null;
          estimated_delivery: string | null;
          min_order_qty: number;
          group_buy_id: string | null;
          slug: string | null;
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
          stock?: number;
          category?: string | null;
          images?: string[];
          variants?: { name: string; options: string[] }[];
          status?: "draft" | "published" | "archived";
          shipping_weight?: number;
          purchase_type?: "instock" | "preorder" | "proxy";
          preorder_deadline?: string | null;
          estimated_delivery?: string | null;
          min_order_qty?: number;
          group_buy_id?: string | null;
          slug?: string | null;
          sort_order?: number;
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
          purchase_type?: "instock" | "preorder" | "proxy";
          preorder_deadline?: string | null;
          estimated_delivery?: string | null;
          min_order_qty?: number;
          group_buy_id?: string | null;
          slug?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
      };
      group_buys: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_image: string | null;
          start_date: string;
          end_date: string;
          target_qty: number;
          current_qty: number;
          status: "upcoming" | "active" | "closed" | "completed" | "cancelled";
          notify_subscribers: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_image?: string | null;
          start_date: string;
          end_date: string;
          target_qty?: number;
          status?: "upcoming" | "active" | "closed" | "completed" | "cancelled";
        };
        Update: {
          title?: string;
          description?: string | null;
          cover_image?: string | null;
          start_date?: string;
          end_date?: string;
          target_qty?: number;
          current_qty?: number;
          status?: "upcoming" | "active" | "closed" | "completed" | "cancelled";
          notify_subscribers?: boolean;
        };
      };
      group_buy_items: {
        Row: {
          id: string;
          group_buy_id: string;
          product_id: string;
          group_price: number;
          max_per_person: number;
        };
        Insert: {
          id?: string;
          group_buy_id: string;
          product_id: string;
          group_price: number;
          max_per_person?: number;
        };
        Update: {
          group_price?: number;
          max_per_person?: number;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant: Record<string, string>;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          variant?: Record<string, string>;
          quantity?: number;
        };
        Update: {
          quantity?: number;
          variant?: Record<string, string>;
        };
      };
      line_orders: {
        Row: {
          id: string;
          line_user_id: string;
          line_display_name: string | null;
          line_group_id: string | null;
          order_id: string | null;
          raw_message: string;
          parsed_data: Record<string, unknown>;
          status: "pending" | "confirmed" | "linked" | "cancelled" | "error";
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          line_user_id: string;
          line_display_name?: string | null;
          line_group_id?: string | null;
          order_id?: string | null;
          raw_message: string;
          parsed_data?: Record<string, unknown>;
          status?: "pending" | "confirmed" | "linked" | "cancelled" | "error";
          error_message?: string | null;
        };
        Update: {
          line_display_name?: string | null;
          order_id?: string | null;
          status?: "pending" | "confirmed" | "linked" | "cancelled" | "error";
          error_message?: string | null;
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
          shipping_store_id: string | null;
          shipping_store_name: string | null;
          logistics_id: string | null;
          logistics_status: string | null;
          logistics_type: string | null;
          ecpay_trade_no: string | null;
          source: "web" | "line" | "admin";
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
          shipping_store_id?: string | null;
          shipping_store_name?: string | null;
          logistics_type?: string | null;
          source?: "web" | "line" | "admin";
          notes?: string | null;
        };
        Update: {
          status?: "pending" | "paid" | "shipped" | "completed" | "cancelled" | "refunded";
          payment_id?: string | null;
          tracking_number?: string | null;
          logistics_id?: string | null;
          logistics_status?: string | null;
          ecpay_trade_no?: string | null;
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
export type GroupBuy = Database["public"]["Tables"]["group_buys"]["Row"];
export type GroupBuyItem = Database["public"]["Tables"]["group_buy_items"]["Row"];
export type CartItemRow = Database["public"]["Tables"]["cart_items"]["Row"];
export type LineOrder = Database["public"]["Tables"]["line_orders"]["Row"];
