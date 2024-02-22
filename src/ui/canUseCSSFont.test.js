/ global global /;
import { canUseCSSFont, cached } from './canUseCSSFont';

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
  // afterEach(() => {
  //   jest.clearAllMocks();
  //   delete global.document;
  //   delete cached['Font1'];
  // });
  it('should return true if the font is already in cache', async () => {
    const result = await canUseCSSFont('Font1');
    expect(result).toBe(true);
    expect(mockFonts.check).not.toBeCalled();
  });
});
