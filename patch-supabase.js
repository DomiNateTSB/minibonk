/**
 * patch-supabase.js
 * Wires up Supabase auth (email/password) and replaces localStorage
 * persistence with Supabase cloud storage.
 *
 * Run: node patch-supabase.js
 */
const fs = require('fs');
let s = fs.readFileSync('C:/Users/Garci/Claude 1/aurora-site.html', 'utf8').replace(/\r\n/g, '\n');
let ok = true;

function rep(old, neo, label) {
  if (!s.includes(old)) { console.error('NOT FOUND:', label); ok = false; return; }
  s = s.replace(old, neo);
  console.log('OK:', label);
}

/* ════════════════════════════════════════════════════════════
   1. Add Supabase CDN before Phaser
   ════════════════════════════════════════════════════════════ */
rep(
  `  <script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.60.0/phaser.min.js"></script>`,
  `  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.60.0/phaser.min.js"></script>`,
  'supabase cdn'
);

/* ════════════════════════════════════════════════════════════
   2. Replace name-overlay with full auth overlay
   ════════════════════════════════════════════════════════════ */
rep(
  `  <!-- Name entry overlay -->
  <div id="name-overlay" style="display:none;position:fixed;inset:0;z-index:99;background:rgba(0,0,0,0.82);backdrop-filter:blur(4px);align-items:center;justify-content:center;flex-direction:column;font-family:system-ui;">
    <p style="color:#a78bfa;font-size:13px;letter-spacing:3px;margin-bottom:12px;font-weight:bold;">HALLS OF AURORA</p>
    <h2 style="color:#fff;font-size:26px;font-weight:bold;margin-bottom:6px;">Enter your name</h2>
    <p style="color:rgba(255,255,255,0.35);font-size:13px;margin-bottom:22px;">It will appear on the leaderboard</p>
    <input id="name-input" type="text" maxlength="16" autocomplete="off" placeholder="Your name…"
      style="background:#1a1a2e;border:1.5px solid #7c3aed;border-radius:8px;color:#fff;font-size:18px;padding:10px 18px;width:260px;outline:none;text-align:center;font-family:system-ui;" />
    <button id="name-submit"
      style="margin-top:14px;background:#7c3aed;border:none;border-radius:8px;color:#fff;font-size:16px;font-weight:bold;padding:10px 36px;cursor:pointer;font-family:system-ui;letter-spacing:1px;">
      PLAY
    </button>
  </div>`,
  `  <!-- Auth overlay — shown before game starts if not logged in -->
  <style>
    #auth-overlay { display:none; position:fixed; inset:0; z-index:200; background:rgba(6,0,15,0.97);
      backdrop-filter:blur(8px); align-items:center; justify-content:center; font-family:system-ui; }
    #auth-box { width:340px; background:rgba(15,5,30,0.98); border:1.5px solid rgba(124,58,237,0.5);
      border-radius:16px; padding:36px 32px 28px; box-shadow:0 0 60px rgba(124,58,237,0.2); }
    #auth-title { color:#a78bfa; font-size:11px; letter-spacing:4px; font-weight:bold;
      text-align:center; margin-bottom:6px; }
    #auth-game-name { color:#fff; font-size:28px; font-weight:bold; text-align:center;
      margin-bottom:28px; }
    .auth-tabs { display:flex; border-bottom:1px solid rgba(124,58,237,0.3); margin-bottom:24px; }
    .auth-tab { flex:1; background:none; border:none; color:rgba(255,255,255,0.35); font-size:14px;
      font-weight:bold; padding:10px; cursor:pointer; font-family:system-ui; letter-spacing:1px;
      border-bottom:2px solid transparent; margin-bottom:-1px; transition:all 0.18s; }
    .auth-tab.active { color:#a78bfa; border-bottom-color:#7c3aed; }
    .auth-input { width:100%; background:#0e0520; border:1.5px solid rgba(124,58,237,0.4);
      border-radius:8px; color:#fff; font-size:15px; padding:11px 14px; outline:none;
      font-family:system-ui; margin-bottom:12px; box-sizing:border-box; transition:border-color 0.15s; }
    .auth-input:focus { border-color:#7c3aed; }
    .auth-input::placeholder { color:rgba(255,255,255,0.25); }
    .auth-btn { width:100%; background:#7c3aed; border:none; border-radius:8px; color:#fff;
      font-size:15px; font-weight:bold; padding:12px; cursor:pointer; font-family:system-ui;
      letter-spacing:1px; margin-top:4px; transition:background 0.15s; }
    .auth-btn:hover { background:#6d28d9; }
    .auth-btn:disabled { background:#3a1a6e; cursor:not-allowed; opacity:0.6; }
    #auth-error { color:#f87171; font-size:12px; text-align:center; min-height:18px;
      margin-top:12px; }
    #auth-success { color:#4ade80; font-size:12px; text-align:center; min-height:18px;
      margin-top:12px; }
    .auth-forgot { color:rgba(167,139,250,0.5); font-size:11px; text-align:center;
      margin-top:10px; cursor:pointer; display:block; }
    .auth-forgot:hover { color:#a78bfa; }
    #auth-loading { display:none; text-align:center; color:rgba(255,255,255,0.4);
      font-size:13px; margin-top:10px; }
  </style>

  <div id="auth-overlay" style="display:none;position:fixed;inset:0;z-index:200;align-items:center;justify-content:center;">
    <div id="auth-box">
      <p id="auth-title">HALLS OF AURORA</p>
      <h2 id="auth-game-name">Sign In</h2>
      <div class="auth-tabs">
        <button class="auth-tab active" id="tab-signin" onclick="_authTab('signin')">Sign In</button>
        <button class="auth-tab"        id="tab-signup" onclick="_authTab('signup')">Create Account</button>
      </div>

      <!-- Sign In form -->
      <div id="form-signin">
        <input class="auth-input" id="si-email"    type="email"    placeholder="Email address" autocomplete="email" />
        <input class="auth-input" id="si-password" type="password" placeholder="Password"      autocomplete="current-password" />
        <button class="auth-btn" id="si-btn" onclick="_doSignIn()">SIGN IN</button>
        <span class="auth-forgot" onclick="_doForgot()">Forgot password?</span>
      </div>

      <!-- Sign Up form -->
      <div id="form-signup" style="display:none">
        <input class="auth-input" id="su-name"     type="text"     placeholder="Display name (max 16 chars)" maxlength="16" autocomplete="off" />
        <input class="auth-input" id="su-email"    type="email"    placeholder="Email address" autocomplete="email" />
        <input class="auth-input" id="su-password" type="password" placeholder="Password (min 6 chars)"      autocomplete="new-password" />
        <button class="auth-btn" id="su-btn" onclick="_doSignUp()">CREATE ACCOUNT</button>
      </div>

      <div id="auth-error"></div>
      <div id="auth-success"></div>
      <div id="auth-loading">Loading…</div>
    </div>
  </div>`,
  'auth overlay html'
);

