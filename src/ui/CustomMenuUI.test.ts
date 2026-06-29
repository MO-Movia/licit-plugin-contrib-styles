// import Enzyme from 'enzyme';
import { createEditor, doc, p } from 'jest-prosemirror';
// import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { CustomstylePlugin } from '../index';
import { CustomMenuUI } from './CustomMenuUI';
import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { CustomStyleCommand } from '../CustomStyleCommand';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import type * as React from 'react';
import { SyntheticEvent } from 'react';
import { Transform } from 'prosemirror-transform';
import { Node } from 'prosemirror-model';

// Enzyme.configure({ adapter: new Adapter() });

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
  // mockdoc.styleName = '';
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
    dispatch: () => { },
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
    tagName: '';
    constructor(tagName) {
      this.tagName = tagName;
    }

    // Add any additional methods or properties that you need for testing
  }
  document.getElementsByClassName = jest.fn().mockImplementation(() => {
    // Return a custom Element instance with the given class name
    const mockElement = new MockElement('div');
    // mockElement.classList.add(className);
    return [mockElement];
  });
  const custommenuui = new CustomMenuUI(CustomMenuTestProps);
  //(custommenuui as any).props = CustomMenuTestProps;

  it('should render the component', () => {
    expect(custommenuui.render()).toBeDefined();
  });
  it('should render the component is allowednode is false', () => {
    const CustomMenuTestProps = {
      className: 'molcs-menu-button',
      commandGroups: [cmdGrp1, cmdGrp2, { Normal: true }],
      staticCommand: [{ Normal: true, _customStyleName: 'customstylename' }],
      disabled: false,
      dispatch: () => { },
      editorState: state,
      editorView: { disabled: true },
      icon: 'button',
      label: 'Normal',
      title: 'styles',
      _style: '',
    };
    const custommenuui = new CustomMenuUI(CustomMenuTestProps);
    jest.spyOn(custommenuui, 'isAllowedNode').mockReturnValue(false);
    const custommenuuipro = new CustomMenuUI(CustomMenuTestProps);

    // (custommenuui as any).props = CustomMenuTestProps;
    expect(custommenuuipro.render()).toBeDefined();
  });
  it('should render the component', () => {
    const CustomMenuTestProps = {
      className: 'molcs-menu-button',
      commandGroups: [cmdGrp1, cmdGrp2, { Normal: true }],
      staticCommand: [{ Normal: true, _customStyleName: 'customstylename' }],
      disabled: false,
      dispatch: () => { },
      editorState: state,
      editorView: { disabled: true },
      icon: 'button',
      label: 'Normal',
      title: 'styles',
      _style: '',
    };
    const custommenuui = new CustomMenuUI(CustomMenuTestProps);
    expect(custommenuui.render()).toBeDefined();
  });

  it('should handle componentDidMount', () => {
    const dom = document.createElement('div');
    dom.className = 'molsp-stylenames';
    dom.scrollTop = 1;
    jest
      .spyOn(document, 'getElementsByClassName')
      .mockReturnValue([dom] as unknown as HTMLCollectionOf<Element>);
    // Make setState apply synchronously and run its callback so the scroll
    // math (driven by state.selectedIndex) can be asserted.
    jest
      .spyOn(custommenuui, 'setState')
      .mockImplementation((update, cb?: () => void) => {
        const partial =
          typeof update === 'function' ? update(custommenuui.state) : update;
        custommenuui.state = { ...custommenuui.state, ...partial };
        cb?.();
      });
    const rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 0);
    custommenuui._appliedIndex = 29;
    custommenuui.componentDidMount();
    expect(custommenuui.state.selectedIndex).toBe(29);
    expect(dom.scrollTop).toBe(751);
    expect(rafSpy).toHaveBeenCalled();
    (custommenuui.setState as jest.Mock).mockRestore();
    rafSpy.mockRestore();
  });

  const makeStyleDiv = (scrollTop: number, clientHeight: number) => {
    const dom = document.createElement('div');
    dom.className = 'molsp-stylenames';
    dom.scrollTop = scrollTop;
    Object.defineProperty(dom, 'clientHeight', {
      value: clientHeight,
      configurable: true,
    });
    jest
      .spyOn(document, 'getElementsByClassName')
      .mockReturnValue([dom] as unknown as HTMLCollectionOf<Element>);
    return dom;
  };

  it('should scroll down when the selected row is below the viewport', () => {
    // 5 rows visible (clientHeight 140), currently showing rows 0..4.
    const dom = makeStyleDiv(0, 140);
    custommenuui.state = { ...custommenuui.state, selectedIndex: 6 };
    custommenuui.scrollSelectedIntoView();
    // rowBottom (7*28=196) - clientHeight (140) = 56
    expect(dom.scrollTop).toBe(56);
  });

  it('should scroll up when the selected row is above the viewport', () => {
    // Showing rows 6..10 (scrollTop 168, clientHeight 140).
    const dom = makeStyleDiv(168, 140);
    custommenuui.state = { ...custommenuui.state, selectedIndex: 2 };
    custommenuui.scrollSelectedIntoView();
    // rowTop = 2 * 28 = 56
    expect(dom.scrollTop).toBe(56);
  });

  it('should not scroll when the selected row is already visible', () => {
    // Showing rows 2..6 (scrollTop 56, clientHeight 140); row 3 is in view.
    const dom = makeStyleDiv(56, 140);
    custommenuui.state = { ...custommenuui.state, selectedIndex: 3 };
    custommenuui.scrollSelectedIntoView();
    expect(dom.scrollTop).toBe(56);
  });

  it('should not throw in scrollSelectedIntoView when container missing', () => {
    jest
      .spyOn(document, 'getElementsByClassName')
      .mockReturnValue([] as unknown as HTMLCollectionOf<Element>);
    expect(() => custommenuui.scrollSelectedIntoView()).not.toThrow();
  });

  it('should move highlight down with ArrowDown', () => {
    custommenuui._navItems = [
      { command: cmdGrp1, label: 'a' },
      { command: cmdGrp2, label: 'b' },
    ] as unknown as Array<{ command: UICommand; label: string }>;
    custommenuui.state = { ...custommenuui.state, selectedIndex: 0 };
    const setStateSpy = jest
      .spyOn(custommenuui, 'setState')
      .mockImplementation((update) => {
        const partial =
          typeof update === 'function' ? update(custommenuui.state) : update;
        custommenuui.state = { ...custommenuui.state, ...partial };
      });
    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();
    custommenuui._onMenuKeyDown({
      key: 'ArrowDown',
      preventDefault,
      stopPropagation,
    } as unknown as React.KeyboardEvent);
    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    expect(custommenuui.state.selectedIndex).toBe(1);
    setStateSpy.mockRestore();
  });

  it('should wrap to the first row when ArrowDown past the end', () => {
    custommenuui._navItems = [
      { command: cmdGrp1, label: 'a' },
      { command: cmdGrp2, label: 'b' },
    ] as unknown as Array<{ command: UICommand; label: string }>;
    custommenuui.state = { ...custommenuui.state, selectedIndex: 1 };
    const setStateSpy = jest
      .spyOn(custommenuui, 'setState')
      .mockImplementation((update) => {
        const partial =
          typeof update === 'function' ? update(custommenuui.state) : update;
        custommenuui.state = { ...custommenuui.state, ...partial };
      });
    custommenuui._onMenuKeyDown({
      key: 'ArrowDown',
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as React.KeyboardEvent);
    expect(custommenuui.state.selectedIndex).toBe(0);
    setStateSpy.mockRestore();
  });

  it('should wrap to the last row when ArrowUp past the start', () => {
    custommenuui._navItems = [
      { command: cmdGrp1, label: 'a' },
      { command: cmdGrp2, label: 'b' },
    ] as unknown as Array<{ command: UICommand; label: string }>;
    custommenuui.state = { ...custommenuui.state, selectedIndex: 0 };
    const setStateSpy = jest
      .spyOn(custommenuui, 'setState')
      .mockImplementation((update) => {
        const partial =
          typeof update === 'function' ? update(custommenuui.state) : update;
        custommenuui.state = { ...custommenuui.state, ...partial };
      });
    custommenuui._onMenuKeyDown({
      key: 'ArrowUp',
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as React.KeyboardEvent);
    expect(custommenuui.state.selectedIndex).toBe(1);
    setStateSpy.mockRestore();
  });

  it('should move highlight up with ArrowUp', () => {
    custommenuui._navItems = [
      { command: cmdGrp1, label: 'a' },
      { command: cmdGrp2, label: 'b' },
    ] as unknown as Array<{ command: UICommand; label: string }>;
    custommenuui.state = { ...custommenuui.state, selectedIndex: 1 };
    const setStateSpy = jest
      .spyOn(custommenuui, 'setState')
      .mockImplementation((update) => {
        const partial =
          typeof update === 'function' ? update(custommenuui.state) : update;
        custommenuui.state = { ...custommenuui.state, ...partial };
      });
    custommenuui._onMenuKeyDown({
      key: 'ArrowUp',
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as React.KeyboardEvent);
    expect(custommenuui.state.selectedIndex).toBe(0);
    setStateSpy.mockRestore();
  });

  it('should execute the selected command on Enter', () => {
    custommenuui._navItems = [
      { command: cmdGrp1, label: 'a' },
      { command: cmdGrp2, label: 'b' },
    ] as unknown as Array<{ command: UICommand; label: string }>;
    custommenuui.state = { ...custommenuui.state, selectedIndex: 1 };
    const executeSpy = jest
      .spyOn(custommenuui, '_execute')
      .mockImplementation(() => {});
    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();
    custommenuui._onMenuKeyDown({
      key: 'Enter',
      preventDefault,
      stopPropagation,
    } as unknown as React.KeyboardEvent);
    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    expect(executeSpy).toHaveBeenCalledWith(cmdGrp2, expect.anything());
    executeSpy.mockRestore();
  });

  it('should ignore keys when the style list is empty', () => {
    custommenuui._navItems = [];
    const preventDefault = jest.fn();
    const result = custommenuui._onMenuKeyDown({
      key: 'ArrowDown',
      preventDefault,
      stopPropagation: jest.fn(),
    } as unknown as React.KeyboardEvent);
    expect(result).toBeUndefined();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('should set the selection to the hovered row index', () => {
    custommenuui.state = { ...custommenuui.state, selectedIndex: 0 };
    const setStateSpy = jest
      .spyOn(custommenuui, 'setState')
      .mockImplementation((update) => {
        const partial =
          typeof update === 'function' ? update(custommenuui.state) : update;
        custommenuui.state = { ...custommenuui.state, ...partial };
      });
    custommenuui._onItemMouseEnter(3);
    expect(custommenuui.state.selectedIndex).toBe(3);
    setStateSpy.mockRestore();
  });

  it('should select the hovered row from a nested target via data-index', () => {
    const row = document.createElement('div');
    row.setAttribute('data-index', '4');
    const span = document.createElement('span');
    row.appendChild(span);
    custommenuui._lastPointerX = null;
    custommenuui._lastPointerY = null;
    const spy = jest
      .spyOn(custommenuui, '_onItemMouseEnter')
      .mockImplementation(() => {});
    custommenuui._onMenuMouseOver({
      target: span,
      clientX: 10,
      clientY: 20,
    } as unknown as MouseEvent);
    expect(spy).toHaveBeenCalledWith(4);
    spy.mockRestore();
  });

  it('should ignore mouseover when no row is under the pointer', () => {
    const orphan = document.createElement('span');
    const spy = jest
      .spyOn(custommenuui, '_onItemMouseEnter')
      .mockImplementation(() => {});
    custommenuui._onMenuMouseOver({
      target: orphan,
      clientX: 99,
      clientY: 99,
    } as unknown as MouseEvent);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should ignore scroll-induced mouseover with an unchanged pointer position', () => {
    const row = document.createElement('div');
    row.setAttribute('data-index', '6');
    const span = document.createElement('span');
    row.appendChild(span);
    // Pointer last rested at (30, 40); arrow-key scrolling brings a new row
    // under the SAME coordinates — this must not hijack the keyboard selection.
    custommenuui._lastPointerX = 30;
    custommenuui._lastPointerY = 40;
    const spy = jest
      .spyOn(custommenuui, '_onItemMouseEnter')
      .mockImplementation(() => {});
    custommenuui._onMenuMouseOver({
      target: span,
      clientX: 30,
      clientY: 40,
    } as unknown as MouseEvent);
    expect(spy).not.toHaveBeenCalled();
    // A genuine move (coordinates change) is still honored.
    custommenuui._onMenuMouseOver({
      target: span,
      clientX: 31,
      clientY: 40,
    } as unknown as MouseEvent);
    expect(spy).toHaveBeenCalledWith(6);
    spy.mockRestore();
  });

  it('should attach and detach the native mouseover listener', () => {
    const node = document.createElement('div');
    const addSpy = jest.spyOn(node, 'addEventListener');
    const removeSpy = jest.spyOn(node, 'removeEventListener');
    (custommenuui._menuRef as { current: HTMLDivElement | null }).current = node;
    jest.spyOn(custommenuui, 'setState').mockImplementation(() => {});
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 0);
    custommenuui.componentDidMount();
    expect(addSpy).toHaveBeenCalledWith(
      'mouseover',
      custommenuui._onMenuMouseOver
    );
    custommenuui.componentWillUnmount();
    expect(removeSpy).toHaveBeenCalledWith(
      'mouseover',
      custommenuui._onMenuMouseOver
    );
    jest.restoreAllMocks();
  });

  it('should re-enter the style range with ArrowDown from a static row', () => {
    custommenuui._navItems = [
      { command: cmdGrp1, label: 'a' },
      { command: cmdGrp2, label: 'b' },
    ] as unknown as Array<{ command: UICommand; label: string }>;
    // selectedIndex sits on a static row (beyond the style range).
    custommenuui.state = { ...custommenuui.state, selectedIndex: 5 };
    const setStateSpy = jest
      .spyOn(custommenuui, 'setState')
      .mockImplementation((update) => {
        const partial =
          typeof update === 'function' ? update(custommenuui.state) : update;
        custommenuui.state = { ...custommenuui.state, ...partial };
      });
    custommenuui._onMenuKeyDown({
      key: 'ArrowDown',
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as React.KeyboardEvent);
    expect(custommenuui.state.selectedIndex).toBe(0);
    setStateSpy.mockRestore();
  });

  it('should re-enter the style range with ArrowUp from a static row', () => {
    custommenuui._navItems = [
      { command: cmdGrp1, label: 'a' },
      { command: cmdGrp2, label: 'b' },
    ] as unknown as Array<{ command: UICommand; label: string }>;
    custommenuui.state = { ...custommenuui.state, selectedIndex: 5 };
    const setStateSpy = jest
      .spyOn(custommenuui, 'setState')
      .mockImplementation((update) => {
        const partial =
          typeof update === 'function' ? update(custommenuui.state) : update;
        custommenuui.state = { ...custommenuui.state, ...partial };
      });
    custommenuui._onMenuKeyDown({
      key: 'ArrowUp',
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as React.KeyboardEvent);
    expect(custommenuui.state.selectedIndex).toBe(1);
    setStateSpy.mockRestore();
  });

  it('should execute a static command on Enter when it is selected', () => {
    custommenuui._navItems = [
      { command: cmdGrp1, label: 'a' },
    ] as unknown as Array<{ command: UICommand; label: string }>;
    custommenuui._staticItems = [
      { command: cmdGrp2, label: 'static' },
    ] as unknown as Array<{ command: UICommand; label: string }>;
    // index 1 = first static row (just past the single style row).
    custommenuui.state = { ...custommenuui.state, selectedIndex: 1 };
    const executeSpy = jest
      .spyOn(custommenuui, '_execute')
      .mockImplementation(() => {});
    custommenuui._onMenuKeyDown({
      key: 'Enter',
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as React.KeyboardEvent);
    expect(executeSpy).toHaveBeenCalledWith(cmdGrp2, expect.anything());
    executeSpy.mockRestore();
  });

  it('should match styles by search term', () => {
    expect(custommenuui.isStyleMatch('Heading One', 'heading')).toBe(true);
    expect(custommenuui.isStyleMatch('Heading One', 'body')).toBe(false);
    expect(custommenuui.isStyleMatch('Heading One', '')).toBe(true);
  });

  it('should compact the style list when search has no matches', () => {
    const ui = new CustomMenuUI({
      ...CustomMenuTestProps,
      commandGroups: [{ Heading: cmdGrp1 }],
    });
    ui.state = { ...ui.state, searchTerm: 'missing' };

    const rendered = ui.render();
    const span = rendered.props.children;
    const dropDown = span.props.children;
    const styleNames = dropDown.props.children[1];

    expect(styleNames.props.className).toBe(
      'molsp-stylenames molsp-stylenames-empty'
    );
  });

  it('should keep the style menu open when the search context menu is opened', () => {
    const stopPropagation = jest.fn();

    custommenuui._onSearchContextMenu({
      stopPropagation,
    } as unknown as SyntheticEvent<HTMLInputElement>);

    expect(stopPropagation).toHaveBeenCalled();
  });

  it('should handle isAllowedNode', () => {
    const node = { type: { name: 'ordered_list' } } as unknown as Node;
    expect(custommenuui.isAllowedNode(node)).toBe(true);
  });
    it('should handle isAllowedNode', () => {
    const node = { type: { name: 'enhanced_table_figure_notes' } } as unknown as Node;
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
    // const ui = new UICommand();
    const ui = {
      shouldRespondToUIEvent: () => {
        return true;
      },
    } as unknown as UICommand;
    //jest.spyOn(ui, 'shouldRespondToUIEvent').mockReturnValue(true);
    const spy1 = jest.spyOn(custommenuui, 'showSubMenu');
    custommenuui._onUIEnter(ui, event as unknown as SyntheticEvent);
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
    const ui = {
      shouldRespondToUIEvent: () => {
        return false;
      },
    } as unknown as UICommand;
    //jest.spyOn(ui, 'shouldRespondToUIEvent').mockReturnValue(false);
    // const spy1 = jest.spyOn(custommenuui, 'showSubMenu');
    const test = custommenuui._onUIEnter(
      ui,
      event as unknown as SyntheticEvent
    );
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
    const ui = {
      shouldRespondToUIEvent: () => {
        return true;
      },
      execute: () => {
        return true;
      },
    } as unknown as UICommand;
    //jest.spyOn(ui, 'shouldRespondToUIEvent').mockReturnValue(true);
    const spy1 = jest.spyOn(custommenuui, '_execute');
    custommenuui._onUIEnter(ui, event as unknown as SyntheticEvent);

    expect(spy1).toHaveBeenCalled();
  });

  it('should handle showsubmenu', () => {
    custommenuui._stylePopup = null;
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
      custommenuui.showSubMenu(
        ui as unknown as UICommand,
        null as unknown as SyntheticEvent
      )
    ).toBeUndefined();
  });
  it('should handle showsubmenu when popup not null', () => {
    custommenuui._popUp = null;
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
    } as unknown as UICommand;
    expect(
      custommenuui.showSubMenu(ui, {
        currentTarget: document.createElement('span'),
      } as unknown as SyntheticEvent)
    ).toBeUndefined();
  });
  it('should handle showsubmenu when popup not null', () => {
    custommenuui._stylePopup = { close: () => { } } as unknown as null;
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
    } as unknown as UICommand;
    expect(
      custommenuui.showSubMenu(ui, {
        currentTarget: document.createElement('span'),
      } as unknown as SyntheticEvent)
    ).toBeUndefined();
  });
  it('should handle removeCustomStyleName1', () => {
    expect(custommenuui.removeCustomStyleName(state, 'AFDP_Bullet', null)).toBe(
      false
    );
  });
  it('should handle removeCustomStyleName2', () => {
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
      doc: mockdoc,
      setNodeMarkup: () => {
        return { key: 'tr', docChanged: true };
      },
    } as unknown as Transform);
    expect(
      custommenuui.removeCustomStyleName(state, 'AFDP_Bullet', (x) => {
        return x;
      })
    ).toBe(true);
  });

  it('should handle removeCustomStyleName3', () => {
    const setSelection = () => {
      return {
        setSelection,
        mapping: {
          map: (pos) => pos,
        },
        doc: {
          nodesBetween(from, to, callback) {
            for (let i = from; i < to; i++) {
              const node = {
                content: {
                  content: [
                    {
                      marks: [{ attrs: { styleName: 'AFDP_Bullet' } }],
                    },
                  ],
                },
                type: { name: 'paragraph' },
                attrs: { styleName: 'AFDP_Bullet' },
              };
              callback(node, i);
            }
          },
          resolve: () => {
            return el;
          },
          nodeSize: 10,
        },
        removeMark: () => {
          return removeMarkChain;
        },
      };
    };
    const el = {
      parent: { inlineContent: {} },
      min: () => { },
      max: () => { },
    } as unknown as HTMLDivElement;
    const removeMarkChain = {
      mapping: {
        map: (pos) => pos,
      },
      setNodeMarkup: () => {
        return removeMarkChain;
      },
      setSelection,
      doc: {
        nodesBetween(from, to, callback) {
          for (let i = from; i < to; i++) {
            const node = {
              content: {
                content: [
                  {
                    marks: [{ attrs: { styleName: 'AFDP_Bullet' } }],
                  },
                ],
              },
              type: { name: 'paragraph' },
              attrs: { styleName: 'AFDP_Bullet' },
            };
            callback(node, i);
          }
        },
        nodeAt: () => {
          return { type: { name: 'paragraph' } };
        },
        resolve: () => {
          return el;
        },
        nodeSize: 10,
      },
      removeMark: () => {
        return removeMarkChain;
      },
    };
    const state = {
      doc: {
        nodesBetween(from, to, callback) {
          for (let i = from; i < to; i++) {
            const node = {
              content: {
                content: [
                  {
                    marks: [{ attrs: { styleName: 'AFDP_Bullet' } }],
                  },
                ],
              },
              type: { name: 'paragraph' },
              attrs: { styleName: 'AFDP_Bullet' },
            };
            callback(node, i);
          }
        },
        nodeSize: 10,
      },
      schema: { marks: {} },
      selection: { from: 0, to: 1 },
      plugins: [],
      empty: null,
      tr: {
        doc: {
          nodesBetween(from, to, callback) {
            for (let i = from; i < to; i++) {
              const node = {
                content: {
                  content: [
                    {
                      marks: [{ attrs: { styleName: 'AFDP_Bullet' } }],
                    },
                  ],
                },
                type: { name: 'paragraph' },
                attrs: { styleName: 'AFDP_Bullet' },
              };
              callback(node, i);
            }
          },
          nodeSize: 10,
        },
        removeMark: () => removeMarkChain,
        setSelection: setSelection,
      },
    };

    const dispatchMock = jest.fn();

    const result = custommenuui.removeCustomStyleName(
      state,
      'AFDP_Bullet',
      dispatchMock
    );
    expect(result).toBeTruthy();
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
            href: {},
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
              default: false,
            },
          },
        },
        'mark-text-color': {
          attrs: {
            // color: '',
            overridden: {
              //  hasDefault: true,
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
            // highlightColor: '',
            overridden: {
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
            return [
              'span',
              {
                highlightColor: '',
              },
            ];
          },
        },
        'mark-font-size': {
          attrs: {
            pt: {
              default: null,
            },
            overridden: {
              // hasDefault: true,
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
          toDOM() {
            return ['Test Mark'];
          },
        },
        'mark-font-type': {
          attrs: {
            // name: '',
            overridden: {
              // hasDefault: true,
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
      dispatch: () => { },
      editorState: state,
      editorView: editor.view,
      icon: 'button',
      label: 'Normal',
      title: 'styles',
      _style: '',
    };
    const custommenuui = new CustomMenuUI(CustomMenuTestProps);
    const statemock = {
      schema: schema,
      doc: doc,
      selection: { from: 0, to: 1 },
    } as unknown as EditorState;
    const trmock = { setNodeMarkup: () => { } } as unknown as Transform;

    expect(
      custommenuui.renameStyleInDocument(statemock, trmock, 'Normal', 'test')
    ).toBeUndefined();
    expect(custommenuui.getTheSelectedCustomStyle(statemock)).toBeDefined();

    const uicommands = {
      _customStyleName: 'test',
      _customStyle: { description: 'description', styles: {} },
    };
    const event = new Event('click') as unknown as SyntheticEvent;
    custommenuui._stylePopup = null;
    expect(custommenuui.showStyleWindow(uicommands, event, 0)).toBeUndefined();
    expect(custommenuui.showStyleWindow(uicommands, event, 0)).toBeUndefined();
  });
  it('should handle showStyleWindow', () => {
    const event = new Event('click');
    const uicommands = {
      _customStyleName: 'test',
      _customStyle: { description: 'description', styles: {} },
    };
    custommenuui._stylePopup = null;
    expect(
      custommenuui.showStyleWindow(
        uicommands,
        event as unknown as SyntheticEvent,
        0
      )
    ).toBeUndefined();
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
      dispatch: () => { },
      editorState: state,
      editorView: view,
      icon: 'button',
      label: 'Normal',
      title: 'styles',
      _style: '',
    };
    const custommenuui = new CustomMenuUI(CustomMenuTestProps);
    const event = new Event('click');
    const uicommands = {
      _customStyleName: 'test',
      _customStyle: { description: 'description', styles: {} },
    };
    custommenuui._stylePopup = null;
    expect(
      custommenuui.showStyleWindow(
        uicommands,
        event as unknown as SyntheticEvent,
        0
      )
    ).toBeUndefined();
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
      dispatch: () => { },
      editorState: state,
      editorView: view,
      icon: 'button',
      label: 'Normal',
      title: 'styles',
      _style: '',
    };
    const custommenuui = new CustomMenuUI(CustomMenuTestProps);
    const event = new Event('click');
    const uicommands = {
      _customStyleName: 'test',
      _customStyle: { description: 'description', styles: {} },
    };
    custommenuui._stylePopup = { close: () => { } } as unknown as null;
    expect(
      custommenuui.showStyleWindow(
        uicommands,
        event as unknown as SyntheticEvent,
        0
      )
    ).toBeUndefined();
    expect(
      custommenuui.showStyleWindow(
        uicommands,
        event as unknown as SyntheticEvent,
        0
      )
    ).toBeUndefined();
  });
});
