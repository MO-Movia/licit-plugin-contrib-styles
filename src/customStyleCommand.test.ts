import {
  CustomStyleCommand,
  getMarkByStyleName,
  getStyleLevel,
  addMarksToLine,
  updateDocument,
  isCustomStyleAlreadyApplied,
  manageElementsAfterSelection,
  isLevelUpdated,
  insertParagraph,
  addElementEx,
  compareMarkWithStyle,
  updateOverrideFlag,
  applyLatestStyle,
  allowCustomLevelIndent,
  applyLineStyle,
  removeAllMarksExceptLink,
  handleRemoveMarks,
} from './CustomStyleCommand.js';
import * as cusstylecommand from './CustomStyleCommand';
import { EditorState, Selection, Transaction } from 'prosemirror-state';

import { EditorView } from 'prosemirror-view';

import { Schema, Node } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import * as customstyles from './customStyle';
import { Transform } from 'prosemirror-transform';
import type { Style } from './StyleRuntime.js';
import { doc, p } from 'jest-prosemirror';

describe('CustomStyleCommand', () => {
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
  const customstylecommand = new CustomStyleCommand(styl, 'A_12');

  it('should handle allowCustomLevelIndent when condition check delta < 0 1114 else ku', () => {
    const doc = {
      nodeSize: 10,
      resolve: () => {
        return {
          parent: {
            type: { name: 'paragraph' },
            attrs: { styleName: 'dont know' },
          },
        };
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValueOnce({
      styles: { styleLevel: 1, hasNumbering: true },
    } as unknown as Style);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 0)).toBeFalsy();
  });

  it('should handle allowCustomLevelIndent when condition check nodeStyleLevel >= styleLevel && styleLevel - nodeStyleLevel === 1', () => {
    const doc = {
      resolve: () => {
        return {
          parent: {
            type: { name: 'paragraph' },
            attrs: { styleName: 'dont know' },
          },
        };
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValueOnce({
      styles: { styleLevel: 1, hasNumbering: true },
    } as unknown as Style);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 1)).toBeTruthy();
  });
  it('should handle allowCustomLevelIndent when condition check !nodeStyleLevel >= styleLevel && styleLevel - nodeStyleLevel === 1', () => {
    const doc = {
      resolve: () => {
        return {
          parent: {
            type: { name: 'paragraph' },
            attrs: { styleName: 'dont know' },
          },
        };
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValueOnce({
      styles: { styleLevel: 2, hasNumbering: true },
    } as unknown as Style);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 1)).toBeFalsy();
  });

  it('should resolve with undefined', async () => {
    const result = await customstylecommand.waitForUserInput();
    expect(result).toBeUndefined();
  });
  it('should return false', () => {
    const result = customstylecommand.executeWithUserInput();
    expect(result).toBe(false);
  });
  it('should not throw an error', () => {
    expect(() => customstylecommand.cancel()).not.toThrow();
  });
  it('should return the same transform', () => {
    const initialState = {} as EditorState;
    const initialTransform = {} as Transform;
    const resultingTransform = customstylecommand.executeCustom(
      initialState,
      initialTransform
    );
    expect(resultingTransform).toBe(initialTransform);
  });

  it('should handle isCustomStyleApplied', () => {
    jest.clearAllMocks();
    const mySchema = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks,
    });
    const myDoc = doc(p('<cursor>'));
    const mySelection = myDoc.content.findDiffEnd(myDoc.content);
    const myEditorState = EditorState.create({
      doc: myDoc,
      schema: mySchema,
      selection: mySelection as unknown as Selection,
    });
    expect(customstylecommand.isCustomStyleApplied(myEditorState)).toBe(
      'Normal'
    );
  });
  it('should handle isCustomStyleApplied when node.attrs has styleName', () => {
    const schema = new Schema({
      nodes: {
        doc: { content: 'paragraph+' }, // 'doc' node type as the top-level node
        paragraph: {
          content: 'text*', // Ensure at least one text node within each paragraph
          attrs: {
            styleName: { default: null },
          },
          toDOM(node) {
            return ['p', { style: `style-name: ${node.attrs.styleName}` }, 0];
          },
          parseDOM: [
            {
              tag: 'p',
              getAttrs(dom) {
                return {
                  styleName: (dom as HTMLElement).getAttribute('style-name'),
                };
              },
            },
          ],
        },
        text: {}, // Define a text node type
      },
    });

    // Create a dummy document with nodes that have styleName attributes
    const doc = Node.fromJSON(schema, {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: {
            styleName: 'custom-style-1',
          },
          content: [
            {
              type: 'text',
              text: 'Paragraph 1',
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: {
            styleName: null, // This paragraph doesn't have a styleName attribute
          },
          content: [
            {
              type: 'text',
              text: 'Paragraph 2',
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: {
            styleName: 'custom-style-2',
          },
          content: [
            {
              type: 'text',
              text: 'Paragraph 3',
            },
          ],
        },
      ],
    });
    const myEditorState = EditorState.create({
      doc: doc,
      schema: schema,
      selection: { from: 0, to: doc.nodeSize - 2 } as unknown as Selection,
    });
    expect(customstylecommand.isCustomStyleApplied(myEditorState)).toBe(
      'custom-style-2'
    );
  });

  it('should be defined', () => {
    expect(customstylecommand).toBeDefined();
  });
  it('should handle renderLabel ', () => {
    const myDoc = doc(p('<cursor>'));
    myDoc.content.findDiffEnd(myDoc.content);
    customstylecommand._customStyleName = 'test';
    expect(customstylecommand.renderLabel()).toBe('test');
  });

  describe('updateOverrideFlag', () => {
    it('should handle updateOverrideFlag when styleprop null', () => {
      const child = new Node();
      const mockNode = {
        type: {
          name: 'paragraph',
        },
        content: [
          child,
          {
            type: {
              name: 'text',
            },
            text: 'This is a mock paragraph with some text.',
            marks: [
              {
                type: {
                  name: 'strong',
                },
              },
            ],
          } as unknown as Node,
          {
            type: {
              name: 'text',
            },
            text: ' More text in the same paragraph.',
            marks: [
              {
                type: {
                  name: 'em',
                },
              },
            ],
          },
        ],
        descendants: function (callback) {
          function traverse(node, callback) {
            callback(node);
            if (node.content) {
              node.content.forEach((child) => traverse(child, callback));
            }
          }
          traverse(this, callback);
        },
      };

      jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({
        styles: 'color: red; font-size: 16px; font-weight: bold;',
      } as unknown as Style);
      expect(
        updateOverrideFlag(
          '',
          {} as Transform,
          mockNode as unknown as Node,
          0,
          1,
          {
            modified: true,
          }
        )
      ).toStrictEqual({});
    });
  });

  it('should handle isEmpty  ', () => {
    expect(customstylecommand.isEmpty({})).toBeTruthy();
  });
  it('should handle isEmpty  ', () => {
    expect(customstylecommand.isEmpty({ key: 'test' })).toBeFalsy();
  });
  it('should handle isEnabled   ', () => {
    const mockSchema = new Schema({
      nodes: {
        doc: { content: 'image' },
        text: {},
        image: {
          inline: true,
          attrs: {
            align: { default: 'left' },
            fitToParent: { default: true },
          },
          group: 'inline',
          draggable: true,
          parseDOM: [
            {
              tag: 'img[src]',
              getAttrs(dom) {
                return {
                  align: dom.toString(),
                  fitToParent: dom.toString(),
                };
              },
            },
          ],
          toDOM(node) {
            return [
              'img',
              { src: node.attrs.src, align: node.attrs.align || '' },
            ];
          },
        },
      },
    });
    //const content = DOMParser.fromSchema(schema).parse(document.createElement('div').appendChild(document.createElement('img')));
    const editorState = EditorState.create({
      schema: mockSchema,
      plugins: [],
    });
    const el = document.createElement('div');
    const mockEditorView = {
      state: editorState,
      dispatch: jest.fn(),
      posAtCoords: () => {
        return {
          pos: 1,
          inside: 1,
        };
      },
      destroy: jest.fn(),
      dom: el,
    };
    const spy = jest
      .spyOn(customstylecommand, 'isCustomStyleApplied')
      .mockReturnValue('Normal');

    expect(
      customstylecommand.isStyleEnabled(
        editorState,
        mockEditorView as unknown as EditorView,
        'clearstyle'
      )
    ).toBeFalsy();
    spy.mockReset();
  });

  it('should handle executeClearStyle', () => {
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
    });

    // Create a sample document
    const mockdoc = mockschema.nodeFromJSON({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, styleName: 'test' },
          content: [
            {
              type: 'text',
              text: 'Hello, ProseMirror!',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a mock dummy document.',
              attrs: { styleName: 'test' },
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'It demonstrates the structure of a ProseMirror document.',
            },
          ],
        },
      ],
    });
    const mockselection = {
      $from: {
        before: (x) => {
          return x - 1;
        },
      },
      $to: {
        after: (x) => {
          return x + 1;
        },
      },
    };
    const mockeditorstate = {
      schema: mockschema,
      doc: mockdoc,
      selection: mockselection,
      tr: {
        setSelection: () => {
          return {
            setNodeMarkup: () => {
              return {
                removeTextAlignAndLineSpacing: () => {
                  return {
                    createEmptyElement: () => {
                      return {};
                    },
                  };
                },
              };
            },
            doc: mockdoc,
            selection: {
              $from: {
                before: (x) => {
                  return x - 1;
                },
              },
              $to: {
                after: () => {
                  return 1;
                },
              },
            },
          };
        },
      },
    };
    jest
      .spyOn(customstyles, 'getCustomStyleByName')
      .mockReturnValue(null as unknown as Style);
    expect(
      customstylecommand.executeClearStyle(
        mockeditorstate as unknown as EditorState,
        () => { },
        0,
        1,
        2,
        {}
      )
    ).toBeFalsy();
    expect(
      customstylecommand.executeClearStyle(
        mockeditorstate as unknown as EditorState,
        undefined,
        0,
        1,
        2,
        {}
      )
    ).toBeFalsy();
  });
  it('should handle clearCustomStyles', () => {
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
    });

    // Create a sample document
    const mockdoc = mockschema.nodeFromJSON({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, styleName: 'test' },
          content: [
            {
              type: 'text',
              text: 'Hello, ProseMirror!',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a mock dummy document.',
              attrs: { styleName: 'test' },
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'It demonstrates the structure of a ProseMirror document.',
            },
          ],
        },
      ],
    });
    const mockselection = {
      $from: {
        before: (x) => {
          return x - 1;
        },
      },
      $to: {
        after: (x) => {
          return x + 1;
        },
      },
    };
    const mockeditorstate = {
      schema: mockschema,
      doc: mockdoc,
      selection: mockselection,
      tr: {
        setSelection: () => {
          return {
            setNodeMarkup: () => {
              return {
                removeTextAlignAndLineSpacing: () => {
                  return {
                    createEmptyElement: () => {
                      return {};
                    },
                  };
                },
              };
            },
            doc: mockdoc,
          };
        },
      },
    };
    expect(
      customstylecommand.clearCustomStyles(
        {
          doc: mockdoc,
          selection: {
            $from: {
              before: (x) => {
                return x - 1;
              },
            },
            $to: {
              after: () => {
                return 1;
              },
            },
          },
        } as unknown as Transform,
        mockeditorstate as unknown as EditorState
      )
    ).toBeDefined();
  });

  it('should handle showAlert when popup null', () => {
    customstylecommand.showAlert();
    expect(customstylecommand._popUp).not.toBeNull();
  });

  it('should handle removeMarks', () => {
    expect(
      customstylecommand.removeMarks(
        [
          {
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
                  default: false,
                },
              },
            },
            type: 'mark',
          },
        ],
        {
          selection: { $from: { before: () => 0 }, $to: { after: () => 1 } },
          removeMark: () => {
            return {
              key: 'markremoved tr',
            };
          },
        } as unknown as Transform,
        {
          content: 'text*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0];
          },
        } as unknown as Node
      )
    ).toBeDefined();
  });

  it('should handle createNewStyle', () => {
    const spy2 = jest.spyOn(customstylecommand, 'showAlert');
    jest.spyOn(customstyles, 'saveStyle').mockResolvedValue([
      {
        styleName: 'A Apply Stylefff',
        mode: 1,
        styles: {
          align: 'justify',
          boldNumbering: true,
          toc: false,
          isHidden: false,
          boldSentence: true,
          nextLineStyleName: 'Normal',
          fontName: 'Arial',
          fontSize: '11',
          strong: true,
          em: true,
          underline: true,
          color: '#c40df2',
        },
        toc: false,
        isHidden: false,
      } as unknown as Style,
    ]);
    jest.spyOn(customstyles, 'isCustomStyleExists').mockReturnValue(true);
    jest.spyOn(customstyles, 'isPreviousLevelExists').mockReturnValue(false);
    const mocktr = {
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
              align: null,
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'Normal',
            },
          },
        ],
      },
      steps: [],
      docs: [],
      mapping: { maps: [], from: 0, to: 0 },
      curSelectionFor: 0,
      updated: 0,
      meta: {},
      time: 1684831731977,
      curSelection: { type: 'text', anchor: 1, head: 1 },
      storedMarks: null,
      setSelection() {
        return true;
      },
    } as unknown as Transaction;
    const mockstate = {
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
              align: null,
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'Normal',
            },
          },
        ],
      },
      selection: { type: 'text', anchor: 1, head: 1 },
    } as unknown as EditorState;
    const mockdoc = {
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
            align: null,
            color: null,
            id: null,
            indent: null,
            lineSpacing: null,
            paddingBottom: null,
            paddingTop: null,
            capco: null,
            styleName: 'Normal',
          },
        },
      ],
    } as unknown as Node;
    const mockdispatch = () => { };
    const mockval = {
      styles: {
        hasBullet: true,
        bulletLevel: '25CF',
        styleLevel: '1',
        paragraphSpacingBefore: 10,
        paragraphSpacingAfter: 10,
        strong: 10,
        boldNumbering: 10,
        em: 10,
        color: 'blue',
        fontSize: 10,
        fontName: 'Tahoma',
        indent: 10,
        hasNumbering: true,
      },
      styleName: 'test',
      editorView: {},
    };
    customstylecommand.createNewStyle(
      mockval,
      mocktr,
      mockstate,
      mockdispatch,
      mockdoc
    );
    expect(spy2).toHaveBeenCalled();
  });
  it('should handle createNewStyle', () => {
    const spy2 = jest.spyOn(customstylecommand, 'showAlert');
    jest.spyOn(customstyles, 'saveStyle').mockResolvedValue([
      {
        styleName: 'A Apply Stylefff',
        mode: 1,
        styles: {
          align: 'justify',
          boldNumbering: true,
          toc: false,
          isHidden: false,
          boldSentence: true,
          nextLineStyleName: 'Normal',
          fontName: 'Arial',
          fontSize: '11',
          strong: true,
          em: true,
          underline: true,
          color: '#c40df2',
        },
        toc: false,
        isHidden: false,
      } as unknown as Style,
    ]);
    jest.spyOn(customstyles, 'isCustomStyleExists').mockReturnValue(true);
    jest.spyOn(customstyles, 'isPreviousLevelExists').mockReturnValue(false);
    const mocktr = {
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
              align: null,
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'Normal',
            },
          },
        ],
      },
      steps: [],
      docs: [],
      mapping: { maps: [], from: 0, to: 0 },
      curSelectionFor: 0,
      updated: 0,
      meta: {},
      time: 1684831731977,
      curSelection: { type: 'text', anchor: 1, head: 1 },
      storedMarks: null,
      setSelection() {
        return { doc: mockdoc };
      },
    } as unknown as Transaction;
    const mockstate = {
      doc: {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0,
        },
        nodeAt: () => {
          return { type: { name: 'table' } };
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              align: null,
              color: null,
              id: null,
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'Normal',
            },
          },
        ],
      },
      selection: {
        type: 'text',
        anchor: 1,
        head: 1,
        $from: {
          before: () => {
            return 0;
          },
        },
        $to: {
          after: () => {
            return 1;
          },
          pos: 1,
        },
        from: 0,
      },
    } as unknown as EditorState;
    // Create a dummy document with nodes that have styleName attributes

    const schema = new Schema({
      nodes: {
        doc: { content: 'paragraph+' },
        paragraph: { content: 'text*' },
        text: {},
      },
    });

    // Create a document with nodes containing inline content
    const mockdoc = schema.node('doc', null, [
      schema.node('paragraph', null, [
        schema.text('This is some '),
        schema.text('inline content'),
        schema.text(' within a paragraph.'),
      ]),
    ]);

    const mockdispatch = () => { };
    const mockval = {
      styles: {
        hasBullet: true,
        bulletLevel: '25CF',
        styleLevel: '1',
        paragraphSpacingBefore: 10,
        paragraphSpacingAfter: 10,
        strong: 10,
        boldNumbering: 10,
        em: 10,
        color: 'blue',
        fontSize: 10,
        fontName: 'Tahoma',
        indent: 10,
        hasNumbering: false,
      },
      styleName: 'test',
      editorView: {},
    };
    customstylecommand.createNewStyle(
      mockval,
      mocktr,
      mockstate,
      mockdispatch,
      mockdoc
    );
    expect(spy2).not.toHaveBeenCalled();
  });
});
describe('getMarkByStyleName', () => {
  it('should handle getMarkByStyleName when styles dont have property', () => {
    jest
      .spyOn(customstyles, 'getCustomStyleByName')
      .mockReturnValue({ styles: { x: '', y: '', z: '' } } as unknown as Style);
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
            test_href: {
              default: 'test_href',
            },
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
            color: {
              default: '',
            },
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
            highlightColor: {
              default: '',
            },
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
            return ['highlightColor'];
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
            name: {
              default: '',
            },
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
            return ['span', 0];
          },
        },
      },
      // spec: {
      //   nodes: {
      //     doc: {
      //       content: 'paragraph+',
      //     },
      //     text: {},
      //     paragraph: {
      //       content: 'text*',
      //       group: 'block',
      //       parseDOM: [{ tag: 'p' }],
      //       toDOM() {
      //         return ['p', 0];
      //       },
      //     },
      //   },
      // },
    });
    expect(getMarkByStyleName('test', mockSchema)).toBeDefined();
  });

  it('should handle getMarkByStyleName', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({
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
        textHighlight: 'blue',
        underline: true,
      },
    } as unknown as Style);
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
            test_href: {
              default: 'test_href',
            },
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
            color: {
              default: '',
            },
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
            highlightColor: {
              default: '',
            },
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
            return "{ highlightColor: {default: '',},}";
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
            name: {
              default: '',
            },
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
            return ['span', 0];
          },
        },
      },
    });
    expect(getMarkByStyleName('test', mockSchema)).toBeDefined();
  });
  it('should handle getMarkByStyleName', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({
      styles: {
        hasBullet: true,
        bulletLevel: '25CF',
        styleLevel: 1,
        paragraphSpacingBefore: '10',
        paragraphSpacingAfter: '10',
        strong: true,
        boldNumbering: true,
        em: true,
        color: undefined,
        fontSize: undefined,
        fontName: undefined,
        indent: '10',
        hasNumbering: true,
        textHighlight: undefined,
        underline: true,
      },
    } as unknown as Style);
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
            test_href: {
              default: 'test_href',
            },
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
            color: {
              default: '',
            },
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
            highlightColor: {
              default: '',
            },
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
            return "{ highlightColor: {default: '',},}";
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
            name: {
              default: '',
            },
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
            return ['span', 0];
          },
        },
      },
    });
    expect(getMarkByStyleName('test', mockSchema)).toBeDefined();
  });
});
describe('getStyleLevel', () => {
  it('should handle getStyleLevel', () => {
    expect(getStyleLevel('Normal')).toBe(1);
  });
  it('should handle getStyleLevel when styleProp null', () => {
    const spy = jest
      .spyOn(customstyles, 'getCustomStyleByName')
      .mockReturnValue({} as unknown as Style);
    expect(getStyleLevel('Normal-@#$-10')).toBe(10);
    spy.mockReset();
  });

  it('should handle getStyleLevel when styleProp null', () => {
    const spy = jest
      .spyOn(customstyles, 'getCustomStyleByName')
      .mockReturnValue({} as unknown as Style);
    expect(getStyleLevel('Normal-@#$-10Normal-@#$-11')).toBe(0);
    spy.mockReset();
  });
});

