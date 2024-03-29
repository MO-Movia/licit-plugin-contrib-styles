import { sanitizeURL } from './SanitizeURL';

describe('sanitizeURL', () => {
  it('should handle sanitizeURL when !url and return http://', () => {
    expect(sanitizeURL()).toBe('http://');
  });
  it('should handle sanitizeURL when url present  and return http:// + the url', () => {
    expect(sanitizeURL('google.com')).toBe('http://google.com');
  });
  it('should handle sanitizeURL when url present and is a proper url then url', () => {
    expect(sanitizeURL('http://google.com')).toBe('http://google.com');
  });
});
