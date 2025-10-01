#!/usr/bin/env node
'use strict';

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const LEGACY_DOMAIN = (process.env.LEGACY_EMAIL_DOMAIN || 'local.dev').toLowerCase();
const TEACHER_DOMAIN = (process.env.NEXT_PUBLIC_TEACHER_EMAIL_DOMAIN || 'vit.edu.in').toLowerCase();
const ADMIN_DOMAIN = (process.env.ADMIN_EMAIL_DOMAIN || TEACHER_DOMAIN).toLowerCase();
const DEFAULT_TEACHER_PASSWORD = process.env.NEXT_PUBLIC_DEFAULT_TEACHER_PASSWORD || '123456';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function buildUpdatePayload(user, role, newEmail) {
  const baseMetadata = { ...(user.user_metadata || {}), role };
  const payload = {
    email: newEmail,
    email_confirm: true,
    user_metadata: baseMetadata,
  };

  if (role === 'teacher') {
    payload.password = DEFAULT_TEACHER_PASSWORD;
  } else if (role === 'admin') {
    payload.password = DEFAULT_ADMIN_PASSWORD;
  }

  return payload;
}

async function updateProfileEmail(userId, newEmail) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ email: newEmail })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to update profile email for ${userId}: ${error.message}`);
  }
}

async function main() {
  console.log('Normalizing Supabase auth emails to institutional domains...');
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

  if (error) {
    throw new Error(`Failed to list users: ${error.message}`);
  }

  const users = data?.users ?? [];
  if (!users.length) {
    console.log('No users found. Nothing to update.');
    return;
  }

  const results = {
    updated: 0,
    skipped: 0,
    failures: 0,
  };

  for (const user of users) {
    const email = (user.email || '').toLowerCase();
    if (!email.endsWith(`@${LEGACY_DOMAIN}`)) {
      results.skipped += 1;
      continue;
    }

    const role = ((user.user_metadata?.role || '') || '').toString().toLowerCase();
    const normalizedRole = role === 'admin' ? 'admin' : 'teacher';
    const targetDomain = normalizedRole === 'admin' ? ADMIN_DOMAIN : TEACHER_DOMAIN;
    const localPart = email.split('@')[0];
    const newEmail = `${localPart}@${targetDomain}`;

    if (email === newEmail) {
      results.skipped += 1;
      continue;
    }

    console.log(`Updating ${email} -> ${newEmail}`);

    try {
      const payload = buildUpdatePayload(user, normalizedRole, newEmail);
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, payload);
      if (updateError) {
        throw new Error(updateError.message);
      }

      await updateProfileEmail(user.id, newEmail);
      results.updated += 1;
    } catch (err) {
      results.failures += 1;
      console.error(`  ✖ Failed to update ${email}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log('Done. Summary:');
  console.log(`  Updated: ${results.updated}`);
  console.log(`  Skipped: ${results.skipped}`);
  console.log(`  Failures: ${results.failures}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
