/**
 * Supabase Database 型別定義
 * 對應 supabase/migrations/001~008
 *
 * 注意：手動維護。若改 schema，記得同步更新此檔。
 */
type Jsonish =
  | string
  | number
  | boolean
  | null
  | Jsonish[]
  | { [key: string]: Jsonish };

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
          online_access: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          locale?: string;
          online_access?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          locale?: string;
          online_access?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: {
          id: string;
          slug: string | null;
          title: string;
          description: string | null;
          long_description: string | null;
          price: number;
          sale_price: number | null;
          thumbnail_url: string | null;
          cover_video_url: string | null;
          status: "draft" | "published" | "archived";
          sort_order: number;
          what_youll_learn: Jsonish;
          prerequisites: Jsonish;
          target_audience: Jsonish;
          category: string | null;
          level: "beginner" | "intermediate" | "advanced" | "all" | null;
          instructor_name: string | null;
          instructor_bio: string | null;
          total_lessons: number;
          total_duration_seconds: number;
          featured: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug?: string | null;
          title: string;
          description?: string | null;
          long_description?: string | null;
          price?: number;
          sale_price?: number | null;
          thumbnail_url?: string | null;
          cover_video_url?: string | null;
          status?: "draft" | "published" | "archived";
          sort_order?: number;
          what_youll_learn?: Jsonish;
          prerequisites?: Jsonish;
          target_audience?: Jsonish;
          category?: string | null;
          level?: "beginner" | "intermediate" | "advanced" | "all" | null;
          instructor_name?: string | null;
          instructor_bio?: string | null;
          featured?: boolean;
          published_at?: string | null;
        };
        Update: {
          slug?: string | null;
          title?: string;
          description?: string | null;
          long_description?: string | null;
          price?: number;
          sale_price?: number | null;
          thumbnail_url?: string | null;
          cover_video_url?: string | null;
          status?: "draft" | "published" | "archived";
          sort_order?: number;
          what_youll_learn?: Jsonish;
          prerequisites?: Jsonish;
          target_audience?: Jsonish;
          category?: string | null;
          level?: "beginner" | "intermediate" | "advanced" | "all" | null;
          instructor_name?: string | null;
          instructor_bio?: string | null;
          featured?: boolean;
          published_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          video_id: string | null;
          bunny_video_id: string | null;
          hls_url: string | null;
          thumbnail_url: string | null;
          duration_seconds: number;
          sort_order: number;
          is_preview: boolean;
          attachments: Jsonish;
          resolution_height: number | null;
          upload_status:
            | "pending"
            | "uploading"
            | "processing"
            | "ready"
            | "failed";
          uploaded_at: string | null;
          section_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          video_id?: string | null;
          bunny_video_id?: string | null;
          hls_url?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number;
          sort_order?: number;
          is_preview?: boolean;
          attachments?: Jsonish;
          resolution_height?: number | null;
          upload_status?:
            | "pending"
            | "uploading"
            | "processing"
            | "ready"
            | "failed";
          uploaded_at?: string | null;
          section_id?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          video_id?: string | null;
          bunny_video_id?: string | null;
          hls_url?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number;
          sort_order?: number;
          is_preview?: boolean;
          attachments?: Jsonish;
          resolution_height?: number | null;
          upload_status?:
            | "pending"
            | "uploading"
            | "processing"
            | "ready"
            | "failed";
          uploaded_at?: string | null;
          section_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          order_id: string | null;
          purchased_at: string;
          expires_at: string | null;
          device_limit: number;
          source: "purchase" | "gift" | "promo_free" | "manual_grant";
          granted_by: string | null;
          notes: string | null;
          last_accessed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          order_id?: string | null;
          expires_at?: string | null;
          device_limit?: number;
          source?: "purchase" | "gift" | "promo_free" | "manual_grant";
          granted_by?: string | null;
          notes?: string | null;
        };
        Update: {
          expires_at?: string | null;
          device_limit?: number;
          notes?: string | null;
          last_accessed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          progress_pct: number;
          position_seconds: number;
          total_watch_seconds: number;
          completed: boolean;
          completed_at: string | null;
          last_watched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          progress_pct?: number;
          position_seconds?: number;
          total_watch_seconds?: number;
          completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string;
        };
        Update: {
          progress_pct?: number;
          position_seconds?: number;
          total_watch_seconds?: number;
          completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      course_sections: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          sort_order?: number;
        };
        Update: {
          title?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      lesson_notes: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          course_id: string;
          position_seconds: number;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          course_id: string;
          position_seconds?: number;
          content: string;
        };
        Update: {
          position_seconds?: number;
          content?: string;
        };
        Relationships: [];
      };
      lesson_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          course_id: string;
          position_seconds: number;
          label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          course_id: string;
          position_seconds: number;
          label?: string | null;
        };
        Update: {
          label?: string | null;
        };
        Relationships: [];
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: "percentage" | "fixed_amount" | "free";
          discount_value: number;
          applies_to: "all" | "courses" | "products" | "specific";
          applicable_course_ids: Jsonish;
          applicable_product_ids: Jsonish;
          min_purchase_amount: number;
          max_uses: number | null;
          max_uses_per_user: number;
          used_count: number;
          starts_at: string;
          expires_at: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type: "percentage" | "fixed_amount" | "free";
          discount_value: number;
          applies_to?: "all" | "courses" | "products" | "specific";
          applicable_course_ids?: Jsonish;
          applicable_product_ids?: Jsonish;
          min_purchase_amount?: number;
          max_uses?: number | null;
          max_uses_per_user?: number;
          starts_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
          created_by?: string | null;
        };
        Update: {
          code?: string;
          description?: string | null;
          discount_type?: "percentage" | "fixed_amount" | "free";
          discount_value?: number;
          applies_to?: "all" | "courses" | "products" | "specific";
          applicable_course_ids?: Jsonish;
          applicable_product_ids?: Jsonish;
          min_purchase_amount?: number;
          max_uses?: number | null;
          max_uses_per_user?: number;
          starts_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      promo_code_redemptions: {
        Row: {
          id: string;
          promo_code_id: string;
          user_id: string;
          order_id: string | null;
          discount_amount: number;
          redeemed_at: string;
        };
        Insert: {
          id?: string;
          promo_code_id: string;
          user_id: string;
          order_id?: string | null;
          discount_amount: number;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "promo_code_redemptions_promo_code_id_fkey";
            columns: ["promo_code_id"];
            isOneToOne: false;
            referencedRelation: "promo_codes";
            referencedColumns: ["id"];
          },
        ];
      };
      video_view_sessions: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          course_id: string;
          device_fingerprint: string;
          device_label: string | null;
          user_agent: string | null;
          ip_address: string | null;
          started_at: string;
          last_heartbeat_at: string;
          ended_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          course_id: string;
          device_fingerprint: string;
          device_label?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          is_active?: boolean;
        };
        Update: {
          lesson_id?: string;
          last_heartbeat_at?: string;
          ended_at?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "fk_products_group_buy";
            columns: ["group_buy_id"];
            isOneToOne: false;
            referencedRelation: "group_buys";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "group_buy_items_group_buy_id_fkey";
            columns: ["group_buy_id"];
            isOneToOne: false;
            referencedRelation: "group_buys";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_buy_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "line_orders_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      product_reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          display_name: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          display_name?: string | null;
          is_published?: boolean;
        };
        Update: {
          rating?: number;
          comment?: string | null;
          display_name?: string | null;
          is_published?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      course_reviews: {
        Row: {
          id: string;
          course_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      stock_notifications: {
        Row: {
          id: string;
          product_id: string;
          email: string;
          user_id: string | null;
          notified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          email: string;
          user_id?: string | null;
        };
        Update: {
          notified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stock_notifications_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          source: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
          is_active: boolean;
          sub_type: "newsletter" | "groupbuy" | "all";
        };
        Insert: {
          id?: string;
          email: string;
          source?: string;
          is_active?: boolean;
          sub_type?: "newsletter" | "groupbuy" | "all";
        };
        Update: {
          is_active?: boolean;
          unsubscribed_at?: string | null;
          sub_type?: "newsletter" | "groupbuy" | "all";
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          status:
            | "pending"
            | "paid"
            | "shipped"
            | "completed"
            | "cancelled"
            | "refunded";
          total: number;
          original_total: number | null;
          discount_amount: number;
          promo_code: string | null;
          promo_code_id: string | null;
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
          status?:
            | "pending"
            | "paid"
            | "shipped"
            | "completed"
            | "cancelled"
            | "refunded";
          total: number;
          original_total?: number | null;
          discount_amount?: number;
          promo_code?: string | null;
          promo_code_id?: string | null;
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
          paid_at?: string | null;
        };
        Update: {
          status?:
            | "pending"
            | "paid"
            | "shipped"
            | "completed"
            | "cancelled"
            | "refunded";
          payment_id?: string | null;
          tracking_number?: string | null;
          logistics_id?: string | null;
          logistics_status?: string | null;
          ecpay_trade_no?: string | null;
          paid_at?: string | null;
          shipped_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      course_rating_summary: {
        Row: {
          course_id: string;
          avg_rating: number | null;
          review_count: number;
        };
        Relationships: [];
      };
      my_enrolled_courses: {
        Row: {
          user_id: string;
          course_id: string;
          slug: string | null;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          total_lessons: number;
          total_duration_seconds: number;
          level: "beginner" | "intermediate" | "advanced" | "all" | null;
          instructor_name: string | null;
          purchased_at: string;
          expires_at: string | null;
          last_accessed_at: string | null;
          completed_lessons: number;
          progress_percentage: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      validate_promo_code: {
        Args: {
          p_code: string;
          p_user_id: string;
          p_subtotal: number;
          p_course_ids?: string[];
          p_product_ids?: string[];
        };
        Returns: {
          valid: boolean;
          promo_id: string | null;
          discount_amount: number;
          reason: string;
        }[];
      };
      grant_course_enrollments_from_order: {
        Args: { p_order_id: string };
        Returns: number;
      };
      record_promo_redemption: {
        Args: {
          p_promo_id: string;
          p_user_id: string;
          p_order_id: string;
          p_discount_amount: number;
        };
        Returns: boolean;
      };
      increment_promo_used_count: {
        Args: { p_id: string };
        Returns: number;
      };
      user_has_course_access: {
        Args: { p_user_id: string; p_course_id: string };
        Returns: boolean;
      };
      expire_stale_video_sessions: {
        Args: Record<string, never>;
        Returns: number;
      };
      decrement_stock_batch: {
        Args: { p_items: { product_id: string; quantity: number }[] };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
};

// Row 型別別名
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type LessonProgress =
  Database["public"]["Tables"]["lesson_progress"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type GroupBuy = Database["public"]["Tables"]["group_buys"]["Row"];
export type GroupBuyItem =
  Database["public"]["Tables"]["group_buy_items"]["Row"];
export type CartItemRow = Database["public"]["Tables"]["cart_items"]["Row"];
export type LineOrder = Database["public"]["Tables"]["line_orders"]["Row"];
export type NewsletterSubscriber =
  Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
export type ProductReview =
  Database["public"]["Tables"]["product_reviews"]["Row"];
export type CourseReview =
  Database["public"]["Tables"]["course_reviews"]["Row"];
export type CourseRatingSummary =
  Database["public"]["Views"]["course_rating_summary"]["Row"];
export type PromoCode = Database["public"]["Tables"]["promo_codes"]["Row"];
export type PromoCodeRedemption =
  Database["public"]["Tables"]["promo_code_redemptions"]["Row"];
export type VideoViewSession =
  Database["public"]["Tables"]["video_view_sessions"]["Row"];
export type MyEnrolledCourse =
  Database["public"]["Views"]["my_enrolled_courses"]["Row"];
export type CourseSection =
  Database["public"]["Tables"]["course_sections"]["Row"];
export type LessonNote = Database["public"]["Tables"]["lesson_notes"]["Row"];
export type LessonBookmark =
  Database["public"]["Tables"]["lesson_bookmarks"]["Row"];
