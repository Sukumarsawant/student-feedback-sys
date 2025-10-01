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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sample reviews */}
        {[
          {
            name: "Aarav Singh",
            role: "Student, 2nd Year",
            review: "Best feedback system I've used. Quick, simple, and actually works!",
            rating: 5
          },
          {
            name: "Dr. Meera Nair",
            role: "Professor",
            review: "Makes collecting student feedback so much easier. The analytics are super helpful.",
            rating: 5
          },
          {
            name: "Rahul Verma",
            role: "Student, 3rd Year",
            review: "Clean design, easy to use. Way better than the old forms.",
            rating: 4
          },
          {
            name: "Prof. Anita Sharma",
            role: "Teacher",
            review: "Love the real-time dashboard. Helps me improve my teaching instantly.",
            rating: 5
          }
        ].map((review, index) => (
          <div key={index} className="glass-card rounded-2xl p-6 hover-lift">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-xl ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                  ★
                </span>
              ))}
            </div>
            <p className="text-[var(--brand-dark)] text-base font-medium mb-4 leading-relaxed">
              &quot;{review.review}&quot;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--brand-dark)]/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-lg font-bold text-[var(--brand-primary)]">
                {review.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-[var(--brand-dark)]">{review.name}</p>
                <p className="text-sm text-[var(--brand-dark)] font-medium">{review.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
