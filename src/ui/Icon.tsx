import React from 'react';

import { canUseCSSFont } from './canUseCSSFont.js';

import './czi-icon.css';

// [FS] IRAD-1061 2020-09-19
// Now loaded locally, so that it work in closed network as well.
//import injectStyleSheet from './injectStyleSheet';
import './icon-font.css';

const cached = {};

const CSS_CDN_URL = '//fonts.googleapis.com/icon?family=Material+Icons';
const CSS_FONT = 'Material Icons';

(async function () {
  // Inject CSS Fonts reuqired for toolbar icons.
  const fontSupported = await canUseCSSFont(CSS_FONT);
  if (!fontSupported) {
    console.info('Add CSS from ', CSS_CDN_URL);
    // [FS] IRAD-1061 2020-09-19
    // Now loaded locally, so that it work in closed network as well.
    //injectStyleSheet(CSS_CDN_URL);
  }
})();

class SuperscriptIcon extends React.PureComponent {
  render(): React.ReactElement {
    return (
      <span className="superscript-wrap">
        <span className="superscript-base">x</span>
        <span className="superscript-top">y</span>
      </span>
    );
  }
}
class SubscriptIcon extends React.PureComponent {
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
