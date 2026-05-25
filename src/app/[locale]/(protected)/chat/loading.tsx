export default function ChatListLoading() {
  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-10">
      {/* Heading skeleton */}
      <div className="h-8 w-36 rounded bg-slate-200 animate-pulse mb-8" />

      {/* Row skeletons */}
      <ul className="divide-y divide-slate-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
          </li>
        ))}
      </ul>
    </section>
  );
}
