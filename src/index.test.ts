import { createEditor, doc, p } from 'jest-prosemirror';
import * as CustStyl from './customStyle';
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
  remapCounterFlags,
  applyStyleForPreviousEmptyParagraph,
  applyStyles,
  applyStyleForEmptyParagraph,
  isDocChanged,
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
import { Schema, Mark, Node, Slice, ResolvedPos } from 'prosemirror-model';
import { isTransparent, toCSSColor } from './toCSSColor';
import { EditorView } from 'prosemirror-view';
import * as DOMfunc from './CustomStyleNodeSpec';

import { CustomStyleCommand } from './CustomStyleCommand';
import * as ccommand from './CustomStyleCommand.js';
import { Style } from './StyleRuntime.js';

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

  marks: {
    link: {
      attrs: {},
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
          default: false,
        },
      },
    },
    'mark-text-color': {
      attrs: {
        overridden: {
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
        //  highlightColor: '',
        overridden: {
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
        return ['span', { highlightColor: '' }, 0];
      },
    },
    'mark-font-size': {
      attrs: {
        pt: {
          default: null,
        },
        overridden: {
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
      toDOM() {
        return ['Test Mark'];
      },
    },
    'mark-font-type': {
      attrs: {
        overridden: {
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
  },
});

describe('applyNormalIfNoStyle', () => {
  it('should handle applyNormalIfNoStyle when tr is not present', () => {
    const linkmark = new Mark();
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
          marks: [{ type: 'link', attrs: { ['overridden']: true } }],
        },
      ],
    });
    expect(applyNormalIfNoStyle({}, null, mockdoc, true)).toBe(undefined);
  });



  it('should handle applyNormalIfNoStyle when tr is present', () => {
    const linkmark = new Mark();
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
        fontName: {
          create: () => {
            return {};
          },
        },
        'mark-font-type': {
          create: () => {
            return {};
          },
        },
        'mark-font-size': {
          create: () => {
            return {};
          },
        },
      },
    });

    const mockdoc = mockschema.nodeFromJSON({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { level: 1, styleName: 'Normal' },
          content: [
            {
              type: 'text',
              text: 'Hello, ProseMirror!',
            },
          ],
          marks: [{ type: 'link', attrs: { ['overridden']: true } }],
        },
      ],
    });
    const setSelection = () => {
      return {
        doc: {
          content: { size: 0 },
          resolve: () => {
            return {
              min: () => {
                return 0;
              },
              max: () => {
                return 1;
              },
            } as unknown as ResolvedPos;
          },
          nodesBetween: () => {
            return {};
          },
          nodeAt:()=>{}
        },
        setSelection: setSelection,
      };
    };

    mockdoc.resolve = () => {
      return {} as unknown as ResolvedPos;
    };
    expect(
      applyNormalIfNoStyle(
        { schema: mockschema },
        {
          doc: {
            content: { size: 0 },
            resolve: () => {
              return {
                min: () => {
                  return 0;
                },
                max: () => {
                  return 1;
                },
              } as unknown as ResolvedPos;
            },
            nodesBetween: () => {
              return {};
            },
            nodeAt:()=>{}
          },
          setSelection: setSelection,
          selection: {
            $from: {
              start: () => {
                return 1;
              },
            },
            $to: {
              end: () => {
                return 2;
              },
            },
          },
        },
        mockdoc,
        true
      )
    ).toBeDefined();
  });
});

