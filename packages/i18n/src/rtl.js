import { I18nManager, DevSettings } from 'react-native';

let updatesModule = null;
try {
  // expo-updates is only available inside an Expo runtime; fall back gracefully
  // in tests / scripts.
  updatesModule = require('expo-updates');
} catch {
  updatesModule = null;
}

let mmkvStore = null;
try {
  const { MMKV } = require('react-native-mmkv');
  mmkvStore = new MMKV({ id: 'nms.rtl' });
} catch {
  mmkvStore = null;
}

const RELOAD_GUARD_KEY = 'rtl.reloadGuard';
const TARGET_DIR_KEY = 'rtl.targetDirection'; // 'ltr' | 'rtl'

function readGuard() {
  return mmkvStore?.getString(RELOAD_GUARD_KEY) ?? null;
}
function setGuard(target) {
  mmkvStore?.set(RELOAD_GUARD_KEY, target);
}
function clearGuard() {
  mmkvStore?.delete(RELOAD_GUARD_KEY);
}
export function readPendingDirection() {
  return mmkvStore?.getString(TARGET_DIR_KEY) ?? null;
}
function setPendingDirection(dir) {
  mmkvStore?.set(TARGET_DIR_KEY, dir);
}
export function clearPendingDirection() {
  mmkvStore?.delete(TARGET_DIR_KEY);
}

/**
 * Aligns native layout direction with the requested locale. If a flip is
 * required, calls forceRTL and reloads the JS bundle. Guarded by an MMKV flag
 * so we never enter a reload loop if forceRTL silently fails.
 *
 * @param {{ targetIsRTL: boolean }} args
 * @returns {Promise<{ reloaded: boolean }>}
 */
export async function ensureLayoutDirection({ targetIsRTL }) {
  const target = targetIsRTL ? 'rtl' : 'ltr';
  const current = I18nManager.isRTL ? 'rtl' : 'ltr';

  if (current === target) {
    clearGuard();
    return { reloaded: false };
  }

  // Already attempted this target — bail out instead of looping.
  if (readGuard() === target) {
    clearGuard();
    return { reloaded: false };
  }

  setGuard(target);
  setPendingDirection(target);

  I18nManager.allowRTL(targetIsRTL);
  I18nManager.forceRTL(targetIsRTL);

  if (updatesModule && typeof updatesModule.reloadAsync === 'function') {
    try {
      await updatesModule.reloadAsync();
    } catch {
      if (typeof DevSettings.reload === 'function') {
        DevSettings.reload();
      }
    }
  } else if (typeof DevSettings.reload === 'function') {
    DevSettings.reload();
  }

  return { reloaded: true };
}