describe('addMarksToLine and manageElementsAfterSelection', () => {
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
  const customstylecommand = new CustomStyleCommand(styl, 'A_12');
  const trmock = {
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
            indent: 0,
            lineSpacing: null,
            paddingBottom: null,
            paddingTop: null,
            capco: null,
            styleName: 'FM_chpara',
          },
          content: [
            {
              type: 'text',
              marks: [
                {
                  type: 'mark-font-size',
                  attrs: {
                    pt: 18,
                    overridden: false,
                  },
                },
                {
                  type: 'mark-font-type',
                  attrs: {
                    name: 'Times New Roman',
                    overridden: false,
                  },
                },
                {
                  type: 'mark-text-color',
                  attrs: {
                    color: '#0d69f2',
                    overridden: false,
                  },
                },
              ],
              text: 'fggfdfgfghfghfgh',
            },
          ],
        },
      ],
      descendants: jest.fn(() => []),
    },
    steps: [
      {
        stepType: 'removeMark',
        mark: {
          type: 'mark-font-size',
          attrs: {
            pt: 14,
            overridden: false,
          },
        },
        from: 1,
        to: 17,
      },
      {
        stepType: 'removeMark',
        mark: {
          type: 'mark-font-type',
          attrs: {
            name: 'Arial Black',
            overridden: false,
          },
        },
        from: 1,
        to: 17,
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-font-type',
          attrs: {
            name: 'Times New Roman',
            overridden: false,
          },
        },
        from: 1,
        to: 17,
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-font-size',
          attrs: {
            pt: 18,
            overridden: false,
          },
        },
        from: 1,
        to: 17,
      },
      {
        stepType: 'replaceAround',
        from: 0,
        to: 18,
        gapFrom: 1,
        gapTo: 17,
        insert: 1,
        slice: {
          content: [
            {
              type: 'paragraph',
              attrs: {
                align: 'left',
                color: null,
                id: '',
                indent: 1,
                lineSpacing: null,
                paddingBottom: null,
                paddingTop: null,
                capco: null,
                styleName: 'A11-Rename',
              },
            },
          ],
        },
        structure: true,
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-text-color',
          attrs: {
            color: '#0d69f2',
            overridden: false,
          },
        },
        from: 1,
        to: 17,
      },
      {
        stepType: 'replaceAround',
        from: 0,
        to: 18,
        gapFrom: 1,
        gapTo: 17,
        insert: 1,
        slice: {
          content: [
            {
              type: 'paragraph',
              attrs: {
                align: 'left',
                color: null,
                id: null,
                indent: 0,
                lineSpacing: null,
                paddingBottom: null,
                paddingTop: null,
                capco: null,
                styleName: 'FM_chpara',
              },
            },
          ],
        },
        structure: true,
      },
    ],
    docs: [
      {
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
              id: '',
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 14,
                      overridden: false,
                    },
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Arial Black',
                      overridden: false,
                    },
                  },
                ],
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
      {
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
              id: '',
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Arial Black',
                      overridden: false,
                    },
                  },
                ],
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
      {
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
              id: '',
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
      {
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
              id: '',
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false,
                    },
                  },
                ],
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
      {
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
              id: '',
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 18,
                      overridden: false,
                    },
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false,
                    },
                  },
                ],
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
      {
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
              id: '',
              indent: 1,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 18,
                      overridden: false,
                    },
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false,
                    },
                  },
                  {
                    type: 'mark-text-color',
                    attrs: {
                      color: '#0d69f2',
                      overridden: false,
                    },
                  },
                ],
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
    ],
    mapping: {
      maps: [
        {
          ranges: [],
          inverted: false,
        },
        {
          ranges: [],
          inverted: false,
        },
        {
          ranges: [],
          inverted: false,
        },
        {
          ranges: [],
          inverted: false,
        },
        {
          ranges: [0, 1, 1, 17, 1, 1],
          inverted: false,
        },
        {
          ranges: [],
          inverted: false,
        },
        {
          ranges: [0, 1, 1, 17, 1, 1],
          inverted: false,
        },
      ],
      from: 0,
      to: 7,
    },
    curSelectionFor: 5,
    updated: 1,
    meta: {},
    time: 1685096712641,
    curSelection: {
      type: 'text',
      anchor: 0,
      head: 17,
    },
    storedMarks: [
      {
        type: 'mark-font-type',
        attrs: {
          name: 'Times New Roman',
          overridden: false,
        },
      },
      {
        type: 'mark-font-size',
        attrs: {
          pt: '18',
          overridden: false,
        },
      },
      {
        type: 'mark-text-color',
        attrs: {
          color: '#0d69f2',
          overridden: false,
        },
      },
    ],
    addMark: () => {
      return { removeMark: () => { } };
    },
    removeMark: () => {
      return { key: 'mocktr' };
    },
    insert: () => {
      return { key: 'mocktr' };
    },
    setSelection: () => {
      return {};
    },
  };

  const schema = new Schema({
    nodes: {
      doc: {
        content: 'paragraph+',
      },
      paragraph: {
        content: 'text*',
        attrs: {
          align: { default: 'left' },
          color: { default: null },
          id: { default: '' },
          indent: { default: null },
          lineSpacing: { default: null },
          paddingBottom: { default: null },
          paddingTop: { default: null },
          capco: { default: null },
          styleName: { default: '' },
        },
        parseDOM: [{ tag: 'p' }],
        toDOM() {
          return ['p', 0];
        },
      },
      text: {
        marks: '_',
      },
    },

    marks: {
      link: {
        attrs: {
          href: {
            default: 'test_href',
          },
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
          color: {
            default: '',
          },
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
          highlightColor: {
            default: '',
          },
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
          return [''];
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
          test_href: {
            default: 'test_href',
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
          return ['span', 0];
        },
      },
    },
  });

  // Define the document and selection directly
  const doc = schema.nodeFromJSON({
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
          id: '',
          indent: null,
          lineSpacing: null,
          paddingBottom: null,
          paddingTop: null,
          capco: null,
          styleName: 'A11-Rename',
        },
        content: [
          {
            type: 'text',
            marks: [
              {
                type: 'mark-font-size',
                attrs: { pt: 14, overridden: false },
              },
              {
                type: 'mark-font-type',
                attrs: { name: 'Arial Black', overridden: false },
              },
            ],
            text: 'fggfdfgfghfghfgh',
          },
        ],
      },
    ],
  });

  const statemock = { schema: schema, doc: doc, selection: { from: 0, to: 1 } };
  const schema1 = new Schema({
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
        attrs: {
          styleName: { default: '10Normal-@#$-10' },
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
          test_href: {
            default: 'test_href',
          },
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
          color: {
            default: '',
          },
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
          highlightColor: {
            default: '',
          },
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
          return [''];
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
          name: {
            default: '',
          },
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
          return ['span', 0];
        },
      },
    },
  });

  // Define the JSON object
  const json = {
    type: 'paragraph',
    attrs: {
      align: 'left',
      color: null,
      id: null,
      indent: 0,
      lineSpacing: null,
      paddingBottom: null,
      paddingTop: null,
      capco: null,
      styleName: '10Normal-@#$-10',
    },
    content: [
      {
        type: 'text',
        marks: [
          {
            type: 'mark-font-size',
            attrs: { pt: 18, overridden: false },
          },
          {
            type: 'mark-font-type',
            attrs: { name: 'Times New Roman', overridden: false },
          },
          {
            type: 'mark-text-color',
            attrs: { color: '#0d69f2', overridden: false },
          },
        ],
        text: '.fggf.dfgfgh.fghfgh',
      },
    ],
  };

  const nodemock = schema1.nodeFromJSON(json);

  it('should handle addMarksToLine', () => {
    expect(
      addMarksToLine(trmock, statemock, nodemock, 0, true)
    ).toBeUndefined();
  });

  it('should handle addMarksToLine when boldSentence is false', () => {
    const json = {
      type: 'paragraph',
      attrs: {
        align: 'left',
        color: null,
        id: null,
        indent: 0,
        lineSpacing: null,
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: 'FM_chpara',
      },
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'mark-font-size',
              attrs: { pt: 18, overridden: false },
            },
            {
              type: 'mark-font-type',
              attrs: { name: 'Times New Roman', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#0d69f2', overridden: false },
            },
          ],
          text: 'fggf dfgfgh fghfgh',
        },
      ],
    };
    const nodemock = schema1.nodeFromJSON(json);
    expect(
      addMarksToLine(trmock, statemock, nodemock, 0, false)
    ).toBeUndefined();
  });
  it('should handle manageElementsAfterSelection', () => {
    expect(
      manageElementsAfterSelection([{ node: nodemock }], statemock, trmock)
    ).toBeDefined();
  });

  it('should handle manageElementsAfterSelection', () => {
    const json = {
      type: 'paragraph',
      attrs: {
        align: 'left',
        color: null,
        id: null,
        indent: 0,
        lineSpacing: null,
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: '1Normal-@#$-1',
      },
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'mark-font-size',
              attrs: { pt: 18, overridden: false },
            },
            {
              type: 'mark-font-type',
              attrs: { name: 'Times New Roman', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#0d69f2', overridden: false },
            },
          ],
          text: '.fggf.dfgfgh.fghfgh',
        },
      ],
    };

    const nodemock = schema1.nodeFromJSON(json);
    expect(
      manageElementsAfterSelection([{ node: nodemock }], statemock, trmock)
    ).toBeDefined();
  });
  it('should handle manageElementsAfterSelection', () => {
    const json = {
      type: 'paragraph',
      attrs: {
        align: 'left',
        color: null,
        id: null,
        indent: 0,
        lineSpacing: null,
        paddingBottom: null,
        paddingTop: null,
        capco: null,
        styleName: '0Normal-@#$-0',
      },
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'mark-font-size',
              attrs: { pt: 18, overridden: false },
            },
            {
              type: 'mark-font-type',
              attrs: { name: 'Times New Roman', overridden: false },
            },
            {
              type: 'mark-text-color',
              attrs: { color: '#0d69f2', overridden: false },
            },
          ],
          text: '.fggf.dfgfgh.fghfgh',
        },
      ],
    };

    const nodemock = schema1.nodeFromJSON(json);
    expect(
      manageElementsAfterSelection([{ node: nodemock }], statemock, trmock)
    ).toBeDefined();
  });

  it('should handle insertParagraph', () => {
    const nodeattrs = {
      align: 'left',
      color: null,
      id: null,
      indent: null,
      lineSpacing: '125%',
      paddingBottom: null,
      paddingTop: null,
      capco: null,
      styleName: 'FM_chsubpara1',
    };
    expect(insertParagraph(nodeattrs, 0, trmock, 1, statemock)).toBeDefined();
  });
  it('should handle addElementEx', () => {
    const nodeattrs = {
      align: 'left',
      color: null,
      id: null,
      indent: null,
      lineSpacing: '125%',
      paddingBottom: null,
      paddingTop: null,
      capco: null,
      styleName: 'FM_chsubpara1',
    };
    expect(
      addElementEx(nodeattrs, statemock, trmock, 0, false, 2)
    ).toBeDefined();
  });
  it('should handle getCustomStyles', () => {
    //const nodeattrs = { 'align': 'left', 'color': null, 'id': null, 'indent': null, 'lineSpacing': '125%', 'paddingBottom': null, 'paddingTop': null, 'capco': null, 'styleName': 'FM_chsubpara1' };
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
    });

    // Create a sample document
    const mockdoc = mockschema.nodeFromJSON({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, styleName: 'test' },
          content: [
            {
              type: 'text',
              text: 'Hello, ProseMirror!',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a mock dummy document.',
              attrs: { styleName: 'test' },
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'It demonstrates the structure of a ProseMirror document.',
            },
          ],
        },
      ],
    });
    const mockselection = {
      $from: {
        before: (x) => {
          return x - 1;
        },
      },
      $to: {
        after: (x) => {
          return x + 1;
        },
      },
    };
    const mockeditorstate = {
      schema: mockschema,
      doc: mockdoc,
      selection: mockselection,
      tr: {
        setSelection: () => {
          return {
            setNodeMarkup: () => {
              return {
                removeTextAlignAndLineSpacing: () => {
                  return {
                    createEmptyElement: () => {
                      return {};
                    },
                  };
                },
              };
            },
            doc: mockdoc,
          };
        },
      },
    };
    const styl = {
      styleName: 'Normal',
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
    } as unknown as Style;
    jest.spyOn(customstyles, 'getStylesAsync').mockResolvedValue([styl]);
    jest
      .spyOn(cusstylecommand, 'updateDocument')
      .mockReturnValue({ key: 'mocktr' } as unknown as Transform);
    const customstylecommand = new CustomStyleCommand(styl, 'A_12');

    const editorview = {
      state: mockeditorstate,
      dispatch: () => {
        return {};
      },
    };
    expect(
      customstylecommand.getCustomStyles(
        'Normal',
        editorview as unknown as EditorView
      )
    ).toBeUndefined();
  });
  it('should handle getCustomStyles when styleName null', () => {
    const editorview = {
      state: statemock,
      dispatch: () => {
        return {};
      },
    };
    expect(
      customstylecommand.getCustomStyles(
        null as unknown as string,
        editorview as unknown as EditorView
      )
    ).toBeUndefined();
  });
  it('should handle getCustomStyles when styleName not equal obj.styleName', () => {
    //const nodeattrs = { 'align': 'left', 'color': null, 'id': null, 'indent': null, 'lineSpacing': '125%', 'paddingBottom': null, 'paddingTop': null, 'capco': null, 'styleName': 'FM_chsubpara1' };
    const styl = {
      styleName: 'test',
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
    } as unknown as Style;
    jest.spyOn(customstyles, 'getStylesAsync').mockResolvedValue([styl]);
    jest
      .spyOn(cusstylecommand, 'updateDocument')
      .mockReturnValue({ key: 'mocktr' } as unknown as Transform);
    const customstylecommand = new CustomStyleCommand(styl, 'A_12');

    const editorview = {
      state: statemock,
      dispatch: () => {
        return {};
      },
    };
    expect(
      customstylecommand.getCustomStyles(
        'Normal',
        editorview as unknown as EditorView
      )
    ).toBeUndefined();
  });

  it('should handle compareMarkWithStyle when type = mark-font-size ', () => {
    const mark = {
      type: 'mark-font-size',
      attrs: { pt: 11, overridden: false },
    };
    const style1 = {
      align: 'justify',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'Normal',
      fontName: 'Arial',
      fontSize: 11,
      strong: true,
      em: true,
      underline: true,
      color: '#c40df2',
    };
    const retobj = { modified: false };
    expect(
      compareMarkWithStyle(mark, style1, trmock, '', '', retobj)
    ).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = em ', () => {
    const mark = { type: { name: 'em' }, attrs: { overridden: false } };
    const style1 = {
      align: 'justify',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'Normal',
      fontName: 'Arial',
      fontSize: 11,
      strong: true,
      em: true,
      underline: true,
      color: '#c40df2',
    };
    const retobj = { modified: false };
    expect(
      compareMarkWithStyle(mark, style1, trmock, '', '', retobj)
    ).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = strong ', () => {
    const mark = { type: { name: 'strong' }, attrs: { overridden: false } };
    const style1 = {
      align: 'justify',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'Normal',
      fontName: 'Arial',
      fontSize: 11,
      strong: true,
      em: true,
      underline: true,
      color: '#c40df2',
    };
    const retobj = { modified: false };
    expect(
      compareMarkWithStyle(mark, style1, trmock, '', '', retobj)
    ).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = MARK_TEXT_COLOR ', () => {
    const mark = {
      type: { name: 'mark-text-color' },
      attrs: { overridden: false },
    };
    const style1 = {
      align: 'justify',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'Normal',
      fontName: 'Arial',
      fontSize: 11,
      strong: true,
      em: true,
      underline: true,
      color: '#c40df2',
    };
    const retobj = { modified: false };
    expect(
      compareMarkWithStyle(mark, style1, trmock, '', '', retobj)
    ).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = MARKFONTSIZE ', () => {
    const mark = {
      type: { name: 'mark-font-size' },
      attrs: { overridden: false },
    };
    const style1 = {
      align: 'left',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'FS_36',
      fontName: 'Arial',
      fontSize: 11,
      textHighlight: '#3b0df2',
      strong: true,
      em: true,
      underline: true,
    };
    const retobj = { modified: false };
    expect(
      compareMarkWithStyle(mark, style1, trmock, '', '', retobj)
    ).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = MARKFONTTYPE ', () => {
    const mark = {
      type: { name: 'mark-font-type' },
      attrs: { overridden: false },
    };
    const style1 = {
      align: 'left',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'FS_36',
      fontName: 'Arial',
      fontSize: 11,
      textHighlight: '#3b0df2',
      strong: true,
      em: true,
      underline: true,
    };
    const retobj = { modified: false };
    expect(
      compareMarkWithStyle(mark, style1, trmock, '', '', retobj)
    ).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = MARK_TEXT_HIGHLIGHT ', () => {
    const mark = {
      type: { name: 'mark-text-highlight' },
      attrs: { overridden: false },
    };
    const style1 = {
      align: 'justify',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'Normal',
      fontName: 'Arial',
      fontSize: 11,
      strong: true,
      em: true,
      underline: true,
      color: '#c40df2',
    };
    const retobj = { modified: false };
    expect(
      compareMarkWithStyle(mark, style1, trmock, '', '', retobj)
    ).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = MARKSTRIKE ', () => {
    const mark = { type: { name: 'strike' }, attrs: { overridden: false } };
    const style1 = {
      align: 'justify',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'Normal',
      fontName: 'Arial',
      fontSize: 11,
      strong: true,
      em: true,
      underline: true,
      color: '#c40df2',
    };
    const retobj = { modified: false };
    expect(
      compareMarkWithStyle(mark, style1, trmock, '', '', retobj)
    ).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = MARK_UNDERLINE ', () => {
    const mark = { type: { name: 'underline' }, attrs: { overridden: false } };
    const style1 = {
      align: 'justify',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'Normal',
      fontName: 'Arial',
      fontSize: 11,
      strong: true,
      em: true,
      underline: true,
      color: '#c40df2',
    };
    const retobj = { modified: false };
    expect(
      compareMarkWithStyle(mark, style1, trmock, '', '', retobj)
    ).toBeDefined();
  });
  it('should handle compareMarkWithStyle when style not present ', () => {
    const mark = { type: { name: 'underline' }, attrs: { overridden: false } };
    const retobj = { modified: false };
    expect(
      compareMarkWithStyle(mark, null, trmock, '', '', retobj)
    ).toBeDefined();
  });
});
describe('updateDocument', () => {
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
  const trmock = {
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
            indent: 0,
            lineSpacing: null,
            paddingBottom: null,
            paddingTop: null,
            capco: null,
            styleName: 'FM_chpara',
          },
          content: [
            {
              type: 'text',
              marks: [
                {
                  type: 'mark-font-size',
                  attrs: {
                    pt: 18,
                    overridden: false,
                  },
                },
                {
                  type: 'mark-font-type',
                  attrs: {
                    name: 'Times New Roman',
                    overridden: false,
                  },
                },
                {
                  type: 'mark-text-color',
                  attrs: {
                    color: '#0d69f2',
                    overridden: false,
                  },
                },
              ],
              text: 'fggfdfgfghfghfgh',
            },
          ],
        },
      ],
    },
    steps: [
      {
        stepType: 'removeMark',
        mark: {
          type: 'mark-font-size',
          attrs: {
            pt: 14,
            overridden: false,
          },
        },
        from: 1,
        to: 17,
      },
      {
        stepType: 'removeMark',
        mark: {
          type: 'mark-font-type',
          attrs: {
            name: 'Arial Black',
            overridden: false,
          },
        },
        from: 1,
        to: 17,
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-font-type',
          attrs: {
            name: 'Times New Roman',
            overridden: false,
          },
        },
        from: 1,
        to: 17,
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-font-size',
          attrs: {
            pt: 18,
            overridden: false,
          },
        },
        from: 1,
        to: 17,
      },
      {
        stepType: 'replaceAround',
        from: 0,
        to: 18,
        gapFrom: 1,
        gapTo: 17,
        insert: 1,
        slice: {
          content: [
            {
              type: 'paragraph',
              attrs: {
                align: 'left',
                color: null,
                id: '',
                indent: 1,
                lineSpacing: null,
                paddingBottom: null,
                paddingTop: null,
                capco: null,
                styleName: 'A11-Rename',
              },
            },
          ],
        },
        structure: true,
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-text-color',
          attrs: {
            color: '#0d69f2',
            overridden: false,
          },
        },
        from: 1,
        to: 17,
      },
      {
        stepType: 'replaceAround',
        from: 0,
        to: 18,
        gapFrom: 1,
        gapTo: 17,
        insert: 1,
        slice: {
          content: [
            {
              type: 'paragraph',
              attrs: {
                align: 'left',
                color: null,
                id: null,
                indent: 0,
                lineSpacing: null,
                paddingBottom: null,
                paddingTop: null,
                capco: null,
                styleName: 'FM_chpara',
              },
            },
          ],
        },
        structure: true,
      },
    ],
    docs: [
      {
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
              id: '',
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 14,
                      overridden: false,
                    },
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Arial Black',
                      overridden: false,
                    },
                  },
                ],
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
      {
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
              id: '',
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Arial Black',
                      overridden: false,
                    },
                  },
                ],
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
      {
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
              id: '',
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
      {
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
              id: '',
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false,
                    },
                  },
                ],
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
      {
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
              id: '',
              indent: null,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 18,
                      overridden: false,
                    },
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false,
                    },
                  },
                ],
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
      {
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
              id: '',
              indent: 1,
              lineSpacing: null,
              paddingBottom: null,
              paddingTop: null,
              capco: null,
              styleName: 'A11-Rename',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 18,
                      overridden: false,
                    },
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false,
                    },
                  },
                  {
                    type: 'mark-text-color',
                    attrs: {
                      color: '#0d69f2',
                      overridden: false,
                    },
                  },
                ],
                text: 'fggfdfgfghfghfgh',
              },
            ],
          },
        ],
      },
    ],
    mapping: {
      maps: [
        {
          ranges: [],
          inverted: false,
        },
        {
          ranges: [],
          inverted: false,
        },
        {
          ranges: [],
          inverted: false,
        },
        {
          ranges: [],
          inverted: false,
        },
        {
          ranges: [0, 1, 1, 17, 1, 1],
          inverted: false,
        },
        {
          ranges: [],
          inverted: false,
        },
        {
          ranges: [0, 1, 1, 17, 1, 1],
          inverted: false,
        },
      ],
      from: 0,
      to: 7,
    },
    curSelectionFor: 5,
    updated: 1,
    meta: {},
    time: 1685096712641,
    curSelection: {
      type: 'text',
      anchor: 0,
      head: 17,
    },
    storedMarks: [
      {
        type: 'mark-font-type',
        attrs: {
          name: 'Times New Roman',
          overridden: false,
        },
      },
      {
        type: 'mark-font-size',
        attrs: {
          pt: '18',
          overridden: false,
        },
      },
      {
        type: 'mark-text-color',
        attrs: {
          color: '#0d69f2',
          overridden: false,
        },
      },
    ],
    addMark: () => {
      return { removeMark: () => { } };
    },
    removeMark: () => {
      return { key: 'mocktr' };
    },
  };

  const schema = new Schema({
    nodes: {
      doc: {
        content: 'paragraph+',
      },
      paragraph: {
        content: 'text*',
        attrs: {
          align: { default: 'left' },
          color: { default: null },
          id: { default: '' },
          indent: { default: null },
          lineSpacing: { default: null },
          paddingBottom: { default: null },
          paddingTop: { default: null },
          capco: { default: null },
          styleName: { default: '' },
        },
        parseDOM: [{ tag: 'p' }],
        toDOM() {
          return ['p', 0];
        },
      },
      text: {
        marks: '_',
      },
    },

    marks: {
      link: {
        attrs: {
          test_href: {
            default: 'test_href',
          },
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
          color: {
            default: '',
          },
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
          highlightColor: {
            default: '',
          },
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
          return [''];
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
          name: {
            default: '',
          },
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
          return ['span', 0];
        },
      },
    },
  });

  // Define the document and selection directly
  const doc = schema.nodeFromJSON({
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
          id: '',
          indent: null,
          lineSpacing: null,
          paddingBottom: null,
          paddingTop: null,
          capco: null,
          styleName: 'A11-Rename',
        },
        content: [
          {
            type: 'text',
            marks: [
              {
                type: 'mark-font-size',
                attrs: { pt: 14, overridden: false },
              },
              {
                type: 'mark-font-type',
                attrs: { name: 'Arial Black', overridden: false },
              },
            ],
            text: 'fggfdfgfghfghfgh',
          },
        ],
      },
    ],
  });
  // Create the EditorState
  const statemock = { schema: schema, doc: doc, selection: { from: 0, to: 1 } };
  // Create the ProseMirror node from JSON
  it('updateDocument', () => {
    expect(
      updateDocument(
        statemock as unknown as EditorState,
        trmock as unknown as Transform,
        'Normal',
        styl as unknown as Style
      )
    ).toBeDefined();
  });
});
describe('isCustomStyleAlreadyApplied and isLevelUpdated', () => {
  const schema = new Schema({
    nodes: {
      doc: {
        content: 'paragraph+',
      },
      paragraph: {
        content: 'text*',
        attrs: {
          align: { default: 'left' },
          color: { default: null },
          id: { default: '' },
          indent: { default: null },
          lineSpacing: { default: null },
          paddingBottom: { default: null },
          paddingTop: { default: null },
          capco: { default: null },
          styleName: { default: '' },
        },
        parseDOM: [{ tag: 'p' }],
        toDOM() {
          return ['p', 0];
        },
      },
      text: {
        marks: '_',
      },
    },

    marks: {
      link: {
        attrs: {
          test_href: {
            default: 'test_href',
          },
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
          color: {
            default: '',
          },
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
          highlightColor: {
            default: '',
          },
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
          return [''];
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
          name: {
            default: '',
          },
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
          return ['span', 0];
        },
      },
    },
  });

  // Define the document and selection directly
  const doc = schema.nodeFromJSON({
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
          id: '',
          indent: null,
          lineSpacing: null,
          paddingBottom: null,
          paddingTop: null,
          capco: null,
          styleName: '10Normal-@#$-10',
        },
        content: [
          {
            type: 'text',
            marks: [
              {
                type: 'mark-font-size',
                attrs: { pt: 14, overridden: false },
              },
              {
                type: 'mark-font-type',
                attrs: { name: 'Arial Black', overridden: false },
              },
            ],
            text: 'fggfdfgfghfghfgh',
          },
        ],
      },
    ],
  });
  // Create the EditorState
  const statemock = { schema: schema, doc: doc, selection: { from: 0, to: 1 } };
  it('should handle isCustomStyleAlreadyApplied', () => {
    expect(
      isCustomStyleAlreadyApplied(
        '10Normal-@#$-10',
        statemock as unknown as EditorState
      )
    ).toBeTruthy();
  });
  it('should handle isLevelUpdated', () => {
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
    expect(
      isLevelUpdated(
        statemock as unknown as EditorState,
        '10Normal-@#$-10',
        styl as unknown as Style
      )
    ).toBeTruthy();
  });
  it('should handle isLevelUpdated branch coverage', () => {
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
        styleLevel: undefined,
        hasBullet: true,
        bulletLevel: '272A',
        hasNumbering: true,
      },
      toc: false,
      isHidden: false,
    };
    expect(
      isLevelUpdated(
        statemock as unknown as EditorState,
        '10Normal-@#$-10',
        styl
      )
    ).toBeTruthy();
  });
  it('should handle isLevelUpdated branch coverage', () => {
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
        hasNumbering: true,
      },
      toc: false,
      isHidden: false,
    };
    expect(
      isLevelUpdated(
        statemock as unknown as EditorState,
        '10Normal-@#$-10',
        styl as unknown as Style
      )
    ).toBeTruthy();
  });
  it('should handle isLevelUpdated branch coverage when style undefined', () => {
    expect(
      isLevelUpdated(
        statemock as unknown as EditorState,
        '10Normal-@#$-10',
        undefined as unknown as Style
      )
    ).toBeFalsy();
  });
});

