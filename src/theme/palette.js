// Monochrome palette for the app UI/UX
export const palette = {
  // Base
  black: '#000000',
  white: '#FFFFFF',
  // Grays
  gray900: '#111111',
  gray800: '#1F1F1F',
  gray700: '#2A2A2A',
  gray600: '#3A3A3A',
  gray500: '#555555',
  gray400: '#767676',
  gray300: '#9E9E9E',
  gray200: '#C7C7C7',
  gray100: '#E6E6E6',

  // Brand & Semantic
  brandPrimary: '#2563EB', // can be adjusted to match your brand
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#0284C7',
};

// Spacing scale (8pt base with 4pt sub-steps)
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

// Corner radii
export const radii = {
  sm: 8, // cards/buttons
  md: 12,
  lg: 16, // sheets/top corners
  pill: 999,
};

// Elevation levels (dp)
export const elevation = {
  none: 0,
  card: 2,
  sheet: 8,
  modal: 16,
};

// State overlays (opacity hints)
export const states = {
  pressedLight: 'rgba(0,0,0,0.08)',
  focusedLight: 'rgba(0,0,0,0.12)',
  pressedDark: 'rgba(255,255,255,0.12)',
  focusedDark: 'rgba(255,255,255,0.16)',
};

// Light theme tokens aligned with guidelines
export const themeLight = {
  bg: '#F7F8FA', // Background/Base
  surface: palette.white, // Surface/Card
  card: palette.white,
  border: '#E5E7EB', // Divider/Border
  text: '#111827', // On-Surface Text Primary
  textMuted: '#6B7280', // Secondary
  icon: '#111827',
  iconMuted: '#9CA3AF',
  primary: palette.brandPrimary,
  success: palette.success,
  warning: palette.warning,
  error: palette.danger,
  info: palette.info,
  buttonBg: '#111827',
  buttonText: palette.white,
  buttonBgMuted: '#E5E7EB',
  buttonTextMuted: '#6B7280',
};

// Dark theme tokens aligned with guidelines
export const themeDark = {
  bg: '#0B0F14', // Background/Base
  surface: '#121826', // Surface/Card
  card: '#121826',
  border: '#1F2937', // Divider/Border
  text: '#F3F4F6', // On-Surface Text Primary
  textMuted: '#9CA3AF', // Secondary
  icon: '#F3F4F6',
  iconMuted: '#9CA3AF',
  primary: palette.brandPrimary, // slightly brighter primary recommended for dark
  success: palette.success,
  warning: palette.warning,
  error: palette.danger,
  info: palette.info,
  buttonBg: '#F3F4F6',
  buttonText: '#0B0F14',
  buttonBgMuted: '#1F2937',
  buttonTextMuted: '#9CA3AF',
};

// Backward-compatible default theme (light)
export const theme = themeLight;
