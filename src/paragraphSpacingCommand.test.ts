import {
  ParagraphSpacingCommand,
  setParagraphSpacing,
} from './ParagraphSpacingCommand';
import * as paragraphspacingcommand from './ParagraphSpacingCommand';
import { schema } from 'prosemirror-schema-basic';
import { TextSelection } from 'prosemirror-state';

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
    };

    // Mock schema object with required nodes
    const mockschema = {
      nodes: {
        PARAGRAPH: 'paragraph-node',
        HEADING: 'heading-node',
        LIST_ITEM: 'list-item-node',
        BLOCKQUOTE: 'blockquote-node',
      },
    };

    expect(setParagraphSpacing(trmock, mockschema)).toBeDefined();
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
    };

    // Mock schema object with required nodes
    const mockschema = {
      nodes: {
        paragraph: 'paragraph-node',
        HEADING: 'heading-node',
        LIST_ITEM: 'list-item-node',
        BLOCKQUOTE: 'blockquote-node',
      },
    };
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
      .mockReturnValue({ docChanged: true });
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
    };
    const mockview = {};
    const dispatch = () => undefined;
    const psc = new ParagraphSpacingCommand('', true).execute(
      mockstate,
      dispatch,
      mockview
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
    };
    const mockview = {};
    const dispatch = () => {
      return true;
    };
    const psc = new ParagraphSpacingCommand('', true).execute(
      mockstate,
      dispatch,
      mockview
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
    };
    const psc = new ParagraphSpacingCommand().execute(mockstate, () => {
      return true;
    });
    expect(psc).toBeTruthy();
  });
});
