import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { CustomMenuButton } from './CustomMenuButton';

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
  } as any;
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
    ] as unknown as  Array<{ [string: string]: UICommand }>,
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
    custommenubutton._showMenu = () => undefined;
    const spy = jest.spyOn(custommenubutton, '_showMenu');
    custommenubutton._onClick();
    expect(spy).toBeDefined();
    spy.mockReset();
  });
  it('should handle _onClick when this.state.expanded = true', () => {
    custommenubutton.state.expanded = true;
    custommenubutton._menu = { close: () => undefined };
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
    } as any;
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
      ] as unknown as  Array<{ [string: string]: UICommand }>,
      disabled: true,
      dispatch: () => undefined,
      editorState: mockState,
      editorView: null,
      label: 'Normal',
    };
    const custommenubutton = new CustomMenuButton(props);
    // custommenubutton.props = {
    //   className: 'width-100 stylemenu-backgroundcolor',
    //   commandGroups: [
    //     {
    //       Normal: {
    //         _customStyleName: 'Normal',
    //         _customStyle: 'Normal',
    //         _popUp: null,
    //       },
    //     },
    //   ],
    //   staticCommand: [
    //     {
    //       newstyle: {
    //         _customStyleName: 'New Style..',
    //         _customStyle: 'newstyle',
    //         _popUp: null,
    //       },
    //       editall: {
    //         _customStyleName: 'Edit All',
    //         _customStyle: 'editall',
    //         _popUp: null,
    //       },
    //       clearstyle: {
    //         _customStyleName: 'Clear Style',
    //         _customStyle: 'clearstyle',
    //         _popUp: null,
    //       },
    //     },
    //   ],
    //   disabled: true,
    //   dispatch: () => undefined,
    //   editorState: mockState,
    //   editorView: null,
    //   label: 'Normal',
    // };
    custommenubutton.state.expanded = true;
    custommenubutton._menu = {
      close: () => undefined,
      update: () => undefined,
    };
    const spy = jest.spyOn(custommenubutton._menu, 'update');
    custommenubutton._showMenu();
    expect(spy).toHaveBeenCalled();
  });
});
