// Root loading skeleton – displayed by Next.js while the locale page/layout is loading.
export default function Loading() {
  return (
    <div
      className="flex-1 flex items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-slate-600 animate-spin" />
    </div>
  );
}
