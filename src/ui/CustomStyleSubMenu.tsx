import React from 'react';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

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

    return (
      <div
        className="molsp-dropdown-content"
        data-cy="cyStyleEditDropdown"
        id="mo-submenu"
      >
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
          data-cy="cyStyleEditReset"
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
