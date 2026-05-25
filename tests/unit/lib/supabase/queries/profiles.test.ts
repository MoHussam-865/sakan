import { getProfileById, getMatches } from "@/lib/supabase/queries/profiles";
import type { Profile } from "@/types/supabase";

// Minimal profile fixture used across tests.
const profileFixture: Profile = {
  id: "user-1",
  name: "Test User",
  gender: "male",
  date_of_birth: "1990-01-15",
  nationality: "Saudi",
  country: "SA",
  city: "Riyadh",
  height_cm: 175,
  weight_kg: 75,
  skin_color: "wheatish",
  education_level: "bachelor",
  job_title: "Engineer",
  marital_status: "single",
  has_children: false,
  children_count: 0,
  children_living_with_me: false,
  religious_commitment: "practicing",
  hijab_status: null,
  beard_status: null,
  smoking_status: "no",
  health_status: "good",
  about_me: null,
  deleted_at: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  user_id: null,
};

/** Builds a minimal Supabase client mock for a given chain result. */
function buildMockClient(result: { data: unknown; error: null | Error }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue(result),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };
  return {
    from: jest.fn().mockReturnValue(chain),
    _chain: chain,
  };
}

describe("getProfileById()", () => {
  it("returns the profile when found", async () => {
    const mock = buildMockClient({ data: profileFixture, error: null });
    const result = await getProfileById(
      mock as unknown as Parameters<typeof getProfileById>[0],
      "user-1"
    );
    expect(result).toEqual(profileFixture);
    expect(mock.from).toHaveBeenCalledWith("profiles");
  });

  it("returns null when the profile does not exist", async () => {
    const mock = buildMockClient({ data: null, error: null });
    const result = await getProfileById(
      mock as unknown as Parameters<typeof getProfileById>[0],
      "nonexistent"
    );
    expect(result).toBeNull();
  });

  it("throws when Supabase returns an error", async () => {
    const dbError = new Error("DB error");
    const mock = buildMockClient({ data: null, error: dbError });
    await expect(
      getProfileById(
        mock as unknown as Parameters<typeof getProfileById>[0],
        "user-1"
      )
    ).rejects.toThrow("DB error");
  });
});

const baseFilters = {
  minAge: 25,
  maxAge: 40,
  acceptedMaritalStatuses: null,
  acceptedEducationLevels: null,
} as const;

describe("getMatches()", () => {
  it("returns an array of matching profiles", async () => {
    const mock = buildMockClient({ data: [profileFixture], error: null });
    const result = await getMatches(
      mock as unknown as Parameters<typeof getMatches>[0],
      baseFilters
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("user-1");
  });

  it("returns an empty array when no matches exist", async () => {
    const mock = buildMockClient({ data: null, error: null });
    const result = await getMatches(
      mock as unknown as Parameters<typeof getMatches>[0],
      baseFilters
    );
    expect(result).toEqual([]);
  });

  it("throws when Supabase returns an error", async () => {
    const dbError = new Error("Query failed");
    const mock = buildMockClient({ data: null, error: dbError });
    await expect(
      getMatches(
        mock as unknown as Parameters<typeof getMatches>[0],
        baseFilters
      )
    ).rejects.toThrow("Query failed");
  });

  it("applies marital status filter when provided", async () => {
    const mock = buildMockClient({ data: [profileFixture], error: null });
    await getMatches(
      mock as unknown as Parameters<typeof getMatches>[0],
      { ...baseFilters, acceptedMaritalStatuses: ["single"] }
    );
    expect(mock._chain.in).toHaveBeenCalledWith("marital_status", ["single"]);
  });

  it("applies education level filter when provided", async () => {
    const mock = buildMockClient({ data: [profileFixture], error: null });
    await getMatches(
      mock as unknown as Parameters<typeof getMatches>[0],
      { ...baseFilters, acceptedEducationLevels: ["bachelor", "master"] }
    );
    expect(mock._chain.in).toHaveBeenCalledWith("education_level", [
      "bachelor",
      "master",
    ]);
  });

  it("skips age filter when minAge or maxAge is null", async () => {
    const mock = buildMockClient({ data: [], error: null });
    await getMatches(
      mock as unknown as Parameters<typeof getMatches>[0],
      { minAge: null, maxAge: null, acceptedMaritalStatuses: null, acceptedEducationLevels: null }
    );
    expect(mock._chain.gte).not.toHaveBeenCalled();
    expect(mock._chain.lte).not.toHaveBeenCalled();
  });
});
