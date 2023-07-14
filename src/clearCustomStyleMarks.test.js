import { Schema } from 'prosemirror-model';
import { removeTextAlignAndLineSpacing, clearCustomStyleAttribute } from './clearCustomStyleMarks';

describe('removeTextAlignAndLineSpacing', () => {
  const transaction = {
    steps: [
      {
        // Replace step
        from: 0,
        to: 3,
        slice: {
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Lorem ipsum dolor sit amet.',
                },
              ],
            },
          ],
        },
      },
      {
        // Text insertion step
        from: 3,
        insert: ' ',
      },
      {
        // Mark addition step
        from: 4,
        to: 9,
        mark: {
          type: 'strong',
        },
      },
    ],
    selection: {
      anchor: 9,
      head: 9,
    },
  };

  const mySchema = new Schema({
    nodes: {
      doc: {
        content: 'block+',
      },
      paragraph: {
        content: 'text*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: () => ['p', 0],
      },
      heading: {
        attrs: { level: { default: 1 } },
        content: 'text*',
        group: 'block',
        defining: true,
        parseDOM: [
          { tag: 'h1', attrs: { level: 1 } },
          { tag: 'h2', attrs: { level: 2 } },
          { tag: 'h3', attrs: { level: 3 } },
        ],
        toDOM: (node) => [`h${node.attrs.level}`, 0],
      },
      text: {
        group: 'inline',
      },
    },
    marks: {
      strong: {
        parseDOM: [
          { tag: 'strong' },
          { tag: 'b' },
          {
            style: 'font-weight',
            getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
          },
        ],
        toDOM: () => ['strong'],
        create() {
          return { class: 'strong' };
        },
      },
    },
  });

  const removetextalignandlinespacing = removeTextAlignAndLineSpacing(transaction, mySchema);

  it('should return tr', () => {
    expect(removetextalignandlinespacing).toBeDefined();
  });

  it('should handle clearCustomStyleAttribute', () => {
    const myNode = {
      attrs: {
        styleName: 'Normal',
        indent: true,
      },
    };
    clearCustomStyleAttribute(myNode);
    expect(myNode.attrs.styleName).toBe('Normal');
    expect(myNode.attrs.indent).toBeNull;
  });

  it('should handle clearCustomStyleAttribute', () => {
    const myNode = {
      attrs: {},
    };
    expect(clearCustomStyleAttribute(myNode)).toBeUndefined();
  });

  it('should handle clearCustomStyleAttribute', () => {
    const myNode = {};
    expect(clearCustomStyleAttribute(myNode)).toBeUndefined();
  });
});
