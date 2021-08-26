// @flow

import { EditorState, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import updateIndentLevel from './updateIndentLevel';

class IndentCommand extends UICommand {
  _delta: number;

  constructor(delta: number) {
    super();
    this._delta = delta;
  }

  isActive = (state: EditorState): boolean => {
    return false;
  };

  // [FS] IRAD-1087 2020-11-11
  // New method to execute new styling implementation for indent
  executeCustom = (
    state: EditorState,
    tr: Transform,
    from: number,
    to: number
  ): boolean => {
    const { schema } = state;
    tr = tr.setSelection(TextSelection.create(tr.doc, from, to));
    const trx = updateIndentLevel(state, tr, schema, this._delta, null);
    return trx.tr;
  };
}

export default IndentCommand;
