import { CustomStyleSubMenu } from './CustomStyleSubMenu';

describe('CustomStyleSubMenu', () => {
  it('should handle onclick', () => {
    const customstylesubmenu = new CustomStyleSubMenu({}, true, (x) => {});
    customstylesubmenu.props = {
      command: {},
      disables: false,
      close: (x) => {
        return { key: 'closed' };
      },
    };
    const spy = jest.spyOn(customstylesubmenu.props, 'close');
    customstylesubmenu.onButtonClick('close');
    expect(spy).toHaveBeenLastCalledWith('close');
  });
});
