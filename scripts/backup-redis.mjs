// Dump complet Upstash Redis → backup.json. Folosește pipeline-ul REST
// pentru a evita 3000+ round-trips. Zero dependențe, doar fetch native (Node 20+).

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!URL || !TOKEN) {
  console.error('Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function cmd(...args) {
  const r = await fetch(URL, { method: 'POST', headers, body: JSON.stringify(args) });
  return (await r.json()).result;
}

async function pipeline(commands) {
  const r = await fetch(`${URL}/pipeline`, { method: 'POST', headers, body: JSON.stringify(commands) });
  return (await r.json()).map(x => x.result);
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

const t0 = Date.now();

const allKeys = [];
let cursor = '0';
do {
  const [next, keys] = await cmd('SCAN', cursor, 'COUNT', '1000');
  allKeys.push(...keys);
  cursor = next;
} while (cursor !== '0');

const types = [];
for (const batch of chunk(allKeys, 200)) {
  const res = await pipeline(batch.map(k => ['TYPE', k]));
  types.push(...res);
}

const all = {};
for (const batch of chunk(allKeys.map((k, i) => [k, types[i]]), 200)) {
  const cmds = batch.map(([key, type]) => {
    switch (type) {
      case 'string': return ['GET', key];
      case 'hash': return ['HGETALL', key];
      case 'list': return ['LRANGE', key, '0', '-1'];
      case 'set': return ['SMEMBERS', key];
      case 'zset': return ['ZRANGE', key, '0', '-1', 'WITHSCORES'];
      default: return ['TYPE', key];
    }
  });
  const values = await pipeline(cmds);
  batch.forEach(([key, type], i) => { all[key] = { type, value: values[i] }; });
}

const { writeFileSync } = await import('fs');
const json = JSON.stringify({ ts: Date.now(), keyCount: allKeys.length, data: all });
writeFileSync('backup.json', json);

const dt = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`✅ ${allKeys.length} keys, ${(json.length / 1024).toFixed(1)} KB, ${dt}s`);
