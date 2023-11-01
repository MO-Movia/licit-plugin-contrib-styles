import { createEditor, doc, p } from 'jest-prosemirror';
import { CustomstyleDropDownCommand } from './ui/CustomstyleDropDownCommand';
import { uuid } from './ui/Uuid';
import {
  CustomstylePlugin,
  resetTheDefaultStyleNameToNone,
  setNodeAttrs,
  applyStyleForNextParagraph,
  nodeAssignment,
  manageHierarchyOnDelete,
  onInitAppendTransaction,
  onUpdateAppendTransaction,
  applyNormalIfNoStyle,
  applyStyleForEmptyParagraph,
  remapCounterFlags,
} from './index';
import { builders } from 'prosemirror-test-builder';
import {
  EditorState,
  Plugin,
  PluginKey,
  TextSelection,
  Transaction,
} from 'prosemirror-state';
import {
  setStyles,
  getCustomStyleByName,
  isCustomStyleExists,
  isStylesLoaded,
  getCustomStyleByLevel,
  getHidenumberingFlag,
  setHidenumberingFlag,
} from './customStyle';
import { Schema, Mark } from 'prosemirror-model';
import { isTransparent, toCSSColor } from './toCSSColor';
import { EditorView } from 'prosemirror-view';
import * as DOMfunc from './CustomStyleNodeSpec';
import * as CustStyl from './customStyle';

import { sanitizeURL } from './sanitizeURL';
import { CustomStyleCommand } from './CustomStyleCommand';
import * as ccommand from './CustomStyleCommand.js';

const attrs = {
  align: { default: null },
  capco: { default: null },
  color: { default: null },
  id: { default: null },
  indent: { default: null },
  lineSpacing: { default: null },
  paddingBottom: { default: null },
  paddingTop: { default: null },
};
const mark_type_attr = {
  style: 'font-family: Arial',
};
class TestPlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('TestPlugin'),
    });
  }
}
const styl = {
  styleName: 'A_12',
  mode: 1,
  styles: {
    align: 'left',
    boldNumbering: true,
    toc: false,
    isHidden: false,
    boldSentence: true,
    nextLineStyleName: 'A_12',
    fontName: 'Aclonica',
    fontSize: '14',
    strong: true,
    styleLevel: '2',
    hasBullet: true,
    bulletLevel: '272A',
    hasNumbering: false,
  },
  toc: false,
  isHidden: false,
};
const styl2 = {
  styleName: 'A_123',
  mode: 1,
  styles: {
    align: 'left',
    boldNumbering: true,
    toc: false,
    isHidden: false,
    boldSentence: true,
    nextLineStyleName: 'A_12',
    fontName: 'Aclonica',
    fontSize: '14',
    strong: true,
    styleLevel: '2',
    hasBullet: true,
    bulletLevel: '272A',
    hasNumbering: false,
  },
  toc: false,
  isHidden: false,
};
const TestCustomStyleRuntime = {
  saveStyle: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
  getStylesAsync: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
  renameStyle: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
  removeStyle: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
  fetchStyles: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
  buildRoute: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
};

const mockSchema = new Schema({
  nodes: {
    doc: {
      content: 'paragraph+',
    },
    paragraph: {
      content: 'text*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return ['p', 0];
      },
    },
    text: { inline: true },
  },
  // marks1: {
  //     link: {
  //         attrs: {
  //             href: 'test_href'
  //         }
  //     }
  // },
  marks: {
    link: {
      attrs: {
        href: 'test_href',
      },
    },
    em: {
      parseDOM: [
        {
          tag: 'i',
        },
        {
          tag: 'em',
        },
        {
          style: 'font-style=italic',
        },
      ],
      toDOM() {
        return ['em', 0];
      },
      attrs: {
        overridden: {
          hasDefault: true,
          default: false,
        },
      },
    },
    strong: {
      parseDOM: [
        {
          tag: 'strong',
        },
        {
          tag: 'b',
        },
        {
          style: 'font-weight',
        },
      ],
      toDOM() {
        return ['strong', 0];
      },
      attrs: {
        overridden: {
          hasDefault: true,
          default: false,
        },
      },
    },
    underline: {
      parseDOM: [
        {
          tag: 'u',
        },
        {
          style: 'text-decoration-line',
        },
        {
          style: 'text-decoration',
        },
      ],
      toDOM() {
        return ['u', 0];
      },
      attrs: {
        overridden: {
          hasDefault: true,
          default: false,
        },
      },
    },
    'mark-text-color': {
      attrs: {
        color: '',
        overridden: {
          hasDefault: true,
          default: false,
        },
      },
      inline: true,
      group: 'inline',
      parseDOM: [
        {
          style: 'color',
        },
      ],
      toDOM() {
        return ['span', { color: '' }, 0];
      },
    },
    'mark-text-highlight': {
      attrs: {
        highlightColor: '',
        overridden: {
          hasDefault: true,
          default: false,
        },
      },
      inline: true,
      group: 'inline',
      parseDOM: [
        {
          tag: 'span[style*=background-color]',
        },
      ],
      toDOM() {
        return {
          highlightColor: '',
        };
      },
    },
    'mark-font-size': {
      attrs: {
        pt: {
          default: null,
        },
        overridden: {
          hasDefault: true,
          default: false,
        },
      },
      inline: true,
      group: 'inline',
      parseDOM: [
        {
          style: 'font-size',
        },
      ],
      toDOM(_mark, _inline) {
        return ['Test Mark'];
      },
    },
    'mark-font-type': {
      attrs: {
        name: '',
        overridden: {
          hasDefault: true,
          default: false,
        },
      },
      inline: true,
      group: 'inline',
      parseDOM: [
        {
          style: 'font-family',
        },
      ],
      toDOM() {
        return ['span', mark_type_attr, 0];
      },
    },
    strong: {
      parseDOM: [
        {
          tag: 'strong',
        },
        {
          tag: 'b',
        },
        {
          style: 'font-weight',
        },
      ],

      toDOM() {
        return ['strong', 0];
      },
      attrs: {
        overridden: {
          hasDefault: true,
          default: false,
        },
      },
    },
  },
  spec: {
    nodes: {
      doc: {
        content: 'paragraph+',
      },
      text: {},
      paragraph: {
        content: 'text*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM() {
          return ['p', 0];
        },
      },
    },
  },
});

