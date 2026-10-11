import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { useAppTheme } from '../../src/components/theme';
import { PrototypeBanner } from '../../src/components/ui';
import { parseTransfer, restoreTransfer } from '../../src/features/backup/transfer';
import { getPrototypeStore } from '../../src/features/vault/memory-store';

export default function ImportEntries() {
  const c = useAppTheme();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleValidate() {
    setError(null);
    setPreview(null);
    try {
      const file = parseTransfer(text);
      setPreview(
        `${file.entries.length} entr${file.entries.length === 1 ? 'y' : 'ies'} ready — ${file.entries.filter((e) => e.isFavorite).length} favorites.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed.');
    }
  }

  function handleImport() {
    setError(null);
    let count = 0;
    try {
      count = parseTransfer(text).entries.length;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed.');
      return;
    }
    const current = getPrototypeStore().list().length;
    Alert.alert(
      'Replace vault?',
      `This deletes the current ${current} entr${current === 1 ? 'y' : 'ies'} and imports ${count}. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: () => {
            try {
              restoreTransfer(getPrototypeStore(), text);
              router.back();
            } catch (err) {
              setPreview(null);
              setError(err instanceof Error ? err.message : 'Import failed.');
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        Import entries
      </Text>
      <PrototypeBanner />
      <Text style={[styles.body, { color: c.muted }]}>
        Paste a transfer JSON copied from Settings. The whole file is validated before anything is
        replaced — a corrupt file leaves your vault untouched. Prototype transfers are unencrypted:
        demo data only.
      </Text>
      <TextInput
        style={[styles.box, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
        value={text}
        onChangeText={(v) => {
          setText(v);
          setPreview(null);
          setError(null);
        }}
        placeholder='{"formatVersion": 1, …}'
        placeholderTextColor={c.muted}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
      />
      {preview ? <Text style={[styles.preview, { color: c.accent }]}>{preview}</Text> : null}
      {error ? (
        <Text style={[styles.error, { color: c.danger }]} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Button title="Validate" onPress={handleValidate} color={c.accent} />
      <Button title="Import (replaces vault)" onPress={handleImport} color={c.accent} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 10 },
  title: { fontSize: 24, fontWeight: '800' },
  body: { fontSize: 13, lineHeight: 19 },
  box: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 13, minHeight: 160, textAlignVertical: 'top', fontFamily: 'monospace' },
  preview: { fontSize: 14, fontWeight: '600' },
  error: { fontSize: 14 },
});
