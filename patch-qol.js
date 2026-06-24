const fs = require('fs');
let s = fs.readFileSync('C:/Users/Garci/Claude 1/aurora-site.html', 'utf8');

/* helper: replace first occurrence, error if not found */
function rep(old, neo, label) {
  if (!s.includes(old)) { console.error('NOT FOUND:', label); process.exit(1); }
  s = s.replace(old, neo);
  console.log('OK:', label);
}

/* ════════════════════════════════════════════════════════════
   1. RUN HISTORY helpers + save call
   ════════════════════════════════════════════════════════════ */

// Add helpers after checkAchievements function
rep(
  `  function isClassUnlocked(cls) {`,
  `  /* ── Run history ── */
  function loadHistory() { try { return JSON.parse(localStorage.getItem('hoa_history')) || []; } catch { return []; } }
  function saveRunHistory(run) {
    const h = loadHistory();
    h.unshift(run);
    if (h.length > 5) h.length = 5;
    try { localStorage.setItem('hoa_history', JSON.stringify(h)); } catch {}
  }

  function isClassUnlocked(cls) {`,
  'run history helpers'
);

// Save run just before the scene transition in GameScene die()
rep(
  `      this._newAchievements = checkAchievements(st);`,
  `      this._newAchievements = checkAchievements(st);
      saveRunHistory({ cls: this.ps.class || 'hunter', wave: this.waveNum, kills: this.ps.kills || 0, level: this.ps.level, traits: (this.ps.traits || []).slice(), timeSec, date: new Date().toLocaleDateString() });`,
  'save run history on death'
);

/* ════════════════════════════════════════════════════════════
   2. ACHIEVEMENT NOTIFICATIONS mid-run
   ════════════════════════════════════════════════════════════ */

// Add checkAchievementsMidRun after checkAchievements (single-line anchor avoids CRLF issues)
rep(
  `  function isClassUnlocked(cls) {`,
  `  /* Check achievements against live run state so toasts fire during play */
  function checkAchievementsMidRun(ps, waveNum, kills, timeSec) {
    const st = loadStats();
    const aug = Object.assign({}, st, {
      totalKills:    (st.totalKills || 0) + (kills || 0),
      bestWave:      Math.max(st.bestWave || 0, waveNum || 0),
      bestKillRun:   Math.max(st.bestKillRun || 0, kills || 0),
      lastTimeSec:   timeSec || 0,
      bestLevel:     Math.max(st.bestLevel || 0, ps.level || 0),
      ['played_' + (ps.class || 'hunter')]: true,
    });
    const granted = loadAch();
    const newlyGranted = [];
    ACHIEVEMENTS.forEach(ach => {
      if (granted.includes(ach.id)) return;
      if (ach.check(aug)) { granted.push(ach.id); newlyGranted.push(ach); }
    });
    if (newlyGranted.length) saveAch(granted);
    return newlyGranted;
  }

  function isClassUnlocked(cls) {`,
  'checkAchievementsMidRun'
);

// Add _lastAchCheckTime init in GameScene create() — find where _startTime or timing is initialised
rep(
  `      this.speedBoostActive = false; this._preBoostSpd = 0; this._speedTimer = null;`,
  `      this.speedBoostActive = false; this._preBoostSpd = 0; this._speedTimer = null;
      this._lastAchCheckTime = 0; this._startTime = this.time.now;`,
  'init ach check time'
);

// Add periodic ach check in GameScene.update() — insert just before window._liveRunState update
rep(
  `      window._liveRunState = {`,
  `      /* mid-run achievement check every 6 seconds */
      if (time - this._lastAchCheckTime > 6000 && !this.dead) {
        this._lastAchCheckTime = time;
        const runSec = Math.floor((time - (this._startTime || time)) / 1000);
        const newAchs = checkAchievementsMidRun(this.ps, this.waveNum, this.ps.kills || 0, runSec);
        newAchs.forEach(a => window.dispatchEvent(new CustomEvent('hoa:achUnlocked', { detail: a })));
      }

      window._liveRunState = {`,
  'mid-run ach check in update'
);

