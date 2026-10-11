# PassKeeper — Phase 1 foundation

Offline-only personal password manager. Phase 1 builds the project foundation and validates
security-critical native dependencies. It stores no real credentials.

## Status

No code here has been compiled or run on a device yet. Library choices are candidates. The PoC decides.
Do not entrust real credentials to this build.

## Quick start

```bash
npx create-expo-app@latest PassKeeper --template blank-typescript
cd PassKeeper
npx expo install expo-dev-client expo-secure-store expo-local-authentication \
  expo-sqlite expo-crypto expo-clipboard expo-screen-capture
npm install react-native-libsodium
npm install -D jest jest-expo @types/jest @testing-library/react-native eslint prettier eslint-config-prettier
npx expo prebuild
npx expo run:android
npx expo run:ios
```

Expo Go does not work: native security modules require a development build.

## Scripts

- `npm run typecheck` — strict TypeScript check
- `npm test` — Jest unit + security contract tests
- `npm run lint` — ESLint

## Structure

See `docs/adr-001.md`, `docs/dependency-assessment.md`, `docs/threat-model.md`,
`docs/key-management.md`, `docs/backup-recovery.md`, `docs/poc-test-plan.md`.
