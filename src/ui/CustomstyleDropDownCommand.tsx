import { CustomMenuButton } from './CustomMenuButton.js';
import { HeadingCommand } from '@modusoperandi/licit-ui-commands';
import { CustomStyleCommand } from '../CustomStyleCommand.js';

import React from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Transform } from 'prosemirror-transform';
import { Node } from 'prosemirror-model';
import {
  RESERVED_STYLE_NONE,
  RESERVED_STYLE_NONE_NUMBERING,
} from '../CustomStyleNodeSpec.js';
import {
  setStyles,
  getStylesAsync,
  hasStyleRuntime,
  isCustomStyleExists,
} from '../customStyle.js';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

// To include custom styles in the toolbar

let HEADING_COMMANDS = {
  [RESERVED_STYLE_NONE]: new HeadingCommand(0),
};

export class CustomstyleDropDownCommand extends React.PureComponent<{
  dispatch: (tr: Transform) => void;
  editorState: EditorState;
  editorView?: EditorView;
}> {
  hasRuntime: boolean = hasStyleRuntime();
  //method to build commands for list buttons
  async getCommandGroups(): Promise<Record<string, UICommand>[]> {
    HEADING_COMMANDS = {
      // When apply 'None' from style menu, not clearing the applied custom style.
      [RESERVED_STYLE_NONE]: new CustomStyleCommand(
        RESERVED_STYLE_NONE,
        RESERVED_STYLE_NONE
      ),
    };
    // Check runtime is avilable in editorview
    // Get styles form server configured in runtime
    let HEADING_NAMES = null;
    if (this.hasRuntime) {
      return getStylesAsync().then((result) => {
        if (result) {
          setStyles(result);
          HEADING_NAMES = result;
          if (null != HEADING_NAMES) {
            const foundNormal = result.find(
              (obj) => obj.styleName === RESERVED_STYLE_NONE
            );
            if (foundNormal) {
              HEADING_COMMANDS[RESERVED_STYLE_NONE] = new CustomStyleCommand(
                foundNormal,
                foundNormal.styleName
              );
            }

            HEADING_NAMES.forEach((obj) => {
              if (RESERVED_STYLE_NONE != obj.styleName)
                HEADING_COMMANDS[obj.styleName] = new CustomStyleCommand(
                  obj,
                  obj.styleName
                );
            });
          }
        }
        return [HEADING_COMMANDS];
      });
    }
    return [HEADING_COMMANDS];
  }

  staticCommands() {
    const MENU_COMMANDS = {
      ['newstyle']: new CustomStyleCommand('newstyle', 'New Style..'),
    };
    // Added a menu "Edit All" for Edit All custom styles
    MENU_COMMANDS['editall'] = new CustomStyleCommand('editall', 'Edit All');
    MENU_COMMANDS['clearstyle'] = new CustomStyleCommand(
      'clearstyle',
      'Clear Style'
    );
    MENU_COMMANDS['reset'] = new CustomStyleCommand(
      'reset',
      'Restart Numbering'
    );
    return [MENU_COMMANDS];
  }
  isAllowedNode(node: Node) {
    return node.type.name === 'paragraph' || node.type.name === 'ordered_list';
  }

  render(): React.ReactElement {
    const { editorState } = this.props;
    const { selection, doc } = editorState;
    const { from, to } = selection;
    let customStyleName;
    let selectedStyleCount = 0;
    // get the custom style name from node attribute
    doc.nodesBetween(from, to, (node) => {
      // Applied custom style name shows only when click start and end position of paragraph,
      // otherwise shows 'None'.
      if (this.isAllowedNode(node)) {
        if (node.attrs.styleName) {
          // Show blank as style name when select paragraphs with multiple custom styles applied
          selectedStyleCount++;
          // Issue fix: style name shows blank when select multiple paragraph with same custom style applied
          if (
            1 === selectedStyleCount ||
            (1 < selectedStyleCount && node.attrs.styleName === customStyleName)
          ) {
            customStyleName = node.attrs.styleName.includes(
              RESERVED_STYLE_NONE_NUMBERING
            )
              ? RESERVED_STYLE_NONE
              : node.attrs.styleName;
          } else {
            customStyleName = RESERVED_STYLE_NONE;
          }
        }
        // Show the custom style as None for paste paragraph from outside.
        else {
          customStyleName = RESERVED_STYLE_NONE;
        }
      }
    });
    let backgroundColorClass = 'width-100';
    if (!isCustomStyleExists(customStyleName)) {
      backgroundColorClass = 'width-100 stylemenu-backgroundcolor';
    }

    return (
      <span data-cy="cyStyleBtn">
        <CustomMenuButton
          className={backgroundColorClass}
          disabled={!this.hasRuntime}
          label={customStyleName}
        />
      </span>
    );
  }
}
