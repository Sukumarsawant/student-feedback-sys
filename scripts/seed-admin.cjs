#!/usr/bin/env node
'use strict';

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const TARGET_EMAIL = (process.env.ADMIN_EMAIL || 'admin@vit.edu.in').toLowerCase();
const TARGET_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
const TARGET_FULL_NAME = process.env.ADMIN_FULL_NAME || 'System Administrator';
const TARGET_EMPLOYEE_ID = process.env.ADMIN_EMPLOYEE_ID || 'ADMIN001';
const TARGET_DEPARTMENT = process.env.ADMIN_DEPARTMENT || 'Administration';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findExistingAdmin(users) {
  const lowerTarget = TARGET_EMAIL.toLowerCase();
  let candidate = null;

  for (const user of users) {
    const email = (user.email || '').toLowerCase();
    const role = (user.user_metadata?.role || '').toLowerCase();
    if (email === lowerTarget) {
      return user;
    }
    if (!candidate && role === 'admin') {
      candidate = user;
    }
  }

  return candidate;
}

async function ensureAdminProfile(userId, email) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: userId,
        email,
        full_name: TARGET_FULL_NAME,
        role: 'admin',
        employee_id: TARGET_EMPLOYEE_ID,
        department: TARGET_DEPARTMENT,
      },
      { onConflict: 'id' }
    );

  if (error) {
    throw new Error(`Failed to upsert admin profile: ${error.message}`);
  }
}

async function main() {
  console.log('Ensuring admin account at', TARGET_EMAIL);

  const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  const existing = await findExistingAdmin(listData.users || []);

  if (existing) {
    if ((existing.email || '').toLowerCase() !== TARGET_EMAIL || existing.user_metadata?.role !== 'admin') {
      console.log('Updating existing admin user');
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        email: TARGET_EMAIL,
        password: TARGET_PASSWORD,
        user_metadata: {
          ...(existing.user_metadata || {}),
          role: 'admin',
          full_name: TARGET_FULL_NAME,
          employee_id: TARGET_EMPLOYEE_ID,
          department: TARGET_DEPARTMENT,
        },
        email_confirm: true,
      });

      if (updateError) {
        throw new Error(`Failed to update admin user: ${updateError.message}`);
      }
      console.log('Admin credentials updated.');
    } else {
      console.log('Admin user already configured. Ensuring password and metadata are set.');
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: TARGET_PASSWORD,
        user_metadata: {
          ...(existing.user_metadata || {}),
          role: 'admin',
          full_name: TARGET_FULL_NAME,
          employee_id: TARGET_EMPLOYEE_ID,
          department: TARGET_DEPARTMENT,
        },
        email_confirm: true,
      });
      if (updateError) {
        throw new Error(`Failed to refresh admin credentials: ${updateError.message}`);
      }
    }

    await ensureAdminProfile(existing.id, TARGET_EMAIL);
    console.log('Admin profile synced.');
    return;
  }

  console.log('Creating new admin user.');
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: TARGET_EMAIL,
    password: TARGET_PASSWORD,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      full_name: TARGET_FULL_NAME,
      employee_id: TARGET_EMPLOYEE_ID,
      department: TARGET_DEPARTMENT,
    },
  });

  if (createError) {
    throw new Error(`Failed to create admin user: ${createError.message}`);
  }

  if (!created.user) {
    throw new Error('Admin user creation returned without user payload.');
  }

  await ensureAdminProfile(created.user.id, TARGET_EMAIL);
  console.log('Admin account ready. Email:', TARGET_EMAIL, 'Password:', TARGET_PASSWORD);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
