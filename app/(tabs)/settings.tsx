import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../src/components/theme';
import { PrototypeBanner, SectionLabel } from '../../src/components/ui';
import { serializeTransfer } from '../../src/features/backup/transfer';
import { getPrototypeSettingsStore } from '../../src/features/settings/store';
import { getPrototypeStore } from '../../src/features/vault/memory-store';
import { expoClipboard } from '../../src/services/expo-clipboard';

const CLIPBOARD_OPTIONS = [
  { label: '5s', ms: 5_000 },
  { label: '15s', ms: 15_000 },
  { label: '30s', ms: 30_000 },
  { label: '60s', ms: 60_000 },
];

const AUTOLOCK_OPTIONS = [
  { label: '1m', ms: 60_000 },
  { label: '2m', ms: 120_000 },
  { label: '5m', ms: 300_000 },
  { label: '15m', ms: 900_000 },
];

function SoonRow({ label, onPress }: { label: string; onPress: () => void }) {
  const c = useAppTheme();
  return (
    <Pressable style={[styles.row, { backgroundColor: c.card }]} onPress={onPress} accessibilityRole="button">
      <Text style={[styles.rowLabel, { color: c.text }]}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={[styles.soon, { color: c.muted }]}>Soon</Text>
        <Text style={[styles.chevron, { color: c.muted }]}>›</Text>
      </View>
    </Pressable>
  );
}

export default function SettingsTab() {
  const c = useAppTheme();
  const [clearMs, setClearMs] = useState(() => getPrototypeSettingsStore().get().clipboardClearMs);
  const [lockMs, setLockMs] = useState(() => getPrototypeSettingsStore().get().autoLockMs);
  const [notice, setNotice] = useState<string | null>(null);
  const [, setVersion] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const s = getPrototypeSettingsStore().get();
      setClearMs(s.clipboardClearMs);
      setLockMs(s.autoLockMs);
    }, []),
  );

  function explainMasterPassword() {
    Alert.alert(
      'Master password — not yet',
      'Real master-password setup needs Argon2id key derivation running on a device (Phase 2 proof of concept). Anything built before that would be fake security, so this row stays honest until the crypto lands.',
    );
  }

  function handleCopyTransfer() {
    const count = getPrototypeStore().list().length;
    Alert.alert(
      'Copy unencrypted transfer?',
      `This copies ${count} entr${count === 1 ? 'y' : 'ies'} as plaintext JSON to the clipboard. Demo data only — never real passwords.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy',
          onPress: () => {
            expoClipboard
              .copyAndScheduleClear(serializeTransfer(getPrototypeStore().list()), clearMs)
              .then(() => setNotice('Transfer JSON copied — paste it into Import.'))
              .catch(() => setNotice('Copy failed.'));
          },
        },
      ],
    );
  }

  function confirmClearAll() {
    Alert.alert(
      'Delete all entries?',
      'This wipes every entry in the prototype memory store. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete all',
          style: 'destructive',
          onPress: () => {
            getPrototypeStore().clear();
            setVersion((v) => v + 1);
          },
        },
      ],
    );
  }

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        Settings
      </Text>
      <PrototypeBanner />
      <SectionLabel text="Security" />
      <SoonRow label="Master password" onPress={explainMasterPassword} />
      <View style={[styles.row, { backgroundColor: c.card }]}>
        <Text style={[styles.rowLabel, { color: c.text }]}>Auto-lock after</Text>
      </View>
      <View style={styles.options}>
        {AUTOLOCK_OPTIONS.map((o) => (
          <Pressable
            key={o.ms}
            onPress={() => setLockMs(getPrototypeSettingsStore().setAutoLockMs(o.ms).autoLockMs)}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.chip,
                { backgroundColor: c.card, color: c.muted },
                lockMs === o.ms && { backgroundColor: c.accent, color: c.accentText },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.hint, { color: c.muted }]}>
        Prototype lock returns to the Vault and clears the clipboard. No authentication gate yet.
      </Text>
      <View style={[styles.row, { backgroundColor: c.card }]}>
        <Text style={[styles.rowLabel, { color: c.text }]}>Clear clipboard after</Text>
      </View>
      <View style={styles.options}>
        {CLIPBOARD_OPTIONS.map((o) => (
          <Pressable
            key={o.ms}
            onPress={() => setClearMs(getPrototypeSettingsStore().setClipboardClearMs(o.ms).clipboardClearMs)}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.chip,
                { backgroundColor: c.card, color: c.muted },
                clearMs === o.ms && { backgroundColor: c.accent, color: c.accentText },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <SectionLabel text="Data" />
      <Pressable
        style={[styles.row, { backgroundColor: c.card }]}
        onPress={handleCopyTransfer}
        accessibilityRole="button"
      >
        <Text style={[styles.rowLabel, { color: c.text }]}>Copy transfer JSON</Text>
        <Text style={[styles.chevron, { color: c.muted }]}>›</Text>
      </Pressable>
      <Pressable
        style={[styles.row, { backgroundColor: c.card }]}
        onPress={() => router.push('/settings/import')}
        accessibilityRole="button"
      >
        <Text style={[styles.rowLabel, { color: c.text }]}>Import pasted JSON</Text>
        <Text style={[styles.chevron, { color: c.muted }]}>›</Text>
      </Pressable>
      <Pressable
        style={[styles.row, { backgroundColor: c.card }]}
        onPress={confirmClearAll}
        accessibilityRole="button"
      >
        <Text style={[styles.rowLabel, { color: c.danger }]}>Delete all entries</Text>
      </Pressable>
      {notice ? <Text style={[styles.notice, { color: c.muted }]}>{notice}</Text> : null}
      <SectionLabel text="About" />
      <View style={[styles.row, { backgroundColor: c.card }]}>
        <Text style={[styles.rowLabel, { color: c.text }]}>Version</Text>
        <Text style={[styles.version, { color: c.muted }]}>Prototype · Phase 1</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  title: { fontSize: 28, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  soon: { fontSize: 12 },
  chevron: { fontSize: 18 },
  version: { fontSize: 13 },
  options: { flexDirection: 'row', gap: 8 },
  chip: { fontSize: 13, fontWeight: '600', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 14 },
  hint: { fontSize: 12, lineHeight: 17 },
  notice: { fontSize: 13 },
});
