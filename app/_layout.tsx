import { Stack, router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { AutoLocker } from '../src/services/auto-lock';
import { ConfirmProvider } from '../src/components/confirm';
import { getPrototypeSettingsStore } from '../src/features/settings/store';
import { expoClipboard } from '../src/services/expo-clipboard';
import { log } from '../src/services/logger';

/**
 * Prototype lock: on inactivity timeout, clears the clipboard and returns to
 * the vault dashboard. There is no authentication gate yet, so this limits
 * screen exposure only — it is not a cryptographic lock.
 */
function lockVault(): void {
  expoClipboard.clear().catch(() => undefined);
  log.info('Prototype auto-lock fired');
  router.replace('/(tabs)');
}

export default function RootLayout() {
  const pathname = usePathname();
  const locker = useRef<AutoLocker | null>(null);

  useEffect(() => {
    locker.current?.stop();
    locker.current = new AutoLocker(getPrototypeSettingsStore().get().autoLockMs, lockVault);
    locker.current.notifyActivity();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') locker.current?.notifyActivity();
    });
    return () => {
      sub.remove();
      locker.current?.stop();
    };
  }, [pathname]);

  return (
    <ConfirmProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ConfirmProvider>
  );
}
