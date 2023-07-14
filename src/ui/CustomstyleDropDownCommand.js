// @flow

import CustomMenuButton from './CustomMenuButton';
import { HeadingCommand } from '@modusoperandi/licit-ui-commands';
import CustomStyleCommand from '../CustomStyleCommand';

import * as React from 'react';
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
  isCustomStyleExists
} from '../customStyle';
import './custom-dropdown.css';

// [FS] IRAD-1042 2020-09-09
// To include custom styles in the toolbar

const MULTIPLE_STYLE = 'Multiple Styles';

let HEADING_COMMANDS: Object = {
  [RESERVED_STYLE_NONE]: new HeadingCommand(0),
};

class CustomstyleDropDownCommand extends React.PureComponent<any, any> {
  props: {
    dispatch: (tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
  };
  hasRuntime: boolean = hasStyleRuntime();

  state = {
    hasUpdated: false,
  };

  updateDropdownItems = () => {
    const hasUpdated = !this.state.hasUpdated;
    this.setState({
      hasUpdated,
    });
  }

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
            HEADING_NAMES.forEach((obj) => {
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

  isValidCustomstyle(styleName) {
    const bOK = isCustomStyleExists(this.state.styleName);
    return bOK;
  }

  staticCommands() {
    const MENU_COMMANDS: Object = {
      ['newstyle']: new CustomStyleCommand('newstyle', 'New Style..'),
    };
    // [FS] IRAD-1176 2021-02-08
    // Added a menu "Edit All" for Edit All custom styles
    MENU_COMMANDS['editall'] = new CustomStyleCommand('editall', 'Edit All');
    MENU_COMMANDS['clearstyle'] = new CustomStyleCommand(
      'clearstyle',
      'Clear Style'
    );
    return [MENU_COMMANDS];
  }
  isAllowedNode(node: Node) {
    return node.type.name === 'paragraph' || node.type.name === 'ordered_list';
  }

  render(): React.Element<any> {
    const { dispatch, editorState, editorView } = this.props;
    const { selection, doc } = editorState;
    const { from, to } = selection;
    let customStyleName;
    let selectedStyleCount = 0;
    // [FS] IRAD-1088 2020-10-05
    // get the custom style name from node attribute
    doc.nodesBetween(from, to, (node, pos) => {
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
          if ( 1 === selectedStyleCount) {
            customStyleName = node.attrs.styleName.includes(
              RESERVED_STYLE_NONE_NUMBERING
            )
              ? RESERVED_STYLE_NONE
              : node.attrs.styleName;
          } else {
            customStyleName = MULTIPLE_STYLE;
          }
        }
        // [FS] IRAD-1231 2021-03-02
        // Show the custom style as None for paste paragraph from outside.
        else {
          node.attrs.styleName = RESERVED_STYLE_NONE;
          customStyleName = RESERVED_STYLE_NONE;
        }
      }
    });
    let backgroundColorClass = 'width-100';
    if (!isCustomStyleExists(customStyleName) && customStyleName !== MULTIPLE_STYLE) {
      backgroundColorClass = 'width-100 stylemenu-backgroundcolor';
    }

    return (
      <CustomMenuButton
        className={backgroundColorClass}
        // [FS] IRAD-1008 2020-07-16
        // Disable font type menu on editor disable state
        commandGroups={this.getCommandGroups()}
        disabled={
          (editorView && editorView.disabled) || !this.hasRuntime ? true : false
        }
        dispatch={dispatch}
        editorState={editorState}
        editorView={editorView}
        label={customStyleName}
        parent={this}
        staticCommand={this.staticCommands()}
        updateListCallback={this.updateDropdownItems}
        updated={this.state.hasUpdated}
      />
    );
  }
}

export default CustomstyleDropDownCommand;
