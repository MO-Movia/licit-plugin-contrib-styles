// @flow

// Plugin to handle Styles.
import { Plugin, PluginKey } from 'prosemirror-state';
import {
  updateOverrideFlag,
  applyLatestStyle,
  getMarkByStyleName,
  getStyleLevel,
  applyLineStyle,
} from './CustomStyleCommand';
import {
  getCustomStyleByName,
  getCustomStyleByLevel,
  setStyleRuntime,
  setHidenumberingFlag,
  isStylesLoaded,
} from './customStyle';
import { RESERVED_STYLE_NONE } from './CustomStyleNodeSpec';
import { getLineSpacingValue } from '@modusoperandi/licit-ui-commands';
import { findParentNodeClosestToPos } from 'prosemirror-utils';
import { Node, Schema } from 'prosemirror-model';
import CustomstyleDropDownCommand from './ui/CustomstyleDropDownCommand';
import { applyEffectiveSchema } from './EditorSchema';
import type { StyleRuntime } from './StyleRuntime';
import {
  saveStyle
} from './customStyle';

const ENTERKEYCODE = 13;
const DELKEYCODE = 46;
const BACKSPACEKEYCODE = 8;
const PARA_POSITION_DIFF = 2;
const ATTR_STYLE_NAME = 'styleName';

const isNodeHasAttribute = (node, attrName) => {
  return node.attrs && node.attrs[attrName];
};
const requiredAddAttr = (node) => {
  return (
    'paragraph' === node.type.name && isNodeHasAttribute(node, ATTR_STYLE_NAME)
  );
};

// [FS] IRAD-1503 2021-07-02
// Fix: Update the private plugin classes as a named export rather than the default
export class CustomstylePlugin extends Plugin {
  constructor(runtime: StyleRuntime, hideNumbering: boolean) {
    let csview = null;
    let firstTime = true;
    let loaded = false;
    super({
      key: new PluginKey('CustomstylePlugin'),
      state: {
        init(config, state) {
          loaded = false;
          firstTime = true;
          setStyleRuntime(runtime, refreshToApplyStyles.bind(this));
          setHidenumberingFlag(hideNumbering ? hideNumbering : false);
          // save a Default style in server
          saveDefaultStyle();
        },
        apply(tr, prev, oldState, newState) {
          // [FS] IRAD-1202 2021-02-15
          remapCounterFlags(tr);
        },
      },
      view: (view) => {
        // [FS] IRAD-1668 2022-01-21
        // dummy plugin view so that EditorView is accessible when refreshing the document
        // to apply styles after getting the styles.
        this.csview = view;
        return {
          update: () => { },
          destroy: () => { },
        };
      },

      props: {
        handlePaste(view, event, slice) {
          const startPos = view.state.selection.$from.before(1);
          const endPos = view.state.selection.$to.after(1) - 1;
          if (slice.content && slice.content.content[0] && slice.content.content[0].attrs) {
            const styleName = slice.content.content[0].attrs.styleName;
            const node = view.state.tr.doc.nodeAt(startPos);
            const newattrs = Object.assign({}, node.attrs);
            newattrs.styleName = styleName;
            const storedmarks = getMarkByStyleName(styleName, view.state.schema);
            let tr = view.state.tr.setNodeMarkup(startPos, undefined, newattrs);
            tr.storedMarks = storedmarks;
            tr = applyLatestStyle(styleName, view.state, tr, node, startPos, endPos);

            tr = applyNormalIfNoStyle(view.state, tr, node);

            if (tr) {
              view.dispatch(tr);
            }
          }
          return false;

        },
        handleDOMEvents: {
          keydown(view, event) {
            csview = view;
          },
        },
        nodeViews: [],
      },
      appendTransaction: (transactions, prevState, nextState) => {
        let tr = null;
        if (!loaded) {
          loaded = isStylesLoaded();
          if (loaded) {
            tr = updateStyleOverrideFlag(nextState, tr);
            // do this only once when the document is loaded.
            tr = applyStyles(nextState, tr);
            if (firstTime) {
              tr = applyNormalIfNoStyle(nextState, tr, nextState.tr.doc);
            }
          }
        } else if (isDocChanged(transactions)) {
          if (!firstTime) {
            // when user updates
            tr = updateStyleOverrideFlag(nextState, tr);
            tr = manageHierarchyOnDelete(prevState, nextState, tr, csview);
          }

          tr = applyStyleForEmptyParagraph(nextState, tr);

          firstTime = false;
          // custom style for next line
          if (csview) {
            if (ENTERKEYCODE === csview.input.lastKeyCode && tr.selection.$from.start() == tr.selection.$from.end()) {
              tr = applyStyleForNextParagraph(prevState, nextState, tr, csview);
            }
          }
          tr = applyLineStyleForBoldPartial(nextState, tr);
        }
        return tr;
      },
    });
  }

