import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../src/components/theme';
import { PrototypeBanner, SectionLabel } from '../../src/components/ui';

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
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        Settings
      </Text>
      <PrototypeBanner />
      <SectionLabel text="Security" />
      <SoonRow label="Master password" />
      <SoonRow label="Auto-lock" />
      <SoonRow label="Clear clipboard" />
      <SectionLabel text="Data" />
      <SoonRow label="Export vault" />
      <SoonRow label="Import entries" />
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
});
