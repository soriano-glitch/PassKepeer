import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useAppTheme } from '../../src/components/theme';
import { expoClipboard, DEFAULT_CLIPBOARD_CLEAR_MS } from '../../src/services/expo-clipboard';
import { expoSecureRandom } from '../../src/security/expo-random';
import { generatePassword } from '../../src/features/generator/generate';
import { estimateStrength } from '../../src/features/generator/strength';
import type { PasswordGeneratorOptions } from '../../src/types/vault';

const ROWS: { key: 'useUpper' | 'useLower' | 'useDigits' | 'useSymbols' | 'excludeAmbiguous'; label: string }[] = [
  { key: 'useUpper', label: 'Uppercase A–Z' },
  { key: 'useLower', label: 'Lowercase a–z' },
  { key: 'useDigits', label: 'Numbers 0–9' },
  { key: 'useSymbols', label: 'Symbols !@#' },
  { key: 'excludeAmbiguous', label: 'Exclude look-alikes (Il1O0)' },
];

const SEGMENTS = 5;

export default function GeneratorTab() {
  const c = useAppTheme();
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
  const filledSegments = password.length === 0 ? 0 : strength.score + 1;

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

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        Generator
      </Text>

      <View style={[styles.outputCard, { backgroundColor: c.card }]}>
        <Text style={[styles.password, { color: c.text }]} selectable>
          {password.length === 0 ? 'Tap GENERATE' : revealed ? password : '•'.repeat(Math.min(password.length, 32))}
        </Text>
        <View style={styles.segments}>
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                { backgroundColor: i < filledSegments ? c.accent : c.border },
              ]}
            />
          ))}
          <Text style={[styles.strengthLabel, { color: c.accent }]}>
            {password.length === 0 ? '' : strength.label}
          </Text>
        </View>
        <View style={styles.outputActions}>
          <Pressable
            style={[styles.halfButton, { backgroundColor: c.cardAlt }]}
            onPress={handleCopy}
            accessibilityRole="button"
          >
            <Text style={[styles.halfButtonText, { color: c.text }]}>Copy</Text>
          </Pressable>
          <Pressable
            style={[styles.halfButton, { backgroundColor: c.cardAlt }]}
            onPress={handleGenerate}
            accessibilityRole="button"
          >
            <Text style={[styles.halfButtonText, { color: c.text }]}>Regenerate</Text>
          </Pressable>
        </View>
        {copied ? <Text style={[styles.hint, { color: c.muted }]}>Copied — clears in 30s.</Text> : null}
      </View>

      <View style={styles.lengthRow}>
        <Text style={[styles.label, { color: c.text }]}>Length</Text>
        <View style={styles.stepper}>
          <Pressable
            style={[styles.step, { backgroundColor: c.card }]}
            onPress={() => set('length', Math.max(8, opts.length - 1))}
            accessibilityRole="button"
            accessibilityLabel="Decrease length"
          >
            <Text style={[styles.stepText, { color: c.text }]}>−</Text>
          </Pressable>
          <Text style={[styles.lengthValue, { color: c.accent }]}>{opts.length}</Text>
          <Pressable
            style={[styles.step, { backgroundColor: c.card }]}
            onPress={() => set('length', Math.min(128, opts.length + 1))}
            accessibilityRole="button"
            accessibilityLabel="Increase length"
          >
            <Text style={[styles.stepText, { color: c.text }]}>+</Text>
          </Pressable>
        </View>
      </View>

      {ROWS.map((row) => (
        <View key={row.key} style={styles.row}>
          <Text style={[styles.label, { color: c.text }]}>{row.label}</Text>
          <Switch
            value={opts[row.key]}
            onValueChange={(v) => set(row.key, v)}
            trackColor={{ true: c.accent, false: c.border }}
          />
        </View>
      ))}

      {error ? (
        <Text style={[styles.error, { color: c.danger }]} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <Pressable
        style={[styles.generate, { backgroundColor: c.accent }]}
        onPress={handleGenerate}
        accessibilityRole="button"
      >
        <Text style={[styles.generateText, { color: c.accentText }]}>GENERATE</Text>
      </Pressable>
      <Text style={[styles.footnote, { color: c.muted }]}>
        Strength is a local entropy heuristic, not a breach check.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  title: { fontSize: 28, fontWeight: '800' },
  outputCard: { borderRadius: 14, padding: 16, gap: 12 },
  password: { fontSize: 19, fontFamily: 'monospace', fontWeight: '700' },
  segments: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '700', marginLeft: 6 },
  outputActions: { flexDirection: 'row', gap: 10 },
  halfButton: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  halfButtonText: { fontSize: 14, fontWeight: '600' },
  hint: { fontSize: 12 },
  lengthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  step: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 20, fontWeight: '700' },
  lengthValue: { fontSize: 16, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  label: { fontSize: 15 },
  error: { fontSize: 14 },
  generate: { borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  generateText: { fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  footnote: { fontSize: 12, textAlign: 'center' },
});