  initButtonCommands() {
    return {
      '[H1] Header 1': CustomstyleDropDownCommand,
    };
  }

  getEffectiveSchema(schema: Schema) {
    schema = applyEffectiveSchema(schema);
    const nodes = schema.spec.nodes;
    const marks = schema.spec.marks;

    return new Schema({
      nodes: nodes,
      marks: marks,
    });
  }
}

// [FS] IRAD-1202 2021-02-15
function remapCounterFlags(tr) {
  // Depending on the window variables,
  // set counters for numbering.
  const cFlags = tr.doc.attrs.counterFlags;
  for (const key in cFlags) {
    if (cFlags.hasOwnProperty(key)) {
      window[key] = true;
    }
  }
}

function saveDefaultStyle() {
  const styleObj = {
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
  saveStyle(styleObj).then((result) => {

  });
}

function applyStyles(state, tr) {
  if (!tr) {
    tr = state.tr;
  }

  tr.doc.descendants(function (child, pos) {
    const contentLen = child.content.size;
    if (tr && haveEligibleChildren(child, contentLen)) {
      // [FS] IRAD-1170 2021-02-02
      // FIX: When loading some documents on load show "Cannot read nodeSize property of undefined" error.
      const docLen = tr.doc.content.size;
      let end = pos + contentLen;
      // Validate end position.
      if (end > docLen) {
        // Can't be out of range.
        end = docLen;
      }

      // check if the loaded document's para have valid styleName
      const styleName = child.attrs.styleName;
      tr = applyLatestStyle(styleName, state, tr, child, pos, end);
    }
  });

  return tr;
}

function validateStyleName(node) {
  let bOK = false;
  bOK = node && node.attrs && node.attrs.styleName;
  return bOK;
}
// [FS] IRAD-1668 2022-01-21
function refreshToApplyStyles() {
  if (this.csview) {
    this.csview.dispatch(
      this.csview.state.tr.scrollIntoView()
    );
  }
}

// [FS] IRAD-1130 2021-01-07
// Handle heirarchy on delete
function manageHierarchyOnDelete(prevState, nextState, tr, view) {
  const nodesAfterSelection = [];
  const nodesBeforeSelection = [];
  let selectedPos = nextState.selection.from;
  if (prevState.doc !== nextState.doc) {
    if (
      view &&
      (DELKEYCODE === view.input.lastKeyCode || BACKSPACEKEYCODE === view.input.lastKeyCode)
    ) {
      const nextNodes = nodeAssignment(nextState);
      // seperating  the nodes to two arrays, ie selection before and after
      nextNodes.forEach((element) => {
        if (element.pos >= selectedPos) {
          nodesAfterSelection.push({ pos: element.pos, node: element.node });
        } else {
          nodesBeforeSelection.push({ pos: element.pos, node: element.node });
        }
      });
      // for backspace and delete to get the correct node position
      selectedPos =
        DELKEYCODE === view.input.lastKeyCode ? selectedPos - 1 : selectedPos + 1;
      const selectedNode = prevState.doc.nodeAt(selectedPos);
      if (
        validateStyleName(selectedNode) &&
        0 !== Number(getStyleLevel(selectedNode.attrs.styleName))
      ) {
        if (nodesBeforeSelection.length > 0 || nodesAfterSelection.length > 0) {
          // assigning transaction if tr is null
          if (!tr) {
            tr = nextState.tr;
          }

          let subsequantLevel = 0;
          let levelCounter = 0;
          let prevNode = null;
          let prevNodeLevel = 0;

          if (nodesBeforeSelection.length > 0) {
            prevNode = nodesBeforeSelection[nodesBeforeSelection.length - 1];
            prevNodeLevel = Number(
              getStyleLevel(prevNode.node.attrs.styleName)
            );
          }

          if (nodesBeforeSelection.length > 0 && 0 !== prevNodeLevel) {
            for (
              let indexbefore = 0;
              indexbefore < nodesBeforeSelection.length;
              indexbefore++
            ) {
              const beforeitem = nodesBeforeSelection[indexbefore];
              subsequantLevel = Number(
                getStyleLevel(beforeitem.node.attrs.styleName)
              );
              if (subsequantLevel !== 0) {
                if (subsequantLevel > 1 && subsequantLevel - levelCounter > 1) {
                  subsequantLevel = subsequantLevel - 1;
                  const style = getCustomStyleByLevel(subsequantLevel);
                  if (style) {
                    const newattrs = Object.assign({}, beforeitem.node.attrs);
                    newattrs.styleName = style.styleName;
                    tr = tr.setNodeMarkup(beforeitem.pos, undefined, newattrs);
                  }
                }
                levelCounter = subsequantLevel;
              }
            }
          }

          for (let index = 0; index < nodesAfterSelection.length; index++) {
            const item = nodesAfterSelection[index];
            subsequantLevel = Number(getStyleLevel(item.node.attrs.styleName));

            if (subsequantLevel !== 0) {
              if (levelCounter !== subsequantLevel) {
                if (subsequantLevel - levelCounter > 1) {
                  subsequantLevel = Number(subsequantLevel) - 1;
                  if (subsequantLevel > 0) {
                    const style = getCustomStyleByLevel(subsequantLevel);
                    if (style) {
                      const newattrs = Object.assign({}, item.node.attrs);
                      newattrs.styleName = style.styleName;
                      tr = tr.setNodeMarkup(item.pos, undefined, newattrs);
                    }
                  }
                }
              }
              levelCounter = subsequantLevel;
            }
          }
        }
      }
    }
  }
  return tr;
}

// get all the nodes having styleName attribute
function nodeAssignment(state) {
  const nodes = [];
  state.doc.descendants((node, pos) => {
    if (requiredAddAttr(node)) {
      nodes.push({
        node,
        pos,
      });
    }
  });
  return nodes;
}

// [FS] IRAD-1481 2021-07-02
// FIX: Style with First Word Bold and Continue is not showing properly when entering text in a new paragraph
function applyLineStyleForBoldPartial(nextState, tr) {
  const { selection, schema } = nextState;
  const currentPos = selection.$cursor
    ? selection.$cursor.pos
    : selection.$to.pos;
  const para = findParentNodeClosestToPos(
    nextState.doc.resolve(currentPos),
    (node) => {
      return node.type === schema.nodes.paragraph;
    }
  );
  if (para) {
    const { pos, node } = para;
    if (!tr) {
      tr = nextState.tr;
    }
    // Check styleName is available for node
    if (validateStyleName(node)) {
      const style = getCustomStyleByName(node.attrs.styleName);
      if (null !== style && style.styles && style.styles.boldPartial) {
        tr = applyLineStyle(nextState, tr, node, pos);
      }
    }
  }
  return tr;
}

// [FS] IRAD-1474 2021-07-01
// Select multiple paragraph with empty paragraph and apply style not working.
function applyStyleForEmptyParagraph(nextState, tr) {
  const startPos = nextState.selection.$from.before(1);
  const endPos = nextState.selection.$to.after(1) - 1;
  if (null === tr) {
    tr = nextState.tr;
  }

  const node = nextState.tr.doc.nodeAt(startPos);
  if (validateStyleName(node)) {
    if (
      node.content &&
      node.content.content &&
      0 < node.content.content.length &&
      node.content.content[0].marks &&
      0 === node.content.content[0].marks.length
    ) {
      tr = applyLatestStyle(
        node.attrs.styleName,
        nextState,
        tr,
        node,
        startPos,
        endPos
      );
    }
  }
  return tr;
}

// Continious Numbering for custom style
function applyStyleForNextParagraph(prevState, nextState, tr, view) {
  let modified = false;
  if (!tr) {
    tr = nextState.tr;
  }
  if (view && isNewParagraph(prevState, nextState, view)) {
    nextState.doc.descendants((node, pos) => {
      let required = false;
      if (requiredAddAttr(node)) {
        required = true;
      }
      if (required) {
        let newattrs = Object.assign({}, node.attrs);
        const nextNodePos = pos + node.nodeSize;
        const nextNode = nextState.doc.nodeAt(nextNodePos);
        let IsActiveNode = false;
        if (
          nextNodePos > prevState.selection.from &&
          nextNodePos < nextState.selection.from
        ) {
          IsActiveNode = true;
        }
        if (
          nextNode &&
          IsActiveNode &&
          nextNode.type.name === 'paragraph') {
          const style = getCustomStyleByName(newattrs.styleName);
          if (style && style.styles && style.styles.nextLineStyleName) {
            // [FS] IRAD-1217 2021-02-24
            // Select style for next line not working continuously for more that 2 paragraphs
            newattrs = setNodeAttrs(resetTheDefaultStyleNameToNone(style.styles.nextLineStyleName), newattrs);
            tr = tr.setNodeMarkup(nextNodePos, undefined, newattrs);
            // [FS] IRAD-1201 2021-02-18
            // get the nextLine Style from the current style object.
            const marks = getMarkByStyleName(
              style.styles && style.styles.nextLineStyleName
                ? style.styles.nextLineStyleName
                : '',
              nextState.schema
            );
            node.descendants((child, pos) => {
              if (child.type.name === 'text') {
                marks.forEach((mark) => {
                  tr = tr.addStoredMark(mark);
                });
              }
            });
            if (node.content.size === 0) {
              marks.forEach((mark) => {
                tr = tr.addStoredMark(mark);
              });
            }
            modified = true;
          }
        }
      }
    });
  }

  return modified ? tr : null;
}

function resetTheDefaultStyleNameToNone(styleName) {
  if ('Default' === styleName) {
    styleName = RESERVED_STYLE_NONE;
  }
  return styleName;
}

// [FS] IRAD-1217 2021-02-24
// get the style object using the nextlineStyleName and set the attribute values to the node.
function setNodeAttrs(nextLineStyleName, newattrs) {
  if (nextLineStyleName) {
    const nextLineStyle = getCustomStyleByName(nextLineStyleName);
    if (nextLineStyle && nextLineStyle.styles) {
      newattrs.styleName = nextLineStyleName;
      newattrs.indent = nextLineStyle.styles.indent;
      newattrs.align = nextLineStyle.styles.align;
      // [FS] IRAD-1223 2021-03-04
      // Line spacing not working for next line style
      newattrs.lineSpacing = getLineSpacingValue(
        nextLineStyle.styles.lineHeight ? nextLineStyle.styles.lineHeight : ''
      );
    } else if (RESERVED_STYLE_NONE === nextLineStyleName) {
      // [FS] IRAD-1229 2021-03-03
      // Next line style None not applied
      newattrs = resetNodeAttrs(newattrs, nextLineStyleName);
    }
  }

  return newattrs;
}

function resetNodeAttrs(newattrs, nextLineStyleName) {
  newattrs.styleName = nextLineStyleName;
  newattrs.indent = null;
  newattrs.lineSpacing = null;
  newattrs.align = 'left';
  return newattrs;
}

function isNewParagraph(prevState, nextState, view) {
  let bOk = false;
  if (
    ENTERKEYCODE === view.input.lastKeyCode &&
    PARA_POSITION_DIFF === nextState.selection.from - prevState.selection.from
  ) {
    bOk = true;
  }
  return bOk;
}

function isDocChanged(transactions) {
  return transactions.some((transaction) => transaction.docChanged);
}

function applyNormalIfNoStyle(nextState, tr, node) {
  if (!tr) {
    tr = nextState.tr;
  }
  node.descendants(function (child, pos) {
    const contentLen = child.content.size;
    if (tr && haveEligibleChildren(child, contentLen)) {
      const docLen = tr.doc.content.size;
      let end = pos + contentLen;
      // Validate end position.
      if (end > docLen) {
        // Can't be out of range.
        end = docLen;
      }
      let styleName = child.attrs.styleName;
      if (RESERVED_STYLE_NONE == styleName || !styleName) {
        child.attrs.styleName = RESERVED_STYLE_NONE;
        styleName = RESERVED_STYLE_NONE;
      }
      tr = applyLatestStyle(styleName, nextState, tr, child, pos, end + 1);
    }
  });
  return tr;
}

function updateStyleOverrideFlag(state, tr) {
  const retObj = { modified: false };
  if (!tr) {
    tr = state.tr;
  }

  tr.doc.descendants(function (child, pos) {
    const contentLen = child.content.size;
    if (tr && haveEligibleChildren(child, contentLen)) {
      const startPos = tr.curSelection.$anchor.pos; //pos
      const endPos = tr.curSelection.$head.pos; //pos + contentLen
      tr = updateOverrideFlag(
        child.attrs.styleName,
        tr,
        child,
        startPos,
        endPos,
        retObj,
        state
      );
    }
  });

  return retObj.modified ? tr : null;
}

function haveEligibleChildren(node, contentLen) {
  return (
    node instanceof Node &&
    0 < contentLen &&
    node.type.name === 'paragraph'
  );
}
