import Link from "next/link";

type FooterLinkItem = {
  label: string;
  href?: string;
  note?: boolean;
};

type FooterColumn = {
  title: string;
  items: FooterLinkItem[];
};

const footerLinks: FooterColumn[] = [
  {
    title: "Team",
    items: [
      { label: "Leadership circle", href: "/team/leadership" },
      { label: "Product builders", href: "/team/builders" },
      { label: "Collaboration guide", href: "mailto:feedback@campus.edu?subject=Collaboration" }
    ]
  },
  {
    title: "Product",
    items: [
      { label: "Student feedback", href: "/feedback" },
      { label: "Teacher workspace", href: "/teacher" },
      { label: "Admin operations", href: "/admin" },
      { label: "Analytics pulse", href: "/analytics" }
    ]
  },
  {
    title: "Support",
    items: [
      { label: "Help centre", href: "mailto:feedback@campus.edu?subject=Help%20centre" },
      { label: "Status updates", href: "mailto:feedback@campus.edu?subject=Status" },
      { label: "Community Q&A", note: true }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--brand-secondary)]/45 bg-white/95">
  <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-[var(--brand-primary)]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-secondary)] text-[var(--brand-dark)] shadow-sm">
                SF
              </span>
              Student Feedback
            </Link>
<<<<<<< HEAD
            <p className="max-w-md text-sm leading-relaxed text-[color:var(--brand-dark)]/75">
              A modern DBMS-powered platform for campuses to collect, analyse, and act on student sentiment. Empower administrators, teachers, and learners with one shared source of truth.
=======
            <p className="max-w-md text-sm leading-relaxed text-slate-600">
              A feedback platform for students, teachers, and administrators. Built as a DBMS course project.
>>>>>>> b5a7457b3c1b258306ddbeef260c40dc877f4c3d
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand-dark)]/60">
              <span className="badge" data-tone="primary">Supabase Auth</span>
              <span className="badge">Realtime Insights</span>
              <span className="badge" data-tone="accent">DBMS Project</span>
            </div>
          </div>

          {footerLinks.map((column) => (
            <div key={column.title} className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-dark)]/70">
                {column.title}
              </h4>
              <ul className="space-y-3 text-sm text-[color:var(--brand-dark)]/70">
                {column.items.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="transition hover:text-[var(--brand-primary)]"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={item.note
                          ? "text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]/70"
                          : "font-medium text-[var(--brand-dark)]/80"}
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

<<<<<<< HEAD
        <div className="flex flex-col gap-3 border-t border-[var(--brand-secondary)]/45 pt-6 text-xs text-[color:var(--brand-dark)]/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Student Feedback System. Crafted for the DBMS project cohort.</p>
=======
        <div className="flex flex-col gap-3 border-t border-slate-200/60 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Student Feedback System. A DBMS project.</p>
>>>>>>> b5a7457b3c1b258306ddbeef260c40dc877f4c3d
          <div className="flex flex-wrap items-center gap-4">
            <Link href="#" className="hover:text-[var(--brand-primary)]">
              Privacy
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-[var(--brand-primary)]">
              Terms
            </Link>
            <span>•</span>
            <Link href="mailto:feedback@campus.edu" className="hover:text-[var(--brand-primary)]">
              feedback@campus.edu
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
