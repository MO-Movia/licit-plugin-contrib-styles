import CustomstyleDropDownCommand from './CustomstyleDropDownCommand';
import { CustomstylePlugin } from '../index'
import { createEditor, doc, p } from 'jest-prosemirror';
import { EditorState } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';

describe('customstyledropdowncommand',()=>{
    //const plugin = new CustomstylePlugin(TestCustomStyleRuntime);
    const editor = createEditor(doc(p('<cursor>')), {
        plugins: [],
    });
    const schema = new Schema({
        nodes: {
            doc: {
                attrs: {
                    layout: {
                        default: null
                    },
                    padding: {
                        default: null
                    },
                    width: {
                        default: null
                    },
                    counterFlags: {
                        default: null
                    },
                    capcoMode: {
                        default: 1
                    },
                    defaultManualCapco: {
                        default: "C"
                    }
                },
                content: "block+"
            },
            text: {},
            paragraph: {
                attrs: {
                    align: {
                        default: null
                    },
                    color: {
                        default: null
                    },
                    id: {
                        default: null
                    },
                    indent: {
                        default: null
                    },
                    lineSpacing: {
                        default: null
                    },
                    paddingBottom: {
                        default: null
                    },
                    paddingTop: {
                        default: null
                    },
                    capco: {
                        default: null
                    },
                    paddingTop: {
                        default: null
                    }
                },
                content: "inline*",
                group: "block",
                parseDOM: [
                    {
                        tag: "p"
                    }
                ]
            },
            blockquote:
            {
                attrs: {
                    align: {
                        default: null
                    },
                    color: {
                        default: null
                    },
                    id: {
                        default: null
                    },
                    indent: {
                        default: null
                    },
                    lineSpacing: {
                        default: null
                    },
                    paddingBottom: {
                        default: null
                    },
                    paddingTop: {
                        default: null
                    },
                    capco: {
                        default: null
                    },
                    paddingTop: {
                        default: null
                    }
                },
                content: "inline*",
                group: "block",
                parseDOM: [
                    {
                        tag: "blockquote"
                    }
                ],
                defining: true
            },
            math:
            {
                inline: true,
                attrs: {
                    align: {
                        default: null
                    },
                    latex: {
                        default: ""
                    }
                },
                group: "inline",
                draggable: true,
                parseDOM: [
                    {
                        tag: "math[data-latex]"
                    },
                    {
                        tag: "span[data-latex]"
                    }
                ]
            },
            hard_break:
            {
                inline: true,
                group: "inline",
                selectable: false,
                parseDOM: [
                    {
                        tag: "br"
                    }
                ]
            },
            bullet_list:
            {
                attrs: {
                    id: {
                        default: null
                    },
                    indent: {
                        default: 0
                    },
                    listStyleType: {
                        default: null
                    }
                },
                group: "block",
                content: "list_item+",
                parseDOM: [
                    {
                        tag: "ul"
                    }
                ]
            },
            ordered_list:
            {
                attrs: {
                    id: {
                        default: null
                    },
                    counterRese: {
                        default: null
                    },
                    indent: {
                        default: 0
                    },
                    following: {
                        default: null
                    },
                    listStyleType: {
                        default: null
                    },
                    name: {
                        default: null
                    },
                    start: {
                        default: 1
                    },
                    type: {
                        default: "decimal"
                    },
                    styleName: {
                        default: "None"
                    }
                },
                group: "block",
                content: "list_item+",
                parseDOM: [
                    {
                        tag: "ol"
                    }
                ]
            },
            list_item:
            {
                attrs: {
                    align: {
                        default: null
                    }
                },
                content: "paragraph block*",
                parseDOM: [
                    {
                        tag: "li"
                    }
                ]
            },
            bookmark:
            {
                inline: true,
                attrs: {
                    id: {
                        default: null
                    },
                    visible: {
                        default: null
                    }
                },
                group: "inline",
                draggable: true,
                parseDOM: [
                    {
                        tag: "a[data-bookmark-id]"
                    }
                ]
            },
            table:
            {
                content: "table_row+",
                tableRole: "table",
                isolating: true,
                group: "block",
                parseDOM: [
                    {
                        tag: "table"
                    }
                ],
                attrs: {
                    marginLeft: {
                        default: null
                    }
                }
            },
            table_row:
            {
                content: "(table_cell | table_header)*",
                tableRole: "row",
                parseDOM: [
                    {
                        tag: "tr"
                    }
                ]
            },
            table_cell:
            {
                content: "block+",
                attrs: {
                    colspan: {
                        default: 1
                    },
                    rowspan: {
                        default: 1
                    },
                    colwidth: {
                        default: null
                    },
                    borderColor: {
                        default: null
                    },
                    background: {
                        default: null
                    }
                },
                tableRole: "cell",
                isolating: true,
                parseDOM: [
                    {
                        tag: "td"
                    }
                ]
            },

            table_header:
            {
                content: "block+",
                attrs: {
                    colspan: {
                        default: 1
                    },
                    rowspan: {
                        default: 1
                    },
                    colwidth: {
                        default: null
                    },
                    borderColor: {
                        default: null
                    },
                    background: {
                        default: null
                    }
                },
                tableRole: "header_cell",
                isolating: true,
                parseDOM: [
                    {
                        tag: "th"
                    }
                ]
            }
        },
        marks: { "content": ["link", { "attrs": { "href": { "default": null }, "rel": { "default": "noopener noreferrer nofollow" }, "target": { "default": "blank" }, "title": { "default": null } }, "inclusive": false, "parseDOM": [{ "tag": "a[href]" }] }, "mark-no-break", { "parseDOM": [{ "tag": "nobr" }] }, "code", { "parseDOM": [{ "tag": "code" }] }, "em", { "parseDOM": [{ "tag": "i" }, { "tag": "em" }, { "style": "font-style=italic" }], "attrs": { "overridden": { "hasDefault": true, "default": false } } }, "mark-font-size", { "attrs": { "pt": { "default": null }, "overridden": { "hasDefault": true, "default": false } }, "inline": true, "group": "inline", "parseDOM": [{ "style": "font-size" }] }, "mark-font-type", { "attrs": { "name": "", "overridden": { "hasDefault": true, "default": false } }, "inline": true, "group": "inline", "parseDOM": [{ "style": "font-family" }] }, "spacer", { "attrs": { "size": { "default": "tab" } }, "defining": true, "draggable": false, "excludes": "_", "group": "inline", "inclusive": false, "inline": true, "spanning": false, "parseDOM": [{ "tag": "span[data-spacer-size]" }] }, "strike", { "parseDOM": [{ "style": "text-decoration" }], "attrs": { "overridden": { "hasDefault": true, "default": false } } }, "strong", { "parseDOM": [{ "tag": "strong" }, { "tag": "b" }, { "style": "font-weight" }], "attrs": { "overridden": { "hasDefault": true, "default": false } } }, "super", { "parseDOM": [{ "tag": "sup" }, { "style": "vertical-align" }], "attrs": { "overridden": { "hasDefault": true, "default": false } } }, "sub", { "parseDOM": [{ "tag": "sub" }, { "style": "vertical-align" }] }, "mark-text-color", { "attrs": { "color": "", "overridden": { "hasDefault": true, "default": false } }, "inline": true, "group": "inline", "parseDOM": [{ "style": "color" }] }, "mark-text-highlight", { "attrs": { "highlightColor": "", "overridden": { "hasDefault": true, "default": false } }, "inline": true, "group": "inline", "parseDOM": [{ "tag": "span[style*=background-color]" }] }, "mark-text-selection", { "attrs": { "id": "" }, "inline": true, "group": "inline", "parseDOM": [{ "tag": "czi-text-selection" }] }, "underline", { "parseDOM": [{ "tag": "u" }, { "style": "text-decoration-line" }, { "style": "text-decoration" }], "attrs": { "overridden": { "hasDefault": true, "default": false } } }] }
    });
    const mockdoc =doc(p('Hello World!!!'));
    mockdoc.styleName ='';
    const state = EditorState.create({
        doc: mockdoc,
        schema: schema,
        selection: editor.selection,
        plugins: [],
        styleName:'test'
    });

    const props= {
        dispatch: (tr) =>{},
        editorState: state,
        editorView: editor.view,
      };
    const customstyledropdowncommand = new CustomstyleDropDownCommand(props);

    it('should handle customstyledropdowncommand',()=>{
      expect(customstyledropdowncommand.getCommandGroups()).toBeDefined();
    })
    it('should handle isValidCustomstyle',()=>{
        customstyledropdowncommand.state = state;
        expect(customstyledropdowncommand.isValidCustomstyle('test')).toBeFalsy();
      })
      it('should handle isValidCustomstyle',()=>{
    
        expect(customstyledropdowncommand.staticCommands()).toBeInstanceOf(Array);
      })
      it('should handle isValidCustomstyle',()=>{
        const node = {type:{name:'paragraph'}}
        expect(customstyledropdowncommand.isAllowedNode(node)).toBe(true);
      })
      it('should handle isValidCustomstyle',()=>{
        const node = {type:{name:'ordered_list'}}
        expect(customstyledropdowncommand.isAllowedNode(node)).toBe(true);
      })
      xit('should handle isValidCustomstyle',()=>{
        //const node = {type:{name:'ordered_list'}}
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
                  return ['img', { src: node.attrs.src,align: node.attrs.align ||''}];
                }
              }
            }
          });
          //const content = DOMParser.fromSchema(schema).parse(document.createElement('div').appendChild(document.createElement('img')));
          const MockeditorState = {
            schema:mockSchema,
            plugins: [],
            selection:{from:0,to:1},
            doc: new doc({"type":"doc","attrs":{"layout":null,"padding":null,"width":null,"counterFlags":null,"capcoMode":0},"content":[{"type":"paragraph","attrs":{"align":null,"color":null,"id":null,"indent":null,"lineSpacing":null,"paddingBottom":null,"paddingTop":null,"capco":null,"styleName":null}}]})
          };
          const el = document.createElement('div')
          const mockEditorView = {
            state:MockeditorState,
    
          };
        customstyledropdowncommand.props = {
            dispatch:(tr) =>{},
            editorState:MockeditorState,
            editorView:mockEditorView
        }
        expect(customstyledropdowncommand.render()).toBe(true);
      })
})