// Onboarding layout – wraps all onboarding steps.
// Step progress indicator is added in Phase 6.
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Step progress bar – Phase 6 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
