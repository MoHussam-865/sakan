/**
 * Calculates the integer age (in years) from a date-of-birth ISO string
 * (e.g. "1990-05-24").
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Converts a preferred age range into a date-of-birth range suitable for
 * Supabase `.gte()` / `.lte()` date queries.
 *
 * Logic:
 *   – maxDob: latest DOB where age >= minAge  → today minus minAge years
 *   – minDob: earliest DOB where age <= maxAge → today minus (maxAge + 1) years + 1 day
 *
 * @returns ISO date strings ("YYYY-MM-DD").
 */
export function dobRangeFromAgeRange(
  minAge: number,
  maxAge: number
): { minDob: string; maxDob: string } {
  const today = new Date();

  const maxDobDate = new Date(today);
  maxDobDate.setFullYear(today.getFullYear() - minAge);

  const minDobDate = new Date(today);
  minDobDate.setFullYear(today.getFullYear() - maxAge - 1);
  minDobDate.setDate(minDobDate.getDate() + 1);

  return {
    minDob: minDobDate.toISOString().slice(0, 10),
    maxDob: maxDobDate.toISOString().slice(0, 10),
  };
}
