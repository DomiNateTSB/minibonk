/**
 * patch-battlepass.js — Full Battle Pass system (100 levels, visual scene, XP, COMING SOON)
 * Run: node patch-battlepass.js
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
   1. Battle Pass data + load/save — inserted after META_MAX
   ════════════════════════════════════════════════════════════ */
rep(
  `  const META_MAX   = META_COSTS.length;
  function loadMeta() {`,
  `  const META_MAX   = META_COSTS.length;

  /* ── BATTLE PASS ── */
  const XP_PER_BP_LEVEL = 300;
  const BATTLE_PASS_REWARDS = [
    { level:1,  type:'souls',     value:100,           name:'+100 Souls',           icon:'✦' },
    { level:2,  type:'xpboost',   value:0.10,          name:'+10% XP Boost',        icon:'⭐' },
    { level:3,  type:'souls',     value:200,           name:'+200 Souls',           icon:'✦' },
    { level:4,  type:'title',     value:'Wanderer',    name:'Title: Wanderer',      icon:'🏷️' },
    { level:5,  type:'souls',     value:300,           name:'+300 Souls',           icon:'✦' },
    { level:6,  type:'xpboost',   value:0.15,          name:'+15% XP Boost',        icon:'⭐' },
    { level:7,  type:'souls',     value:400,           name:'+400 Souls',           icon:'✦' },
    { level:8,  type:'title',     value:'Scout',       name:'Title: Scout',         icon:'🏷️' },
    { level:9,  type:'souls',     value:500,           name:'+500 Souls',           icon:'✦' },
    { level:10, type:'elite_skin',value:'hunter',      name:'Hunter Elite',         icon:'👑' },
    { level:11, type:'souls',     value:600,           name:'+600 Souls',           icon:'✦' },
    { level:12, type:'title',     value:'Veteran',     name:'Title: Veteran',       icon:'🏷️' },
    { level:13, type:'xpboost',   value:0.20,          name:'+20% XP Boost',        icon:'⭐' },
    { level:14, type:'souls',     value:700,           name:'+700 Souls',           icon:'✦' },
    { level:15, type:'souls',     value:800,           name:'+800 Souls',           icon:'✦' },
    { level:16, type:'title',     value:'Warrior',     name:'Title: Warrior',       icon:'🏷️' },
    { level:17, type:'xpboost',   value:0.25,          name:'+25% XP Boost',        icon:'⭐' },
    { level:18, type:'souls',     value:1000,          name:'+1000 Souls',          icon:'✦' },
    { level:19, type:'title',     value:'Warlord',     name:'Title: Warlord',       icon:'🏷️' },
    { level:20, type:'elite_skin',value:'knight',      name:'Knight Elite',         icon:'👑' },
    { level:21, type:'souls',     value:1200,          name:'+1200 Souls',          icon:'✦' },
    { level:22, type:'xpboost',   value:0.30,          name:'+30% XP Boost',        icon:'⭐' },
    { level:23, type:'souls',     value:1400,          name:'+1400 Souls',          icon:'✦' },
    { level:24, type:'title',     value:'Champion',    name:'Title: Champion',      icon:'🏷️' },
    { level:25, type:'souls',     value:1600,          name:'+1600 Souls',          icon:'✦' },
    { level:26, type:'xpboost',   value:0.35,          name:'+35% XP Boost',        icon:'⭐' },
    { level:27, type:'souls',     value:1800,          name:'+1800 Souls',          icon:'✦' },
    { level:28, type:'title',     value:'Conqueror',   name:'Title: Conqueror',     icon:'🏷️' },
    { level:29, type:'xpboost',   value:0.40,          name:'+40% XP Boost',        icon:'⭐' },
    { level:30, type:'elite_skin',value:'wizard',      name:'Wizard Elite',         icon:'👑' },
    { level:31, type:'souls',     value:2000,          name:'+2000 Souls',          icon:'✦' },
    { level:32, type:'xpboost',   value:0.50,          name:'+50% XP Boost',        icon:'⭐' },
    { level:33, type:'souls',     value:2200,          name:'+2200 Souls',          icon:'✦' },
    { level:34, type:'title',     value:'Overlord',    name:'Title: Overlord',      icon:'🏷️' },
    { level:35, type:'souls',     value:2500,          name:'+2500 Souls',          icon:'✦' },
    { level:36, type:'xpboost',   value:0.50,          name:'+50% XP Boost',        icon:'⭐' },
    { level:37, type:'souls',     value:2800,          name:'+2800 Souls',          icon:'✦' },
    { level:38, type:'title',     value:'Dreadlord',   name:'Title: Dreadlord',     icon:'🏷️' },
    { level:39, type:'souls',     value:3000,          name:'+3000 Souls',          icon:'✦' },
    { level:40, type:'elite_skin',value:'necromancer', name:'Necromancer Elite',    icon:'👑' },
    { level:41, type:'meta_excl', value:'ex_dmg1',     name:"Veteran's Edge I",     icon:'⚡' },
    { level:42, type:'souls',     value:3200,          name:'+3200 Souls',          icon:'✦' },
    { level:43, type:'title',     value:'Phantom',     name:'Title: Phantom',       icon:'🏷️' },
    { level:44, type:'xpboost',   value:1.00,          name:'+100% XP Boost',       icon:'⭐' },
    { level:45, type:'souls',     value:3500,          name:'+3500 Souls',          icon:'✦' },
    { level:46, type:'meta_excl', value:'ex_hp1',      name:"Titan's Blood I",      icon:'❤️' },
    { level:47, type:'souls',     value:3800,          name:'+3800 Souls',          icon:'✦' },
    { level:48, type:'title',     value:'Shadowbane',  name:'Title: Shadowbane',    icon:'🏷️' },
    { level:49, type:'xpboost',   value:1.00,          name:'+100% XP Boost',       icon:'⭐' },
    { level:50, type:'elite_skin',value:'rogue',       name:'Rogue Elite',          icon:'👑' },
    { level:51, type:'souls',     value:4000,          name:'+4000 Souls',          icon:'✦' },
    { level:52, type:'meta_excl', value:'ex_spd1',     name:"Winds of War I",       icon:'💨' },
    { level:53, type:'title',     value:'Voidwalker',  name:'Title: Voidwalker',    icon:'🏷️' },
    { level:54, type:'souls',     value:4500,          name:'+4500 Souls',          icon:'✦' },
    { level:55, type:'xpboost',   value:1.00,          name:'+100% XP Boost',       icon:'⭐' },
    { level:56, type:'meta_excl', value:'ex_regen1',   name:'Phoenix Pulse I',      icon:'🔥' },
    { level:57, type:'souls',     value:5000,          name:'+5000 Souls',          icon:'✦' },
    { level:58, type:'title',     value:'Eternal',     name:'Title: Eternal',       icon:'🏷️' },
    { level:59, type:'xpboost',   value:1.00,          name:'+100% XP Boost',       icon:'⭐' },
    { level:60, type:'elite_skin',value:'paladin',     name:'Paladin Elite',        icon:'👑' },
    { level:61, type:'border',    value:'gold',        name:'Gold Card Border',     icon:'🖼️' },
    { level:62, type:'souls',     value:5500,          name:'+5500 Souls',          icon:'✦' },
    { level:63, type:'title',     value:'Archmage',    name:'Title: Archmage',      icon:'🏷️' },
    { level:64, type:'xpboost',   value:1.00,          name:'+100% XP Boost',       icon:'⭐' },
    { level:65, type:'souls',     value:6000,          name:'+6000 Souls',          icon:'✦' },
    { level:66, type:'border',    value:'crimson',     name:'Crimson Border',       icon:'🖼️' },
    { level:67, type:'title',     value:'Deathbringer',name:'Title: Deathbringer',  icon:'🏷️' },
    { level:68, type:'souls',     value:6500,          name:'+6500 Souls',          icon:'✦' },
    { level:69, type:'xpboost',   value:1.00,          name:'+100% XP Boost',       icon:'⭐' },
    { level:70, type:'elite_skin',value:'berserker',   name:'Berserker Elite',      icon:'👑' },
    { level:71, type:'souls',     value:7000,          name:'+7000 Souls',          icon:'✦' },
    { level:72, type:'border',    value:'void',        name:'Void Card Border',     icon:'🖼️' },
    { level:73, type:'title',     value:'Riftborn',    name:'Title: Riftborn',      icon:'🏷️' },
    { level:74, type:'souls',     value:7500,          name:'+7500 Souls',          icon:'✦' },
    { level:75, type:'xpboost',   value:2.00,          name:'+200% XP Boost',       icon:'⭐' },
    { level:76, type:'border',    value:'aurora',      name:'Aurora Card Border',   icon:'🖼️' },
    { level:77, type:'title',     value:'Godslayer',   name:'Title: Godslayer',     icon:'🏷️' },
    { level:78, type:'souls',     value:8000,          name:'+8000 Souls',          icon:'✦' },
    { level:79, type:'xpboost',   value:2.00,          name:'+200% XP Boost',       icon:'⭐' },
    { level:80, type:'souls',     value:8500,          name:'+8500 Souls',          icon:'✦' },
    { level:81, type:'trail',     value:'crimson',     name:'Crimson Trail',        icon:'✨' },
    { level:82, type:'title',     value:'Ascendant',   name:'Title: Ascendant',     icon:'🏷️' },
    { level:83, type:'souls',     value:9000,          name:'+9000 Souls',          icon:'✦' },
    { level:84, type:'burst',     value:'gold',        name:'Gold Death Burst',     icon:'💥' },
    { level:85, type:'xpboost',   value:2.00,          name:'+200% XP Boost',       icon:'⭐' },
    { level:86, type:'trail',     value:'void',        name:'Void Trail',           icon:'✨' },
    { level:87, type:'title',     value:'Immortal',    name:'Title: Immortal',      icon:'🏷️' },
    { level:88, type:'souls',     value:9500,          name:'+9500 Souls',          icon:'✦' },
    { level:89, type:'burst',     value:'aurora',      name:'Aurora Death Burst',   icon:'💥' },
    { level:90, type:'trail',     value:'aurora',      name:'Aurora Trail',         icon:'✨' },
    { level:91, type:'souls',     value:10000,         name:'+10000 Souls',         icon:'✦' },
    { level:92, type:'title',     value:'Transcendent',name:'Title: Transcendent',  icon:'🏷️' },
    { level:93, type:'burst',     value:'prismatic',   name:'Prismatic Burst',      icon:'💥' },
    { level:94, type:'xpboost',   value:2.00,          name:'+200% XP Boost',       icon:'⭐' },
    { level:95, type:'souls',     value:12000,         name:'+12000 Souls',         icon:'✦' },
    { level:96, type:'trail',     value:'prismatic',   name:'Prismatic Trail',      icon:'✨' },
    { level:97, type:'title',     value:'Legendary',   name:'Title: Legendary',     icon:'🏷️' },
    { level:98, type:'souls',     value:15000,         name:'+15000 Souls',         icon:'✦' },
    { level:99, type:'burst',     value:'divine',      name:'Divine Death Burst',   icon:'💥' },
    { level:100,type:'ascended',  value:'golden_aura', name:'ASCENDED',             icon:'👑' },
  ];

  function loadBP()  { try { return JSON.parse(localStorage.getItem('hoa_bp')) || { level:0, xp:0, claimed:[], owned:false }; } catch { return { level:0, xp:0, claimed:[], owned:false }; } }
  function saveBP(d) { try { localStorage.setItem('hoa_bp', JSON.stringify(d)); } catch {} }

  function loadMeta() {`,
  'battle pass data'
);

