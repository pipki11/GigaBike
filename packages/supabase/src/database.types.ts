/* ===========================================================
   Hand-authored Database types matching supabase/migrations.
   Regenerate with `supabase gen types typescript` once a live
   project exists; until then this keeps the client typed.
   =========================================================== */
import type { Condition } from "./types";

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name_en: string; name_ka: string; name_ru: string; blurb: string; hue: number; sort: number };
        Insert: { id: string; name_en: string; name_ka: string; name_ru: string; blurb?: string; hue?: number; sort?: number };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      bikes: {
        Row: {
          id: string; slug: string; name: string; category_id: string; price: number;
          condition: Condition; featured: boolean; description: string; keywords: string[];
          gallery: number; hue: number; image_urls: string[]; created_at: string;
        };
        Insert: {
          id?: string; slug: string; name: string; category_id: string; price: number;
          condition?: Condition; featured?: boolean; description?: string; keywords?: string[];
          gallery?: number; hue?: number; image_urls?: string[]; created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bikes"]["Insert"]>;
        Relationships: [];
      };
      repair_groups: {
        Row: {
          id: string; icon: string; title_en: string; title_ka: string; title_ru: string;
          blurb_en: string; blurb_ka: string; blurb_ru: string; sort: number;
        };
        Insert: Database["public"]["Tables"]["repair_groups"]["Row"];
        Update: Partial<Database["public"]["Tables"]["repair_groups"]["Row"]>;
        Relationships: [];
      };
      repair_services: {
        Row: {
          id: string; group_id: string; price: string;
          name_en: string; name_ka: string; name_ru: string; sort: number;
        };
        Insert: {
          id?: string; group_id: string; price?: string;
          name_en: string; name_ka: string; name_ru: string; sort?: number;
        };
        Update: Partial<Database["public"]["Tables"]["repair_services"]["Insert"]>;
        Relationships: [];
      };
      shop_settings: {
        Row: {
          id: number; name: string; tagline: string; phone: string; whatsapp: string;
          facebook: string; email: string; address: string; hours: string;
        };
        Insert: Partial<Database["public"]["Tables"]["shop_settings"]["Row"]> & { id?: number };
        Update: Partial<Database["public"]["Tables"]["shop_settings"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