describe('Style Plugin', () => {
  const attrs = {
    align: { default: null },
    capco: { default: null },
    color: { default: null },
    id: { default: null },
    indent: { default: null },
    lineSpacing: { default: null },
    paddingBottom: { default: null },
    paddingTop: { default: null },
  };
  const plugin = new CustomstylePlugin(TestCustomStyleRuntime, true);
  const toDOMMock = jest.spyOn(DOMfunc, 'toCustomStyleDOM');
  toDOMMock.mockImplementation((_base, _node) => {
    return ['p', attrs, 0];
  });
  const state = EditorState.create({
    schema: mockSchema,

    plugins: [plugin],
  });
  const view = new EditorView(document.createElement('div'), {
    state,
  });
  it('customStyle setStyles', () => {
    const newProp = {
      description: 'BIU',
      mode: 0,
      styleName: 'BIU',
      styles: {
        align: 'left',
        boldNumbering: true,
        boldSentence: true,
        fontName: 'Arial',
        fontSize: '14',
        isHidden: false,
        nextLineStyleName: 'Default',
        paragraphSpacingAfter: '3',
        toc: false,
      },
    };
    const customStyleList = [];
    customStyleList.push(
      newProp,
      {
        description: '1-Bold-FS',
        mode: 0,
        styleName: '1-Bold-FS',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          fontName: 'Arial',
          fontSize: 11,
          nextLineStyleName: 'None',
          strong: true,
          toc: false,
        },
      },
      {
        description: '1-Bold-FS',
        mode: 0,
        styleName: '1-Bold-FS',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          em: true,
          fontName: 'Arial',
          fontSize: 11,
          nextLineStyleName: 'Bold',
          strong: true,
          toc: false,
          underline: true,
        },
      }
    );
    expect(setStyles(customStyleList)).toBeUndefined();
  });

  it('customStyle getCustomStyleByName', () => {
    const result = getCustomStyleByName('BIU');
    const style = {
      description: 'BIU',
      mode: 0,
      styleName: 'BIU',
      styles: {
        align: 'left',
        boldNumbering: true,
        boldSentence: true,
        fontName: 'Arial',
        fontSize: '14',
        isHidden: false,
        nextLineStyleName: 'Default',
        paragraphSpacingAfter: '3',
        toc: false,
      },
    };
    expect(result).toStrictEqual(style);
  });
  it('customStyle getCustomStyleByName', () => {
    const result = getCustomStyleByName('BIU');
    const style = {
      description: 'BIU',
      mode: 0,
      styleName: 'BIU',
      styles: {
        align: 'left',
        boldNumbering: true,
        boldSentence: true,
        fontName: 'Arial',
        fontSize: '14',
        isHidden: false,
        nextLineStyleName: 'Default',
        paragraphSpacingAfter: '3',
        toc: false,
      },
    };
    expect(result).toStrictEqual(style);
  });
  it('isTransparent', () => {
    const bOK = isTransparent('rgba(0,0,0,0)');
    expect(bOK).toBeTruthy();
  });

  it('isTransparent input not given', () => {
    const bOK = isTransparent('');
    expect(bOK).toBeTruthy();
  });

  it('toCSSColor input not given', () => {
    const bOK = toCSSColor('');
    expect(bOK).toBe('');
  });
  //
  it('toCSSColor input  given', () => {
    const bOK = toCSSColor('rgb(174, 208, 230)');
    expect(bOK).toBe('#aed0e6');
  });

  it('toCSSColor input  given as transparent', () => {
    const bOK = toCSSColor('transparent');
    expect(bOK).toBe('rgba(0,0,0,0)');
  });
  it('sanitizeURL with out http url as input', () => {
    const testurl = 'www.google.com';
    const url = sanitizeURL(testurl);
    expect(url).toBe('http://' + testurl);
  });

  it('sanitizeURL with http url as input', () => {
    const testurl = 'http://www.google.com';
    const url = sanitizeURL(testurl);
    expect(url).toBe(testurl);
  });

  it('sanitizeURL with http url as input', () => {
    const url = sanitizeURL();
    expect(url).toBe('http://');
  });
  it('isTransparent', () => {
    const bOK = isTransparent('rgba(0,0,0,0)');
    expect(bOK).toBeTruthy();
  });

  it('isTransparent input not given', () => {
    const bOK = isTransparent('');
    expect(bOK).toBeTruthy();
  });

  it('getHidenumberingFlag in customstyle', () => {
    setHidenumberingFlag(true);
    const bOK = getHidenumberingFlag();
    expect(bOK).toEqual(true);
  });

  it('getCustomStyleByLevel in customstyle', () => {
    const customstyle = [];
    const style = {
      description: 'BIU',
      mode: 0,
      styleName: 'BIU',
      styles: {
        align: 'left',
        boldNumbering: true,
        boldSentence: true,
        fontName: 'Arial',
        fontSize: '14',
        isHidden: false,
        nextLineStyleName: 'Default',
        paragraphSpacingAfter: '3',
        toc: false,
      },
    };
    customstyle.push(
      style,
      {
        description: '1-Bold-FS',
        mode: 0,
        styleName: '1-Bold-FS',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          fontName: 'Arial',
          fontSize: 11,
          hasNumbering: true,
          styleLevel: 2,
          nextLineStyleName: 'None',
          strong: true,
          toc: false,
        },
      },
      {
        description: '1-Bold-FS',
        mode: 0,
        styleName: '1-Bold-FS',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          em: true,
          fontName: 'Arial',
          fontSize: 11,
          nextLineStyleName: 'Bold',
          strong: true,
          toc: false,
          underline: true,
          styleLevel: '1',
        },
      }
    );
    setStyles(customstyle);
    const levelstyle = getCustomStyleByLevel(2);
    const result = {
      description: '1-Bold-FS',
      mode: 0,
      styleName: '1-Bold-FS',
      styles: {
        align: 'left',
        boldNumbering: true,
        boldSentence: true,
        fontName: 'Arial',
        fontSize: 11,
        hasNumbering: true,
        nextLineStyleName: 'None',
        strong: true,
        toc: false,
        styleLevel: 2,
      },
    };
    expect(levelstyle).toEqual(result);
  });

  it('isCustomStyleExists in customstyle', () => {
    const bOK = isCustomStyleExists('aabbcc');
    expect(bOK).toEqual(false);
  });

  it('isCustomStyleExists in customstyle', () => {
    const customstyle = [];
    const style = {
      description: 'BIU',
      mode: 0,
      styleName: 'BIU',
      styles: {
        align: 'left',
        boldNumbering: true,
        boldSentence: true,
        fontName: 'Arial',
        fontSize: '14',
        isHidden: false,
        nextLineStyleName: 'Default',
        paragraphSpacingAfter: '3',
        toc: false,
      },
    };
    customstyle.push(
      style,
      {
        description: '1-Bold-FS',
        mode: 0,
        styleName: '1-Bold-FS',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          fontName: 'Arial',
          fontSize: 11,
          nextLineStyleName: 'None',
          strong: true,
          toc: false,
        },
      },
      {
        description: '1-Bold-Level',
        mode: 0,
        styleName: '1-Bold-Level',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          em: true,
          fontName: 'Arial',
          fontSize: 11,
          nextLineStyleName: 'BIU',
          strong: true,
          toc: false,
          underline: true,
          styleLevel: '1',
        },
      }
    );
    setStyles(customstyle);
    const bOK = isCustomStyleExists('BIU');

    expect(bOK).toEqual(true);
  });

  it('getCustomStyleByName in customstyle', () => {
    const customstyle = [];
    const style = {
      description: 'BIU',
      mode: 0,
      styleName: 'BIU',
      styles: {
        align: 'left',
        boldNumbering: true,
        boldSentence: true,
        fontName: 'Arial',
        fontSize: '14',
        isHidden: false,
        nextLineStyleName: 'Default',
        paragraphSpacingAfter: '3',
        toc: false,
      },
    };
    customstyle.push(
      style,
      {
        description: '1-Bold-FS',
        mode: 0,
        styleName: '1-Bold-FS',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          fontName: 'Arial',
          fontSize: 11,
          nextLineStyleName: 'None',
          strong: true,
          toc: false,
        },
      },
      {
        styleName: 'Normal',
        mode: 0,
        description: 'Normal Style',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          fontName: 'Tahoma',
          fontSize: '12',
          nextLineStyleName: 'Normal',
          paragraphSpacingAfter: '3',
          toc: false,
          isHidden: true,
        },
      }
    );
    setStyles(customstyle);
    const result = getCustomStyleByName('Normal');
    const styleObj = {
      styleName: 'Normal',
      mode: 0,
      description: 'Normal Style',
      styles: {
        align: 'left',
        boldNumbering: true,
        boldSentence: true,
        fontName: 'Tahoma',
        fontSize: '12',
        nextLineStyleName: 'Normal',
        paragraphSpacingAfter: '3',
        toc: false,
        isHidden: true,
      },
    };

    expect(result).toEqual(styleObj);
  });

  it('isStylesLoaded in customstyle', () => {
    const customstyle = [];
    const style = {
      description: 'BIU',
      mode: 0,
      styleName: 'BIU',
      styles: {
        align: 'left',
        boldNumbering: true,
        boldSentence: true,
        fontName: 'Arial',
        fontSize: '14',
        isHidden: false,
        nextLineStyleName: 'Default',
        paragraphSpacingAfter: '3',
        toc: false,
      },
    };
    customstyle.push(
      style,
      {
        description: '1-Bold-FS',
        mode: 0,
        styleName: '1-Bold-FS',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          fontName: 'Arial',
          fontSize: 11,
          nextLineStyleName: 'None',
          strong: true,
          toc: false,
        },
      },
      {
        description: '1-Bold-FS',
        mode: 0,
        styleName: '1-Bold-FS',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          em: true,
          fontName: 'Arial',
          fontSize: 11,
          nextLineStyleName: 'Bold',
          strong: true,
          toc: false,
          underline: true,
          styleLevel: '1',
        },
      }
    );
    setStyles(customstyle);
    const bok = isStylesLoaded();

    expect(bok).toEqual(true);
  });

  it('Remove CustomStyleByName if slice content is null', () => {
    const customcommand = new CustomStyleCommand('NewStyle', 'NewStyle');

    const selection = TextSelection.create(view.state.doc, 0, 1);

    const tr = view.state.tr.setSelection(selection);
    view.updateState(
      view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
    );

    const disp = view.dispatch(tr);
    const handlePasteViewArg = {
      state: view.state,
      dispatch: disp,
    };

    const mockSlice = { content: null };

    view.state.plugins[0].props.handlePaste(
      handlePasteViewArg,
      null,
      mockSlice
    );
    view.state.plugins[0].props.handleDOMEvents.keydown(
      view,
      new KeyboardEvent('enter')
    );

    const res = customcommand.execute(state, view.dispatch, view);

    expect(res).toStrictEqual(true);
  });

  it('Remove CustomStyleByName', () => {
    const customcommand = new CustomStyleCommand('NewStyle', 'NewStyle');

    const selection = TextSelection.create(view.state.doc, 0, 1);

    const tr = view.state.tr.setSelection(selection);
    view.updateState(
      view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
    );

    const disp = view.dispatch(tr);
    const handlePasteViewArg = {
      state: view.state,
      dispatch: disp,
    };
    const mockAttrs = { attr1: 'value1', attr2: 'value2' };
    const mockContent = { attrs: mockAttrs };
    const mockSlice = { content: { content: [mockContent] } };

    view.state.plugins[0].props.handlePaste(
      handlePasteViewArg,
      null,
      mockSlice
    );
    view.state.plugins[0].props.handleDOMEvents.keydown(
      view,
      new KeyboardEvent('enter')
    );

    const res = customcommand.execute(state, view.dispatch, view);

    expect(res).toStrictEqual(true);
  });

  it('execute called in CustomStyleCommand', () => {
    const customcommand = new CustomStyleCommand('BIU', 'BIU');

    const selection = TextSelection.create(view.state.doc, 1, 2);
    const tr = view.state.tr.setSelection(selection);
    view.updateState(
      view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
    );

    view.dispatch(tr);

    const res = customcommand.execute(state, view.dispatch, view);

    expect(res).toStrictEqual(true);
  });

  it('getCustomStyleCommands in CustomStyleCommand', () => {
    const selection = TextSelection.create(view.state.doc, 1, 2);
    const tr = view.state.tr.setSelection(selection);
    view.updateState(
      view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
    );

    view.dispatch(tr);
    const styleprops = {
      align: 'left',
      boldNumbering: true,
      boldSentence: true,
      em: true,
      fontName: 'Arial',
      fontSize: 11,
      nextLineStyleName: 'Bold',
      strong: true,
      toc: false,
      underline: true,
      styleLevel: '1',
      color: '#f20d0d',
      strike: true,
      super: true,
      paragraphSpacingAfter: '2',
      paragraphSpacingBefore: '2',
      textHighlight: '#e87da8',
      indent: '6',
      isLevelbased: true,
      lineHeight: '1.5',
    };
    expect(ccommand.getCustomStyleCommands(styleprops)).toBeDefined();

    const styleprops1 = {
      align: 'left',
      boldNumbering: true,
      boldSentence: true,
      em: false,
      fontName: 'Arial',
      fontSize: 11,
      nextLineStyleName: 'Bold',
      strong: false,
      toc: false,
      underline: false,
      styleLevel: '1',
      color: '#f20d0d',
      strike: false,
      super: false,
      paragraphSpacingAfter: '2',
      paragraphSpacingBefore: '2',
      textHighlight: '#e87da8',
      indent: null,
      isLevelbased: false,
      lineHeight: '1.5',
      styleLevel: false,
    };
    expect(ccommand.getCustomStyleCommands(styleprops1)).toBeDefined();
  });

  it('getMarkByStyleName in CustomStyleCommand', () => {
    const attrs = {
      align: { default: null },
      capco: { default: null },
      color: { default: null },
      id: { default: null },
      indent: { default: null },
      lineSpacing: { default: null },
      paddingBottom: { default: null },
      paddingTop: { default: null },
    };
    // const plugin = new CustomstylePlugin(TestCustomStyleRuntime, false);
    const toDOMMock = jest.spyOn(DOMfunc, 'toCustomStyleDOM');
    toDOMMock.mockImplementation((_base, _node) => {
      return ['p', attrs, 0];
    });
    const effSchema = mockSchema;
    // const { doc, p } = builders(effSchema, { p: { nodeType: 'paragraph' } });
    // const state = EditorState.create({
    //   doc: doc(p('Hello World!!!')),
    //   schema: mockSchema,
    //   plugins: [plugin],
    // });
    // const view = new EditorView(document.querySelector('#editor'), {
    //   state,
    // });
    // const selection = TextSelection.create(view.state.doc, 1, 2);
    // view.state.tr.setSelection(selection);
    // view.updateState(
    //    view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
    // );
    expect(ccommand.getMarkByStyleName('BIU', effSchema)).toBeDefined();
  });
});
describe('UI', () => {
  it('Should get customstyle', () => {
    const styleprops = {
      isHidden: false,
      align: 'left',
      boldNumbering: true,
      boldSentence: true,
      em: true,
      fontName: 'Arial',
      fontSize: '11',
      nextLineStyleName: 'Bold',
      strong: true,
      toc: false,
      underline: true,
      styleLevel: 1,
      color: '#f20d0d',
      strike: true,
      super: true,
      paragraphSpacingAfter: '2',
      paragraphSpacingBefore: '2',
      textHighlight: '#e87da8',
      indent: '6',
      isLevelbased: true,
      lineHeight: '1.5',
    };
    const expected = {
      backgroundColor: '#e87da8',
      color: '#f20d0d',
      fontName: 'Arial',
      fontSize: '11',
      fontStyle: 'italic',
      fontWeight: 'bold',
      lineHeight: '1.5',
      textDecoration: 'underline',
      textDecorationLine: 'line-through',
      verticalAlign: 'super',
    };
    const res = CustStyl.getCustomStyle(styleprops);

    expect(res).toStrictEqual(expected);
  });
});

