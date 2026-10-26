import { formatQty } from './quantity';
import type { SeasUnit } from './types';

const SEAS_PLURAL: Record<SeasUnit, [string, string]> = {
  tsp: ['tsp', 'tsp'], tbsp: ['tbsp', 'tbsp'], clove: ['clove', 'cloves'],
  slice: ['slice', 'slices'], pinch: ['pinch', 'pinches'], pc: ['', ''],
};

export function formatSeasoningAmount(amount: number | undefined, unit: SeasUnit | undefined, servings: number): string {
  if (amount == null || !unit) return '';
  const q = amount * servings;
  // 3 tsp reads better as 1 tbsp
  if (unit === 'tsp' && q >= 3 && Math.abs((q / 3) * 2 - Math.round((q / 3) * 2)) < 1e-6) {
    return `${formatQty(q / 3)} tbsp`;
  }
  const [one, many] = SEAS_PLURAL[unit];
  const label = q > 1 ? many : one;
  return label ? `${formatQty(q)} ${label}` : formatQty(q);
}

/**
 * Replaces scalable amounts like {{120 ml}} or {{2 tbsp}} in step text.
 * Millilitres also show a rounded cup equivalent.
 */
export function scaleText(text: string, servings: number): string {
  return text.replace(/\{\{\s*([\d.]+)\s*([a-z]+)\s*\}\}/gi, (_, n: string, unit: string) => {
    const q = parseFloat(n) * servings;
    if (unit === 'ml') {
      const cups = Math.round((q / 240) * 4) / 4;
      return cups >= 0.25 ? `${Math.round(q)} ml (about ${formatQty(cups)} cup)` : `${Math.round(q)} ml`;
    }
    if (unit === 'tbsp' && q >= 4 && q % 4 === 0) return `${formatQty(q / 16)} cup`;
    return `${formatQty(q)} ${unit}`;
  });
}
