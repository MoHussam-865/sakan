import { render, screen } from "@testing-library/react";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

// Mock next-intl hooks
jest.mock("next-intl", () => ({
  useLocale: jest.fn(),
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      en: "EN",
      ar: "عربي",
      label: "Switch language",
    };
    return map[key] ?? key;
  },
}));

// Mock the i18n navigation helpers
jest.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    locale,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    locale: string;
    href: string;
    [k: string]: unknown;
  }) => (
    <a data-locale={locale} href={href} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => "/dashboard",
}));

// Mock the routing config
jest.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "ar"], defaultLocale: "en" },
}));

// Mock cn utility (passthrough)
jest.mock("@/lib/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

const { useLocale } = jest.requireMock("next-intl") as {
  useLocale: jest.Mock;
};

describe("LocaleSwitcher", () => {
  it("renders both locale options", () => {
    useLocale.mockReturnValue("en");
    render(<LocaleSwitcher />);
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText("عربي")).toBeInTheDocument();
  });

  it("marks the active locale link with aria-current", () => {
    useLocale.mockReturnValue("en");
    render(<LocaleSwitcher />);
    const activeLink = screen.getByText("EN").closest("a");
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("does not set aria-current on the inactive locale", () => {
    useLocale.mockReturnValue("en");
    render(<LocaleSwitcher />);
    const inactiveLink = screen.getByText("عربي").closest("a");
    expect(inactiveLink).not.toHaveAttribute("aria-current");
  });

  it("sets the correct locale attribute on each link", () => {
    useLocale.mockReturnValue("ar");
    render(<LocaleSwitcher />);
    expect(screen.getByText("EN").closest("a")).toHaveAttribute(
      "data-locale",
      "en"
    );
    expect(screen.getByText("عربي").closest("a")).toHaveAttribute(
      "data-locale",
      "ar"
    );
  });

  it("has an accessible nav label", () => {
    useLocale.mockReturnValue("en");
    render(<LocaleSwitcher />);
    expect(
      screen.getByRole("navigation", { name: "Switch language" })
    ).toBeInTheDocument();
  });
});
