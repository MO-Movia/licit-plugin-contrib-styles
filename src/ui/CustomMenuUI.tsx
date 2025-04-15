import React, { SyntheticEvent } from 'react';
import { EditorState } from 'prosemirror-state';
import { Schema, Node } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { uuid } from './Uuid.js';
import { CustomStyleItem } from './CustomStyleItem.js';
import { AlertInfo } from './AlertInfo.js';
import { CustomStyleSubMenu } from './CustomStyleSubMenu.js';
import { CustomStyleEditor } from './CustomStyleEditor.js';
import {
  applyLatestStyle,
  updateDocument,
  isCustomStyleAlreadyApplied,
  isLevelUpdated,
} from '../CustomStyleCommand.js';
import {
  setStyles,
  saveStyle,
  renameStyle,
  removeStyle,
  addStyleToList,
} from '../customStyle.js';
import {
  setTextAlign,
  setTextLineSpacing,
  atViewportCenter,
  createPopUp,
} from '@modusoperandi/licit-ui-commands';
import { setParagraphSpacing } from '../ParagraphSpacingCommand.js';
import { RESERVED_STYLE_NONE } from '../CustomStyleNodeSpec.js';

// [FS] IRAD-1039 2020-09-24
// UI to show the list buttons
// eslint-disable-next-line
export class CustomMenuUI extends React.PureComponent<any, any> {
  _popUp = null;
  _stylePopup = null;
  _styleName = null;
  _menuItemHeight = 28;

  _id = uuid();
  _selectedIndex = 0;

  state = {
    expanded: false,
    style: {
      display: 'none',
      top: '',
      left: '',
    },
  };

  render() {
    const {
      dispatch,
      editorState,
      editorView,
      commandGroups,
      staticCommand,
      onCommand,
    } = this.props;
    const children = [];
    const children1 = [];
    let counter = 0;
    let selecteClassName = '';
    const selectedName = this.getTheSelectedCustomStyle(this.props.editorState);
    commandGroups.forEach((group) => {
      Object.keys(group).forEach((label) => {
        const command = group[label];
        counter++;
        if (label === selectedName && '' === selecteClassName) {
          selecteClassName = 'selectbackground';
          this._selectedIndex = counter;
        } else {
          selecteClassName = '';
        }
        children.push(
          <CustomStyleItem
            command={command}
            disabled={!!editorView?.disabled}
            dispatch={dispatch}
            editorState={editorState}
            editorView={editorView}
            hasText={true}
            key={label}
            label={label}
            onClick={this._onUIEnter}
            onCommand={onCommand}
            onMouseEnter={this._onUIEnter}
            selectionClassName={selecteClassName}
            value={command}
          ></CustomStyleItem>
        );
      });
    });
    staticCommand.forEach((group) => {
      Object.keys(group).forEach((label) => {
        const command = group[label];
        children1.push(
          <CustomStyleItem
            command={command}
            disabled={!!editorView?.disabled}
            dispatch={dispatch}
            editorState={editorState}
            editorView={editorView}
            hasText={false}
            key={label}
            label={command._customStyleName}
            onClick={this._onUIEnter}
            onCommand={onCommand}
            onMouseEnter={this._onUIEnter}
            selectionClassName={''}
            value={command}
          ></CustomStyleItem>
        );
      });
    });
    return (
      <div>
        <span data-cy="cyStyleDropdown">
          <div className="molsp-dropbtn" id={this._id}>
            <div className="molsp-stylenames">{children}</div>

            <hr></hr>
            {children1}
          </div>
        </span>
      </div>
    );
  }

  componentDidMount() {
    const styleDiv = document.getElementsByClassName('molsp-stylenames')[0];
    styleDiv.scrollTop =
      this._menuItemHeight * this._selectedIndex - this._menuItemHeight * 2 - 5;
  }

  isAllowedNode(node: Node) {
    return node.type.name === 'paragraph' || node.type.name === 'ordered_list';
  }

  _onUIEnter = (command: UICommand, event: SyntheticEvent<Element>) => {
    if (command.shouldRespondToUIEvent(event)) {
      // check the mouse clicked on down arror to show sub menu
      if (event.currentTarget.className === 'czi-custom-menu-item edit-icon') {
        this.showSubMenu(command, event);
      } else {
        this._execute(command, event);
      }
    }
  };

  _execute = (command: UICommand, e: SyntheticEvent<Element>) => {
    if (undefined !== command) {
      const { dispatch, editorState, editorView, onCommand } = this.props;
      command.execute(editorState, dispatch, editorView, e);
      onCommand?.();
    }
  };