/* ════════════════════════════════════════════════════════════
   3. Add Supabase client + auth logic right after the game
      script opens (before the first const W = ...)
   ════════════════════════════════════════════════════════════ */
rep(
  `  const W = window.innerWidth;
  const H = window.innerHeight;`,
  `  /* ── SUPABASE CLIENT ── */
  const _sb = supabase.createClient(
    'https://biclaeemulhkdejyeysv.supabase.co',
    'sb_publishable_6o1Iaj3yMd5thivLqY8ttQ_L19qyZ5-'
  );

  /* In-session player cache — populated on login, used everywhere */
  window._player = null; /* { id, name } */

  /* ── AUTH HELPERS ── */
  function _authSetError(msg) {
    document.getElementById('auth-error').textContent = msg || '';
    document.getElementById('auth-success').textContent = '';
  }
  function _authSetSuccess(msg) {
    document.getElementById('auth-success').textContent = msg || '';
    document.getElementById('auth-error').textContent = '';
  }
  function _authSetLoading(on) {
    document.getElementById('auth-loading').style.display = on ? 'block' : 'none';
    ['si-btn','su-btn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = on;
    });
  }
  function _authTab(tab) {
    document.getElementById('form-signin').style.display = tab === 'signin' ? 'block' : 'none';
    document.getElementById('form-signup').style.display = tab === 'signup' ? 'block' : 'none';
    document.getElementById('tab-signin').className = 'auth-tab' + (tab === 'signin' ? ' active' : '');
    document.getElementById('tab-signup').className = 'auth-tab' + (tab === 'signup' ? ' active' : '');
    document.getElementById('auth-game-name').textContent = tab === 'signin' ? 'Sign In' : 'Create Account';
    _authSetError(''); _authSetSuccess('');
  }

  async function _doSignIn() {
    const email = document.getElementById('si-email').value.trim();
    const password = document.getElementById('si-password').value;
    if (!email || !password) { _authSetError('Please fill in all fields.'); return; }
    _authSetLoading(true); _authSetError('');
    const { error } = await _sb.auth.signInWithPassword({ email, password });
    _authSetLoading(false);
    if (error) { _authSetError(error.message); return; }
    await _onAuthSuccess();
  }

  async function _doSignUp() {
    const name = document.getElementById('su-name').value.trim().slice(0, 16);
    const email = document.getElementById('su-email').value.trim();
    const password = document.getElementById('su-password').value;
    if (!name) { _authSetError('Please enter a display name.'); return; }
    if (!email || !password) { _authSetError('Please fill in all fields.'); return; }
    if (password.length < 6) { _authSetError('Password must be at least 6 characters.'); return; }
    _authSetLoading(true); _authSetError('');
    const { error: signUpError } = await _sb.auth.signUp({ email, password });
    if (signUpError) { _authSetLoading(false); _authSetError(signUpError.message); return; }
    /* Create player profile */
    const { error: profileError } = await _sb.rpc('setup_new_player', { player_name: name });
    _authSetLoading(false);
    if (profileError) {
      if (profileError.message && profileError.message.includes('unique')) {
        _authSetError('That name is already taken. Please choose another.');
      } else {
        _authSetError(profileError.message || 'Failed to create profile.');
      }
      await _sb.auth.signOut();
      return;
    }
    _authSetSuccess('Account created! Starting game…');
    await _onAuthSuccess();
  }

  async function _doForgot() {
    const email = document.getElementById('si-email').value.trim();
    if (!email) { _authSetError('Enter your email address first.'); return; }
    _authSetLoading(true);
    const { error } = await _sb.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://halls-of-aurora.vercel.app',
    });
    _authSetLoading(false);
    if (error) { _authSetError(error.message); }
    else { _authSetSuccess('Password reset email sent!'); }
  }

  async function _onAuthSuccess() {
    const { data: { user } } = await _sb.auth.getUser();
    if (!user) return;
    /* Load player profile */
    const { data: profile } = await _sb.from('game_players').select('name').eq('id', user.id).single();
    if (!profile) return;
    window._player = { id: user.id, name: profile.name };
    localStorage.setItem('hoa_name', profile.name);
    /* Load all player data into localStorage cache */
    await _loadPlayerDataFromSupabase(user.id);
    /* Hide auth overlay, let the game start */
    document.getElementById('auth-overlay').style.display = 'none';
    if (!window._phaserStarted) { _startPhaser(); }
  }

  async function _loadPlayerDataFromSupabase(uid) {
    const [progressRes, achRes, statsRes] = await Promise.all([
      _sb.from('game_progress').select('*').eq('player_id', uid).single(),
      _sb.from('game_achievements').select('unlocked').eq('player_id', uid).single(),
      _sb.from('game_stats').select('*').eq('player_id', uid).single(),
    ]);
    if (progressRes.data) {
      const p = progressRes.data;
      const meta = {
        souls: p.souls || 0,
        upgrades: p.upgrades || {},
        bestWave: p.best_wave || 0,
        bestKills: p.best_kills || 0,
        bestLevel: p.best_level || 0,
        _econV2: true,
      };
      localStorage.setItem('hoa_meta', JSON.stringify(meta));
    }
    if (achRes.data) {
      localStorage.setItem('hoa_ach', JSON.stringify(achRes.data.unlocked || []));
    }
    if (statsRes.data) {
      const st = statsRes.data;
      const stats = {
        totalKills: st.total_kills || 0,
        totalRuns: st.total_runs || 0,
        totalSouls: st.total_souls || 0,
        totalBossKills: st.total_boss_kills || 0,
        bestWave: st.best_wave || 0,
        bestLevel: st.best_level || 0,
        bestKillRun: st.best_kill_run || 0,
        bestEliteRun: st.best_elite_run || 0,
        bestDmgRun: st.best_dmg_run || 0,
        bestLegendaryRun: st.best_legendary_run || 0,
        best1hpSec: st.best_1hp_sec || 0,
        lastTimeSec: st.last_time_sec || 0,
        perfectWaveEver: st.perfect_wave_ever || false,
      };
      /* Restore played_class flags */
      const cp = st.classes_played || {};
      Object.keys(cp).forEach(c => { stats['played_' + c] = cp[c]; });
      localStorage.setItem('hoa_stats', JSON.stringify(stats));
    }
    /* Run history */
    const { data: runs } = await _sb.from('game_runs')
      .select('class,wave,kills,level,created_at')
      .eq('player_id', uid)
      .order('created_at', { ascending: false })
      .limit(5);
    if (runs) {
      const hist = runs.map(r => ({
        cls: r.class, wave: r.wave, kills: r.kills, level: r.level,
        date: new Date(r.created_at).toLocaleDateString(),
      }));
      localStorage.setItem('hoa_history', JSON.stringify(hist));
    }
  }

  async function _syncToSupabase() {
    const uid = window._player && window._player.id;
    if (!uid) return;
    try {
      const meta  = JSON.parse(localStorage.getItem('hoa_meta')  || '{}');
      const stats = JSON.parse(localStorage.getItem('hoa_stats') || '{}');
      const ach   = JSON.parse(localStorage.getItem('hoa_ach')   || '[]');

      const classesPlayed = {};
      Object.keys(stats).filter(k => k.startsWith('played_')).forEach(k => {
        classesPlayed[k.replace('played_', '')] = true;
      });

      await Promise.all([
        _sb.from('game_progress').upsert({
          player_id: uid,
          souls: meta.souls || 0,
          upgrades: meta.upgrades || {},
          best_wave: meta.bestWave || 0,
          best_kills: meta.bestKills || 0,
          best_level: meta.bestLevel || 0,
          updated_at: new Date().toISOString(),
        }),
        _sb.from('game_achievements').upsert({
          player_id: uid,
          unlocked: ach,
          updated_at: new Date().toISOString(),
        }),
        _sb.from('game_stats').upsert({
          player_id: uid,
          total_kills: stats.totalKills || 0,
          total_runs: stats.totalRuns || 0,
          total_souls: stats.totalSouls || 0,
          total_boss_kills: stats.totalBossKills || 0,
          best_wave: stats.bestWave || 0,
          best_level: stats.bestLevel || 0,
          best_kill_run: stats.bestKillRun || 0,
          best_elite_run: stats.bestEliteRun || 0,
          best_dmg_run: stats.bestDmgRun || 0,
          best_legendary_run: stats.bestLegendaryRun || 0,
          best_1hp_sec: stats.best1hpSec || 0,
          last_time_sec: stats.lastTimeSec || 0,
          perfect_wave_ever: stats.perfectWaveEver || false,
          classes_played: classesPlayed,
          updated_at: new Date().toISOString(),
        }),
      ]);
    } catch (e) { /* non-blocking — run still saves locally */ }
  }

  async function _syncRunToSupabase(run) {
    const uid = window._player && window._player.id;
    if (!uid) return;
    try {
      await _sb.from('game_runs').insert({
        player_id: uid,
        class: run.cls,
        wave: run.wave,
        kills: run.kills,
        level: run.level,
        souls: run.souls || 0,
        time_sec: run.timeSec || 0,
        is_daily: run.isDaily || false,
        traits: run.traits || [],
      });
    } catch {}
  }

  async function _syncDailyToSupabase(dateKey, entry) {
    const uid = window._player && window._player.id;
    if (!uid) return;
    try {
      await _sb.from('game_daily').upsert({
        player_id: uid,
        date_key: dateKey,
        score: entry.score,
        wave: entry.wave,
        kills: entry.kills,
        level: entry.level,
        class: entry.cls,
      });
    } catch {}
  }

  const W = window.innerWidth;
  const H = window.innerHeight;`,
  'supabase client + auth logic'
);

