import Image from "next/image";
import Link from "next/link";

import type { TeamMember } from "@/data/team";

type MemberCardProps = {
  member: TeamMember;
  tone?: "primary" | "accent";
};

const toneStyles: Record<NonNullable<MemberCardProps["tone"]>, string> = {
  primary: "border-[var(--brand-primary)]/35 shadow-[0_24px_60px_-42px_rgba(37,46,135,0.55)]",
  accent: "border-[var(--brand-accent)]/35 shadow-[0_24px_60px_-42px_rgba(232,96,79,0.55)]",
};

export function MemberCard({ member, tone = "primary" }: MemberCardProps) {
  const initials = member.name
    .split(" ")
    .map((part) => part?.[0] ?? "")
    .slice(0, 2)
    .join("");

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[32px] border bg-white/95 ${toneStyles[tone]} transition hover:-translate-y-1 hover:shadow-[0_32px_70px_-38px_rgba(26,20,41,0.48)]`}
    >
      <div className="relative h-48 w-full overflow-hidden bg-[var(--brand-secondary)]/45">
        {member.image ? (
          <Image
            src={`/team_images/${member.image}`}
            alt={`${member.name} portrait`}
            fill
            sizes="(min-width: 1280px) 360px, (min-width: 768px) 40vw, 90vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-semibold text-[var(--brand-primary-dark)]">
            {initials}
          </div>
        )}
        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-primary-dark)] shadow-sm">
          {member.focus}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-6 py-7">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--brand-dark)]">{member.name}</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]">
            {member.role}
          </p>
        </header>
        <p className="text-sm leading-relaxed text-[color:var(--brand-dark)]/75">{member.bio}</p>
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-4 text-sm">
          <Link
            href={member.linkedin}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-primary-dark)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            target="_blank"
            rel="noreferrer"
          >
            <LinkedInIcon className="h-4 w-4" />
            LinkedIn
          </Link>
          <Link
            href={member.github}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-primary-dark)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </Link>
        </div>
      </div>
    </article>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-label="LinkedIn"
    >
      <path d="M20.447 20.452h-3.553v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.352V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.37-1.852 3.602 0 4.268 2.37 4.268 5.456v6.287h-.006ZM5.337 7.433a2.062 2.062 0 1 1 0-4.123 2.062 2.062 0 0 1 0 4.123Zm-1.777 13.019h3.558V9h-3.558v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.225.792 24 1.771 24h20.451C23.2 24 24 23.225 24 22.271V1.729C24 .774 23.2 0 22.225 0Z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-label="GitHub"
    >
      <path d="M12 2a10 10 0 0 0-3.162 19.493c.5.092.687-.217.687-.483 0-.237-.009-.868-.014-1.703-2.796.607-3.386-1.349-3.386-1.349-.455-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.607.069-.607 1.004.072 1.532 1.032 1.532 1.032.893 1.529 2.343 1.088 2.914.833.091-.647.35-1.088.636-1.339-2.233-.255-4.58-1.116-4.58-4.968 0-1.097.39-1.994 1.03-2.697-.103-.254-.447-1.277.098-2.662 0 0 .84-.269 2.75 1.03a9.564 9.564 0 0 1 2.503-.337c.849.004 1.705.115 2.503.337 1.909-1.299 2.748-1.03 2.748-1.03.547 1.385.203 2.408.1 2.662.64.703 1.028 1.6 1.028 2.697 0 3.862-2.352 4.71-4.592 4.958.36.309.678.92.678 1.855 0 1.339-.012 2.419-.012 2.748 0 .269.182.58.69.481A10.003 10.003 0 0 0 12 2Z" />
    </svg>
  );
}
