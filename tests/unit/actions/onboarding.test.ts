import { finalizeOnboarding } from "@/actions/onboarding";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("next-intl/server", () => ({
  getLocale: jest.fn().mockResolvedValue("en"),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
// Use var to avoid TDZ errors when jest.mock factory is hoisted
// eslint-disable-next-line no-var
var mockFrom: jest.Mock;
// eslint-disable-next-line no-var
var mockGetUser: jest.Mock;

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockImplementation(async () => ({
    auth: { getUser: (...args: any[]) => mockGetUser(...args) },
    from: (...args: any[]) => mockFrom(...args),
  })),
}));

beforeEach(() => {
  mockFrom = jest.fn();
  mockGetUser = jest.fn();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const USER = { id: "user-123" };

const fullData = {
  name: "Ali Al-Mansouri",
  gender: "male" as const,
  date_of_birth: "1990-06-15",
  nationality: "Saudi",
  country: "Saudi Arabia",
  city: "Riyadh",
  height_cm: 175,
  weight_kg: 72,
  skin_color: "wheatish" as const,
  health_status: "Good",
  smoking_status: "None",
  education_level: "bachelor" as const,
  job_title: "Engineer",
  marital_status: "single" as const,
  has_children: false,
  religious_commitment: "practicing" as const,
  beard_status: "Full beard",
  about_me: "I enjoy reading",
  partner_description: "Kind and caring",
  min_age: 24,
  max_age: 32,
  accepted_marital_statuses: ["single"] as (
    | "single"
    | "divorced"
    | "widowed"
  )[],
  accepted_education_levels: ["bachelor"] as (
    | "high_school"
    | "bachelor"
    | "master"
    | "phd"
  )[],
};

function buildUpsertChain(result: {
  data: unknown;
  error: null | { message: string };
}) {
  return {
    upsert: jest.fn().mockResolvedValue(result),
  };
}

describe("finalizeOnboarding()", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });

    const profilesChain = buildUpsertChain({ data: null, error: null });
    const preferencesChain = buildUpsertChain({ data: null, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return profilesChain;
      if (table === "partner_preferences") return preferencesChain;
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  afterEach(() => jest.clearAllMocks());

  it("redirects to dashboard on success", async () => {
    await expect(finalizeOnboarding(fullData)).rejects.toThrow(
      "REDIRECT:/en/dashboard"
    );
  });

  it("returns auth_required when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await finalizeOnboarding(fullData);
    expect(result.error).toBe("auth_required");
  });

  it("returns name_required when payload is invalid", async () => {
    const result = await finalizeOnboarding({ ...fullData, name: "A" });
    expect(result.error).toBe("name_required");
  });

  it("returns children_count_required when has_children is true but children_count is missing", async () => {
    const result = await finalizeOnboarding({
      ...fullData,
      has_children: true,
      children_count: undefined,
    });
    expect(result.error).toBe("children_count_required");
  });

  it("returns age_range_invalid when min_age is greater than max_age", async () => {
    const result = await finalizeOnboarding({
      ...fullData,
      min_age: 40,
      max_age: 30,
    });
    expect(result.error).toBe("age_range_invalid");
  });

  it("returns save_failed and logs error when profile upsert fails", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const profilesChain = buildUpsertChain({
      data: null,
      error: { message: "DB error" },
    });
    const preferencesChain = buildUpsertChain({ data: null, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return profilesChain;
      if (table === "partner_preferences") return preferencesChain;
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await finalizeOnboarding(fullData);
    expect(result.error).toBe("save_failed");
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it("returns save_failed and logs error when partner preferences upsert fails", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const profilesChain = buildUpsertChain({ data: null, error: null });
    const preferencesChain = buildUpsertChain({
      data: null,
      error: { message: "DB error" },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return profilesChain;
      if (table === "partner_preferences") return preferencesChain;
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await finalizeOnboarding(fullData);
    expect(result.error).toBe("save_failed");
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});