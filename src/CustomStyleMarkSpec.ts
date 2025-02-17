import { Node } from 'prosemirror-model';
import type { KeyValuePair } from './Constants.js';

// Always append to base calls.
const ATTR_OVERRIDDEN = 'overridden';

type getAttrsFn = (p: Node | string) => KeyValuePair;

function convertToBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  else {
    return value === 'true';
  }
}
function getAttrs(base: getAttrsFn | undefined, dom: HTMLElement) {
  if (typeof dom != 'string' && undefined !== base) {
    const attrs = base((dom as unknown as Node));
    // [FS] IRAD-1623 2021-11-11
    // Validate attrs
    // if (attrs && typeof attrs === 'object') {
    //   attrs[ATTR_OVERRIDDEN] = convertToBoolean(dom.getAttribute(ATTR_OVERRIDDEN));
    // }
    return attrs;
  } else {
    return base?.(dom as unknown as Node);
  }
}

function toDOM(base, node: Node) {
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
