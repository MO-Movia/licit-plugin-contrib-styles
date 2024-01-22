import { isPreviousLevelExists, setStyles, isStylesLoaded, hasStyleRuntime, getCustomStyle } from './customStyle';

describe('customstyle', () => {
    it('should handle isPreviousLevelExists', () => {
        setStyles([{ styles: { styleLevel: 2 } }]);
        expect(isPreviousLevelExists(2)).toBeTruthy();
    });
    it('should handle isPreviousLevelExists when customStyles.length=0', () => {
        setStyles([]);
        expect(isPreviousLevelExists(2)).toBeTruthy();
    });
    it('should handle isPreviousLevelExists when customStyles does not have styles', () => {
        setStyles([{}]);
        expect(isPreviousLevelExists(2)).toBeFalsy();
    });
    it('should handle isStylesLoaded', () => {
        const test = isStylesLoaded();
        expect(test).toBeDefined();
    });
    it('should handle isStylesLoaded', () => {

        const test = hasStyleRuntime();
        expect(test).toBeFalsy();
    });
    it('should handle getCustomStyle', () => {
        const cstyle = { 'strong': {}, 'boldPartial': true, 'em': null, 'strike': null, 'textAlign': {}, 'underline': null };
        const test = getCustomStyle(cstyle);
        expect(test).toBeDefined();
    });
});

