import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../src/components/theme';

const FEATURES: { icon: 'flash-off' | 'lock-closed' | 'alert-circle'; text: string }[] = [
  { icon: 'flash-off', text: 'Works fully offline' },
  { icon: 'lock-closed', text: 'Locked by one master password' },
  { icon: 'alert-circle', text: 'No recovery if you forget it' },
];

export default function Welcome() {
  const c = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={styles.logoWrap}>
        <View style={[styles.ring, styles.ringOuter, { borderColor: c.border }]} />
        <View style={[styles.ring, styles.ringInner, { borderColor: c.border }]} />
        <View style={[styles.logo, { backgroundColor: c.accent }]}>
          <Ionicons name="shield-checkmark" size={40} color={c.accentText} />
        </View>
      </View>

      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        Welcome to PassKeeper
      </Text>
      <Text style={[styles.subtitle, { color: c.muted }]}>
        An offline password vault. Your data stays on this device.
      </Text>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.text} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: c.card }]}>
              <Ionicons name={f.icon} size={16} color={c.accent} />
            </View>
            <Text style={[styles.featureText, { color: c.text }]}>{f.text}</Text>
          </View>
        ))}
      </View>

      <Link
        href="/(tabs)"
        style={[styles.cta, { backgroundColor: c.accent, color: c.accentText }]}
        accessibilityRole="button"
      >
        Get started
      </Link>
      <Link href="/poc" style={[styles.poc, { color: c.muted }]}>
        Run crypto proof of concept
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  logoWrap: { width: 168, height: 168, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  ring: { position: 'absolute', borderWidth: 1, borderRadius: 999 },
  ringOuter: { width: 168, height: 168, opacity: 0.5 },
  ringInner: { width: 124, height: 124, opacity: 0.7 },
  logo: { width: 84, height: 84, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  features: { alignSelf: 'stretch', gap: 10, marginVertical: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 14, fontWeight: '500' },
  cta: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    paddingVertical: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  poc: { fontSize: 13, textDecorationLine: 'underline', marginTop: 4 },
});
