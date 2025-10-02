import Image from "next/image";

const teamMembers = [
  {
    name: "Sukumar",
    role: "Developer",
    image: "/images/team/sukumar.jpg",
    linkedin: "https://linkedin.com/in/sukumar-sawant",
    github: "https://github.com/sukumarsawant"
  },
  {
    name: "Gautami",
    role: "Designer",
    image: "/images/team/gautami.jpg",
    linkedin: "www.linkedin.com/in/gautami-kamble-457118330",
    github: "https://github.com/gautami-5"
  },
  {
    name: "Varshit",
    role: "Ultra Pro Max Dev",
    image: "/images/team/varshit.jpg",
    linkedin: "https://linkedin.com/in/username",
    github: "https://github.com/username"
  }
];

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 animate-fade-in min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-24 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)]/10 px-4 py-2 text-sm font-bold tracking-wider text-[var(--brand-primary)] mb-6">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
          </svg>
          OUR TEAM
        </div>
        
        <h1 className="text-6xl font-bold text-[var(--brand-dark)] mb-6 leading-tight">
          Meet the{" "}
          <span className="bg-gradient-to-r from-[var(--brand-primary)] via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Creators
          </span>
        </h1>
        <p className="text-xl text-[var(--brand-dark)]/70 max-w-2xl mx-auto leading-relaxed">
          The talented minds behind FeedMEbacK, working together to revolutionize campus feedback systems
        </p>
      </div>

      {/* Team Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="group relative"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Animated Gradient Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-500 animate-gradient-x"></div>
            
            {/* Card */}
            <div className="relative rounded-3xl bg-white p-8 shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02]">
              {/* Image Container */}
              <div className="relative mb-6 overflow-hidden rounded-2xl">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Content */}
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)] transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)]/80">
                  {member.role}
                </p>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-4 pt-4">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/social flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/social flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gradient-to-br from-[var(--brand-primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-4 left-4 h-6 w-6 rounded-full bg-gradient-to-br from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
