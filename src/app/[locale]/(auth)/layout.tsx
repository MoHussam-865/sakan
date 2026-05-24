// Auth layout – no site navigation since the user is not yet authenticated.
// The locale layout (html, body, providers) already wraps this.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4 py-12 w-full">
      {children}
    </div>
  );
}
