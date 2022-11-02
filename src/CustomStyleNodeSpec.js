// @flow

import { Node, DOMOutputSpec } from 'prosemirror-model';
import type { KeyValuePair } from './Constants';
import { toCSSLineSpacing } from '@modusoperandi/licit-ui-commands';

import { getCustomStyleByName, getHidenumberingFlag } from './customStyle';
import './ui/czi-cust-style-numbered.css';

// This assumes that every 36pt maps to one indent level.
export const INDENT_MARGIN_PT_SIZE = 36;
export const MIN_INDENT_LEVEL = 0;
export const MAX_INDENT_LEVEL = 7;
export const ATTRIBUTE_INDENT = 'data-indent';
export const ATTRIBUTE_STYLE_LEVEL = 'data-style-level';
export const HIDE_STYLE_LEVEL = 'hide-style-level';
export const RESERVED_STYLE_NONE = 'None';
export const RESERVED_STYLE_NONE_NUMBERING = RESERVED_STYLE_NONE + '-@#$-';
const cssVal = new Set < string > (['', '0%', '0pt', '0px']);

export const EMPTY_CSS_VALUE = cssVal;

// Always append to base calls.
const STYLENAME = 'styleName';

type toDOMFn = (node: Node) => DOMOutputSpec;
type getAttrsFn = (p: Node | string) => KeyValuePair;

function getAttrs(base: getAttrsFn, dom: HTMLElement) {
  const attrs = base(dom);
  attrs[STYLENAME] = dom.getAttribute(STYLENAME);
  return attrs;
}

function toDOM(base: toDOMFn, node: Node) {
  const output = base(node);
  output[1][STYLENAME] = node.attrs[STYLENAME];
  const { style, styleLevel, indentOverriden } = getStyle(node.attrs);
  style && (output[1].style = style);
  if (styleLevel) {
    output[1][ATTRIBUTE_STYLE_LEVEL] = String(styleLevel);
    output[1][HIDE_STYLE_LEVEL] = getHidenumberingFlag();
  }
  if ('' !== indentOverriden) {
    output[1][ATTRIBUTE_INDENT] = String(indentOverriden);
  }
  return output;
}

function getStyle(attrs: Object) {
  return getStyleEx(
    attrs.align,
    attrs.lineSpacing,
    attrs.styleName
  );
}

// [FS] IRAD-1202 2021-02-15
function refreshCounters(styleLevel) {
  let latestCounters = '';
  let cssCounterReset = '';
  let setCounterReset = false;

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

  if (setCounterReset) {
    latestCounters = `counter-increment: ${cssCounterReset};`;
  }
  return latestCounters;
}

function getStyleEx(align, lineSpacing, styleName) {
  let style = '';
  let styleLevel = 0;
  let indentOverriden = '';
  if (align && align !== 'left') {
    style += `text-align: ${align};`;
  }

  if (lineSpacing) {
    const cssLineSpacing = toCSSLineSpacing(lineSpacing);
    style +=
      `line-height: ${cssLineSpacing};` +
      // This creates the local css variable `--czi-content-line-height`
      // that its children may apply.
      `--czi-content-line-height: ${cssLineSpacing};`;
  }

  if (null !== styleName && 'None' !== styleName) {
    // to get the styles of the corresponding style name
    const styleProps = getCustomStyleByName(styleName);
    if (null !== styleProps && styleProps.styles) {
      // [FS] IRAD-1100 2020-11-04
      // Add in leading and trailing spacing (before and after a paragraph)
      if (styleProps.styles.paragraphSpacingAfter) {
        style += `margin-bottom: ${styleProps.styles.paragraphSpacingAfter}pt !important;`;
      }
      if (styleProps.styles.paragraphSpacingBefore) {
        style += `margin-top: ${styleProps.styles.paragraphSpacingBefore}pt !important;`;
      }
      if (styleProps.styles.styleLevel) {
        if (styleProps.styles.strong) {
          style += 'font-weight: bold;';
        }
        if (styleProps.styles.boldNumbering) {
          style += ' --czi-counter-bold: bold;';
        }
        if (styleProps.styles.em) {
          style += 'font-style: italic;';
        }
        if (styleProps.styles.color) {
          style += `color: ${styleProps.styles.color};`;
        }
        if (styleProps.styles.fontSize) {
          style += `font-size: ${styleProps.styles.fontSize}pt;`;
        }
        if (styleProps.styles.fontName) {
          style += `font-family: ${styleProps.styles.fontName};`;
        }
        if (styleProps.styles.indent) {
          indentOverriden = styleProps.styles.indent;
        }
        // [FS] IRAD-1462 2021-06-17
        // FIX:  Numbering applied for paragraph even though the custom style not selected numbering(but set level)
        styleLevel = styleProps.styles.hasNumbering
          ? parseInt(styleProps.styles.styleLevel)
          : 0;
        style += refreshCounters(styleLevel);
      }
    } else if (styleName && styleName.includes(RESERVED_STYLE_NONE_NUMBERING)) {
      const indices = styleName.split(RESERVED_STYLE_NONE_NUMBERING);
      if (indices && 2 === indices.length) {
        styleLevel = parseInt(indices[1]);
      }
      if (styleLevel) {
        style += refreshCounters(styleLevel);
      }
    }
  }
  return { style, styleLevel, indentOverriden };
}

export const toCustomStyleDOM = toDOM;
export const getCustomStyleAttrs = getAttrs;
