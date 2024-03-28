import { Schema, Node } from 'prosemirror-model';
import { removeTextAlignAndLineSpacing, clearCustomStyleAttribute } from './clearCustomStyleMarks';
import { Transform } from 'prosemirror-transform';



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
            getAttrs: (value: string | HTMLElement) => {
              if (typeof value === 'string') {
                return /^(bold(er)?|[5-9]\d{2,})$/.test(value) ? {} : false;
              } else {
                // Handle HTMLElement case
                return false;
              }
            },
          },
        ],
        toDOM: () => ['strong'],
      },
    },
  });

  const removetextalignandlinespacing = removeTextAlignAndLineSpacing(transaction as unknown as Transform, mySchema);

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
    clearCustomStyleAttribute(myNode as unknown as Node);
    expect(myNode.attrs.styleName).toBe('Normal');
    expect(myNode.attrs.indent).toBeNull;
  });

  it('should handle clearCustomStyleAttribute', () => {
    const myNode = {
      attrs: {},
    };
    expect(clearCustomStyleAttribute(myNode as unknown as Node)).toBeUndefined();
  });

  it('should handle clearCustomStyleAttribute', () => {
    const myNode = {};
    expect(clearCustomStyleAttribute(myNode as unknown as Node)).toBeUndefined();
  });
});