/* ════════════════════════════════════════════════════════════
   4. Wrap Phaser.Game init — check session first
   ════════════════════════════════════════════════════════════ */
rep(
  `  new Phaser.Game({`,
  `  window._phaserStarted = false;
  function _startPhaser() {
    window._phaserStarted = true;
    new Phaser.Game({`,
  'wrap phaser start open'
);

rep(
  `    scene: [MenuScene, ClassSelectScene, SkinPickerScene, GameScene, UIScene, LevelUpScene, SummaryScene, MetaScene, PauseMenuScene, AchievementsScene],
  });`,
  `    scene: [MenuScene, ClassSelectScene, SkinPickerScene, GameScene, UIScene, LevelUpScene, SummaryScene, MetaScene, PauseMenuScene, AchievementsScene],
    });
  }

  /* Check for existing session on page load */
  (async () => {
    const { data: { session } } = await _sb.auth.getSession();
    if (session) {
      const { data: profile } = await _sb.from('game_players').select('name').eq('id', session.user.id).single();
      if (profile) {
        window._player = { id: session.user.id, name: profile.name };
        localStorage.setItem('hoa_name', profile.name);
        await _loadPlayerDataFromSupabase(session.user.id);
        _startPhaser();
        return;
      }
    }
    /* No valid session — show auth overlay */
    document.getElementById('auth-overlay').style.display = 'flex';
  })();`,
  'wrap phaser start close'
);

