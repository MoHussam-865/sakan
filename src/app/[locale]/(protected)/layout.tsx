import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/ui/NavBar";

// Protected layout – wraps all authenticated routes (dashboard, profile, chat).
// Redirects unauthenticated visitors to the login page.
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-zinc-50">
      <NavBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