describe('onUpdateAppendTransaction', () => {
  it('should handle onUpdateAppendTransaction when ENTERKEYCODE === csview.input.lastKeyCode && tr.selection.$from.start() == tr.selection.$from.end() this condition should pass', () => {
    const linkmark = new Mark();

    class Transaction {
      amount;
      meta;
      constructor(amount, meta) {
        this.amount = amount;
        this.meta = meta;
      }

      getMeta(key) {
        return this.meta[key];
      }
    }

    const mockTransactions = [
      new Transaction(100, { type: 'deposit', paste: true }),
      new Transaction(-50, { type: 'withdrawal', paste: false }),
    ];

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
        fontName: {
          create: () => {
            return {};
          },
        },
        'mark-font-type': {
          create: () => {
            return {};
          },
        },
        'mark-font-size': {
          create: () => {
            return {};
          },
        },
      },
    });
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
          marks: [{ type: 'link', attrs: { ['overridden']: true } }],
        },
      ],
    });
    mockdoc.resolve = () => {
      return {
        type: 'paragraph',
        isTextblock: true,
        parent: { content: { content: [{ attrs: null }] } },
        min: () => {
          return 0;
        },
        max: () => {
          return 1;
        },
        depth: 1,
        node: () => {
          return { type: 'paragraph' };
        },
        before: () => {
          return 1;
        },
        start: () => {
          return 1;
        },
      } as unknown as ResolvedPos;
    };
    mockdoc.nodeAt = () => {
      return {
        nodeSize: 20,
        type: 'paragraph',
        isTextblock: true,
      } as unknown as Node;
    };
    mockdoc.nodesBetween = ()=>{};
    const mockSlice1 = {
      content: {
        childCount: 3,
        content: [
          {
            type: { name: 'paragraph' },
            attrs: { styleName: 'paragraph-style' },
            content: { size: 10 },
          },
          {
            type: { name: 'heading' },
            attrs: { styleName: 'heading-style' },
            content: { size: 8 },
          },
          {
            type: { name: 'image' },
            attrs: { styleName: 'image-style' },
            content: { size: 4 },
          },
        ],
      },
    };
    const setSelection = () => {
      return {
        doc: {
          content: { size: 0 },
          resolve: () =>
            ({
              min: () => 0,
              max: () => 1,
            }) as unknown as ResolvedPos,
          nodesBetween: () => ({}),
          nodeAt:()=>{}
        },
        setSelection: setSelection,
        scrollIntoView: () => {
          return {};
        },
      };
    };

    expect(
      onUpdateAppendTransaction(
        { firstTime: false },
        {
          doc: mockdoc,
          selection: {
            $from: {
              start: () => {
                return 1;
              },
              end: () => {
                return 1;
              },
            },
          },
          scrollIntoView: () => {
            return {};
          },
          setSelection: setSelection,
        },
        {
          schema: {
            nodes: { paragraph: 'paragraph' },
            marks: {
              link: linkmark,
              fontName: {
                create: () => {
                  return {};
                },
              },
              'mark-font-type': {
                create: () => {
                  return {};
                },
              },
              'mark-font-size': {
                create: () => {
                  return {};
                },
              },
            },
          },
          selection: {
            $cursor: null,
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
              pos: 0,
            },
          },
          tr: {
            doc: mockdoc,
            scrollIntoView: () => {
              return {};
            },
            selection: {
              $from: {
                start: () => {
                  return 1;
                },
                end: () => {
                  return 1;
                },
              },
            },
            setSelection: setSelection,
          },
          doc: mockdoc,
        },
        {
          selection: {
            from: {
              before: () => {
                return 0;
              },
            },
            to: {
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
        {
          input: { lastKeyCode: 13 },
          state: {
            selection: {
              $from: {
                before() {
                  return 5;
                },
              },
            },
            tr: {
              doc: {
                nodeAt() {
                  return { type: { name: 'table' } };
                },
              },
            },
          },
        },
        mockTransactions,
        mockSlice1
      )
    ).toStrictEqual({});
  });

  it('onUpdateAppendTransaction', () => {
    const linkmark = new Mark();

    class Transaction {
      amount;
      meta;
      constructor(amount, meta) {
        this.amount = amount;
        this.meta = meta;
      }

      getMeta(key) {
        return this.meta[key];
      }
    }

    const mockTransactions = [
      new Transaction(100, { type: 'deposit', paste: true }),
      new Transaction(-50, { type: 'withdrawal', paste: false }),
    ];

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
    mockdoc.resolve = () => {
      return {
        type: 'paragraph',
        isTextblock: true,
        parent: {
          attrs: { styleName: 'bold' },
          content: { content: [{ attrs: { styleName: 'bold' } }] },
        },
        min: () => {
          return 0;
        },
        max: () => {
          return 1;
        },
        depth: 1,
        node: () => {
          return { type: 'paragraph' };
        },
        before: () => {
          return 1;
        },
        start: () => {
          return 1;
        },
      } as unknown as ResolvedPos;
    };
    mockdoc.nodeAt = () => {
      return { nodeSize: 10 } as unknown as Node;
    };
    const mockSlice1 = {
      content: {
        childCount: 3,
        content: [
          {
            type: { name: 'paragraph' },
            attrs: { styleName: 'paragraph-style' },
            content: { size: 10 },
          },
          {
            type: { name: 'heading' },
            attrs: { styleName: 'heading-style' },
            content: { size: 8 },
          },
          {
            type: { name: 'image' },
            attrs: { styleName: 'image-style' },
            content: { size: 4 },
          },
        ],
      },
    };
    expect(
      onUpdateAppendTransaction(
        { firstTime: false },
        {
          doc: mockdoc,
          selection: {
            $from: {
              start: () => {
                return 1;
              },
              end: () => {
                return 1;
              },
            },
          },
        },
        {
          schema: {
            nodes: { paragraph: 'paragraph' },
            marks: {
              link: linkmark,
              fontName: {
                create: () => {
                  return {};
                },
              },
              'mark-font-type': {
                create: () => {
                  return {};
                },
              },
              'mark-font-size': {
                create: () => {
                  return {};
                },
              },
            },
          },
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
            doc: mockdoc,
            scrollIntoView: () => {
              return {};
            },
            selection: {
              $from: {
                start: () => {
                  return 1;
                },
                end: () => {
                  return 1;
                },
              },
            },
          },
          doc: mockdoc,
        },
        {
          selection: {
            from: {
              before: () => {
                return 0;
              },
            },
            to: {
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
        {
          input: { lastKeyCode: 13 },
          state: {
            selection: {
              $from: {
                before() {
                  return 5;
                },
              },
            },
            tr: {
              doc: {
                nodeAt() {
                  return { type: { name: 'table' } };
                },
              },
            },
          },
        },
        mockTransactions,
        mockSlice1
      )
    ).toStrictEqual({});
  });

  it('onUpdateAppendTransaction', () => {
    const linkmark = new Mark();

    class Transaction {
      amount;
      meta;
      constructor(amount, meta) {
        this.amount = amount;
        this.meta = meta;
      }

      getMeta(key) {
        return this.meta[key];
      }
    }

    const mockTransactions = [
      new Transaction(100, { type: 'deposit', paste: true }),
      new Transaction(-50, { type: 'withdrawal', paste: false }),
    ];

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
    mockdoc.resolve = () => {
      return {
        type: 'paragraph',
        isTextblock: true,
        parent: {
          attrs: { styleName: 'bold' },
          content: { content: [{ attrs: { styleName: 'bold' } }] },
        },
        min: () => {
          return 0;
        },
        max: () => {
          return 1;
        },
        depth: 1,
        node: () => {
          return { type: 'paragraph' };
        },
        before: () => {
          return 1;
        },
        start: () => {
          return 1;
        },
      } as unknown as ResolvedPos;
    };

    mockdoc.nodeAt = () => {
      return { nodeSize: 10 } as unknown as Node;
    };
    const mockSlice1 = {
      content: {
        childCount: 3,
        content: [
          {
            type: { name: 'paragraph' },
            attrs: { styleName: 'paragraph-style' },
            content: { size: 10 },
          },
          {
            type: { name: 'heading' },
            attrs: { styleName: 'heading-style' },
            content: { size: 8 },
          },
          {
            type: { name: 'image' },
            attrs: { styleName: 'image-style' },
            content: { size: 4 },
          },
        ],
      },
    };
    expect(
      onUpdateAppendTransaction(
        { firstTime: false },
        {
          doc: mockdoc,
          selection: {
            $from: {
              start: () => {
                return 1;
              },
              end: () => {
                return 1;
              },
            },
          },
        },
        {
          schema: {
            nodes: { paragraph: 'paragraph' },
            marks: {
              link: linkmark,
              fontName: {
                create: () => {
                  return {};
                },
              },
              'mark-font-type': {
                create: () => {
                  return {};
                },
              },
              'mark-font-size': {
                create: () => {
                  return {};
                },
              },
            },
          },
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
            doc: mockdoc,
            scrollIntoView: () => {
              return {};
            },
            selection: {
              $from: {
                start: () => {
                  return 1;
                },
                end: () => {
                  return 1;
                },
              },
            },
          },
          doc: mockdoc,
        },
        {
          selection: {
            from: {
              before: () => {
                return 0;
              },
            },
            to: {
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
        {
          input: { lastKeyCode: 13 },
          state: {
            selection: {
              $from: {
                before() {
                  return 5;
                },
              },
              $to: {
                after() {
                  return 10;
                },
              },
            },
            tr: {
              doc: {
                nodeAt() {
                  return { type: { name: 'eatho onu' } };
                },
              },
            },
          },
        },
        mockTransactions,
        mockSlice1
      )
    ).toStrictEqual({});
  });
});

jest.fn((tr) => {
  return tr;
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
  toDOMMock.mockImplementation(() => {
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
    const customStyleList: Style[] = [];
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
          fontSize: '11',
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
          fontSize: '11',
          nextLineStyleName: 'Bold',
          strong: true,
          toc: false,
          underline: true,
        },
      }
    );
    expect(setStyles(customStyleList)).toBeUndefined();
  });
  it('should handle getEffectiveSchema ',()=>{
    expect(plugin.getEffectiveSchema(mockSchema)).toBeDefined();
  });
  it('SHOULD HANDLE paste', () => {
    const boundHandlePaste = plugin?.props?.handlePaste?.bind(plugin);
    expect(
      boundHandlePaste(
        view,
        {} as unknown as Event,
        { content: { content: [{ attrs: true }] } } as unknown as Slice
      )
    ).toBeFalsy();
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
    const customstyle: Style[] = [];
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
          fontSize: '11',
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
          fontSize: '11',
          nextLineStyleName: 'Bold',
          strong: true,
          toc: false,
          underline: true,
          styleLevel: 1,
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
        fontSize: '11',
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
    const customstyle: Style[] = [];
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
          fontSize: '11',
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
          fontSize: '11',
          nextLineStyleName: 'BIU',
          strong: true,
          toc: false,
          underline: true,
          styleLevel: 1,
        },
      }
    );
    setStyles(customstyle);
    const bOK = isCustomStyleExists('BIU');

    expect(bOK).toEqual(true);
  });

  it('getCustomStyleByName in customstyle', () => {
    const customstyle: Style[] = [];
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
          fontSize: '11',
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
    const customstyle: Style[] = [];
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
          fontSize: '11',
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
          fontSize: '11',
          nextLineStyleName: 'Bold',
          strong: true,
          toc: false,
          underline: true,
          styleLevel: 1,
        },
      }
    );
    setStyles(customstyle);
    const bok = isStylesLoaded();

    expect(bok).toEqual(true);
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
    const toDOMMock = jest.spyOn(DOMfunc, 'toCustomStyleDOM');
    toDOMMock.mockImplementation(() => {
      return ['p', attrs, 0];
    });
    const effSchema = mockSchema;
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
    const plugin = new CustomstylePlugin(TestCustomStyleRuntime, false);
    const effSchema = mockSchema;
    const { doc, p } = builders(effSchema, { p: { nodeType: 'paragraph' } });
    const state = EditorState.create({
      doc: doc(p('Hello World!!!')),
      schema: mockSchema,
      plugins: [plugin],
    });
    const view = {
      dispatch: () => {
        return {};
      },
    };

    if (val != 'none') {
      const customcommand = new CustomStyleCommand(val, val);
      const res = customcommand.execute(
        state,
        view.dispatch,
        view as unknown as EditorView
      );
      if (val != 'clearstyle') {
        expect(res).toStrictEqual(false);
      } else {
        expect(res).toStrictEqual(true);
      }
    } else {
      const customcommand = new CustomStyleCommand(val, val);
      customcommand.execute(
        state,
        view.dispatch,
        view as unknown as EditorView
      );
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
  ///////jk
  const isStylesLoadedMock = jest.spyOn(CustStyl, 'isStylesLoaded');
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
      dispatch: () => {},
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
      const validContent: string[] = [];
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
      lineSpacing: '125%',
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
      indent: undefined,
      lineSpacing: '125%',
      paddingBottom: null,
      paddingTop: null,
      styleName: 'Normal',
      overriddenAlign: null,
      overriddenAlignValue: null,
      overriddenIndent: null,
      overriddenIndentValue: null,
      overriddenLineSpacing: null,
      overriddenLineSpacingValue: null,
    });
  });
  it('should return newAttrs when RESERVED_STYLE_NONE  is not nextLineStyle  ', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue({
      styles: { indent: '10', align: 'left', lineHeight: '10' },
      styleName: '',
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
      indent: '10',
      lineSpacing: '125%',
      paddingBottom: null,
      paddingTop: null,
      styleName: 'test',
      overriddenAlign: null,
      overriddenAlignValue: null,
      overriddenIndent: null,
      overriddenIndentValue: null,
      overriddenLineSpacing: null,
      overriddenLineSpacingValue: null,
    });
  });
  it('should return newAttrs when RESERVED_STYLE_NONE  is not nextLineStyle branch coverage  ', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue({
      styles: { indent: '10', align: 'left', lineHeight: '' },
      styleName: '',
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
      innerLink: '#uuid',
    };
    expect(setNodeAttrs('test', newattrs)).toStrictEqual({
      align: 'left',
      capco: null,
      color: null,
      id: '',
      indent: '10',
      lineSpacing: '125%',
      paddingBottom: null,
      paddingTop: null,
      styleName: 'test',
      innerLink: null,
      overriddenAlign: null,
      overriddenAlignValue: null,
      overriddenIndent: null,
      overriddenIndentValue: null,
      overriddenLineSpacing: null,
      overriddenLineSpacingValue: null,
    });
  });
  it('should handle setNodeAttrs when nextLineStyleName is null ', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue({
      styles: { indent: '10', align: 'left', lineHeight: '' },
      styleName: '',
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
  it('should handle setNodeAttrs when nextLineStyleName is Normal ', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue('Normal' as unknown as Style);
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
    expect(setNodeAttrs('Normal', newattrs)).toStrictEqual(newattrs);
  });

  it('should handle applyStyleForNextParagraph', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue({
      styles: {
        indent: '10',
        align: 'left',
        lineHeight: '',
        nextLineStyleName: 'Normal',
      },
      styleName: '',
    });
    jest
      .spyOn(ccommand, 'getMarkByStyleName')
      .mockReturnValue([
        { type: 'mark-font-type', attrs: { name: 'Arial', overridden: false } },
      ] as unknown as []);
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
          // {
          //   type: 'paragraph',
          //   attrs: {

          //   },
          //   content: [
          //     {
          //       type: 'text',
          //       marks: [],
          //       text: 'Your text here previous',
          //     },
          //   ],
          // },
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
          toDOM() {
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
                return { pt: parseInt(value as string), overridden: false };
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
    const transaction1 = new Transaction(schematr as unknown as Node);

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
    transaction1.addStoredMark = () => {
      return {} as unknown as Transaction;
    };
    transaction1.storedMarks = json.storedMarks;
    transaction1.setNodeMarkup = () => {
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
      selection: { from: 2, to: 8 },
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
        indent: '10',
        align: 'left',
        lineHeight: '',
        nextLineStyleName: '',
      },
      styleName: '',
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
                  src: (dom as unknown as HTMLElement).getAttribute('src'),
                  alt: (dom as unknown as HTMLElement).getAttribute('alt'),
                  title: (dom as unknown as HTMLElement).getAttribute('title'),
                  styleName: (dom as unknown as HTMLElement).getAttribute(
                    'styleName'
                  ),
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

    const spymhod = jest.spyOn(ccommand, 'getStyleLevel').mockReturnValue(2);
    jest.spyOn(CustStyl, 'getCustomStyleByLevel').mockReturnValue({
      styles: {
        indent: '10',
        align: 'left',
        lineHeight: '',
        nextLineStyleName: 'Normal',
      },
    } as unknown as null);
    // expect(
    //   manageHierarchyOnDelete(prevstatemhod, nextstate, null, mockview1)
    // ).toBeDefined();
    spymhod.mockClear();
    const mockview2 = {
      state: mockState,
      input: { lastKeyCode: 8 },
    };
    // expect(
    //   manageHierarchyOnDelete(prevstatemhod, nextstate, null, mockview2)
    // ).toBeDefined();
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
              // styleName: 'AFDP Bullet',
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
              // styleName: 'AFDP Bullet',
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
              // styleName: 'AFDP Bullet',
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
      selection: { from: 2, to: 8 },
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
  it('should handle function manageHierarchyOnDelete nodesBeforeSelection.length > 0', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue({
      styles: {
        indent: '10',
        align: 'left',
        lineHeight: '',
        nextLineStyleName: 'Normal',
      },
      styleName: '',
    });
    jest
      .spyOn(ccommand, 'getMarkByStyleName')
      .mockReturnValue([
        { type: 'mark-font-type', attrs: { name: 'Arial', overridden: false } },
      ] as unknown as []);
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
          toDOM() {
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
                return { pt: parseInt(value as string), overridden: false };
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
    const transaction1 = new Transaction(schematr as unknown as Node);

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
    transaction1.addStoredMark = () => {
      return {} as unknown as Transaction;
    };
    transaction1.storedMarks = json.storedMarks;
    transaction1.setNodeMarkup = () => {
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
      selection: { from: 2, to: 8 },
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
        indent: '10',
        align: 'left',
        lineHeight: '',
        nextLineStyleName: '',
      },
      styleName: '',
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
                  src: (dom as unknown as HTMLElement).getAttribute('src'),
                  alt: (dom as unknown as HTMLElement).getAttribute('alt'),
                  title: (dom as unknown as HTMLElement).getAttribute('title'),
                  styleName: (dom as unknown as HTMLElement).getAttribute(
                    'styleName'
                  ),
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

    const spymhod = jest.spyOn(ccommand, 'getStyleLevel').mockReturnValue(2);
    jest.spyOn(CustStyl, 'getCustomStyleByLevel').mockReturnValue({
      styles: {
        indent: '10',
        align: 'left',
        lineHeight: '',
        nextLineStyleName: 'Normal',
      },
    } as unknown as null);

    spymhod.mockClear();
    const mockview2 = {
      state: mockState,
      input: { lastKeyCode: 46 },
    };
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
      selection: { from: 2, to: 8 },
    };
    expect(
      manageHierarchyOnDelete(
        prevstatemhod,
        nextstatemhod,
        transaction1,
        mockview2
      )
    ).toBeDefined();
  });
  it('should handle applyStyleForNextParagraph', () => {
    jest.spyOn(CustStyl, 'getCustomStyleByName').mockReturnValue({
      styles: {
        indent: '10',
        align: 'left',
        lineHeight: '',
        nextLineStyleName: 'Normal',
      },
      styleName: '',
    });
    jest
      .spyOn(ccommand, 'getMarkByStyleName')
      .mockReturnValue([
        { type: 'mark-font-type', attrs: { name: 'Arial', overridden: false } },
      ] as unknown as []);
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
      selection: {    $from: {
        start: () => {
          return 1;
        },
      },
      $to: {
        end: () => {
          return 2;
        },
      },from: 4, to: 8 },
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
          toDOM() {
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
                return { pt: parseInt(value as string), overridden: false };
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
    const transaction1 = new Transaction(schematr as unknown as Node);

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
    transaction1.addStoredMark = () => {
      return {} as unknown as Transaction;
    };
    transaction1.storedMarks = json.storedMarks;
    transaction1.setNodeMarkup = () => {
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
      selection: { from: 2, to: 8 },
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
        indent: '10',
        align: 'left',
        lineHeight: '',
        nextLineStyleName: '',
      },
      styleName: '',
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
                  src: (dom as unknown as HTMLElement).getAttribute('src'),
                  alt: (dom as unknown as HTMLElement).getAttribute('alt'),
                  title: (dom as unknown as HTMLElement).getAttribute('title'),
                  styleName: (dom as unknown as HTMLElement).getAttribute(
                    'styleName'
                  ),
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

    const spymhod = jest.spyOn(ccommand, 'getStyleLevel').mockReturnValue(2);
    jest.spyOn(CustStyl, 'getCustomStyleByLevel').mockReturnValue({
      styles: {
        indent: '10',
        align: 'left',
        lineHeight: '',
        nextLineStyleName: 'Normal',
      },
    } as unknown as null);

    spymhod.mockClear();
    const mockview2 = {
      state: mockState,
      input: { lastKeyCode: 8 },
    };
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

describe('onInitAppendTransaction', () => {
  it('it should handle onInitAppendTransaction when isStylesLoaded = false', () => {
    jest.spyOn(CustStyl, 'isStylesLoaded').mockReturnValue(false);
    expect(onInitAppendTransaction({ loaded: false }, {}, {})).toStrictEqual(
      {}
    );
  });
  it('it should handle onInitAppendTransaction when isStylesLoaded = true', () => {
    const linkmark = new Mark();
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

    const mockdoc = mockschema.nodeFromJSON({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { level: 1, styleName: null },
          content: [
            {
              type: 'text',
              text: 'H',
            },
            {
              type: 'text',
              text: 't',
            },
            {
              type: 'text',
              text: 't',
            },
          ],
          marks: [{ type: 'link', attrs: { ['overridden']: true } }],
        },
      ],
    });
    mockdoc.resolve = () => {
      return {
        min: () => {
          return null;
        },
        max: () => {
          return {};
        },
      } as unknown as ResolvedPos;
    };
    jest.spyOn(CustStyl, 'isStylesLoaded').mockReturnValue(true);
    const setSelection = () => {
      return {
        curSelection: { $anchor: { pos: 1 }, $head: { pos: 3 } },
        doc: mockdoc,
        setNodeMarkup: () => {
          return {};
        },
        setSelection: setSelection,
      };
    };
    expect(
      onInitAppendTransaction(
        { loaded: true, firstTime: false },
        {
          setNodeMarkup: () => new Transaction(mockdoc),
          setSelection: setSelection,
          curSelection: { $anchor: { pos: 1 }, $head: { pos: 3 } },
          doc: mockdoc,
          selection: {
            $from: {
              start: () => {
                return 1;
              },
            },
            $to: {
              end: () => {
                return 2;
              },
            },
          },
        },
        {
          tr: {
            setSelection: setSelection,
            doc: mockdoc,
            selection: {
              $from: {
                start: () => {
                  return 1;
                },
              },
              $to: {
                end: () => {
                  return 2;
                },
              },
            },
          },
          schema: mockSchema,
        }
      )
    ).toBeDefined();
  });
});

describe('onUpdateAppendTransaction', () => {
  it('should handle onUpdateAppendTransaction when slice1 is null', () => {
    const linkmark = new Mark();

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
          marks: [{ type: 'link', attrs: { ['overridden']: true } }],
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
              nodeSize: 1,
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
    const linkmark = new Mark();

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
          marks: [{ type: 'link', attrs: { ['overridden']: true } }],
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
              start: () => {
                return 1;
              },
              end: () => {
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
              nodeSize: 1,
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
              nodeSize: 1,
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
  it('should handle onUpdateAppendTransaction when slice1 is null', () => {
    const linkmark = new Mark();

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
          marks: [{ type: 'link', attrs: { ['overridden']: true } }],
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
              start: () => {
                return 1;
              },
              end: () => {
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
              nodeSize: 1,
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
              nodeSize: 1,
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
  it('should handle onUpdateAppendTransaction when BACKSPACEKEYCODE === csview.input.lastKeyCode', () => {
    const linkmark = new Mark();

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
          marks: [{ type: 'link', attrs: { ['overridden']: true } }],
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
          curSelection: { $head: 1 },
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
              nodeSize: 1,
            },
            from: 0,
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
              nodeSize: 1,
            },
            from: 0,
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
        { input: { lastKeyCode: 8 } },
        {},
        null
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
describe('applyStyleForPreviousEmptyParagraph', () => {
  it('should handle applyStyleForPreviousEmptyParagraph', () => {
    const linkmark = new Mark();
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
          marks: [{ type: 'link', attrs: { ['overridden']: true } }],
        },
      ],
    });
    const setSelection = () => {
      return {
        curSelection: { $anchor: { pos: 1 }, $head: { pos: 3 } },
        doc: mockdoc,
        setNodeMarkup: () => {
          return {};
        },
        setSelection: setSelection,
      };
    };
    const tr = {
      setSelection: setSelection,
      doc: mockdoc,
      selection: {
        $from: {
          parentOffset: 0,
          end: () => {
            return 0;
          },
        },
        $anchor: { pos: 1 },
        $head: {
          before: () => {
            return 2;
          },
        },
      },
    } as unknown as Transaction;
    expect(
      applyStyleForPreviousEmptyParagraph(
        {
          schema: mockschema,
          doc: {
            resolve: () => {
              return {
                nodeBefore: { nodeSize: 1, attrs: { styleName: 'Normal' } },
              } as unknown as ResolvedPos;
            },
          } as unknown as Node,
        } as unknown as EditorState,
        tr
      )
    ).toBeDefined();
  });
});
describe('applyStyles', () => {
  it('should handle applyStyles', () => {
    expect(applyStyles({ tr: {} }, null)).toStrictEqual({});
  });
});
describe('applyStyleForEmptyParagraph', () => {
  it('should handle applyStyleForEmptyParagraph', () => {
    expect(applyStyleForEmptyParagraph({ tr: {} }, null)).toStrictEqual({});
  });
});
describe('isDocChanged', () => {
  it('should handle isDocChanged', () => {
    expect(isDocChanged([{ docChanged: {} }])).toBeTruthy();
  });
});

describe('applyStyleForNextParagraph',()=>{
  it('should handle applyStyleForNextParagraph',()=>{
    const paragraph1 = {
      type: { name: 'paragraph' },
      isBlock: true,
      child() {},
      childCount: 0,
      attrs: {
        styleName: 'Bold',
        id: 'para-1'
      },
    };

    const paragraph2 = {
      type: { name: 'paragraph' },
      isBlock: true,
      child() {},
      childCount: 0,
      attrs: {
        styleName: 'Bold',
        id: 'para-1'
      },
    };

    const doc = {
      type: { name: 'doc' },
      isBlock: true,
      child(j) {
        return j === 0 ? paragraph1 : paragraph2;
      },
      childCount: 2
    };

    const mockFrom = {

      depth: 2,
      node(depth) {
        if (depth === 0) return doc;
        if (depth === 1) return paragraph2;
        if (depth === 2) return { type: { name: 'text' }, isBlock: false };
        return null;
      },

      index(depth) {
        if (depth === 0) return 1;
        if (depth === 1) return 0;
        return 0;
      }
    };
    const prevstate = {doc:{nodeAt:()=>{return  {
      type: { name: 'paragraph' },
      isBlock: true,
      child() {},
      childCount: 0,
      attrs: {
        styleName: 'Bold',
        id: 'para-1'
      },
    }; }},selection:{$from:mockFrom,from:1}};
    const nextstate = {doc:{nodeAt:()=>{return  {
      type: { name: 'paragraph' },
      isBlock: true,
      child() {},
      childCount: 0,
      attrs: {
        styleName: 'Bold',
        id: 'para-1'
      },
    }; }},selection:{$from:mockFrom,from:3}};
    const view = {input:{lastKeyCode :13}};
    const tr = {};
    expect(applyStyleForNextParagraph(prevstate,nextstate,tr,view)).toBeDefined();
  });
  it('should handle applyStyleForNextParagraph',()=>{
    const paragraph1 = {
      type: { name: 'header' },
      isBlock: true,
      child() {return {
        type: { name: 'paragraph' },
        isBlock: true,
        child() {},
        childCount: 0,
        attrs: {
          styleName: 'Bold',
          id: 'para-1'
        },
      }; },
      childCount: 2,
      attrs: {
        styleName: 'Bold',
        id: 'para-1'
      },
    };

    const paragraph2 = {
      type: { name: 'header' },
      isBlock: true,
      child() {return {
        type: { name: 'paragraph' },
        isBlock: true,
        child() {},
        childCount: 0,
        attrs: {
          styleName: 'Bold',
          id: 'para-1'
        },
      };},
      childCount: 2,
      attrs: {
        styleName: 'Bold',
        id: 'para-1'
      },
    };

    const doc = {
      type: { name: 'doc' },
      isBlock: true,
      child(j) {
        return j === 0 ? paragraph1 : paragraph2;
      },
      childCount: 2
    };

    const mockFrom = {

      depth: 2,
      node(depth) {
        if (depth === 0) return doc;
        if (depth === 1) return paragraph2;
        if (depth === 2) return { type: { name: 'text' }, isBlock: false };
        return null;
      },

      index(depth) {
        if (depth === 0) return 1;
        if (depth === 1) return 0;
        return 0;
      }
    };
    const prevstate = {doc:{nodeAt:()=>{return  {
      type: { name: 'paragraph' },
      isBlock: true,
      child() {},
      childCount: 0,
      attrs: {
        styleName: 'Bold',
        id: 'para-1'
      },
    }; }},selection:{$from:mockFrom,from:1}};
    const nextstate = {doc:{nodeAt:()=>{return  {
      type: { name: 'paragraph' },
      isBlock: true,
      child() {},
      childCount: 0,
      attrs: {
        styleName: 'Bold',
        id: 'para-1'
      },
    }; }},selection:{$from:mockFrom,from:3}};
    const view = {input:{lastKeyCode :13}};
    const tr = {};
    expect(applyStyleForNextParagraph(prevstate,nextstate,tr,view)).toBeDefined();
  });
});
