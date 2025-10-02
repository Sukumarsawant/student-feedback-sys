"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Course {
  id: string;
  course_code: string;
  course_name: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: 'rating' | 'text' | 'multiple_choice';
  options?: string[];
  is_required: boolean;
}

export default function CreateFeedbackFormPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    start_date: '',
    end_date: '',
  });
  
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question_text: 'How would you rate the overall quality of this course?',
      question_type: 'rating',
      is_required: true,
    },
    {
      id: '2',
      question_text: 'Additional comments or suggestions:',
      question_type: 'text',
      is_required: false,
    },
  ]);

  useEffect(() => {
    async function loadTeacherCourses() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.replace('/login');
          return;
        }

        // Get teacher's assigned courses
        const { data: assignments, error } = await supabase
          .from('course_assignments')
          .select(`
            courses (
              id,
              course_code,
              course_name
            )
          `)
          .eq('teacher_id', user.id);

        if (error) throw error;

        const courseList = (assignments ?? [])
          .map(a => a.courses)
          .filter(c => c != null)
          .flat()
          .filter(c => typeof c === 'object' && c.id) as Course[];

        setCourses(courseList);
        
        // Set default dates (start: today, end: 30 days from now)
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 30);
        
        setFormData(prev => ({
          ...prev,
          start_date: today.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          course_id: courseList[0]?.id || '',
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading courses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load courses');
        setLoading(false);
      }
    }

    loadTeacherCourses();
  }, [supabase, router]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question_text: '',
      question_type: 'text',
      is_required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create forms');
      }

      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Form title is required');
      }
      if (!formData.course_id) {
        throw new Error('Please select a course');
      }
      if (questions.length === 0) {
        throw new Error('Add at least one question');
      }
      
      const emptyQuestions = questions.filter(q => !q.question_text.trim());
      if (emptyQuestions.length > 0) {
        throw new Error('All questions must have text');
      }

      // Create form
      const { data: form, error: formError } = await supabase
        .from('feedback_forms')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          course_id: formData.course_id,
          academic_year: new Date().getFullYear().toString(),
          semester: 1,
          is_active: true,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
          created_by: user.id,
        })
        .select('id')
        .single();

      if (formError || !form) {
        throw new Error(formError?.message || 'Failed to create form');
      }

      // Create questions
      const questionsToInsert = questions.map((q, index) => ({
        form_id: form.id,
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        options: q.options ? { options: q.options } : null,
        is_required: q.is_required,
        order_number: index + 1,
      }));

      const { error: questionsError } = await supabase
        .from('feedback_questions')
        .insert(questionsToInsert);

      if (questionsError) {
        throw new Error(questionsError.message);
      }

      setSuccess(true);
      // Reset form
      setFormData({
        title: '',
        description: '',
        course_id: courses[0]?.id || '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setQuestions([
        {
          id: Date.now().toString(),
          question_text: 'How would you rate the overall quality of this course?',
          question_type: 'rating',
          is_required: true,
        },
        {
          id: (Date.now() + 1).toString(),
          question_text: 'Additional comments or suggestions:',
          question_type: 'text',
          is_required: false,
        },
      ]);
    } catch (err) {
      console.error('Error creating form:', err);
      setError(err instanceof Error ? err.message : 'Failed to create form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex h-[60vh] w-full max-w-4xl items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <div className="mb-8">
        <Link 
          href="/teacher"
          className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Create Feedback Form</h1>
        <p className="mt-2 text-sm text-slate-600">
          Design a custom feedback form for your students to complete.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Feedback form created successfully! Students can now submit responses.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Form Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Form Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                Form Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="e.g., Mid-Semester Feedback"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="Optional: Provide context for this feedback form"
              />
            </div>

            <div>
              <label htmlFor="course" className="block text-sm font-medium text-slate-700 mb-1">
                Course *
              </label>
              <select
                id="course"
                required
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-slate-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  id="end_date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Question
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                    {index + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={question.question_text}
                      onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
                      placeholder="Enter your question"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Question Type</label>
                      <select
                        value={question.question_type}
                        onChange={(e) => updateQuestion(question.id, 'question_type', e.target.value as 'rating' | 'text' | 'multiple_choice')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      >
                        <option value="rating">Rating (1-5)</option>
                        <option value="text">Text Answer</option>
                        <option value="multiple_choice">Multiple Choice</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={question.is_required}
                          onChange={(e) => updateQuestion(question.id, 'is_required', e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-slate-700">Required</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/teacher"
            className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Form'}
          </button>
        </div>
      </form>
    </div>
  );
}
