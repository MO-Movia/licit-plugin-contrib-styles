import cx from 'classnames';
import '@modusoperandi/licit-ui-commands/ui/czi-custom-button.css';
import React from 'react';
import './custom-dropdown.css';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { CustomStyleCommand } from '../CustomStyleCommand';
import {
  RESERVED_STYLE_NONE
} from '../CustomStyleNodeSpec.js';

export class CustomStyleSubMenu extends React.PureComponent<
  {
    command: UICommand;
    disabled?: boolean;
    close: (value: unknown) => void;
  },
  unknown
> {
  render(): React.ReactElement<unknown> {
    const { command } = this.props;
    const showmenu = RESERVED_STYLE_NONE != (command as CustomStyleCommand)._customStyleName;
    const divClassName = cx('molsp-dropdown-content', {
      'div-height-large': showmenu,
      'div-height-small': !showmenu,
    });

    return (
      <div className={divClassName} data-cy="cyStyleEditDropdown" id="mo-submenu">
        <a
          onClick={() => this.onButtonClick({ type: 'modify', command })}
        >
          Modify Style..
        </a>
        {RESERVED_STYLE_NONE != (command as CustomStyleCommand)._customStyleName && (
          <>
            <a
              onClick={() => this.onButtonClick({ type: 'rename', command })}
            >
              Rename Style..
            </a>
            <a
              data-cy="cyStyleEditReset"
              onClick={() => this.onButtonClick({ type: 'remove', command })}
            >
              Reset Style to Normal..
            </a>
          </>
        )}
      </div>
    );
  }

  //handles the option button click, close the popup with selected values
  onButtonClick(val) {
    this.props.close(val);
  }
}
