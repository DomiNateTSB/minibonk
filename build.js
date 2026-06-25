const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const src = fs.readFileSync('aurora-site.html', 'utf8');

// Extract the main <script> block (last one, which is the game)
const scriptRe = /<script>([\s\S]*?)<\/script>/g;
let match, lastMatch;
while ((match = scriptRe.exec(src)) !== null) lastMatch = match;

if (!lastMatch) { console.error('No <script> block found'); process.exit(1); }

const originalJs = lastMatch[1];

const result = JavaScriptObfuscator.obfuscate(originalJs, {
  compact: true,
  controlFlowFlattening: false, // Phaser loops break with flattening
  deadCodeInjection: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  renameGlobals: false,         // keep Phaser globals intact
  selfDefending: false,         // removed: breaks legitimate debugging
  disableConsoleOutput: false,  // removed: hides real errors in production
  debugProtection: false,       // removed: DoS risk against own devtools
  debugProtectionInterval: 0,
  identifierNamesGenerator: 'hexadecimal',
});

const obfuscatedJs = result.getObfuscatedCode();
const out = src.slice(0, lastMatch.index) +
  '<script>' + obfuscatedJs + '<\/script>' +
  src.slice(lastMatch.index + lastMatch[0].length);

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync(path.join('dist', 'index.html'), out, 'utf8');
// Copy logo asset — source from assets/ so it's tracked in git
const logoSrc = fs.existsSync('assets/logo.png') ? 'assets/logo.png' : 'transparentlogo.png';
if (fs.existsSync(logoSrc)) fs.copyFileSync(logoSrc, path.join('dist', 'logo.png'));
// Copy admin panel
if (fs.existsSync('admin.html')) fs.copyFileSync('admin.html', path.join('dist', 'admin.html'));
console.log('Built dist/index.html (' + Math.round(out.length / 1024) + ' KB)');