describe('Style Plugin Execute', () => {
  const testData = ['none', 'newstyle', 'editall', 'clearstyle'];
  test.each(testData)('myFunc work correctly for %s', (val) => {
    jest.spyOn(DOMfunc, 'toCustomStyleDOM').mockReturnValue(['p', attrs, 0]);
    //    toDOMMock.mockImplementation((_base, _node) => {
    //     //   return ['p', attrs, 0];
    //     // });
    const plugin = new CustomstylePlugin(TestCustomStyleRuntime, false);
    const effSchema = mockSchema;
    const { doc, p } = builders(effSchema, { p: { nodeType: 'paragraph' } });
    const state = EditorState.create({
      doc: doc(p('Hello World!!!')),
      schema: mockSchema,
      plugins: [plugin],
    });
    const view = { dispatch: () => { return {}; } }

    if (val != 'none') {
      const customcommand = new CustomStyleCommand(val, val);
      // const selection = TextSelection.create(view.state.doc, 1, 2);
      // view.state.tr.setSelection(selection);
      // view.updateState(
      //   view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
      // );
      const res = customcommand.execute(state, view.dispatch, view);
      if (val != 'clearstyle') {
        expect(res).toStrictEqual(false);
      } else {
        expect(res).toStrictEqual(true);
      }
    } else {
      const customcommand = new CustomStyleCommand(val, val);
      //     const selection = TextSelection.create(view.state.doc, 1, 2);
      //     view.state.tr.setSelection(selection);
      //     view.updateState(
      //       view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
      //     );
      //     // view.dispatch(tr);
      const res = customcommand.execute(state, view.dispatch, view);
      if (val != 'clearstyle') {
        expect(res).toStrictEqual(true);
      } else {
        //expect(res).toStrictEqual(true);
      }
    }
  });
});

