import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import type { PartnerPreference, Profile } from "@/types/supabase";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Use var to avoid TDZ errors when jest.mock factory is hoisted
// eslint-disable-next-line no-var
var mockFinalizeOnboarding: jest.Mock;

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const map: Record<string, string> = {
      title: "Complete your profile",
      subtitle: "Tell us about yourself",
      step_of: `Step ${params?.current ?? 1} of ${params?.total ?? 4}`,
      progress_label: "Onboarding progress",
      step1_title: "Core Identity",
      step2_title: "Physical & Health",
      step3_title: "Background & Lifestyle",
      step4_title: "Preferences",
      name_label: "Full name",
      name_placeholder: "Ali Al-Mansouri",
      gender_label: "Gender",
      dob_label: "Date of birth",
      nationality_label: "Nationality",
      nationality_placeholder: "Saudi Arabian",
      country_label: "Country",
      country_placeholder: "Saudi Arabia",
      city_label: "City",
      city_placeholder: "Riyadh",
      height_label: "Height (cm)",
      height_placeholder: "175",
      weight_label: "Weight (kg)",
      weight_placeholder: "70",
      skin_color_label: "Skin color",
      health_label: "Health status",
      health_placeholder: "Good",
      smoking_label: "Smoking status",
      smoking_placeholder: "Non-smoker",
      education_label: "Education level",
      job_label: "Job title",
      job_placeholder: "Software Engineer",
      marital_status_label: "Marital status",
      has_children_label: "Do you have children?",
      children_count_label: "How many children?",
      children_count_placeholder: "2",
      children_living_label: "Children living with you?",
      religious_commitment_label: "Religious commitment",
      hijab_label: "Hijab status",
      beard_label: "Beard",
      beard_placeholder: "Full beard",
      about_me_label: "About me",
      about_me_placeholder: "Tell matches about yourself...",
      min_age_placeholder: "25",
      max_age_placeholder: "35",
      min_age_label: "Minimum age",
      max_age_label: "Maximum age",
      accepted_marital_statuses_label: "Accepted marital statuses",
      accepted_education_levels_label: "Accepted education levels",
      partner_description_label: "Partner description",
      partner_description_placeholder: "Describe your ideal partner...",
      name_required: "Full name is required",
      gender_required: "Please select your gender",
      dob_required: "Date of birth is required",
      dob_invalid: "Enter a valid date",
      dob_underage: "You must be at least 18 years old",
      nationality_required: "Nationality is required",
      country_required: "Country is required",
      city_required: "City is required",
      save_failed: "Failed to save. Please try again.",
      auth_required: "Please sign in to continue.",
      next: "Next",
      back: "Back",
      submit: "Submit",
    };
    return map[key] ?? key;
  },
}));

jest.mock("@/actions/onboarding", () => ({
  finalizeOnboarding: (...args: any[]) => mockFinalizeOnboarding(...args),
}));

jest.mock("@/lib/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const profileFixture: Profile = {
  id: "user-1",
  name: "Ali",
  gender: "male",
  date_of_birth: "1990-01-01",
  nationality: "Saudi",
  country: "Saudi Arabia",
  city: "Riyadh",
  height_cm: null,
  weight_kg: null,
  skin_color: null,
  education_level: null,
  job_title: null,
  marital_status: "single",
  has_children: false,
  children_count: 0,
  children_living_with_me: false,
  religious_commitment: null,
  hijab_status: null,
  beard_status: null,
  smoking_status: null,
  health_status: null,
  about_me: null,
  deleted_at: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  user_id: null,
};

const preferencesFixture: PartnerPreference = {
  profile_id: "user-1",
  min_age: 25,
  max_age: 35,
  min_height_cm: null,
  accepted_marital_statuses: ["single"],
  accepted_education_levels: ["bachelor"],
  partner_description: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

beforeEach(() => {
  mockFinalizeOnboarding = jest.fn();
});

async function fillRequiredStep1(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/full name/i), "Ali Al-Mansouri");
  await user.click(screen.getByDisplayValue("male"));
  await user.type(screen.getByLabelText(/date of birth/i), "1990-06-15");
  await user.type(screen.getByLabelText(/nationality/i), "Saudi");
  await user.type(screen.getByLabelText(/country/i), "Saudi Arabia");
  await user.type(screen.getByLabelText(/city/i), "Riyadh");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("OnboardingWizard", () => {
  it("starts at step 1 when no profile exists", () => {
    render(<OnboardingWizard existingProfile={null} existingPreferences={null} />);
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Core Identity")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /full name/i })).toBeInTheDocument();
  });

  it("starts at step 4 when profile exists but no preferences", () => {
    render(
      <OnboardingWizard existingProfile={profileFixture} existingPreferences={null} />
    );
    expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
    expect(screen.getByText("Preferences")).toBeInTheDocument();
  });

  it("starts at step 1 when both profile and preferences exist (unusual path)", () => {
    render(
      <OnboardingWizard
        existingProfile={profileFixture}
        existingPreferences={preferencesFixture}
      />
    );
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
  });

  it("renders the step progress bar", () => {
    render(<OnboardingWizard existingProfile={null} existingPreferences={null} />);
    expect(
      screen.getByRole("navigation", { name: "Onboarding progress" })
    ).toBeInTheDocument();
  });

  it("shows step 1 form with required fields", () => {
    render(<OnboardingWizard existingProfile={null} existingPreferences={null} />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nationality/i)).toBeInTheDocument();
  });

  it("advances to step 2 locally without calling finalize action", async () => {
    render(<OnboardingWizard existingProfile={null} existingPreferences={null} />);

    const user = userEvent.setup();
    await fillRequiredStep1(user);
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(await screen.findByText("Step 2 of 4")).toBeInTheDocument();
    expect(mockFinalizeOnboarding).not.toHaveBeenCalled();
  });

  it("goes back to step 1 from step 2", async () => {
    render(<OnboardingWizard existingProfile={null} existingPreferences={null} />);

    const user = userEvent.setup();
    await fillRequiredStep1(user);
    await user.click(screen.getByRole("button", { name: /next/i }));

    await screen.findByText("Step 2 of 4");

    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
  });
});