/* ════════════════════════════════════════════════════════════
   2. BattlePassScene — inserted before _startPhaser
   ════════════════════════════════════════════════════════════ */
rep(
  `  window._phaserStarted = false;`,
  `  /* ── BATTLE PASS SCENE ── */
  class BattlePassScene extends Phaser.Scene {
    constructor() { super('BattlePass'); }

    create() {
      const bp   = loadBP();
      const bpW  = this.scale.width;
      const bpH  = this.scale.height;
      const cx   = bpW / 2;
      this._scrollY = 0;

      this.cameras.main.setBackgroundColor('#04000d');
      this.cameras.main.fadeIn(350, 0, 0, 0);

      /* ── background glows (fixed) ── */
      const bgG = this.add.graphics().setScrollFactor(0);
      bgG.fillStyle(0x4c1d95, 0.10); bgG.fillEllipse(cx * 0.5, 120, bpW * 0.8, 300);
      bgG.fillStyle(0x7c1d12, 0.07); bgG.fillEllipse(cx * 1.6, 180, bpW * 0.6, 260);

      /* ── CARD GRID (scrollable) ── */
      const COLS = 10;
      const cardW = Math.max(60, Math.min(84, Math.floor((bpW - 80) / COLS) - 6));
      const cardH = 90;
      const gapX  = 6, gapY = 8;
      const gridW = COLS * cardW + (COLS - 1) * gapX;
      const startX = (bpW - gridW) / 2;
      const startY = 196;

      const TYPE_COL = {
        elite_skin: 0xffd700, title: 0x9333ea, souls: 0xfbbf24,
        xpboost: 0x60a5fa, meta_excl: 0xf97316,
        border: 0x2dd4bf, trail: 0xa855f7, burst: 0xef4444, ascended: 0xffd700,
      };

      BATTLE_PASS_REWARDS.forEach((rw, i) => {
        const col  = i % COLS, row = Math.floor(i / COLS);
        const cx2  = startX + col * (cardW + gapX);
        const cy2  = startY + row * (cardH + gapY);
        const tc   = TYPE_COL[rw.type] || 0x444466;
        const is100  = rw.level === 100;
        const owned  = bp.owned;
        const claimed = (bp.claimed || []).includes(rw.level);
        const reached = bp.level >= rw.level;

        /* card bg */
        const cg = this.add.graphics();
        let bgC = 0x0a0916, bdC = 0x221833, bdA = 0.7;
        if (is100)   { bgC = 0x150900; bdC = 0xffd700; bdA = 0.5; }
        else if (claimed) { bgC = 0x061510; bdC = 0x22c55e; bdA = 0.8; }
        else if (owned && reached) { bgC = 0x130b24; bdC = tc; bdA = 0.55; }
        else if (owned) { bgC = 0x0d0920; bdC = tc; bdA = 0.22; }

        cg.fillStyle(bgC, 1); cg.fillRoundedRect(cx2, cy2, cardW, cardH, 7);
        cg.lineStyle(is100 ? 2 : 1.5, bdC, bdA); cg.strokeRoundedRect(cx2, cy2, cardW, cardH, 7);

        /* outer glow rings for level 100 */
        if (is100) {
          [3,6,10].forEach((off, gi) => {
            cg.lineStyle(1, 0xffd700, 0.10 - gi * 0.03);
            cg.strokeRoundedRect(cx2 - off, cy2 - off, cardW + off*2, cardH + off*2, 9 + off);
          });
        }

        /* level number */
        this.add.text(cx2 + 5, cy2 + 5, String(rw.level), {
          fontSize: '8px', fontFamily: 'system-ui',
          color: is100 ? '#ffd700' : claimed ? '#4ade80' : 'rgba(255,255,255,0.28)',
        });

        /* icon */
        const iconAlpha = (!owned && !claimed) ? 0.18 : (reached || claimed ? 1 : 0.35);
        this.add.text(cx2 + cardW / 2, cy2 + cardH / 2 - 10, rw.icon, {
          fontSize: is100 ? '28px' : rw.type === 'elite_skin' ? '22px' : '18px',
          fontFamily: 'system-ui',
        }).setOrigin(0.5).setAlpha(iconAlpha);

        /* name */
        const dispName = rw.name.length > 13 ? rw.name.slice(0, 12) + '…' : rw.name;
        const nameCol  = is100 ? '#ffd700' : claimed ? '#4ade80' : owned && reached ? '#c4b5fd' : 'rgba(255,255,255,0.22)';
        this.add.text(cx2 + cardW / 2, cy2 + cardH - 13, dispName, {
          fontSize: is100 ? '9px' : '7px', fontFamily: 'system-ui',
          color: nameCol, align: 'center', wordWrap: { width: cardW - 8 },
        }).setOrigin(0.5, 1);

        /* lock */
        if (!owned && !claimed) {
          this.add.text(cx2 + cardW - 9, cy2 + 7, '🔒', { fontSize:'8px', fontFamily:'system-ui' }).setAlpha(0.35);
        }
        /* checkmark */
        if (claimed) {
          const ck = this.add.graphics();
          ck.fillStyle(0x16a34a, 1); ck.fillCircle(cx2 + cardW - 8, cy2 + 8, 6);
          this.add.text(cx2 + cardW - 8, cy2 + 8, '✓', { fontSize:'8px', fontFamily:'system-ui', color:'#fff' }).setOrigin(0.5);
        }

        /* level 100 special pulse */
        if (is100) this.tweens.add({ targets: cg, alpha: 0.75, duration: 1100, yoyo: true, repeat: -1 });
      });

      /* ── SCROLL ── */
      const totalRows = Math.ceil(BATTLE_PASS_REWARDS.length / COLS);
      const maxScroll = Math.max(0, startY + totalRows * (cardH + gapY) + 40 - bpH);
      this._maxSc = maxScroll;

      this.input.on('wheel', (p, o, dx, dy) => {
        this._scrollY = Phaser.Math.Clamp(this._scrollY + dy * 0.55, 0, maxScroll);
        this.cameras.main.setScrollY(this._scrollY);
      });
      let _tsy = 0;
      this.input.on('pointerdown', p => { _tsy = p.y + this._scrollY; });
      this.input.on('pointermove', p => {
        if (p.isDown) {
          this._scrollY = Phaser.Math.Clamp(_tsy - p.y, 0, maxScroll);
          this.cameras.main.setScrollY(this._scrollY);
        }
      });

      /* ── HEADER — fixed (scrollFactor 0), rendered ON TOP of grid ── */
      /* header background occludes cards scrolling up */
      const hdrBg = this.add.graphics().setScrollFactor(0).setDepth(10);
      hdrBg.fillStyle(0x04000d, 1); hdrBg.fillRect(0, 0, bpW, 186);
      hdrBg.lineStyle(1, 0x2a1040, 1); hdrBg.lineBetween(30, 185, bpW - 30, 185);

      /* subtle colour band behind title */
      const hdrAccent = this.add.graphics().setScrollFactor(0).setDepth(10);
      hdrAccent.fillStyle(0x4c1d95, 0.10); hdrAccent.fillRect(0, 0, bpW, 90);

      /* BATTLE PASS title */
      this.add.text(cx, 36, 'BATTLE PASS', {
        fontSize: '44px', fontFamily: 'system-ui', fontStyle: 'bold',
        color: '#ffd700', stroke: '#5b21b6', strokeThickness: 10,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(11);

      this.add.text(cx, 78, 'SEASON  1   ·   100 LEVELS', {
        fontSize: '11px', fontFamily: 'system-ui', color: 'rgba(251,191,36,0.45)', letterSpacing: 4,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(11);

      /* XP bar + level */
      const lvl = bp.level || 0;
      const xpPct = Math.min(1, (bp.xp || 0) / XP_PER_BP_LEVEL);
      const barW = Math.min(340, bpW * 0.36), barH = 8;
      const barX = cx - 60 - barW / 2, barY = 102;

      /* Level circle */
      const lcg = this.add.graphics().setScrollFactor(0).setDepth(11);
      lcg.fillStyle(0x1a0a30, 1); lcg.fillCircle(cx - 60 - barW / 2 - 36, 116, 28);
      lcg.lineStyle(3, 0x3a1a6a, 1); lcg.strokeCircle(cx - 60 - barW / 2 - 36, 116, 28);
      lcg.lineStyle(3, 0xffd700, 1);
      lcg.beginPath();
      lcg.arc(cx - 60 - barW / 2 - 36, 116, 28, -Math.PI / 2, -Math.PI / 2 + xpPct * Math.PI * 2, false);
      lcg.strokePath();

      this.add.text(cx - 60 - barW / 2 - 36, 114, String(lvl), {
        fontSize: '17px', fontFamily: 'system-ui', fontStyle: 'bold', color: '#ffd700',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(12);
      this.add.text(cx - 60 - barW / 2 - 36, 134, 'LVL', {
        fontSize: '8px', fontFamily: 'system-ui', color: 'rgba(251,191,36,0.4)', letterSpacing: 2,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(12);

      /* XP bar */
      const barG = this.add.graphics().setScrollFactor(0).setDepth(11);
      barG.fillStyle(0x150828, 1); barG.fillRoundedRect(barX, barY, barW, barH, 4);
      if (xpPct > 0) {
        barG.fillStyle(0xffd700, 1); barG.fillRoundedRect(barX, barY, barW * xpPct, barH, 4);
        barG.fillStyle(0xffffff, 0.25); barG.fillRoundedRect(barX, barY, barW * xpPct, barH / 2, 4);
      }
      this.add.text(barX + barW / 2, barY + 16, (bp.xp || 0) + ' / ' + XP_PER_BP_LEVEL + ' XP  to  Lv ' + (lvl + 1), {
        fontSize: '10px', fontFamily: 'system-ui', color: 'rgba(251,191,36,0.5)',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(12);

      /* COMING SOON button */
      const csX = cx + 80 + barW / 2, csY = 116;
      const csg = this.add.graphics().setScrollFactor(0).setDepth(11);
      /* outer glow */
      [14,10,6,0].forEach((pad, gi) => {
        csg.fillStyle(0xffd700, [0.03, 0.05, 0.08, 0][gi]);
        csg.fillRoundedRect(csX - 100 - pad, csY - 22 - pad, 200 + pad*2, 44 + pad*2, 12 + pad);
      });
      /* fill */
      csg.fillStyle(0x1a0830, 1); csg.fillRoundedRect(csX - 100, csY - 22, 200, 44, 12);
      csg.lineStyle(1.5, 0xffd700, 0.8); csg.strokeRoundedRect(csX - 100, csY - 22, 200, 44, 12);

      const csTop = this.add.text(csX, csY - 7, '⚔  BATTLE PASS', {
        fontSize: '13px', fontFamily: 'system-ui', fontStyle: 'bold', color: '#ffd700',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(12);
      const csBot = this.add.text(csX, csY + 10, 'COMING SOON', {
        fontSize: '9px', fontFamily: 'system-ui', color: 'rgba(251,191,36,0.55)', letterSpacing: 3,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(12);
      this.tweens.add({ targets: [csTop, csBot, csg], alpha: 0.6, duration: 950, yoyo: true, repeat: -1 });

      /* hint text */
      this.add.text(cx, 166, 'Your XP is already being tracked. Claim rewards when Battle Pass launches.', {
        fontSize: '10px', fontFamily: 'system-ui', color: 'rgba(255,255,255,0.25)',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(11);

      /* ── BACK BUTTON ── */
      const back = this.add.text(22, 18, '← Back', {
        fontSize: '14px', fontFamily: 'system-ui', color: 'rgba(167,139,250,0.55)',
      }).setScrollFactor(0).setDepth(13).setInteractive({ useHandCursor: true });
      back.on('pointerover', () => back.setColor('#a78bfa'));
      back.on('pointerout',  () => back.setColor('rgba(167,139,250,0.55)'));
      back.on('pointerdown', () => {
        this.cameras.main.fadeOut(220, 0, 0, 0);
        this.time.delayedCall(240, () => this.scene.start('Menu'));
      });

      /* keyboard back */
      this.input.keyboard.on('keydown-ESC', () => {
        this.cameras.main.fadeOut(220, 0, 0, 0);
        this.time.delayedCall(240, () => this.scene.start('Menu'));
      });
    }
  }

  window._phaserStarted = false;`,
  'battle pass scene'
);

