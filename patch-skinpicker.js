const fs = require('fs');
let s = fs.readFileSync('C:/Users/Garci/Claude 1/aurora-site.html', 'utf8');

/* ── 1. Remove the entire _showSkinPicker method and replace with launcher ── */
const startMark = '_showSkinPicker(key) {';
/* File uses CRLF — match actual line endings */
const endMark   = '\r\n    }\r\n\r\n    create() {';

const si = s.indexOf(startMark);
const ei = s.indexOf(endMark, si);
if (si === -1 || ei === -1) { console.error('Could not find _showSkinPicker bounds'); process.exit(1); }

const beforeMethod = s.slice(0, si);
const afterMethod  = s.slice(ei + endMark.length);

const newMethod = `_showSkinPicker(key) {\r\n      this.scene.sleep('ClassSelect');\r\n      this.scene.launch('SkinPicker', { key });\r\n    }\r\n\r\n    create() {`;

s = beforeMethod + newMethod + afterMethod;
console.log('Replaced _showSkinPicker: OK');

/* ── 2. Register SkinPickerScene in the game config ── */
const configOld = 'scene: [MenuScene, ClassSelectScene, GameScene, UIScene, LevelUpScene, SummaryScene, MetaScene, PauseMenuScene, AchievementsScene]';
const configNew = 'scene: [MenuScene, ClassSelectScene, SkinPickerScene, GameScene, UIScene, LevelUpScene, SummaryScene, MetaScene, PauseMenuScene, AchievementsScene]';
if (s.includes(configOld)) { s = s.replace(configOld, configNew); console.log('Scene config: OK'); }
else console.error('Scene config pattern not found');

/* ── 3. Insert global draw code + SkinPickerScene before ClassSelectScene ── */
/* Insert BEFORE the CLASSES closing }; so globals land outside any class */
const insertBefore = '\r\n\r\n  class ClassSelectScene extends Phaser.Scene {';
const insertPoint  = s.indexOf(insertBefore);
if (insertPoint === -1) { console.error('ClassSelectScene insert point not found'); process.exit(1); }

