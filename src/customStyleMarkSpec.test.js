import { toMarkDOM, getMarkAttrs } from './CustomStyleMarkSpec';


describe('getAttrs', () => {
    const base = (p) => { return { 'overridden': true }; };
    const dom = document.createElement('div');
    dom.setAttribute('overridden', true);
    jest.spyOn(document, 'getElementById').mockReturnValue(dom);
    it('should handle getAttrs', () => {
        expect(getMarkAttrs(base, dom)).toBeDefined();
    });
    it('should handle getAttrs when base returns type != object ', () => {
        const base = (p) => { return ''; };
        expect(getMarkAttrs(base, dom)).toBeDefined();
    });
    it('should handle getAttrs when base is undefined', () => {
        const base = undefined;
        expect(getMarkAttrs(base, dom)).toBeDefined();
    });
});

describe('toMarkDOM', () => {
    it('should handle toMarkDOM when output length is 2', () => {
        const base = (p) => { return ['span', { 'overridden': true }]; };
        const node = { attrs: { overridden: true } };
        expect(toMarkDOM(base, node)).toStrictEqual(['span', { 'overridden': true }, 0]);
    });
    it('should handle toMarkDOM when output length not 2', () => {
        const base = (p) => { return ['span', { 'overridden': true }, 0]; };
        const node = { attrs: { align: 'left', capco: 'TBD', color: null, id: '', indent: null, lineSpacing: null, paddingBottom: null, paddingTop: null, styleName: 'FS_B01' } };
        expect(toMarkDOM(base, node)).toStrictEqual(['span', { 'overridden': undefined }, 0]);
    });
});
