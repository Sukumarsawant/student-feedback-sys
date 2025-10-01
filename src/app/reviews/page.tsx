import { HoverEffect } from "@/components/ui/card-hover-effect";

const reviews = [
  {
    title: "Aarav Singh - Student, 2nd Year",
    description: "Best feedback system I've used. Quick, simple, and actually works! The interface is intuitive and I can submit my feedback in just a few clicks. ⭐⭐⭐⭐⭐",
  },
  {
    title: "Dr. Meera Nair - Professor",
    description: "Makes collecting student feedback so much easier. The analytics are super helpful and give me real insights into my teaching methods. ⭐⭐⭐⭐⭐",
  },
  {
    title: "Rahul Verma - Student, 3rd Year",
    description: "Clean design, easy to use. Way better than the old forms we used to fill. The anonymous option is a great feature! ⭐⭐⭐⭐",
  },
  {
    title: "Prof. Anita Sharma - Teacher",
    description: "Love the real-time dashboard. Helps me improve my teaching instantly. I can see trends and patterns in student feedback right away. ⭐⭐⭐⭐⭐",
  },
  {
    title: "Priya Kapoor - Student, 1st Year",
    description: "Finally, a feedback system that doesn't feel like a chore. The mobile experience is smooth and I can give feedback anytime. ⭐⭐⭐⭐⭐",
  },
  {
    title: "Dr. Rajesh Kumar - Department Head",
    description: "Excellent tool for tracking teaching quality across departments. The aggregated analytics help us make data-driven decisions. ⭐⭐⭐⭐⭐",
  },
];

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[var(--brand-dark)] mb-4">
          Reviews
        </h1>
        <p className="text-xl text-[var(--brand-dark)] font-medium">
          What students and teachers are saying
        </p>
      </div>

      <HoverEffect items={reviews} />
    </div>
  );
}
