import LocaleLayout from "@/app/[locale]/layout";

// Mock next/font/google – not available in the jest (Node.js) environment.
jest.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
}));

// Mock next-intl server utilities.
jest.mock("next-intl/server", () => ({
  getMessages: jest.fn().mockResolvedValue({ common: { app_name: "Sakan" } }),
}));

// Mock next-intl client – NextIntlClientProvider is a pass-through in tests.
jest.mock("next-intl", () => ({
  hasLocale: (locales: string[], locale: string) => locales.includes(locale),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock next/navigation.
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// Mock the routing config.
jest.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "ar"], defaultLocale: "en" },
}));

type HTMLElementProps = { lang: string; dir: string; [k: string]: unknown };

describe("LocaleLayout", () => {
  it("sets lang='en' and dir='ltr' for the English locale", async () => {
    const output = await LocaleLayout({
      children: <span>content</span>,
      params: Promise.resolve({ locale: "en" }),
    });
    const el = output as React.ReactElement<HTMLElementProps>;
    expect(el.props.lang).toBe("en");
    expect(el.props.dir).toBe("ltr");
  });

  it("sets lang='ar' and dir='rtl' for the Arabic locale", async () => {
    const output = await LocaleLayout({
      children: <span>content</span>,
      params: Promise.resolve({ locale: "ar" }),
    });
    const el = output as React.ReactElement<HTMLElementProps>;
    expect(el.props.lang).toBe("ar");
    expect(el.props.dir).toBe("rtl");
  });

  it("calls notFound() for an unsupported locale", async () => {
    const { notFound } = await import("next/navigation");
    // notFound() calls internally throw, so we catch the thrown value.
    try {
      await LocaleLayout({
        children: <span>content</span>,
        params: Promise.resolve({ locale: "fr" }),
      });
    } catch {
      // notFound() is mocked so it may not throw; fall through.
    }
    expect(notFound).toHaveBeenCalled();
  });
});
