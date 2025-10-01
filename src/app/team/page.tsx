export default function TeamPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[var(--brand-dark)] mb-4">
          Meet Our Team
        </h1>
        <p className="text-xl text-[var(--brand-dark)] font-medium">
          The people behind FeebMEbacK
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Team members will be added here */}
        <div className="glass-card rounded-2xl p-8 text-center hover-lift">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-3xl font-bold text-[var(--brand-primary)] mb-4">
            ?
          </div>
          <h3 className="text-xl font-bold text-[var(--brand-dark)] mb-2">
            Team Member
          </h3>
          <p className="text-base text-[var(--brand-dark)] font-medium">
            Role
          </p>
        </div>
      </div>
    </div>
  );
}
