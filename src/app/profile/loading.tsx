export default function ProfileLoading() {
  return (
    <div className="min-h-screen space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <section className="rounded-3xl border border-slate-200 bg-white/95 p-8">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 rounded-lg bg-slate-200" />
            <div className="h-4 w-64 rounded bg-slate-200" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="h-16 rounded-2xl bg-slate-100" />
          <div className="h-16 rounded-2xl bg-slate-100" />
        </div>
      </section>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="h-32 rounded-3xl bg-slate-100" />
        <div className="h-32 rounded-3xl bg-slate-100" />
        <div className="h-32 rounded-3xl bg-slate-100" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 rounded-2xl bg-slate-100" />
          <div className="h-40 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
