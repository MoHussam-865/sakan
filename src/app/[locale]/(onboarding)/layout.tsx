// Onboarding layout – wraps all onboarding steps.
// The step progress bar lives inside OnboardingWizard (client state).
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
