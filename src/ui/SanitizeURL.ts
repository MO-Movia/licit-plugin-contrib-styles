const HTTP_PREFIX = /^http(s?):*\/\//i;

export function sanitizeURL(url?: string): string {
  if (!url) {
    return 'https://';
  }
  if (HTTP_PREFIX.test(url)) {
    return url;
  }
  return 'https://' + url;
}
