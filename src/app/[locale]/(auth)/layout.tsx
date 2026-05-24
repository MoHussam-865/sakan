// Auth layout – no site navigation since the user is not yet authenticated.
// The locale layout (html, body, providers) already wraps this.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}
