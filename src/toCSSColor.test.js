import toCSSColor, { isTransparent } from './toCSSColor';

describe('toCSSColor', () => {
    it('should return an empty string when the input is falsy', () => {
        expect(toCSSColor('')).toBe('');
    });

    it('should return the corresponding value from the ColorMaping object if the input is a key in it', () => {
        expect(toCSSColor('transparent')).toBe('rgba(0,0,0,0)');
    });

    it('should return rgba format if the input matches the RGBA_PATTERN and the color has alpha 0', () => {
        expect(toCSSColor('rgba(0,0,0,0)')).toBe('rgba(0,0,0,0)');
    });

    it('should return rgba format if the input matches the RGBA_PATTERN and the color has non-zero alpha', () => {
        expect(toCSSColor('rgba(255,0,0,0.5)')).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should return hex format if the input does not match the RGBA_PATTERN and can be converted to hex', () => {
        expect(toCSSColor('#ff0000')).toBe('#ff0000');
    });

    it('should return an empty string if the input does not match the RGBA_PATTERN and cannot be converted to hex', () => {
        expect(toCSSColor('invalid color')).toBe('');
    });
});

describe('isTransparent', () => {
    it('should return true for falsy inputs', () => {
        expect(isTransparent('')).toBe(true);
    });

    it('should return true for transparent color strings', () => {
        expect(isTransparent('transparent')).toBe(true);
        expect(isTransparent('rgba(0,0,0,0)')).toBe(true);
    });

    it('should return false for non-transparent color strings', () => {
        expect(isTransparent('#ffffff')).toBe(false);
    });
});