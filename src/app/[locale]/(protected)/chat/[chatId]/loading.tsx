export default function ChatThreadLoading() {
  return (
    <section className="flex flex-col h-[calc(100vh-3.5rem)] w-full max-w-2xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-200 shrink-0">
        <div className="w-5 h-4 rounded bg-slate-200 animate-pulse" />
        <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
        <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
      </div>

      {/* Messages area skeleton */}
      <div className="flex-1 px-4 py-6 space-y-4">
        <div className="flex justify-start">
          <div className="h-10 w-48 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-36 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
        <div className="flex justify-start">
          <div className="h-10 w-56 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-44 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
      </div>

      {/* Input skeleton */}
      <div className="border-t border-slate-200 px-4 py-3 flex gap-2">
        <div className="flex-1 h-11 rounded-xl bg-slate-200 animate-pulse" />
        <div className="w-16 h-11 rounded-xl bg-slate-200 animate-pulse" />
      </div>
    </section>
  );
}
