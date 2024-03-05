import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { AllSelection, EditorState, TextSelection } from 'prosemirror-state';
import { BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH } from './NodeNames.js';
import { Schema } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

export function setParagraphSpacing(
  tr: any,
  schema: Schema,
  paragraphSpacing?: string,
  isAfter?: boolean
): Transform {
  const { selection , doc } = tr;
  if (!selection || !doc) {
    return tr;
  }

  if (
    !(selection instanceof TextSelection) &&
    !(selection instanceof AllSelection)
  ) {
    return tr;
  }

  const { from, to } = selection;
  const paragraph = schema.nodes[PARAGRAPH];
  const heading = schema.nodes[HEADING];
  const listItem = schema.nodes[LIST_ITEM];
  const blockquote = schema.nodes[BLOCKQUOTE];
  if (!paragraph && !heading && !listItem && !blockquote) {
    return tr;
  }

  const tasks = [];
  const paragraphSpacingValue = paragraphSpacing || null;

  doc.nodesBetween(from, to, (node, pos) => {
    const nodeType = node.type;
    if (
      nodeType === paragraph ||
      nodeType === heading ||
      nodeType === listItem ||
      nodeType === blockquote
    ) {
      const paragraphSpacing = node.attrs.paragraphSpacing || null;
      if (paragraphSpacing !== paragraphSpacingValue) {
        tasks.push({
          node,
          pos,
          nodeType,
        });
      }
      return nodeType === listItem;
    }
    return true;
  });

  if (!tasks.length) {
    return tr;
  }

  tasks.forEach((job) => {
    const { node, pos, nodeType } = job;
    let { attrs } = node;
    if (isAfter) {
      attrs = {
        ...attrs,
        paragraphSpacingAfter: paragraphSpacingValue || null,
      };
    } else {
      attrs = {
        ...attrs,
        paragraphSpacingBefore: paragraphSpacingValue || null,
      };
    }
    tr = tr.setNodeMarkup(pos, nodeType, attrs, node.marks);
  });

  return tr;
}

export class ParagraphSpacingCommand extends UICommand {

  waitForUserInput(state: EditorState, dispatch?: (tr: Transform) => void, view?: EditorView, event?: any): Promise<any> {
    return Promise.resolve(undefined);
  }
  executeWithUserInput(state: EditorState, dispatch?: (tr: Transform) => void, view?: EditorView, inputs?: any): boolean {
    return false;
  }
  cancel(): void { }
  executeCustom(state: EditorState, tr: Transform, from: number, to: number): Transform {
    return tr;
  }
  _paragraphSpacing?: string;
  _isAfter?: boolean;

  constructor(paragraphSpacing?: string, isAfter?: boolean) {
    super();
    this._paragraphSpacing = paragraphSpacing;
    this._isAfter = isAfter;
  }

  execute = (
    state: EditorState,
    dispatch?: (tr: Transform) => void
  ): boolean => {
    const { schema, selection } = state;
    const tr = setParagraphSpacing(
      state.tr.setSelection(selection),
      schema,
      this._paragraphSpacing,
      this._isAfter
    );
    if (tr.docChanged) {
      dispatch?.(tr);
      return true;
    } else {
      return false;
    }
  };
}
