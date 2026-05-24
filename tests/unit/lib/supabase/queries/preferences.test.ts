import { getPreferencesByProfileId } from "@/lib/supabase/queries/preferences";
import type { PartnerPreference } from "@/types/supabase";

const prefsFixture: PartnerPreference = {
  profile_id: "user-1",
  min_age: 25,
  max_age: 35,
  min_height_cm: 160,
  accepted_marital_statuses: ["single", "divorced"],
  accepted_education_levels: ["bachelor", "master"],
  partner_description: "Kind and caring",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

function buildMockClient(result: { data: unknown; error: null | Error }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };
  return { from: jest.fn().mockReturnValue(chain) };
}

describe("getPreferencesByProfileId()", () => {
  it("returns preferences when found", async () => {
    const mock = buildMockClient({ data: prefsFixture, error: null });
    const result = await getPreferencesByProfileId(
      mock as unknown as Parameters<typeof getPreferencesByProfileId>[0],
      "user-1"
    );
    expect(result).toEqual(prefsFixture);
    expect(mock.from).toHaveBeenCalledWith("partner_preferences");
  });

  it("returns null when no preferences set", async () => {
    const mock = buildMockClient({ data: null, error: null });
    const result = await getPreferencesByProfileId(
      mock as unknown as Parameters<typeof getPreferencesByProfileId>[0],
      "user-1"
    );
    expect(result).toBeNull();
  });

  it("throws on Supabase error", async () => {
    const mock = buildMockClient({ data: null, error: new Error("DB error") });
    await expect(
      getPreferencesByProfileId(
        mock as unknown as Parameters<typeof getPreferencesByProfileId>[0],
        "user-1"
      )
    ).rejects.toThrow("DB error");
  });
});
