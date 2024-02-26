import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { CustomStyleSubMenu } from './CustomStyleSubMenu';

describe('CustomStyleSubMenu', () => {
  it('should handle onclick', () => {
    const closeMock = jest.fn();
    const customstylesubmenu = new CustomStyleSubMenu({
      command: {} as unknown as UICommand,
      disabled: true,
      close: closeMock,
    });
  
    const spy = jest.spyOn(customstylesubmenu.props, 'close');
  
    customstylesubmenu.onButtonClick('close');
  
    expect(spy).toHaveBeenCalled();
  });
  
    });
