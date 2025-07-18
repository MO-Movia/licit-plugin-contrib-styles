import { CustomMenuButton } from './CustomMenuButton';
import { HeadingCommand } from '@modusoperandi/licit-ui-commands';
import { CustomStyleCommand } from '../CustomStyleCommand';

import React from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Transform } from 'prosemirror-transform';
import { Node } from 'prosemirror-model';
import {
  RESERVED_STYLE_NONE,
  RESERVED_STYLE_NONE_NUMBERING,
} from '../CustomStyleNodeSpec';
import {
  setStyles,
  getStylesAsync,
  hasStyleRuntime,
  isCustomStyleExists,
  getStyleRuntime
} from '../customStyle';

// [FS] IRAD-1042 2020-09-09
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
  //[FS] IRAD-1085 2020-10-09
  //method to build commands for list buttons
  getCommandGroups() {
    HEADING_COMMANDS = {
      // [FS] IRAD-1074 2020-12-09
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
      getStylesAsync().then((result) => {
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

  staticCommands(customStyleName) {
    const MENU_COMMANDS = {};

    // Only include these if the user has the canEditStyle permission
    if (getStyleRuntime()?.canEditStyle) {
      MENU_COMMANDS['newstyle'] = new CustomStyleCommand(
        'newstyle',
        'New Style..',
        customStyleName
      );

      MENU_COMMANDS['editall'] = new CustomStyleCommand(
        'editall',
        'Edit All'
      );
    }

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
    return node.type.name === 'paragraph' || node.type.name === 'ordered_list' || node.type.name === 'enhanced_table_figure';
  }

  render(): React.ReactElement {
    const { dispatch, editorState, editorView } = this.props;
    const { selection, doc } = editorState;
    const { from, to } = selection;
    let customStyleName;
    let selectedStyleCount = 0;
    // [FS] IRAD-1088 2020-10-05
    // get the custom style name from node attribute
    doc.nodesBetween(from, to, (node) => {
      // [FS] IRAD-1231 2021-03-05
      // Issue fix : Applied custom style name shows only when click start and end position of paragraph,
      // otherwise shows 'None'.
      if (this.isAllowedNode(node)) {
        if (node.attrs.styleName) {
          // [FS] IRAD-1043 2020-10-27
          // Show blank as style name when select paragraphs with multiple custom styles applied
          selectedStyleCount++;
          // [FS] IRAD-1100 2020-10-30
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
        // [FS] IRAD-1231 2021-03-02
        // Show the custom style as None for paste paragraph from outside.
        else {
          const updatedAttrs = {
            ...node.attrs,
            styleName: RESERVED_STYLE_NONE,
          };
          node = { ...node, attrs: updatedAttrs } as unknown as Node;
          customStyleName = RESERVED_STYLE_NONE;
        }
      }
    });
    let backgroundColorClass = 'width-100';
    let toCreateStyle = false;
    if (!isCustomStyleExists(customStyleName)) {
      backgroundColorClass = 'width-100 stylemenu-backgroundcolor';
      toCreateStyle = true;
    }

    return (
      <span className="tooltip-wrapper">
        <CustomMenuButton
          className={backgroundColorClass}
          commandGroups={this.getCommandGroups()}
          disabled={!this.hasRuntime}
          dispatch={dispatch}
          editorState={editorState}
          editorView={editorView}
          label={customStyleName}
          staticCommand={this.staticCommands(
            toCreateStyle ? customStyleName : ''
          )}
        />
        <span className="custom-tooltip">
          <span className="tooltip-text">{customStyleName}</span>
        </span>
      </span>
    );
  }
}