/* ════════════════════════════════════════════════════════════
   5. Sync to Supabase on run end (non-blocking, after local save)
   ════════════════════════════════════════════════════════════ */
rep(
  `      saveRunHistory({ cls: this.ps.class || 'hunter', wave: this.waveNum, kills: this.ps.kills || 0, level: this.ps.level, traits: (this.ps.traits || []).slice(), timeSec, date: new Date().toLocaleDateString() });`,
  `      saveRunHistory({ cls: this.ps.class || 'hunter', wave: this.waveNum, kills: this.ps.kills || 0, level: this.ps.level, traits: (this.ps.traits || []).slice(), timeSec, date: new Date().toLocaleDateString() });
      /* Sync all data to Supabase in background */
      _syncToSupabase();
      _syncRunToSupabase({ cls: this.ps.class || 'hunter', wave: this.waveNum, kills: this.ps.kills || 0, level: this.ps.level, souls, timeSec, isDaily: this.isDaily, traits: (this.ps.traits || []).slice() });`,
  'sync run to supabase'
);

/* ════════════════════════════════════════════════════════════
   6. Sync daily score to Supabase when saved
   ════════════════════════════════════════════════════════════ */
rep(
  `            localStorage.setItem(dateKey, JSON.stringify({
              score: dailyScore, wave: this.waveNum, kills: this.ps.kills || 0,
              level: this.ps.level || 1, cls: this.ps.class || 'hunter',
              name: localStorage.getItem('hoa_name') || '?',
            }));`,
  `            const _dailyEntry = {
              score: dailyScore, wave: this.waveNum, kills: this.ps.kills || 0,
              level: this.ps.level || 1, cls: this.ps.class || 'hunter',
              name: localStorage.getItem('hoa_name') || '?',
            };
            localStorage.setItem(dateKey, JSON.stringify(_dailyEntry));
            _syncDailyToSupabase(getDailySeed(), _dailyEntry);`,
  'sync daily to supabase'
);

/* ════════════════════════════════════════════════════════════
   7. Remove sign-out prompt from MetaScene change-name button
      Replace with a proper sign-out option
   ════════════════════════════════════════════════════════════ */
rep(
  `      nameBtn.on('pointerdown', () => {
        localStorage.removeItem('hoa_name');
        this.scene.start('Menu');
      });`,
  `      nameBtn.on('pointerdown', async () => {
        if (confirm('Sign out of Halls of Aurora?')) {
          await _sb.auth.signOut();
          localStorage.clear();
          window._player = null;
          window.location.reload();
        }
      });`,
  'sign out button'
);

/* ════════════════════════════════════════════════════════════
   Write output
   ════════════════════════════════════════════════════════════ */
if (!ok) { console.error('\nAborted — fix NOT FOUND errors.'); process.exit(1); }
fs.writeFileSync('C:/Users/Garci/Claude 1/aurora-site.html', s, 'utf8');
console.log('\nDone. Size:', s.length);