const skinCode = `
  /* ════════════════════════════════════════════════════
     SKIN PICKER DRAW HELPERS — global canvas-2d helpers
     ════════════════════════════════════════════════════ */
  let _dc = null;
  const _hex = n => '#' + n.toString(16).padStart(6,'0');
  const _f  = (col,a=1) => { _dc.globalAlpha=a; _dc.fillStyle=_hex(col); };
  const _rc = (x,y,w,h) => _dc.fillRect(x,y,w,h);
  const _ci = (x,y,r)   => { _dc.beginPath(); _dc.arc(x,y,r,0,Math.PI*2); _dc.fill(); };
  const _el = (x,y,w,h) => { _dc.beginPath(); _dc.ellipse(x,y,w/2,h/2,0,0,Math.PI*2); _dc.fill(); };
  const _tr = (x1,y1,x2,y2,x3,y3) => { _dc.beginPath(); _dc.moveTo(x1,y1); _dc.lineTo(x2,y2); _dc.lineTo(x3,y3); _dc.fill(); };
  const _ls = (col,w,a=1) => { _dc.strokeStyle=_hex(col); _dc.lineWidth=w; _dc.globalAlpha=a; };
  const _lb = (x1,y1,x2,y2) => { _dc.beginPath(); _dc.moveTo(x1,y1); _dc.lineTo(x2,y2); _dc.stroke(); };
  const _G  = (col,blur) => { _dc.shadowColor=col; _dc.shadowBlur=blur; };
  const _NG = () => { _dc.shadowColor='transparent'; _dc.shadowBlur=0; };
  const _C  = (x,y,r,fill,gc,gb) => { if(gc)_G(gc,gb||16); _dc.fillStyle=fill; _dc.beginPath(); _dc.arc(x,y,r,0,Math.PI*2); _dc.fill(); if(gc)_NG(); };

  const SKIN_DEFAULT = {
    hunter: () => {
      _f(0x2e1065); _rc(-8,10,7,9); _rc(1,10,7,9); _f(0x3b0764); _rc(-8,16,7,3); _rc(1,16,7,3);
      _f(0x78350f); _rc(-20,-14,5,14); _f(0x92400e); _rc(-19,-13,3,12);
      _ls(0xd4a373,1); _lb(-19,-22,-19,-14); _lb(-18,-20,-18,-14); _lb(-17,-21,-17,-14);
      _f(0x60a5fa); _ci(-19,-22,1.5); _ci(-18,-20,1.5); _ci(-17,-21,1.5);
      _f(0x14532d); _rc(-13,-3,4,13); _rc(9,-3,4,13); _f(0x166534); _rc(-10,-4,20,15);
      _f(0x78350f); _rc(-10,5,20,3); _f(0xfbbf24,0.8); _rc(-2,5,4,3);
      _f(0x166534); _ci(0,-9,9); _tr(0,-25,-8,-13,8,-13);
      _f(0xd4a373); _rc(-4,-13,8,6); _f(0x60a5fa); _ci(-2,-10,1.5); _ci(2,-10,1.5);
      _ls(0x78350f,4); _dc.beginPath(); _dc.arc(13,0,11,-1.2,1.2); _dc.stroke();
      _ls(0xfef08a,1); const bsx=13+11*Math.cos(1.2),bsy=11*Math.sin(1.2); _lb(bsx,-bsy,bsx,bsy);
      _ls(0xd4a373,2); _lb(2,0,bsx,0); _f(0x60a5fa); _tr(bsx+1,0,bsx-5,-3,bsx-5,3);
    },
    knight: () => {
      _f(0x78350f); _rc(-8,10,7,10); _rc(1,10,7,10);
      _f(0xb45309); _rc(-11,-5,22,16); _f(0xd97706); _rc(-9,-4,18,14);
      _f(0x92400e); _rc(-1,-3,3,13); _rc(-7,2,15,3);
      _f(0xfbbf24); _rc(-17,-9,9,9); _rc(8,-9,9,9);
      _f(0xb0bec5); _rc(20,-28,4,32); _f(0xe0e0e0); _rc(21,-27,2,30);
      _f(0xfbbf24); _rc(16,-10,12,3); _f(0x78350f); _rc(21,-2,2,10); _f(0xfbbf24); _ci(22,8,3);
      _f(0xb45309); _rc(-10,-24,20,18); _f(0xd97706); _rc(-9,-23,18,16);
      _f(0x1c1917); _rc(-7,-18,14,5); _f(0xfbbf24,0.4); _rc(-6,-17,12,3);
      _f(0xfbbf24); _rc(-1,-26,2,5); _rc(-9,-24,18,3);
      _f(0x1d4ed8); _rc(-27,-13,12,22); _f(0x1e40af); _rc(-26,-12,10,10);
      _f(0xfbbf24); _ci(-21,-1,3);
    },
    wizard: () => {
      _f(0x5c3317); _rc(13,-34,4,46);
      _f(0x4c1d95); _ci(15,-35,9); _f(0x6d28d9); _ci(15,-35,7); _f(0xa78bfa,0.85); _ci(14,-37,5);
      _f(0x1e1b4b); _el(0,8,26,22); _f(0x312e81); _el(0,6,22,20); _rc(-11,-2,22,14);
      _f(0x818cf8,0.7); _ci(-5,4,2.5); _ci(0,2,1);
      _f(0xf5cba7); _ci(0,-8,8); _f(0x7c3aed); _ci(-3,-9,2.5); _ci(3,-9,2.5);
      _f(0xe5e7eb); _rc(-5,-4,10,5);
      _f(0x1e1b4b); _rc(-14,-15,28,5); _f(0x312e81); _tr(0,-42,-10,-13,10,-13);
      _f(0xfbbf24,0.85); _rc(-10,-19,20,3); _f(0xfbbf24); _ci(0,-31,4); _f(0x312e81); _ci(2,-32,3);
    },
    necromancer: () => {
      _f(0x0f0a1e); _tr(-12,16,-4,10,-8,22); _tr(-4,16,4,10,0,24); _tr(4,16,12,10,8,22);
      _f(0x1e1b4b); _el(0,6,24,28); _f(0x12103a); _el(-3,5,11,22);
      _f(0x44403c); _rc(10,-26,3,32); _f(0x78716c); _rc(11,-25,1,30);
      _f(0xd6d3d1); _ci(11,-28,7); _f(0xe7e5e4); _ci(11,-29,5); _f(0x1c1917); _ci(9,-30,2); _ci(13,-30,2);
      _f(0x1e1b4b); _ci(0,-9,13); _f(0x0f0a1e); _ci(0,-8,9);
      _f(0x7c3aed); _ci(-4,-10,3.5); _ci(4,-10,3.5); _f(0xa78bfa,0.9); _ci(-4,-10,2); _ci(4,-10,2);
      _f(0x6d28d9,0.8); _ci(-18,-14,5); _f(0xa78bfa,0.7); _ci(-18,-14,3);
    },
    rogue: () => {
      _f(0x134e4a); _rc(-7,10,6,10); _rc(1,10,6,10);
      _f(0x0d1f1e); _el(0,5,24,22); _f(0x115e59); _rc(-9,-2,18,14);
      _f(0x44403c); _rc(-9,5,18,3);
      _f(0x78716c); _rc(-23,4,3,14); _f(0xcbd5e1); _rc(-24,-10,5,16);
      _f(0x78716c); _rc(18,2,3,12); _f(0xcbd5e1); _rc(17,-14,5,18);
      _f(0x0d1f1e); _rc(-6,-15,12,7); _f(0x134e4a); _ci(0,-9,10); _tr(0,-28,-9,-14,9,-14);
      _f(0x2dd4bf); _ci(-3,-16,2.5); _ci(3,-16,2.5);
    },
    paladin: () => {
      _f(0x92400e); _rc(-9,10,8,11); _rc(1,10,8,11);
      _f(0xfbbf24); _rc(-13,-6,26,18); _f(0xfef08a,0.7); _rc(-11,-5,22,16);
      _f(0xffffff,0.95); _rc(-2,-5,4,16); _rc(-10,1,20,4);
      _f(0xfbbf24); _rc(-20,-10,10,12); _rc(10,-10,10,12);
      _f(0xb45309); _rc(22,-32,4,40); _f(0xfbbf24); _rc(14,-34,20,12);
      _f(0x1d4ed8); _rc(-31,-14,14,26); _f(0xfbbf24); _rc(-32,-15,16,4); _rc(-32,8,16,4); _rc(-32,-15,3,28); _rc(-16,-15,3,28);
      _f(0xfbbf24); _rc(-12,-27,24,22); _f(0x1c1917); _rc(-8,-22,16,6);
      _f(0xfbbf24); _rc(-2,-30,4,6); _f(0xffffff,0.9); _tr(0,-42,-3,-30,3,-30);
      _ls(0xfef9c3,3,0.75); _dc.beginPath(); _dc.arc(0,-32,14,0,Math.PI*2); _dc.stroke();
    },
    berserker: () => {
      _f(0x44403c); _rc(-10,10,9,12); _rc(1,10,9,12);
      _f(0xd4a373); _rc(-14,-4,28,18); _f(0xef4444,0.8); _rc(-12,0,6,3); _rc(-8,4,6,3); _rc(3,1,6,3);
      _f(0x44403c); _rc(-18,-8,9,11); _rc(9,-8,9,11);
      _f(0x57534e); _rc(-4,-38,5,50); _f(0x78716c); _rc(-3,-37,3,48);
      _f(0x9ca3af); _tr(-4,-38,-26,-28,-4,-8);
      _f(0x292524); _tr(0,-28,-10,-14,10,-14); _tr(-7,-33,-12,-14,-2,-14); _tr(7,-33,2,-14,12,-14);
      _f(0xd4a373); _ci(0,-10,9); _f(0xef4444,0.85); _rc(-8,-8,5,3); _rc(3,-8,5,3);
      _f(0xef4444); _ci(-3,-11,3); _ci(3,-11,3);
    },
  };

  const SKIN_ELITE = {
    hunter: (t) => {
      const p=Math.sin(t*2.4)*0.5+0.5;
      _G('#06b6d4',22); _dc.fillStyle='rgba(6,182,212,0.08)'; _dc.beginPath(); _dc.ellipse(0,16,34,9,0,0,Math.PI*2); _dc.fill(); _NG();
      for(let i=0;i<6;i++){const a=t*1.7+i*Math.PI/3,r=26+Math.sin(t*3+i)*4;_C(Math.cos(a)*r,Math.sin(a)*r*0.35-8,2,'#22d3ee','#06b6d4',12);}
      _dc.globalAlpha=0.45; _G('#0e7490',8);
      _dc.fillStyle='#0c4a6e'; _dc.beginPath(); _dc.moveTo(-12,-7); _dc.lineTo(-17+Math.sin(t)*3,17); _dc.lineTo(0,12); _dc.fill();
      _dc.beginPath(); _dc.moveTo(12,-7); _dc.lineTo(17+Math.sin(t+1)*3,17); _dc.lineTo(0,12); _dc.fill();
      _NG(); _dc.globalAlpha=1;
      _dc.globalAlpha=0.5; _G('#0ea5e9',18); _dc.fillStyle='#0ea5e9'; _dc.beginPath(); _dc.ellipse(0,-4,12,17,0,0,Math.PI*2); _dc.fill(); _NG(); _dc.globalAlpha=1;
      _G('#0369a1',12); _dc.fillStyle='#075985'; _dc.beginPath(); _dc.arc(0,-22,10,0,Math.PI*2); _dc.fill(); _NG();
      _dc.fillStyle='#0c4a6e'; _dc.beginPath(); _dc.moveTo(-10,-26); _dc.lineTo(0,-38); _dc.lineTo(10,-26); _dc.fill();
      _C(0,-22,4,'#bae6fd','#7dd3fc',16);
      _G('#06b6d4',20); _dc.strokeStyle='rgba(6,182,212,0.9)'; _dc.lineWidth=2; _dc.beginPath(); _dc.arc(0,-22,16,0,Math.PI*2); _dc.stroke(); _NG();
      const bsx=13+11*Math.cos(1.2),bsy=11*Math.sin(1.2);
      _G('#38bdf8',14); _dc.strokeStyle='#0ea5e9'; _dc.lineWidth=5; _dc.beginPath(); _dc.moveTo(2,0); _dc.lineTo(bsx,0); _dc.stroke(); _NG();
      _G('#06b6d4',22); _dc.strokeStyle='rgba(6,182,212,0.9)'; _dc.lineWidth=3; _dc.beginPath(); _dc.arc(13,0,11,-1.2,1.2); _dc.stroke(); _NG();
      _G('#38bdf8',16); _dc.fillStyle='#7dd3fc'; _dc.beginPath(); _dc.moveTo(bsx,bsy); _dc.lineTo(bsx,-bsy); _dc.lineTo(bsx+8,0); _dc.fill(); _NG();
    },
    rogue: (t) => {
      const p=Math.sin(t*2)*0.5+0.5, sp=Math.sin(t*3.5)*0.5+0.5;
      _G('#a855f7',18); _dc.fillStyle='rgba(168,85,247,0.08)'; _dc.beginPath(); _dc.ellipse(0,16,30,8,0,0,Math.PI*2); _dc.fill(); _NG();
      for(let i=0;i<8;i++){const a=(t*2.5+i*Math.PI/4)%(Math.PI*2);_C(Math.cos(a)*28,Math.sin(a)*28*0.3-6,1.8,'#c084fc','#a855f7',10);}
      _G('#6b21a8',12); _dc.globalAlpha=0.85; _dc.fillStyle='#1a0030'; _dc.beginPath(); _dc.ellipse(0,4,13,18,0,0,Math.PI*2); _dc.fill(); _NG(); _dc.globalAlpha=1;
      _G('#a855f7',10); _dc.fillStyle='#0d1f2d'; _dc.beginPath(); _dc.arc(0,-9,11,0,Math.PI*2); _dc.fill();
      _dc.beginPath(); _dc.moveTo(0,-28); _dc.lineTo(-10,-14); _dc.lineTo(10,-14); _dc.fill(); _NG();
      _C(-3,-10,3,'#c084fc','#a855f7',18); _C(3,-10,3,'#c084fc','#a855f7',18);
      _dc.save(); _dc.translate(-18,2); _dc.rotate(-0.3-Math.sin(t*2)*0.1);
      _G('#c084fc',14); _dc.strokeStyle='#7e22ce'; _dc.lineWidth=3; _dc.beginPath(); _dc.moveTo(0,-14); _dc.lineTo(0,10); _dc.stroke();
      _dc.fillStyle='#e9d5ff'; _dc.beginPath(); _dc.moveTo(-4,-14); _dc.lineTo(4,-14); _dc.lineTo(2,0); _dc.lineTo(-2,0); _dc.fill(); _NG(); _dc.restore();
      _dc.save(); _dc.translate(18,2); _dc.rotate(0.3+Math.sin(t*2+1)*0.1);
      _G('#c084fc',14); _dc.strokeStyle='#7e22ce'; _dc.lineWidth=3; _dc.beginPath(); _dc.moveTo(0,-14); _dc.lineTo(0,10); _dc.stroke();
      _dc.fillStyle='#e9d5ff'; _dc.beginPath(); _dc.moveTo(-4,-14); _dc.lineTo(4,-14); _dc.lineTo(2,0); _dc.lineTo(-2,0); _dc.fill(); _NG(); _dc.restore();
    },
    paladin: (t) => {
      const p=Math.sin(t*1.5)*0.5+0.5, sp=Math.sin(t*4)*0.5+0.5;
      _G('#fef08a',24); _dc.fillStyle='rgba(254,240,138,0.09)'; _dc.beginPath(); _dc.ellipse(0,18,44,11,0,0,Math.PI*2); _dc.fill(); _NG();
      for(let i=0;i<10;i++){const a=t*0.4+i*Math.PI*2/10;_C(Math.cos(a)*38,Math.sin(a)*38*0.28-8,1.8,'#fde68a','#fbbf24',12);}
      _G('#fbbf24',18); _dc.fillStyle='#78350f'; _dc.beginPath(); _dc.ellipse(0,3,17,22,0,0,Math.PI*2); _dc.fill(); _NG();
      _dc.fillStyle='#92400e'; _dc.beginPath(); _dc.ellipse(0,3,14,18,0,0,Math.PI*2); _dc.fill();
      _G('#fbbf24',14); _dc.strokeStyle='rgba(251,191,36,0.9)'; _dc.lineWidth=3;
      _dc.beginPath(); _dc.moveTo(0,-16); _dc.lineTo(0,0); _dc.stroke();
      _dc.beginPath(); _dc.moveTo(-10,-9); _dc.lineTo(10,-9); _dc.stroke(); _NG();
      _G('#fef08a',28); _dc.strokeStyle='rgba(254,240,138,0.7)'; _dc.lineWidth=4; _dc.beginPath(); _dc.arc(0,-30,18,0,Math.PI*2); _dc.stroke(); _NG();
      _G('#fbbf24',16); _dc.fillStyle='#451a03'; _rc(-11,-25,22,20); _NG();
      _dc.fillStyle='#78350f'; _rc(-10,-24,20,18);
      _G('#fef08a',22); _dc.fillStyle='rgba(254,240,138,0.9)'; _rc(-7,-20,6,4); _rc(1,-20,6,4); _NG();
      _dc.save(); _dc.translate(24,-14);
      _G('#fbbf24',18); _dc.strokeStyle='#78350f'; _dc.lineWidth=5; _dc.beginPath(); _dc.moveTo(0,-24); _dc.lineTo(0,28); _dc.stroke(); _NG();
      _G('#fef08a',22); _dc.fillStyle='#451a03';
      _dc.beginPath(); _dc.moveTo(-12,-8); _dc.lineTo(12,-8); _dc.lineTo(8,0); _dc.lineTo(-8,0); _dc.fill();
      _dc.beginPath(); _dc.moveTo(-12,4); _dc.lineTo(12,4); _dc.lineTo(8,12); _dc.lineTo(-8,12); _dc.fill(); _NG();
      _C(0,8,5,'#fef08a','#fbbf24',20); _dc.restore();
      _dc.save(); _dc.translate(-26,-2);
      _G('#1d4ed8',14); _dc.fillStyle='#1e3a5f';
      _dc.beginPath(); _dc.moveTo(0,-20); _dc.lineTo(13,-12); _dc.lineTo(13,12); _dc.lineTo(0,22); _dc.lineTo(-13,12); _dc.lineTo(-13,-12); _dc.closePath(); _dc.fill(); _NG();
      _G('#fef08a',12); _dc.strokeStyle='rgba(254,240,138,0.9)'; _dc.lineWidth=2.5;
      _dc.beginPath(); _dc.moveTo(0,-14); _dc.lineTo(0,14); _dc.stroke();
      _dc.beginPath(); _dc.moveTo(-9,0); _dc.lineTo(9,0); _dc.stroke(); _NG(); _dc.restore();
    },
    berserker: (t) => {
      const sp=Math.sin(t*4)*0.5+0.5, p=Math.sin(t*2)*0.5+0.5;
      _G('#dc2626',20); _dc.fillStyle='rgba(220,38,38,0.1)'; _dc.beginPath(); _dc.ellipse(0,18,46,11,0,0,Math.PI*2); _dc.fill(); _NG();
      for(let i=0;i<8;i++){const a=t*2.8+i*Math.PI/4,r=34+Math.sin(t*3+i)*5;_C(Math.cos(a)*r,Math.sin(a)*r*0.3-10,2.5,'#ef4444','#dc2626',14);}
      _dc.save(); _dc.rotate(Math.sin(t*2.5)*0.06);
      _G('#dc2626',16); _dc.fillStyle='#3b0000'; _dc.beginPath(); _dc.ellipse(0,2,18,24,0,0,Math.PI*2); _dc.fill(); _NG();
      _dc.fillStyle='#1a0000'; _dc.beginPath(); _dc.ellipse(0,2,14,20,0,0,Math.PI*2); _dc.fill();
      _G('#dc2626',12); _dc.fillStyle='#1a0000'; _dc.beginPath(); _dc.arc(0,-12,13,0,Math.PI*2); _dc.fill(); _NG();
      _dc.fillStyle='#3b0000'; _dc.beginPath(); _dc.arc(0,-12,10,0,Math.PI*2); _dc.fill();
      _G('#ef4444',28); _dc.fillStyle='rgba(239,68,68,0.95)'; _ci(-4,-13,4); _ci(4,-13,4); _NG(); _dc.restore();
      _G('#a16207',8); _dc.strokeStyle='#78350f'; _dc.lineWidth=5; _dc.beginPath(); _dc.moveTo(0,-20); _dc.lineTo(0,24); _dc.stroke(); _NG();
      _G('#dc2626',18); _dc.fillStyle='#1a0404';
      _dc.beginPath();_dc.moveTo(0,-20);_dc.lineTo(24,-10);_dc.lineTo(18,-2);_dc.lineTo(0,-5);_dc.closePath();_dc.fill();
      _dc.beginPath();_dc.moveTo(0,-20);_dc.lineTo(-5,-10);_dc.lineTo(-2,-2);_dc.lineTo(0,-5);_dc.closePath();_dc.fill(); _NG();
    },
    knight: (t) => {
      const p=Math.sin(t*2)*0.5+0.5, sp=Math.sin(t*4)*0.5+0.5;
      _G('#f97316',28); _dc.fillStyle='rgba(249,115,22,0.08)'; _dc.beginPath(); _dc.ellipse(0,18,50,11,0,0,Math.PI*2); _dc.fill(); _NG();
      for(let i=0;i<10;i++){const a=(t*2.5+i*0.63)%(Math.PI*2);_C(Math.cos(a)*28,Math.sin(a)*8-12,1.6,'#fb923c','#f97316',10);}
      _G('#f97316',16); _dc.fillStyle='#111827'; _dc.beginPath(); _dc.ellipse(0,-4,17,21,0,0,Math.PI*2); _dc.fill(); _NG();
      _dc.fillStyle='#1f2937'; _dc.beginPath(); _dc.ellipse(0,-4,14,18,0,0,Math.PI*2); _dc.fill();
      _G('#f97316',14); _dc.strokeStyle='rgba(249,115,22,0.9)'; _dc.lineWidth=3;
      _dc.beginPath(); _dc.moveTo(0,-17); _dc.lineTo(0,-1); _dc.stroke();
      _dc.beginPath(); _dc.moveTo(-10,-10); _dc.lineTo(10,-10); _dc.stroke(); _NG();
      _dc.fillStyle='#111827'; _rc(-21,-12,11,13); _rc(10,-12,11,13);
      _G('#f97316',10); _dc.fillStyle='#f97316';
      _dc.beginPath(); _dc.moveTo(-15,-12); _dc.lineTo(-20,-22); _dc.lineTo(-10,-12); _dc.fill();
      _dc.beginPath(); _dc.moveTo(15,-12); _dc.lineTo(20,-22); _dc.lineTo(10,-12); _dc.fill(); _NG();
      _dc.fillStyle='#0f172a'; _rc(-13,-27,26,22); _dc.fillStyle='#1f2937'; _rc(-12,-26,24,20);
      _G('#f97316',18); _dc.fillStyle='rgba(249,115,22,0.9)'; _rc(-9,-20,7,3); _rc(2,-20,7,3); _NG();
      _dc.save(); _dc.translate(26,-15); _dc.rotate(0.1);
      _G('#f97316',22); _dc.strokeStyle='rgba(249,115,22,0.35)'; _dc.lineWidth=10; _dc.beginPath(); _dc.moveTo(0,-28); _dc.lineTo(0,22); _dc.stroke();
      _dc.strokeStyle='#e5e7eb'; _dc.lineWidth=5; _dc.beginPath(); _dc.moveTo(0,-28); _dc.lineTo(0,22); _dc.stroke(); _NG();
      _dc.fillStyle='#374151'; _rc(-14,-4,28,5);
      _G('#f97316',12); _dc.fillStyle='#f97316'; _dc.beginPath(); _dc.arc(0,-1,4,0,Math.PI*2); _dc.fill(); _NG(); _dc.restore();
      _dc.save(); _dc.translate(-24,-4);
      _G('#1d4ed8',14); _dc.fillStyle='#1e3a5f';
      _dc.beginPath(); _dc.moveTo(0,-20); _dc.lineTo(13,-12); _dc.lineTo(13,12); _dc.lineTo(0,22); _dc.lineTo(-13,12); _dc.lineTo(-13,-12); _dc.closePath(); _dc.fill(); _NG();
      _G('#f97316',12); _dc.strokeStyle='rgba(249,115,22,0.9)'; _dc.lineWidth=2.5;
      _dc.beginPath(); _dc.moveTo(0,-14); _dc.lineTo(0,14); _dc.stroke();
      _dc.beginPath(); _dc.moveTo(-9,0); _dc.lineTo(9,0); _dc.stroke(); _NG(); _dc.restore();
    },
    wizard: (t) => {
      const p=Math.sin(t*1.8)*0.5+0.5, sp=Math.sin(t*4)*0.5+0.5;
      for(let i=0;i<6;i++){const a=t*1.2+i*Math.PI/3,r=34+Math.sin(t*2+i)*4;_C(Math.cos(a)*r,Math.sin(a)*r*0.32-8,3.5,'#a78bfa','#7c3aed',14);}
      _G('#4c1d95',14); _dc.fillStyle='#0f0a2e'; _dc.beginPath(); _dc.ellipse(0,5,15,22,0,0,Math.PI*2); _dc.fill(); _NG();
      _dc.fillStyle='#f5cba7'; _dc.beginPath(); _dc.arc(0,-10,8,0,Math.PI*2); _dc.fill();
      _C(-3,-11,2.8,'#a78bfa','#7c3aed',18); _C(3,-11,2.8,'#a78bfa','#7c3aed',18);
      _G('#4c1d95',12); _dc.fillStyle='#1e1b4b'; _rc(-14,-18,28,6); _NG();
      _G('#7c3aed',16); _dc.fillStyle='#312e81'; _dc.beginPath(); _dc.moveTo(0,-44); _dc.lineTo(-11,-15); _dc.lineTo(11,-15); _dc.closePath(); _dc.fill(); _NG();
      _C(0,-32,3,'#ede9fe','#a78bfa',14);
      _dc.save(); _dc.translate(16,-2);
      _dc.strokeStyle='#3b0764'; _dc.lineWidth=3; _dc.beginPath(); _dc.moveTo(0,-32); _dc.lineTo(0,26); _dc.stroke();
      _G('#7c3aed',24); _dc.fillStyle='#1e1b4b'; _dc.beginPath(); _dc.arc(0,-34,12,0,Math.PI*2); _dc.fill();
      _G('#a78bfa',18); _dc.fillStyle='#4c1d95'; _dc.beginPath(); _dc.arc(0,-34,9,0,Math.PI*2); _dc.fill();
      _C(0,-34,6,'#a78bfa','#7c3aed',20); _C(0,-34,3,'#ede9fe','#a78bfa',14);
      for(let i=0;i<4;i++){const a=t*3+i*Math.PI/2;_C(Math.cos(a)*10,Math.sin(a)*10-34,2,'#fbbf24','#fbbf24',10);}
      _G('#a78bfa',10); _dc.strokeStyle='rgba(167,139,250,0.8)'; _dc.lineWidth=1.2;
      for(let i=0;i<5;i++){const a=t*4+i*Math.PI*0.4,r=12+Math.sin(t*5+i)*3;_dc.beginPath();_dc.moveTo(0,-34);_dc.lineTo(Math.cos(a)*r,Math.sin(a)*r-34);_dc.stroke();} _NG();
      _dc.restore();
    },
    necromancer: (t) => {
      const p=Math.sin(t*2)*0.5+0.5, sp=Math.sin(t*5)*0.5+0.5;
      _G('#16a34a',20); _dc.fillStyle='rgba(22,163,74,0.08)'; _dc.beginPath(); _dc.ellipse(0,18,44,10,0,0,Math.PI*2); _dc.fill(); _NG();
      for(let i=0;i<4;i++){
        const a=t*0.8+i*Math.PI/2,sx=Math.cos(a)*34,sy=Math.sin(a)*34*0.3-10;
        _G('#22c55e',10); _dc.fillStyle='#d6d3d1'; _dc.beginPath(); _dc.arc(sx,sy,5,0,Math.PI*2); _dc.fill();
        _dc.fillStyle='#1c1917'; _dc.beginPath(); _dc.arc(sx-1.5,sy-1,1.5,0,Math.PI*2); _dc.fill(); _dc.beginPath(); _dc.arc(sx+1.5,sy-1,1.5,0,Math.PI*2); _dc.fill(); _NG();
      }
      for(let i=0;i<8;i++){const a=(t*2+i*0.78)%(Math.PI*2),r=20+i*2;_C(Math.cos(a)*r*0.7,Math.sin(a)*r*0.35-8,2,'#4ade80','#16a34a',10);}
      _G('#14532d',10); _dc.fillStyle='#0a0f0a'; _dc.beginPath(); _dc.ellipse(0,4,15,22,0,0,Math.PI*2); _dc.fill(); _NG();
      _G('#14532d',10); _dc.fillStyle='#050f05'; _dc.beginPath(); _dc.arc(0,-10,13,0,Math.PI*2); _dc.fill(); _NG();
      _dc.fillStyle='#0a0f0a'; _dc.beginPath(); _dc.arc(0,-9,9,0,Math.PI*2); _dc.fill();
      _G('#22c55e',22); _dc.fillStyle='#4ade80'; _dc.beginPath(); _dc.arc(-4,-11,3.5,0,Math.PI*2); _dc.fill(); _dc.beginPath(); _dc.arc(4,-11,3.5,0,Math.PI*2); _dc.fill();
      _G('#86efac',12); _dc.fillStyle='#bbf7d0'; _dc.beginPath(); _dc.arc(-4,-11,2,0,Math.PI*2); _dc.fill(); _dc.beginPath(); _dc.arc(4,-11,2,0,Math.PI*2); _dc.fill(); _NG();
      _dc.save(); _dc.translate(12,-8); _dc.rotate(0.15);
      _dc.strokeStyle='#1f2937'; _dc.lineWidth=3.5; _dc.beginPath(); _dc.moveTo(-4,-30); _dc.lineTo(4,28); _dc.stroke();
      _G('#22c55e',20); _dc.fillStyle='#052e16';
      _dc.beginPath(); _dc.moveTo(-4,-30); _dc.bezierCurveTo(-4,-30,28,-24,20,-6); _dc.bezierCurveTo(16,-2,-4,-12,-4,-30); _dc.fill();
      _G('#4ade80',14); _dc.strokeStyle='rgba(74,222,128,0.9)'; _dc.lineWidth=2;
      _dc.beginPath(); _dc.moveTo(-4,-30); _dc.bezierCurveTo(-4,-30,28,-24,20,-6); _dc.stroke(); _NG();
      _dc.restore();
      _C(-20,-14,6,'#052e16','#16a34a',16); _C(-20,-14,4,'#14532d','#22c55e',12);
    },
  };

  function _drawOnCanvas(cv, drawFn, t, isDefault) {
    _dc = cv.getContext('2d');
    _dc.clearRect(0, 0, cv.width, cv.height);
    _dc.fillStyle = '#080018';
    _dc.fillRect(0, 0, cv.width, cv.height);
    _dc.save();
    _dc.translate(cv.width / 2, cv.height * 0.65);
    if (isDefault) drawFn(); else drawFn(t);
    _dc.restore();
    _dc.globalAlpha = 1;
  }

  class SkinPickerScene extends Phaser.Scene {
    constructor() { super('SkinPicker'); }
    init(data) { this._key = data.key; }

    create() {
      const W = this.scale.width, H = this.scale.height;
      const key = this._key;
      const cls = CLASSES[key];
      const cHex = '#' + cls.color.toString(16).padStart(6,'0');

      this.add.rectangle(W/2, H/2, W, H, 0x060010, 0.97).setDepth(0);
      this.add.text(W/2, 38, cls.name.toUpperCase(), {
        fontSize:'20px', fontFamily:'system-ui', fontStyle:'bold', color:cHex,
      }).setOrigin(0.5).setDepth(1);
      this.add.text(W/2, 62, 'SELECT YOUR SKIN', {
        fontSize:'11px', fontFamily:'system-ui', color:'#4b5563',
      }).setOrigin(0.5).setDepth(1);

      const panW = Math.min(180, Math.floor((W - 56) / 2));
      const panH = Math.floor(panW * 1.22);
      const gap  = 14;
      const lx   = W/2 - Math.floor(panW/2) - Math.floor(gap/2);
      const rx   = W/2 + Math.floor(panW/2) + Math.floor(gap/2);
      const py   = 80 + Math.floor(panH/2);

      const g = this.add.graphics().setDepth(1);
      g.fillStyle(0x0f071e, 0.92); g.lineStyle(2, cls.color, 0.85);
      g.fillRoundedRect(lx-panW/2, py-panH/2, panW, panH, 8);
      g.strokeRoundedRect(lx-panW/2, py-panH/2, panW, panH, 8);
      g.fillStyle(0x0a0418, 0.72); g.lineStyle(2, 0x4b5563, 0.4);
      g.fillRoundedRect(rx-panW/2, py-panH/2, panW, panH, 8);
      g.strokeRoundedRect(rx-panW/2, py-panH/2, panW, panH, 8);

      this.add.text(lx, py-panH/2+14, 'DEFAULT', { fontSize:'10px', fontFamily:'system-ui', fontStyle:'bold', color:'#a78bfa' }).setOrigin(0.5).setDepth(2);
      this.add.text(rx, py-panH/2+14, 'ELITE ★',  { fontSize:'10px', fontFamily:'system-ui', fontStyle:'bold', color:'#4b5563' }).setOrigin(0.5).setDepth(2);

      const cvW = panW - 12, cvH = panH - 36;
      this._defCv   = document.createElement('canvas'); this._defCv.width=cvW;   this._defCv.height=cvH;
      this._eliteCv = document.createElement('canvas'); this._eliteCv.width=cvW; this._eliteCv.height=cvH;

      const tk1 = '_spd_' + key, tk2 = '_spe_' + key;
      if (this.textures.exists(tk1)) this.textures.remove(tk1);
      if (this.textures.exists(tk2)) this.textures.remove(tk2);
      this._defTex   = this.textures.addCanvas(tk1, this._defCv);
      this._eliteTex = this.textures.addCanvas(tk2, this._eliteCv);
      this._tk1 = tk1; this._tk2 = tk2;

      this._defImg   = this.add.image(lx, py+10, tk1).setDepth(2);
      this._eliteImg = this.add.image(rx, py+10, tk2).setDepth(2).setAlpha(0.38);

      /* Lock overlay */
      const lg = this.add.graphics().setDepth(3);
      lg.fillStyle(0x06000f, 0.68);
      lg.fillRoundedRect(rx-panW/2+1, py-panH/2+1, panW-2, panH-2, 7);
      this.add.text(rx, py-14, '🔒', { fontSize:'22px' }).setOrigin(0.5).setDepth(4);
      this.add.text(rx, py+12, 'COMING SOON', { fontSize:'9px', fontFamily:'system-ui', fontStyle:'bold', color:'#6b7280' }).setOrigin(0.5).setDepth(4);

      /* Buttons */
      const btnY = py + panH/2 + 32;
      const backBg = this.add.rectangle(W/2-70, btnY, 110, 38, 0x0f071e, 0.92)
        .setStrokeStyle(1.5, 0x7c3aed, 0.7).setInteractive({ useHandCursor:true }).setDepth(5);
      this.add.text(W/2-70, btnY, '← BACK', { fontSize:'13px', fontFamily:'system-ui', fontStyle:'bold', color:'#a78bfa' }).setOrigin(0.5).setDepth(6);
      backBg.on('pointerover',  () => backBg.setFillColor(0x1e0f3a));
      backBg.on('pointerout',   () => backBg.setFillColor(0x0f071e));
      backBg.on('pointerdown',  () => { this._cleanup(); this.scene.stop('SkinPicker'); this.scene.wake('ClassSelect'); });

      const playBg = this.add.rectangle(W/2+54, btnY, 110, 38, 0x7c3aed)
        .setInteractive({ useHandCursor:true }).setDepth(5);
      this.add.text(W/2+54, btnY, '▶  PLAY', { fontSize:'14px', fontFamily:'system-ui', fontStyle:'bold', color:'#ffffff' }).setOrigin(0.5).setDepth(6);
      playBg.on('pointerover',  () => playBg.setFillColor(0x6d28d9));
      playBg.on('pointerout',   () => playBg.setFillColor(0x7c3aed));
      playBg.on('pointerdown',  () => {
        localStorage.setItem('hoa_class', key);
        this._cleanup();
        this.scene.stop('SkinPicker');
        this.scene.stop('ClassSelect');
        this.scene.start('Game');
        this.scene.launch('UI');
      });
    }

    _cleanup() {
      try { this.textures.remove(this._tk1); } catch {}
      try { this.textures.remove(this._tk2); } catch {}
    }

    update() {
      const t = this.time.now / 1000;
      _drawOnCanvas(this._defCv,   SKIN_DEFAULT[this._key] || SKIN_DEFAULT.hunter, t, true);
      _drawOnCanvas(this._eliteCv, SKIN_ELITE[this._key]   || SKIN_ELITE.hunter,   t, false);
      if (this._defTex)   this._defTex.source[0].update();
      if (this._eliteTex) this._eliteTex.source[0].update();
    }

    shutdown() { this._cleanup(); }
  }

`;

/* Insert the skin code right before the ClassSelectScene class definition */
s = s.slice(0, insertPoint) + skinCode + s.slice(insertPoint);
console.log('Inserted SkinPickerScene: OK');

fs.writeFileSync('C:/Users/Garci/Claude 1/aurora-site.html', s, 'utf8');
console.log('Done. Size:', s.length);
