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
  controlFlowFlattening: false, // keeping false — Phaser loops break with flattening
  deadCodeInjection: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  renameGlobals: false,       // keep Phaser globals intact
  selfDefending: true,        // breaks if code is reformatted in devtools
  disableConsoleOutput: true, // silences console.log/warn/error
  debugProtection: true,      // triggers infinite loop if debugger is opened
  debugProtectionInterval: 2000,
  identifierNamesGenerator: 'hexadecimal',
});

const obfuscatedJs = result.getObfuscatedCode();
const out = src.slice(0, lastMatch.index) +
  '<script>' + obfuscatedJs + '<\/script>' +
  src.slice(lastMatch.index + lastMatch[0].length);

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync(path.join('dist', 'index.html'), out, 'utf8');
console.log('Built dist/index.html (' + Math.round(out.length / 1024) + ' KB)');
