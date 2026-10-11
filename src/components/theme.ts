import { useColorScheme, type ColorSchemeName } from 'react-native';

export interface AppPalette {
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  border: string;
  inputBg: string;
  star: string;
  danger: string;
}

const DARK: AppPalette = {
  bg: '#0c1122',
  card: '#171d33',
  cardAlt: '#1f2742',
  text: '#f2f4f8',
  muted: '#8b93a7',
  accent: '#f0ad3c',
  accentText: '#1a1405',
  border: '#2a3350',
  inputBg: '#171d33',
  star: '#f0ad3c',
  danger: '#ff7a7a',
};

const LIGHT: AppPalette = {
  bg: '#f4f5f7',
  card: '#ffffff',
  cardAlt: '#eef0f4',
  text: '#14161c',
  muted: '#5f6368',
  accent: '#c07f14',
  accentText: '#ffffff',
  border: '#dfe2e8',
  inputBg: '#ffffff',
  star: '#c07f14',
  danger: '#b00020',
};

export function paletteFor(scheme: ColorSchemeName): AppPalette {
  return scheme === 'dark' ? DARK : LIGHT;
}

export function useAppTheme(): AppPalette {
  return paletteFor(useColorScheme());
}
