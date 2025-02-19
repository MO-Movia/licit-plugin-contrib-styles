import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { CustomMenuButton } from './CustomMenuButton';
import { EditorState } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';

describe('CustomMenuButton', () => {
  const mockState = {
    doc: {
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
    },
    selection: { type: 'text', anchor: 1, head: 1 },
  } as unknown as EditorState;
  const props = {
    className: 'width-100 stylemenu-backgroundcolor',
    commandGroups: [
      {
        Normal: {
          _customStyleName: 'Normal',
          _customStyle: 'Normal',
          _popUp: null,
        },
      },
    ] as unknown as Array<{ [string: string]: UICommand }>,
    staticCommand: [
      {
        newstyle: {
          _customStyleName: 'New Style..',
          _customStyle: 'newstyle',
          _popUp: null,
        },
        editall: {
          _customStyleName: 'Edit All',
          _customStyle: 'editall',
          _popUp: null,
        },
        clearstyle: {
          _customStyleName: 'Clear Style',
          _customStyle: 'clearstyle',
          _popUp: null,
        },
      },
    ] as unknown as Array<{ [string: string]: UICommand }>,
    disabled: true,
    dispatch: () => undefined,
    editorState: mockState,
    editorView: null,
    label: 'Normal',
  };
  const custommenubutton = new CustomMenuButton(props);

  it('should handle render', () => {
    expect(custommenubutton).toBeDefined();
    expect(custommenubutton.render()).toBeDefined();
  });
  it('should handle componentWillUnmount', () => {
    const spy = jest.spyOn(custommenubutton, '_hideMenu');
    custommenubutton.componentWillUnmount();
    expect(spy).toHaveBeenCalled();
  });
  it('should handle _onClick ', () => {
    custommenubutton.state = { expanded: true };
    custommenubutton._showMenu = () => undefined;
    const spy = jest.spyOn(custommenubutton, '_showMenu');
    custommenubutton._onClick();
    expect(spy).toBeDefined();
    spy.mockReset();
  });
  it('should handle _onClick when this.state.expanded = true', () => {
    custommenubutton.state = { expanded: true };
    custommenubutton._menu = { close: () => undefined } as unknown as null;
    const spy = jest.spyOn(custommenubutton, '_hideMenu');
    custommenubutton._onClick();
    expect(spy).toBeDefined();
    spy.mockReset();
  });
  it('should handle _onCommand ', () => {
    custommenubutton.state.expanded = true;
    custommenubutton._menu = { close: () => undefined };
    const spy = jest.spyOn(custommenubutton, '_hideMenu');
    custommenubutton._onCommand();
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
  });
  it('should handle _onClose  ', () => {
    custommenubutton.state.expanded = true;
    custommenubutton._menu = { close: () => undefined };
    custommenubutton._onClose();
    expect(custommenubutton._menu).toBeNull();
  });
  it('should handle _onClose when menu is not present ', () => {
    custommenubutton.state.expanded = true;
    custommenubutton._menu = null;
    custommenubutton._onClose();
    expect(custommenubutton._menu).toBeNull();
  });
  describe('_onClick', () => {
    let component;

    beforeEach(() => {
      // Initialize your component here
      component = custommenubutton;
      component._showMenu = jest.fn(); // Mock _showMenu
      component._hideMenu = jest.fn(); // Mock _hideMenu
      component.setState = jest.fn((callback) => {
        const newState = callback(component.state);
        component.state = { ...component.state, ...newState };
      });
    });

    it('should call _showMenu when expanded is false', () => {
      // Initial state: expanded is false
      component.state = { expanded: false };

      // Trigger the onClick method
      component._onClick();

      // Expect _showMenu to have been called
      expect(component._showMenu).toHaveBeenCalled();

      // Expect state to be updated to expanded: true
      expect(component.setState).toHaveBeenCalledWith(expect.any(Function)); // Verify setState was called
      expect(component.state.expanded).toBe(true); // Verify state update
    });

    it('should call _hideMenu when expanded is true', () => {
      // Initial state: expanded is true
      component.state = { expanded: true };

      // Trigger the onClick method
      component._onClick();

      // Expect _hideMenu to have been called
      expect(component._hideMenu).toHaveBeenCalled();

      // Expect state to be updated to expanded: false
      expect(component.setState).toHaveBeenCalledWith(expect.any(Function)); // Verify setState was called
      expect(component.state.expanded).toBe(false); // Verify state update
    });
  });
});
describe('custommenubutton', () => {
  it('should handle _showMenu ', () => {
    const mockState = {
      doc: {
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
      },
      selection: { type: 'text', anchor: 1, head: 1 },
    } as unknown as EditorState;
    const props = {
      className: 'width-100 stylemenu-backgroundcolor',
      commandGroups: [
        {
          Normal: {
            _customStyleName: 'Normal',
            _customStyle: 'Normal',
            _popUp: null,
          },
        },
      ] as unknown as Array<{ [string: string]: UICommand }>,
      staticCommand: [
        {
          newstyle: {
            _customStyleName: 'New Style..',
            _customStyle: 'newstyle',
            _popUp: null,
          },
          editall: {
            _customStyleName: 'Edit All',
            _customStyle: 'editall',
            _popUp: null,
          },
          clearstyle: {
            _customStyleName: 'Clear Style',
            _customStyle: 'clearstyle',
            _popUp: null,
          },
        },
      ] as unknown as Array<{ [string: string]: UICommand }>,
      disabled: true,
      dispatch: () => undefined,
      editorState: mockState,
      editorView: null,
      label: 'Normal',
    };
    const custommenubutton = new CustomMenuButton(props);
    custommenubutton.state.expanded = true;
    custommenubutton._menu = {
      close: () => undefined,
      update: () => undefined,
    };
    const spy = jest.spyOn(custommenubutton._menu, 'update');
    custommenubutton._showMenu();
    expect(spy).toHaveBeenCalled();
  });
  it('should handle _showMenu ', () => {
    const mockschema = new Schema({
      nodes: {
        doc: {
          content: 'paragraph+',
        },
        paragraph: {
          content: 'text*',
          attrs: {
            styleName: { default: 'test' },
          },
          toDOM() {
            return ['p', 0];
          },
        },
        heading: {
          attrs: { level: { default: 1 }, styleName: { default: '' } },
          content: 'inline*',
          marks: '',
          toDOM(node) {
            return [
              'h' + node.attrs.level,
              { 'data-style-name': node.attrs.styleName },
              0,
            ];
          },
        },
        text: {
          group: 'inline',
        },
      },
    });

    // Create a sample document
    const mockdoc = mockschema.nodeFromJSON({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, styleName: 'test' },
          content: [
            {
              type: 'text',
              text: 'Hello, ProseMirror!',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a mock dummy document.',
              attrs: { styleName: 'test' },
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'It demonstrates the structure of a ProseMirror document.',
            },
          ],
        },
      ],
    });
    const mockState = {
      doc: mockdoc,
      selection: { type: 'text', anchor: 1, head: 1 },
    } as unknown as EditorState;
    const props = {
      className: 'width-100 stylemenu-backgroundcolor',
      commandGroups: [
        {
          Normal: {
            _customStyleName: 'Normal',
            _customStyle: 'Normal',
            _popUp: null,
          },
        },
      ] as unknown as Array<{ [string: string]: UICommand }>,
      staticCommand: [
        {
          newstyle: {
            _customStyleName: 'New Style..',
            _customStyle: 'newstyle',
            _popUp: null,
          },
          editall: {
            _customStyleName: 'Edit All',
            _customStyle: 'editall',
            _popUp: null,
          },
          clearstyle: {
            _customStyleName: 'Clear Style',
            _customStyle: 'clearstyle',
            _popUp: null,
          },
        },
      ] as unknown as Array<{ [string: string]: UICommand }>,
      disabled: true,
      dispatch: () => undefined,
      editorState: mockState,
      editorView: null,
      label: 'Normal',
    };
    const custommenubutton = new CustomMenuButton(props);
    custommenubutton.state.expanded = true;
    custommenubutton._menu = null;
    expect(custommenubutton._showMenu()).toBeUndefined();
  });
});
