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
    <footer className="mt-16 border-t border-[var(--brand-secondary)]/45 relative overflow-hidden">
      {/* Semi-transparent overlay base - behind everything */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-0"></div>
      
      {/* Wavy Gradient Background - right below content */}
      <div className="absolute inset-0 footer-wave-bg pointer-events-none z-[9]"></div>
      
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 sm:px-8 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
          {/* Animated Social Card */}
          <div className="flex items-start">
            <div className="social-card">
              <div className="social-background"></div>
              <div className="social-logo">Socials</div>

              <a href="https://www.linkedin.com/in/sukumar-sawant" target="_blank" rel="noopener noreferrer">
                <div className="social-box social-box1">
                  <span className="social-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="social-svg">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </span>
                </div>
              </a>

              <a href="https://github.com/Sukumarsawant/student-feedback-sys" target="_blank" rel="noopener noreferrer">
                <div className="social-box social-box2">
                  <span className="social-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="social-svg">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </span>
                </div>
              </a>

              <a href="https://x.com/18yearodd" target="_blank" rel="noopener noreferrer">
                <div className="social-box social-box3">
                  <span className="social-icon">
                    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="social-svg">
                      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                    </svg>
                  </span>
                </div>
              </a>

              <div className="social-box social-box4"></div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-[var(--brand-dark)] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--brand-primary)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
              </svg>
              Quick Access
            </h4>
            <div className="space-y-2 text-xs text-[var(--brand-dark)]/80 font-medium">
              <Link href="/feedback" className="block hover:text-[var(--brand-primary)] hover:translate-x-1 transition-all duration-200">
                → Submit Feedback
              </Link>
              <Link href="/analytics" className="block hover:text-[var(--brand-primary)] hover:translate-x-1 transition-all duration-200">
                → View Analytics
              </Link>
              <Link href="/profile" className="block hover:text-[var(--brand-primary)] hover:translate-x-1 transition-all duration-200">
                → My Profile
              </Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-bold text-[var(--brand-dark)] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--brand-primary)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Why Choose Us
            </h4>
            <div className="space-y-2 text-xs text-[var(--brand-dark)]/80 font-medium">
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Complete anonymity
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Instant insights
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span> All courses covered
              </p>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-[var(--brand-dark)] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--brand-primary)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd"></path>
              </svg>
              Support
            </h4>
            <div className="space-y-2 text-xs text-[var(--brand-dark)]/80 font-medium">
              <Link href="/team" className="block hover:text-[var(--brand-primary)] transition-colors">
                👥 Meet the Team
              </Link>
              <Link href="mailto:feedback@vit.edu" className="block hover:text-[var(--brand-primary)] transition-colors">
                📧 Get Help
              </Link>
              <p className="text-[var(--brand-primary)]/70">Made at VIT Vellore</p>
            </div>
          </div>

          {/* Minimal Info Section */}
          <div className="flex flex-col gap-3 text-right">
            <div className="flex items-center gap-3 justify-end">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--brand-primary)]/50"></div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-[var(--brand-primary)] to-purple-600 bg-clip-text text-transparent">
                FeebMEbacK
              </h3>
            </div>
            <p className="text-sm text-[var(--brand-dark)] font-medium max-w-xs leading-relaxed">
              Empowering voices through transparent, anonymous feedback
            </p>
            <div className="flex items-center gap-2 justify-end text-xs text-green-600 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>System Active</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--brand-secondary)]/45 pt-6 text-xs text-[color:var(--brand-dark)]/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 feedmeback</p>
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
