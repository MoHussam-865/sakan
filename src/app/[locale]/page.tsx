import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Home page – routes authenticated users to the dashboard and guests to login.
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const locale = await getLocale();

  if (user) {
    redirect(`/${locale}/dashboard`);
  } else {
    redirect(`/${locale}/login`);
  }
}
