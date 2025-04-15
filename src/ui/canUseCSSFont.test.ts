import { canUseCSSFont, cached } from './canUseCSSFont';

describe('canUseCSSFont', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    Object.keys(cached).forEach((key) => delete cached[key]);
  });

  it('should resolve false if FontFaceSet is not supported', async () => {
    Object.defineProperty(document, 'fonts', { value: undefined, writable: true });
    const result = await canUseCSSFont('TestFont');
    expect(result).toBe(false);
  });

  it('should resolve false if font is not available', async () => {
    Object.defineProperty(document, 'fonts', {
      value: {
        check: jest.fn().mockReturnValue(false),
        ready: Promise.resolve(),
        status: 'loaded',
        values: jest.fn().mockReturnValue([]),
      },
      writable: true,
    });

    const result = await canUseCSSFont('NonExistentFont');
    expect(result).toBe(false);
  });

  it('should resolve true if font is available', async () => {
    Object.defineProperty(document, 'fonts', {
      value: {
        check: jest.fn().mockReturnValue(true),
        ready: Promise.resolve(),
        status: 'loaded',
        values: jest.fn().mockReturnValue([{ family: 'TestFont' }]),
      },
      writable: true,
    });

    const result = await canUseCSSFont('TestFont');
    expect(result).toBe(true);
  });

  it('should return cached result if font check was done before', async () => {
    cached['CachedFont'] = Promise.resolve(true);
    const result = await canUseCSSFont('CachedFont');
    expect(result).toBe(true);
  });
});