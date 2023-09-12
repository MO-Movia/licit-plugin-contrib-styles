import CustomStyleCommand, {
  getMarkByStyleName, getStyleLevel, addMarksToLine, updateDocument, isCustomStyleAlreadyApplied,
  manageElementsAfterSelection, isLevelUpdated, insertParagraph, addElementEx, compareMarkWithStyle, updateOverrideFlag, applyLatestStyle,
  allowCustomLevelIndent, applyLineStyle, removeAllMarksExceptLink, handleRemoveMarks
} from './CustomStyleCommand';
import * as cusstylecommand from './CustomStyleCommand';
import { EditorState } from 'prosemirror-state';
import { Schema, DOMParser, Mark } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import * as customstyles from './customStyle';

describe('CustomStyleCommand', () => {


  const styl = { 'styleName': 'A_12', 'mode': 1, 'styles': { 'align': 'left', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'A_12', 'fontName': 'Aclonica', 'fontSize': '14', 'strong': true, 'styleLevel': '2', 'hasBullet': true, 'bulletLevel': '272A', 'hasNumbering': false }, 'toc': false, 'isHidden': false };
  const customstylecommand = new CustomStyleCommand(styl, 'A_12');

  it('should handle isCustomStyleApplied', () => {

    jest.clearAllMocks();
    const mySchema = new Schema({ nodes: schema.spec.nodes, marks: schema.spec.marks });
    const myDoc = DOMParser.fromSchema(mySchema).parse('<p>Hello, world!</p>');
    const mySelection = myDoc.content.findDiffEnd(myDoc.content);
    const myEditorState = EditorState.create({
      doc: myDoc,
      schema: mySchema,
      selection: mySelection,
    });
    expect(customstylecommand.isCustomStyleApplied(myEditorState)).toBe('Normal');
  });

  it('should be defined', () => {
    expect(customstylecommand).toBeDefined();
  });
  it('should handle renderLabel ', () => {


    const mySchema = new Schema({ nodes: schema.spec.nodes, marks: schema.spec.marks });
    const myDoc = DOMParser.fromSchema(mySchema).parse('<p>Hello, world!</p>');
    const mySelection = myDoc.content.findDiffEnd(myDoc.content);
    const myEditorState = EditorState.create({
      doc: myDoc,
      schema: mySchema,
      selection: mySelection,
    });
    customstylecommand._customStyleName = 'test';
    expect(customstylecommand.renderLabel(myEditorState)).toBe('test');
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
            fitToParent: { default: true }
          },
          group: 'inline',
          draggable: true,
          parseDOM: [{
            tag: 'img[src]',
            getAttrs(dom) {
              return {
                align: dom.getAttribute('align'),
                fitToParent: dom.getAttribute('fitToParent')
              };
            }
          }],
          toDOM(node) {
            return ['img', { src: node.attrs.src, align: node.attrs.align || '' }];
          }
        }
      }
    });
    //const content = DOMParser.fromSchema(schema).parse(document.createElement('div').appendChild(document.createElement('img')));
    const editorState = EditorState.create({
      schema: mockSchema,
      plugins: []
    });
    const el = document.createElement('div');
    const mockEditorView = {
      state: editorState,
      dispatch: jest.fn(),
      posAtCoords: ({ left,
        top }) => {
        return {
          pos: 1,
          inside: 1,
        };
      },
      destroy: jest.fn(),
      dom: el
    };
    const spy = jest.spyOn(customstylecommand, 'isCustomStyleApplied').mockReturnValue('Normal');

    expect(customstylecommand.isEnabled(editorState, mockEditorView, 'clearstyle')).toBeFalsy();
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
            styleName: { default: 'test' }
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
            return ['h' + node.attrs.level, { 'data-style-name': node.attrs.styleName }, 0];
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
              attrs: { styleName: 'test' }
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
    const mockselection = { $from: { before: (x) => { return x - 1; } }, $to: { after: (x) => { return x + 1; } } };
    const mockeditorstate = {
      schema: mockschema,
      doc: mockdoc,
      selection: mockselection,
      tr: { setSelection: () => { return { setNodeMarkup: () => { return { removeTextAlignAndLineSpacing: () => { return { createEmptyElement: () => { return {}; } }; } }; }, doc: mockdoc, selection: { $from: { before: (x) => { return x - 1; } }, $to: { after: (x) => { return 1; } } } }; } }
    };
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue(null);
    expect(customstylecommand.executeClearStyle(mockeditorstate, () => { }, { attrs: { styleName: 'test' } }, 0, 1, {}, {})).toBeFalsy();
    expect(customstylecommand.executeClearStyle(mockeditorstate, null, { attrs: { styleName: 'test' } }, 0, 1, {}, {})).toBeFalsy();

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
            styleName: { default: 'test' }
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
            return ['h' + node.attrs.level, { 'data-style-name': node.attrs.styleName }, 0];
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
              attrs: { styleName: 'test' }
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
    const mockselection = { $from: { before: (x) => { return x - 1; } }, $to: { after: (x) => { return x + 1; } } };
    const mockeditorstate = {
      schema: mockschema,
      doc: mockdoc,
      selection: mockselection,
      tr: { setSelection: () => { return { setNodeMarkup: () => { return { removeTextAlignAndLineSpacing: () => { return { createEmptyElement: () => { return {}; } }; } }; }, doc: mockdoc }; } }
    };
    expect(customstylecommand.clearCustomStyles({ doc: mockdoc, selection: { $from: { before: (x) => { return x - 1; } }, $to: { after: (x) => { return 1; } } } }, mockeditorstate)).toBeDefined();
  });

  it('should handle showAlert when popup null', () => {
    customstylecommand.showAlert();
    expect(customstylecommand._popUp).not.toBeNull();

  });


  it('should handle removeMarks', () => {
    expect(customstylecommand.removeMarks([{
      em: {
        parseDOM: [{
          tag: 'i'
        }, {
          tag: 'em'
        }, {
          style: 'font-style=italic'
        }],
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      }, type: 'mark'
    },
    ], { selection: { $from: { before: () => 0 }, $to: { after: () => 1 } }, removeMark: () => { key: 'markremoved tr'; } }, {
      content: 'text*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return ['p', 0];
      },
    })).toBeUndefined();
  });

  it('should handle createNewStyle', () => {
    const spy2 = jest.spyOn(customstylecommand, 'showAlert');
    jest.spyOn(customstyles, 'saveStyle').mockResolvedValue([{ 'styleName': 'A Apply Stylefff', 'mode': 1, 'styles': { 'align': 'justify', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'Normal', 'fontName': 'Arial', 'fontSize': 11, 'strong': true, 'em': true, 'underline': true, 'color': '#c40df2' }, 'toc': false, 'isHidden': false }]);
    jest.spyOn(customstyles, 'isCustomStyleExists').mockReturnValue(true);
    jest.spyOn(customstyles, 'isPreviousLevelExists').mockReturnValue(false);
    const mocktr = {
      'doc': { 'type': 'doc', 'attrs': { 'layout': null, 'padding': null, 'width': null, 'counterFlags': null, 'capcoMode': 0 }, 'content': [{ 'type': 'paragraph', 'attrs': { 'align': null, 'color': null, 'id': null, 'indent': null, 'lineSpacing': null, 'paddingBottom': null, 'paddingTop': null, 'capco': null, 'styleName': 'Normal' } }] }, 'steps': [], 'docs': [], 'mapping': { 'maps': [], 'from': 0, 'to': 0 }, 'curSelectionFor': 0, 'updated': 0, 'meta': {}, 'time': 1684831731977, 'curSelection': { 'type': 'text', 'anchor': 1, 'head': 1 }, 'storedMarks': null, setSelection(anchor, head) {
        return true;
      }
    };
    const mockstate = { 'doc': { 'type': 'doc', 'attrs': { 'layout': null, 'padding': null, 'width': null, 'counterFlags': null, 'capcoMode': 0 }, 'content': [{ 'type': 'paragraph', 'attrs': { 'align': null, 'color': null, 'id': null, 'indent': null, 'lineSpacing': null, 'paddingBottom': null, 'paddingTop': null, 'capco': null, 'styleName': 'Normal' } }] }, 'selection': { 'type': 'text', 'anchor': 1, 'head': 1 } };
    const mockdoc = { 'type': 'doc', 'attrs': { 'layout': null, 'padding': null, 'width': null, 'counterFlags': null, 'capcoMode': 0 }, 'content': [{ 'type': 'paragraph', 'attrs': { 'align': null, 'color': null, 'id': null, 'indent': null, 'lineSpacing': null, 'paddingBottom': null, 'paddingTop': null, 'capco': null, 'styleName': 'Normal' } }] };
    const mockdispatch = () => { };
    const mockval = { styles: { hasBullet: true, bulletLevel: '25CF', styleLevel: '1', paragraphSpacingBefore: 10, paragraphSpacingAfter: 10, strong: 10, boldNumbering: 10, em: 10, color: 'blue', fontSize: 10, fontName: 'Tahoma', indent: 10, hasNumbering: true }, styleName: 'test', editorView: {} };
    customstylecommand.createNewStyle(mockval, mocktr, mockstate, mockdispatch, mockdoc);
    expect(spy2).toHaveBeenCalled();
  });

});
describe('getMarkByStyleName', () => {
  it('should handle getMarkByStyleName when styles dont have property', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({ styles: { x: '', y: '', z: '' } });
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
        text: { inline: true }
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
            href: 'test_href'
          }
        },
        em: {
          parseDOM: [{
            tag: 'i'
          }, {
            tag: 'em'
          }, {
            style: 'font-style=italic'
          }],
          toDOM() {
            return ['em', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false
            }
          }
        },
        strong: {
          parseDOM: [{
            tag: 'strong'
          }, {
            tag: 'b'
          }, {
            style: 'font-weight'
          }],
          toDOM() {
            return ['strong', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false
            }
          }
        },
        underline: {
          parseDOM: [{
            tag: 'u'
          }, {
            style: 'text-decoration-line'
          }, {
            style: 'text-decoration'
          }],
          toDOM() {
            return ['u', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false
            }
          }
        },
        'mark-text-color': {
          attrs: {
            color: '',
            overridden: {
              hasDefault: true,
              default: false
            }
          },
          inline: true,
          group: 'inline',
          parseDOM: [{
            style: 'color'
          }],
          toDOM() {
            return ['span', { 'color': '' }, 0];
          },
        },
        'mark-text-highlight': {
          attrs: {
            highlightColor: '',
            overridden: {
              hasDefault: true,
              default: false
            }
          },
          inline: true,
          group: 'inline',
          parseDOM: [{
            tag: 'span[style*=background-color]'
          }],
          toDOM() {
            return {
              highlightColor: ''
            };
          },

        },
        'mark-font-size': {
          attrs: {
            pt: {
              default: null
            },
            overridden: {
              hasDefault: true,
              default: false
            }
          },
          inline: true,
          group: 'inline',
          parseDOM: [{
            style: 'font-size'
          }],
          toDOM(mark, inline) {
            return ['Test Mark'];
          }

        },
        'mark-font-type': {
          attrs: {
            name: '',
            overridden: {
              hasDefault: true,
              default: false
            }
          },
          inline: true,
          group: 'inline',
          parseDOM: [{
            style: 'font-family'
          }],
          toDOM() {
            return ['span', 0];
          }
        },
        strong: {
          parseDOM: [{
            tag: 'strong'
          }, {
            tag: 'b'
          }, {
            style: 'font-weight'
          }],

          toDOM() {
            return ['strong', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false
            }
          }
        }

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
        }

      },
    });
    expect(getMarkByStyleName('test', mockSchema)).toBeDefined();
  });

  it('should handle getMarkByStyleName', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({ styles: { hasBullet: true, bulletLevel: '25CF', styleLevel: 1, paragraphSpacingBefore: 10, paragraphSpacingAfter: 10, strong: 10, boldNumbering: 10, em: 10, color: 'blue', fontSize: 10, fontName: 'Tahoma', indent: 10, hasNumbering: true, 'textHighlight': 'blue', underline: true } });
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
        text: { inline: true }
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
            href: 'test_href'
          }
        },
        em: {
          parseDOM: [{
            tag: 'i'
          }, {
            tag: 'em'
          }, {
            style: 'font-style=italic'
          }],
          toDOM() {
            return ['em', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false
            }
          }
        },
        strong: {
          parseDOM: [{
            tag: 'strong'
          }, {
            tag: 'b'
          }, {
            style: 'font-weight'
          }],
          toDOM() {
            return ['strong', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false
            }
          }
        },
        underline: {
          parseDOM: [{
            tag: 'u'
          }, {
            style: 'text-decoration-line'
          }, {
            style: 'text-decoration'
          }],
          toDOM() {
            return ['u', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false
            }
          }
        },
        'mark-text-color': {
          attrs: {
            color: '',
            overridden: {
              hasDefault: true,
              default: false
            }
          },
          inline: true,
          group: 'inline',
          parseDOM: [{
            style: 'color'
          }],
          toDOM() {
            return ['span', { 'color': '' }, 0];
          },
        },
        'mark-text-highlight': {
          attrs: {
            highlightColor: '',
            overridden: {
              hasDefault: true,
              default: false
            }
          },
          inline: true,
          group: 'inline',
          parseDOM: [{
            tag: 'span[style*=background-color]'
          }],
          toDOM() {
            return {
              highlightColor: ''
            };
          },

        },
        'mark-font-size': {
          attrs: {
            pt: {
              default: null
            },
            overridden: {
              hasDefault: true,
              default: false
            }
          },
          inline: true,
          group: 'inline',
          parseDOM: [{
            style: 'font-size'
          }],
          toDOM(mark, inline) {
            return ['Test Mark'];
          }

        },
        'mark-font-type': {
          attrs: {
            name: '',
            overridden: {
              hasDefault: true,
              default: false
            }
          },
          inline: true,
          group: 'inline',
          parseDOM: [{
            style: 'font-family'
          }],
          toDOM() {
            return ['span', 0];
          }
        },
        strong: {
          parseDOM: [{
            tag: 'strong'
          }, {
            tag: 'b'
          }, {
            style: 'font-weight'
          }],

          toDOM() {
            return ['strong', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false
            }
          }
        }

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
        }

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
    const spy = jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({});
    expect(getStyleLevel('Normal-@#$-10')).toBe(10);
    spy.mockReset();
  });

  it('should handle getStyleLevel when styleProp null', () => {
    const spy = jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({});
    expect(getStyleLevel('Normal-@#$-10Normal-@#$-11')).toBe(0);
    spy.mockReset();
  });
});

