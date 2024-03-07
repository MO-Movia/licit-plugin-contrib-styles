import {
  ParagraphSpacingCommand,
  setParagraphSpacing,
} from './ParagraphSpacingCommand';
import * as paragraphspacingcommand from './ParagraphSpacingCommand';
import { schema } from 'prosemirror-schema-basic';
import { TextSelection,EditorState ,Transaction} from 'prosemirror-state';
import { Attrs, ContentMatch, Fragment, Mark, MarkType, Node, NodeRange, NodeType, Schema, Slice } from 'prosemirror-model';
import { Step, Transform, StepResult, Mapping } from 'prosemirror-transform';


describe('paragraphspacingcommand', () => {
  it('should handle setParagraphSpacing', () => {
    const doc = schema.node('doc', null, [
      schema.node('paragraph'),
      schema.node('heading'),
      schema.node('paragraph'),
    ]);

    // Mock transform object
    const trmock = {
      selection: TextSelection.create(doc, 0, 1), // Mock selection object
      doc: doc, // Mock doc object
    } as unknown as Transaction;

    // Mock schema object with required nodes
    const mockschema = {
      nodes: {
        PARAGRAPH: 'paragraph-node',
        HEADING: 'heading-node',
        LIST_ITEM: 'list-item-node',
        BLOCKQUOTE: 'blockquote-node',
      },
    };

    expect(setParagraphSpacing(trmock , mockschema as unknown as Schema)).toBeDefined();
  });
  it('should handle setParagraphSpacing', () => {
    const doc = schema.node('doc', null, [
      schema.node('paragraph'),
      schema.node('heading'),
      schema.node('paragraph'),
    ]);

    // Mock transform object
    const trmock = {
      selection: TextSelection.create(doc, 0, 1), // Mock selection object
      doc: doc, // Mock doc object
    } as unknown as Transaction;

    // Mock schema object with required nodes
    const mockschema = {
      nodes: {
        paragraph: 'paragraph-node',
        HEADING: 'heading-node',
        LIST_ITEM: 'list-item-node',
        BLOCKQUOTE: 'blockquote-node',
      },
    };
    expect(setParagraphSpacing(trmock, mockschema as unknown as Schema)).toBeDefined();
  });
});
describe('ParagraphSpacingCommand ', () => {
  it('should handle ParagraphSpacingCommand', () => {
    expect(new ParagraphSpacingCommand('', true)).toBeDefined();
  });
  it('should handle execute', () => {
    jest
      .spyOn(paragraphspacingcommand, 'setParagraphSpacing')
      .mockReturnValue({
        docChanged: true,
        doc: new Node,
        steps: [],
        docs: [],
        mapping: new Mapping,
        before: new Node,
        step: function (step: Step): Transform {
          throw new Error('Function not implemented.');
        },
        maybeStep: function (step: Step): StepResult {
          throw new Error('Function not implemented.');
        },
        replace: function (from: number, to?: number | undefined, slice?: Slice | undefined): Transform {
          throw new Error('Function not implemented.');
        },
        replaceWith: function (from: number, to: number, content: Node | Fragment | readonly Node[]): Transform {
          throw new Error('Function not implemented.');
        },
        delete: function (from: number, to: number): Transform {
          throw new Error('Function not implemented.');
        },
        insert: function (pos: number, content: Node | Fragment | readonly Node[]): Transform {
          throw new Error('Function not implemented.');
        },
        replaceRange: function (from: number, to: number, slice: Slice): Transform {
          throw new Error('Function not implemented.');
        },
        replaceRangeWith: function (from: number, to: number, node: Node): Transform {
          throw new Error('Function not implemented.');
        },
        deleteRange: function (from: number, to: number): Transform {
          throw new Error('Function not implemented.');
        },
        lift: function (range: NodeRange, target: number): Transform {
          throw new Error('Function not implemented.');
        },
        join: function (pos: number, depth?: number | undefined): Transform {
          throw new Error('Function not implemented.');
        },
        wrap: function (range: NodeRange, wrappers: readonly { type: NodeType; attrs?: Attrs | null | undefined; }[]): Transform {
          throw new Error('Function not implemented.');
        },
        setBlockType: function (from: number, to: number | undefined, type: NodeType, attrs?: Attrs | null | undefined): Transform {
          throw new Error('Function not implemented.');
        },
        setNodeMarkup: function (pos: number, type?: NodeType | null | undefined, attrs?: Attrs | null | undefined, marks?: readonly Mark[] | undefined): Transform {
          throw new Error('Function not implemented.');
        },
        setNodeAttribute: function (pos: number, attr: string, value: any): Transform {
          throw new Error('Function not implemented.');
        },
        setDocAttribute: function (attr: string, value: any): Transform {
          throw new Error('Function not implemented.');
        },
        addNodeMark: function (pos: number, mark: Mark): Transform {
          throw new Error('Function not implemented.');
        },
        removeNodeMark: function (pos: number, mark: Mark | MarkType): Transform {
          throw new Error('Function not implemented.');
        },
        split: function (pos: number, depth?: number | undefined, typesAfter?: ({ type: NodeType; attrs?: Attrs | null | undefined; } | null)[] | undefined): Transform {
          throw new Error('Function not implemented.');
        },
        addMark: function (from: number, to: number, mark: Mark): Transform {
          throw new Error('Function not implemented.');
        },
        removeMark: function (from: number, to: number, mark?: Mark | MarkType | null | undefined): Transform {
          throw new Error('Function not implemented.');
        },
        clearIncompatible: function (pos: number, parentType: NodeType, match?: ContentMatch | undefined): Transform {
          throw new Error('Function not implemented.');
        }
      });
    const doc = schema.node('doc', null, [
      schema.node('paragraph'),
      schema.node('heading'),
      schema.node('paragraph'),
    ]);
    const mockstate = {
      schema: {},
      selection: {},
      tr: {
        selection: TextSelection.create(doc, 0, 1), // Mock selection object
        doc: doc,
        setSelection: (_x) => {
          return {
            tr: {
              selection: {}, // Mock selection object
              doc: {},
            },
          };
        },
      },
    } as any;
   // const mockview = {};
    const dispatch = () => undefined;
    const psc = new ParagraphSpacingCommand('', true).execute(
      mockstate,
      dispatch,
      // mockview
    );
    expect(psc).toBeDefined();
  });
  it('should handle execute when tr.docChanged is true', () => {
    //const spy = jest.spyOn(paragraphspacingcommand,'setParagraphSpacing').mockReturnValue({docChanged:true})
    const doc = schema.node('doc', null, [
      schema.node('paragraph'),
      schema.node('heading'),
      schema.node('paragraph'),
    ]);
    const mockstate = {
      schema: {},
      selection: {},
      tr: {
        selection: TextSelection.create(doc, 0, 1), // Mock selection object
        doc: doc,
        setSelection: () => {
          return {
            tr: {
              selection: {}, // Mock selection object
              doc: {},
              docChanged: {},
            },
          };
        },
        docChanged: true,
      },
    } as unknown as EditorState;
   // const mockview = {};
    const dispatch = () => {
      return true;
    };
    const psc = new ParagraphSpacingCommand('', true).execute(
      mockstate,
      dispatch,
     // mockview
    );
    expect(psc).toBeDefined();
  });

  it('should handle execute when tr.docChanged is true', () => {
    const mockstate = {
      schema: {},
      selection: {},
      tr: {
        setSelection: () => {
          return { docChanged: true };
        },
      },
    } as unknown as EditorState;
    const psc = new ParagraphSpacingCommand().execute(mockstate, () => {
      return true;
    });
    expect(psc).toBeTruthy();
  });
});
