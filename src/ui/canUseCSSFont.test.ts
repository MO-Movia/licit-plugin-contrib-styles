import { canUseCSSFont, cached } from './canUseCSSFont';

describe('canUseCSSFont', () => {
  beforeEach(() => {
    // Clear the cache before each test
    Object.keys(cached).forEach(key => delete cached[key]);
  });
  interface FontFaceSet {
    // Add properties and methods you expect to use from FontFaceSet
    [key: string]: unknown;
}

  it('should return a cached promise if it exists', async () => {
    const fontName = 'TestFont';
    const mockPromise = Promise.resolve(true);
    cached[fontName] = mockPromise;

    const result = await canUseCSSFont(fontName);

    expect(result).toBe(true);
    expect(cached[fontName]).toBe(mockPromise);
  });

  it('should return false if FontFaceSet is not supported', async () => {

    const fontName = 'TestFont';
    (window.document as unknown as { fonts?: FontFaceSet }).fonts = undefined;
    const result = await canUseCSSFont(fontName);

    expect(result).toBe(false);
    expect(cached[fontName]).toBeDefined();
  });

  it('should resolve to true if the font is loaded', async () => {
    const fontName = 'TestFont';
    const mockFontFace = { family: fontName };
     (window.document as unknown as { fonts?: FontFaceSet }).fonts = {
      status: 'loaded',
      check: jest.fn(),
      ready: Promise.resolve(),
      values: () => [mockFontFace],
    };

    const result = await canUseCSSFont(fontName);

    expect(result).toBe(true);
    expect(cached[fontName]).toBeDefined();
  });

  it('should resolve to false if the font is not loaded', async () => {
    const fontName = 'TestFont';
    const mockFontFace = { family: 'AnotherFont' };
    (window.document as unknown as { fonts?: FontFaceSet }).fonts = {
      status: 'loaded',
      check: jest.fn(),
      ready: Promise.resolve(),
      values: () => [mockFontFace],
    };

    const result = await canUseCSSFont(fontName);

    expect(result).toBe(false);
    expect(cached[fontName]).toBeDefined();
  });

  it('should check the font loading status periodically if fonts are not loaded', async () => {
    jest.useFakeTimers();

    const fontName = 'TestFont';
    (window.document as unknown as { fonts?: FontFaceSet }).fonts= {
      status: 'loading',
      check: jest.fn(),
      ready: Promise.resolve(),
      values: () => [],
    };

    const canUseCSSFontPromise = canUseCSSFont(fontName);

    expect(  (window.document as unknown as { fonts?: FontFaceSet }).fonts.status).toBe('loading');

    // Simulate the fonts being loaded
    (window.document as unknown as { fonts?: FontFaceSet }).fonts.status = 'loaded';
    (window.document as unknown as { fonts?: FontFaceSet }).fonts.values = () => [{ family: fontName }];
    jest.runAllTimers();

    const result = await canUseCSSFontPromise;

    expect(result).toBe(true);
    expect(cached[fontName]).toBeDefined();
  });
});
