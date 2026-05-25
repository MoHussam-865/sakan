import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import NavBar from "@/components/ui/NavBar";

jest.mock("next-intl", () => ({
  useTranslations:
    (namespace: "nav" | "common") =>
    (key: string): string => {
      const messages = {
        nav: {
          dashboard: "Matches",
          chat: "Messages",
          preferences: "Preferences",
          sign_out: "Sign out",
          main_navigation: "Main navigation",
        },
        common: {
          app_name: "Sakan",
        },
      } as const;

      return (
        messages[namespace][key as keyof (typeof messages)[typeof namespace]] ?? key
      );
    },
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => "/chat",
}));

jest.mock("@/actions/auth", () => ({
  signOut: jest.fn(),
}));

jest.mock("@/lib/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("NavBar", () => {
  it("renders a localized navigation landmark label", () => {
    render(<NavBar />);
    expect(
      screen.getByRole("navigation", { name: "Main navigation" })
    ).toBeInTheDocument();
  });

  it("marks the active route with aria-current", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: "Messages" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("renders sign out action and brand", () => {
    render(<NavBar />);
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sakan" })).toBeInTheDocument();
  });
});
