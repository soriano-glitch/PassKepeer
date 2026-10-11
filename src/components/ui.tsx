import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from './theme';

export function PrototypeBanner() {
  const c = useAppTheme();
  return (
    <View style={[styles.banner, { backgroundColor: c.card, borderColor: c.accent }]}>
      <Text style={[styles.bannerText, { color: c.accent }]}>
        {'\u25CB'} Prototype: entries are plaintext in memory and vanish on restart. Never enter real
        passwords.
      </Text>
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  const c = useAppTheme();
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { color: c.muted }]}>{message}</Text>
    </View>
  );
}

export function SectionLabel({ text }: { text: string }) {
  const c = useAppTheme();
  return <Text style={[styles.section, { color: c.muted }]}>{text}</Text>;
}

export function Avatar({ letter }: { letter: string }) {
  const c = useAppTheme();
  return (
    <View style={[styles.avatar, { backgroundColor: c.cardAlt }]}>
      <Text style={[styles.avatarText, { color: c.accent }]}>{letter.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 4 },
  bannerText: { fontSize: 12, lineHeight: 17 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  section: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 17, fontWeight: '700' },
});
