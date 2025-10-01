## Student Feedback System (Next.js + Supabase)

### Setup
- Copy `.env.local.example` or set the following in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=service-role-key-here
NEXT_PUBLIC_VIT_EMAIL_DOMAIN=vit.edu.in
NEXT_PUBLIC_TEACHER_EMAIL_DOMAIN=vit.edu.in
NEXT_PUBLIC_DEFAULT_TEACHER_PASSWORD=123456
ADMIN_EMAIL=admin@vit.edu.in
ADMIN_PASSWORD=123456
```

- In Supabase SQL editor, run `supabase/schema.sql` from the repo root to create tables and RLS.
- (Optional) Run `npm run seed:admin` once to create or update the default campus admin account using the credentials above.

### Run
```
npm run dev
```
Visit `http://localhost:3000`.

### Features
- Email magic link login
- Submit course feedback with optional anonymity
- RLS policies ensure students can only write/read their own feedback; admins/instructors can read more broadly

### Learn
- Check `src/lib/supabaseServer.ts` and `src/lib/supabaseClient.ts` for client creation
- See `src/app/(auth)/login/page.tsx` for OTP auth
- See `src/app/feedback/page.tsx` for inserts with RLS

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
