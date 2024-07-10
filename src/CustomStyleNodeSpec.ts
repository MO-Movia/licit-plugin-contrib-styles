import { Node, DOMOutputSpec } from 'prosemirror-model';
import type { KeyValuePair } from './Constants.js';
import { toCSSLineSpacing } from '@modusoperandi/licit-ui-commands';

import { getCustomStyleByName, getHidenumberingFlag } from './customStyle.js';
import './ui/czi-cust-style-numbered.css';
import { HTMLStyles } from './StyleRuntime.js';

// This assumes that every 36pt maps to one indent level.
export const ATTRIBUTE_PREFIX = 'prefix';
export const INDENT_MARGIN_PT_SIZE = 36;
export const MIN_INDENT_LEVEL = 0;
export const MAX_INDENT_LEVEL = 7;
export const ATTRIBUTE_INDENT = 'data-indent';
export const ATTRIBUTE_STYLE_LEVEL = 'data-style-level';
export const ATTRIBUTE_LIST_STYLE_LEVEL = 'list-style-level';
export const HIDE_STYLE_LEVEL = 'hide-style-level';
export const ATTRIBUTE_BULLET_SYMBOL = 'data-bullet-symbol';
export const ATTRIBUTE_SHOW_SYMBOL = 'data-show-bullet';
export const ATTRIBUTE_BULLET_COLOR = 'data-bullet-color';
export const RESERVED_STYLE_NONE = 'Normal';
export const RESERVED_STYLE_NONE_NUMBERING = RESERVED_STYLE_NONE + '-@#$-';
const cssVal = new Set(['', '0%', '0pt', '0px']);
/*
Symbols are grabbed from
https://en.wikipedia.org/wiki/List_of_Unicode_characters
https://en.wikipedia.org/wiki/List_of_Unicode_characters#Number_Forms
*/
export const BULLET_POINTS = [
  { key: '25CF', symbol: '● ', color: '#000000' },
  { key: '25CB', symbol: '○ ', color: '#000000' },
  { key: '2B9A', symbol: '⮚ ', color: '#000000' },
  { key: '2713', symbol: '✓ ', color: '#000000' },
  { key: '272A', symbol: '✪ ', color: '#0000FF' },
  { key: '272A272A', symbol: '✪✪ ', color: '#0000FF' },
];

export const EMPTY_CSS_VALUE = cssVal;

// Always append to base calls.
const STYLENAME = 'styleName';

type toDOMFn = (node: Node) => DOMOutputSpec;
type getAttrsFn = (p: Node | string | HTMLElement) => KeyValuePair;

function getAttrs(base: getAttrsFn | undefined, dom: HTMLElement) {
  const attrs = base(dom);
  attrs[STYLENAME] = dom.getAttribute(STYLENAME);
  return attrs;
}

function toDOM(base: toDOMFn | undefined, node: Node) {
  const output = base(node);
  output[1][STYLENAME] = node.attrs[STYLENAME];
  const {
    style,
    styleLevel,
    indentOverridden,
    bulletDetails,
    isListStyle,
    prefix,
  } = getStyle(node.attrs);
  style && (output[1].style = style);
  if (styleLevel) {
    if (isListStyle) {
      if (node.attrs.indent !== null) {
        console.log('Indent value is', node.attrs.indent);
        output[1][ATTRIBUTE_LIST_STYLE_LEVEL] = node.attrs.indent + 1;
      } else {
        output[1][ATTRIBUTE_LIST_STYLE_LEVEL] = styleLevel;
      }
    } else {
      output[1][ATTRIBUTE_STYLE_LEVEL] = String(styleLevel);
      output[1][HIDE_STYLE_LEVEL] = getHidenumberingFlag();
    }
  }
  if ('' !== indentOverridden) {
    output[1][ATTRIBUTE_INDENT] = String(indentOverridden);
  }

  if (prefix) {
    output[1][ATTRIBUTE_PREFIX] = prefix;
  }

  if (bulletDetails?.symbol?.length > 0) {
    output[1][ATTRIBUTE_BULLET_SYMBOL] = bulletDetails.symbol;
    output[1][ATTRIBUTE_SHOW_SYMBOL] = bulletDetails.symbol.length > 0;
    output[1][ATTRIBUTE_BULLET_COLOR] = bulletDetails.color
      ? bulletDetails.color
      : '#000000';
  }

  return output;
}

function getStyle(attrs) {
  return getStyleEx(
    attrs.align,
    attrs.lineSpacing,
    attrs.styleName
    // attrs.indent
  );
}

