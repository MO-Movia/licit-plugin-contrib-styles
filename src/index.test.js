import { createEditor, doc, p } from 'jest-prosemirror';
//import { EditorState, TextSelection } from 'prosemirror-state';
import CustomstyleDropDownCommand from './ui/CustomstyleDropDownCommand';
//import { CustomstylePlugin } from './index';
import uuid from './ui/Uuid'
import { CustomstylePlugin } from './index';
import { schema, builders } from 'prosemirror-test-builder';
import {
    EditorState,
    Plugin,
    PluginKey,
    TextSelection,
    Transaction 
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
import { Schema } from 'prosemirror-model';
import { isTransparent, toCSSColor } from './toCSSColor';
import { EditorView } from 'prosemirror-view';
import * as DOMfunc from './CustomStyleNodeSpec';
import * as CustStyl from './customStyle';
import * as CustomStylNodeSpec from './CustomStyleNodeSpec';
import * as MenuUI from './ui/CustomMenuUI';

import sanitizeURL from './sanitizeURL';
import CustomStyleCommand from './CustomStyleCommand';
import {
    getCustomStyleCommands,
    getMarkByStyleName,
} from './CustomStyleCommand';
//import { Schema } from 'prosemirror-model';
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
const mark_type_attr={
    style : 'font-family: Arial'
}
class TestPlugin extends Plugin {
    constructor() {
        super({
            key: new PluginKey('TestPlugin'),
        });

    }
}
const styl = { "styleName": "A_12", "mode": 1, "styles": { "align": "left", "boldNumbering": true, "toc": false, "isHidden": false, "boldSentence": true, "nextLineStyleName": "A_12", "fontName": "Aclonica", "fontSize": "14", "strong": true, "styleLevel": "2", "hasBullet": true, "bulletLevel": "272A", "hasNumbering": false }, "toc": false, "isHidden": false }
const styl2 = { "styleName": "A_123", "mode": 1, "styles": { "align": "left", "boldNumbering": true, "toc": false, "isHidden": false, "boldSentence": true, "nextLineStyleName": "A_12", "fontName": "Aclonica", "fontSize": "14", "strong": true, "styleLevel": "2", "hasBullet": true, "bulletLevel": "272A", "hasNumbering": false }, "toc": false, "isHidden": false }
const TestCustomStyleRuntime = {
    saveStyle: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
    getStylesAsync: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
    renameStyle: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
    removeStyle: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
    fetchStyles: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
    buildRoute: jest.fn().mockReturnValue(Promise.resolve([styl, styl2])),
}
const TestSchema = new Schema({
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
            ],
            toDOM() {
                return ['p', 0];
            },
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

            toDOM() {
                return ['p', 0];
            },
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
            ],
            toDOM() {
                return ['p', 0];
            },
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
            ],
            toDOM() {
                return ['p', 0];
            },
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
            ],
            toDOM() {
                return ['p', 0];
            },
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
            ],
            toDOM() {
                return ['p', 0];
            },
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
            ],
            toDOM() {
                return ['p', 0];
            },
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
            ],
            toDOM() {
                return ['p', 0];
            },
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
            toDOM() {
                return ['p', 0];
            },
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
            ],
            toDOM() {
                return ['p', 0];
            },
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
            ],
            toDOM() {
                return ['p', 0];
            },
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
            ],
            toDOM() {
                return ['p', 0];
            },
        }
    },
    spec: {
        nodes: {
            doc: {
                content: 'paragraph+',
                resolve() {
                    return []
                }
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
    marks1: {
        "content": ["link", {
            "attrs": {
                "href": {
                    "default": null
                },
                "rel": {
                    "default": "noopener noreferrer nofollow"
                },
                "target": {
                    "default": "blank"
                },
                "title": {
                    "default": null
                }
            },
            "inclusive": false,
            "parseDOM": [{
                "tag": "a[href]"
            }]
        }, "mark-no-break", {
                "parseDOM": [{
                    "tag": "nobr"
                }]
            }, "code", {
                "parseDOM": [{
                    "tag": "code"
                }]
            }, "em", {
                "parseDOM": [{
                    "tag": "i"
                }, {
                    "tag": "em"
                }, {
                    "style": "font-style=italic"
                }],
                "attrs": {
                    "overridden": {
                        "hasDefault": true,
                        "default": false
                    }
                }
            }, "mark-font-size", {
                "attrs": {
                    "pt": {
                        "default": null
                    },
                    "overridden": {
                        "hasDefault": true,
                        "default": false
                    }
                },
                "inline": true,
                "group": "inline",
                "parseDOM": [{
                    "style": "font-size"
                }]
            }, "mark-font-type", {
                "attrs": {
                    "name": "",
                    "overridden": {
                        "hasDefault": true,
                        "default": false
                    }
                },
                "inline": true,
                "group": "inline",
                "parseDOM": [{
                    "style": "font-family"
                }]
            }, "spacer", {
                "attrs": {
                    "size": {
                        "default": "tab"
                    }
                },
                "defining": true,
                "draggable": false,
                "excludes": "_",
                "group": "inline",
                "inclusive": false,
                "inline": true,
                "spanning": false,
                "parseDOM": [{
                    "tag": "span[data-spacer-size]"
                }]
            }, "strike", {
                "parseDOM": [{
                    "style": "text-decoration"
                }],
                "attrs": {
                    "overridden": {
                        "hasDefault": true,
                        "default": false
                    }
                }
            }, "strong", {
                "parseDOM": [{
                    "tag": "strong"
                }, {
                    "tag": "b"
                }, {
                    "style": "font-weight"
                }],
                "attrs": {
                    "overridden": {
                        "hasDefault": true,
                        "default": false
                    }
                }
            }, "super", {
                "parseDOM": [{
                    "tag": "sup"
                }, {
                    "style": "vertical-align"
                }],
                "attrs": {
                    "overridden": {
                        "hasDefault": true,
                        "default": false
                    }
                }
            }, "sub", {
                "parseDOM": [{
                    "tag": "sub"
                }, {
                    "style": "vertical-align"
                }]
            }, "mark-text-color", {
                "attrs": {
                    "color": "",
                    "overridden": {
                        "hasDefault": true,
                        "default": false
                    }
                },
                "inline": true,
                "group": "inline",
                "parseDOM": [{
                    "style": "color"
                }]
            }, "mark-text-highlight", {
                "attrs": {
                    "highlightColor": "",
                    "overridden": {
                        "hasDefault": true,
                        "default": false
                    }
                },
                "inline": true,
                "group": "inline",
                "parseDOM": [{
                    "tag": "span[style*=background-color]"
                }]
            }, "mark-text-selection", {
                "attrs": {
                    "id": ""
                },
                "inline": true,
                "group": "inline",
                "parseDOM": [{
                    "tag": "czi-text-selection"
                }]
            }, "underline", {
                "parseDOM": [{
                    "tag": "u"
                }, {
                    "style": "text-decoration-line"
                }, {
                    "style": "text-decoration"
                }],
                "attrs": {
                    "overridden": {
                        "hasDefault": true,
                        "default": false
                    }
                }
            }]
    },
    marks: {
        link: {
            attrs: {
                href: 'test_href'
            }
        },
        em: {
            parseDOM: [{
                tag: "i"
            }, {
                tag: "em"
            }, {
                style: "font-style=italic"
            }],
            attrs: {
                overridden: {
                    hasDefault: true,
                    default: false
                }
            }
        },
        strong: {
            parseDOM: [{
                tag: "strong"
            }, {
                tag: "b"
            }, {
                style: "font-weight"
            }],
            attrs: {
                overridden: {
                    hasDefault: true,
                    default: false
                }
            }
        }, underline: {
            parseDOM: [{
                tag: "u"
            }, {
                style: "text-decoration-line"
            }, {
                style: "text-decoration"
            }],
            attrs: {
                overridden: {
                    hasDefault: true,
                    default: false
                }
            }
        }

    },
    // marks: { "content": [
    //     "link", { "attrs": { "href": { "default": null }, "rel": { "default": "noopener noreferrer nofollow" }, "target": { "default": "blank" }, "title": { "default": null } }, "inclusive": false, "parseDOM": [{ "tag": "a[href]" }] }, "mark-no-break", { "parseDOM": [{ "tag": "nobr" }] }, "code", { "parseDOM": [{ "tag": "code" }] }, "em", { "parseDOM": [{ "tag": "i" }, { "tag": "em" }, { "style": "font-style=italic" }], "attrs": { "overridden": { "hasDefault": true, "default": false } } }, "mark-font-size", { "attrs": { "pt": { "default": null }, "overridden": { "hasDefault": true, "default": false } }, "inline": true, "group": "inline", "parseDOM": [{ "style": "font-size" }] }, "mark-font-type", { "attrs": { "name": "", "overridden": { "hasDefault": true, "default": false } }, "inline": true, "group": "inline", "parseDOM": [{ "style": "font-family" }] }, "spacer", { "attrs": { "size": { "default": "tab" } }, "defining": true, "draggable": false, "excludes": "_", "group": "inline", "inclusive": false, "inline": true, "spanning": false, "parseDOM": [{ "tag": "span[data-spacer-size]" }] }, "strike", { "parseDOM": [{ "style": "text-decoration" }], "attrs": { "overridden": { "hasDefault": true, "default": false } } }, "strong", { "parseDOM": [{ "tag": "strong" }, { "tag": "b" }, { "style": "font-weight" }], "attrs": { "overridden": { "hasDefault": true, "default": false } } }, "super", { "parseDOM": [{ "tag": "sup" }, { "style": "vertical-align" }], "attrs": { "overridden": { "hasDefault": true, "default": false } } }, "sub", { "parseDOM": [{ "tag": "sub" }, { "style": "vertical-align" }] }, "mark-text-color", { "attrs": { "color": "", "overridden": { "hasDefault": true, "default": false } }, "inline": true, "group": "inline", "parseDOM": [{ "style": "color" }] }, "mark-text-highlight", { "attrs": { "highlightColor": "", "overridden": { "hasDefault": true, "default": false } }, "inline": true, "group": "inline", "parseDOM": [{ "tag": "span[style*=background-color]" }] }, "mark-text-selection", { "attrs": { "id": "" }, "inline": true, "group": "inline", "parseDOM": [{ "tag": "czi-text-selection" }] }, "underline", { "parseDOM": [{ "tag": "u" }, { "style": "text-decoration-line" }, { "style": "text-decoration" }], "attrs": { "overridden": { "hasDefault": true, "default": false } } }] }
});
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
                tag: "i"
            }, {
                tag: "em"
            }, {
                style: "font-style=italic"
            }],
            toDOM() {
                return  ['em', 0];
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
                tag: "strong"
            }, {
                tag: "b"
            }, {
                style: "font-weight"
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
                tag: "u"
            }, {
                style: "text-decoration-line"
            }, {
                style: "text-decoration"
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
        color: "",
        overridden: {
            hasDefault: true,
            default: false
        }
    },
    inline: true,
    group: "inline",
    parseDOM: [{
        style: "color"
    }],
    toDOM() {
        return ['span', { 'color':'' }, 0];
      },
},
    'mark-text-highlight': {
    attrs: {
        highlightColor: "",
        overridden: {
            hasDefault: true,
            default: false
        }
    },
    inline: true,
    group: "inline",
    parseDOM: [{
        tag: "span[style*=background-color]"
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
    group: "inline",
    parseDOM: [{
        style: "font-size"
    }],
    toDOM(mark,inline){
        return ['Test Mark'];
    }
    
},
   'mark-font-type': {
    attrs: {
        name: "",
        overridden: {
            hasDefault: true,
            default: false
        }
    },
    inline: true,
    group: "inline",
    parseDOM: [{
        style: "font-family"
    }],
    toDOM(){
        return ['span', mark_type_attr, 0];
    }
},
    strong: {
    parseDOM: [{
        tag: "strong"
    }, {
        tag: "b"
    }, {
        style: "font-weight"
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
        text: { },
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

    // const content = {
    //     attrs: attrs,
    //     content: 'inline*',
    //     group: 'block',
    //     parseDOM: [{ tag: 'p' }],
    //     toDOM() {
    //         return ['p', attrs, 0];
    //     },
    // };

   // const nodeSchema = new Schema({
    //    nodes: schema.spec.nodes,
    //    marks: schema.spec.marks,
   // });
    const plugin = new CustomstylePlugin(TestCustomStyleRuntime, false);
    const toDOMMock = jest.spyOn(DOMfunc, 'toCustomStyleDOM');
    toDOMMock.mockImplementation((_base, _node) => {
        return ['p', attrs, 0];
    });
    //const effSchema = plugin.getEffectiveSchema(nodeSchema);
    //const effSchema = mockSchema;
   // const { doc, p } = builders(effSchema, { p: { nodeType: 'paragraph' } });

    //const newNode = effSchema.node(effSchema.nodes.paragraph,{});
    const state = EditorState.create({

        schema: mockSchema,

        plugins: [plugin],
    });

   // const dom = document.querySelector('#editor');
    const view = new EditorView(document.createElement('div'), {
        state,
    });
    // const view = new EditorView(
    //     { mount: dom },
    //     {
    //         state: state,
    //     }
    // );
    // it('CustomStyleEditor save', () => {

    //   const prop = {
    //     styleName: 'fs-test-347',
    //     mode: 0,
    //     description: 'fs-test-347',
    //     styles: {
    //       align: 'left',
    //       boldNumbering: true,
    //       boldSentence: true,
    //       em: true,
    //       fontName: 'Arial',
    //       fontSize: '11',
    //       nextLineStyleName: 'None',
    //       strong: true,
    //       toc: true,
    //       isHidden:false
    //     },
    //     editorView: view,
    //   };
    //   const tr = state.tr;
    // });

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
        setStyles(customStyleList);
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
        const hidenumbering = setHidenumberingFlag(true);
        const bOK = getHidenumberingFlag();
        expect(bOK).toEqual(true);
    });

    it('getCustomStyleByLevel in customstyle', () => {
        let customstyle = [];
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
                    hasNumbering:true,
                    styleLevel:2,
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
                nextLineStyleName: "None",
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
        let customstyle = [];
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
        let customstyle = [];
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
        let customstyle = [];
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
    xit('should get Style', () => {
        const arg = {
            align: 'left',
            capco: null,
            color: null,
            id: null,
            indent: 0,
            lineSpacing: null,
            paddingBottom: null,
            paddingTop: null,
            styleName: 'FS_Paragraphss',
        };
        const res = CustomStylNodeSpec.getStyle(arg);
        expect(res).toBeTruthy;
    });

    it('Remove CustomStyleByName', () => {
        const customcommand = new CustomStyleCommand('NewStyle', 'NewStyle');

        const selection = TextSelection.create(view.state.doc, 0, 1);
        const tr = view.state.tr.setSelection(selection);
        view.updateState(
            view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
        );

        const disp = view.dispatch(tr);

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

        const disp = view.dispatch(tr);

        const res = customcommand.execute(state, view.dispatch, view);

        expect(res).toStrictEqual(true);
    });

    it('getCustomStyleCommands in CustomStyleCommand', () => {
        const customcommand = new CustomStyleCommand('None', 'None');

        const selection = TextSelection.create(view.state.doc, 1, 2);
        const tr = view.state.tr.setSelection(selection);
        view.updateState(
            view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
        );

        const disp = view.dispatch(tr);
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
        const res = getCustomStyleCommands(styleprops);
    });

    it('getMarkByStyleName in CustomStyleCommand', () => {
        const customcommand = new CustomStyleCommand('None', 'None');

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

        const content = {
            attrs: attrs,
            content: 'inline*',
            group: 'block',
            // parseDOM: { } ,
            // toDOM
        };

        const nodeSchema = new Schema({
            nodes: schema.spec.nodes,
            marks: schema.spec.marks,
        });

        const plugin = new CustomstylePlugin(TestCustomStyleRuntime, false);
        const toDOMMock = jest.spyOn(DOMfunc, 'toCustomStyleDOM');
        toDOMMock.mockImplementation((_base, _node) => {
            return ['p', attrs, 0];
        });
        // const effSchema = plugin.getEffectiveSchema(nodeSchema);
        const effSchema = mockSchema;
        const { doc, p } = builders(effSchema, { p: { nodeType: 'paragraph' } });

        //const newNode = effSchema.node(effSchema.nodes.paragraph,{});
        const state = EditorState.create({
            doc: doc(p('Hello World!!!')),
            schema: mockSchema,
            plugins: [plugin],
        });

        const dom = document.querySelector('#editor');
        // const view = new EditorView(
        //     { mount: dom },
        //     {
        //         state: state,
        //     }
        // );
        const view = new EditorView(document.querySelector('#editor'), {
            state,
        });
        const selection = TextSelection.create(view.state.doc, 1, 2);
        const tr = view.state.tr.setSelection(selection);
        view.updateState(
            view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
        );
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
        };
        const res = getMarkByStyleName('BIU', effSchema);
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
    const testData = ['none', 'newstyle', 'editall','clearstyle'];
    test.each(testData)('myFunc work correctly for %s', (val) => {
        const dom = document.querySelector('#editor');
        //const styleRuntime = new CustomStyleRuntime();
        const toDOMMock = jest.spyOn(DOMfunc, 'toCustomStyleDOM');
        toDOMMock.mockImplementation((_base, _node) => {
            return ['p', attrs, 0];
        });
        const plugin = new CustomstylePlugin(TestCustomStyleRuntime, false);
        const nodeSchema = new Schema({
            nodes: schema.spec.nodes,
            marks: schema.spec.marks,
        });
        //const effSchema = plugin.getEffectiveSchema(nodeSchema);
        const effSchema = mockSchema;
        const { doc, p } = builders(effSchema, { p: { nodeType: 'paragraph' } });
        const state = EditorState.create({
            doc: doc(p('Hello World!!!')),
            schema: mockSchema,
            plugins: [plugin],
        });
        const view = new EditorView(document.querySelector('#editor'), {
            state,
        });
        // const view = new EditorView(
        //     { mount: dom },
        //     {
        //         state: state,
        //     }
        // );
        if(val!='none'){
        const customcommand = new CustomStyleCommand(val, val);
        const selection = TextSelection.create(view.state.doc, 1, 2);
        const tr = view.state.tr.setSelection(selection);
        view.updateState(
            view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
        );
       // view.dispatch(tr);
        const res = customcommand.execute(state, view.dispatch, view);
        if (val != 'clearstyle') {
            expect(res).toStrictEqual(false);
        } else {
            expect(res).toStrictEqual(true);
        }
    }
    else{
        const customcommand = new CustomStyleCommand(val, val);
        const selection = TextSelection.create(view.state.doc, 1, 2);
        const tr = view.state.tr.setSelection(selection);
        view.updateState(
            view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
        );
       // view.dispatch(tr);
        const res = customcommand.execute(state, view.dispatch, view);
        if (val != 'clearstyle') {
            expect(res).toStrictEqual(true);
        } else {
            expect(res).toStrictEqual(true);
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
    const tr = (editor.view).state.tr.setSelection(selection);
    (editor.view).updateState(
        (editor.view).state.reconfigure({ plugins: [plugin] })
    );

    (editor.view).dispatch(tr);

    it('Test 1 ', () => {
        let props = {
            dispatch: () => { },
            editorState: state,
            editorView: editor.view
        };
        expect(new CustomstyleDropDownCommand(props)).toBeDefined();
    })
    it('should call uuid', () => {
        const id = uuid();
    });


    

});

describe('Cus Style Plugin-Pass',()=>{
    const styl={"styleName":"A_12","mode":1,"styles":{"align":"left","boldNumbering":true,"toc":false,"isHidden":false,"boldSentence":true,"nextLineStyleName":"A_12","fontName":"Aclonica","fontSize":"14","strong":true,"styleLevel":"2","hasBullet":true,"bulletLevel":"272A","hasNumbering":false},"toc":false,"isHidden":false}
    const styl2={"styleName":"A_123","mode":1,"styles":{"align":"left","boldNumbering":true,"toc":false,"isHidden":false,"boldSentence":true,"nextLineStyleName":"A_12","fontName":"Aclonica","fontSize":"14","strong":true,"styleLevel":"2","hasBullet":true,"bulletLevel":"272A","hasNumbering":false},"toc":false,"isHidden":false}
  
    const styleruntime = {

    saveStyle: jest.fn().mockReturnValue(Promise.resolve([styl,styl2])),
    getStylesAsync: jest.fn().mockReturnValue(Promise.resolve([styl,styl2])),
    renameStyle: jest.fn().mockReturnValue(Promise.resolve([styl,styl2])),
    removeStyle: jest.fn().mockReturnValue(Promise.resolve([styl,styl2])),
    fetchStyles: jest.fn().mockReturnValue(Promise.resolve([styl,styl2])),
    buildRoute: jest.fn().mockReturnValue(Promise.resolve([styl,styl2])),
  };
  const plugin = new CustomstylePlugin(styleruntime,true);
  const mockSchema = {
    nodes: {
      doc: {
        content: 'paragraph+',
      },
      paragraph:
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
    },
    marks: {
        link:{
            attrs:{
                href:'test_href'
            }
        },
        em: {
          parseDOM: [{
            tag: "i"
          }, {
            tag: "em"
          }, {
            style: "font-style=italic"
          }],
          attrs: {
            overridden: {
              hasDefault: true,
              default: false
            }
          }
        },
        strong: {
          parseDOM: [{
            tag: "strong"
          }, {
            tag: "b"
          }, {
            style: "font-weight"
          }],
          attrs: {
            overridden: {
              hasDefault: true,
              default: false
            }
          }
        }, underline: {
          parseDOM: [{
            tag: "u"
          }, {
            style: "text-decoration-line"
          }, {
            style: "text-decoration"
          }],
          attrs: {
            overridden: {
              hasDefault: true,
              default: false
            }
          }
        }
        
    },
    spec: {
      nodes:  {
        doc: {
          content: 'paragraph+',
        },
        content:[
            "doc",
            {
                "attrs": {
                    "layout": {
                        "default": null
                    },
                    "padding": {
                        "default": null
                    },
                    "width": {
                        "default": null
                    },
                    "counterFlags": {
                        "default": null
                    },
                    "capcoMode": {
                        "default": 0
                    }
                },
                "content": "block+"
            },
            "paragraph",
            {
                "attrs": {
                    "align": {
                        "default": null
                    },
                    "color": {
                        "default": null
                    },
                    "id": {
                        "default": null
                    },
                    "indent": {
                        "default": null
                    },
                    "lineSpacing": {
                        "default": null
                    },
                    "paddingBottom": {
                        "default": null
                    },
                    "paddingTop": {
                        "default": null
                    },
                    "capco": {
                        "default": null
                    }
                },
                "content": "inline*",
                "group": "block",
                "parseDOM": [
                    {
                        "tag": "p"
                    }
                ]
            },
            "blockquote",
            {
                "attrs": {
                    "align": {
                        "default": null
                    },
                    "color": {
                        "default": null
                    },
                    "id": {
                        "default": null
                    },
                    "indent": {
                        "default": null
                    },
                    "lineSpacing": {
                        "default": null
                    },
                    "paddingBottom": {
                        "default": null
                    },
                    "paddingTop": {
                        "default": null
                    },
                    "capco": {
                        "default": null
                    }
                },
                "content": "inline*",
                "group": "block",
                "parseDOM": [
                    {
                        "tag": "blockquote"
                    }
                ],
                "defining": true
            },
            "horizontal_rule",
            {
                "attrs": {
                    "pageBreak": {
                        "default": null
                    }
                },
                "group": "block",
                "parseDOM": [
                    {
                        "tag": "hr"
                    }
                ]
            },
            "heading",
            {
                "attrs": {
                    "align": {
                        "default": null
                    },
                    "color": {
                        "default": null
                    },
                    "id": {
                        "default": null
                    },
                    "indent": {
                        "default": null
                    },
                    "lineSpacing": {
                        "default": null
                    },
                    "paddingBottom": {
                        "default": null
                    },
                    "paddingTop": {
                        "default": null
                    },
                    "level": {
                        "default": 1
                    },
                    "capco": {
                        "default": null
                    }
                },
                "content": "inline*",
                "group": "block",
                "parseDOM": [
                    {
                        "tag": "h1"
                    },
                    {
                        "tag": "h2"
                    },
                    {
                        "tag": "h3"
                    },
                    {
                        "tag": "h4"
                    },
                    {
                        "tag": "h5"
                    },
                    {
                        "tag": "h6"
                    }
                ],
                "defining": true
            },
            "text",
            {
                "group": "inline"
            },
            "math",
            {
                "inline": true,
                "attrs": {
                    "align": {
                        "default": null
                    },
                    "latex": {
                        "default": ""
                    }
                },
                "group": "inline",
                "draggable": true,
                "parseDOM": [
                    {
                        "tag": "math[data-latex]"
                    },
                    {
                        "tag": "span[data-latex]"
                    }
                ]
            },
            "hard_break",
            {
                "inline": true,
                "group": "inline",
                "selectable": false,
                "parseDOM": [
                    {
                        "tag": "br"
                    }
                ]
            },
            "bullet_list",
            {
                "attrs": {
                    "id": {
                        "default": null
                    },
                    "indent": {
                        "default": 0
                    },
                    "listStyleType": {
                        "default": null
                    }
                },
                "group": "block",
                "content": "list_item+",
                "parseDOM": [
                    {
                        "tag": "ul"
                    }
                ]
            },
            "ordered_list",
            {
                "attrs": {
                    "id": {
                        "default": null
                    },
                    "counterReset": {
                        "default": null
                    },
                    "indent": {
                        "default": 0
                    },
                    "following": {
                        "default": null
                    },
                    "listStyleType": {
                        "default": null
                    },
                    "name": {
                        "default": null
                    },
                    "start": {
                        "default": 1
                    },
                    "type": {
                        "default": "decimal"
                    },
                    "styleName": {
                        "default": "None"
                    }
                },
                "group": "block",
                "content": "list_item+",
                "parseDOM": [
                    {
                        "tag": "ol"
                    }
                ]
            },
            "list_item",
            {
                "attrs": {
                    "align": {
                        "default": null
                    }
                },
                "content": "paragraph block*",
                "parseDOM": [
                    {
                        "tag": "li"
                    }
                ]
            },
            "bookmark",
            {
                "inline": true,
                "attrs": {
                    "id": {
                        "default": null
                    },
                    "visible": {
                        "default": null
                    }
                },
                "group": "inline",
                "draggable": true,
                "parseDOM": [
                    {
                        "tag": "a[data-bookmark-id]"
                    }
                ]
            },
            "table",
            {
                "content": "table_row+",
                "tableRole": "table",
                "isolating": true,
                "group": "block",
                "parseDOM": [
                    {
                        "tag": "table",
                        "style": "border"
                    }
                ],
                "attrs": {
                    "marginLeft": {
                        "default": null
                    },
                    "vignette": {
                        "default": false
                    }
                }
            },
            "table_row",
            {
                "content": "(table_cell | table_header)*",
                "tableRole": "row",
                "parseDOM": [
                    {
                        "tag": "tr"
                    }
                ]
            },
            "table_cell",
            {
                "content": "block+",
                "attrs": {
                    "colspan": {
                        "default": 1
                    },
                    "rowspan": {
                        "default": 1
                    },
                    "colwidth": {
                        "default": null
                    },
                    "borderColor": {
                        "default": null
                    },
                    "background": {
                        "default": null
                    },
                    "vignette": {
                        "default": false
                    }
                },
                "tableRole": "cell",
                "isolating": true,
                "parseDOM": [
                    {
                        "tag": "td"
                    }
                ]
            },
            "table_header",
            {
                "content": "block+",
                "attrs": {
                    "colspan": {
                        "default": 1
                    },
                    "rowspan": {
                        "default": 1
                    },
                    "colwidth": {
                        "default": null
                    },
                    "borderColor": {
                        "default": null
                    },
                    "background": {
                        "default": null
                    }
                },
                "tableRole": "header_cell",
                "isolating": true,
                "parseDOM": [
                    {
                        "tag": "th"
                    }
                ]
            }
        ],
            text:{},
        paragraph: {
          content: 'text*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0];
          },
        },
      },
      marks:{
        content:["link",{"attrs":{"href":{"default":null},"rel":{"default":"noopener noreferrer nofollow"},"target":{"default":"blank"},"title":{"default":null}},"inclusive":false,"parseDOM":[{"tag":"a[href]"}]}]

      }
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


  it('should be defined',()=>{
    expect(plugin).toBeDefined();
  })
  it('should handle initButtonCommands',()=>{
    expect(plugin.initButtonCommands()).toBeDefined();
  })
  xit('should handle getEffectiveSchema',()=>{
    expect(plugin.getEffectiveSchema(mockSchema)).toBeDefined();
  })

})