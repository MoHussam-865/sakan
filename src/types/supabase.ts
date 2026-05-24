// ---------------------------------------------------------------------------
// Scalar JSON type
// ---------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Enum types (mirrors PostgreSQL custom enums)
// ---------------------------------------------------------------------------

export type GenderType = "male" | "female";
export type MaritalStatusType = "single" | "divorced" | "widowed";
export type SkinColorType = "white" | "wheatish" | "brown" | "dark";
export type EducationType = "high_school" | "bachelor" | "master" | "phd";
export type ReligiousCommitmentType =
  | "practicing"
  | "moderate"
  | "not_practicing";
export type HijabStatusType = "none" | "hijab" | "niqab";

// ---------------------------------------------------------------------------
// Table Row types (what Supabase returns on SELECT)
// ---------------------------------------------------------------------------

export type Profile = {
  id: string;
  name: string;
  gender: GenderType;
  /** ISO 8601 date string, e.g. "1990-05-24" */
  date_of_birth: string;
  nationality: string;
  country: string;
  city: string;
  height_cm: number | null;
  weight_kg: number | null;
  skin_color: SkinColorType | null;
  education_level: EducationType | null;
  job_title: string | null;
  marital_status: MaritalStatusType;
  has_children: boolean;
  children_count: number;
  children_living_with_me: boolean;
  religious_commitment: ReligiousCommitmentType | null;
  hijab_status: HijabStatusType | null;
  beard_status: string | null;
  smoking_status: string | null;
  health_status: string | null;
  about_me: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PartnerPreference = {
  profile_id: string;
  min_age: number | null;
  max_age: number | null;
  min_height_cm: number | null;
  accepted_marital_statuses: MaritalStatusType[] | null;
  accepted_education_levels: EducationType[] | null;
  partner_description: string | null;
  created_at: string;
  updated_at: string;
};

export type Chat = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Insert types (fields required when inserting a new row)
// ---------------------------------------------------------------------------

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at"> & {
  deleted_at?: string | null;
};

export type PartnerPreferenceInsert = Omit<
  PartnerPreference,
  "created_at" | "updated_at"
>;

export type ChatInsert = Omit<Chat, "id" | "created_at">;

export type MessageInsert = Omit<Message, "id" | "is_read" | "created_at">;

// ---------------------------------------------------------------------------
// Update types (all fields optional; immutable fields excluded)
// ---------------------------------------------------------------------------

/** gender and date_of_birth are immutable; excluded from update type. */
export type ProfileUpdate = Partial<
  Omit<Profile, "id" | "gender" | "date_of_birth" | "created_at">
>;

export type PartnerPreferenceUpdate = Partial<
  Omit<PartnerPreference, "profile_id" | "created_at">
>;

// ---------------------------------------------------------------------------
// Database type (used to parameterise the Supabase client)
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      partner_preferences: {
        Row: PartnerPreference;
        Insert: PartnerPreferenceInsert;
        Update: PartnerPreferenceUpdate;
      };
      chats: {
        Row: Chat;
        Insert: ChatInsert;
        Update: Record<string, never>;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: Partial<Pick<Message, "is_read">>;
      };
    };
    Enums: {
      gender_type: GenderType;
      marital_status_type: MaritalStatusType;
      skin_color_type: SkinColorType;
      education_type: EducationType;
      religious_commitment_type: ReligiousCommitmentType;
      hijab_status_type: HijabStatusType;
    };
  };
};
