import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from './theme';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface DialogState extends Required<Pick<ConfirmOptions, 'title' | 'message'>> {
  confirmLabel: string;
  cancelLabel: string | null;
  destructive: boolean;
}

interface ConfirmContextValue {
  /** Resolves true when the user confirms, false on cancel/dismiss. */
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  /** Single-button info dialog. */
  notify: (opts: { title: string; message: string; buttonLabel?: string }) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider.');
  return ctx;
}

/**
 * Cross-platform confirm/notify dialogs. React Native's Alert is a no-op on
 * web, so every destructive or explanatory prompt in the app goes through
 * here and behaves identically on all targets.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const c = useAppTheme();
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setDialog(null);
  }, []);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current?.(false);
        resolver.current = resolve;
        setDialog({
          title: opts.title,
          message: opts.message,
          confirmLabel: opts.confirmLabel ?? 'Confirm',
          cancelLabel: opts.cancelLabel ?? 'Cancel',
          destructive: opts.destructive ?? false,
        });
      }),
    [],
  );

  const notify = useCallback(
    (opts: { title: string; message: string; buttonLabel?: string }) =>
      confirm({ title: opts.title, message: opts.message, confirmLabel: opts.buttonLabel ?? 'Got it' }).then(
        () => undefined,
      ),
    [confirm],
  );

  return (
    <ConfirmContext.Provider value={{ confirm, notify }}>
      {children}
      <Modal visible={dialog !== null} transparent animationType="fade" onRequestClose={() => close(false)}>
        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.title, { color: c.text }]}>{dialog?.title}</Text>
            <Text style={[styles.message, { color: c.muted }]}>{dialog?.message}</Text>
            <View style={styles.buttons}>
              {dialog?.cancelLabel ? (
                <Pressable
                  style={[styles.button, { backgroundColor: c.cardAlt }]}
                  onPress={() => close(false)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.buttonText, { color: c.text }]}>{dialog.cancelLabel}</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[
                  styles.button,
                  { backgroundColor: dialog?.destructive ? c.danger : c.accent },
                ]}
                onPress={() => close(true)}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: dialog?.destructive ? '#fff' : c.accentText },
                  ]}
                >
                  {dialog?.confirmLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  card: { borderWidth: 1, borderRadius: 16, padding: 20, gap: 12, width: '100%', maxWidth: 400 },
  title: { fontSize: 18, fontWeight: '800' },
  message: { fontSize: 14, lineHeight: 20 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  button: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  buttonText: { fontSize: 15, fontWeight: '700' },
});
