import Image from "next/image";

const teamMembers = [
  {
    name: "Sukumar",
    role: "Developer",
    image: "/images/team/sukumar.jpg",
    linkedin: "https://linkedin.com/in/sukumar-sawant",
    github: "https://github.com/username"
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
      {/* SVG Filter for smooth animations */}
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10"></feGaussianBlur>
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7" result="goo"></feColorMatrix>
            <feBlend in2="goo" in="SourceGraphic" result="mix"></feBlend>
          </filter>
        </defs>
      </svg>

      <div className="text-center mb-20">
        <h1 className="text-5xl font-bold text-[var(--brand-dark)] mb-4">
          Meet Our Team
        </h1>
        <p className="text-xl text-[var(--brand-dark)]/70">
          The people behind FeebMEbacK
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 justify-items-center" style={{ paddingBottom: '120px' }}>
        {teamMembers.map((member, index) => (
          <div key={index} className="team-card">
            <div className="team-slide team-slide1">
              <div className="team-content">
                <div className="team-icon">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={300}
                    height={200}
                    className="team-image"
                  />
                </div>
              </div>
            </div>
            <div className="team-slide team-slide2">
              <div className="team-content">
                <h3>{member.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{member.role}</p>
                <div className="social-links">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="social-link">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
