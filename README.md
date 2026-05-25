# 💍 Sakan (سكن) - Premium Matchmaking Platform

Sakan is a sophisticated, minimalist matchmaking web application designed to facilitate serious relationships and marriages. Built with a focus on privacy, data integrity, and premium user experience, the platform utilizes strict matching algorithms and real-time communication.

## 🛠 Tech Stack
* **Frontend:** Next.js (App Router), React, TypeScript
* **Styling:** Tailwind CSS (Premium Minimalist UI)
* **Backend & Database:** Supabase (PostgreSQL)
* **Authentication:** Supabase Auth (OTP Magic Links)
* **Real-time:** Supabase Realtime (WebSockets)

---

## ✨ Core Functionality
1. **Frictionless Authentication:** Passwordless login using 6-digit email OTPs.
2. **Deep Profiling:** Comprehensive multi-step onboarding capturing cultural, physical, and lifestyle data.
3. **Strict Match Filters:** Database-level querying based on strict user preferences (age, education, marital status).
4. **Real-time Messaging:** In-app private chat rooms with live message delivery.
5. **Privacy First:** Row Level Security (RLS) ensures users only see active profiles of the opposite gender and only access their own private chats.

---

## 🗺️ App Flow

### 1. Authentication
* User enters their email address.
* Supabase sends a custom-styled 6-digit OTP.
* If the user is returning, they are routed to the Match Dashboard.
* If the user is new, they are routed to the Onboarding Wizard.

### 2. Multi-Step Onboarding Wizard
To prevent drop-offs, data collection is split into 4 digestible steps:
* **Step 1 (Core Identity):** Name, Gender, Date of Birth, Nationality, Location.
* **Step 2 (Physical & Health):** Height, Weight, Skin Color, Health, Smoking Status.
* **Step 3 (Background & Lifestyle):** Education, Job, Marital Status (with children logic), Religious Commitment, Appearance (Hijab/Beard).
* **Step 4 (Preferences):** Free-text bios ("About Me", "Partner Description") and strict algorithm filters (Acceptable Age Range, Marital Statuses, Education).

### 3. Match Dashboard & Chat
* Users view a feed of profiles matching their strict preferences (filtered by opposite gender via RLS).
* Users can view full profile details.
* Users can initiate a secure, real-time chat session with a match.

---

## 🗄️ Database Schema & RLS

Execute the following SQL script in your Supabase SQL Editor to instantly generate the backend architecture.

### 1. Custom Enums
```sql
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE marital_status_type AS ENUM ('single', 'divorced', 'widowed');
CREATE TYPE skin_color_type AS ENUM ('white', 'wheatish', 'brown', 'dark');
CREATE TYPE education_type AS ENUM ('high_school', 'bachelor', 'master', 'phd');
CREATE TYPE religious_commitment_type AS ENUM ('practicing', 'moderate', 'not_practicing');
CREATE TYPE hijab_status_type AS ENUM ('none', 'hijab', 'niqab');
2. Tables
SQL
-- PROFILES TABLE
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    gender gender_type NOT NULL,
    date_of_birth DATE NOT NULL,
    nationality TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    skin_color skin_color_type,
    education_level education_type,
    job_title TEXT,
    marital_status marital_status_type NOT NULL,
    has_children BOOLEAN DEFAULT false,
    children_count INT DEFAULT 0,
    children_living_with_me BOOLEAN DEFAULT false,
    religious_commitment religious_commitment_type,
    hijab_status hijab_status_type,
    beard_status TEXT,
    smoking_status TEXT,
    health_status TEXT,
    about_me TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PARTNER PREFERENCES TABLE
CREATE TABLE partner_preferences (
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    min_age INT,
    max_age INT,
    min_height_cm NUMERIC(5,2),
    accepted_marital_statuses marital_status_type[],
    accepted_education_levels education_type[],
    partner_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CHATS TABLE
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user1_id, user2_id)
);

-- MESSAGES TABLE
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
3. Row Level Security (RLS) Policies
SQL
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profile Access
CREATE POLICY "Users can view opposite gender active profiles"
ON profiles FOR SELECT USING (deleted_at IS NULL AND gender != (SELECT gender FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Chat Access
CREATE POLICY "Users can view their own chats"
ON chats FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chats"
ON chats FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Message Access
CREATE POLICY "Users can view messages in their chats"
ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid()))
);

CREATE POLICY "Users can insert messages in their chats"
ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid()))
);