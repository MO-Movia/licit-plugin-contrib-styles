import CustomstyleDropDownCommand from './CustomstyleDropDownCommand';
import { createEditor, doc, p } from 'jest-prosemirror';
import { EditorState } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import * as cusstyles from '../customStyle';

describe('customstyledropdowncommand', () => {
  //const plugin = new CustomstylePlugin(TestCustomStyleRuntime);
  const editor = createEditor(doc(p('<cursor>')), {
    plugins: [],
  });
  const schema = new Schema({
    nodes: {
      doc: {
        attrs: {
          layout: {
            default: null,
          },
          padding: {
            default: null,
          },
          width: {
            default: null,
          },
          counterFlags: {
            default: null,
          },
          capcoMode: {
            default: 1,
          },
          defaultManualCapco: {
            default: 'C',
          },
        },
        content: 'block+',
      },
      text: {},
      paragraph: {
        attrs: {
          align: {
            default: null,
          },
          color: {
            default: null,
          },
          id: {
            default: null,
          },
          indent: {
            default: null,
          },
          lineSpacing: {
            default: null,
          },
          paddingBottom: {
            default: null,
          },
          paddingTop: {
            default: null,
          },
          capco: {
            default: null,
          },
          paddingTop: {
            default: null,
          },
        },
        content: 'inline*',
        group: 'block',
        parseDOM: [
          {
            tag: 'p',
          },
        ],
      },
      blockquote: {
        attrs: {
          align: {
            default: null,
          },
          color: {
            default: null,
          },
          id: {
            default: null,
          },
          indent: {
            default: null,
          },
          lineSpacing: {
            default: null,
          },
          paddingBottom: {
            default: null,
          },
          paddingTop: {
            default: null,
          },
          capco: {
            default: null,
          },
          paddingTop: {
            default: null,
          },
        },
        content: 'inline*',
        group: 'block',
        parseDOM: [
          {
            tag: 'blockquote',
          },
        ],
        defining: true,
      },
      math: {
        inline: true,
        attrs: {
          align: {
            default: null,
          },
          latex: {
            default: '',
          },
        },
        group: 'inline',
        draggable: true,
        parseDOM: [
          {
            tag: 'math[data-latex]',
          },
          {
            tag: 'span[data-latex]',
          },
        ],
      },
      hard_break: {
        inline: true,
        group: 'inline',
        selectable: false,
        parseDOM: [
          {
            tag: 'br',
          },
        ],
      },
      bullet_list: {
        attrs: {
          id: {
            default: null,
          },
          indent: {
            default: 0,
          },
          listStyleType: {
            default: null,
          },
        },
        group: 'block',
        content: 'list_item+',
        parseDOM: [
          {
            tag: 'ul',
          },
        ],
      },
      ordered_list: {
        attrs: {
          id: {
            default: null,
          },
          counterRese: {
            default: null,
          },
          indent: {
            default: 0,
          },
          following: {
            default: null,
          },
          listStyleType: {
            default: null,
          },
          name: {
            default: null,
          },
          start: {
            default: 1,
          },
          type: {
            default: 'decimal',
          },
          styleName: {
            default: 'None',
          },
        },
        group: 'block',
        content: 'list_item+',
        parseDOM: [
          {
            tag: 'ol',
          },
        ],
      },
      list_item: {
        attrs: {
          align: {
            default: null,
          },
        },
        content: 'paragraph block*',
        parseDOM: [
          {
            tag: 'li',
          },
        ],
      },
      bookmark: {
        inline: true,
        attrs: {
          id: {
            default: null,
          },
          visible: {
            default: null,
          },
        },
        group: 'inline',
        draggable: true,
        parseDOM: [
          {
            tag: 'a[data-bookmark-id]',
          },
        ],
      },
      table: {
        content: 'table_row+',
        tableRole: 'table',
        isolating: true,
        group: 'block',
        parseDOM: [
          {
            tag: 'table',
          },
        ],
        attrs: {
          marginLeft: {
            default: null,
          },
        },
      },
      table_row: {
        content: '(table_cell | table_header)*',
        tableRole: 'row',
        parseDOM: [
          {
            tag: 'tr',
          },
        ],
      },
      table_cell: {
        content: 'block+',
        attrs: {
          colspan: {
            default: 1,
          },
          rowspan: {
            default: 1,
          },
          colwidth: {
            default: null,
          },
          borderColor: {
            default: null,
          },
          background: {
            default: null,
          },
        },
        tableRole: 'cell',
        isolating: true,
        parseDOM: [
          {
            tag: 'td',
          },
        ],
      },

      table_header: {
        content: 'block+',
        attrs: {
          colspan: {
            default: 1,
          },
          rowspan: {
            default: 1,
          },
          colwidth: {
            default: null,
          },
          borderColor: {
            default: null,
          },
          background: {
            default: null,
          },
        },
        tableRole: 'header_cell',
        isolating: true,
        parseDOM: [
          {
            tag: 'th',
          },
        ],
      },
    },
    marks: {
      content: [
        'link',
        {
          attrs: {
            href: { default: null },
            rel: { default: 'noopener noreferrer nofollow' },
            target: { default: 'blank' },
            title: { default: null },
          },
          inclusive: false,
          parseDOM: [{ tag: 'a[href]' }],
        },
        'mark-no-break',
        { parseDOM: [{ tag: 'nobr' }] },
        'code',
        { parseDOM: [{ tag: 'code' }] },
        'em',
        {
          parseDOM: [
            { tag: 'i' },
            { tag: 'em' },
            { style: 'font-style=italic' },
          ],
          attrs: { overridden: { hasDefault: true, default: false } },
        },
        'mark-font-size',
        {
          attrs: {
            pt: { default: null },
            overridden: { hasDefault: true, default: false },
          },
          inline: true,
          group: 'inline',
          parseDOM: [{ style: 'font-size' }],
        },
        'mark-font-type',
        {
          attrs: { name: '', overridden: { hasDefault: true, default: false } },
          inline: true,
          group: 'inline',
          parseDOM: [{ style: 'font-family' }],
        },
        'spacer',
        {
          attrs: { size: { default: 'tab' } },
          defining: true,
          draggable: false,
          excludes: '_',
          group: 'inline',
          inclusive: false,
          inline: true,
          spanning: false,
          parseDOM: [{ tag: 'span[data-spacer-size]' }],
        },
        'strike',
        {
          parseDOM: [{ style: 'text-decoration' }],
          attrs: { overridden: { hasDefault: true, default: false } },
        },
        'strong',
        {
          parseDOM: [{ tag: 'strong' }, { tag: 'b' }, { style: 'font-weight' }],
          attrs: { overridden: { hasDefault: true, default: false } },
        },
        'super',
        {
          parseDOM: [{ tag: 'sup' }, { style: 'vertical-align' }],
          attrs: { overridden: { hasDefault: true, default: false } },
        },
        'sub',
        { parseDOM: [{ tag: 'sub' }, { style: 'vertical-align' }] },
        'mark-text-color',
        {
          attrs: {
            color: '',
            overridden: { hasDefault: true, default: false },
          },
          inline: true,
          group: 'inline',
          parseDOM: [{ style: 'color' }],
        },
        'mark-text-highlight',
        {
          attrs: {
            highlightColor: '',
            overridden: { hasDefault: true, default: false },
          },
          inline: true,
          group: 'inline',
          parseDOM: [{ tag: 'span[style*=background-color]' }],
        },
        'mark-text-selection',
        {
          attrs: { id: '' },
          inline: true,
          group: 'inline',
          parseDOM: [{ tag: 'czi-text-selection' }],
        },
        'underline',
        {
          parseDOM: [
            { tag: 'u' },
            { style: 'text-decoration-line' },
            { style: 'text-decoration' },
          ],
          attrs: { overridden: { hasDefault: true, default: false } },
        },
      ],
    },
  });
  const mockdoc = doc(p('Hello World!!!'));
  mockdoc.styleName = '';
  const state = EditorState.create({
    doc: mockdoc,
    schema: schema,
    selection: editor.selection,
    plugins: [],
    styleName: 'test',
  });

  const props = {
    dispatch: (tr) => { },
    editorState: state,
    editorView: editor.view,
  };

  const spyhas = jest.spyOn(cusstyles, 'hasStyleRuntime').mockReturnValue(true);
  const customstyledropdowncommand = new CustomstyleDropDownCommand(props);

  it('should handle getCommandGroups when hasStyleRuntime is true ', async () => {
    const spy = jest.spyOn(cusstyles, 'getStylesAsync').mockResolvedValue();
    const commandGroups = await customstyledropdowncommand.getCommandGroups();
    const headingCommands = commandGroups[0];
    //expect(headingCommands).toHaveProperty('None');
    expect(headingCommands).not.toHaveProperty('A Apply Stylefff');
    expect(headingCommands).not.toHaveProperty('A11-Rename');
    spy.mockRestore();
  });
  it('should handle isValidCustomstyle', () => {
    customstyledropdowncommand.state = state;
    expect(customstyledropdowncommand.isValidCustomstyle('test')).toBeFalsy();
  });
  it('should handle staticCommands', () => {
    expect(customstyledropdowncommand.staticCommands()).toBeInstanceOf(Array);
  });
  it('should handle isAllowedNode', () => {
    const node = { type: { name: 'paragraph' } };
    expect(customstyledropdowncommand.isAllowedNode(node)).toBe(true);
  });
  it('should handle isAllowedNode', () => {
    const node = { type: { name: 'ordered_list' } };
    expect(customstyledropdowncommand.isAllowedNode(node)).toBe(true);
  });
  it('should handle render when styleName null', () => {
    const spy = jest.spyOn(cusstyles, 'getStylesAsync').mockResolvedValue([
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
          fontSize: 11,
          strong: true,
          em: true,
          underline: true,
          color: '#c40df2',
        },
        toc: false,
        isHidden: false,
      },
      {
        styleName: 'A11-Rename',
        mode: 2,
        styles: {
          align: 'left',
          boldNumbering: true,
          toc: false,
          isHidden: false,
          boldSentence: true,
          nextLineStyleName: 'A_Test1234',
          fontName: 'Arial Black',
          fontSize: '14',
          styleLevel: 'None',
          hasBullet: false,
          bulletLevel: '25CF',
          hasNumbering: false,
          isLevelbased: true,
          paragraphSpacingBefore: '5',
          paragraphSpacingAfter: '5',
        },
        toc: false,
        isHidden: false,
      },
    ]);
    const mockschema = new Schema({
      nodes: {
        doc: { content: 'paragraph+' },
        paragraph: {
          content: 'text*',
          attrs: {
            align: { default: null },
            color: { default: null },
            id: { default: null },
            indent: { default: null },
            lineSpacing: { default: null },
            paddingBottom: { default: null },
            paddingTop: { default: null },
            capco: { default: null },
            styleName: { default: null },
          },
          toDOM(node) {
            const { align, color } = node.attrs;
            const style = [];
            if (align) style.push(`text-align: ${align}`);
            if (color) style.push(`color: ${color}`);
            return ['p', { style: style.join('; ') }, 0];
          },
          parseDOM: [
            {
              tag: 'p',
              getAttrs(dom) {
                const style = dom.getAttribute('style') || '';
                const attrs = {};
                if (style.includes('text-align: left')) attrs.align = 'left';
                if (style.includes('text-align: center'))
                  attrs.align = 'center';
                if (style.includes('text-align: right')) attrs.align = 'right';
                const colorMatch = style.match(/color: (.*?);/);
                if (colorMatch) attrs.color = colorMatch[1];
                return attrs;
              },
            },
          ],
        },
        text: { inline: true },
      },
    });

    // Create the editor state
    const mockeditorState = {
      schema: mockschema,
      doc: mockschema.nodeFromJSON({
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
              styleName: null,
            },
          },
        ],
      }),
      selection: { from: 0, to: 1 },
    };

    customstyledropdowncommand.props = {
      dispatch: (tr) => { },
      editorState: mockeditorState,
      editorView: null,
    };
    expect(customstyledropdowncommand.render()).toBeDefined();
    spy.mockRestore();
  });
  it('should handle render when styleName not null', () => {
    const spy = jest.spyOn(cusstyles, 'getStylesAsync').mockResolvedValue([
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
          fontSize: 11,
          strong: true,
          em: true,
          underline: true,
          color: '#c40df2',
        },
        toc: false,
        isHidden: false,
      },
      {
        styleName: 'A11-Rename',
        mode: 2,
        styles: {
          align: 'left',
          boldNumbering: true,
          toc: false,
          isHidden: false,
          boldSentence: true,
          nextLineStyleName: 'A_Test1234',
          fontName: 'Arial Black',
          fontSize: '14',
          styleLevel: 'None',
          hasBullet: false,
          bulletLevel: '25CF',
          hasNumbering: false,
          isLevelbased: true,
          paragraphSpacingBefore: '5',
          paragraphSpacingAfter: '5',
        },
        toc: false,
        isHidden: false,
      },
    ]);
    const mockschema = new Schema({
      nodes: {
        doc: { content: 'paragraph+' },
        paragraph: {
          content: 'text*',
          attrs: {
            align: { default: null },
            color: { default: null },
            id: { default: null },
            indent: { default: null },
            lineSpacing: { default: null },
            paddingBottom: { default: null },
            paddingTop: { default: null },
            capco: { default: null },
            styleName: { default: null },
          },
          toDOM(node) {
            const { align, color } = node.attrs;
            const style = [];
            if (align) style.push(`text-align: ${align}`);
            if (color) style.push(`color: ${color}`);
            return ['p', { style: style.join('; ') }, 0];
          },
          parseDOM: [
            {
              tag: 'p',
              getAttrs(dom) {
                const style = dom.getAttribute('style') || '';
                const attrs = {};
                if (style.includes('text-align: left')) attrs.align = 'left';
                if (style.includes('text-align: center'))
                  attrs.align = 'center';
                if (style.includes('text-align: right')) attrs.align = 'right';
                const colorMatch = style.match(/color: (.*?);/);
                if (colorMatch) attrs.color = colorMatch[1];
                return attrs;
              },
            },
          ],
        },
        paragraph: {
          content: 'text*',
          attrs: {
            align: { default: null },
            color: { default: null },
            id: { default: null },
            indent: { default: null },
            lineSpacing: { default: null },
            paddingBottom: { default: null },
            paddingTop: { default: null },
            capco: { default: null },
            styleName: { default: null },
          },
          toDOM(node) {
            const { align, color } = node.attrs;
            const style = [];
            if (align) style.push(`text-align: ${align}`);
            if (color) style.push(`color: ${color}`);
            return ['p', { style: style.join('; ') }, 0];
          },
          parseDOM: [
            {
              tag: 'p',
              getAttrs(dom) {
                const style = dom.getAttribute('style') || '';
                const attrs = {};
                if (style.includes('text-align: left')) attrs.align = 'left';
                if (style.includes('text-align: center'))
                  attrs.align = 'center';
                if (style.includes('text-align: right')) attrs.align = 'right';
                const colorMatch = style.match(/color: (.*?);/);
                if (colorMatch) attrs.color = colorMatch[1];
                return attrs;
              },
            },
          ],
        },
        ordered_list: {
          content: 'text*', // Content can be any inline content (e.g., text, marks)
          attrs: {
            level: { default: 1 }, // Add any additional attributes specific to the node
            align: { default: null },
            color: { default: null },
            id: { default: null },
            styleName: { default: null },
            // Add more attributes as needed
          },
          toDOM(node) {
            const { align, color, level } = node.attrs;
            const style = [];
            if (align) style.push(`text-align: ${align}`);
            if (color) style.push(`color: ${color}`);
            return [`h${level}`, { style: style.join('; ') }, 0];
          },
          parseDOM: [
            {
              tag: 'h1', // Adjust the heading tag based on the desired level
              getAttrs(dom) {
                const style = dom.getAttribute('style') || '';
                const attrs = {};
                if (style.includes('text-align: left')) attrs.align = 'left';
                if (style.includes('text-align: center'))
                  attrs.align = 'center';
                if (style.includes('text-align: right')) attrs.align = 'right';
                const colorMatch = style.match(/color: (.*?);/);
                if (colorMatch) attrs.color = colorMatch[1];
                return attrs;
              },
            },
          ],
        },
        text: { inline: true },
      },
    });

    // Create the editor state
    const mockeditorState = {
      schema: mockschema,
      doc: mockschema.nodeFromJSON({
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
      }),
      selection: { from: 0, to: 2 },
    };

    customstyledropdowncommand.props = {
      dispatch: (tr) => { },
      editorState: mockeditorState,
      editorView: null,
    };
    expect(customstyledropdowncommand.render()).toBeDefined();
    spy.mockRestore();
  });
  spyhas.mockRestore();
});

