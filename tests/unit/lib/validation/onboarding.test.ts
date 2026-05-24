import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "@/lib/validation/onboarding";

// ---------------------------------------------------------------------------
// Step 1 – Core Identity
// ---------------------------------------------------------------------------

describe("step1Schema", () => {
  const valid = {
    name: "Ali Al-Mansouri",
    gender: "male",
    date_of_birth: "1990-06-15",
    nationality: "Saudi",
    country: "Saudi Arabia",
    city: "Riyadh",
  } as const;

  it("accepts a complete valid payload", () => {
    expect(step1Schema.safeParse(valid).success).toBe(true);
  });

  it("trims name whitespace", () => {
    const result = step1Schema.safeParse({ ...valid, name: "  Ali  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Ali");
  });

  it("rejects a name shorter than 2 chars with name_required", () => {
    const result = step1Schema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain("name_required");
    }
  });

  it("rejects a name longer than 100 chars with name_too_long", () => {
    const result = step1Schema.safeParse({ ...valid, name: "a".repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain("name_too_long");
    }
  });

  it("rejects an invalid gender value", () => {
    const result = step1Schema.safeParse({ ...valid, gender: "other" });
    expect(result.success).toBe(false);
  });

  it("rejects a date not matching YYYY-MM-DD with dob_invalid", () => {
    const result = step1Schema.safeParse({
      ...valid,
      date_of_birth: "15/06/1990",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.date_of_birth).toContain(
        "dob_invalid"
      );
    }
  });

  it("rejects a user under 18 with dob_underage", () => {
    const today = new Date();
    const underageDob = new Date(
      today.getFullYear() - 17,
      today.getMonth(),
      today.getDate()
    )
      .toISOString()
      .slice(0, 10);
    const result = step1Schema.safeParse({ ...valid, date_of_birth: underageDob });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.date_of_birth).toContain(
        "dob_underage"
      );
    }
  });

  it("accepts a user exactly 18 years old", () => {
    const today = new Date();
    const eighteenthBirthday = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate() - 1
    )
      .toISOString()
      .slice(0, 10);
    expect(
      step1Schema.safeParse({ ...valid, date_of_birth: eighteenthBirthday })
        .success
    ).toBe(true);
  });

  it("rejects an empty nationality with nationality_required", () => {
    const result = step1Schema.safeParse({ ...valid, nationality: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.nationality).toContain(
        "nationality_required"
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Step 2 – Physical & Health
// ---------------------------------------------------------------------------

describe("step2Schema", () => {
  it("accepts an empty payload (all optional)", () => {
    expect(step2Schema.safeParse({}).success).toBe(true);
  });

  it("accepts valid height and weight", () => {
    const result = step2Schema.safeParse({ height_cm: 175, weight_kg: 70 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.height_cm).toBe(175);
      expect(result.data.weight_kg).toBe(70);
    }
  });

  it("converts NaN (empty number input) to undefined", () => {
    const result = step2Schema.safeParse({ height_cm: NaN });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.height_cm).toBeUndefined();
  });

  it("rejects height below 100 with height_invalid", () => {
    const result = step2Schema.safeParse({ height_cm: 50 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.height_cm).toContain(
        "height_invalid"
      );
    }
  });

  it("converts empty string to undefined for optional string fields", () => {
    const result = step2Schema.safeParse({ health_status: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.health_status).toBeUndefined();
  });

  it("accepts a valid skin_color enum value", () => {
    const result = step2Schema.safeParse({ skin_color: "wheatish" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid skin_color value", () => {
    const result = step2Schema.safeParse({ skin_color: "blue" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Step 3 – Background & Lifestyle
// ---------------------------------------------------------------------------

describe("step3Schema", () => {
  const valid = {
    marital_status: "single",
    has_children: false,
  } as const;

  it("accepts a minimal valid payload", () => {
    expect(step3Schema.safeParse(valid).success).toBe(true);
  });

  it("requires children_count when has_children is true", () => {
    const result = step3Schema.safeParse({ ...valid, has_children: true });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.children_count).toContain(
        "children_count_required"
      );
    }
  });

  it("accepts valid children details when has_children is true", () => {
    const result = step3Schema.safeParse({
      ...valid,
      has_children: true,
      children_count: 2,
      children_living_with_me: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid marital_status with marital_status_required", () => {
    const result = step3Schema.safeParse({
      ...valid,
      marital_status: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all optional lifestyle fields when provided", () => {
    const result = step3Schema.safeParse({
      ...valid,
      education_level: "bachelor",
      job_title: "Engineer",
      religious_commitment: "practicing",
      hijab_status: "hijab",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Step 4 – Preferences & Bios
// ---------------------------------------------------------------------------

describe("step4Schema", () => {
  it("accepts an empty payload (all optional)", () => {
    expect(step4Schema.safeParse({}).success).toBe(true);
  });

  it("accepts a full valid payload", () => {
    const result = step4Schema.safeParse({
      about_me: "I love reading",
      partner_description: "Kind and caring",
      min_age: 25,
      max_age: 35,
      accepted_marital_statuses: ["single", "divorced"],
      accepted_education_levels: ["bachelor", "master"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects max_age less than min_age with age_range_invalid", () => {
    const result = step4Schema.safeParse({ min_age: 35, max_age: 25 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.max_age).toContain(
        "age_range_invalid"
      );
    }
  });

  it("rejects age below 18 with min_age_invalid", () => {
    const result = step4Schema.safeParse({ min_age: 16 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.min_age).toContain(
        "min_age_invalid"
      );
    }
  });

  it("converts NaN to undefined for optional age fields", () => {
    const result = step4Schema.safeParse({ min_age: NaN, max_age: NaN });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.min_age).toBeUndefined();
      expect(result.data.max_age).toBeUndefined();
    }
  });

  it("accepts an empty array for checkbox groups", () => {
    const result = step4Schema.safeParse({
      accepted_marital_statuses: [],
      accepted_education_levels: [],
    });
    expect(result.success).toBe(true);
  });

  it("converts empty string to undefined for text areas", () => {
    const result = step4Schema.safeParse({ about_me: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.about_me).toBeUndefined();
  });
});
