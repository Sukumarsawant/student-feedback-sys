# Student Feedback System - Complete Rebuild Guide

## Overview
This guide covers the complete rebuild of the student feedback system with improved UI/UX, glassmorphism effects, proper workflows, and test data.

## Database Setup

### Step 1: Run the New Schema
1. Go to your Supabase project SQL Editor
2. Run `supabase/new-schema-updated.sql`
3. This will:
   - Drop all existing tables and recreate them
   - Add new fields: `username`, `roll_no`, `division` to profiles
   - Add `teacher_id` to feedback_forms for form ownership
   - Set up proper RLS policies

### Step 2: Create Test Users in Supabase Auth
You MUST create these users manually in Supabase Auth Dashboard:

**Navigate to: Authentication > Users > Add User**

Create the following users:

1. **Student Account**
   - Email: `student@vit.edu.in`
   - Password: `123456`
   - Email Confirm: ✓ (check the box)

2. **Teachers (6 accounts)**
   - `sachin.deshmukh@vit.edu.in` - Password: `123456`
   - `suvarna.bhat@vit.edu.in` - Password: `123456`
   - `sachin.bojewar@vit.edu.in` - Password: `123456`
   - `khimya.amlani@vit.edu.in` - Password: `123456`
   - `asmita.neve@vit.edu.in` - Password: `123456`
   - `swapnil.sonawane@vit.edu.in` - Password: `123456`

3. **Admin Account**
   - Email: `admin@vit.edu.in`
   - Password: `123456`
   - Username: `admin`

### Step 3: Run Seed Data
1. Go to Supabase SQL Editor
2. Run `supabase/seed-data-updated.sql`
3. This will:
   - Create 6 CMPN department courses
   - Update profile information for all teachers
   - Link teachers to their respective courses
   - Set up the student profile

## Courses and Teachers Mapping

| Course Code | Course Name | Teacher |
|------------|-------------|---------|
| DBMS | DATABASE MANAGEMENT SYSTEMS | Dr. Sachin Deshmukh |
| MP | MICROPROCESSOR | Mrs. Suvarna Bhat |
| DT | DESIGN THINKING | Dr. Sachin Bojewar |
| EM3 | ENGINEERING MATHEMATICS 3 | Khimya Amlani |
| PS | PRESENTATION SKILLS | Asmita Neve |
| AOA | ANALYSIS OF ALGORITHM | Dr. Swapnil Sonawane |

## UI/UX Changes

### 1. Glassmorphism Effects
- Navbar: `backdrop-blur-md bg-white/70`
- Cards: `backdrop-blur-lg bg-white/60`
- Forms: `backdrop-blur-xl bg-white/80`
- Overlays: `backdrop-blur-sm bg-black/20`

### 2. Animations
- Page transitions: Fade in with slide up
- Hover effects: Scale and shadow
- Loading states: Smooth spinners
- Form submissions: Success animations

### 3. Color Palette (Already Set)
- Primary: `#3547d4` (Deep Blue)
- Secondary: `#f6deac` (Warm Beige)
- Accent: `#e8604f` (Coral Red)
- Dark: `#1a1429` (Deep Purple-Black)
- Background: `#f9f6f1` (Warm White)

### 4. Login Page Redesign
- Remove the centered rectangle box
- Full-page split design with left-side form, right-side hero
- Better visual hierarchy
- Smooth role switching

### 5. Profile Page Updates
- Remove redundant "Your profile snapshot" section
- Add avatar upload with preview
- Show: Username, Roll No, Division, Department, Year
- Clean, card-based layout

## Workflow Features

### Student Workflow
1. **View Active Forms**: See all currently active feedback forms on dashboard
2. **Submit Feedback Without Form**: Select teacher from navbar dropdown (any of 6 teachers)
3. **Filter & Sort**: Filter forms by subject/course
4. **Track Submissions**: See submitted feedback history

### Teacher Workflow
1. **Create Feedback Forms**: Float new forms for their courses
2. **View Responses**: See all feedback submitted for their courses only
3. **Analytics**: View aggregated feedback statistics
4. **Manage Forms**: Activate/deactivate forms

### Admin Workflow
1. **View All Feedback**: Access to all feedback across all teachers
2. **Analytics Dashboard**: System-wide statistics
3. **Manage Teachers**: Create teacher accounts via fallback route

## Test Credentials

```
Student Login:
- Email: student@vit.edu.in
- Password: 123456

Teacher Login (any of these):
- Email: sachin.deshmukh@vit.edu.in (or just: sachin.deshmukh)
- Password: 123456

Admin Login:
- Username: admin
- Password: 123456
```

## API Endpoints to Verify

1. `POST /api/feedback/submit` - Student submits feedback
2. `POST /api/admin/create-teacher` - Admin creates teacher account
3. `POST /api/auth/logout` - Logout (fixed for speed)

## Development Checklist

- [ ] Run new-schema-updated.sql in Supabase
- [ ] Create all 8 users in Supabase Auth Dashboard
- [ ] Run seed-data-updated.sql
- [ ] Update login page UI (remove rectangle box)
- [ ] Update profile page (add avatar upload, remove snapshot)
- [ ] Add glassmorphism effects to all components
- [ ] Add animations throughout
- [ ] Implement teacher form creation interface
- [ ] Update student dashboard with active forms
- [ ] Add direct teacher feedback in navbar
- [ ] Test all workflows end-to-end

## File Structure

```
supabase/
  new-schema-updated.sql     # New database schema
  seed-data-updated.sql      # Test data and courses
  
src/
  app/
    (auth)/login/page.tsx    # Login redesign needed
    profile/page.tsx         # Profile updates needed
    student/page.tsx         # Dashboard with active forms
    teacher/page.tsx         # Teacher form management
    feedback/page.tsx        # Feedback submission
  
  components/
    Navbar.tsx               # Add direct feedback dropdown
    profile/AvatarUploader.tsx  # Already exists
```

## Next Steps

1. Apply database changes
2. Create test users
3. Update UI components with glassmorphism
4. Implement workflows
5. Test thoroughly
6. Deploy