describe('Custom Style Plugin pass', () => {
  const observedElement = document.createElement('div');

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        // The docChange event has been dispatched
        console.log('docChange event dispatched!');
      }
    });
  });

  observer.observe(observedElement, { childList: true });

  const newNode = document.createElement('div');
  observedElement.appendChild(newNode); // This will trigger the docChange event

  jest.mock('./index', () => {
    const originalModule = jest.requireActual('./index');
    return {
      ...originalModule,
      __esModule: true,
      default: {
        ...originalModule.default,
        isDocChanged: jest.fn(() => true),
      },
    };
  });
  const plugin = new CustomstylePlugin(TestCustomStyleRuntime);
  const editor = createEditor(doc(p('<cursor>')), {
    plugins: [plugin],
  });

  const cusStyle = require('./customStyle');

  const isStylesLoadedMock = jest.spyOn(cusStyle, 'isStylesLoaded');
  isStylesLoadedMock.mockImplementation(() => {
    return true;
  });

  const state = EditorState.create({
    doc: doc(p('Hello World!!!')),
    schema: mockSchema,
    selection: editor.selection,
    plugins: [new CustomstylePlugin(TestCustomStyleRuntime)],
  });

  const selection = TextSelection.create(editor.view.state.doc, 0, 0);
  const tr = editor.view.state.tr.setSelection(selection);
  editor.view.updateState(editor.view.state.reconfigure({ plugins: [plugin] }));

  editor.view.dispatch(tr);

  it('Test 1 ', () => {
    const props = {
      dispatch: () => { },
      editorState: state,
      editorView: editor.view,
    };
    expect(new CustomstyleDropDownCommand(props)).toBeDefined();
  });
  it('should call uuid', () => {
    const id = uuid();
    expect(id).toBeDefined();
  });
});

