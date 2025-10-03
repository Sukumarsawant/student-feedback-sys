export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin: string;
  github: string;
  focus: string;
};

export const leadershipTeam: TeamMember[] = [
  {
    name: "Sukumar Sawant",
    role: "Founding product steward",
    bio: "Guides discovery sprints and translates campus rituals into actionable product bets and delivery rhythms.",
    image: "sukumar.jpg",
    linkedin: "https://www.linkedin.com/in/sukumar-sawant",
    github: "https://github.com/Sukumarsawant",
    focus: "Discovery & product flow",
  },
  {
    name: "Gautami Patil",
    role: "Experience design partner",
    bio: "Coaches teams through journey-mapping, prototyping, and accessibility audits for each release cycle.",
    image: "gautami.jpg",
    linkedin: "https://www.linkedin.com/in/gautami-patil",
    github: "https://github.com/gautamipatil",
    focus: "Research-led UX systems",
  },
];

export const productBuilders: TeamMember[] = [
  {
    name: "Varshit Deshmukh",
    role: "Data & Integrations Engineer",
  bio: "Builds the analytics plumbing, automations, and real-time syncs that keep every team in the loop.",
    image: "varshit.jpg",
    linkedin: "https://www.linkedin.com/feed/",
    github: "https://github.com/techwithvarshit",
  focus: "Supabase & ETL automation",
  },
  {
    name: "Soumya Kulkarni",
    role: "Campus Success Partner",
  bio: "Champions adoption playbooks, departmental onboarding, and continuous feedback forums across the campus.",
    image: "soumya.jpg",
    linkedin: "https://www.linkedin.com/in/soumya-kulkarni",
    github: "https://github.com/soumya-kulkarni",
  focus: "Change management & enablement",
  },
];