  //shows the alignment and line spacing option
  showSubMenu(command: UICommand, event: SyntheticEvent<Element>) {
    const anchor = event ? event.currentTarget : null;

    // close the popup toggling effect
    if (this._stylePopup) {
      this._stylePopup.close();
      this._stylePopup = null;
      return;
    }
    this._popUp = createPopUp(
      CustomStyleSubMenu,
      {
        command: command,
      },
      {
        anchor,
        autoDismiss: true,
        IsChildDialog: true,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            if (undefined !== val && val.command._customStyle) {
              // do edit,remove,rename code here
              if ('remove' === val.type) {
                // [FS] IRAD-1223 2021-03-01
                // Not allow user to remove already in used custom style with numbering, which shall break the heirarchy.
                if (
                  !isCustomStyleAlreadyApplied(
                    val.command._customStyleName,
                    this.props.editorState
                  )
                ) {
                  removeStyle(val.command._customStyleName)
                    .then(() => {
                      // [FS] IRAD-1099 2020-11-17
                      // Issue fix: Even the applied style is removed the style name is showing in the editor
                      this.removeCustomStyleName(
                        this.props.editorState,
                        val.command._customStyleName,
                        this.props.editorView.dispatch
                      );
                    })
                    .catch(console.error);
                } else {
                  this.showAlert();
                }
              } else if ('rename' === val.type) {
                this.showStyleWindow(command, event, 2);
              } else {
                this.showStyleWindow(command, event, 1);
              }
            }
          }
        },
      }
    );
  }

  // [FS] IRAD-1099 2020-11-17
  // Issue fix: Even the applied style is removed the style name is showing in the editor
  removeCustomStyleName(editorState, removedStyleName, dispatch) {
    const { selection, doc } = editorState;
    let { from, to } = selection;
    const { empty } = selection;
    if (empty) {
      from = selection.$from.before(1);
      to = selection.$to.after(1);
    }

    let tr = editorState.tr;
    const customStyleName = RESERVED_STYLE_NONE;
    const tasks = [];
    const textAlignNode = [];

    doc.nodesBetween(0, doc.nodeSize - 2, (node, pos) => {
      if (node.content?.content?.length) {
        if (node?.content?.content?.[0]?.marks?.length) {
          node.content.content[0].marks.some((mark) => {
            if (node.attrs.styleName === removedStyleName) {
              tasks.push({ node, pos, mark });
            }
          });
        } else {
          textAlignNode.push({ node, pos });
        }
      }
    });

    if (!tasks.length) {
      textAlignNode.forEach((eachnode) => {
        const { node, pos } = eachnode;
        const newattrs = { ...node.attrs, styleName: customStyleName };
        tr = tr?.setNodeMarkup(pos, undefined, newattrs);
      });
      // to remove both text align format and line spacing
      tr = this.removeTextAlignAndLineSpacing(tr, editorState.schema);
    }

    tasks.forEach((job) => {
      const { node, mark, pos } = job;
      tr = tr.removeMark(pos, pos + node.nodeSize, mark.type);
      // reset the custom style name to NONE after remove the styles
      const newattrs = { ...node.attrs, styleName: customStyleName };
      tr = tr.setNodeMarkup(pos, undefined, newattrs);
      const newNode = tr.doc.nodeAt(pos);
      // FIX: Rest to Normal not working for font size.
      tr = applyLatestStyle(
        newNode?.attrs?.styleName,
        editorState,
        tr,
        newNode,
        pos,
        pos + node.nodeSize - 1,
        null,
        1
      );
    });

    // to remove both text align format and line spacing
    tr = this.removeTextAlignAndLineSpacing(tr, editorState.schema);
    editorState.doc.nodesBetween(from, to, (node, startPos) => {
      if (node.type.name === 'paragraph') {
        tr = tr.setNodeMarkup(startPos, undefined, node.attrs);
      }
    });
    if (dispatch && tr.docChanged) {
      dispatch(tr);
      return true;
    }
    return false;
  }

  // to remove the text align, line spacing, paragraph spacing after and before format if applied.
  removeTextAlignAndLineSpacing(tr: Transform, schema: Schema): Transform {
    tr = setTextAlign(tr, schema, null);
    tr = setTextLineSpacing(tr, schema, null);
    tr = setParagraphSpacing(tr, schema, '0', true);
    tr = setParagraphSpacing(tr, schema, '0', false);
    return tr;
  }

  showAlert() {
    const anchor = null;
    this._popUp = createPopUp(
      AlertInfo,
      {
        content:
          'This custom style already in use, by removing this style breaks the heirarchy ',
        title: 'Style Error!!!',
      },
      {
        anchor,
        position: atViewportCenter,
        onClose: () => {
          if (this._popUp) {
            this._popUp = null;
          }
        },
      }
    );
  }

  //shows the alignment and line spacing option
  showStyleWindow(command, _event: SyntheticEvent<Element>, mode) {
    // close the popup toggling effect
    if (this._stylePopup) {
      this._stylePopup.close();
      this._stylePopup = null;
    }
    this._styleName = command._customStyleName;
    this._stylePopup = createPopUp(
      CustomStyleEditor,
      {
        styleName: command._customStyleName,
        mode: mode, //edit
        description: command._customStyle.description,
        styles: command._customStyle.styles,
        editorView: this.props.editorView,
      },
      {
        position: atViewportCenter,
        autoDismiss: false,
        IsChildDialog: false,
        onClose: (val) => {
          if (this._stylePopup) {
            //handle save style object part here
            if (undefined !== val) {
              const { dispatch } = this.props.editorView;
              // [FS] IRAD-1112 2020-12-14
              // Issue fix: Duplicate style created while modified the style name.
              delete val.runtime;
              if (1 === mode) {
                // update
                delete val.editorView;
                let tr;

                // [FS] IRAD-1350 2021-05-19
                // blocks edit if the style is already applied in editor
                if (
                  !isLevelUpdated(this.props.editorState, val.styleName, val)
                ) {
                  saveStyle(val)
                    .then((result) => {
                      if (result) {
                        //in bladelicitruntime, the response of the saveStyle() changed from list to a object
                        //so need to add that style object to the current style list
                        if (!Array.isArray(result)) {
                          result = addStyleToList(result);
                        }
                        setStyles(result);
                        result.forEach((obj) => {
                          if (val.styleName === obj.styleName) {
                            tr = updateDocument(
                              this.props.editorState,
                              this.props.editorState.tr,
                              val.styleName,
                              obj
                            );
                          }
                        });
                        if (tr) {
                          dispatch(tr);
                        }
                      }
                      this.props.editorView.focus();
                      this._stylePopup.close();
                      this._stylePopup = null;
                    })
                    .catch(console.error);
                } else {
                  this.showAlert();
                }
              } else {
                // rename
                renameStyle(this._styleName, val.styleName)
                  .then((result) => {
                    // Issue fix: After modify a custom style, the modified style not applied to the paragraph.

                    if (null != result) {
                      let tr;
                      delete val.editorView;
                      saveStyle(val)
                        .then((result) => {
                          if (result) {
                            //in bladelicitruntime, the response of the saveStyle() changed from list to a object
                            //so need to add that style object to the current style list
                            if (!Array.isArray(result)) {
                              result = addStyleToList(result);
                            }
                            setStyles(result);
                            for (const obj of result) {
                              if (val.styleName === obj.styleName) {
                                tr = this.renameStyleInDocument(
                                  this.props.editorState,
                                  this.props.editorState.tr,
                                  this._styleName,
                                  val.styleName
                                );
                              }
                            }
                            if (tr) {
                              dispatch(tr);
                            }
                          }
                          this.props.editorView.focus();
                          this._stylePopup.close();
                          this._stylePopup = null;
                        })
                        .catch(console.error);
                    }
                  })
                  .catch(console.error);
              }
            }
          }
          this.props.editorView.focus();
        },
      }
    );
  }

  renameStyleInDocument(
    state: EditorState,
    tr: Transform,
    oldStyleName,
    styleName
  ) {
    const { doc } = state;

    doc.descendants((child, pos) => {
      if (oldStyleName === child.attrs.styleName) {
        const newAttrs = { ...child.attrs, styleName };
        tr = tr.setNodeMarkup(pos, undefined, newAttrs);
      }
    });
    return tr;
  }

  // To get the customstylename of the selected paragraph
  getTheSelectedCustomStyle(editorState) {
    const { selection, doc } = editorState;
    const { from, to } = selection;
    let customStyleName = RESERVED_STYLE_NONE;
    doc.nodesBetween(from, to, (node) => {
      if (this.isAllowedNode(node)) {
        if (node.attrs.styleName) {
          customStyleName = node.attrs.styleName;
        }
      }
    });
    return customStyleName;
  }
}
