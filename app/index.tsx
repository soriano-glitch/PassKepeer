import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        PassKeeper
      </Text>
      <Text style={styles.body}>
        An offline password vault. Your data stays on this device. If you forget your master password and
        have no backup, it cannot be recovered.
      </Text>
      <Link href="/(tabs)" style={styles.button} accessibilityRole="button">
        Continue (prototype)
      </Link>
      <Link href="/poc" style={styles.link}>
        Run crypto proof of concept
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontSize: 36, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24 },
  button: { fontSize: 18, fontWeight: '600', paddingVertical: 14 },
  link: { fontSize: 14, textDecorationLine: 'underline' },
});