/* ════════════════════════════════════════════════════════════
   3. UIScene: toast system + trait pill tooltips
   ════════════════════════════════════════════════════════════ */

// Add toast infrastructure at end of UIScene.create(), just before the closing brace
rep(
  `      g.events.on('kill',  k  => this.killTxt.setText(\`Kills: \${k}\`));`,
  `      /* ── Achievement toast ── */
      this._toastQueue = [];
      this._toastBusy  = false;
      window.addEventListener('hoa:achUnlocked', e => {
        this._toastQueue.push(e.detail);
        if (!this._toastBusy) this._nextToast();
      });

      g.events.on('kill',  k  => this.killTxt.setText(\`Kills: \${k}\`));`,
  'UIScene toast setup'
);

// Add toast method + trait tooltip to UIScene (before _refreshTraits)
rep(
  `    _refreshTraits(ps) {`,
  `    _nextToast() {
      if (!this._toastQueue.length) { this._toastBusy = false; return; }
      this._toastBusy = true;
      const ach = this._toastQueue.shift();
      const cx = this.scale.width / 2;
      const cont = this.add.container(cx, -56).setDepth(200);
      const bg   = this.add.rectangle(0, 0, 300, 50, 0x100020, 0.96).setStrokeStyle(1.5, 0xa78bfa, 0.9);
      const ico  = this.add.text(-122, 0, ach.icon, { fontSize:'20px' }).setOrigin(0.5);
      const top  = this.add.text(-96, -11, 'ACHIEVEMENT UNLOCKED', {
        fontSize:'8px', fontFamily:'system-ui', fontStyle:'bold', color:'#7c3aed', letterSpacing:1,
      }).setOrigin(0, 0.5);
      const nm   = this.add.text(-96, 6, ach.name, {
        fontSize:'13px', fontFamily:'system-ui', fontStyle:'bold', color:'#e9d5ff',
      }).setOrigin(0, 0.5);
      cont.add([bg, ico, top, nm]);
      this.tweens.add({ targets: cont, y: 68, duration: 420, ease: 'Back.Out',
        onComplete: () => this.time.delayedCall(2600, () =>
          this.tweens.add({ targets: cont, y: -56, duration: 300, ease: 'Power2.In',
            onComplete: () => { cont.destroy(); this._nextToast(); } })
        )
      });
    }

    /* Trait pill tooltip — shown when hovering a pill in the bottom-right panel */
    _showTraitTooltip(bp, stacks) {
      this._hideTraitTooltip();
      const W = this.scale.width, H = this.scale.height;
      const tier = bp._takenTier || 'common';
      const tierCols = { common:'#94a3b8', rare:'#60a5fa', legendary:'#fbbf24' };
      const col = tierCols[tier] || '#94a3b8';
      const descTxt = (bp[tier] || bp.common || {}).desc || '';
      const cont = this.add.container(W - 160, H - 160).setDepth(300);
      const bg = this.add.rectangle(0, 0, 154, 54, 0x0d0820, 0.97).setStrokeStyle(1, 0x7c3aed, 0.7);
      const nm  = this.add.text(0, -14, bp.name, { fontSize:'11px', fontFamily:'system-ui', fontStyle:'bold', color:'#e9d5ff', wordWrap:{ width:140 }, align:'center' }).setOrigin(0.5);
      const dc  = this.add.text(0, 4,  descTxt,  { fontSize:'9px',  fontFamily:'system-ui', color:col, wordWrap:{ width:140 }, align:'center' }).setOrigin(0.5, 0);
      cont.add([bg, nm, dc]);
      this._tipCont = cont;
    }
    _hideTraitTooltip() {
      if (this._tipCont) { this._tipCont.destroy(); this._tipCont = null; }
    }

    _refreshTraits(ps) {`,
  'UIScene toast method + tooltip methods'
);

