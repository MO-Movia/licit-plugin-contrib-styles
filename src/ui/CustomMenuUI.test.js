import Enzyme from 'enzyme';
import { createEditor, doc, p } from 'jest-prosemirror';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { CustomstylePlugin } from '../index';
import { CustomMenuUI } from './CustomMenuUI';
import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { CustomStyleCommand } from '../CustomStyleCommand';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

Enzyme.configure({ adapter: new Adapter() });

describe('Custom Menu UI   ', () => {
  const TestCustomStyleRuntime = {
    saveStyle: jest.fn().mockReturnValue(Promise.resolve([])),
    getStylesAsync: jest.fn().mockReturnValue(Promise.resolve([])),
    renameStyle: jest.fn().mockReturnValue(Promise.resolve([])),
    removeStyle: jest.fn().mockReturnValue(Promise.resolve([])),
    fetchStyles: jest.fn().mockReturnValue(Promise.resolve([])),
    buildRoute: jest.fn().mockReturnValue(Promise.resolve([])),
  };
  const plugin = new CustomstylePlugin(TestCustomStyleRuntime);
  const editor = createEditor(doc(p('<cursor>')), {
    plugins: [plugin],
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
    plugins: [new CustomstylePlugin(TestCustomStyleRuntime)],
  });
  const cmdGrp1 = new CustomStyleCommand('Edit All', 'AFDP_Bullet');
  const cmdGrp2 = new CustomStyleCommand('Clear', 'AFDP_Bullet1');
  const CustomMenuTestProps = {
    className: 'molcs-menu-button',
    commandGroups: [cmdGrp1, cmdGrp2, { Normal: true }],
    staticCommand: [{ Normal: true, _customStyleName: 'customstylename' }],
    disabled: false,
    dispatch: (tr) => {},
    editorState: state,
    editorView: editor.view,
    icon: 'button',
    label: 'Normal',
    title: 'styles',
    _style: '',
    onCommand: () => {
      return {};
    },
  };
  class MockElement {
    constructor(tagName) {
      this.tagName = tagName;
    }

    // Add any additional methods or properties that you need for testing
  }
  document.getElementsByClassName = jest
    .fn()
    .mockImplementation((className) => {
      // Return a custom Element instance with the given class name
      const mockElement = new MockElement('div');
      // mockElement.classList.add(className);
      return [mockElement];
    });
  const custommenuui = new CustomMenuUI(CustomMenuTestProps);
  custommenuui.props = CustomMenuTestProps;

  it('should render the component', () => {
    expect(custommenuui.render()).toBeDefined();
  });
  it('should render the component is allowednode is false', () => {
    const CustomMenuTestProps = {
      className: 'molcs-menu-button',
      commandGroups: [cmdGrp1, cmdGrp2, { Normal: true }],
      staticCommand: [{ Normal: true, _customStyleName: 'customstylename' }],
      disabled: false,
      dispatch: (tr) => {},
      editorState: state,
      editorView: { disabled: true },
      icon: 'button',
      label: 'Normal',
      title: 'styles',
      _style: '',
    };
    const custommenuui = new CustomMenuUI(CustomMenuTestProps);
    jest.spyOn(custommenuui, 'isAllowedNode').mockReturnValue(false);
    custommenuui.props = CustomMenuTestProps;
    expect(custommenuui.render()).toBeDefined();
  });
  it('should render the component', () => {
    const CustomMenuTestProps = {
      className: 'molcs-menu-button',
      commandGroups: [cmdGrp1, cmdGrp2, { Normal: true }],
      staticCommand: [{ Normal: true, _customStyleName: 'customstylename' }],
      disabled: false,
      dispatch: (tr) => {},
      editorState: state,
      editorView: { disabled: true },
      icon: 'button',
      label: 'Normal',
      title: 'styles',
      _style: '',
    };
    custommenuui.props = CustomMenuTestProps;
    expect(custommenuui.render()).toBeDefined();
  });

  it('should handle componentDidMount', () => {
    const dom = document.createElement('div');
    dom.className = 'molsp-stylenames';
    dom.scrollTop = 1;
    jest.spyOn(document, 'getElementsByClassName').mockReturnValue([dom]);
    custommenuui.componentDidMount();
    expect(dom.scrollTop).toBe(807);
  });

  it('should handle isAllowedNode', () => {
    const node = { type: { name: 'ordered_list' } };
    expect(custommenuui.isAllowedNode(node)).toBe(true);
  });
  it('should handle _onUIEnter ', () => {
    const parent = document.createElement('div');
    parent.setAttribute('data-test', 'test-value');
    const input = document.createElement('input');
    input.className = 'czi-custom-menu-item edit-icon';
    parent.appendChild(input);
    // Set the selectionStart property of the input element
    input.selectionStart = 2;
    const event = {
      bubbles: true,
      cancelable: true,
      view: window,
      currentTarget: input,
    };
    const ui = new UICommand();
    jest.spyOn(ui, 'shouldRespondToUIEvent').mockReturnValue(true);
    const spy1 = jest.spyOn(custommenuui, 'showSubMenu');
    custommenuui._onUIEnter(ui, event);
    expect(spy1).toHaveBeenCalled();
  });
  it('should handle _onUIEnter  when shouldRespondToUIEvent is false event.currentTarget.className === czi-custom-menu-item edit-icon ', () => {
    const parent = document.createElement('div');
    parent.setAttribute('data-test', 'test-value');
    const input = document.createElement('input');
    input.className = 'czi-custom-menu-item edit-icon';
    parent.appendChild(input);
    // Set the selectionStart property of the input element
    input.selectionStart = 2;
    const event = {
      bubbles: true,
      cancelable: true,
      view: window,
      currentTarget: input,
    };
    const ui = new UICommand();
    jest.spyOn(ui, 'shouldRespondToUIEvent').mockReturnValue(false);
    // const spy1 = jest.spyOn(custommenuui, 'showSubMenu');
    const test = custommenuui._onUIEnter(ui, event);
    expect(test).toBeUndefined();
  });
  it('should handle _onUIEnter when shouldRespondToUIEvent is false ', () => {
    const parent = document.createElement('div');
    parent.setAttribute('data-test', 'test-value');
    const input = document.createElement('input');
    input.className = 'test';
    parent.appendChild(input);
    // Set the selectionStart property of the input element
    input.selectionStart = 2;
    const event = {
      bubbles: true,
      cancelable: true,
      view: window,
      currentTarget: input,
    };
    const ui = new UICommand();
    jest.spyOn(ui, 'shouldRespondToUIEvent').mockReturnValue(true);
    const spy1 = jest.spyOn(custommenuui, '_execute');
    custommenuui._onUIEnter(ui, event);

    expect(spy1).toHaveBeenCalled();
  });

  it('should handle showsubmenu', () => {
    custommenuui._stylePopup = { close: () => {} };
    const ui = {
      _customStyleName: 'Normal',
      _customStyle: {
        styleName: 'Normal',
        mode: 0,
        description: 'Normal',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          fontName: 'Tahoma',
          fontSize: '12',
          nextLineStyleName: 'Normal',
          paragraphSpacingAfter: '3',
          toc: false,
        },
      },
      _popUp: null,
    };
    expect(custommenuui.showSubMenu(ui, null)).toBeUndefined();
  });
  it('should handle showsubmenu when popup not null', () => {
    custommenuui._popUp = { close: () => {} };
    // custommenuui._stylePopup = {close:()=>{}};
    const ui = {
      _customStyleName: 'Normal',
      _customStyle: {
        styleName: 'Normal',
        mode: 0,
        description: 'Normal',
        styles: {
          align: 'left',
          boldNumbering: true,
          boldSentence: true,
          fontName: 'Tahoma',
          fontSize: '12',
          nextLineStyleName: 'Normal',
          paragraphSpacingAfter: '3',
          toc: false,
        },
      },
      _popUp: null,
    };
    expect(
      custommenuui.showSubMenu(ui, {
        currentTarget: document.createElement('span'),
      })
    ).toBeUndefined();
  });
  it('should handle removeCustomStyleName', () => {
    expect(custommenuui.removeCustomStyleName(state, 'AFDP_Bullet', null)).toBe(
      false
    );
  });
  it('should handle removeCustomStyleName', () => {
    const state = {
      doc: mockdoc,
      schema: schema,
      selection: { from: 0, to: 1 },
      plugins: [new CustomstylePlugin(TestCustomStyleRuntime)],
      empty: null,
    };
    jest.spyOn(custommenuui, 'removeTextAlignAndLineSpacing').mockReturnValue({
      key: 'tr',
      docChanged: true,
      setNodeMarkup: () => {
        return { key: 'tr', docChanged: true };
      },
    });
    expect(
      custommenuui.removeCustomStyleName(state, 'AFDP_Bullet', (x) => {
        return x;
      })
    ).toBe(true);
  });
  it('should handle showStyleWindow', () => {
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
            styleName: { default: 'Test' },
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
            href: 'test_href',
          },
        },
        em: {
          parseDOM: [
            {
              tag: 'i',
            },
            {
              tag: 'em',
            },
            {
              style: 'font-style=italic',
            },
          ],
          toDOM() {
            return ['em', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false,
            },
          },
        },
        strong: {
          parseDOM: [
            {
              tag: 'strong',
            },
            {
              tag: 'b',
            },
            {
              style: 'font-weight',
            },
          ],
          toDOM() {
            return ['strong', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false,
            },
          },
        },
        underline: {
          parseDOM: [
            {
              tag: 'u',
            },
            {
              style: 'text-decoration-line',
            },
            {
              style: 'text-decoration',
            },
          ],
          toDOM() {
            return ['u', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false,
            },
          },
        },
        'mark-text-color': {
          attrs: {
            color: '',
            overridden: {
              hasDefault: true,
              default: false,
            },
          },
          inline: true,
          group: 'inline',
          parseDOM: [
            {
              style: 'color',
            },
          ],
          toDOM() {
            return ['span', { color: '' }, 0];
          },
        },
        'mark-text-highlight': {
          attrs: {
            highlightColor: '',
            overridden: {
              hasDefault: true,
              default: false,
            },
          },
          inline: true,
          group: 'inline',
          parseDOM: [
            {
              tag: 'span[style*=background-color]',
            },
          ],
          toDOM() {
            return {
              highlightColor: '',
            };
          },
        },
        'mark-font-size': {
          attrs: {
            pt: {
              default: null,
            },
            overridden: {
              hasDefault: true,
              default: false,
            },
          },
          inline: true,
          group: 'inline',
          parseDOM: [
            {
              style: 'font-size',
            },
          ],
          toDOM(mark, inline) {
            return ['Test Mark'];
          },
        },
        'mark-font-type': {
          attrs: {
            name: '',
            overridden: {
              hasDefault: true,
              default: false,
            },
          },
          inline: true,
          group: 'inline',
          parseDOM: [
            {
              style: 'font-family',
            },
          ],
          toDOM() {
            return ['span', 0];
          },
        },
        strong: {
          parseDOM: [
            {
              tag: 'strong',
            },
            {
              tag: 'b',
            },
            {
              style: 'font-weight',
            },
          ],

          toDOM() {
            return ['strong', 0];
          },
          attrs: {
            overridden: {
              hasDefault: true,
              default: false,
            },
          },
        },
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
        styleName: 'Normal',
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
            styleName: 'Normal',
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
    });
    const CustomMenuTestProps = {
      className: 'molcs-menu-button',
      commandGroups: [cmdGrp1, cmdGrp2, { Normal: true }],
      staticCommand: [{ Normal: true, _customStyleName: 'customstylename' }],
      disabled: false,
      dispatch: (tr) => {},
      editorState: state,
      editorView: editor.view,
      icon: 'button',
      label: 'Normal',
      title: 'styles',
      _style: '',
    };
    const custommenuui = new CustomMenuUI(CustomMenuTestProps);
    custommenuui.props = CustomMenuTestProps;
    const statemock = {
      schema: schema,
      doc: doc,
      selection: { from: 0, to: 1 },
    };
    const trmock = { setNodeMarkup: () => {} };
    expect(
      custommenuui.renameStyleInDocument(
        statemock,
        trmock,
        'Normal',
        'test',
        {}
      )
    ).toBeUndefined();
    expect(custommenuui.getTheSelectedCustomStyle(statemock)).toBeDefined();

    expect(custommenuui.showAlert()).toBeUndefined();
    const uicommands = {
      _customStyleName: 'test',
      _customStyle: { description: 'description', styles: {} },
    };
    const event = new Event('click');
    custommenuui._stylePopup = { close: () => {} };
    expect(custommenuui.showStyleWindow(uicommands, event, 0)).toBeUndefined();
  });
  it('should handle showStyleWindow', () => {
    const event = new Event('click');
    const uicommands = {
      _customStyleName: 'test',
      _customStyle: { description: 'description', styles: {} },
    };
    uicommands._stylePopup = null;
    expect(custommenuui.showStyleWindow(uicommands, event)).toBeUndefined();
  });
  it('should handle showStyleWindow', () => {
    const view = new EditorView(document.createElement('div'), {
      state,
    });

    // Mount the EditorView to the DOM
    document.body.appendChild(view.dom);

    // Set focus on the EditorView
    view.focus();
    const CustomMenuTestProps = {
      className: 'molcs-menu-button',
      commandGroups: [cmdGrp1, cmdGrp2, { Normal: true }],
      staticCommand: [{ Normal: true, _customStyleName: 'customstylename' }],
      disabled: false,
      dispatch: (tr) => {},
      editorState: state,
      editorView: view,
      icon: 'button',
      label: 'Normal',
      title: 'styles',
      _style: '',
    };
    const custommenuui = new CustomMenuUI(CustomMenuTestProps);
    custommenuui.props = CustomMenuTestProps;
    const event = new Event('click');
    const uicommands = {
      _customStyleName: 'test',
      _customStyle: { description: 'description', styles: {} },
    };
    uicommands._stylePopup = null;
    expect(custommenuui.showStyleWindow(uicommands, event)).toBeUndefined();
  });
});