describe('updateOverrideFlag', () => {
  it('should handle updateOverrideFlag when styleprop null', () => {
    jest
      .spyOn(customstyles, 'getCustomStyleByName')
      .mockReturnValue(null as unknown as Style);
    expect(
      updateOverrideFlag(
        '',
        {} as unknown as Transform,
        {} as unknown as Node,
        0,
        1,
        {
          modified: false,
        }
      )
    ).toStrictEqual({});
  });
});
describe('applyLatestStyle', () => {
  it('should handle applyLatestStyle if keepmarks is true', () => {
    const doc = new Node();
    const tr = new Transform(doc);
    const myEditor = new EditorState();
    const style: Style = {
      styleName: '',
    };
    expect(
      applyLatestStyle('', myEditor, tr, doc, 0, 1, style, 1)
    ).toBeDefined();
  });
  it('should handle applyLatestStyle when styleprops  not there', () => {
    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    const myEditor = new EditorState();
    const style: Style = {
      styleName: '',
    };
    expect(
      applyLatestStyle('', myEditor, tr, doc, 0, 1, style, 1)
    ).toBeDefined();
  });
  it('should handle applyLatestStyle if element is instance of indent', () => {
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
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a mock dummy document.',
              attrs: { styleName: 'Normal' },
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'It demonstrates the structure of a ProseMirror document.',
            },
          ],
        },
      ],
    });
    expect(
      applyLatestStyle(
        '',
        {schema:mockschema} as unknown as EditorState,
        { doc: mockdoc,selection:{$from:{start:()=>{return 1;}},$to:{end:()=>{return 2;}}} } as unknown as Transform,
        {
          attrs: {
            lineSpacing: '',
            indent: '',
            styleName: 'Normal',
            align: 'justify',
          },
          content: { content: [{ type: { name: 'image' } }] },
        } as unknown as Node,
        0,
        1,
        { styles: { indent: '1px' } } as unknown as Style,
        0
      )
    ).toBeDefined();
  });
});
describe('allowCustomLevelIndent', () => {
  it('should handle allowCustomLevelIndent', () => {
    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 5, 'Normal', 1)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when startPos not less than 2', () => {
    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 2, 'Normal', 1)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when RESERVED_STYLE_NONE == node.attrs.styleName', () => {
    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'test', 1)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when nodeStyleLevel < styleLevel and styleLevel - nodeStyleLevel === 1', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({
      styles: { styleLevel: 1, hasNumbering: true },
      styleName: '',
    });
    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'test', 1)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when nodeStyleLevel < styleLevel and styleLevel - nodeStyleLevel === 1 and styleLevel - nodeStyleLevel != 1', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({
      styles: { styleLevel: 2, hasNumbering: true },
      styleName: '',
    });

    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'test', 1)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when  isAllowedNode(node) is false', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({
      styles: { styleLevel: 2, hasNumbering: true },
      styleName: '',
    });

    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'test', 1)).toBeFalsy();
  });

  it('should handle allowCustomLevelIndent when element not present', () => {
    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 1)).toBeFalsy();
  });

  it('should handle allowCustomLevelIndent when condition check nodeStyleLevel >= styleLevel', () => {
    const doc = {
      resolve: () => {
        return {
          parent: {
            type: { name: 'paragraph' },
            attrs: { styleName: 'dont know' },
          },
        };
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 1)).toBeTruthy();
  });

  it('should handle allowCustomLevelIndent when condition check delta < 0', () => {
    const doc = {
      nodeSize: 10,
      resolve: () => {
        return {
          parent: {
            type: { name: 'paragraph' },
            attrs: { styleName: 'dont know' },
          },
        };
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 0)).toBeTruthy();
  });

  it('should handle allowCustomLevelIndent when condition check delta < 0 && !isAllowedNode(node)', () => {
    const doc = {
      nodeSize: 10,
      resolve: () => {
        return {
          parent: {
            type: { name: 'paragph' },
            attrs: { styleName: 'dont know' },
          },
        };
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 0)).toBeFalsy();
  });

  it('should handle allowCustomLevelIndent when condition check !isAllowedNode(node)', () => {
    const doc = {
      resolve: () => {
        return {
          parent: {
            type: { name: 'paragra' },
            attrs: { styleName: 'dont know' },
          },
        };
      },
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 1)).toBeFalsy();
  });

  it('should handle allowCustomLevelIndent when delta = 0', () => {
    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
      nodeSize: 6,
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 0)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when delta = 0 and when element not present', () => {
    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
      nodeSize: 6,
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 0)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when delta = 0 when not isAllowed(node)', () => {
    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
      nodeSize: 6,
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 0)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when delta = 0 when normal is node.attrs.styleName', () => {
    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
      nodeSize: 6,
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 0)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when nodeStyleLevel < styleLevel', () => {
    jest
      .spyOn(customstyles, 'getCustomStyleByName')
      .mockReturnValueOnce({
        styles: { styleLevel: 2, hasNumbering: true },
      } as unknown as Style)
      .mockReturnValueOnce({
        styles: { styleLevel: 1, hasNumbering: true },
      } as unknown as Style);

    const doc = {
      resolve: () => {
        return document.createElement('div');
      },
      nodeSize: 6,
    } as unknown as Node;
    const tr = new Transform(doc);
    expect(allowCustomLevelIndent(tr, 0, 'Normal', 0)).toBeFalsy();
  });
});

