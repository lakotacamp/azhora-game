import { chooseLoadingMode } from './loading-choice.js';

// Keep world modules out of the ten-second decision screen. Automated checks
// keep their established full-world path unless they explicitly request Fast.
const query = new URLSearchParams(location.search);
if (query.has('test') && !query.has('load')) query.set('load', 'full');
try {
  globalThis.__AZHORA_LOADING_MODE__ = await chooseLoadingMode({ search: query.toString() });
  await import('./main.js');
} catch (error) {
  console.error(error);
  document.getElementById('loading')?.classList.add('hidden');
  const fatal = document.getElementById('fatal');
  if (fatal) { fatal.classList.remove('hidden'); fatal.dataset.stack = String(error?.stack ?? error); }
  const message = document.getElementById('fatal-message');
  if (message) message.textContent = 'Please close and reopen the game. ' + (error?.message ?? error);
}
