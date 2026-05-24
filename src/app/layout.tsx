import "./globals.css";

// Root layout is intentionally minimal.
// The <html>, <body>, lang and dir attributes are managed per-locale in
// app/[locale]/layout.tsx so the correct text direction (RTL/LTR) can be set.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
