import { TenantColors } from '@/types/tenant';

/**
 * Generate a color palette from a base color
 * Uses HSL manipulation to create consistent shades
 */
export function generateColorPalette(baseColor: string): {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
} {
  // Convert hex to HSL
  const hsl = hexToHsl(baseColor);
  
  return {
    50: hslToHex(hsl.h, Math.max(0, hsl.s - 10), Math.min(100, hsl.l + 45)),
    100: hslToHex(hsl.h, Math.max(0, hsl.s - 5), Math.min(100, hsl.l + 35)),
    200: hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 25)),
    300: hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 15)),
    400: hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 5)),
    500: baseColor, // Base color
    600: hslToHex(hsl.h, Math.min(100, hsl.s + 5), Math.max(0, hsl.l - 10)),
    700: hslToHex(hsl.h, Math.min(100, hsl.s + 10), Math.max(0, hsl.l - 20)),
    800: hslToHex(hsl.h, Math.min(100, hsl.s + 15), Math.max(0, hsl.l - 30)),
    900: hslToHex(hsl.h, Math.min(100, hsl.s + 20), Math.max(0, hsl.l - 40)),
  };
}

/**
 * Generate tenant colors from primary and secondary base colors
 */
export function generateTenantColors(primary: string, secondary: string): TenantColors {
  return {
    primary: generateColorPalette(primary),
    secondary: generateColorPalette(secondary),
  };
}

/**
 * Convert hex color to HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Apply tenant colors to CSS custom properties
 */
export function applyTenantColors(colors: TenantColors): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // Apply primary colors
  Object.entries(colors.primary).forEach(([shade, color]) => {
    root.style.setProperty(`--color-primary-${shade}`, color);
    // Also set Tailwind-compatible variables
    root.style.setProperty(`--tw-color-primary-${shade}`, color.replace('#', ''));
  });

  // Apply secondary colors
  Object.entries(colors.secondary).forEach(([shade, color]) => {
    root.style.setProperty(`--color-secondary-${shade}`, color);
    // Also set Tailwind-compatible variables
    root.style.setProperty(`--tw-color-secondary-${shade}`, color.replace('#', ''));
  });

  // Apply accent colors based on primary
  root.style.setProperty('--color-accent-50', colors.primary[50]);
  root.style.setProperty('--color-accent-100', colors.primary[100]);
  root.style.setProperty('--color-accent-500', colors.primary[500]);
  root.style.setProperty('--color-accent-600', colors.primary[600]);
  root.style.setProperty('--color-accent-700', colors.primary[700]);
  root.style.setProperty('--color-accent-900', colors.primary[900]);

  // Apply success, warning, error colors that adapt to tenant theme
  const successBase = '#10B981'; // green-500
  const warningBase = '#F59E0B'; // amber-500  
  const errorBase = '#EF4444'; // red-500
  
  root.style.setProperty('--color-success-50', '#ECFDF5');
  root.style.setProperty('--color-success-500', successBase);
  root.style.setProperty('--color-success-600', '#059669');
  root.style.setProperty('--color-success-700', '#047857');
  
  root.style.setProperty('--color-warning-50', '#FFFBEB');
  root.style.setProperty('--color-warning-500', warningBase);
  root.style.setProperty('--color-warning-600', '#D97706');
  root.style.setProperty('--color-warning-700', '#B45309');
  
  root.style.setProperty('--color-error-50', '#FEF2F2');
  root.style.setProperty('--color-error-500', errorBase);
  root.style.setProperty('--color-error-600', '#DC2626');
  root.style.setProperty('--color-error-700', '#B91C1C');
}
