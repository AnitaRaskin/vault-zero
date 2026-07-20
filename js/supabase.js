// ─── Supabase setup ──────────────────────────────────────────
// Table: scores
//   id             int8 primary key identity
//   codename       text not null
//   total_time     int8
//   rooms_completed int8
//   hints_used     int8
//   commands_used  text
//   completed_at   timestamptz
//
// Run once in Supabase SQL Editor to enable public read/write:
//   ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "anyone can insert" ON scores FOR INSERT WITH CHECK (true);
//   CREATE POLICY "anyone can read"   ON scores FOR SELECT USING (true);
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://dcmbfeammfoagarfejsf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_diY2UT6oSYW_7sgNzNE-UA_tY0SQz1s';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function saveScore({ codename, totalTime, roomsCompleted, hintsUsed, finalScore, commandsUsed }) {
  const { error } = await sb.from('scores').insert({
    codename,
    total_time:      totalTime,
    rooms_completed: roomsCompleted,
    hints_used:      hintsUsed,
    final_score:     finalScore,
    commands_used:   JSON.stringify(commandsUsed),
    completed_at:    new Date().toISOString()
  });
  if (error) {
    console.error('[vault-zero] saveScore failed:', error.message, error.code);
  }
  return !error;
}

async function getLeaderboard() {
  const { data } = await sb
    .from('scores')
    .select('codename, final_score, rooms_completed, total_time')
    .order('rooms_completed', { ascending: false })
    .order('final_score',     { ascending: false })
    .order('total_time',      { ascending: true })
    .limit(10);
  return data || [];
}
