export default function ProfileDetailLoading() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 w-28 bg-slate-100 rounded mb-8" />

      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-slate-100 shrink-0" />
        <div className="space-y-2">
          <div className="h-6 w-40 bg-slate-100 rounded" />
          <div className="h-4 w-24 bg-slate-100 rounded" />
        </div>
      </div>

      {/* About me skeleton */}
      <div className="mb-8 pb-8 border-b border-slate-100 space-y-2">
        <div className="h-4 bg-slate-100 rounded" />
        <div className="h-4 bg-slate-100 rounded w-4/5" />
        <div className="h-4 bg-slate-100 rounded w-3/5" />
      </div>

      {/* Fields skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="h-4 w-32 bg-slate-100 rounded shrink-0" />
            <div className="h-4 w-48 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
