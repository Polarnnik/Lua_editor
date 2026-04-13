export type PinType = 'exec' | 'string' | 'number' | 'boolean' | 'any';

export const PIN_COLORS: Record<PinType, string> = {
  exec: '#000000',
  string: '#ec4899',
  number: '#22c55e',
  boolean: '#ef4444',
  any: '#9ca3af',
};
