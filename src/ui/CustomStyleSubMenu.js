// @flow

import '@modusoperandi/licit-ui-commands/dist/ui/czi-custom-button.css';
import * as React from 'react';
import './custom-dropdown.css';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

export class CustomStyleSubMenu extends React.PureComponent<any, any> {
  props: {
    command: UICommand,
    disabled?: ?boolean,
    close: () => void,
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
        >
          Rename Style..
        </a>
        <a
          onClick={this.onButtonClick.bind(this, {
            type: 'remove',
            command: command,
          })}
        >
          Reset Style to Normal..
        </a>
      </div>
    );
  }

  //handles the option button click, close the popup with selected values
  onButtonClick(val) {
    this.props.close(val);
  }
}