describe('Cus Style Plugin-Pass', () => {
  const styl = {
    styleName: 'A_12',
    mode: 1,
    styles: {
      align: 'left',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'A_12',
      fontName: 'Aclonica',
      fontSize: '14',
      strong: true,
      styleLevel: '2',
      hasBullet: true,
      bulletLevel: '272A',
      hasNumbering: false,
    },
    toc: false,
    isHidden: false,
  };
  const styl2 = {
    styleName: 'A_123',
    mode: 1,
    styles: {
      align: 'left',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'A_12',
      fontName: 'Aclonica',
      fontSize: '14',
      strong: true,
      styleLevel: '2',
      hasBullet: true,
      bulletLevel: '272A',
      hasNumbering: false,
    },
    toc: false,
    isHidden: false,
  };

  const styleruntime = {
    saveStyle: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
    getStylesAsync: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
    renameStyle: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
    removeStyle: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
    fetchStyles: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
    buildRoute: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
  };
  const plugin = new CustomstylePlugin(styleruntime, true);

  const mockSchema = {
    nodes: {
      doc: {
        content: 'paragraph+',
      },
      paragraph: {
        attrs: {
          align: {
            default: null,
          },
          color: {
            default: null,
          },
          id: {
            default: null,
          },
          indent: {
            default: null,
          },
          lineSpacing: {
            default: null,
          },
          paddingBottom: {
            default: null,
          },
          paddingTop: {
            default: null,
          },
          capco: {
            default: null,
          },
        },
        content: 'inline*',
        group: 'block',
        parseDOM: [
          {
            tag: 'p',
          },
        ],
      },
    },
    marks: {
      link: {
        attrs: {
          href: 'test_href',
        },
      },
      em: {
        parseDOM: [
          {
            tag: 'i',
          },
          {
            tag: 'em',
          },
          {
            style: 'font-style=italic',
          },
        ],
        attrs: {
          overridden: {
            hasDefault: true,
            default: false,
          },
        },
      },
      strong: {
        parseDOM: [
          {
            tag: 'strong',
          },
          {
            tag: 'b',
          },
          {
            style: 'font-weight',
          },
        ],
        attrs: {
          overridden: {
            hasDefault: true,
            default: false,
          },
        },
      },
      underline: {
        parseDOM: [
          {
            tag: 'u',
          },
          {
            style: 'text-decoration-line',
          },
          {
            style: 'text-decoration',
          },
        ],
        attrs: {
          overridden: {
            hasDefault: true,
            default: false,
          },
        },
      },
    },
    spec: {
      nodes: {
        doc: {
          content: 'paragraph+',
        },
        content: [
          'doc',
          {
            attrs: {
              layout: {
                default: null,
              },
              padding: {
                default: null,
              },
              width: {
                default: null,
              },
              counterFlags: {
                default: null,
              },
              capcoMode: {
                default: 0,
              },
            },
            content: 'block+',
          },
          'paragraph',
          {
            attrs: {
              align: {
                default: null,
              },
              color: {
                default: null,
              },
              id: {
                default: null,
              },
              indent: {
                default: null,
              },
              lineSpacing: {
                default: null,
              },
              paddingBottom: {
                default: null,
              },
              paddingTop: {
                default: null,
              },
              capco: {
                default: null,
              },
            },
            content: 'inline*',
            group: 'block',
            parseDOM: [
              {
                tag: 'p',
              },
            ],
          },
          'blockquote',
          {
            attrs: {
              align: {
                default: null,
              },
              color: {
                default: null,
              },
              id: {
                default: null,
              },
              indent: {
                default: null,
              },
              lineSpacing: {
                default: null,
              },
              paddingBottom: {
                default: null,
              },
              paddingTop: {
                default: null,
              },
              capco: {
                default: null,
              },
            },
            content: 'inline*',
            group: 'block',
            parseDOM: [
              {
                tag: 'blockquote',
              },
            ],
            defining: true,
          },
          'horizontal_rule',
          {
            attrs: {
              pageBreak: {
                default: null,
              },
            },
            group: 'block',
            parseDOM: [
              {
                tag: 'hr',
              },
            ],
          },
          'heading',
          {
            attrs: {
              align: {
                default: null,
              },
              color: {
                default: null,
              },
              id: {
                default: null,
              },
              indent: {
                default: null,
              },
              lineSpacing: {
                default: null,
              },
              paddingBottom: {
                default: null,
              },
              paddingTop: {
                default: null,
              },
              level: {
                default: 1,
              },
              capco: {
                default: null,
              },
            },
            content: 'inline*',
            group: 'block',
            parseDOM: [
              {
                tag: 'h1',
              },
              {
                tag: 'h2',
              },
              {
                tag: 'h3',
              },
              {
                tag: 'h4',
              },
              {
                tag: 'h5',
              },
              {
                tag: 'h6',
              },
            ],
            defining: true,
          },
          'text',
          {
            group: 'inline',
          },
          'math',
          {
            inline: true,
            attrs: {
              align: {
                default: null,
              },
              latex: {
                default: '',
              },
            },
            group: 'inline',
            draggable: true,
            parseDOM: [
              {
                tag: 'math[data-latex]',
              },
              {
                tag: 'span[data-latex]',
              },
            ],
          },
          'hard_break',
          {
            inline: true,
            group: 'inline',
            selectable: false,
            parseDOM: [
              {
                tag: 'br',
              },
            ],
          },
          'bullet_list',
          {
            attrs: {
              id: {
                default: null,
              },
              indent: {
                default: 0,
              },
              listStyleType: {
                default: null,
              },
            },
            group: 'block',
            content: 'list_item+',
            parseDOM: [
              {
                tag: 'ul',
              },
            ],
          },
          'ordered_list',
          {
            attrs: {
              id: {
                default: null,
              },
              counterReset: {
                default: null,
              },
              indent: {
                default: 0,
              },
              following: {
                default: null,
              },
              listStyleType: {
                default: null,
              },
              name: {
                default: null,
              },
              start: {
                default: 1,
              },
              type: {
                default: 'decimal',
              },
              styleName: {
                default: 'None',
              },
            },
            group: 'block',
            content: 'list_item+',
            parseDOM: [
              {
                tag: 'ol',
              },
            ],
          },
          'list_item',
          {
            attrs: {
              align: {
                default: null,
              },
            },
            content: 'paragraph block*',
            parseDOM: [
              {
                tag: 'li',
              },
            ],
          },
          'bookmark',
          {
            inline: true,
            attrs: {
              id: {
                default: null,
              },
              visible: {
                default: null,
              },
            },
            group: 'inline',
            draggable: true,
            parseDOM: [
              {
                tag: 'a[data-bookmark-id]',
              },
            ],
          },
          'table',
          {
            content: 'table_row+',
            tableRole: 'table',
            isolating: true,
            group: 'block',
            parseDOM: [
              {
                tag: 'table',
                style: 'border',
              },
            ],
            attrs: {
              marginLeft: {
                default: null,
              },
              vignette: {
                default: false,
              },
            },
          },
          'table_row',
          {
            content: '(table_cell | table_header)*',
            tableRole: 'row',
            parseDOM: [
              {
                tag: 'tr',
              },
            ],
          },
          'table_cell',
          {
            content: 'block+',
            attrs: {
              colspan: {
                default: 1,
              },
              rowspan: {
                default: 1,
              },
              colwidth: {
                default: null,
              },
              borderColor: {
                default: null,
              },
              background: {
                default: null,
              },
              vignette: {
                default: false,
              },
            },
            tableRole: 'cell',
            isolating: true,
            parseDOM: [
              {
                tag: 'td',
              },
            ],
          },
          'table_header',
          {
            content: 'block+',
            attrs: {
              colspan: {
                default: 1,
              },
              rowspan: {
                default: 1,
              },
              colwidth: {
                default: null,
              },
              borderColor: {
                default: null,
              },
              background: {
                default: null,
              },
            },
            tableRole: 'header_cell',
            isolating: true,
            parseDOM: [
              {
                tag: 'th',
              },
            ],
          },
        ],
        text: {},
        paragraph: {
          content: 'text*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0];
          },
        },
      },
      marks: {
        content: [
          'link',
          {
            attrs: {
              href: { default: null },
              rel: { default: 'noopener noreferrer nofollow' },
              target: { default: 'blank' },
              title: { default: null },
            },
            inclusive: false,
            parseDOM: [{ tag: 'a[href]' }],
          },
        ],
      },
    },
  };
  for (const nodeType in mockSchema.nodes) {
    if (Object.prototype.hasOwnProperty.call(mockSchema.nodes, nodeType)) {
      const nodeSpec = mockSchema.nodes[nodeType];
      const validContent = [];
      for (let i = 0; i < nodeSpec.content.length; i++) {
        const type = nodeSpec.content[i];
        if (typeof type === 'string') {
          validContent.push(type);
        } else {
          validContent.push(type.name);
        }
      }
      nodeSpec.validContent = validContent;
    }
  }

  it('should be defined', () => {
    expect(plugin).toBeDefined();
  });
  it('should handle initButtonCommands', () => {
    expect(plugin.initButtonCommands()).toBeDefined();
  });

  it('resetTheDefaultStyleNameToNone should return RESERVED_STYLE_NONE when styleName is default', () => {
    expect(resetTheDefaultStyleNameToNone('Default')).toBe('Normal');
  });
  it('should return newAttrs when RESERVED_STYLE_NONE  is nextLineStyle  ', () => {
    const newattrs = {
      align: 'left',
      color: null,
      id: '',
      indent: null,
      lineSpacing: null,
      paddingBottom: null,
      paddingTop: null,
      capco: null,
      styleName: 'A11-Rename',
    };
    expect(setNodeAttrs('Normal', newattrs)).toStrictEqual({
      align: 'left',
      capco: null,
      color: null,
      id: '',
      indent: null,
      lineSpacing: null,
      paddingBottom: null,
      paddingTop: null,
      styleName: 'Normal',
    });
  });
  it('should return newAttrs when RESERVED_STYLE_NONE  is not nextLineStyle  ', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue({
      styles: { indent: 10, align: 'left', lineHeight: '10' },
    });
    const newattrs = {
      align: 'left',
      color: null,
      id: '',
      indent: null,
      lineSpacing: null,
      paddingBottom: null,
      paddingTop: null,
      capco: null,
      styleName: 'A11-Rename',
    };
    expect(setNodeAttrs('test', newattrs)).toStrictEqual({
      align: 'left',
      capco: null,
      color: null,
      id: '',
      indent: 10,
      lineSpacing: '125%',
      paddingBottom: null,
      paddingTop: null,
      styleName: 'test',
    });
  });
  it('should return newAttrs when RESERVED_STYLE_NONE  is not nextLineStyle branch coverage  ', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue({
      styles: { indent: 10, align: 'left', lineHeight: null },
    });
    const newattrs = {
      align: 'left',
      color: null,
      id: '',
      indent: null,
      lineSpacing: null,
      paddingBottom: null,
      paddingTop: null,
      capco: null,
      styleName: 'A11-Rename',
    };
    expect(setNodeAttrs('test', newattrs)).toStrictEqual({
      align: 'left',
      capco: null,
      color: null,
      id: '',
      indent: 10,
      lineSpacing: '125%',
      paddingBottom: null,
      paddingTop: null,
      styleName: 'test',
    });
  });
  it('should handle setNodeAttrs when nextLineStyleName is null ', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue({
      styles: { indent: 10, align: 'left', lineHeight: null },
    });
    const newattrs = {
      align: 'left',
      color: null,
      id: '',
      indent: null,
      lineSpacing: null,
      paddingBottom: null,
      paddingTop: null,
      capco: null,
      styleName: 'A11-Rename',
    };
    expect(setNodeAttrs(null, newattrs)).toStrictEqual(newattrs);
  });
  it('should handle setNodeAttrs when nextLineStyleName is not normal ', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue(null);
    const newattrs = {
      align: 'left',
      color: null,
      id: '',
      indent: null,
      lineSpacing: null,
      paddingBottom: null,
      paddingTop: null,
      capco: null,
      styleName: 'A11-Rename',
    };
    expect(setNodeAttrs('test', newattrs)).toStrictEqual(newattrs);
  });

  it('should handle applyStyleForNextParagraph', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue({
      styles: {
        indent: 10,
        align: 'left',
        lineHeight: null,
        nextLineStyleName: 'Normal',
      },
    });
    jest
      .spyOn(ccommand, 'getMarkByStyleName')
      .mockReturnValue([
        { type: 'mark-font-type', attrs: { name: 'Arial', overridden: false } },
      ]);
    const schema1 = new Schema({
      nodes: {
        doc: {
          attrs: {
            layout: { default: null },
            padding: { default: null },
            width: { default: null },
            counterFlags: { default: null },
            capcoMode: { default: 0 },
          },
          content: 'paragraph+',
        },
        paragraph: {
          attrs: {
            align: { default: 'left' },
            color: { default: null },
            id: { default: null },
            indent: { default: null },
            lineSpacing: { default: null },
            paddingBottom: { default: null },
            paddingTop: { default: null },
            capco: { default: null },
            styleName: { default: 'AFDP Bullet' },
          },
          content: 'text*',
          marks: '',
        },
        text: {
          marks: 'mark-font-size mark-font-type',
        },
      },
      marks: {
        'mark-font-size': {
          attrs: {
            pt: { default: 11 },
            overridden: { default: false },
          },
        },
        'mark-font-type': {
          attrs: {
            name: { default: 'Arial' },
            overridden: { default: false },
          },
        },
      },
    });

    // Create an empty document with the provided JSON as content
    //const content = schema1.nodeFromJSON(yourJSON.doc);
    const prevstate = {
      schema: schema1,
      doc: schema1.nodeFromJSON({
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0,
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'text',
                marks: [],
                text: 'Your text here previous',
              },
            ],
          },
        ],
      }),
      selection: { from: 2, to: 4 },
    };

    const schema2 = new Schema({
      nodes: {
        doc: {
          attrs: {
            layout: { default: null },
            padding: { default: null },
            width: { default: null },
            counterFlags: { default: null },
            capcoMode: { default: 0 },
          },
          content: 'paragraph+',
        },
        paragraph: {
          attrs: {
            align: { default: 'left' },
            color: { default: null },
            id: { default: null },
            indent: { default: null },
            lineSpacing: { default: null },
            paddingBottom: { default: null },
            paddingTop: { default: null },
            capco: { default: null },
            styleName: { default: 'AFDP Bullet' },
          },
          content: 'text*',
          marks: '',
        },
        hard_break: {
          inline: true,
          group: 'inline',
          selectable: false,
          parseDOM: [{ tag: 'br' }],
          toDOM() {
            return ['br'];
          },
        },
        text: {
          marks: 'mark-font-size mark-font-type',
        },
      },
      marks: {
        'mark-font-size': {
          attrs: {
            pt: { default: 11 },
            overridden: { default: false },
          },
        },
        'mark-font-type': {
          attrs: {
            name: { default: 'Arial' },
            overridden: { default: false },
          },
        },
      },
    });

    // Create an empty document with the provided JSON as content
    //const content2 = schema2.nodeFromJSON(yourJSON.doc);

    // Create the editor state with the schema and content
    const nextstate = {
      schema: schema2,
      doc: schema2.nodeFromJSON({
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0,
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'text',
                marks: [],
                text: 'N',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'text',
                marks: [],
                text: 'N',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'text',
                marks: [],
                text: 'N',
              },
            ],
          },
        ],
      }),
      selection: { from: 4, to: 8 },
    };

    const schema3 = new Schema({
      nodes: {
        doc: {
          attrs: {
            layout: { default: null },
            padding: { default: null },
            width: { default: null },
            counterFlags: { default: null },
            capcoMode: { default: 0 },
          },
          content: 'paragraph+',
        },
        paragraph: {
          attrs: {
            align: { default: 'left' },
            color: { default: null },
            id: { default: null },
            indent: { default: null },
            lineSpacing: { default: null },
            paddingBottom: { default: null },
            paddingTop: { default: null },
            capco: { default: null },
            styleName: { default: 'AFDP Bullet' },
          },
          content: 'text*',
          marks: '',
        },
        text: {
          marks: 'mark-font-size mark-font-type',
        },
      },
      marks: {
        'mark-font-size': {
          attrs: {
            pt: { default: 11 },
            overridden: { default: false },
          },
        },
        'mark-font-type': {
          attrs: {
            name: { default: 'Arial' },
            overridden: { default: false },
          },
        },
      },
    });
    nextstate.tr = {
      setNodeMarkup: () => {
        return {};
      },
    };

    // Create an empty document with the provided JSON as content
    //const content = schema.nodeFromJSON(yourJSON.doc);

    // Create the editor state with the schema, content, selection, and stored marks
    const mockState = {
      schema: schema3,
      doc: schema3.nodeFromJSON({
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0,
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'text',
                marks: [],
                text: 'Your text here',
              },
            ],
          },
        ],
      }),
    };
    const editorContainer = document.createElement('div');
    document.body.appendChild(editorContainer);

    // Create an editor view with the EditorState and the HTML element
    const mockview = {
      state: mockState,
      input: { lastKeyCode: 13 },
    };

    const schematr = new Schema({
      nodes: {
        doc: {
          content: 'paragraph+',
        },
        paragraph: {
          content: 'text*',
          attrs: {
            align: { default: 'left' },
            color: { default: null },
            id: { default: null },
            indent: { default: null },
            lineSpacing: { default: null },
            paddingBottom: { default: null },
            paddingTop: { default: null },
            capco: { default: null },
            styleName: { default: 'AFDP Bullet' },
          },
          parseDOM: [{ tag: 'p' }],
          toDOM(_node) {
            return ['p', 0];
          },
        },
        text: {
          marks: 'mark-font-size mark-font-type',
          parseDOM: [{ tag: 'span' }],
          toDOM() {
            return ['span', 0];
          },
        },
      },
      marks: {
        'mark-font-size': {
          attrs: {
            pt: { default: 11 },
            overridden: { default: false },
          },
          parseDOM: [
            {
              style: 'font-size',
              getAttrs(value) {
                return { pt: parseInt(value), overridden: false };
              },
            },
          ],
          toDOM(mark) {
            return ['span', { style: `font-size: ${mark.attrs.pt}px` }, 0];
          },
        },
        'mark-font-type': {
          attrs: {
            name: { default: 'Arial' },
            overridden: { default: false },
          },
          parseDOM: [
            {
              style: 'font-family',
              getAttrs(value) {
                return { name: value, overridden: false };
              },
            },
          ],
          toDOM(mark) {
            return ['span', { style: `font-family: ${mark.attrs.name}` }, 0];
          },
        },
      },
    });
    const transaction1 = new Transaction(schematr);

    const json = {
      doc: {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0,
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 11,
                      overridden: false,
                    },
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Arial',
                      overridden: false,
                    },
                  },
                ],
                text: 'gdsdfgfhfgsh',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: 'TBD',
              styleName: 'AFDP Bullet',
            },
          },
        ],
      },
      steps: [],
      docs: [],
      mapping: {
        maps: [],
        from: 0,
        to: 0,
      },
      curSelectionFor: 0,
      updated: 0,
      meta: {},
      time: 1685513344299,
      curSelection: {
        type: 'text',
        anchor: 15,
        head: 15,
      },
      storedMarks: null,
    };

    transaction1.doc = schematr.nodeFromJSON(json.doc);
    transaction1.addStoredMark = (_x) => {
      return {};
    };
    transaction1.storedMarks = json.storedMarks;
    transaction1.setNodeMarkup = (_a, _b, _c) => {
      return transaction1;
    };

    expect(
      applyStyleForNextParagraph(prevstate, nextstate, transaction1, mockview)
    ).toBeDefined();
    const nextstate1 = {
      schema: schema2,
      doc: schema2.nodeFromJSON({
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0,
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [],
          },
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [],
          },
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [],
          },
        ],
      }),
      selection: { from: 3, to: 8 },
    };
    const prevstate1 = {
      schema: schema1,
      doc: schema1.nodeFromJSON({
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0,
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'text',
                marks: [],
                text: 'Your text here previous',
              },
            ],
          },
        ],
      }),
      selection: { from: 1, to: 4 },
    };
    expect(
      applyStyleForNextParagraph(prevstate1, nextstate1, transaction1, mockview)
    ).toBeDefined();
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue({
      styles: {
        indent: 10,
        align: 'left',
        lineHeight: null,
        nextLineStyleName: null,
      },
    });
    expect(
      applyStyleForNextParagraph(prevstate1, nextstate1, transaction1, mockview)
    ).toBeNull();
    expect(
      applyStyleForNextParagraph(prevstate1, nextstate1, null, mockview)
    ).toBeDefined();
    expect(
      applyStyleForNextParagraph(prevstate1, nextstate1, null, null)
    ).toBeDefined();
    expect(
      applyStyleForNextParagraph({}, {}, {}, { input: { lastKeyCode: 10 } })
    ).toBeDefined();
    expect(nodeAssignment(prevstate)).toBeDefined();
    const schemamhod = new Schema({
      nodes: {
        doc: {
          attrs: {
            layout: { default: null },
            padding: { default: null },
            width: { default: null },
            counterFlags: { default: null },
            capcoMode: { default: 0 },
          },
          content: 'paragraph+',
        },
        paragraph: {
          attrs: {
            align: { default: 'left' },
            color: { default: null },
            id: { default: null },
            indent: { default: null },
            lineSpacing: { default: null },
            paddingBottom: { default: null },
            paddingTop: { default: null },
            capco: { default: null },
            styleName: { default: 'AFDP Bullet' },
          },
          content: 'inline*',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0];
          },
        },
        image: {
          attrs: {
            src: {},
            alt: { default: '' },
            title: { default: null },
            styleName: { default: null },
          },
          inline: true,
          group: 'inline',
          draggable: true,
          parseDOM: [
            {
              tag: 'img[src]',
              getAttrs(dom) {
                return {
                  src: dom.getAttribute('src'),
                  alt: dom.getAttribute('alt'),
                  title: dom.getAttribute('title'),
                  styleName: dom.getAttribute('styleName'),
                };
              },
            },
          ],
          toDOM(node) {
            const { src, alt, title, styleName } = node.attrs;
            return ['img', { src, alt, title, styleName }];
          },
        },
        text: {
          marks: 'mark-font-size mark-font-type',
        },
      },
      marks: {
        'mark-font-size': {
          attrs: {
            pt: { default: 11 },
            overridden: { default: false },
          },
        },
        'mark-font-type': {
          attrs: {
            name: { default: 'Arial' },
            overridden: { default: false },
          },
        },
      },
    });

    // Create an empty document with the provided JSON as content
    //const content = schema1.nodeFromJSON(yourJSON.doc);
    const prevstatemhod = {
      schema: schemamhod,
      doc: schemamhod.nodeFromJSON({
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0,
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'image',
                attrs: {
                  src: 'path/to/image.jpg',
                  alt: 'Image Alt Text',
                  title: 'Image Title',
                  styleName: '2',
                },
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'image',
                attrs: {
                  src: 'path/to/image.jpg',
                  alt: 'Image Alt Text',
                  title: 'Image Title',
                  styleName: '2',
                },
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'image',
                attrs: {
                  src: 'path/to/image.jpg',
                  alt: 'Image Alt Text',
                  title: 'Image Title',
                  styleName: '2',
                },
              },
            ],
          },
        ],
      }),
      selection: { from: 2, to: 4 },
    };
    const mockview1 = {
      state: mockState,
      input: { lastKeyCode: 46 },
    };
    const spymhod = jest.spyOn(ccommand, 'getStyleLevel').mockReturnValue('2');
    jest.spyOn(CustStyl, 'getCustomStyleByLevel').mockReturnValue({
      styles: {
        indent: 10,
        align: 'left',
        lineHeight: null,
        nextLineStyleName: 'Normal',
      },
    });
    expect(
      manageHierarchyOnDelete(prevstatemhod, nextstate, null, mockview1)
    ).toBeDefined();
    spymhod.mockClear();
    const mockview2 = {
      state: mockState,
      input: { lastKeyCode: 8 },
    };
    expect(
      manageHierarchyOnDelete(prevstatemhod, nextstate, null, mockview2)
    ).toBeDefined();
    const nextstatemhod = {
      schema: schema2,
      doc: schema2.nodeFromJSON({
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0,
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'text',
                marks: [],
                text: 'N',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'text',
                marks: [],
                text: 'N',
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              align: 'left',
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'AFDP Bullet',
            },
            content: [
              {
                type: 'text',
                marks: [],
                text: 'N',
              },
            ],
          },
        ],
      }),
      selection: { from: 0, to: 8 },
    };
    expect(
      manageHierarchyOnDelete(
        prevstatemhod,
        nextstatemhod,
        transaction1,
        mockview2
      )
    ).toBeDefined();
    //expect(manageHierarchyOnDelete({doc:{key:'value'}},{selection:{from:0},doc:{key:'value'}},transaction1,mockview2)).toBeDefined();
  });
  it('should handle manageHierarchyOnDelete when prevState.doc === nextState.doc', () => {
    expect(
      manageHierarchyOnDelete(
        { doc: 1 },
        { selection: { from: 0 }, doc: 1 },
        {},
        {}
      )
    ).toBeDefined();
  });
});
describe('applyNormalIfNoStyle', () => {
  it('should handle applyNormalIfNoStyle when tr is not present', () => {
    const linkmark = new Mark({
      name: 'link',
    });

    const mockschema = new Schema({
      nodes: {
        doc: {
          content: 'paragraph+',
        },
        paragraph: {
          content: 'text*',
          attrs: {
            styleName: { default: 'test' },
          },
          toDOM() {
            return ['p', 0];
          },
        },
        heading: {
          attrs: { level: { default: 1 }, styleName: { default: '' } },
          content: 'inline*',
          marks: '',
          toDOM(node) {
            return [
              'h' + node.attrs.level,
              { 'data-style-name': node.attrs.styleName },
              0,
            ];
          },
        },
        text: {
          group: 'inline',
        },
      },
      marks: {
        link: linkmark,
      },
    });

    // Create a sample document
    const mockdoc = mockschema.nodeFromJSON({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, styleName: 'Normal' },
          content: [
            {
              type: 'text',
              text: 'Hello, ProseMirror!',
            },
          ],
          marks: [
            // Example mark that satisfies the condition
            { type: 'link', attrs: { ['overridden']: true } },
          ],
        },
      ],
    });
    expect(applyNormalIfNoStyle({}, null, mockdoc, true)).toBe(undefined);
  });
});

