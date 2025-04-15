export const cached: { [key: string]: Promise<boolean> } = {};

export function canUseCSSFont(fontName: string): Promise<boolean> {
  const doc = document;

  if (cached[fontName]?.then) {
    return cached[fontName];
  }

  if (
    typeof doc.fonts !== 'object' ||
    !doc.fonts.check ||
    !doc.fonts.ready?.then ||
    !doc.fonts.status ||
    !doc.fonts.values
  ) {
    // Feature is not supported, install the CSS anyway
    // https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/check#Browser_compatibility
    // SL-1
    console.log('FontFaceSet is not supported');
    cached[fontName] = Promise.resolve(false);
  } else {
    cached[fontName] = new Promise((resolve) => {
      // https://stackoverflow.com/questions/5680013/how-to-be-notified-once-a-web-font-has-loaded
      // All fonts in use by visible text have loaded.
      const check = () => {
        // Do not use `doc.fonts.check()` because it may return falsey result.
        const fontFaces = Array.from(doc.fonts.values());
        const matched = fontFaces.find((ff) => ff.family === fontName);
        const result = !!matched;
        resolve(result);
      };
      doc.fonts.ready.then(check);
    });
  }
  return cached[fontName];
}
