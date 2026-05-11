import { Colors } from '../../constants/theme';

export function withAlpha(color: string | undefined, alpha: string, fallback = Colors.blueBg) {
  if (color?.startsWith('#') && color.length === 7) {
    return `${color}${alpha}`;
  }

  return fallback;
}
