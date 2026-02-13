import {
  ParagraphSpacingCommand,
  setParagraphSpacing,
} from './ParagraphSpacingCommand';
import * as paragraphspacingcommand from './ParagraphSpacingCommand';
import { schema } from 'prosemirror-schema-basic';
import { TextSelection, EditorState, Transaction } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';

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

    expect(
      setParagraphSpacing(trmock, mockschema as unknown as Schema)
    ).toBeDefined();
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
    expect(
      setParagraphSpacing(trmock, mockschema as unknown as Schema)
    ).toBeDefined();
  });
  it('should handle setParagraphSpacing of unknown selection', () => {
    // Mock transform object
    const trmock = {
      selection: {}, // Mock selection object
      doc: {}, // Mock doc object
    } as unknown as Transaction;

    // Mock schema object with required nodes
    const mockschema = {} as Schema;

    expect(setParagraphSpacing(trmock, mockschema)).toBeDefined();
  });
});
describe('ParagraphSpacingCommand ', () => {
  it('should handle ParagraphSpacingCommand', () => {
    expect(new ParagraphSpacingCommand('', true)).toBeDefined();
  });
    it('should handle execute', () => {
    jest
    .spyOn(paragraphspacingcommand, 'setParagraphSpacing')
    .mockImplementation((tr) => {
      const updatedTr = { ...(tr as unknown as object), docChanged: true } as unknown as Transaction;
      return updatedTr;
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
        setSelection: () => {
          return {
            tr: {
              selection: {}, // Mock selection object
              doc: {},
            },
          };
        },
      },
    };
    // const mockview = {};
    const dispatch = () => undefined;
    const psc = new ParagraphSpacingCommand('', true).execute(
      mockstate as unknown as EditorState,
      dispatch
      // mockview
    );
    expect(psc).toBeDefined();
  });
    it('should return the same transform', () => {
    const initialState = {} as EditorState;
    const initialTransform = {} as Transform;
    const resultingTransform = new ParagraphSpacingCommand('', true).executeCustomStyleForTable(
      initialState,
      initialTransform
    );
    expect(resultingTransform).toBe(initialTransform);
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
      dispatch
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

  it('should handle renderLabel', () => {
    const psc = new ParagraphSpacingCommand().renderLabel();
    expect(psc).toBeNull();
  });
  it('should handle isActive', () => {
    const psc = new ParagraphSpacingCommand().isActive();
    expect(psc).toBeTruthy();
  });
  it('should handle waitForUserInput', () => {
    const psc = new ParagraphSpacingCommand().waitForUserInput();
    expect(psc).toBeDefined();
  });
  it('should handle executeWithUserInput', () => {
    const psc = new ParagraphSpacingCommand().executeWithUserInput();
    expect(psc).toBeFalsy();
  });
  it('should handle cancel', () => {
    const psc = new ParagraphSpacingCommand().cancel();
    expect(psc).toBeUndefined();
  });
});