describe('onInitAppendTransaction', () => {
  it('it should handle onInitAppendTransaction when isStylesLoaded = false', () => {
    jest.spyOn(CustStyl, 'isStylesLoaded').mockReturnValue(false);
    expect(onInitAppendTransaction({ loaded: false }, {}, {})).toStrictEqual(
      {}
    );
  });
});

describe('onUpdateAppendTransaction', () => {
  it('should handle onUpdateAppendTransaction when slice1 is null', () => {
    const linkmark = new Mark({
      name: 'link',
    });

    const mockschema = new Schema({
      nodes: {
        doc: {
          content: 'paragraph+',
        },
        paragraph: {
          content: 'text*',
          attrs: {
            styleName: { default: 'test' },
          },
          toDOM() {
            return ['p', 0];
          },
        },
        heading: {
          attrs: { level: { default: 1 }, styleName: { default: '' } },
          content: 'inline*',
          marks: '',
          toDOM(node) {
            return [
              'h' + node.attrs.level,
              { 'data-style-name': node.attrs.styleName },
              0,
            ];
          },
        },
        text: {
          group: 'inline',
        },
      },
      marks: {
        link: linkmark,
      },
    });

    // Create a sample document
    const mockdoc = mockschema.nodeFromJSON({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, styleName: 'Normal' },
          content: [
            {
              type: 'text',
              text: 'Hello, ProseMirror!',
            },
          ],
          marks: [
            // Example mark that satisfies the condition
            { type: 'link', attrs: { ['overridden']: true } },
          ],
        },
      ],
    });
    expect(
      onUpdateAppendTransaction(
        { firstTime: false },
        { doc: mockdoc },
        {
          selection: {
            $cursor: { pos: 0 },
            $from: {
              before: () => {
                return 0;
              },
            },
            $to: {
              after: () => {
                return 1;
              },
            },
          },
          tr: {
            doc: {
              nodeAt: () => {
                return {};
              },
            },
            scrollIntoView: () => {
              return {};
            },
          },
          doc: mockdoc,
        },
        {
          selection: {
            $from: {
              before: () => {
                return 0;
              },
            },
            $to: {
              after: () => {
                return 1;
              },
            },
          },
          tr: {
            doc: {
              nodeAt: () => {
                return { key: 'tr' };
              },
            },
          },
          doc: mockdoc,
        },
        null,
        {},
        null
      )
    ).toBeDefined();
  });
  it('should handle onUpdateAppendTransaction when slice1 is null', () => {
    const linkmark = new Mark({
      name: 'link',
    });

    const mockschema = new Schema({
      nodes: {
        doc: {
          content: 'paragraph+',
        },
        paragraph: {
          content: 'text*',
          attrs: {
            styleName: { default: 'test' },
          },
          toDOM() {
            return ['p', 0];
          },
        },
        heading: {
          attrs: { level: { default: 1 }, styleName: { default: '' } },
          content: 'inline*',
          marks: '',
          toDOM(node) {
            return [
              'h' + node.attrs.level,
              { 'data-style-name': node.attrs.styleName },
              0,
            ];
          },
        },
        text: {
          group: 'inline',
        },
      },
      marks: {
        link: linkmark,
      },
    });

    // Create a sample document
    const mockdoc = mockschema.nodeFromJSON({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, styleName: 'Normal' },
          content: [
            {
              type: 'text',
              text: 'Hello, ProseMirror!',
            },
          ],
          marks: [
            // Example mark that satisfies the condition
            { type: 'link', attrs: { ['overridden']: true } },
          ],
        },
      ],
    });
    expect(
      onUpdateAppendTransaction(
        { firstTime: false },
        {
          doc: mockdoc,
          selection: {
            $from: {
              $start: () => {
                return 1;
              },
              $end: () => {
                return 1;
              },
            },
          },
        },
        {
          selection: {
            $cursor: { pos: 0 },
            $from: {
              before: () => {
                return 0;
              },
              $start: () => {
                return 1;
              },
              $end: () => {
                return 1;
              },
            },
            $to: {
              after: () => {
                return 1;
              },
            },
          },
          tr: {
            doc: {
              nodeAt: () => {
                return {};
              },
            },
            scrollIntoView: () => {
              return {};
            },
            selection: {
              $from: {
                start: () => {
                  return 1;
                },
                end: () => {
                  return 2;
                },
              },
            },
          },
          doc: mockdoc,
        },
        {
          selection: {
            $from: {
              before: () => {
                return 0;
              },
            },
            $to: {
              after: () => {
                return 1;
              },
            },
          },
          tr: {
            doc: {
              nodeAt: () => {
                return { key: 'tr' };
              },
            },
          },
          doc: mockdoc,
        },
        { input: { lastKeyCode: 13 } },
        {},
        null
      )
    ).toBeDefined();
  });
});

describe('applyStyleForEmptyParagraph', () => {
  it('applyStyleForEmptyParagraph', () => {
    expect(
      applyStyleForEmptyParagraph(
        {
          selection: {
            $from: {
              before: () => {
                return 1;
              },
            },
            $to: {
              after: () => {
                return 2;
              },
            },
          },
          tr: {
            doc: {
              nodeAt: () => {
                return {};
              },
            },
          },
        },
        {
          doc: {
            nodeAt: () => {
              return {};
            },
          },
        }
      )
    ).toBeDefined();
  });
});
describe('remapCounterFlags', () => {
  it('should handle remapCounterFlags', () => {
    const tr = { doc: { attrs: { counterFlags: { key: {} } } } };
    expect(remapCounterFlags(tr)).toBeUndefined();
  });
});