// [FS] IRAD-1202 2021-02-15
function refreshCounters(styleLevel, isListStyle) {
  let latestCounters = '';
  let cssCounterReset = '';
  let setCounterReset = false;
  if (isListStyle) {
    // set style counters in window variables,
    // so that it is remapped later to add to document attribute via transaction.
    for (let index = 1; index <= styleLevel; index++) {
      const counterVar = 'set-cust-list-style-counter-' + index;
      const setCounterVal = window[counterVar];
      if (!setCounterVal) {
        cssCounterReset += `L${index} `;
        setCounterReset = true;
      }
      window[counterVar] = true;
    }
  } else {
    // set style counters in window variables,
    // so that it is remapped later to add to document attribute via transaction.
    for (let index = 1; index <= styleLevel; index++) {
      const counterVar = 'set-cust-style-counter-' + index;
      const setCounterVal = window[counterVar];
      if (!setCounterVal) {
        cssCounterReset += `C${index} `;
        setCounterReset = true;
      }
      window[counterVar] = true;
    }
  }
  if (setCounterReset) {
    latestCounters = `counter-increment: ${cssCounterReset};`;
  }
  return latestCounters;
}

function getBulletDetails(code) {
  const bulletData = {
    symbol: '',
    color: '',
  };
  BULLET_POINTS.forEach((bullet) => {
    if (bullet.key === code) {
      bulletData.symbol = bullet.symbol;
      bulletData.color = bullet.color;
    }
  });
  return bulletData;
}

function getStyleEx(align: string | null, lineSpacing, styleName: string | null) {
  let style = '';
  let styleLevel = 0;
  let indentOverridden = '';
  let isListStyle = false;
  let prefix = '';
  let bulletDetails: { symbol: string; color: string } | undefined;

  if (align && align !== 'left') {
    style += `text-align: ${align};`;
  }

  if (lineSpacing !== null) {
    const cssLineSpacing = toCSSLineSpacing(lineSpacing);
    style += `line-height: ${cssLineSpacing}; --czi-content-line-height: ${cssLineSpacing};`;
  }

  if (!styleName || styleName === 'None') {
    return { style, styleLevel, indentOverridden, bulletDetails, isListStyle, prefix };
  }

  const styleProps = getCustomStyleByName(styleName);

  if (!styleProps?.styles) {
    handleNoneNumberingStyle(styleName);
    return { style, styleLevel, indentOverridden, bulletDetails, isListStyle, prefix };
  }

  applyCustomStyleProps(styleProps.styles);

  return { style, styleLevel, indentOverridden, bulletDetails, isListStyle, prefix };

  function handleNoneNumberingStyle(styleName: string) {
    if (styleName.includes(RESERVED_STYLE_NONE_NUMBERING)) {
      const indices = styleName.split(RESERVED_STYLE_NONE_NUMBERING);
      if (indices.length === 2) {
        styleLevel = parseInt(indices[1], 10);
        if (styleLevel) {
          style += refreshCounters(styleLevel, isListStyle);
        }
      }
    }
  }

  function applyCustomStyleProps(styles:HTMLStyles) {
    const {
      bulletLevel,
      align: customAlign,
      paragraphSpacingAfter,
      paragraphSpacingBefore,
      styleLevel: customStyleLevel,
      strong,
      boldNumbering,
      em,
      color,
      fontSize,
      fontName,
      indent,
      hasNumbering,
      isList,
      prefixValue,
    } = styles;

    if (hasNumbering && bulletLevel) {
      bulletDetails = getBulletDetails(bulletLevel);
      styleLevel = customStyleLevel || 0;
    }

    if (!align && customAlign) {
      style += `text-align: ${customAlign};`;
    }

    if (paragraphSpacingAfter) {
      style += `margin-bottom: ${paragraphSpacingAfter}pt !important;`;
    }

    if (paragraphSpacingBefore) {
      style += `margin-top: ${paragraphSpacingBefore}pt !important;`;
    }

    applyTextStyles();

    function applyTextStyles() {
      if (!customStyleLevel) return;

      const styleLines = [];

      if (strong) styleLines.push('font-weight: bold;');
      if (boldNumbering) styleLines.push(' --czi-counter-bold: bold;');
      if (em) styleLines.push('font-style: italic;');
      if (color) styleLines.push(`color: ${color};`);
      if (fontSize) styleLines.push(`font-size: ${fontSize}pt;`);
      if (fontName) styleLines.push(`font-family: ${fontName};`);
      if (indent) indentOverridden = indent;

      styleLevel = hasNumbering || isList ? customStyleLevel : 0;
      isListStyle = isList;
      prefix = prefixValue || '';

      style += styleLines.join(' ');
      style += refreshCounters(styleLevel, isListStyle);
    }

  }


}


export const toCustomStyleDOM = toDOM;
export const getCustomStyleAttrs = getAttrs;
export const getDetailsBullet = getBulletDetails;
export const countersRefresh = refreshCounters;