/* ════════════════════════════════════════════════════════════
   3. Add BattlePassScene to scene config
   ════════════════════════════════════════════════════════════ */
rep(
  `    scene: [MenuScene, ClassSelectScene, SkinPickerScene, GameScene, UIScene, LevelUpScene, SummaryScene, MetaScene, PauseMenuScene, AchievementsScene],`,
  `    scene: [MenuScene, ClassSelectScene, SkinPickerScene, GameScene, UIScene, LevelUpScene, SummaryScene, MetaScene, PauseMenuScene, AchievementsScene, BattlePassScene],`,
  'scene config'
);

/* ════════════════════════════════════════════════════════════
   4. Battle Pass button in MenuScene (above achievements)
   ════════════════════════════════════════════════════════════ */
rep(
  `      const achBtn = this.add.text(cx, cy + 178, '🏆  Achievements', {`,
  `      /* ── Battle Pass banner button ── */
      const bpBtnY = cy + 178;
      const bpBtnW = 220, bpBtnH = 40;
      const bpBg = this.add.graphics().setAlpha(0);
      /* outer glow rings */
      [8,5,2].forEach((pad, gi) => {
        bpBg.fillStyle(0xffd700, [0.04, 0.07, 0.12][gi]);
        bpBg.fillRoundedRect(cx - bpBtnW/2 - pad, bpBtnY - bpBtnH/2 - pad, bpBtnW + pad*2, bpBtnH + pad*2, 10 + pad);
      });
      bpBg.fillStyle(0x1a0630, 1);
      bpBg.fillRoundedRect(cx - bpBtnW/2, bpBtnY - bpBtnH/2, bpBtnW, bpBtnH, 10);
      bpBg.lineStyle(1.5, 0xffd700, 0.7);
      bpBg.strokeRoundedRect(cx - bpBtnW/2, bpBtnY - bpBtnH/2, bpBtnW, bpBtnH, 10);

      const bpLabel = this.add.text(cx, bpBtnY - 6, '⚔  BATTLE PASS', {
        fontSize: '14px', fontFamily: 'system-ui', fontStyle: 'bold', color: '#ffd700',
      }).setOrigin(0.5).setAlpha(0);
      const bpSub = this.add.text(cx, bpBtnY + 10, 'COMING SOON', {
        fontSize: '9px', fontFamily: 'system-ui', color: 'rgba(251,191,36,0.5)', letterSpacing: 3,
      }).setOrigin(0.5).setAlpha(0);

      bpBg.setInteractive(
        new Phaser.Geom.Rectangle(cx - bpBtnW/2, bpBtnY - bpBtnH/2, bpBtnW, bpBtnH),
        Phaser.Geom.Rectangle.Contains
      ).setInteractive({ useHandCursor: true });
      bpBg.on('pointerover',  () => { bpBg.setAlpha(1.1); bpLabel.setColor('#fff'); });
      bpBg.on('pointerout',   () => { bpBg.setAlpha(0.85); bpLabel.setColor('#ffd700'); });
      bpBg.on('pointerdown',  () => {
        this.cameras.main.fadeOut(250, 0, 0, 0);
        this.time.delayedCall(270, () => this.scene.start('BattlePass'));
      });

      this.tweens.add({ targets: [bpBg, bpLabel, bpSub], alpha: 0.85, duration: 500, delay: 750 });
      this.tweens.add({ targets: [bpBg, bpLabel], alpha: 0.6, duration: 1100, yoyo: true, repeat: -1, delay: 1300 });

      const achBtn = this.add.text(cx, cy + 228, '🏆  Achievements', {`,
  'battle pass menu button'
);

/* ════════════════════════════════════════════════════════════
   5. Earn BP XP at run end (after saveRunHistory)
   ════════════════════════════════════════════════════════════ */
rep(
  `      _syncToSupabase();`,
  `      /* Battle Pass XP */
      const bpXp = Math.min(500, Math.floor(100 + this.waveNum * 15 + (this.ps.kills || 0) * 2 + (this.ps.level || 1) * 10));
      const bpd = loadBP();
      bpd.xp = (bpd.xp || 0) + bpXp;
      while (bpd.xp >= XP_PER_BP_LEVEL && (bpd.level || 0) < 100) {
        bpd.xp -= XP_PER_BP_LEVEL;
        bpd.level = (bpd.level || 0) + 1;
      }
      saveBP(bpd);
      _syncToSupabase();`,
  'bp xp on run end'
);

/* ════════════════════════════════════════════════════════════
   Write output
   ════════════════════════════════════════════════════════════ */
if (!ok) { console.error('\nAborted.'); process.exit(1); }
fs.writeFileSync('C:/Users/Garci/Claude 1/aurora-site.html', s, 'utf8');
console.log('\nDone. Size:', s.length);
