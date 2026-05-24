import {
  saveOnboardingStep1,
  saveOnboardingStep2,
  saveOnboardingStep3,
  saveOnboardingStep4,
} from "@/actions/onboarding";

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

const step1Data = {
  name: "Ali Al-Mansouri",
  gender: "male" as const,
  date_of_birth: "1990-06-15",
  nationality: "Saudi",
  country: "Saudi Arabia",
  city: "Riyadh",
};

const step2Data = {
  height_cm: 175,
  weight_kg: 72,
  skin_color: "wheatish" as const,
  health_status: "Good",
  smoking_status: "None",
};

const step3Data = {
  marital_status: "single" as const,
  has_children: false,
  education_level: "bachelor" as const,
  job_title: "Engineer",
  religious_commitment: "practicing" as const,
};

const step4Data = {
  about_me: "I enjoy reading",
  partner_description: "Kind and caring",
  min_age: 24,
  max_age: 32,
  accepted_marital_statuses: ["single"] as ("single" | "divorced" | "widowed")[],
  accepted_education_levels: ["bachelor"] as (
    | "high_school"
    | "bachelor"
    | "master"
    | "phd"
  )[],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildChain(result: { data: unknown; error: null | { message: string } }) {
  const chain = {
    upsert: jest.fn().mockResolvedValue(result),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue(result),
  };
  return chain;
}

// ---------------------------------------------------------------------------
// saveOnboardingStep1
// ---------------------------------------------------------------------------

describe("saveOnboardingStep1()", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    const chain = buildChain({ data: null, error: null });
    mockFrom.mockReturnValue(chain);
  });

  afterEach(() => jest.clearAllMocks());

  it("returns success when Supabase upsert succeeds", async () => {
    const result = await saveOnboardingStep1(step1Data);
    expect(result.success).toBe(true);
  });

  it("returns auth_required when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await saveOnboardingStep1(step1Data);
    expect(result.error).toBe("auth_required");
  });

  it("returns save_failed when Supabase returns an error", async () => {
    const chain = buildChain({ data: null, error: { message: "DB error" } });
    mockFrom.mockReturnValue(chain);
    const result = await saveOnboardingStep1(step1Data);
    expect(result.error).toBe("save_failed");
  });

  it("returns a validation error key when data is invalid", async () => {
    const result = await saveOnboardingStep1({
      ...step1Data,
      name: "A", // Too short
    });
    expect(result.error).toBe("name_required");
    expect(result.success).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// saveOnboardingStep2
// ---------------------------------------------------------------------------

describe("saveOnboardingStep2()", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    const chain = buildChain({ data: null, error: null });
    mockFrom.mockReturnValue(chain);
  });

  afterEach(() => jest.clearAllMocks());

  it("returns success for valid data", async () => {
    const result = await saveOnboardingStep2(step2Data);
    expect(result.success).toBe(true);
  });

  it("returns success and skips update when all fields are undefined", async () => {
    const result = await saveOnboardingStep2({});
    expect(result.success).toBe(true);
    // from() should not have been called since no fields to update
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns auth_required when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await saveOnboardingStep2(step2Data);
    expect(result.error).toBe("auth_required");
  });
});

// ---------------------------------------------------------------------------
// saveOnboardingStep3
// ---------------------------------------------------------------------------

describe("saveOnboardingStep3()", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    const chain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
    mockFrom.mockReturnValue(chain);
  });

  afterEach(() => jest.clearAllMocks());

  it("returns success for valid data", async () => {
    const result = await saveOnboardingStep3(step3Data);
    expect(result.success).toBe(true);
  });

  it("returns children_count_required error when has_children is true but count is missing", async () => {
    const result = await saveOnboardingStep3({
      marital_status: "single",
      has_children: true,
    });
    expect(result.error).toBe("children_count_required");
  });

  it("returns auth_required when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await saveOnboardingStep3(step3Data);
    expect(result.error).toBe("auth_required");
  });
});

// ---------------------------------------------------------------------------
// saveOnboardingStep4
// ---------------------------------------------------------------------------

describe("saveOnboardingStep4()", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    const chain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
    mockFrom.mockReturnValue(chain);
  });

  afterEach(() => jest.clearAllMocks());

  it("redirects to dashboard on success", async () => {
    await expect(saveOnboardingStep4(step4Data)).rejects.toThrow(
      "REDIRECT:/en/dashboard"
    );
  });

  it("returns auth_required when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await saveOnboardingStep4(step4Data);
    expect(result.error).toBe("auth_required");
  });

  it("returns age_range_invalid when min_age > max_age", async () => {
    const result = await saveOnboardingStep4({
      ...step4Data,
      min_age: 40,
      max_age: 30,
    });
    expect(result.error).toBe("age_range_invalid");
  });

  it("returns save_failed when partner_preferences upsert fails", async () => {
    const chain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      upsert: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "DB error" } }),
    };
    mockFrom.mockReturnValue(chain);
    const result = await saveOnboardingStep4(step4Data);
    expect(result.error).toBe("save_failed");
  });
});
