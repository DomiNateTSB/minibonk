/**
 * patch-meta.js
 * Adds 5 new meta upgrades + daily challenge scoring/display.
 * Run: node patch-meta.js
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
   1. Add 5 new META_UPGRADES (before the closing ];)
   ════════════════════════════════════════════════════════════ */

rep(
  `    { id:'unlock_berserker', name:'🪓 Berserker: Bloodlust',  desc:'Berserker heals 3% of damage dealt',      apply:(p,r)=>{ if(r>0&&p.class==='berserker') p.vStrike=(p.vStrike||0)+r*0.03; } },
  ];`,
  `    { id:'unlock_berserker', name:'🪓 Berserker: Bloodlust',  desc:'Berserker heals 3% of damage dealt',      apply:(p,r)=>{ if(r>0&&p.class==='berserker') p.vStrike=(p.vStrike||0)+r*0.03; } },
    { id:'bonusTrait',   name:'Serendipity',   desc:'Start each run with 1 random trait',          apply:(p,r)=>{ if(r>0) p._startBonusTraits=(p._startBonusTraits||0)+r; } },
    { id:'extraLife',    name:'Lifeline',       desc:'Survive 1 killing blow per run at 1 HP',     apply:(p,r)=>{ if(r>0) p.extraLives=(p.extraLives||0)+r; } },
    { id:'soulBonus',    name:'Soul Surge',     desc:'+10 bonus souls per wave cleared',            apply:(p,r)=>{ p.bonusSoulsPerWave=(p.bonusSoulsPerWave||0)+r*10; } },
    { id:'startLevel',   name:'Head Start',     desc:'Begin each run at level 2',                  apply:(p,r)=>{ if(r>0) p._startLevel=(p._startLevel||1)+r; } },
    { id:'thorns',       name:'Thorns',         desc:'Return 8 dmg to melee enemies that hit you', apply:(p,r)=>{ p.thorns=(p.thorns||0)+r*8; } },
  ];`,
  'new meta upgrades'
);

/* ════════════════════════════════════════════════════════════
   2. Meta shop layout — switch to 6 cols, trim card height
      (19 + 5 = 24 upgrades → 24/6 = 4 rows, stays on screen)
   ════════════════════════════════════════════════════════════ */

rep(
  `      const cols = 5, uw = 148, uh = 108, ugap = 8;`,
  `      const cols = 6, uw = 138, uh = 96, ugap = 6;`,
  'meta grid layout 6-col'
);

// The rank dots X positions need to match the new uw
rep(
  `        for (let r = 0; r < META_MAX; r++)
          this.add.circle(ux + 18 + r * 16, uy + uh - 16, 4, r < rank ? 0xfbbf24 : 0x2a2a40);`,
  `        for (let r = 0; r < META_MAX; r++)
          this.add.circle(ux + 12 + r * 14, uy + uh - 14, 4, r < rank ? 0xfbbf24 : 0x2a2a40);`,
  'meta rank dots spacing'
);

// Cost text anchor (was uw-10 from left = 138px card)
rep(
  `        this.add.text(ux + uw - 10, uy + uh - 24, maxed ? 'MAX' : \`\${cost} souls\`, {`,
  `        this.add.text(ux + uw - 8, uy + uh - 22, maxed ? 'MAX' : \`\${cost} souls\`, {`,
  'meta cost text anchor'
);

// Desc font slightly smaller for narrower cards
rep(
  `        this.add.text(ux + uw / 2, uy + 35, u.desc, {
          fontSize: '11px', fontFamily: 'system-ui', color: 'rgba(255,255,255,0.45)',
          wordWrap: { width: uw - 18 }, align: 'center',
        }).setOrigin(0.5, 0);`,
  `        this.add.text(ux + uw / 2, uy + 32, u.desc, {
          fontSize: '10px', fontFamily: 'system-ui', color: 'rgba(255,255,255,0.45)',
          wordWrap: { width: uw - 14 }, align: 'center',
        }).setOrigin(0.5, 0);`,
  'meta desc font smaller'
);

/* ════════════════════════════════════════════════════════════
   3. Apply starting traits + extra life + start level in GameScene
   ════════════════════════════════════════════════════════════ */

// After traits array is initialized, apply bonus starting traits
rep(
  `      this.ps.traits = []; this.ps._curseSouls = 0;`,
  `      this.ps.traits = []; this.ps._curseSouls = 0;
      /* Meta: bonus starting trait(s) */
      if (this.ps._startBonusTraits > 0) {
        const available = BLUEPRINTS.filter(b => !b._classLock || b._classLock === this.ps.class);
        for (let _i = 0; _i < this.ps._startBonusTraits; _i++) {
          const pick = available[Math.floor(Math.random() * available.length)];
          if (pick) {
            this.ps.traits.push(pick.id);
            this.ps.traitStacks = this.ps.traitStacks || {};
            this.ps.traitStacks[pick.id] = (this.ps.traitStacks[pick.id] || 0) + 1;
            if (pick.apply) pick.apply(this.ps, 1);
          }
        }
      }
      /* Meta: head start — inject XP to reach level 2 immediately */
      if (this.ps._startLevel > 1) {
        this.ps.xp = this.ps.xpNext - 1;
      }`,
  'apply bonus start traits + head start'
);