// Add interactivity to trait pills (pointerover/out show tooltip)
rep(
  `        this._traitContainer.add([pill, txt]);`,
  `        /* Make pill interactive for tooltip */
        const hitArea = this.add.rectangle(-W_PANEL/2 - 2, y, W_PANEL - 4, pillH, 0x000000, 0)
          .setInteractive({ useHandCursor: false });
        hitArea.on('pointerover', () => this._showTraitTooltip(bp, n));
        hitArea.on('pointerout',  () => this._hideTraitTooltip());
        this._traitContainer.add([pill, txt, hitArea]);`,
  'trait pill tooltip interactivity'
);

/* ════════════════════════════════════════════════════════════
   4. PAUSE MENU: show current traits
   ════════════════════════════════════════════════════════════ */

rep(
  `      this.input.keyboard.on('keydown-ESC',   ()=>this.resumeGame());`,
  `      /* Current traits in pause menu */
      const pTraits  = (this.game_.ps.traits      || []);
      const pStacks  = (this.game_.ps.traitStacks || {});
      if (pTraits.length) {
        this.add.text(cx, cy + 136, 'ACTIVE TRAITS', {
          fontSize:'10px', fontFamily:'system-ui', fontStyle:'bold', color:'#6d28d9', letterSpacing:2,
        }).setOrigin(0.5);
        const col1 = [], col2 = [];
        pTraits.forEach((id, i) => {
          const bp = BLUEPRINTS.find(b => b.id === id);
          const n  = pStacks[id] || 1;
          const label = bp ? (n > 1 ? bp.name + ' x' + n : bp.name) : id;
          (i % 2 === 0 ? col1 : col2).push(label);
        });
        const colX = [cx - 82, cx + 12];
        [col1, col2].forEach((col, ci) => col.forEach((label, ri) => {
          this.add.text(colX[ci], cy + 152 + ri * 14, label, {
            fontSize:'10px', fontFamily:'system-ui', color:'#a78bfa',
          }).setOrigin(0, 0.5);
        }));
      }
      this.input.keyboard.on('keydown-ESC',   ()=>this.resumeGame());`,
  'pause menu traits'
);

/* ════════════════════════════════════════════════════════════
   5. META SCENE: run history section (compact, above nav btns)
   ════════════════════════════════════════════════════════════ */

rep(
  `      /* Leaderboard moved to global overlay (🏆 button, top-left) */`,
  `      /* Leaderboard moved to global overlay (🏆 button, top-left) */

      /* ── Run History ── */
      {
        const hist = loadHistory();
        if (hist.length) {
          const gridBottom = 262 + rows * (uh + 10);
          const histStartY = gridBottom + 14;
          this.add.text(W / 2, histStartY, 'RECENT RUNS', {
            fontSize:'10px', fontFamily:'system-ui', fontStyle:'bold', color:'#4c1d95', letterSpacing:2,
          }).setOrigin(0.5);
          const clsEmoji = { hunter:'🏹', knight:'⚔️', wizard:'🔮', necromancer:'💀', rogue:'🗡️', paladin:'🛡️', berserker:'🪓' };
          hist.forEach((run, hi) => {
            const emoji = clsEmoji[run.cls] || '?';
            const clsName = (run.cls||'?').charAt(0).toUpperCase()+(run.cls||'?').slice(1);
            const label = emoji + ' ' + clsName + '  ·  Wave ' + run.wave + '  ·  ' + run.kills + ' kills  ·  Lv' + run.level;
            this.add.text(W / 2, histStartY + 16 + hi * 15, label, {
              fontSize:'10px', fontFamily:'system-ui', color:'#6b7280',
            }).setOrigin(0.5);
          });
        }
      }`,
  'meta scene run history'
);

/* ════════════════════════════════════════════════════════════
   Write output
   ════════════════════════════════════════════════════════════ */
fs.writeFileSync('C:/Users/Garci/Claude 1/aurora-site.html', s, 'utf8');
console.log('\nDone. Size:', s.length);
