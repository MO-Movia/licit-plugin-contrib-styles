import { Node } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
export const MARK_UNDERLINE = 'underline';
export const MARK_TEXT_HIGHLIGHT = 'mark-text-highlight';
export const MARKFROM = 'markFrom';
export const PARAGRAPH = 'paragraph';
export const STYLEKEY = 'styleName';
export const ATTR_OVERRIDDEN = 'overridden';
// eslint-disable-next-line
export type KeyValuePair = { [key: string]: any };

export const DEFAULT_NORMAL_STYLE = {
  styleName: 'Normal',
  mode: 0,
  description: 'Normal',
  styles: {
    align: 'left',
    boldNumbering: true,
    boldSentence: true,
    fontName: 'Tahoma',
    fontSize: '12',
    nextLineStyleName: 'Normal',
    paragraphSpacingAfter: '3',
    toc: false,
  }
};

//to get the selected node
export function getNode(from: number, to: number, tr: Transform): Node {
  let selectedNode = null;
  tr.doc.nodesBetween(from, to, (node) => {
    if (node.type.name === 'paragraph') {
      if (null == selectedNode) {
        selectedNode = node;
      }
    }
  });
  return selectedNode;
}
