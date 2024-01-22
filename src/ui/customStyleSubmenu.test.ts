import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { CustomStyleSubMenu } from './CustomStyleSubMenu';

describe('CustomStyleSubMenu', () => {
  it('should handle onclick', () => {
    const customstylesubmenu = new CustomStyleSubMenu({
      command: {} as unknown as UICommand,
      disabled: true,
      close: () => undefined,
    });
    customstylesubmenu.props = {
      command: {},
      disables: false,
      close: () => {
        return { key: 'closed' };
      },
    };
    const spy = jest.spyOn(customstylesubmenu.props, 'close');
    customstylesubmenu.onButtonClick('close');
    expect(spy).toHaveBeenLastCalledWith('close');
  });
});
