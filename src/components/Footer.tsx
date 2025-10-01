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
      { label: "Sukumar" },
      { label: "Gautami" },
      { label: "Varshit" },
      { label: "Soumya" }
    ]
  },
  {
    title: "Resources",
    items: [
      { label: "Submit Feedback", href: "/feedback" },
      { label: "Teacher Forms", href: "/teacher/forms" },
      { label: "Timetable", href: "/admin/timetable" }
    ]
  },
  {
    title: "Support",
    items: [
      { label: "Help centre", href: "#" },
      { label: "Contact", href: "mailto:feedback@campus.edu" },
      { label: "Status", href: "#" }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--brand-secondary)]/40 bg-white/90">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-[var(--brand-primary)]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-secondary)] text-[var(--brand-dark)] shadow-sm">
                SF
              </span>
              Student Feedback
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-slate-600">
              A feedback platform for students, teachers, and administrators. Built as a DBMS course project.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              <span className="badge">Supabase Auth</span>
              <span className="badge">Realtime Insights</span>
              <span className="badge">DBMS Project</span>
            </div>
          </div>

          {footerLinks.map((column) => (
            <div key={column.title} className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-dark)]/70">
                {column.title}
              </h4>
              <ul className="space-y-3 text-sm text-slate-600">
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

        <div className="flex flex-col gap-3 border-t border-slate-200/60 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Student Feedback System. A DBMS project.</p>
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
