// Onboarding layout – wraps all onboarding steps.
// The step progress bar lives inside OnboardingWizard (client state).
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 py-12 w-full">
      {children}
    </div>
  );
}
