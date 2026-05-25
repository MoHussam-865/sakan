export default function PreferencesLoading() {
  return (
    <section className="w-full max-w-lg mx-auto px-4 py-8">
      {/* Back link skeleton */}
      <div className="h-4 w-28 rounded bg-slate-100 animate-pulse mb-6" />

      {/* Heading skeleton */}
      <div className="mb-8 space-y-2">
        <div className="h-7 w-48 rounded bg-slate-100 animate-pulse" />
        <div className="h-4 w-64 rounded bg-slate-100 animate-pulse" />
      </div>

      {/* Form field skeletons */}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
        </div>
        <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-28 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    </section>
  );
}
