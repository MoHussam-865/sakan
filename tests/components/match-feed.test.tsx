import { render, screen } from "@testing-library/react";
import MatchCard from "@/components/matches/MatchCard";
import MatchEmptyState from "@/components/matches/MatchEmptyState";
import type { Profile } from "@/types/supabase";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("next-intl", () => ({
  useTranslations: (ns?: string) => (key: string, params?: Record<string, unknown>) => {
    const fullKey = ns ? `${ns}.${key}` : key;
    const map: Record<string, string> = {
      "profile.age": `${params?.age ?? 0} years old`,
      "dashboard.view_profile": "View profile",
      "dashboard.no_matches": "No matches found",
      "dashboard.no_matches_hint": "Update your preferences to see more matches",
      "enums.education.bachelor": "Bachelor's degree",
      "enums.education.master": "Master's degree",
      "enums.marital_status.single": "Single",
    };
    return map[fullKey] ?? fullKey;
  },
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [k: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => "/dashboard",
}));

jest.mock("@/lib/utils/cn", () => ({
  cn: (...args: unknown[]) =>
    args
      .filter((a) => typeof a === "string" && a)
      .join(" "),
}));

jest.mock("@/lib/utils/matches", () => ({
  calculateAge: jest.fn().mockReturnValue(30),
}));

// ── Fixture ────────────────────────────────────────────────────────────────

const profile: Profile = {
  id: "profile-abc",
  name: "Sara Ahmed",
  gender: "female",
  date_of_birth: "1996-01-01",
  nationality: "Saudi",
  country: "SA",
  city: "Riyadh",
  height_cm: 165,
  weight_kg: 60,
  skin_color: "wheatish",
  education_level: "bachelor",
  job_title: "Doctor",
  marital_status: "single",
  has_children: false,
  children_count: 0,
  children_living_with_me: false,
  religious_commitment: "practicing",
  hijab_status: "hijab",
  beard_status: null,
  smoking_status: "no",
  health_status: "good",
  about_me: "Looking for a kind partner.",
  deleted_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  user_id: null,
};

// ── MatchCard ──────────────────────────────────────────────────────────────

describe("MatchCard", () => {
  it("renders the profile name", () => {
    render(<MatchCard profile={profile} />);
    expect(screen.getByText("Sara Ahmed")).toBeInTheDocument();
  });

  it("renders the calculated age", () => {
    render(<MatchCard profile={profile} />);
    expect(screen.getByText("30 years old")).toBeInTheDocument();
  });

  it("renders the profile city", () => {
    render(<MatchCard profile={profile} />);
    expect(screen.getByText("Riyadh")).toBeInTheDocument();
  });

  it("renders localized education level", () => {
    render(<MatchCard profile={profile} />);
    expect(screen.getByText("Bachelor's degree")).toBeInTheDocument();
  });

  it("renders the view-profile CTA text", () => {
    render(<MatchCard profile={profile} />);
    expect(screen.getByText(/View profile/)).toBeInTheDocument();
  });

  it("links to the correct profile detail URL", () => {
    render(<MatchCard profile={profile} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/profile/profile-abc");
  });

  it("does not render city when absent", () => {
    const noCity = { ...profile, city: "" };
    render(<MatchCard profile={noCity} />);
    expect(screen.queryByText("Riyadh")).not.toBeInTheDocument();
  });

  it("does not render education when absent", () => {
    const noEdu = { ...profile, education_level: null };
    render(<MatchCard profile={noEdu} />);
    expect(screen.queryByText("Bachelor's degree")).not.toBeInTheDocument();
  });
});

// ── MatchEmptyState ────────────────────────────────────────────────────────

describe("MatchEmptyState", () => {
  it("renders the no-matches heading", () => {
    render(<MatchEmptyState />);
    expect(screen.getByText("No matches found")).toBeInTheDocument();
  });

  it("renders the hint text", () => {
    render(<MatchEmptyState />);
    expect(
      screen.getByText("Update your preferences to see more matches")
    ).toBeInTheDocument();
  });
});
