export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-primary)] border-r-transparent"></div>
        <p className="mt-4 text-sm text-[var(--brand-dark)]/70">Loading profile...</p>
      </div>
    </div>
  );
}