describe('customstyledropdowncommand 1', () => {
  const editor = createEditor(doc(p('<cursor>')), {
    plugins: [],
  });
  const schema = new Schema({
    nodes: {
      doc: {
        attrs: {
          layout: {
            default: null,
          },
          padding: {
            default: null,
          },
          width: {
            default: null,
          },
          counterFlags: {
            default: null,
          },
          capcoMode: {
            default: 1,
          },
          defaultManualCapco: {
            default: 'C',
          },
        },
        content: 'block+',
      },
      text: {},
      paragraph: {
        attrs: {
          align: {
            default: null,
          },
          color: {
            default: null,
          },
          id: {
            default: null,
          },
          indent: {
            default: null,
          },
          lineSpacing: {
            default: null,
          },
          paddingBottom: {
            default: null,
          },
          paddingTop: {
            default: null,
          },
          capco: {
            default: null,
          },
          paddingTop: {
            default: null,
          },
        },
        group: 'block',
        parseDOM: [
          {
            tag: 'p',
          },
        ],
      },
    },
    marks: {
      content: [
        'link',
        {
          attrs: {
            href: { default: null },
            rel: { default: 'noopener noreferrer nofollow' },
            target: { default: 'blank' },
            title: { default: null },
          },
          inclusive: false,
          parseDOM: [{ tag: 'a[href]' }],
        },
        'mark-no-break',
        { parseDOM: [{ tag: 'nobr' }] },
        'code',
        { parseDOM: [{ tag: 'code' }] },
        'em',
        {
          parseDOM: [
            { tag: 'i' },
            { tag: 'em' },
            { style: 'font-style=italic' },
          ],
          attrs: { overridden: { hasDefault: true, default: false } },
        },
        'mark-font-size',
        {
          attrs: {
            pt: { default: null },
            overridden: { hasDefault: true, default: false },
          },
          inline: true,
          group: 'inline',
          parseDOM: [{ style: 'font-size' }],
        },
        'mark-font-type',
        {
          attrs: { name: '', overridden: { hasDefault: true, default: false } },
          inline: true,
          group: 'inline',
          parseDOM: [{ style: 'font-family' }],
        },
        'spacer',
        {
          attrs: { size: { default: 'tab' } },
          defining: true,
          draggable: false,
          excludes: '_',
          group: 'inline',
          inclusive: false,
          inline: true,
          spanning: false,
          parseDOM: [{ tag: 'span[data-spacer-size]' }],
        },
        'strike',
        {
          parseDOM: [{ style: 'text-decoration' }],
          attrs: { overridden: { hasDefault: true, default: false } },
        },
        'strong',
        {
          parseDOM: [{ tag: 'strong' }, { tag: 'b' }, { style: 'font-weight' }],
          attrs: { overridden: { hasDefault: true, default: false } },
        },
        'super',
        {
          parseDOM: [{ tag: 'sup' }, { style: 'vertical-align' }],
          attrs: { overridden: { hasDefault: true, default: false } },
        },
        'sub',
        { parseDOM: [{ tag: 'sub' }, { style: 'vertical-align' }] },
        'mark-text-color',
        {
          attrs: {
            color: '',
            overridden: { hasDefault: true, default: false },
          },
          inline: true,
          group: 'inline',
          parseDOM: [{ style: 'color' }],
        },
        'mark-text-highlight',
        {
          attrs: {
            highlightColor: '',
            overridden: { hasDefault: true, default: false },
          },
          inline: true,
          group: 'inline',
          parseDOM: [{ tag: 'span[style*=background-color]' }],
        },
        'mark-text-selection',
        {
          attrs: { id: '' },
          inline: true,
          group: 'inline',
          parseDOM: [{ tag: 'czi-text-selection' }],
        },
        'underline',
        {
          parseDOM: [
            { tag: 'u' },
            { style: 'text-decoration-line' },
            { style: 'text-decoration' },
          ],
          attrs: { overridden: { hasDefault: true, default: false } },
        },
      ],
    },
  });
  const mockdoc = doc(p('Hello World!!!'));
  mockdoc.styleName = '';
  const state = EditorState.create({
    doc: mockdoc,
    schema: schema,
    selection: editor.selection,
    plugins: [],
    styleName: 'test',
  });
  const props = {
    dispatch: (tr) => { },
    editorState: state,
    editorView: editor.view,
  };
  jest.spyOn(cusstyles, 'hasStyleRuntime').mockReturnValue(false);
  const customstyledropdowncommand = new CustomstyleDropDownCommand(props);
  customstyledropdowncommand.update_me();
  it('should handle getCommandGroups when hasStyleRuntime is false ', async () => {
    jest.spyOn(cusstyles, 'getStylesAsync').mockResolvedValue([]);
    const commandGroups = await customstyledropdowncommand.getCommandGroups();
    const headingCommands = commandGroups[0];
    expect(headingCommands).not.toHaveProperty('A Apply Stylefff');
    expect(headingCommands).not.toHaveProperty('A11-Rename');
  });
  it('should handle render when styleName not null', () => {
    const spy = jest.spyOn(cusstyles, 'getStylesAsync').mockResolvedValue([
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
          fontSize: 11,
          strong: true,
          em: true,
          underline: true,
          color: '#c40df2',
        },
        toc: false,
        isHidden: false,
      },
      {
        styleName: 'A11-Rename',
        mode: 2,
        styles: {
          align: 'left',
          boldNumbering: true,
          toc: false,
          isHidden: false,
          boldSentence: true,
          nextLineStyleName: 'A_Test1234',
          fontName: 'Arial Black',
          fontSize: '14',
          styleLevel: 'None',
          hasBullet: false,
          bulletLevel: '25CF',
          hasNumbering: false,
          isLevelbased: true,
          paragraphSpacingBefore: '5',
          paragraphSpacingAfter: '5',
        },
        toc: false,
        isHidden: false,
      },
    ]);
    const mockschema = new Schema({
      nodes: {
        doc: { content: 'paragraph+' },
        paragraph: {
          content: 'text*',
          attrs: {
            align: { default: null },
            color: { default: null },
            id: { default: null },
            indent: { default: null },
            lineSpacing: { default: null },
            paddingBottom: { default: null },
            paddingTop: { default: null },
            capco: { default: null },
            styleName: { default: null },
          },
          toDOM(node) {
            const { align, color } = node.attrs;
            const style = [];
            if (align) style.push(`text-align: ${align}`);
            if (color) style.push(`color: ${color}`);
            return ['p', { style: style.join('; ') }, 0];
          },
          parseDOM: [
            {
              tag: 'p',
              getAttrs(dom) {
                const style = dom.getAttribute('style') || '';
                const attrs = {};
                if (style.includes('text-align: left')) attrs.align = 'left';
                if (style.includes('text-align: center'))
                  attrs.align = 'center';
                if (style.includes('text-align: right')) attrs.align = 'right';
                const colorMatch = style.match(/color: (.*?);/);
                if (colorMatch) attrs.color = colorMatch[1];
                return attrs;
              },
            },
          ],
        },
        paragraph: {
          content: 'text*',
          attrs: {
            align: { default: null },
            color: { default: null },
            id: { default: null },
            indent: { default: null },
            lineSpacing: { default: null },
            paddingBottom: { default: null },
            paddingTop: { default: null },
            capco: { default: null },
            styleName: { default: null },
          },
          toDOM(node) {
            const { align, color } = node.attrs;
            const style = [];
            if (align) style.push(`text-align: ${align}`);
            if (color) style.push(`color: ${color}`);
            return ['p', { style: style.join('; ') }, 0];
          },
          parseDOM: [
            {
              tag: 'p',
              getAttrs(dom) {
                const style = dom.getAttribute('style') || '';
                const attrs = {};
                if (style.includes('text-align: left')) attrs.align = 'left';
                if (style.includes('text-align: center'))
                  attrs.align = 'center';
                if (style.includes('text-align: right')) attrs.align = 'right';
                const colorMatch = style.match(/color: (.*?);/);
                if (colorMatch) attrs.color = colorMatch[1];
                return attrs;
              },
            },
          ],
        },
        ordered_list: {
          content: 'text*', // Content can be any inline content (e.g., text, marks)
          attrs: {
            level: { default: 1 }, // Add any additional attributes specific to the node
            align: { default: null },
            color: { default: null },
            id: { default: null },
            styleName: { default: null },
            // Add more attributes as needed
          },
          toDOM(node) {
            const { align, color, level } = node.attrs;
            const style = [];
            if (align) style.push(`text-align: ${align}`);
            if (color) style.push(`color: ${color}`);
            return [`h${level}`, { style: style.join('; ') }, 0];
          },
          parseDOM: [
            {
              tag: 'h1', // Adjust the heading tag based on the desired level
              getAttrs(dom) {
                const style = dom.getAttribute('style') || '';
                const attrs = {};
                if (style.includes('text-align: left')) attrs.align = 'left';
                if (style.includes('text-align: center'))
                  attrs.align = 'center';
                if (style.includes('text-align: right')) attrs.align = 'right';
                const colorMatch = style.match(/color: (.*?);/);
                if (colorMatch) attrs.color = colorMatch[1];
                return attrs;
              },
            },
          ],
        },
        text: { inline: true },
      },
    });

    // Create the editor state
    const mockeditorState = {
      schema: mockschema,
      doc: mockschema.nodeFromJSON({
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
              styleName: 'Normal-@#$-',
            },
          },
        ],
      }),
      selection: { from: 0, to: 2 },
    };

    customstyledropdowncommand.props = {
      dispatch: (tr) => { },
      editorState: mockeditorState,
      editorView: {
        disabled: true
      },
    };
    expect(customstyledropdowncommand.render()).toBeDefined();
    spy.mockRestore();
  });
});
