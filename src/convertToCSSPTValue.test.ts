import { convertToCSSPTValue, PX_TO_PT_RATIO } from './convertToCSSPTValue';
describe('convertToCSSPTValue', () => {
  it('should convert pixel values to points correctly', () => {
    expect(convertToCSSPTValue('16px')).toBeCloseTo(16 * PX_TO_PT_RATIO);
    expect(convertToCSSPTValue('8px')).toBeCloseTo(8 * PX_TO_PT_RATIO);
  });

  it('should return 0 for unsupported units', () => {
    expect(convertToCSSPTValue('16em')).toBe(0);
    expect(convertToCSSPTValue('10%')).toBe(0);
  });

  it('should return 0 for invalid input formats', () => {
    expect(convertToCSSPTValue('16')).toBe(0);
    expect(convertToCSSPTValue('px')).toBe(0);
    expect(convertToCSSPTValue('')).toBe(0);
    expect(convertToCSSPTValue(null as unknown as string)).toBe(0);
    expect(convertToCSSPTValue(undefined as unknown as string)).toBe(0);
  });

  it('should return 0 for non-numeric values', () => {
    expect(convertToCSSPTValue('abc')).toBe(0);
    expect(convertToCSSPTValue('10abc')).toBe(0);
  });

  it('should return 0 for missing value or unit', () => {
    expect(convertToCSSPTValue('10')).toBe(0); // Missing unit
    expect(convertToCSSPTValue('px')).toBe(0); // Missing value
  });

  it('should handle edge cases', () => {
    expect(convertToCSSPTValue('0px')).toBe(0); // Zero value
    expect(convertToCSSPTValue('-5px')).toBeCloseTo(-5 * PX_TO_PT_RATIO); // Negative value
  });
});
