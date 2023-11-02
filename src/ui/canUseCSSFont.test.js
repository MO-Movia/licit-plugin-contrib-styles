import { canUseCSSFont, cached } from './canUseCSSFont';

describe('canUseCSSFont', () => {
  const mockFonts = {
    check: jest.fn(),
    ready: Promise.resolve(),
    status: 'loaded',
    values: () => [],
  };
  beforeEach(() => {
    global.document = {
      fonts: mockFonts,
    };
    cached['Font1'] = true;
  });
  // afterEach(() => {
  //   jest.clearAllMocks();
  //   delete global.document;
  //   delete cached['Font1'];
  // });
  it('should handle canUseCSSFont',()=>{
    global.document = {
      fonts: null,
    };
    expect(canUseCSSFont('ariel')).toBeDefined();
  });

});