describe('insertParagraph', () => {
  it('should handle insertParagraph when state is null', () => {
    expect(insertParagraph([], 1, {}, 1, null)).toStrictEqual({});
  });
});
describe('applyLineStyle', () => {
  it('should handle applyLineStyle ', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({
      styles: { boldPartial: true },
      styleName: '',
    });
    expect(
      applyLineStyle(
        {
          schema: {
            marks: {
              strong: {
                create: () => {
                  return 1;
                },
              },
            },
          },
        } as unknown as EditorState,
        {
          selection: {
            $from: {
              before: (x) => {
                return x - 1;
              },
              pos: 0,
            },
            $to: {
              after: (x) => {
                return x + 1;
              },
              pos: 1,
            },
          },
          doc: {
            nodeAt: () => {
              return { type: { name: 'table' } };
            },
          } as unknown as Node,
          addMark: () => {
            return {
              removeMark: () => {
                return {};
              },
            };
          },
        } as unknown as Transform,
        {
          attrs: { styleName: 'test' },
          descendants: () => {
            return 'text';
          },
        } as unknown as Node,
        0
      )
    ).toBeDefined();
  });
  it('should handle applyLineStyle when tr is null', () => {
    const mockNode = {
      type: {
        name: 'doc', // Type of the node
      },
      content: [
        // Children of the node
        {
          type: {
            name: 'paragraph',
          },
          content: [
            {
              type: {
                name: 'text',
              },
              text: 'Hello',
            },
            {
              type: {
                name: 'text',
              },
              text: ' world',
            },
          ],
        },
        {
          type: {
            name: 'heading',
          },
          attrs: {
            level: 2,
          },
          content: [
            {
              type: {
                name: 'text',
              },
              text: 'ProseMirror',
            },
          ],
        },
      ],
      // Mocking the descendants method
      descendants: function (callback) {
        // Helper function to recursively traverse the node tree
        function traverse(node, parentPos) {
          let pos = parentPos + 1;
          for (const child of node.content || []) {
            if (child.isText) {
              callback(child, pos, node);
              pos += child.nodeSize;
            } else {
              pos = traverse(child, pos);
            }
          }
          return pos;
        }

        // Start traversal from the document node
        traverse(this, 0);
      },
    };
    expect(
      applyLineStyle(
        {
          schema: {
            marks: {
              strong: {
                create: () => {
                  return 1;
                },
              },
            },
          },
          tr: {
            selection: {
              $from: {
                before: (x) => {
                  return x - 1;
                },
                pos: 0,
              },
              $to: {
                after: (x) => {
                  return x + 1;
                },
                pos: 1,
              },
            },
            doc: {
              nodeAt: () => {
                return { type: { name: 'table' } };
              },
            },
            addMark: () => {
              return {
                removeMark: () => {
                  return {};
                },
              };
            },
          },
        } as unknown as EditorState,
        null as unknown as Transform,
        mockNode as unknown as Node,
        0
      )
    ).toBeDefined();
  });
});
describe('isLevelUpdated', () => {
  it('should handle isLevelUpdated when isCustomStyleAlreadyApplied is false', () => {
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
        },
      ],
    });
    const myEditor = {
      doc: mockdoc,
      schema: mockschema,
    } as unknown as EditorState;
    const style: Style = {
      styleName: '',
    };
    expect(isLevelUpdated(myEditor, 'Normal', style)).toBeDefined();
  });
});
describe('removeAllMarksExceptLink', () => {
  it('should handle removeAllMarksExceptLink', () => {
    const mySchema = new Schema({
      nodes: {
        // Define the document node
        doc: {
          content: 'block+',
        },
        // Define the paragraph node
        paragraph: {
          content: 'text*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0];
          },
        },
        // Define the text node
        text: {
          group: 'inline',
        },
      },
    });
    const mockDoc = Node.fromJSON(mySchema, {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello, ProseMirror!' }],
        },
      ],
    });
    const tr = { doc: mockDoc,selection:{$from:{start:()=>{return 1;}},$to:{end:()=>{return 2;}}}  } as unknown as Transform;
    expect(
      removeAllMarksExceptLink(0, 1, tr, mySchema)
    ).toBeDefined();
  });
  it('should handle removeAllMarksExceptLink when mark.attrs[ATTR_OVERRIDDEN] && link === mark.type.name', () => {
    const mySchema = new Schema({
      nodes: {
        // Define the document node
        doc: {
          content: 'block+',
        },
        // Define the paragraph node
        paragraph: {
          content: 'text*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0];
          },
        },
        // Define the text node
        text: {
          group: 'inline',
        },
      },
    });
    const mockDoc = Node.fromJSON(mySchema, {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello, ProseMirror!' }],
        },
      ],
    });
    const tr = { doc: mockDoc ,selection:{$from:{start:()=>{return 1;}},$to:{end:()=>{return 2;}}} } as unknown as Transform;
    expect(
      removeAllMarksExceptLink(0, 1, tr, mySchema)
    ).toBeDefined();
  });
  it('should handle removeAllMarksExceptLink when mark.attrs[ATTR_OVERRIDDEN] && link === mark.type.name', () => {
    const mySchema = new Schema({
      nodes: {
        // Define the document node
        doc: {
          content: 'block+',
        },
        // Define the paragraph node
        paragraph: {
          content: 'text*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0];
          },
        },
        // Define the text node
        text: {
          group: 'inline',
        },
      },
      marks: {
        // Define the strong mark
        strong: {},
      },
    });

    const mockDoc = Node.fromJSON(mySchema, {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello, ProseMirror!',
              marks: [{ type: 'strong' }], // Include the "strong" mark
            },
          ],
        },
      ],
    });
    const tr = {
      doc: mockDoc,
      removeMark: () => {
        return { doc: mockDoc };
      },
      selection:{$from:{start:()=>{return 1;}},$to:{end:()=>{return 2;}}}
    } as unknown as Transform;
    expect(
      removeAllMarksExceptLink(1, 2, tr, mySchema)
    ).toBeDefined();
  });
  it('should handle removeAllMarksExceptLink when mark.attrs[ATTR_OVERRIDDEN] && link === mark.type.name', () => {
    const mySchema = new Schema({
      nodes: {
        // Define the document node
        doc: {
          content: 'block+',
        },
        // Define the paragraph node
        paragraph: {
          content: 'text*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0];
          },
        },
        // Define the text node
        text: {
          group: 'inline',
        },
      },
      marks: {
        // Define the strong mark
        strong: {},
      },
    });

    const mockDoc = Node.fromJSON(mySchema, {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello, ProseMirror!',
              marks: [{ type: 'strong' }], // Include the "strong" mark
            },
          ],
        },
      ],
    });
    const tr = {
      doc: mockDoc,
      removeMark: () => {
        return { doc: mockDoc };
      },
      selection:{$from:{start:()=>{return 1;}},$to:{end:()=>{return 2;}}}
    } as unknown as Transform;
    expect(
      removeAllMarksExceptLink(1, 2, tr, mySchema)
    ).toBeDefined();
  });
});
describe('handleRemoveMarks', () => {
  it('should handle handleRemoveMarks', () => {
    const mySchema = new Schema({
      nodes: {
        // Define the document node
        doc: {
          content: 'block+',
        },
        // Define the paragraph node
        paragraph: {
          content: 'text*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0];
          },
        },
        // Define the text node
        text: {
          group: 'inline',
        },
      },
    });
    const mockdoc = Node.fromJSON(mySchema, {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello, ProseMirror!' }],
        },
      ],
    });
    mockdoc.nodeAt = ()=>{return {} as unknown as Node;};
    const tr = {
      doc: mockdoc,
      removeMark: () => {
        return { doc: mockdoc };
      },
    } as unknown as Transform;

    const tasks = [
      {
        mark: {
          type: { name: 'mark-text-highlight' },
          attrs: { overridden: undefined },
        },
      }
    ];
    const testtr = handleRemoveMarks(
      tr,
      tasks,
      1,
      2,
      mySchema
    );
    expect(testtr).toBeDefined();
  });
  it('should handle handleRemoveMarks when styleProps null', () => {
    //const doc = new Node();
    const tr = {
      removeMark: () => {
        return {};
      },
    } as unknown as Transform;
    const mySchema = new Schema({
      nodes: {
        // Define the document node
        doc: {
          content: 'block+',
        },
        // Define the paragraph node
        paragraph: {
          content: 'text*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0];
          },
        },
        // Define the text node
        text: {
          group: 'inline',
        },
      },
    });
    expect(
      handleRemoveMarks(
        tr,
        [
          {
            mark: {
              type: { name: 'mark-text-highlight' },
              attrs: { overridden: true },
            },
          },
        ],
        0,
        1,
        mySchema
      )
    ).toBeDefined();
  });

  it('should handle isActive', () => {
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
    const customstylecommand = new CustomStyleCommand(styl, 'A_12');
    expect(customstylecommand.isActive()).toBeTruthy();
  });
});
