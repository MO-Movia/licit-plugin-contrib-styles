import { Node } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
export const MARK_UNDERLINE = 'underline';
export const MARK_TEXT_HIGHLIGHT = 'mark-text-highlight';
export const MARKFROM = 'markFrom';
export const PARAGRAPH = 'paragraph';
export const STYLEKEY = 'styleName';

export type KeyValuePair = { [key: string]: any };

//to get the selected node
export function getNode(from: number, to: number, tr: Transform): Node {
  let selectedNode = null;
  tr.doc.nodesBetween(from, to, (node, startPos) => {
    if (node.type.name === 'paragraph') {
      if (null == selectedNode) {
        selectedNode = node;
      }
    }
  });
  return selectedNode;
}
