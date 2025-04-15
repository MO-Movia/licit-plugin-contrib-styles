import React from 'react';

import { canUseCSSFont } from './canUseCSSFont.js';

const cached: Record<string, React.ReactElement> = {};

canUseCSSFont('Material Icons')
  .then((fontSupported) => {
    if (!fontSupported) {
      console.warn(
        'Material fonts missing! Add CSS from //fonts.googleapis.com/icon?family=Material+Icons'
      );
      // Now loaded locally, so that it work in closed network as well.
    }
  })
  .catch(console.error);

export class SuperscriptIcon extends React.PureComponent {
  render(): React.ReactElement {
    return (
      <span className="superscript-wrap">
        <span className="superscript-base">x</span>
        <span className="superscript-top">y</span>
      </span>
    );
  }
}
export class SubscriptIcon extends React.PureComponent {
  render(): React.ReactElement {
    return (
      <span className="subscript-wrap">
        <span className="subscript-base">x</span>
        <span className="subscript-bottom">y</span>
      </span>
    );
  }
}
export class Icon extends React.PureComponent<
  {
    type: string;
    title?: string;
  },
  unknown
> {
  static get(type: string, title?: string): React.ReactElement {
    const key = `${type || ''}-${title || ''}`;
    const icon = cached[key] || <Icon title={title} type={type} />;
    cached[key] = icon;
    return icon;
  }

  render(): React.ReactElement {
    const { type, title } = this.props;
    let className = '';
    let children: React.ReactElement | string = '';
    if (type === 'superscript') {
      className = 'czi-icon superscript';
      children = <SuperscriptIcon />;
    } else if (type === 'subscript') {
      className = 'czi-icon subscript';
      children = <SubscriptIcon />;
    } else if (!type || !/^[A-Za-z0-9_-]+$/.test(type)) {
      className = 'czi-icon-unknown';
      children = title || type;
    } else {
      className = `czi-icon ${type}`;
      children = type;
    }
    return <span className={className}>{children}</span>;
  }
}
