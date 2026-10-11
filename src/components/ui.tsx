import { StyleSheet, Text, useColorScheme, View, type ColorSchemeName } from 'react-native';

function palette(scheme: ColorSchemeName) {
  const dark = scheme === 'dark';
  return {
    bannerBg: dark ? '#3a2300' : '#fff4e0',
    bannerBorder: dark ? '#8a5a00' : '#d9a441',
    bannerText: dark ? '#ffd98a' : '#7a5200',
    muted: dark ? '#9aa0aa' : '#5f6368',
  };
}

export function PrototypeBanner() {
  const scheme = useColorScheme();
  const c = palette(scheme);
  return (
    <View style={[styles.banner, { backgroundColor: c.bannerBg, borderColor: c.bannerBorder }]}>
      <Text style={[styles.bannerText, { color: c.bannerText }]}>
        Prototype store: entries sit in memory as plaintext and vanish on restart. Never enter real
        passwords.
      </Text>
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  const scheme = useColorScheme();
  const c = palette(scheme);
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { color: c.muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  bannerText: { fontSize: 13, lineHeight: 18 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 15 },
});
