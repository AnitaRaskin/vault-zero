// ─── Supabase setup ──────────────────────────────────────────
//
// AUTHENTICATION SETUP (run once in Supabase dashboard):
//
// 1. Dashboard → Authentication → Providers → Email
//    Enable it, turn OFF "Confirm email"
//
// 2. SQL Editor → run:
//
//   ALTER TABLE scores ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
//
//   CREATE TABLE IF NOT EXISTS profiles (
//     id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
//     username   text UNIQUE NOT NULL,
//     created_at timestamptz DEFAULT now()
//   );
//   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "public read" ON profiles FOR SELECT USING (true);
//   CREATE POLICY "own insert"  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
//   CREATE POLICY "own update"  ON profiles FOR UPDATE USING (auth.uid() = id);
//
// SCORES TABLE (existing, with user_id column added above):
//   id              int8 primary key identity
//   codename        text not null
//   user_id         uuid references auth.users(id)   ← new
//   total_time      int8
//   rooms_completed int8
//   hints_used      int8
//   commands_used   text
//   completed_at    timestamptz
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://dcmbfeammfoagarfejsf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_diY2UT6oSYW_7sgNzNE-UA_tY0SQz1s';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

// ─── Auth ────────────────────────────────────────────────────

function _toEmail(codename) {
  return `${codename.toLowerCase().replace(/[^a-z0-9_-]/g, '')}@vault-zero.game`;
}

async function authSignUp(codename, password) {
  const email = _toEmail(codename);
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return { error: 'codename already taken — try logging in instead' };
    }
    return { error: error.message };
  }
  if (!data.user) return { error: 'sign-up failed — try again' };
  const { error: profErr } = await sb.from('profiles').insert({ id: data.user.id, username: codename });
  if (profErr) {
    if (profErr.code === '23505') return { error: 'codename already taken — choose another' };
    return { error: profErr.message };
  }
  return { userId: data.user.id };
}

async function authSignIn(codename, password) {
  const email = _toEmail(codename);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: 'wrong codename or password' };
  return { userId: data.user?.id };
}

async function authSignOut() {
  await sb.auth.signOut();
}

// ─── Score / leaderboard ─────────────────────────────────────

async function saveScore({ codename, totalTime, roomsCompleted, hintsUsed, finalScore, commandsUsed, userId }) {
  const payload = {
    codename,
    total_time:      totalTime,
    rooms_completed: roomsCompleted,
    hints_used:      hintsUsed,
    final_score:     finalScore,
    commands_used:   JSON.stringify(commandsUsed),
    completed_at:    new Date().toISOString()
  };
  if (userId) payload.user_id = userId;
  const { error } = await sb.from('scores').insert(payload);
  if (error) {
    console.error('[vault-zero] saveScore failed:', error.message, error.code);
  }
  return !error;
}

async function getLeaderboard() {
  const { data } = await sb
    .from('scores')
    .select('codename, final_score, rooms_completed, total_time, user_id')
    .order('rooms_completed', { ascending: false })
    .order('final_score',     { ascending: false })
    .order('total_time',      { ascending: true })
    .limit(50);
  if (!data) return [];
  // One entry per authenticated user (best score first due to ordering); keep all anonymous rows
  const seen = new Set();
  return data.filter(row => {
    if (!row.user_id) return true;
    if (seen.has(row.user_id)) return false;
    seen.add(row.user_id);
    return true;
  }).slice(0, 10);
}

async function getSessionUser() {
  const { data } = await sb.auth.getUser();
  if (!data?.user) return null;
  const { data: profile } = await sb.from('profiles').select('username').eq('id', data.user.id).single();
  return { userId: data.user.id, codename: profile?.username || '' };
}

async function authSignInWithGoogle() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href.split('?')[0].split('#')[0] }
  });
  if (error) {
    const msg = error.message.toLowerCase().includes('not enabled') || error.message.includes('validation_failed')
      ? 'Google login not configured yet — use codename + password'
      : error.message;
    return { error: msg };
  }
  return {};
}

async function ensureProfile(user) {
  const { data: existing } = await sb.from('profiles').select('username').eq('id', user.id).single();
  if (existing) return existing.username;
  const base = ((user.user_metadata?.full_name || user.email.split('@')[0]) + '')
    .toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 18) || 'operative';
  let username = base;
  const { error } = await sb.from('profiles').insert({ id: user.id, username });
  if (error?.code === '23505') {
    username = base.slice(0, 15) + Math.floor(Math.random() * 999);
    await sb.from('profiles').insert({ id: user.id, username });
  }
  return username;
}
