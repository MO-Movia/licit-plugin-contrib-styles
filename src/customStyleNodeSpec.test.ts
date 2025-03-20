import {
  toCustomStyleDOM,
  getCustomStyleAttrs,
  countersRefresh,
} from './CustomStyleNodeSpec.js';
import * as customstyle from './customStyle';
import { Node, DOMOutputSpec } from 'prosemirror-model';

describe('getAttrs', () => {
  const base = () => {
    return { attrs: { styleName: '' } };
  };
  const dom = document.createElement('div');
  dom.setAttribute('styleName', 'test_styles');

  jest.spyOn(document, 'getElementById').mockReturnValue(dom);
  it('should handle getAttrs', () => {
    expect(getCustomStyleAttrs(base, dom)).toStrictEqual({
      attrs: {
        styleName: '',
      },
      styleName: 'test_styles',
    });
  });
});
describe('toCustomStyleDOM', () => {
  const base = () => {
    return ['span', { styleName: '' }] as unknown as DOMOutputSpec;
  };

  it('should handle toCustomStyleDOM ', () => {
    jest.spyOn(customstyle, 'getCustomStyleByName').mockReturnValue({
      styles: {
        hasBullet: true,
        bulletLevel: '25CF',
        styleLevel: 1,
        paragraphSpacingBefore: '10',
        paragraphSpacingAfter: '10',
        strong: true,
        boldNumbering: true,
        em: true,
        color: 'blue',
        fontSize: '10',
        fontName: 'Tahoma',
        indent: '10',
        hasNumbering: true,
        isList:true,
      },
      styleName: '',
    });
    //const base = undefined

    const node = {
      type: 'paragraph',
      attrs: {
        align: 'right',
        color: null,
        id: null,
        indent: null,
        lineSpacing: '16pt',
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: 'FS_B01',
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        'data-bullet-color': '#000000',
        'data-bullet-symbol': '● ',
        'data-indent': '10',
        'data-show-bullet': true,
        'list-style-level': 1,
        // 'hide-style-level': false,
        style:
          'text-align: right;line-height: 16pt;--czi-content-line-height: 16pt;margin-bottom: 10pt !important;margin-top: 10pt !important;font-weight: bold; --czi-counter-bold: bold;font-style: italic;color: blue;font-size: 10pt;font-family: Tahoma;counter-increment: L1 ;',
        styleName: 'FS_B01',
      },
    ]);
  });
  it('should handle toCustomStyleDOM when hasnumbering false', () => {
    jest.spyOn(customstyle, 'getCustomStyleByName').mockReturnValue({
      styles: {
        hasBullet: true,
        bulletLevel: '25CF',
        styleLevel: 1,
        paragraphSpacingBefore: '10',
        paragraphSpacingAfter: '10',
        strong: true,
        boldNumbering: true,
        em: true,
        color: 'blue',
        fontSize: '10',
        fontName: 'Tahoma',
        indent: '10',
        hasNumbering: false,
      },
      styleName: '',
    });
    //const base = undefined;
    const node = {
      type: 'paragraph',
      attrs: {
        align: 'right',
        color: null,
        id: null,
        indent: null,
        lineSpacing: '16pt',
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: 'FS_B01',
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        'data-bullet-color': '#000000',
        'data-bullet-symbol': '● ',
        'data-indent': '10',
        'data-show-bullet': true,
        style:
          'text-align: right;line-height: 16pt;--czi-content-line-height: 16pt;margin-bottom: 10pt !important;margin-top: 10pt !important;font-weight: bold; --czi-counter-bold: bold;font-style: italic;color: blue;font-size: 10pt;font-family: Tahoma;',
        styleName: 'FS_B01',
      },
    ]);
  });
  it('should handle toCustomStyleDOM when styleName includes(RESERVED_STYLE_NONE_NUMBERING)', () => {
    //const base = undefined;
    const node = {
      type: 'paragraph',
      attrs: {
        align: 'right',
        color: null,
        id: null,
        indent: null,
        lineSpacing: '16pt',
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: '10Normal-@#$-10',
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        'data-bullet-color': '#000000',
        'data-bullet-symbol': '● ',
        'data-indent': '10',
        'data-show-bullet': true,
        style:
          'text-align: right;line-height: 16pt;--czi-content-line-height: 16pt;margin-bottom: 10pt !important;margin-top: 10pt !important;font-weight: bold; --czi-counter-bold: bold;font-style: italic;color: blue;font-size: 10pt;font-family: Tahoma;',
        styleName: '10Normal-@#$-10',
      },
    ]);
  });
  it('should handle toCustomStyleDOM when  hasBullet: false', () => {
    jest.spyOn(customstyle, 'getCustomStyleByName').mockReturnValue({
      styles: {
        hasBullet: false,
        bulletLevel: '25CF',
        styleLevel: 1,
        paragraphSpacingBefore: 'null',
        paragraphSpacingAfter: 'null',
        strong: true,
        boldNumbering: true,
        em: true,
        color: 'null',
        fontSize: 'null',
        fontName: 'null',
        indent: 'null',
        hasNumbering: true,
        align: 'null',
      },
      styleName: '',
    });
    //const base = undefined;
    const node = {
      type: 'paragraph',
      attrs: {
        align: null,
        color: null,
        id: null,
        indent: null,
        lineSpacing: '16pt',
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: 'FS_B01',
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        'data-indent': 'null',
        'data-style-level': '1',
        'hide-style-level': false,
        style:
          'line-height: 16pt;--czi-content-line-height: 16pt;text-align: null;margin-bottom: nullpt !important;margin-top: nullpt !important;font-weight: bold; --czi-counter-bold: bold;font-style: italic;color: null;font-size: nullpt;font-family: null;counter-increment: C1 ;',
        styleName: 'FS_B01',
      },
    ]);
  });

  it('should handle toCustomStyleDOM when  hasBullet: false', () => {
    jest.spyOn(customstyle, 'getCustomStyleByName').mockReturnValue({
      styles: {
        hasBullet: true,
        bulletLevel: '25CF1',
        styleLevel: 1,
        paragraphSpacingBefore: 'null',
        paragraphSpacingAfter: 'null',
        strong: true,
        boldNumbering: true,
        em: true,
        color: 'null',
        fontSize: 'null',
        fontName: 'null',
        indent: 'null',
        hasNumbering: true,
        align: 'null',
      },
      styleName: '',
    });
    //const base = undefined;
    const node = {
      type: 'paragraph',
      attrs: {
        align: null,
        color: null,
        id: null,
        indent: null,
        lineSpacing: '16pt',
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: 'FS_B01',
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        'data-indent': 'null',
        'data-style-level': '1',
        'hide-style-level': false,
        style:
          'line-height: 16pt;--czi-content-line-height: 16pt;text-align: null;margin-bottom: nullpt !important;margin-top: nullpt !important;font-weight: bold; --czi-counter-bold: bold;font-style: italic;color: null;font-size: nullpt;font-family: null;',
        styleName: 'FS_B01',
      },
    ]);
  });
  it('should handle toCustomStyleDOM when  styleLevel: null', () => {
    jest.spyOn(customstyle, 'getCustomStyleByName').mockReturnValue({
      styles: {
        hasBullet: false,
        bulletLevel: '25CF',
        styleLevel: 10,
        paragraphSpacingBefore: 'null',
        paragraphSpacingAfter: 'null',
        strong: true,
        boldNumbering: true,
        em: true,
        color: 'null',
        fontSize: 'null',
        fontName: 'null',
        indent: 'null',
        hasNumbering: true,
        align: 'null',
      },
      styleName: '',
    });
    //const base = undefined;
    const node = {
      type: 'paragraph',
      attrs: {
        align: null,
        color: null,
        id: null,
        indent: null,
        lineSpacing: '16pt',
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: null,
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        style: 'line-height: 16pt;--czi-content-line-height: 16pt;',
        styleName: null,
      },
    ]);
  });
  it('should handle toCustomStyleDOM when  styleName: test', () => {
    jest.spyOn(customstyle, 'getCustomStyleByName').mockReturnValue({
      styles: {
        hasBullet: false,
        bulletLevel: '25CF',
        styleLevel: 10,
        paragraphSpacingBefore: 'null',
        paragraphSpacingAfter: 'null',
        strong: true,
        boldNumbering: true,
        em: true,
        color: 'null',
        fontSize: 'null',
        fontName: 'null',
        indent: 'null',
        hasNumbering: true,
        align: 'null',
      },
      styleName: '',
    });
    //const base = undefined;
    const node = {
      type: 'paragraph',
      attrs: {
        align: null,
        color: null,
        id: null,
        indent: null,
        lineSpacing: '16pt',
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: 'test',
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        'data-indent': 'null',
        'data-style-level': '10',
        'hide-style-level': false,
        style:
          'line-height: 16pt;--czi-content-line-height: 16pt;text-align: null;margin-bottom: nullpt !important;margin-top: nullpt !important;font-weight: bold; --czi-counter-bold: bold;font-style: italic;color: null;font-size: nullpt;font-family: null;counter-increment: C2 C3 C4 C5 C6 C7 C8 C9 C10 ;',
        styleName: 'test',
      },
    ]);
  });
  it('should handle toCustomStyleDOM when  styleprops null', () => {
    //const base = undefined;
    const node = {
      type: 'paragraph',
      attrs: {
        align: null,
        color: null,
        id: null,
        indent: null,
        lineSpacing: '16pt',
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: 'test',
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        'data-indent': 'null',
        'data-style-level': '10',
        'hide-style-level': false,
        style:
          'line-height: 16pt;--czi-content-line-height: 16pt;text-align: null;margin-bottom: nullpt !important;margin-top: nullpt !important;font-weight: bold; --czi-counter-bold: bold;font-style: italic;color: null;font-size: nullpt;font-family: null;',
        styleName: 'test',
      },
    ]);
  });
  it('should handle toCustomStyleDOM when  styleprops null and stylename has reservedStylenumbering and no styleLvel', () => {
    //const base = undefined;
    const node = {
      type: 'paragraph',
      attrs: {
        align: null,
        color: null,
        id: null,
        indent: null,
        lineSpacing: '16pt',
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: '10Normal-@#$-',
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        'data-indent': 'null',
        'data-style-level': '10',
        'hide-style-level': false,
        style:
          'line-height: 16pt;--czi-content-line-height: 16pt;text-align: null;margin-bottom: nullpt !important;margin-top: nullpt !important;font-weight: bold; --czi-counter-bold: bold;font-style: italic;color: null;font-size: nullpt;font-family: null;',
        styleName: '10Normal-@#$-',
      },
    ]);
  });
  it('should handle toCustomStyleDOM when  styleprops null and stylename has reservedStylenumbering and no styleLvel and 2 not equal to indices.length', () => {
    // const base = undefined;
    const node = {
      type: 'paragraph',
      attrs: {
        align: null,
        color: null,
        id: null,
        indent: null,
        lineSpacing: '16pt',
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: 'Normal-@#$-Normal-@#$-Normal-@#$-',
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        'data-indent': 'null',
        'data-style-level': '10',
        'hide-style-level': false,
        style:
          'line-height: 16pt;--czi-content-line-height: 16pt;text-align: null;margin-bottom: nullpt !important;margin-top: nullpt !important;font-weight: bold; --czi-counter-bold: bold;font-style: italic;color: null;font-size: nullpt;font-family: null;',
        styleName: 'Normal-@#$-Normal-@#$-Normal-@#$-',
      },
    ]);
  });
  it('should handle toCustomStyleDOM when lineSpacing is null', () => {
    jest.spyOn(customstyle, 'getCustomStyleByName').mockReturnValue({
      styles: {
        hasBullet: true,
        bulletLevel: '25CF',
        styleLevel: 1,
        paragraphSpacingBefore: '10',
        paragraphSpacingAfter: '10',
        strong: true,
        boldNumbering: true,
        em: true,
        color: 'blue',
        fontSize: '10',
        fontName: 'Tahoma',
        indent: '10',
        hasNumbering: true,
      },
      styleName: '',
    });
    //const base = undefined;
    const node = {
      type: 'paragraph',
      attrs: {
        align: 'right',
        color: null,
        id: null,
        indent: null,
        lineSpacing: null,
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: 'FS_B01',
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        'data-bullet-color': '#000000',
        'data-bullet-symbol': '● ',
        'data-indent': '10',
        'data-show-bullet': true,
        'data-style-level': '1',
        'hide-style-level': false,
        style:
          'text-align: right;margin-bottom: 10pt !important;margin-top: 10pt !important;font-weight: bold; --czi-counter-bold: bold;font-style: italic;color: blue;font-size: 10pt;font-family: Tahoma;',
        styleName: 'FS_B01',
      },
    ]);
  });
  it('should handle toCustomStyleDOM when align null', () => {
    jest.spyOn(customstyle, 'getCustomStyleByName').mockReturnValue({
      styles: {
        hasBullet: true,
        bulletLevel: '25CF',
        styleLevel: 1,
        paragraphSpacingBefore: '10',
        paragraphSpacingAfter: '10',
        strong: true,
        boldNumbering: true,
        em: true,
        color: 'blue',
        fontSize: '10',
        fontName: 'Tahoma',
        indent: '10',
        hasNumbering: true,
        align: 'left',
      },
      styleName: '',
    });
    // const base = undefined;
    const node = {
      type: 'paragraph',
      attrs: {
        align: null,
        color: null,
        id: null,
        indent: null,
        lineSpacing: '16pt',
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: 'FS_B01',
      },
      content: [
        {
          type: 'text',
          marks: [
            { type: 'mark-font-size', attrs: { pt: 11, overridden: false } },
            {
              type: 'mark-font-type',
              attrs: { name: 'Arial', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#3b0df2', overridden: false },
            },
          ],
          text: 'g',
        },
      ],
    };
    expect(toCustomStyleDOM(base, node as unknown as Node)).toStrictEqual([
      'span',
      {
        'data-bullet-color': '#000000',
        'data-bullet-symbol': '● ',
        'data-indent': '10',
        'data-show-bullet': true,
        'data-style-level': '1',
        'hide-style-level': false,
        style:
          'line-height: 16pt;--czi-content-line-height: 16pt;text-align: left;margin-bottom: 10pt !important;margin-top: 10pt !important;font-weight: bold; --czi-counter-bold: bold;font-style: italic;color: blue;font-size: 10pt;font-family: Tahoma;',

        styleName: 'FS_B01',
      },
    ]);
  });



  it('should reset list style counters in window variables', () => {
    const styleLevel = 3;
    const isListStyle = true;
    window['set-cust-list-style-counter-1'] = false;
    window['set-cust-list-style-counter-2'] = false;
    const result = countersRefresh(styleLevel, isListStyle);
    expect(result).toBe('counter-increment: L1 L2 L3 ;');
    expect(window['set-cust-list-style-counter-1']).toBe(true);
    expect(window['set-cust-list-style-counter-2']).toBe(true);
  });


});