// Extra life: hook into the hp<=0 check in takeDamage
rep(
  `      if (this.ps.hp <= 0) { this.ps.hp = 0; this.onDeath(); }`,
  `      if (this.ps.hp <= 0) {
        if ((this.ps.extraLives || 0) > 0 && !this._usedExtraLife) {
          this._usedExtraLife = true;
          this.ps.hp = 1;
          this.ps.extraLives--;
          /* Flash a golden "LIFELINE!" popup */
          const lft = this.add.text(this.pg.x, this.pg.y - 48, '✦ LIFELINE!', {
            fontSize:'20px', fontFamily:'system-ui', fontStyle:'bold',
            color:'#fbbf24', stroke:'#000', strokeThickness:4,
          }).setOrigin(0.5).setDepth(60);
          this.tweens.add({ targets:lft, y:lft.y-54, alpha:0, duration:1400, onComplete:()=>lft.destroy() });
          window._SFX && window._SFX.levelUp && window._SFX.levelUp();
        } else {
          this.ps.hp = 0; this.onDeath();
        }
      }`,
  'extra life in takeDamage'
);

// Thorns: in the melee enemy-hit block, apply thorns damage back
rep(
  `            this.takeDamage(e.eDmg);`,
  `            this.takeDamage(e.eDmg);
            if (this.ps.thorns && !this.dead) {
              e.eHp -= this.ps.thorns;
              this.hitFlash(e);
            }`,
  'thorns reflect'
);

/* ════════════════════════════════════════════════════════════
   4. Daily challenge scoring — save score on death
   ════════════════════════════════════════════════════════════ */

rep(
  `      localStorage.removeItem('hoa_daily');
        this.scene.start('Summary', {`,
  `      /* Save daily score if this was a daily run */
        if (this.isDaily) {
          const dateKey = 'hoa_daily_' + getDailySeed();
          const dailyScore = this.waveNum * 100 + (this.ps.kills || 0) * 5 + (this.ps.level || 1) * 50;
          const prev = JSON.parse(localStorage.getItem(dateKey) || '{}');
          if (!prev.score || dailyScore > prev.score) {
            localStorage.setItem(dateKey, JSON.stringify({
              score: dailyScore, wave: this.waveNum, kills: this.ps.kills || 0,
              level: this.ps.level || 1, cls: this.ps.class || 'hunter',
              name: localStorage.getItem('hoa_name') || '?',
            }));
          }
        }
        localStorage.removeItem('hoa_daily');
        this.scene.start('Summary', {`,
  'save daily score'
);

/* ════════════════════════════════════════════════════════════
   5. Menu scene — show "already played" state on daily button
      and show best score for today
   ════════════════════════════════════════════════════════════ */

rep(
  `      /* Daily Challenge button */
      const dailyBtn = this.add.text(cx, cy + 148, '🗓  Daily Challenge', {`,
  `      /* Daily Challenge button — show today's score if already played */
      const _dailyKey = 'hoa_daily_' + getDailySeed();
      const _dailyEntry = JSON.parse(localStorage.getItem(_dailyKey) || 'null');
      const _dailyLabel = _dailyEntry
        ? '🗓  Daily · Score ' + _dailyEntry.score + ' (wave ' + _dailyEntry.wave + ')'
        : '🗓  Daily Challenge';
      const dailyBtn = this.add.text(cx, cy + 148, _dailyLabel, {`,
  'menu daily button label'
);

/* ════════════════════════════════════════════════════════════
   6. MetaScene — show daily challenge score above run history
   ════════════════════════════════════════════════════════════ */

rep(
  `      /* ── Run History ── */`,
  `      /* ── Daily Challenge Score ── */
      {
        const _dc2Key = 'hoa_daily_' + getDailySeed();
        const _dc2Entry = JSON.parse(localStorage.getItem(_dc2Key) || 'null');
        const gridBottom2 = 262 + rows * (uh + 10);
        if (_dc2Entry) {
          this.add.text(W / 2, gridBottom2 + 10, 'DAILY CHALLENGE', {
            fontSize:'10px', fontFamily:'system-ui', fontStyle:'bold', color:'#92400e', letterSpacing:2,
          }).setOrigin(0.5);
          const clsName2 = (_dc2Entry.cls||'?').charAt(0).toUpperCase()+(_dc2Entry.cls||'?').slice(1);
          this.add.text(W / 2, gridBottom2 + 25, clsName2 + '  ·  Wave ' + _dc2Entry.wave + '  ·  ' + _dc2Entry.kills + ' kills  ·  Score ' + _dc2Entry.score, {
            fontSize:'11px', fontFamily:'system-ui', fontStyle:'bold', color:'#fbbf24',
          }).setOrigin(0.5);
        }
      }

      /* ── Run History ── */`,
  'meta daily score section'
);

/* ════════════════════════════════════════════════════════════
   Write output
   ════════════════════════════════════════════════════════════ */
if (!ok) { console.error('\nPatch aborted — fix NOT FOUND errors above.'); process.exit(1); }
fs.writeFileSync('C:/Users/Garci/Claude 1/aurora-site.html', s, 'utf8');
console.log('\nDone. Size:', s.length);
