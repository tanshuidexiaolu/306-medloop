const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2];
const DIR = path.join(ROOT, 'data', 'hebmu');
const maps = {};
fs.readdirSync(DIR).filter(f => /^exp-map-\d+\.json$/.test(f)).forEach(f => Object.assign(maps, JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))));
const short = Object.keys(maps).filter(k => String(maps[k]).length < 80).map(k => ({ id: k, len: String(maps[k]).length, text: String(maps[k]) }));
console.log('短解析条数:', short.length);
short.forEach(s => console.log(s.id, s.len, '|', s.text.slice(0, 60)));
