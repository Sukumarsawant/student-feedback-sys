import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error("Supabase service role credentials are required for the feedback submit route.");
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

type RequestPayload = {
  courseCode: string;
  courseName: string;
  instructorName: string | null;
  rating: number;
  comments?: string | null;
  isAnonymous?: boolean;
};

type CourseRow = {
  id: string;
  course_code: string;
  course_name: string;
  department: string | null;
  year: number | null;
  semester: number | null;
};

type QuestionRow = {
  id: string;
  question_type: "rating" | "text" | "multiple_choice";
};

function academicYearFor(date: Date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

async function ensureCourse(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>, payload: Pick<RequestPayload, "courseCode" | "courseName">) {
  const { courseCode, courseName } = payload;

  const { data: existing, error } = await supabaseAdmin
    .from("courses")
    .select("id, course_code, course_name, department, year, semester")
    .eq("course_code", courseCode)
    .maybeSingle<CourseRow>();

  if (error) {
    throw new Error(`Failed to look up course: ${error.message}`);
  }

  if (existing) {
    return existing.id;
  }

  const now = new Date();

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("courses")
    .insert({
      course_code: courseCode,
      course_name: courseName || courseCode,
      department: "General",
      year: 1,
      semester: 1,
      credits: 0,
      description: "Auto-generated from feedback submission",
      is_active: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .select("id")
    .maybeSingle();

  if (insertError || !inserted) {
    throw new Error(insertError?.message || "Unable to create course record");
  }

  return inserted.id;
}

async function resolveTeacherId(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>, courseId: string, instructorName: string | null) {
  // First try course assignments
  const { data: assignment, error: assignmentError } = await supabaseAdmin
    .from("course_assignments")
    .select("teacher_id")
    .eq("course_id", courseId)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(`Failed to resolve teacher assignment: ${assignmentError.message}`);
  }

  if (assignment?.teacher_id) {
    return assignment.teacher_id as string;
  }

  if (!instructorName) {
    return null;
  }

  const { data: teacher, error: teacherError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "teacher")
    .ilike("full_name", instructorName.trim())
    .maybeSingle();

  if (teacherError) {
    throw new Error(`Failed to look up teacher profile: ${teacherError.message}`);
  }

  return teacher?.id ?? null;
}

async function ensureFeedbackForm(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>, courseId: string, createdBy: string | null) {
  const { data: existing, error } = await supabaseAdmin
    .from("feedback_forms")
    .select("id")
    .eq("course_id", courseId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch feedback form: ${error.message}`);
  }

  if (existing) {
    return existing.id;
  }

  const now = new Date();
  const academicYear = academicYearFor(now);

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("feedback_forms")
    .insert({
      title: "Course Feedback",
      description: "Auto-generated feedback form",
      course_id: courseId,
      academic_year: academicYear,
      semester: 1,
      is_active: true,
      start_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: createdBy,
    })
    .select("id")
    .maybeSingle();

  if (insertError || !inserted) {
    throw new Error(insertError?.message || "Unable to create feedback form");
  }

  return inserted.id;
}

async function ensureQuestions(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>, formId: string) {
  const { data: existing, error } = await supabaseAdmin
    .from("feedback_questions")
    .select("id, question_type")
    .eq("form_id", formId)
    .order("order_number", { ascending: true })
    .returns<QuestionRow[]>();

  if (error) {
    throw new Error(`Failed to fetch feedback questions: ${error.message}`);
  }

  let ratingQuestion = existing.find((question) => question.question_type === "rating");
  let commentQuestion = existing.find((question) => question.question_type === "text");

  const inserts = [] as Array<{ question_type: QuestionRow["question_type"]; order_number: number; question_text: string }>;

  if (!ratingQuestion) {
    inserts.push({
      question_type: "rating",
      order_number: 1,
      question_text: "How would you rate this course overall?",
    });
  }

  if (!commentQuestion) {
    inserts.push({
      question_type: "text",
      order_number: 2,
      question_text: "Share any additional comments for the instructor.",
    });
  }

  if (inserts.length > 0) {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("feedback_questions")
      .insert(inserts.map((item) => ({ ...item, form_id: formId, is_required: false })))
      .select("id, question_type")
      .returns<QuestionRow[]>();

    if (insertError) {
      throw new Error(`Failed to create default feedback questions: ${insertError.message}`);
    }

    if (inserted) {
      ratingQuestion = ratingQuestion ?? inserted.find((question) => question.question_type === "rating");
      commentQuestion = commentQuestion ?? inserted.find((question) => question.question_type === "text");
    }
  }

  return {
    ratingQuestionId: ratingQuestion?.id ?? null,
    commentQuestionId: commentQuestion?.id ?? null,
  };
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Failed to resolve profile: ${profileError.message}`);
    }

    const role = (profileData?.role || user.user_metadata?.role || "").toString().toLowerCase();

    if (role !== "student") {
      return NextResponse.json({ error: "Only students can submit feedback" }, { status: 403 });
    }

    const body = (await request.json()) as RequestPayload;
    const courseCode = body.courseCode?.trim();
    const rating = Number(body.rating);

    if (!courseCode) {
      return NextResponse.json({ error: "Course code is required." }, { status: 400 });
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    const courseId = await ensureCourse(supabaseAdmin, { courseCode, courseName: body.courseName });
    const teacherId = await resolveTeacherId(supabaseAdmin, courseId, body.instructorName);
    const formId = await ensureFeedbackForm(supabaseAdmin, courseId, teacherId);
    const { ratingQuestionId, commentQuestionId } = await ensureQuestions(supabaseAdmin, formId);

    const { data: response, error: responseError } = await supabaseAdmin
      .from("feedback_responses")
      .upsert(
        {
          form_id: formId,
          course_id: courseId,
          teacher_id: teacherId,
          student_id: user.id,
          is_anonymous: Boolean(body.isAnonymous),
        },
        { onConflict: "form_id,course_id,teacher_id,student_id" }
      )
      .select("id")
      .maybeSingle();

    if (responseError || !response) {
      throw new Error(responseError?.message || "Failed to store feedback response");
    }

    await supabaseAdmin
      .from("feedback_answers")
      .delete()
      .eq("response_id", response.id);

    const answers = [] as Array<Record<string, unknown>>;

    if (ratingQuestionId) {
      answers.push({
        response_id: response.id,
        question_id: ratingQuestionId,
        answer_rating: rating,
      });
    }

    const trimmedComment = body.comments?.trim();
    if (commentQuestionId && trimmedComment) {
      answers.push({
        response_id: response.id,
        question_id: commentQuestionId,
        answer_text: trimmedComment,
      });
    }

    if (answers.length > 0) {
      const { error: answersError } = await supabaseAdmin.from("feedback_answers").insert(answers);
      if (answersError) {
        throw new Error(`Failed to store feedback answers: ${answersError.message}`);
      }
    }

    return NextResponse.json({
      message: "Feedback saved successfully.",
      responseId: response.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("Feedback submission error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
