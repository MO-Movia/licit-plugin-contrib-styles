import CustomStyleCommand from './CustomStyleCommand';
import { EditorState } from "prosemirror-state";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
describe('CustomStyleCommand', () => {
    const styl = { "styleName": "A_12", "mode": 1, "styles": { "align": "left", "boldNumbering": true, "toc": false, "isHidden": false, "boldSentence": true, "nextLineStyleName": "A_12", "fontName": "Aclonica", "fontSize": "14", "strong": true, "styleLevel": "2", "hasBullet": true, "bulletLevel": "272A", "hasNumbering": false }, "toc": false, "isHidden": false }
    const customstylecommand = new CustomStyleCommand(styl, "A_12");
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
      const editorState = {
        schema:mockSchema,
        plugins: [],
        selection:{from:0,to:1},
        doc: {nodesBetween(x,y,z){return 'test_style'}}
      };
      const el = document.createElement('div')
      const mockEditorView = {
        state:editorState,
        dispatch: jest.fn(),
        posAtCoords: ({left,
          top})=>{return {
            pos: 1,
            inside: 1,
          }},
        destroy: jest.fn(),
        dom:el
      };

    it('should be defined', () => {
        expect(customstylecommand).toBeDefined();
    })
    it('should handle renderLabel ', () => {


        const mySchema = new Schema({ nodes: schema.spec.nodes, marks: schema.spec.marks });
        const myDoc = DOMParser.fromSchema(mySchema).parse("<p>Hello, world!</p>");
        const mySelection = myDoc.content.findDiffEnd(myDoc.content);

        const myEditorState = EditorState.create({
            doc: myDoc,
            schema: mySchema,
            selection: mySelection,
        });
        customstylecommand._customStyleName ="test";
        expect(customstylecommand.renderLabel(myEditorState)).toBe("test");
    })
    it('should handle isEmpty  ', () => {

        expect(customstylecommand.isEmpty({key:'test'})).toBeFalsy();
    })
    it('should handle isEmpty  ', () => {

        expect(customstylecommand.isEmpty({})).toBeTruthy();
    })

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
                  return ['img', { src: node.attrs.src,align: node.attrs.align ||''}];
                }
              }
            }
          });
         
          const editorState = EditorState.create({
            schema:mockSchema,
            plugins: []
          });
          const el = document.createElement('div')
          const mockEditorView = {
            state:editorState,
            dispatch: jest.fn(),
            posAtCoords: ({left,
              top})=>{return {
                pos: 1,
                inside: 1,
              }},
            destroy: jest.fn(),
            dom:el
          };
          const spy = jest.spyOn(customstylecommand,'isCustomStyleApplied').mockReturnValue("Normal");

        expect(customstylecommand.isEnabled(editorState,mockEditorView,'clearstyle')).toBeFalsy();
        spy.mockReset();
    })

    it('should handle isCustomStyleApplied', () => {
        
        expect(customstylecommand.isCustomStyleApplied(editorState)).toBeDefined();
    })
    it('should handle showAlert when popup null', () => {
      customstylecommand.showAlert()
      expect(customstylecommand._popUp).not.toBeNull();
  })
  it('should handle removeMarks', () => {
    expect(customstylecommand.removeMarks([{em: {
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
  },type:'mark'},
],{selection:{$from:{before:(one)=>0},$to:{after:(one)=>1}},removeMark:(x,y,z)=>{key:'markremoved tr'}},{
    content: 'text*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM() {
        return ['p', 0];
    },
})).toBeUndefined();
})
})