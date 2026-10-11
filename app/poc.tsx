import { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { runCryptoPoc } from '../poc/crypto-poc';
import type { PocResult } from '../poc/crypto-poc';

export default function PocScreen() {
  const [results, setResults] = useState<PocResult[] | null>(null);
  const [running, setRunning] = useState(false);

  async function handleRun(): Promise<void> {
    setRunning(true);
    try {
      const output = await runCryptoPoc();
      setResults(output);
    } finally {
      setRunning(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Crypto proof of concept
      </Text>
      <Text style={styles.body}>
        Throwaway screen. Uses fake data only. Do not store real passwords here. See docs/poc-test-plan.md
        for PoC-1 to PoC-15.
      </Text>
      <Button title={running ? 'Running…' : 'Run PoC checks'} onPress={handleRun} disabled={running} />
      {results?.map((r: PocResult) => (
        <View key={r.id} style={styles.row}>
          <Text style={r.pass ? styles.pass : styles.fail}>
            {r.pass ? 'PASS' : 'FAIL'} {r.id}
          </Text>
          <Text>{r.detail}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20 },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  pass: { fontWeight: '700', color: '#0a7d2c' },
  fail: { fontWeight: '700', color: '#b00020' },
});
