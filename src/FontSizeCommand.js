// @flow

import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import applyMark from './applyMark';
import isTextStyleMarkCommandEnabled from './isTextStyleMarkCommandEnabled';
import { EditorState, TextSelection } from 'prosemirror-state';
import { MARK_FONT_SIZE } from './MarkNames';
import { Schema } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';

function setFontSize(tr: Transform, schema: Schema, pt: number): Transform {
  const markType = schema.marks[MARK_FONT_SIZE];
  if (!markType) {
    return tr;
  }
  const attrs = pt ? { pt } : null;
  tr = applyMark(tr, schema, markType, attrs);
  return tr;
}

class FontSizeCommand extends UICommand {
  _popUp = null;
  _pt = 0;

  constructor(pt: number) {
    super();
    this._pt = pt;
  }

  isEnabled = (state: EditorState): boolean => {
    return isTextStyleMarkCommandEnabled(state, MARK_FONT_SIZE);
  };

  // [FS] IRAD-1087 2020-10-01
  // Method to execute custom styling implementation of font size
  executeCustom = (
    state: EditorState,
    tr: Transform,
    from: number,
    to: number
  ): Transform => {
    const { schema } = state;
    tr = setFontSize(
      tr.setSelection(TextSelection.create(tr.doc, from, to)),
      schema,
      this._pt
    );
    return tr;
  };
}

export default FontSizeCommand;
