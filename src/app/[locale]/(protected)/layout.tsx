// Protected layout – wraps all authenticated routes (dashboard, profile, chat).
// Auth guard and site navigation are added in Phase 5 and Phase 7 respectively.
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Navigation bar – Phase 7 */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
