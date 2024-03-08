import { canUseCSSFont, cached } from './canUseCSSFont';


const mockFonts = {
  check: jest.fn(),
  ready: Promise.resolve(),
  status: 'loaded',
  values: () => [],
};


// Object.defineProperty(global.document, 'fonts', {
//   value: mockFonts,
// });

cached['Font1'] = Promise.resolve(true);

describe('canUseCSSFont', () => {
  it('should return true if the font is already in cache', async () => {
    const result = await canUseCSSFont('Font1');
    expect(result).toBe(true);
    expect(mockFonts.check).not.toBeCalled();
  });
});
