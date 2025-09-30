-- Supabase Schema for Student Feedback System
-- Run this in Supabase SQL editor. It creates tables and RLS policies.

-- Extensions
create extension if not exists pgcrypto;

-- Profiles table mirrors auth.users with additional fields
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text check (role in ('student','instructor','admin')) default 'student',
  created_at timestamp with time zone default now()
);

-- Keep profiles.email synced with auth.users.email on insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_code text not null,
  instructor_name text,
  rating int not null check (rating between 1 and 5),
  comments text,
  is_anonymous boolean not null default false,
  created_at timestamp with time zone not null default now()
);

-- Indexes
create index if not exists feedback_student_idx on public.feedback(student_id);
create index if not exists feedback_course_idx on public.feedback(course_code);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.feedback enable row level security;

-- Helper to check if current user has role
create or replace function public.current_user_has_role(target_role text)
returns boolean as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = target_role
  );
$$ language sql stable;

-- profiles policies
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using ( id = auth.uid() or public.current_user_has_role('admin') );

drop policy if exists "update own profile minimal" on public.profiles;
create policy "update own profile minimal" on public.profiles
  for update using ( id = auth.uid() ) with check ( id = auth.uid() );

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert with check ( true ); -- allow trigger-based inserts; app code should only insert matching auth.uid()

-- feedback policies
drop policy if exists "insert own feedback" on public.feedback;
create policy "insert own feedback" on public.feedback
  for insert with check ( student_id = auth.uid() );

drop policy if exists "read feedback" on public.feedback;
create policy "read feedback" on public.feedback
  for select using (
    -- author can read
    student_id = auth.uid()
    or
    -- admins can read all
    public.current_user_has_role('admin')
    or
    -- instructors can read all (simplified; refine to their courses if needed)
    public.current_user_has_role('instructor')
    or
    -- anyone authenticated can read anonymous feedback
    (is_anonymous = true and auth.role() = 'authenticated')
  );

drop policy if exists "update own feedback" on public.feedback;
create policy "update own feedback" on public.feedback
  for update using ( student_id = auth.uid() or public.current_user_has_role('admin') )
  with check ( student_id = auth.uid() or public.current_user_has_role('admin') );

drop policy if exists "delete own feedback" on public.feedback;
create policy "delete own feedback" on public.feedback
  for delete using ( student_id = auth.uid() or public.current_user_has_role('admin') );

-- Grant minimal privileges to authenticated role
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.feedback to authenticated;
grant select, update on public.profiles to authenticated;

-- Optional: sample view aggregating average ratings per course
create or replace view public.course_feedback_stats as
  select
    course_code,
    count(*) as total_feedbacks,
    avg(rating)::numeric(10,2) as avg_rating
  from public.feedback
  group by course_code;

-- ================= Expanded schema per diagram =================
-- Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  course_code text not null unique,
  course_name text not null,
  department text,
  year int,
  semester int,
  credits int,
  is_active boolean not null default true
);

-- Course assignments (teacher to course per term)
create table if not exists public.course_assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  academic_year text not null,
  semester int not null
);
create index if not exists idx_course_assign_course on public.course_assignments(course_id);
create index if not exists idx_course_assign_teacher on public.course_assignments(teacher_id);

-- Feedback forms
create table if not exists public.feedback_forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  academic_year text,
  is_active boolean not null default true,
  start_date date,
  end_date date
);

-- Feedback questions
create table if not exists public.feedback_questions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.feedback_forms(id) on delete cascade,
  question_text text not null,
  question_type text not null check (question_type in ('rating','text','choice')),
  options jsonb, -- for choice questions
  order_number int
);
create index if not exists idx_questions_form on public.feedback_questions(form_id);

-- Feedback responses
create table if not exists public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.feedback_forms(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  student_id uuid not null references public.profiles(id) on delete cascade,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_responses_form on public.feedback_responses(form_id);
create index if not exists idx_responses_student on public.feedback_responses(student_id);

-- Feedback answers
create table if not exists public.feedback_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.feedback_responses(id) on delete cascade,
  question_id uuid not null references public.feedback_questions(id) on delete cascade,
  answer_rating int check (answer_rating between 1 and 5),
  answer_text text,
  answer_choice text
);
create index if not exists idx_answers_response on public.feedback_answers(response_id);

-- Enable RLS
alter table public.courses enable row level security;
alter table public.course_assignments enable row level security;
alter table public.feedback_forms enable row level security;
alter table public.feedback_questions enable row level security;
alter table public.feedback_responses enable row level security;
alter table public.feedback_answers enable row level security;

-- Basic policies
-- Courses readable by all authenticated
drop policy if exists "read courses" on public.courses;
create policy "read courses" on public.courses for select using ( auth.role() = 'authenticated' );

-- course_assignments readable by authenticated
drop policy if exists "read course assignments" on public.course_assignments;
create policy "read course assignments" on public.course_assignments for select using ( auth.role() = 'authenticated' );

-- feedback_forms readable by authenticated; insert/update by admin/instructor
drop policy if exists "read forms" on public.feedback_forms;
create policy "read forms" on public.feedback_forms for select using ( auth.role() = 'authenticated' );
drop policy if exists "manage forms" on public.feedback_forms;
create policy "manage forms" on public.feedback_forms for all using ( public.current_user_has_role('admin') or public.current_user_has_role('instructor') ) with check ( public.current_user_has_role('admin') or public.current_user_has_role('instructor') );

-- questions readable by authenticated; manage by admin/instructor
drop policy if exists "read questions" on public.feedback_questions;
create policy "read questions" on public.feedback_questions for select using ( auth.role() = 'authenticated' );
drop policy if exists "manage questions" on public.feedback_questions;
create policy "manage questions" on public.feedback_questions for all using ( public.current_user_has_role('admin') or public.current_user_has_role('instructor') ) with check ( public.current_user_has_role('admin') or public.current_user_has_role('instructor') );

-- responses: students write own; instructors/admins can read; authors can read own; anonymous responses readable by authenticated
drop policy if exists "insert response" on public.feedback_responses;
create policy "insert response" on public.feedback_responses for insert with check ( student_id = auth.uid() );
drop policy if exists "read responses" on public.feedback_responses;
create policy "read responses" on public.feedback_responses for select using (
  student_id = auth.uid() or public.current_user_has_role('admin') or public.current_user_has_role('instructor') or (is_anonymous = true and auth.role() = 'authenticated')
);

-- answers: insert tied to own response; read via response policy
drop policy if exists "insert answers" on public.feedback_answers;
create policy "insert answers" on public.feedback_answers for insert with check (
  exists (select 1 from public.feedback_responses r where r.id = response_id and r.student_id = auth.uid())
);

-- Grants
grant select on public.courses, public.course_assignments, public.feedback_forms, public.feedback_questions to authenticated;
grant select, insert on public.feedback_responses, public.feedback_answers to authenticated;


