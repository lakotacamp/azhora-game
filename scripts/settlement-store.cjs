const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash, randomBytes } = require('node:crypto');
const safeId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,200}$/.test(value);

/** Renderer values are hashed filenames inside a fixed archive, never supplied paths. */
function createSettlementStore({ directory, memoryOnly = false } = {}) {
  const root = path.resolve(directory), memory = new Map();
  let chain = Promise.resolve();
  const name = id => path.join(root, createHash('sha256').update(id).digest('hex') + '.json');
  async function read(id) {
    if (!safeId(id)) throw new Error('Invalid archive ID.');
    if (memoryOnly) return memory.get(id) ?? null;
    try { const text = await fs.readFile(name(id), 'utf8'); if (Buffer.byteLength(text) > 128 * 1024) throw new Error('Page too large.'); return JSON.parse(text); }
    catch (e) { if (e.code === 'ENOENT') return null; throw e; }
  }
  async function write(row) {
    const text = JSON.stringify(row); if (Buffer.byteLength(text) > 128 * 1024) throw new Error('Page too large.');
    if (memoryOnly) { memory.set(row.id, structuredClone(row)); return; }
    await fs.mkdir(root, { recursive: true }); const target = name(row.id), tmp = target + '.' + randomBytes(8).toString('hex') + '.tmp';
    try { const handle = await fs.open(tmp, 'wx', 0o600); try { await handle.writeFile(text, 'utf8'); await handle.sync(); } finally { await handle.close(); } await fs.rename(tmp, target); }
    finally { await fs.unlink(tmp).catch(() => {}); }
  }
  async function operate(operation, args) {
    const { validateChronicleEntry } = await import('../src/settlements/engine.js');
    const { validGeneration } = await import('../src/settlements/archive.js');
    if (!Array.isArray(args) || args.length > 2) throw new Error('Invalid archive arguments.');
    if (operation === 'put') {
      const [entry] = args; if (!validateChronicleEntry(entry)) throw new Error('Invalid chronicle facts.');
      const old = await read(entry.id);
      if (old && old.entry.factsHash !== entry.factsHash) throw new Error('History diverged; use a new world edition.');
      if (!old) await write({ id: entry.id, entry, generation: { status: 'pending' } }); return true;
    }
    if (operation === 'get') return read(args[0]);
    if (operation === 'update') {
      const [id, generation] = args, row = await read(id);
      if (!row || !validGeneration(generation)) throw new Error('Invalid generation update.');
      await write({ ...row, generation }); return true;
    }
    if (operation === 'list') {
      const [worldId, settlementId] = args;
      if (!safeId(worldId) || settlementId !== undefined && !safeId(settlementId)) throw new Error('Invalid archive query.');
      const rows = memoryOnly ? [...memory.values()] : await Promise.all((await fs.readdir(root).catch(e => e.code === 'ENOENT' ? [] : Promise.reject(e)))
        .filter(f => /^[a-f0-9]{64}\.json$/.test(f)).map(async file => {
          const text = await fs.readFile(path.join(root, file), 'utf8'); if (Buffer.byteLength(text) > 128 * 1024) throw new Error('Page too large.'); return JSON.parse(text);
        }));
      return rows.filter(r => r.entry.worldId === worldId && (!settlementId || r.entry.settlementId === settlementId))
        .map(r => ({ id: r.id, day: r.entry.day, kind: r.entry.kind, settlementId: r.entry.settlementId, status: r.generation.status }))
        .sort((a, b) => a.day - b.day || (a.kind === b.kind ? a.id.localeCompare(b.id) : a.kind === 'opening' ? -1 : 1));
    }
    throw new Error('Unknown archive operation.');
  }
  return { handle(operation, args) {
    const result = chain.then(() => operate(operation, args)).then(value => ({ ok: true, value }), e => ({ ok: false, reason: e.message }));
    chain = result; return result;
  } };
}
module.exports = { createSettlementStore };
