-- =============================================================================
-- Migration: 001_initial_schema
-- Description: Full initial schema for Sakan matchmaking platform.
--              Includes custom enums, all tables, and RLS policies.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Custom Enum Types
-- ---------------------------------------------------------------------------

CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE marital_status_type AS ENUM ('single', 'divorced', 'widowed');
CREATE TYPE skin_color_type AS ENUM ('white', 'wheatish', 'brown', 'dark');
CREATE TYPE education_type AS ENUM ('high_school', 'bachelor', 'master', 'phd');
CREATE TYPE religious_commitment_type AS ENUM ('practicing', 'moderate', 'not_practicing');
CREATE TYPE hijab_status_type AS ENUM ('none', 'hijab', 'niqab');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- PROFILES TABLE
-- One row per authenticated user. Linked to auth.users via id.
-- gender and date_of_birth are immutable after creation (enforced in app layer).
CREATE TABLE profiles (
    id                      UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name                    TEXT NOT NULL,
    gender                  gender_type NOT NULL,
    date_of_birth           DATE NOT NULL,
    nationality             TEXT NOT NULL,
    country                 TEXT NOT NULL,
    city                    TEXT NOT NULL,
    height_cm               NUMERIC(5,2),
    weight_kg               NUMERIC(5,2),
    skin_color              skin_color_type,
    education_level         education_type,
    job_title               TEXT,
    marital_status          marital_status_type NOT NULL,
    has_children            BOOLEAN DEFAULT false,
    children_count          INT DEFAULT 0,
    children_living_with_me BOOLEAN DEFAULT false,
    religious_commitment    religious_commitment_type,
    hijab_status            hijab_status_type,
    beard_status            TEXT,
    smoking_status          TEXT,
    health_status           TEXT,
    about_me                TEXT,
    deleted_at              TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PARTNER PREFERENCES TABLE
-- One row per profile (1-to-1). Stores the match filter criteria.
CREATE TABLE partner_preferences (
    profile_id                  UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    min_age                     INT,
    max_age                     INT,
    min_height_cm               NUMERIC(5,2),
    accepted_marital_statuses   marital_status_type[],
    accepted_education_levels   education_type[],
    partner_description         TEXT,
    created_at                  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at                  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CHATS TABLE
-- A private chat room between two profiles. UNIQUE constraint prevents duplicate rooms.
CREATE TABLE chats (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    user2_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user1_id, user2_id)
);

-- MESSAGES TABLE
-- Individual messages within a chat room.
CREATE TABLE messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id     UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    sender_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content     TEXT NOT NULL,
    is_read     BOOLEAN DEFAULT false,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- ---------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profile visibility: only active (non-deleted) profiles of the opposite gender.
CREATE POLICY "Users can view opposite gender active profiles"
ON profiles FOR SELECT
USING (
    deleted_at IS NULL
    AND gender != (SELECT gender FROM profiles WHERE id = auth.uid())
);

-- Profile write policies: users manage only their own row.
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Partner preferences: users can only read/write their own preferences.
CREATE POLICY "Users can view own partner preferences"
ON partner_preferences FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own partner preferences"
ON partner_preferences FOR INSERT
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own partner preferences"
ON partner_preferences FOR UPDATE
USING (auth.uid() = profile_id);

-- Chat access: both participants can view and create.
CREATE POLICY "Users can view their own chats"
ON chats FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chats"
ON chats FOR INSERT
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Message access: scoped to chats the user participates in.
CREATE POLICY "Users can view messages in their chats"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM chats
        WHERE chats.id = messages.chat_id
          AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
    )
);

CREATE POLICY "Users can insert messages in their chats"
ON messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM chats
        WHERE chats.id = messages.chat_id
          AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
    )
);

-- ---------------------------------------------------------------------------
-- Helper: auto-update updated_at on profiles and partner_preferences
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER on_partner_preferences_updated
    BEFORE UPDATE ON partner_preferences
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
