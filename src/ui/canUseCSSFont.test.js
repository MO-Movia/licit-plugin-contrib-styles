/* global global */
import canUseCSSFont, { cached } from './canUseCSSFont';

describe('canUseCSSFont', () => {
  const mockFonts = {
    check: jest.fn(),
    ready: Promise.resolve(),
    status: 'loaded',
    values: () => [],
  };

  const mockFonts_not_oaded = {
    check: jest.fn(),
    ready: Promise.resolve(),
    status: 'failed',
    values: () => [],
  };

  beforeEach(() => {
    global.document = {
      fonts: mockFonts,
      status: 'failed'
    };
    cached['Font1'] = true;
  });
  afterEach(() => {
    jest.clearAllMocks();
    delete global.document;
    delete cached['Font1'];
  });
  it('should return true if the font is already in cache', async () => {
    const result = await canUseCSSFont('Font1');
    expect(result).toBe(true);
    expect(mockFonts.check).not.toBeCalled();
  });
  it('should return false if FontFaceSet is not supported', async () => {
    const result = await canUseCSSFont('Font2');
    expect(result).toBe(false)
    expect(mockFonts_not_oaded.check).not.toBeCalled();
  });
  it('should resolve true if the font is loaded', async () => {
    const mockFontFace = { family: 'Font2' };
    global.document.fonts.values = () => [mockFontFace];
    const result = await canUseCSSFont('Font2');
    expect(result).toBe(false);
    expect(mockFonts.check).not.toBeCalled();
  });
  it('should resolve false if the font is not loaded', async () => {
    const mockFontFace = { family: 'Font2' };
    global.document.fonts.values = () => [mockFontFace];
    const result = await canUseCSSFont('Font3');
    expect(result).toBe(false);
    expect(mockFonts.check).not.toBeCalled();
  });
  it('should resolve true if the font is loaded after a delay', async () => {
    const mockFontFace = { family: 'Font2' };
    global.document.fonts.status = 'loading';
    global.document.fonts.values = () => [mockFontFace];
    const resultPromise = canUseCSSFont('Font2');
    jest.advanceTimersByTime(350);
    global.document.fonts.status = 'loaded';
    jest.advanceTimersByTime(350);
    const result = await resultPromise;
    expect(result).toBe(false);
    expect(mockFonts.check).not.toBeCalled();
  });
});
