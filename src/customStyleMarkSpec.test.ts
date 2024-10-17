import { toMarkDOM, getMarkAttrs } from './CustomStyleMarkSpec';
import { Node } from 'prosemirror-model';

describe('getAttrs', () => {
    const base = () => { return { 'overridden': true }; };
    const dom = document.createElement('div');
    dom.setAttribute('overridden', 'true');
    jest.spyOn(document, 'getElementById').mockReturnValue(dom);
    it('should handle getAttrs', () => {
        expect(getMarkAttrs(base, dom)).toBeDefined();
    });
    it('should handle getAttrs when base returns type != object ', () => {
        const dom1 = document.createElement('div');
    dom1.setAttribute('overridden', 'false');
        const base = () => { return {key:'value'}; };
        expect(getMarkAttrs(base, dom1)).toBeDefined();
    });
    it('should handle getAttrs when base is undefined', () => {
        const dom2 = document.createElement('div');
        dom2.setAttribute('overridden', '123');
        const base = undefined;
        expect(getMarkAttrs(base, dom2)).toBeUndefined();
    }); 
});

describe('toMarkDOM', () => {
    it('should handle toMarkDOM when output length is 2', () => {
        const base = () => { return ['span', { 'overridden': true }]; };
        const node = { attrs: { overridden: true } };
        expect(toMarkDOM(base, node as unknown as Node)).toStrictEqual(['span', { 'overridden': true }, 0]);
    });
    it('should handle toMarkDOM when output length not 2', () => {
        const base = () => { return ['span', { 'overridden': true }, 0]; };
        const node = { attrs: { align: 'left', capco: 'TBD', color: null, id: '', indent: null, lineSpacing: null, paddingBottom: null, paddingTop: null, styleName: 'FS_B01' } };
        expect(toMarkDOM(base, node  as unknown as Node)).toStrictEqual(['span', { 'overridden': undefined }, 0]);
    });
});

describe('convertToBoolean', () => {
    it('should handle toMarkDOM when output length is 2', () => {
        const base = () => { return ['span', { 'overridden': true }]; };
        const node = { attrs: { overridden: true } };
        expect(toMarkDOM(base, node as unknown as Node)).toStrictEqual(['span', { 'overridden': true }, 0]);
    });
    it('should handle toMarkDOM when output length not 2', () => {
        const base = () => { return ['span', { 'overridden': true }, 0]; };
        const node = { attrs: { align: 'left', capco: 'TBD', color: null, id: '', indent: null, lineSpacing: null, paddingBottom: null, paddingTop: null, styleName: 'FS_B01' } };
        expect(toMarkDOM(base, node  as unknown as Node)).toStrictEqual(['span', { 'overridden': undefined }, 0]);
    });
});
