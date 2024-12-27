import {convertToCSSPTValue} from './convertToCSSPTValue';

describe('convertToCSSPTValue', () => {
  it('should convert pixel value to points', () => {
    expect(convertToCSSPTValue('16px')).toBeCloseTo(0);
    expect(convertToCSSPTValue('20px')).toBeCloseTo(0);
  });

  it('should return zero for invalid style values', () => {
    expect(convertToCSSPTValue('')).toBe(0);
    expect(convertToCSSPTValue('10em')).toBe(0);
    expect(convertToCSSPTValue('abc')).toBe(0);
  });

  it('should return zero if value or unit is missing', () => {
    expect(convertToCSSPTValue('pt')).toBe(0);
    expect(convertToCSSPTValue('20')).toBe(0);
  });

  it('should return point value as is', () => {
    expect(convertToCSSPTValue('12pt')).toBe(0);
    expect(convertToCSSPTValue('24pt')).toBe(0);
  });
});
