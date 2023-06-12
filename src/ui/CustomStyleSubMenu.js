// @flow

import '@modusoperandi/licit-ui-commands/dist/ui/czi-custom-button.css';
import * as React from 'react';
import './custom-dropdown.css';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

class CustomStyleSubMenu extends React.PureComponent<any, any> {
  props: {
    command: UICommand,
    disabled?: ?boolean,
    close: (?string) => void,
  };

  render(): React.Element<any> {
    const { command } = this.props;

    return (
      <div className="molsp-dropdown-content" id="mo-submenu">
        <a
          onClick={this.onButtonClick.bind(this, {
            type: 'modify',
            command: command,
          })}
        >
          Modify Style..
        </a>
        <a
          onClick={this.onButtonClick.bind(this, {
            type: 'rename',
            command: command,
          })}
          style={{ pointerEvents: command._customStyleName==='Normal'? 'none':'auto' }}
        >
          Rename Style..
        </a>
        <a
          onClick={this.onButtonClick.bind(this, {
            type: 'remove',
            command: command,
          })}
        >
          Delete Style..
        </a>
      </div>
    );
  }

  //handles the option button click, close the popup with selected values
  onButtonClick(val: Object) {
    this.props.close(val);
  }
}

export default CustomStyleSubMenu;
