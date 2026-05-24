import { calculateAge, dobRangeFromAgeRange } from "@/lib/utils/matches";

// Fix the current date for deterministic test results.
const FIXED_DATE = new Date("2026-05-24T12:00:00Z");

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(FIXED_DATE);
});

afterAll(() => {
  jest.useRealTimers();
});

// ── calculateAge ────────────────────────────────────────────────────────────

describe("calculateAge()", () => {
  it("returns the correct age when birthday has passed this year", () => {
    // Born 2001-01-10; birthday already passed in 2026
    expect(calculateAge("2001-01-10")).toBe(25);
  });

  it("returns the correct age when birthday is today", () => {
    // Born 1990-05-24; turns 36 exactly today (2026-05-24)
    expect(calculateAge("1990-05-24")).toBe(36);
  });

  it("returns the correct age when birthday is tomorrow (not yet happened)", () => {
    // Born 1990-05-25; hasn't turned 36 yet
    expect(calculateAge("1990-05-25")).toBe(35);
  });

  it("returns the correct age when birthday is in a future month this year", () => {
    // Born 1995-12-01; birthday in December, not yet
    expect(calculateAge("1995-12-01")).toBe(30);
  });

  it("handles leap-year dates correctly", () => {
    // Born 1996-02-29 – non-leap year 2026, last birthday was 2026-02-28 or 03-01
    // In 2026 (non-leap), they are still 29 years old on May 24
    expect(calculateAge("1996-02-29")).toBe(30);
  });
});

// ── dobRangeFromAgeRange ────────────────────────────────────────────────────

describe("dobRangeFromAgeRange()", () => {
  it("returns ISO date strings", () => {
    const { minDob, maxDob } = dobRangeFromAgeRange(25, 40);
    expect(minDob).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(maxDob).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("maxDob is today minus minAge years (inclusive lower age bound)", () => {
    // With FIXED_DATE = 2026-05-24 and minAge = 25
    // maxDob should be 2001-05-24 (someone born that day is exactly 25)
    const { maxDob } = dobRangeFromAgeRange(25, 40);
    expect(maxDob).toBe("2001-05-24");
  });

  it("minDob excludes people who just turned maxAge + 1", () => {
    // With FIXED_DATE = 2026-05-24 and maxAge = 40
    // Someone born 1985-05-24 would be exactly 41 today → must be excluded
    // minDob should be 1985-05-25 (the day after they'd turn 41)
    const { minDob } = dobRangeFromAgeRange(25, 40);
    expect(minDob).toBe("1985-05-25");
  });

  it("minDob <= maxDob for a valid age range", () => {
    const { minDob, maxDob } = dobRangeFromAgeRange(18, 60);
    expect(minDob < maxDob).toBe(true);
  });

  it("symmetric: minAge equal to maxAge yields a narrow range", () => {
    // Only people who are exactly 30 years old
    const { minDob, maxDob } = dobRangeFromAgeRange(30, 30);
    // maxDob: born 1996-05-24 = exactly 30
    expect(maxDob).toBe("1996-05-24");
    // minDob: born 1995-05-25 (day after turning 31)
    expect(minDob).toBe("1995-05-25");
  });
});
