/** Cooperative region construction. A job must yield between small pieces of work:
 * the budget cannot interrupt a single expensive iterator.next() call. */
export function createRegionLoading({ initialRegions = [], regionAt = () => null,
  regionCenters = {}, adjacency = {}, budgetMs = 4,
  requestFrame = callback => requestAnimationFrame(callback), cancelFrame = id => cancelAnimationFrame(id),
  now = () => performance.now(), onComplete = () => {}, onError = () => {} } = {}) {
  const jobs = new Map(), initial = new Set(initialRegions), requested = new Set(), waiters = new Map();
  let active = null, running = false, frame = null, revision = 0, position = null, region = null, heading = null;
  let longestSliceMs = 0;
  const identity = value => value && typeof value === 'object' ? value.id : value;
  const lookup = (source, key) => source instanceof Map ? source.get(key) : source?.[key];
  const regionJobs = id => [...jobs.values()].filter(job => job.regions.includes(id));
  const isReady = value => {
    const id = identity(value), relevant = regionJobs(id);
    return relevant.length ? relevant.every(job => job.status === 'ready') : initial.has(id);
  };
  function settle() {
    for (const [id, list] of waiters) {
      const failed = regionJobs(id).find(job => job.status === 'failed');
      if (!failed && !isReady(id)) continue;
      for (const waiter of list) failed ? waiter.reject(failed.error) : waiter.resolve(state());
      waiters.delete(id); requested.delete(id);
    }
  }
  function score(job) {
    const needed = new Set(), visit = item => {
      if (!item || needed.has(item.id)) return;
      needed.add(item.id); for (const id of item.dependencies) visit(jobs.get(id));
    };
    for (const candidate of jobs.values()) if (candidate.regions.some(id => requested.has(id))) visit(candidate);
    if (needed.has(job.id)) return -1e12;
    if (job.regions.includes(region)) return -1e11;
    const neighbors = lookup(adjacency, region) ?? [];
    const nearby = job.regions.some(id => typeof neighbors.has === 'function' ? neighbors.has(id) : neighbors.includes(id));
    let distance = Infinity;
    for (const id of job.regions) {
      const center = job.center ?? lookup(regionCenters, id);
      if (!position || !center || !Number.isFinite(center.x) || !Number.isFinite(center.z)) continue;
      const dx = center.x - position.x, dz = center.z - position.z, length = Math.hypot(dx, dz);
      // Distance remains dominant; heading breaks ties in favor of the road ahead.
      const forward = heading && length ? (dx * heading.x + dz * heading.z) / length : 0;
      distance = Math.min(distance, length * (1 - .2 * Math.max(-1, Math.min(1, forward))));
    }
    return (nearby ? -1e8 : 0) + (Number.isFinite(distance) ? distance : job.order);
  }
  function dependenciesReady(job) { return job.dependencies.every(id => jobs.get(id)?.status === 'ready'); }
  function fail(job, cause) {
    job.status = 'failed'; job.error = cause instanceof Error ? cause : new Error(String(cause));
    active = null;
    try { onError(job.error, job.id); } catch { /* Reporting cannot strand the queue. */ }
    settle();
  }
  function schedule() {
    if (running && frame === null && [...jobs.values()].some(job => job.status === 'pending' || job.status === 'loading'))
      frame = requestFrame(tick);
  }
  function tick() {
    frame = null;
    if (!running) return;
    const started = now();
    do {
      if (!active) {
        for (const job of jobs.values()) if (job.status === 'pending') {
          const failed = job.dependencies.map(id => jobs.get(id)).find(dependency => dependency?.status === 'failed');
          if (failed) fail(job, new Error(`${job.id} depends on failed region job ${failed.id}`, { cause: failed.error }));
        }
        active = [...jobs.values()].filter(job => job.status === 'pending' && dependenciesReady(job)).sort((a, b) => score(a) - score(b) || a.order - b.order)[0] ?? null;
        if (!active) {
          // All remaining dependencies are absent or cyclic; never spin an
          // animation frame forever while travel awaits an impossible region.
          for (const job of jobs.values()) if (job.status === 'pending') fail(job, new Error(`Unresolved dependencies for region job ${job.id}`));
          break;
        }
        active.status = 'loading';
        try {
          active.iterator = active.steps();
          if (!active.iterator || typeof active.iterator.next !== 'function') throw new Error(`Region job ${active.id} did not return an iterator`);
        } catch (error) { fail(active, error); continue; }
      }
      const job = active, stepStart = now();
      try {
        const step = job.iterator.next();
        if (step && typeof step.then === 'function') throw new Error(`Region job ${job.id} must use a synchronous generator`);
        if (step.done) {
          job.onComplete?.(step.value);
          job.status = 'ready'; active = null; revision++;
          onComplete({ id: job.id, regions: [...job.regions], value: step.value, revision });
          settle();
        }
      } catch (error) { fail(job, error); }
      finally {
        const elapsed = Math.max(0, now() - stepStart);
        longestSliceMs = Math.max(longestSliceMs, elapsed);
        job.longestSliceMs = Math.max(job.longestSliceMs, elapsed);
        job.buildMs += elapsed; job.stepsRun++;
      }
    } while (now() - started < Math.max(.1, budgetMs));
    schedule();
  }
  function register({ id, regions = [], steps, onComplete: complete, center, dependencies = [] }) {
    if (typeof id !== 'string' || !id || jobs.has(id) || typeof steps !== 'function' || !regions.length)
      throw new Error('Region jobs need a unique ID, regions, and a generator factory');
    jobs.set(id, { id, regions: [...new Set(regions.map(identity))], steps, onComplete: complete, center,
      dependencies: [...dependencies], order: jobs.size, status: 'pending', iterator: null, error: null,
      longestSliceMs: 0, buildMs: 0, stepsRun: 0 });
    schedule(); return api;
  }
  function ensureRegion(value) {
    const id = identity(value);
    if (isReady(id)) return Promise.resolve(state());
    const relevant = regionJobs(id), failed = relevant.find(job => job.status === 'failed');
    if (failed) return Promise.reject(failed.error);
    if (!relevant.length) return Promise.reject(new Error(`No loading job for region ${id}`));
    requested.add(id);
    const result = new Promise((resolve, reject) => {
      if (!waiters.has(id)) waiters.set(id, []);
      waiters.get(id).push({ resolve, reject });
    });
    api.start(); return result;
  }
  function update(point, direction) {
    if (point && Number.isFinite(point.x) && Number.isFinite(point.z)) { position = { x: point.x, z: point.z }; region = identity(regionAt(point.x, point.z)); }
    else if (point !== undefined && point !== null) region = identity(point);
    if (Number.isFinite(direction)) heading = { x: Math.sin(direction), z: Math.cos(direction) };
    else if (direction && Number.isFinite(direction.x) && Number.isFinite(direction.z)) {
      const length = Math.hypot(direction.x, direction.z); heading = length ? { x: direction.x / length, z: direction.z / length } : null;
    }
    return api;
  }
  function state() {
    return { running, revision, currentRegion: region, active: active?.id ?? null,
      completed: [...jobs.values()].filter(job => job.status === 'ready').length,
      total: jobs.size, pending: [...jobs.values()].filter(job => job.status === 'pending').length,
      ready: [...new Set([...initial, ...[...jobs.values()].flatMap(job => job.regions)])].filter(isReady),
      jobs: [...jobs.values()].map(job => ({ id: job.id, regions: [...job.regions], status: job.status, error: job.error?.message ?? null,
        longestSliceMs: job.longestSliceMs, buildMs: job.buildMs, stepsRun: job.stepsRun })), longestSliceMs };
  }
  const api = { register, isReady, hasRegion: value => initial.has(identity(value)) || regionJobs(identity(value)).length > 0,
    ensureRegion, requireRegion: ensureRegion, update, setPosition: update, state,
    start() { running = true; schedule(); return api; },
    stop() { running = false; if (frame !== null) cancelFrame(frame); frame = null; return api; },
    get revision() { return revision; } };
  return api;
}
