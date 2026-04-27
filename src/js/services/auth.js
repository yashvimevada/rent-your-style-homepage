import { supabase } from '../utils/supabaseClient.js';

/**
 * Sign up a new user.
 * Stores name and phone as user_metadata so they persist even before email confirmation.
 */
export async function signUp(email, password, name, phone) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone: phone,
      },
    },
  });

  if (error) throw error;

  // Supabase returns a user with no identities when email already exists
  // (instead of throwing an error). Detect this case and give a clear message.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error("An account with this email already exists. Please log in instead.");
  }

  // If the user is immediately confirmed (email confirmation disabled in Supabase settings),
  // create their profile row right away.
  if (data.user && data.session) {
    await ensureUserProfile(data.user);
  }

  return data;
}

/**
 * Log in an existing user.
 * After successful login, ensures the user has a profile row in public.users.
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Ensure user profile exists in the public.users table on every login
  if (data.user) {
    await ensureUserProfile(data.user);
  }

  return data;
}

/**
 * Ensure a profile row exists in public.users for the given auth user.
 * Uses upsert to avoid duplicate key errors.
 */
async function ensureUserProfile(user) {
  const metadata = user.user_metadata || {};

  const { error } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        name: metadata.full_name || '',
        email: user.email,
        phone: metadata.phone || '',
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Error upserting user profile:', error);
    // Don't throw here — login should still succeed even if profile upsert fails
  }
}

/**
 * Log out the current user
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Send a password reset email to the given address
 */
export async function resetPassword(email, redirectTo) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${window.location.origin}/login?type=recovery`,
  });
  if (error) throw error;
}

/**
 * Update the password for the currently authenticated user (used in recovery flow)
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}

/**
 * Get the currently authenticated user session details
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
  return user;
}

/**
 * Get the full profile of the currently logged in user from the users table
 */
export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}
