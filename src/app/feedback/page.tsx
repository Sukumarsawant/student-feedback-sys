"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type InsertFeedback = {
  course_code: string;
  instructor_name?: string | null;
  rating: number;
  comments?: string | null;
  is_anonymous: boolean;
};

export default function FeedbackPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [form, setForm] = useState<InsertFeedback>({
    course_code: "",
    instructor_name: "",
    rating: 5,
    comments: "",
    is_anonymous: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => reject(new Error("Request timed out after 5s")), ms);
      promise
        .then((value) => {
          clearTimeout(id);
          resolve(value);
        })
        .catch((err) => {
          clearTimeout(id);
          reject(err);
        });
    });
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/\(auth\)/login");
      }
    })();
  }, []);

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      
      const { error } = await supabase.from("feedback").insert({
        student_id: user.id,
        ...form,
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setForm({ course_code: "", instructor_name: "", rating: 5, comments: "", is_anonymous: false });
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Submit Feedback</h1>
      <form onSubmit={submitFeedback} className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Course code (e.g., CS101)"
          value={form.course_code}
          onChange={(e) => setForm({ ...form, course_code: e.target.value })}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Instructor name (optional)"
          value={form.instructor_name ?? ""}
          onChange={(e) => setForm({ ...form, instructor_name: e.target.value })}
        />
        <div>
          <label className="block mb-1">Rating (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            className="w-full border rounded px-3 py-2"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            required
          />
        </div>
        <textarea
          className="w-full border rounded px-3 py-2"
          placeholder="Comments"
          value={form.comments ?? ""}
          onChange={(e) => setForm({ ...form, comments: e.target.value })}
          rows={4}
        />
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.is_anonymous}
            onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
          />
          <span>Submit anonymously</span>
        </label>
        <button disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded">
          {submitting ? "Submitting..." : "Submit"}
        </button>
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Feedback submitted!</p>}
      </form>
    </div>
  );
}