describe('addMarksToLine and manageElementsAfterSelection', () => {

  const styl = { 'styleName': 'A_12', 'mode': 1, 'styles': { 'align': 'left', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'A_12', 'fontName': 'Aclonica', 'fontSize': '14', 'strong': true, 'styleLevel': '2', 'hasBullet': true, 'bulletLevel': '272A', 'hasNumbering': false }, 'toc': false, 'isHidden': false };
  const customstylecommand = new CustomStyleCommand(styl, 'A_12');
  const trmock = {
    doc: {
      type: 'doc',
      attrs: {
        layout: null,
        padding: null,
        width: null,
        counterFlags: null,
        capcoMode: 0
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
            styleName: 'FM_chpara'
          },
          content: [
            {
              type: 'text',
              marks: [
                {
                  type: 'mark-font-size',
                  attrs: {
                    pt: 18,
                    overridden: false
                  }
                },
                {
                  type: 'mark-font-type',
                  attrs: {
                    name: 'Times New Roman',
                    overridden: false
                  }
                },
                {
                  type: 'mark-text-color',
                  attrs: {
                    color: '#0d69f2',
                    overridden: false
                  }
                }
              ],
              text: 'fggfdfgfghfghfgh'
            }
          ]
        }
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
            overridden: false
          }
        },
        from: 1,
        to: 17
      },
      {
        stepType: 'removeMark',
        mark: {
          type: 'mark-font-type',
          attrs: {
            name: 'Arial Black',
            overridden: false
          }
        },
        from: 1,
        to: 17
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-font-type',
          attrs: {
            name: 'Times New Roman',
            overridden: false
          }
        },
        from: 1,
        to: 17
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-font-size',
          attrs: {
            pt: 18,
            overridden: false
          }
        },
        from: 1,
        to: 17
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
                styleName: 'A11-Rename'
              }
            }
          ]
        },
        structure: true
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-text-color',
          attrs: {
            color: '#0d69f2',
            overridden: false
          }
        },
        from: 1,
        to: 17
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
                styleName: 'FM_chpara'
              }
            }
          ]
        },
        structure: true
      }
    ],
    docs: [
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 14,
                      overridden: false
                    }
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Arial Black',
                      overridden: false
                    }
                  }
                ],
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      },
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Arial Black',
                      overridden: false
                    }
                  }
                ],
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      },
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      },
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false
                    }
                  }
                ],
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      },
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 18,
                      overridden: false
                    }
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false
                    }
                  }
                ],
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      },
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 18,
                      overridden: false
                    }
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false
                    }
                  },
                  {
                    type: 'mark-text-color',
                    attrs: {
                      color: '#0d69f2',
                      overridden: false
                    }
                  }
                ],
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      }
    ],
    mapping: {
      maps: [
        {
          ranges: [],
          inverted: false
        },
        {
          ranges: [],
          inverted: false
        },
        {
          ranges: [],
          inverted: false
        },
        {
          ranges: [],
          inverted: false
        },
        {
          ranges: [0, 1, 1, 17, 1, 1],
          inverted: false
        },
        {
          ranges: [],
          inverted: false
        },
        {
          ranges: [0, 1, 1, 17, 1, 1],
          inverted: false
        }
      ],
      from: 0,
      to: 7
    },
    curSelectionFor: 5,
    updated: 1,
    meta: {},
    time: 1685096712641,
    curSelection: {
      type: 'text',
      anchor: 0,
      head: 17
    },
    storedMarks: [
      {
        type: 'mark-font-type',
        attrs: {
          name: 'Times New Roman',
          overridden: false
        }
      },
      {
        type: 'mark-font-size',
        attrs: {
          pt: '18',
          overridden: false
        }
      },
      {
        type: 'mark-text-color',
        attrs: {
          color: '#0d69f2',
          overridden: false
        }
      }
    ],
    addMark: (x, y, z) => { return { removeMark: (x, y, z) => { } }; },
    removeMark: (x, y, z) => { return { key: 'mocktr' }; },
    insert: (a, b) => { return { key: 'mocktr' }; },
    setSelection: (a) => { return {}; }
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
          href: 'test_href'
        }
      },
      em: {
        parseDOM: [{
          tag: 'i'
        }, {
          tag: 'em'
        }, {
          style: 'font-style=italic'
        }],
        toDOM() {
          return ['em', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      strong: {
        parseDOM: [{
          tag: 'strong'
        }, {
          tag: 'b'
        }, {
          style: 'font-weight'
        }],
        toDOM() {
          return ['strong', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      underline: {
        parseDOM: [{
          tag: 'u'
        }, {
          style: 'text-decoration-line'
        }, {
          style: 'text-decoration'
        }],
        toDOM() {
          return ['u', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      'mark-text-color': {
        attrs: {
          color: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'color'
        }],
        toDOM() {
          return ['span', { 'color': '' }, 0];
        },
      },
      'mark-text-highlight': {
        attrs: {
          highlightColor: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          tag: 'span[style*=background-color]'
        }],
        toDOM() {
          return {
            highlightColor: ''
          };
        },

      },
      'mark-font-size': {
        attrs: {
          pt: {
            default: null
          },
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'font-size'
        }],
        toDOM(mark, inline) {
          return ['Test Mark'];
        }

      },
      'mark-font-type': {
        attrs: {
          name: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'font-family'
        }],
        toDOM() {
          return ['span', 0];
        }
      },
      strong: {
        parseDOM: [{
          tag: 'strong'
        }, {
          tag: 'b'
        }, {
          style: 'font-weight'
        }],

        toDOM() {
          return ['strong', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      }

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
  },

  );


  // Create the EditorState
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
      text: { inline: true }
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
          href: 'test_href'
        }
      },
      em: {
        parseDOM: [{
          tag: 'i'
        }, {
          tag: 'em'
        }, {
          style: 'font-style=italic'
        }],
        toDOM() {
          return ['em', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      strong: {
        parseDOM: [{
          tag: 'strong'
        }, {
          tag: 'b'
        }, {
          style: 'font-weight'
        }],
        toDOM() {
          return ['strong', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      underline: {
        parseDOM: [{
          tag: 'u'
        }, {
          style: 'text-decoration-line'
        }, {
          style: 'text-decoration'
        }],
        toDOM() {
          return ['u', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      'mark-text-color': {
        attrs: {
          color: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'color'
        }],
        toDOM() {
          return ['span', { 'color': '' }, 0];
        },
      },
      'mark-text-highlight': {
        attrs: {
          highlightColor: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          tag: 'span[style*=background-color]'
        }],
        toDOM() {
          return {
            highlightColor: ''
          };
        },

      },
      'mark-font-size': {
        attrs: {
          pt: {
            default: null
          },
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'font-size'
        }],
        toDOM(mark, inline) {
          return ['Test Mark'];
        }

      },
      'mark-font-type': {
        attrs: {
          name: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'font-family'
        }],
        toDOM() {
          return ['span', 0];
        }
      },
      strong: {
        parseDOM: [{
          tag: 'strong'
        }, {
          tag: 'b'
        }, {
          style: 'font-weight'
        }],

        toDOM() {
          return ['strong', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      }

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
      }

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

  // Create the ProseMirror node from JSON
  const nodemock = schema1.nodeFromJSON(json);
  //const nodemock = {type:'paragraph',attrs:{align:'left',color:null,id:null,indent:0,lineSpacing:null,paddingBottom:null,paddingTop:null,capco:null,styleName:'FM_chpara'},content:[{type:'text',marks:[{type:'mark-font-size',attrs:{pt:18,overridden:false}},{type:'mark-font-type',attrs:{name:'Times New Roman',overridden:false}},{type:'mark-text-color',attrs:{color:'#0d69f2',overridden:false}}],text:'fggfdfgfghfghfgh'}]}
  it('should handle addMarksToLine', () => {
    expect(addMarksToLine(trmock, statemock, nodemock, 0, true)).toBeUndefined();
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

    // Create the ProseMirror node from JSON
    const nodemock = schema1.nodeFromJSON(json);
    expect(addMarksToLine(trmock, statemock, nodemock, 0, false)).toBeUndefined();
  });
  it('should handle manageElementsAfterSelection', () => {
    expect(manageElementsAfterSelection([{ node: nodemock }], statemock, trmock)).toBeDefined();
  });
  it('should handle manageElementsAfterSelection', () => {
    expect(manageElementsAfterSelection([{ node: nodemock }], statemock, trmock)).toBeDefined();
  });

  it('should handle insertParagraph', () => {
    const nodeattrs = { 'align': 'left', 'color': null, 'id': null, 'indent': null, 'lineSpacing': '125%', 'paddingBottom': null, 'paddingTop': null, 'capco': null, 'styleName': 'FM_chsubpara1' };
    expect(insertParagraph(nodeattrs, 0, trmock, 1, statemock)).toBeDefined();
  });
  it('should handle addElementEx', () => {
    const nodeattrs = { 'align': 'left', 'color': null, 'id': null, 'indent': null, 'lineSpacing': '125%', 'paddingBottom': null, 'paddingTop': null, 'capco': null, 'styleName': 'FM_chsubpara1' };
    expect(addElementEx(nodeattrs, statemock, trmock, 0, false, 2)).toBeDefined();
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
            styleName: { default: 'test' }
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
            return ['h' + node.attrs.level, { 'data-style-name': node.attrs.styleName }, 0];
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
              attrs: { styleName: 'test' }
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
    const mockselection = { $from: { before: (x) => { return x - 1; } }, $to: { after: (x) => { return x + 1; } } };
    const mockeditorstate = {
      schema: mockschema,
      doc: mockdoc,
      selection: mockselection,
      tr: { setSelection: () => { return { setNodeMarkup: () => { return { removeTextAlignAndLineSpacing: () => { return { createEmptyElement: () => { return {}; } }; } }; }, doc: mockdoc }; } }
    };
    const styl = { 'styleName': 'Normal', 'mode': 1, 'styles': { 'align': 'left', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'A_12', 'fontName': 'Aclonica', 'fontSize': '14', 'strong': true, 'styleLevel': '2', 'hasBullet': true, 'bulletLevel': '272A', 'hasNumbering': false }, 'toc': false, 'isHidden': false };
    jest.spyOn(customstyles, 'getStylesAsync').mockResolvedValue([styl]);
    jest.spyOn(cusstylecommand, 'updateDocument').mockReturnValue({ key: 'mocktr' });
    const customstylecommand = new CustomStyleCommand(styl, 'A_12');

    const editorview = {
      state: mockeditorstate,
      dispatch: () => { return {}; }
    };
    expect(customstylecommand.getCustomStyles('Normal', editorview)).toBeUndefined();
  });
  it('should handle getCustomStyles when styleName null', () => {

    const editorview = {
      state: statemock,
      dispatch: () => { return {}; }
    };
    expect(customstylecommand.getCustomStyles(null, editorview)).toBeUndefined();
  });
  it('should handle getCustomStyles when styleName not equal obj.styleName', () => {
    //const nodeattrs = { 'align': 'left', 'color': null, 'id': null, 'indent': null, 'lineSpacing': '125%', 'paddingBottom': null, 'paddingTop': null, 'capco': null, 'styleName': 'FM_chsubpara1' };
    const styl = { 'styleName': 'test', 'mode': 1, 'styles': { 'align': 'left', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'A_12', 'fontName': 'Aclonica', 'fontSize': '14', 'strong': true, 'styleLevel': '2', 'hasBullet': true, 'bulletLevel': '272A', 'hasNumbering': false }, 'toc': false, 'isHidden': false };
    jest.spyOn(customstyles, 'getStylesAsync').mockResolvedValue([styl]);
    jest.spyOn(cusstylecommand, 'updateDocument').mockReturnValue({ key: 'mocktr' });
    const customstylecommand = new CustomStyleCommand(styl, 'A_12');

    const editorview = {
      state: statemock,
      dispatch: () => { return {}; }
    };
    expect(customstylecommand.getCustomStyles('Normal', editorview)).toBeUndefined();
  });

  it('should handle compareMarkWithStyle when type = mark-font-size ', () => {
    const mark = { 'type': 'mark-font-size', 'attrs': { 'pt': 11, 'overridden': false } };
    const style1 = { 'align': 'justify', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'Normal', 'fontName': 'Arial', 'fontSize': 11, 'strong': true, 'em': true, 'underline': true, 'color': '#c40df2' };
    const retobj = { 'modified': false };
    expect(compareMarkWithStyle(mark, style1, trmock, '', '', retobj, {})).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = em ', () => {
    const mark = { type: { name: 'em' }, attrs: { overridden: false } };
    const style1 = { 'align': 'justify', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'Normal', 'fontName': 'Arial', 'fontSize': 11, 'strong': true, 'em': true, 'underline': true, 'color': '#c40df2' };
    const retobj = { 'modified': false };
    expect(compareMarkWithStyle(mark, style1, trmock, '', '', retobj, {})).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = strong ', () => {
    const mark = { type: { name: 'strong' }, attrs: { overridden: false } };
    const style1 = { 'align': 'justify', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'Normal', 'fontName': 'Arial', 'fontSize': 11, 'strong': true, 'em': true, 'underline': true, 'color': '#c40df2' };
    const retobj = { 'modified': false };
    expect(compareMarkWithStyle(mark, style1, trmock, '', '', retobj, {})).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = MARK_TEXT_COLOR ', () => {
    const mark = { type: { name: 'mark-text-color' }, attrs: { overridden: false } };
    const style1 = { 'align': 'justify', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'Normal', 'fontName': 'Arial', 'fontSize': 11, 'strong': true, 'em': true, 'underline': true, 'color': '#c40df2' };
    const retobj = { 'modified': false };
    expect(compareMarkWithStyle(mark, style1, trmock, '', '', retobj, {})).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = MARK_TEXT_HIGHLIGHT ', () => {
    const mark = { type: { name: 'mark-text-highlight' }, attrs: { overridden: false } };
    const style1 = { 'align': 'left', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'FS_36', 'fontName': 'Arial', 'fontSize': 11, 'textHighlight': '#3b0df2', 'strong': true, 'em': true, 'underline': true };
    const retobj = { 'modified': false };
    expect(compareMarkWithStyle(mark, style1, trmock, '', '', retobj, {})).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = MARK_TEXT_HIGHLIGHT ', () => {
    const mark = { type: { name: 'mark-text-highlight' }, attrs: { overridden: false } };
    const style1 = { 'align': 'justify', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'Normal', 'fontName': 'Arial', 'fontSize': 11, 'strong': true, 'em': true, 'underline': true, 'color': '#c40df2' };
    const retobj = { 'modified': false };
    expect(compareMarkWithStyle(mark, style1, trmock, '', '', retobj, {})).toBeDefined();
  });
  it('should handle compareMarkWithStyle when type = MARK_STRIKE ', () => {
    const mark = { type: { name: 'strike' }, attrs: { overridden: false } };
    const style1 = { 'align': 'justify', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'Normal', 'fontName': 'Arial', 'fontSize': 11, 'strong': true, 'em': true, 'underline': true, 'color': '#c40df2' };
    const retobj = { 'modified': false };
    expect(compareMarkWithStyle(mark, style1, trmock, '', '', retobj, {})).toBeDefined();
  });;
  it('should handle compareMarkWithStyle when type = MARK_UNDERLINE ', () => {
    const mark = { type: { name: 'underline' }, attrs: { overridden: false } };
    const style1 = { 'align': 'justify', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'Normal', 'fontName': 'Arial', 'fontSize': 11, 'strong': true, 'em': true, 'underline': true, 'color': '#c40df2' };
    const retobj = { 'modified': false };
    expect(compareMarkWithStyle(mark, style1, trmock, '', '', retobj, {})).toBeDefined();
  });
  it('should handle compareMarkWithStyle when style not present ', () => {
    const mark = { type: { name: 'underline' }, attrs: { overridden: false } };
    const retobj = { 'modified': false };
    expect(compareMarkWithStyle(mark, null, trmock, '', '', retobj, {})).toBeDefined();
  });;




});
describe('updateDocument', () => {
  const styl = { 'styleName': 'A_12', 'mode': 1, 'styles': { 'align': 'left', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'A_12', 'fontName': 'Aclonica', 'fontSize': '14', 'strong': true, 'styleLevel': '2', 'hasBullet': true, 'bulletLevel': '272A', 'hasNumbering': false }, 'toc': false, 'isHidden': false };
  const trmock = {
    doc: {
      type: 'doc',
      attrs: {
        layout: null,
        padding: null,
        width: null,
        counterFlags: null,
        capcoMode: 0
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
            styleName: 'FM_chpara'
          },
          content: [
            {
              type: 'text',
              marks: [
                {
                  type: 'mark-font-size',
                  attrs: {
                    pt: 18,
                    overridden: false
                  }
                },
                {
                  type: 'mark-font-type',
                  attrs: {
                    name: 'Times New Roman',
                    overridden: false
                  }
                },
                {
                  type: 'mark-text-color',
                  attrs: {
                    color: '#0d69f2',
                    overridden: false
                  }
                }
              ],
              text: 'fggfdfgfghfghfgh'
            }
          ]
        }
      ]
    },
    steps: [
      {
        stepType: 'removeMark',
        mark: {
          type: 'mark-font-size',
          attrs: {
            pt: 14,
            overridden: false
          }
        },
        from: 1,
        to: 17
      },
      {
        stepType: 'removeMark',
        mark: {
          type: 'mark-font-type',
          attrs: {
            name: 'Arial Black',
            overridden: false
          }
        },
        from: 1,
        to: 17
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-font-type',
          attrs: {
            name: 'Times New Roman',
            overridden: false
          }
        },
        from: 1,
        to: 17
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-font-size',
          attrs: {
            pt: 18,
            overridden: false
          }
        },
        from: 1,
        to: 17
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
                styleName: 'A11-Rename'
              }
            }
          ]
        },
        structure: true
      },
      {
        stepType: 'addMark',
        mark: {
          type: 'mark-text-color',
          attrs: {
            color: '#0d69f2',
            overridden: false
          }
        },
        from: 1,
        to: 17
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
                styleName: 'FM_chpara'
              }
            }
          ]
        },
        structure: true
      }
    ],
    docs: [
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 14,
                      overridden: false
                    }
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Arial Black',
                      overridden: false
                    }
                  }
                ],
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      },
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Arial Black',
                      overridden: false
                    }
                  }
                ],
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      },
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      },
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false
                    }
                  }
                ],
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      },
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 18,
                      overridden: false
                    }
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false
                    }
                  }
                ],
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      },
      {
        type: 'doc',
        attrs: {
          layout: null,
          padding: null,
          width: null,
          counterFlags: null,
          capcoMode: 0
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
              styleName: 'A11-Rename'
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'mark-font-size',
                    attrs: {
                      pt: 18,
                      overridden: false
                    }
                  },
                  {
                    type: 'mark-font-type',
                    attrs: {
                      name: 'Times New Roman',
                      overridden: false
                    }
                  },
                  {
                    type: 'mark-text-color',
                    attrs: {
                      color: '#0d69f2',
                      overridden: false
                    }
                  }
                ],
                text: 'fggfdfgfghfghfgh'
              }
            ]
          }
        ]
      }
    ],
    mapping: {
      maps: [
        {
          ranges: [],
          inverted: false
        },
        {
          ranges: [],
          inverted: false
        },
        {
          ranges: [],
          inverted: false
        },
        {
          ranges: [],
          inverted: false
        },
        {
          ranges: [0, 1, 1, 17, 1, 1],
          inverted: false
        },
        {
          ranges: [],
          inverted: false
        },
        {
          ranges: [0, 1, 1, 17, 1, 1],
          inverted: false
        }
      ],
      from: 0,
      to: 7
    },
    curSelectionFor: 5,
    updated: 1,
    meta: {},
    time: 1685096712641,
    curSelection: {
      type: 'text',
      anchor: 0,
      head: 17
    },
    storedMarks: [
      {
        type: 'mark-font-type',
        attrs: {
          name: 'Times New Roman',
          overridden: false
        }
      },
      {
        type: 'mark-font-size',
        attrs: {
          pt: '18',
          overridden: false
        }
      },
      {
        type: 'mark-text-color',
        attrs: {
          color: '#0d69f2',
          overridden: false
        }
      }
    ],
    addMark: (x, y, z) => { return { removeMark: (x, y, z) => { } }; },
    removeMark: (x, y, z) => { return { key: 'mocktr' }; }
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
          href: 'test_href'
        }
      },
      em: {
        parseDOM: [{
          tag: 'i'
        }, {
          tag: 'em'
        }, {
          style: 'font-style=italic'
        }],
        toDOM() {
          return ['em', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      strong: {
        parseDOM: [{
          tag: 'strong'
        }, {
          tag: 'b'
        }, {
          style: 'font-weight'
        }],
        toDOM() {
          return ['strong', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      underline: {
        parseDOM: [{
          tag: 'u'
        }, {
          style: 'text-decoration-line'
        }, {
          style: 'text-decoration'
        }],
        toDOM() {
          return ['u', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      'mark-text-color': {
        attrs: {
          color: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'color'
        }],
        toDOM() {
          return ['span', { 'color': '' }, 0];
        },
      },
      'mark-text-highlight': {
        attrs: {
          highlightColor: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          tag: 'span[style*=background-color]'
        }],
        toDOM() {
          return {
            highlightColor: ''
          };
        },

      },
      'mark-font-size': {
        attrs: {
          pt: {
            default: null
          },
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'font-size'
        }],
        toDOM(mark, inline) {
          return ['Test Mark'];
        }

      },
      'mark-font-type': {
        attrs: {
          name: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'font-family'
        }],
        toDOM() {
          return ['span', 0];
        }
      },
      strong: {
        parseDOM: [{
          tag: 'strong'
        }, {
          tag: 'b'
        }, {
          style: 'font-weight'
        }],

        toDOM() {
          return ['strong', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      }

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
  },
  );
  // Create the EditorState
  const statemock = { schema: schema, doc: doc, selection: { from: 0, to: 1 } };
  // Create the ProseMirror node from JSON
  it('updateDocument', () => {
    expect(updateDocument(statemock, trmock, 'Normal', styl)).toBeDefined();
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
          href: 'test_href'
        }
      },
      em: {
        parseDOM: [{
          tag: 'i'
        }, {
          tag: 'em'
        }, {
          style: 'font-style=italic'
        }],
        toDOM() {
          return ['em', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      strong: {
        parseDOM: [{
          tag: 'strong'
        }, {
          tag: 'b'
        }, {
          style: 'font-weight'
        }],
        toDOM() {
          return ['strong', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      underline: {
        parseDOM: [{
          tag: 'u'
        }, {
          style: 'text-decoration-line'
        }, {
          style: 'text-decoration'
        }],
        toDOM() {
          return ['u', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      },
      'mark-text-color': {
        attrs: {
          color: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'color'
        }],
        toDOM() {
          return ['span', { 'color': '' }, 0];
        },
      },
      'mark-text-highlight': {
        attrs: {
          highlightColor: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          tag: 'span[style*=background-color]'
        }],
        toDOM() {
          return {
            highlightColor: ''
          };
        },

      },
      'mark-font-size': {
        attrs: {
          pt: {
            default: null
          },
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'font-size'
        }],
        toDOM(mark, inline) {
          return ['Test Mark'];
        }

      },
      'mark-font-type': {
        attrs: {
          name: '',
          overridden: {
            hasDefault: true,
            default: false
          }
        },
        inline: true,
        group: 'inline',
        parseDOM: [{
          style: 'font-family'
        }],
        toDOM() {
          return ['span', 0];
        }
      },
      strong: {
        parseDOM: [{
          tag: 'strong'
        }, {
          tag: 'b'
        }, {
          style: 'font-weight'
        }],

        toDOM() {
          return ['strong', 0];
        },
        attrs: {
          overridden: {
            hasDefault: true,
            default: false
          }
        }
      }

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
  },
  );
  // Create the EditorState
  const statemock = { schema: schema, doc: doc, selection: { from: 0, to: 1 } };
  it('should handle isCustomStyleAlreadyApplied', () => {
    expect(isCustomStyleAlreadyApplied('10Normal-@#$-10', statemock)).toBeTruthy();
  });
  it('should handle isLevelUpdated', () => {
    const styl = { 'styleName': 'A_12', 'mode': 1, 'styles': { 'align': 'left', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'A_12', 'fontName': 'Aclonica', 'fontSize': '14', 'strong': true, 'styleLevel': '2', 'hasBullet': true, 'bulletLevel': '272A', 'hasNumbering': false }, 'toc': false, 'isHidden': false };
    expect(isLevelUpdated(statemock, '10Normal-@#$-10', styl)).toBeTruthy();
  });
  it('should handle isLevelUpdated branch coverage', () => {
    const styl = { 'styleName': 'A_12', 'mode': 1, 'styles': { 'align': 'left', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'A_12', 'fontName': 'Aclonica', 'fontSize': '14', 'strong': true, 'styleLevel': undefined, 'hasBullet': true, 'bulletLevel': '272A', 'hasNumbering': true }, 'toc': false, 'isHidden': false };
    expect(isLevelUpdated(statemock, '10Normal-@#$-10', styl)).toBeTruthy();
  });
  it('should handle isLevelUpdated branch coverage', () => {
    const styl = { 'styleName': 'A_12', 'mode': 1, 'styles': { 'align': 'left', 'boldNumbering': true, 'toc': false, 'isHidden': false, 'boldSentence': true, 'nextLineStyleName': 'A_12', 'fontName': 'Aclonica', 'fontSize': '14', 'strong': true, 'styleLevel': '2', 'hasBullet': true, 'bulletLevel': '272A', 'hasNumbering': true }, 'toc': false, 'isHidden': false };
    expect(isLevelUpdated(statemock, '10Normal-@#$-10', styl)).toBeTruthy();
  });
  it('should handle isLevelUpdated branch coverage when style undefined', () => {
    expect(isLevelUpdated(statemock, '10Normal-@#$-10', undefined)).toBeFalsy();
  });
});

describe('updateOverrideFlag', () => {
  it('should handle updateOverrideFlag when styleprop null', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue(null);
    expect(updateOverrideFlag('', {}, {}, 0, 1, {}, {})).toStrictEqual({});
  });
});
describe('applyLatestStyle', () => {
  it('should handle applyLatestStyle if keepmarks is true', () => {
    const mockschema = new Schema({
      nodes: {
        doc: {
          content: 'paragraph+',
        },
        paragraph: {
          content: 'text*',
          attrs: {
            styleName: { default: 'test' }
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
            return ['h' + node.attrs.level, { 'data-style-name': node.attrs.styleName }, 0];
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
              attrs: { styleName: 'Normal' }
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
    expect(applyLatestStyle('', {}, { doc: mockdoc }, { attrs: { lineSpacing: '', indent: '', styleName: '' } }, 0, 1, { styles: { 'lineHeight': '1px' } }, true)).toBeDefined();
  });
  it('should handle applyLatestStyle when styleprops  not there', () => {
    expect(applyLatestStyle('', {}, {}, { attrs: { lineSpacing: '', indent: '', styleName: '' } }, 0, 1, {}, true)).toBeDefined();
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
            styleName: { default: 'test' }
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
            return ['h' + node.attrs.level, { 'data-style-name': node.attrs.styleName }, 0];
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
              attrs: { styleName: 'Normal' }
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
    expect(applyLatestStyle('', {}, { doc: mockdoc }, { attrs: { lineSpacing: '', indent: '', styleName: 'Normal', align: 'justify' }, content: { content: [{ type: { name: 'image' } }] } }, 0, 1, { styles: { 'indent': '1px' } }, true)).toBeDefined();
  });
});
describe('allowCustomLevelIndent', () => {
  it('should handle allowCustomLevelIndent', () => {
    const parentElement = {
      attrs: {
        styleName: 'heading'
      },
      type: { name: 'paragraph' }
    };
    const element = {
      parent: parentElement
    };
    expect(allowCustomLevelIndent({ doc: { resolve: () => { return element; } } }, 0, 'Normal', 1)).toBeTruthy();
  });
  it('should handle allowCustomLevelIndent when startPos not less than 2', () => {
    const parentElement = {
      attrs: {
        styleName: 'heading'
      },
      type: { name: 'paragraph' }
    };
    const element = {
      parent: parentElement
    };
    expect(allowCustomLevelIndent({ doc: { resolve: () => { return element; } } }, 2, 'Normal', 1)).toBeTruthy();
  });
  it('should handle allowCustomLevelIndent when RESERVED_STYLE_NONE == node.attrs.styleName', () => {
    const parentElement = {
      attrs: {
        styleName: 'Normal'
      },
      type: { name: 'paragraph' }
    };
    const element = {
      parent: parentElement
    };
    expect(allowCustomLevelIndent({ doc: { resolve: () => { return element; } } }, 0, 'test', 1)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when nodeStyleLevel < styleLevel and styleLevel - nodeStyleLevel === 1', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({ styles: { styleLevel: 1, hasNumbering: true } });
    const parentElement = {
      attrs: {
        styleName: undefined
      },
      type: { name: 'paragraph' }
    };
    const element = {
      parent: parentElement
    };
    expect(allowCustomLevelIndent({ doc: { resolve: () => { return element; } } }, 0, 'test', 1)).toBeTruthy();
  });
  it('should handle allowCustomLevelIndent when nodeStyleLevel < styleLevel and styleLevel - nodeStyleLevel === 1 and styleLevel - nodeStyleLevel != 1', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({ styles: { styleLevel: 2, hasNumbering: true } });
    const parentElement = {
      attrs: {
        styleName: undefined
      },
      type: { name: 'paragraph' }
    };
    const element = {
      parent: parentElement
    };
    expect(allowCustomLevelIndent({ doc: { resolve: () => { return element; } } }, 0, 'test', 1)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when  isAllowedNode(node) is false', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({ styles: { styleLevel: 2, hasNumbering: true } });
    const parentElement = {
      attrs: {
        styleName: undefined
      },
      type: { name: 'span' }
    };
    const element = {
      parent: parentElement
    };
    expect(allowCustomLevelIndent({ doc: { resolve: () => { return element; } } }, 0, 'test', 1)).toBeFalsy();
  });

  it('should handle allowCustomLevelIndent when element not present', () => {
    expect(allowCustomLevelIndent({ doc: { resolve: () => { return null; } } }, 0, 'Normal', 1)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when delta = 0', () => {
    const parentElement = {
      attrs: {
        styleName: 'heading'
      },
      type: { name: 'paragraph' }
    };
    const element = {
      parent: parentElement
    };
    expect(allowCustomLevelIndent({ doc: { resolve: () => { return element; }, nodeSize: 6 } }, 0, 'Normal', 0)).toBeTruthy();
  });
  it('should handle allowCustomLevelIndent when delta = 0 and when element not present', () => {

    expect(allowCustomLevelIndent({ doc: { resolve: () => { return null; }, nodeSize: 6 } }, 0, 'Normal', 0)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when delta = 0 when not isAllowed(node)', () => {
    const parentElement = {
      attrs: {
        styleName: 'heading'
      },
      type: { name: 'span' }
    };
    const element = {
      parent: parentElement
    };
    expect(allowCustomLevelIndent({ doc: { resolve: () => { return element; }, nodeSize: 6 } }, 0, 'Normal', 0)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when delta = 0 when normal is node.attrs.styleName', () => {
    const parentElement = {
      attrs: {
        styleName: 'Normal'
      },
      type: { name: 'paragraph' }
    };
    const element = {
      parent: parentElement
    };
    expect(allowCustomLevelIndent({ doc: { resolve: () => { return element; }, nodeSize: 6 } }, 0, 'Normal', 0)).toBeFalsy();
  });
  it('should handle allowCustomLevelIndent when nodeStyleLevel < styleLevel', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValueOnce({ styles: { styleLevel: 2, hasNumbering: true } }).mockReturnValueOnce({ styles: { styleLevel: 1, hasNumbering: true } });
    const parentElement = {
      attrs: {
        styleName: 'test'
      },
      type: { name: 'paragraph' }
    };
    const element = {
      parent: parentElement
    };
    expect(allowCustomLevelIndent({ doc: { resolve: () => { return element; }, nodeSize: 6 } }, 0, 'Normal', 0)).toBeFalsy();
  });
});

describe('insertParagraph', () => {
  it('should handle insertParagraph when state is null', () => {
    expect(insertParagraph([], 1, {}, 1, null)).toStrictEqual({});
  });
});
describe('applyLineStyle', () => {
  it('should handle applyLineStyle ', () => {
    jest.spyOn(customstyles, 'getCustomStyleByName').mockReturnValue({ styles: { boldPartial: true } });
    expect(applyLineStyle({ schema: { marks: { 'strong': { create: () => { return 1; } } } } }, { selection: { $from: { before: (x) => { return x - 1; }, pos: 0 }, $to: { after: (x) => { return x + 1; }, pos: 1 } }, doc: { nodeAt: () => { return { type: { name: 'table' } }; } }, addMark: () => { return { removeMark: () => { return {}; } }; } }, { attrs: { styleName: 'test' }, descendants: () => { return 'text'; } }, 0)).toBeDefined();
  });
  it('should handle applyLineStyle when tr is null', () => {

    expect(applyLineStyle({ schema: { marks: { 'strong': { create: () => { return 1; } } } }, tr: { selection: { $from: { before: (x) => { return x - 1; }, pos: 0 }, $to: { after: (x) => { return x + 1; }, pos: 1 } }, doc: { nodeAt: () => { return { type: { name: 'table' } }; } }, addMark: () => { return { removeMark: () => { return {}; } }; } } }, null, { attrs: { styleName: 'test' }, descendants: () => { return 'text'; } }, 0)).toBeDefined();
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
            styleName: { default: 'test' }
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
            return ['h' + node.attrs.level, { 'data-style-name': node.attrs.styleName }, 0];
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
    expect(isLevelUpdated({ schema: mockschema, doc: mockdoc }, 'Normal', { styles: {} })).toBeDefined();
  });
});
describe('removeAllMarksExceptLink', () => {
  it('should handle removeAllMarksExceptLink', () => {
    const strongMark = new Mark({
      name: 'strong',
    });

    const mockschema = new Schema({
      nodes: {
        doc: {
          content: 'paragraph+',
        },
        paragraph: {
          content: 'text*',
          attrs: {
            styleName: { default: 'test' }
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
            return ['h' + node.attrs.level, { 'data-style-name': node.attrs.styleName }, 0];
          },
        },
        text: {
          group: 'inline',
        },
      },
      marks: {
        strong: strongMark
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
            { type: 'strong', attrs: { ['overridden']: false } },
          ],
        },

      ],
    });
    expect(removeAllMarksExceptLink(0, 1, { doc: mockdoc, removeMark: () => { return { doc: mockdoc }; } }, {}, {}, {})).toBeDefined();
  });
  it('should handle removeAllMarksExceptLink when mark.attrs[ATTR_OVERRIDDEN] && link === mark.type.name', () => {
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
            styleName: { default: 'test' }
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
            return ['h' + node.attrs.level, { 'data-style-name': node.attrs.styleName }, 0];
          },
        },
        text: {
          group: 'inline',
        },
      },
      marks: {
        link: linkmark
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
    expect(removeAllMarksExceptLink(0, 1, { doc: mockdoc, removeMark: () => { return { doc: mockdoc }; } }, {}, {}, {})).toBeDefined();
  });
});
describe('handleRemoveMarks', () => {
  it('should handle handleRemoveMarks', () => {
    expect(handleRemoveMarks({ removeMark: () => { return {}; } }, [{ mark: { type: { name: 'mark-text-highlight' }, attrs: { 'overridden': undefined } } }], 0, 1, {}, { styles: {} }, {})).toBeDefined();
  });
  it('should handle handleRemoveMarks when styleProps null', () => {
    expect(handleRemoveMarks({ removeMark: () => { return {}; } }, [{ mark: { type: { name: 'mark-text-highlight' }, attrs: { 'overridden': true } } }], 0, 1, {}, null, {})).toBeDefined();
  });
});



