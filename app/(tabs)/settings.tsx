import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../src/components/theme';
import { PrototypeBanner, SectionLabel } from '../../src/components/ui';
import { getPrototypeSettingsStore } from '../../src/features/settings/store';
import { getPrototypeStore } from '../../src/features/vault/memory-store';

const CLIPBOARD_OPTIONS = [
  { label: '5s', ms: 5_000 },
  { label: '15s', ms: 15_000 },
  { label: '30s', ms: 30_000 },
  { label: '60s', ms: 60_000 },
];

function SoonRow({ label }: { label: string }) {
  const c = useAppTheme();
  return (
    <View style={[styles.row, { backgroundColor: c.card }]}>
      <Text style={[styles.rowLabel, { color: c.text }]}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={[styles.soon, { color: c.muted }]}>Soon</Text>
        <Text style={[styles.chevron, { color: c.muted }]}>›</Text>
      </View>
    </View>
  );
}

export default function SettingsTab() {
  const c = useAppTheme();
  const [clearMs, setClearMs] = useState(() => getPrototypeSettingsStore().get().clipboardClearMs);
  const [, setVersion] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setClearMs(getPrototypeSettingsStore().get().clipboardClearMs);
    }, []),
  );

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
      <SoonRow label="Master password" />
      <SoonRow label="Auto-lock" />
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
      <SoonRow label="Export vault" />
      <SoonRow label="Import entries" />
      <Pressable
        style={[styles.row, { backgroundColor: c.card }]}
        onPress={confirmClearAll}
        accessibilityRole="button"
      >
        <Text style={[styles.rowLabel, { color: c.danger }]}>Delete all entries</Text>
      </Pressable>
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
});
