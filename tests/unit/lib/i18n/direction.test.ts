import { getLocaleDir } from "@/lib/i18n/direction";

describe("getLocaleDir()", () => {
  it("returns 'rtl' for Arabic", () => {
    expect(getLocaleDir("ar")).toBe("rtl");
  });

  it("returns 'ltr' for English", () => {
    expect(getLocaleDir("en")).toBe("ltr");
  });

  it("returns 'ltr' for an unrecognised locale", () => {
    expect(getLocaleDir("fr")).toBe("ltr");
  });

  it("returns 'ltr' for an empty string", () => {
    expect(getLocaleDir("")).toBe("ltr");
  });
});
