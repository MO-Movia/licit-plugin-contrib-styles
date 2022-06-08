// @flow

import { Node, DOMOutputSpec } from 'prosemirror-model';
import type { KeyValuePair } from './Constants';

// Always append to base calls.
const ATTR_OVERRIDDEN = 'overridden';

type toDOMFn = (node: Node) => DOMOutputSpec;
type getAttrsFn = (p: Node | string) => KeyValuePair;

function getAttrs(base: getAttrsFn, dom: HTMLElement) {
  if (typeof dom != 'string' && undefined !== base) {
    const attrs = base(dom);
    // [FS] IRAD-1623 2021-11-11
    // Validate attrs
    if (attrs && typeof attrs === 'object') {
      attrs[ATTR_OVERRIDDEN] = dom.getAttribute(ATTR_OVERRIDDEN);
    }
    return attrs;
  } else {
    return false;
  }
}

function toDOM(base: toDOMFn, node: Node) {
  const output = base(node);
  if (output.length == 2) {
    output[1] = {};
    output[1][ATTR_OVERRIDDEN] = node.attrs[ATTR_OVERRIDDEN];
    output[2] = 0;
  } else {
    output[1][ATTR_OVERRIDDEN] = node.attrs[ATTR_OVERRIDDEN];
  }

  return output;
}

export const toMarkDOM = toDOM;
export const getMarkAttrs = getAttrs;
