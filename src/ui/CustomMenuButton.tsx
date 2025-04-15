// [FS] IRAD-1039 2020-09-23
// Command button to handle different type of list types
// Need to add Icons instead of label

import cx from 'classnames';
import React from 'react';
import {
  CustomButton,
  PopUpHandle,
  createPopUp,
} from '@modusoperandi/licit-ui-commands';
import { uuid } from './Uuid.js';
import { CustomMenuUI } from './CustomMenuUI.js';

interface CustomMenuProps {
  className?: string;
  disabled?: boolean;
  icon?: string | React.ReactElement | null;
  label?: string | React.ReactElement | null;
  title?: string;
}
export class CustomMenuButton extends React.PureComponent<
  CustomMenuProps,
  {
    expanded: boolean;
  }
> {
  state = {
    expanded: false,
  };
  _menu?: PopUpHandle = null;
  _id = uuid();

  render(): React.ReactElement {
    const { className, label, icon, title } = this.props;
    const { expanded } = this.state;
    const buttonClassName = cx(className, {
      'czi-custom-menu-button': true,
      expanded,
    });

    return (
      <CustomButton
        className={buttonClassName}
        disabled={this.props.disabled}
        icon={icon}
        id={this._id}
        label={label}
        onClick={this._onClick}
        title={title}
      />
    );
  }

  componentWillUnmount(): void {
    this._hideMenu();
  }

  _onClick = (): void => {
    this.setState((lastState) => {
      const expanded = !lastState.expanded;
      if (expanded) {
        this._showMenu();
      } else {
        this._hideMenu();
      }
      return {
        expanded,
      };
    });
  };

  _hideMenu = (): void => {
    const menu = this._menu;
    this._menu = null;
    menu?.close(undefined);
  };

  _showMenu = (): void => {
    const menu = this._menu;
    const menuProps = {
      ...this.props,
      onCommand: this._onCommand,
    };
    if (menu) {
      menu.update(menuProps);
    } else {
      this._menu = createPopUp(CustomMenuUI, menuProps, {
        autoDismiss: true,
        anchor: document.getElementById(this._id),
        onClose: this._onClose,
      });
    }
  };

  _onCommand = (): void => {
    this.setState({ expanded: false });
    this._hideMenu();
  };

  _onClose = (): void => {
    if (this._menu) {
      this.setState({ expanded: false });
      this._menu = null;
    }
  };
}
