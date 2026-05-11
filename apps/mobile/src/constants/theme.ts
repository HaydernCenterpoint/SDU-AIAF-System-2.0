// Design tokens - SAODO UNIVERSITY
export const Colors = {
  primary: '#E31D1C',
  primaryLight: '#F45B58',
  primaryDark: '#B71918',
  primaryBg: '#FFF1F1',
  primaryBorder: '#FFD1D1',

  blue: '#1784DA',
  blueLight: '#4FB3EC',
  blueDark: '#005B96',
  blueBg: '#EEF7FF',
  blueBorder: '#C7E8FA',

  brandRed: '#E31D1C',
  brandGold: '#F7D428',
  goldBg: '#FFFBE5',

  bg: '#F8FCFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F8FC',
  navy: '#112641',

  text: '#112641',
  textSub: '#475569',
  textMuted: '#6B7280',

  red: '#E31D1C',
  green: '#10B981',
  orange: '#F59E0B',
  yellow: '#F7D428',

  border: '#D8EAF5',
  borderSoft: '#E8F2F8',
  shadow: 'rgba(17, 38, 65, 0.10)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 16,
  lg: 18,
  xl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
};

export const Shadow = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 6,
  },
};

export const LightColors = Colors;

export const DarkColors = {
  ...Colors,
  bg: '#0B1728',
  surface: '#102033',
  surfaceAlt: '#162B43',
  text: '#F8FAFC',
  textSub: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#24415F',
  borderSoft: '#1B344F',
  shadow: 'rgba(0, 0, 0, 0.32)',
};

export const AppThemes = {
  light: { colors: LightColors, spacing: Spacing, radius: Radius, fontSize: FontSize, shadow: Shadow },
  dark: { colors: DarkColors, spacing: Spacing, radius: Radius, fontSize: FontSize, shadow: Shadow },
};

export type AppThemeName = keyof typeof AppThemes;
export type AppTheme = typeof AppThemes.light;
