# 🔍 DEBUG GUIDE - Login & Logout Issues

## Quick Start

### Option 1: Use the Debug Helper (Recommended)
1. Open your browser console (F12 or Ctrl+Shift+I)
2. Open the file `DEBUG_CONSOLE_HELPER.js`
3. Copy ALL the code
4. Paste it into the browser console and press Enter
5. Now try logging in or logging out - you'll see detailed logs!

### Option 2: Just Look at Console
The code now has extensive logging built-in. Just open console and watch for these:

**Login Flow Logs:**
- 🔐 [LOGIN] - All login steps
- 📧 [LOGIN] - Email preparation
- 🔄 [LOGIN] - Supabase authentication
- ✅ [LOGIN] - Success messages
- 📊 [LOGIN] - Profile fetching
- 🔀 [LOGIN] - Redirects
- ❌ [LOGIN] - Any errors

**Logout Flow Logs:**
- 🚪 [NAVBAR] - Client-side logout initiation
- 📡 [NAVBAR] - API call to logout endpoint
- 📥 [NAVBAR] - Response from server
- 🗑️ [NAVBAR] - State clearing
- 🔄 [NAVBAR] - Redirect to login
- ❌ [NAVBAR] - Any errors

**Server-side Logout Logs:**
- 🚪 [LOGOUT API] - Request received
- ✅ [LOGOUT API] - Supabase client created
- 📊 [LOGOUT API] - Current session check
- 👤 [LOGOUT API] - User before logout
- 🔄 [LOGOUT API] - Sign out call
- ✅ [LOGOUT API] - Success
- ❌ [LOGOUT API] - Any errors

## What to Look For

### If Logout Doesn't Work:

1. **Check if API is being called:**
   ```
   📡 [NAVBAR] Calling /api/auth/logout...
   ```
   - If you DON'T see this: Issue is in the Navbar button click handler
   - If you DO see this: Continue to step 2

2. **Check API response:**
   ```
   📥 [NAVBAR] Response status: 200 OK
   ```
   - If status is 404: The logout API route isn't being found
   - If status is 500: There's a server error
   - If status is 200: API worked, continue to step 3

3. **Check server-side logs:**
   ```
   🚪 [LOGOUT API] Logout request received
   ✅ [LOGOUT API] Sign out successful
   ```
   - If you see these: Logout worked on server
   - If you don't: Server-side issue

4. **Check redirect:**
   ```
   🔄 [NAVBAR] Redirecting to login page
   ```
   - If you see this but don't redirect: Browser issue
   - If you don't see this: Code stopped before redirect

### If Login Doesn't Work:

1. **Check form submission:**
   ```
   🔐 [LOGIN] Form submitted
   ```
   - If you DON'T see this: Form isn't submitting
   - If you DO see this: Continue to step 2

2. **Check email preparation:**
   ```
   📧 [LOGIN] Student email prepared: student@vit.edu.in
   ```
   - If format is wrong: Email validation issue
   - If correct: Continue to step 3

3. **Check Supabase call:**
   ```
   🔄 [LOGIN] Calling supabase.auth.signInWithPassword...
   ✅ [LOGIN] Sign in successful
   ```
   - If you see error here: Wrong credentials or Supabase issue
   - If successful: Continue to step 4

4. **Check profile fetching:**
   ```
   📊 [LOGIN] Fetching user profile...
   📊 [LOGIN] Profile data: {role: 'student', ...}
   ```
   - If profile is null: User doesn't have profile in database
   - If role is missing: Profile exists but no role assigned
   - If successful: Continue to step 5

5. **Check redirect:**
   ```
   🔀 [LOGIN] Redirecting to dashboard based on role: student
   🔀 [LOGIN] Redirecting to /student
   ```
   - If you see this but don't redirect: Browser/middleware issue
   - If you don't see this: Code stopped before redirect

## Common Issues & Solutions

### 404 Error on Logout API
**Problem:** `/api/auth/logout` returns 404
**Solution:** 
- Check if file exists: `src/app/api/auth/logout/route.ts`
- Make sure Next.js dev server is running
- Try restarting the dev server

### Redirect Not Working After Logout
**Problem:** See logout success but page doesn't redirect
**Solution:**
- Check console for `🔄 [NAVBAR] Redirecting to login page`
- Check if middleware is blocking redirect
- Try hard refresh (Ctrl+Shift+R)

### No Role Found After Login
**Problem:** `❌ [LOGIN] No role found for user`
**Solution:**
- Check Supabase profiles table
- Make sure user has a `role` column value
- Run: `UPDATE profiles SET role='student' WHERE email='your@email.com'`

### Network Request Blocked
**Problem:** Browser blocks the request
**Solution:**
- Check if CORS is configured
- Check if you're using HTTPS when needed
- Check browser console for security errors

## Files Modified

1. `src/app/api/auth/logout/route.ts` - Server-side logout with logging
2. `src/components/Navbar.tsx` - Client-side logout with logging
3. `src/app/(auth)/login/page.tsx` - Login flow with logging
4. `DEBUG_CONSOLE_HELPER.js` - Browser console helper script

## Need More Help?

Share the console output showing the logs with the error, and we can debug further!
