import { useMemo, useState } from 'react';
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { expoClipboard, DEFAULT_CLIPBOARD_CLEAR_MS } from '../../src/services/expo-clipboard';
import { expoSecureRandom } from '../../src/security/expo-random';
import { generatePassword } from '../../src/features/generator/generate';
import { estimateStrength } from '../../src/features/generator/strength';
import type { PasswordGeneratorOptions } from '../../src/types/vault';

const ROWS: { key: 'useUpper' | 'useLower' | 'useDigits' | 'useSymbols' | 'excludeAmbiguous'; label: string }[] = [
  { key: 'useUpper', label: 'Uppercase (A–Z)' },
  { key: 'useLower', label: 'Lowercase (a–z)' },
  { key: 'useDigits', label: 'Numbers (0–9)' },
  { key: 'useSymbols', label: 'Symbols (!@#…)' },
  { key: 'excludeAmbiguous', label: 'Exclude ambiguous (Il1|O0)' },
];

export default function GeneratorTab() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const [opts, setOpts] = useState<PasswordGeneratorOptions>({
    length: 16,
    useUpper: true,
    useLower: true,
    useDigits: true,
    useSymbols: true,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(true);
  const [copied, setCopied] = useState(false);

  const strength = useMemo(() => estimateStrength(password), [password]);

  function set<K extends keyof PasswordGeneratorOptions>(key: K, value: PasswordGeneratorOptions[K]) {
    setOpts((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }

  async function handleGenerate() {
    setError(null);
    setCopied(false);
    try {
      setPassword(await generatePassword(opts, expoSecureRandom));
    } catch (err) {
      setPassword('');
      setError(err instanceof Error ? err.message : 'Generation failed.');
    }
  }

  async function handleCopy() {
    if (password.length === 0) return;
    try {
      await expoClipboard.copyAndScheduleClear(password, DEFAULT_CLIPBOARD_CLEAR_MS);
      setCopied(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Copy failed.');
    }
  }

  const text = dark ? '#e8eaed' : '#1a1b1e';
  const muted = dark ? '#9aa0aa' : '#5f6368';
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: text }]} accessibilityRole="header">
        Generator
      </Text>

      <View style={styles.lengthRow}>
        <Text style={[styles.label, { color: text }]}>Length: {opts.length}</Text>
        <View style={styles.stepper}>
          <Button title="−" onPress={() => set('length', Math.max(8, opts.length - 1))} />
          <Button title="+" onPress={() => set('length', Math.min(128, opts.length + 1))} />
        </View>
      </View>

      {ROWS.map((row) => (
        <View key={row.key} style={styles.row}>
          <Text style={[styles.label, { color: text }]}>{row.label}</Text>
          <Switch value={opts[row.key]} onValueChange={(v) => set(row.key, v)} />
        </View>
      ))}

      <Button title="Generate" onPress={handleGenerate} />

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      {password.length > 0 ? (
        <View style={styles.output}>
          <Text style={[styles.password, { color: text }]} selectable>
            {revealed ? password : '•'.repeat(Math.min(password.length, 32))}
          </Text>
          <Text style={[styles.strength, { color: muted }]}>
            {strength.label} · ~{strength.entropyBits} bits entropy (heuristic, not a breach check)
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={() => setRevealed((v) => !v)} accessibilityRole="button">
              <Text style={styles.link}>{revealed ? 'Hide' : 'Reveal'}</Text>
            </Pressable>
            <Pressable onPress={handleCopy} accessibilityRole="button">
              <Text style={styles.link}>Copy</Text>
            </Pressable>
          </View>
          {copied ? <Text style={[styles.hint, { color: muted }]}>Copied — clears in 30s.</Text> : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  title: { fontSize: 26, fontWeight: '700' },
  lengthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepper: { flexDirection: 'row', gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  label: { fontSize: 16 },
  error: { color: '#b00020', fontSize: 14 },
  output: { gap: 8, paddingTop: 8 },
  password: { fontSize: 18, fontFamily: 'monospace' },
  strength: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: 20 },
  link: { fontSize: 16, color: '#1a73e8' },
  hint: { fontSize: 13 },
});
