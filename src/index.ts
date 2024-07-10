// Plugin to handle Styles.
import { Plugin, PluginKey, EditorState, TextSelection, Transaction } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import {
  updateOverrideFlag,
  applyLatestStyle,
  getMarkByStyleName,
  getStyleLevel,
  applyLineStyle,
  applyStyleToEachNode,
} from './CustomStyleCommand.js';
import {
  getCustomStyleByName,
  getCustomStyleByLevel,
  setStyleRuntime,
  setHidenumberingFlag,
  isStylesLoaded,
  setView
} from './customStyle.js';
import { RESERVED_STYLE_NONE } from './CustomStyleNodeSpec.js';
import { getLineSpacingValue } from '@modusoperandi/licit-ui-commands';
import { findParentNodeClosestToPos } from 'prosemirror-utils';
import { Node, Schema, Slice } from 'prosemirror-model';
import { CustomstyleDropDownCommand } from './ui/CustomstyleDropDownCommand.js';
import { applyEffectiveSchema } from './EditorSchema.js';
import type { StyleRuntime } from './StyleRuntime.js';

const ENTERKEYCODE = 13;
const DELKEYCODE = 46;
const BACKSPACEKEYCODE = 8;
const PARA_POSITION_DIFF = 2;
const ATTR_STYLE_NAME = 'styleName';
let slice1;

const isNodeHasAttribute = (node, attrName) => {
  return node.attrs?.[attrName];
};
const requiredAddAttr = (node) => {
  return (
    'paragraph' === node.type.name && isNodeHasAttribute(node, ATTR_STYLE_NAME)
  );
};

// [FS] IRAD-1503 2021-07-02
// Fix: Update the private plugin classes as a named export rather than the default
export class CustomstylePlugin extends Plugin {
  constructor(runtime: StyleRuntime, hideNumbering?: boolean) {
    let csview = null;
    let firstTime = true;
    let loaded = false;
    super({
      key: new PluginKey('CustomstylePlugin'),
      state: {
        init() {
          loaded = false;
          firstTime = true;
          setStyleRuntime(runtime);
        },
        apply(tr) {
          // [FS] IRAD-1202 2021-02-15
          remapCounterFlags(tr);
        },
      },
      view: (view) => {
        // [FS] IRAD-1668 2022-01-21
        // dummy plugin view so that EditorView is accessible when refreshing the document
        // to apply styles after getting the styles.
        csview = view;
        setView(csview);
        setHidenumberingFlag(hideNumbering || false);
        return {
          update: () => {
            /* This is intentional */
          },
          destroy: () => {
            /* This is intentional */
          },
        };
      },

      props: {
        handlePaste(_view, _event, slice) {
          if ((slice.content as unknown as Slice)?.content[0]?.attrs) {     //LINTFIX
            slice1 = slice;
          }
          return false;
        },
        handleDOMEvents: {
          keydown(view) {
            csview = view;
          },
        },
        nodeViews: {},
      },
      appendTransaction: (transactions, prevState, nextState) => {
        let tr = null;
        const ref = { firstTime, loaded };
        if (!loaded) {
          tr = onInitAppendTransaction(ref, tr, nextState);
        } else if (isDocChanged(transactions)) {
          tr = onUpdateAppendTransaction(
            ref,
            tr,
            nextState,
            prevState,
            csview,
            transactions,
            slice1
          );
        }
        firstTime = ref.firstTime;
        loaded = ref.loaded;

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

export function onInitAppendTransaction(ref, tr, nextState) {
  ref.loaded = isStylesLoaded();
  if (ref.loaded) {
    tr = updateStyleOverrideFlag(nextState, tr);
    // do this only once when the document is loaded.
    tr = applyStyles(nextState, tr);
  }

  return tr;
}




export function onUpdateAppendTransaction(
  ref,
  tr,
  nextState,
  prevState,
  csview,
  transactions,
  slice1
) {
  if (!slice1 && csview && BACKSPACEKEYCODE !== csview.input.lastKeyCode) {
    tr = updateStyleOverrideFlag(nextState, tr);
  }

  tr = manageHierarchyOnDelete(prevState, nextState, tr, csview);
  tr = applyStyleForEmptyParagraph(nextState, tr);

  ref.firstTime = false;

  if (csview) {
    tr = handleBackspace(csview, prevState, nextState, tr);
    tr = handleEnterKey(csview, prevState, nextState, tr);
  }

  tr = applyLineStyleForBoldPartial(nextState, tr);

  if (transactions.length > 0 && transactions[0].getMeta('paste')) {
    tr = handlePaste(csview, prevState, nextState, tr, slice1);
  }

  return tr;
}

function handleBackspace(csview, prevState, nextState, tr) {
  if (BACKSPACEKEYCODE === csview.input.lastKeyCode) {
    const paraPositionDiff = prevState.selection.from - nextState.selection.from;
    if (paraPositionDiff === 2 || paraPositionDiff === 0) {
      const { schema } = nextState;
      const para = findParentNodeClosestToPos(tr.curSelection.$head, (node) => node.type === schema.nodes.paragraph);
      if (para) {
        let styleName = para.node.attrs.styleName;
        if (RESERVED_STYLE_NONE === styleName || undefined === styleName) {
          const newattrs = { ...para.node.attrs, styleName: RESERVED_STYLE_NONE };
          tr = tr.setNodeMarkup(para.pos, undefined, newattrs);
          styleName = RESERVED_STYLE_NONE;
        }
        tr = applyLatestStyle(styleName, nextState, tr, para.node, para.pos, para.pos + para.node.nodeSize - 1);
        tr = tr.setSelection(TextSelection.create(tr.doc, nextState.selection.from));
      }
    }
  }
  return tr;
}

function handleEnterKey(csview, prevState, nextState, tr) {
  if (ENTERKEYCODE === csview.input.lastKeyCode) {
    if (tr.selection.$from.start() === tr.selection.$from.end()) {
      tr = applyStyleForNextParagraph(prevState, nextState, tr, csview);
    } else if (tr.selection.$cursor?.pos === tr.selection.$from.start()) {
      tr = applyStyleForPreviousEmptyParagraph(nextState, tr);
    }
  }
  return tr;
}

function handlePaste(csview, prevState, nextState, tr, slice1) {
  for (let index = 0; index < slice1.content.childCount; index++) {
    const content = slice1.content.content[index];
    if (!['table', 'doc'].includes(content.type.name)) {
      if (index === 0 && content.content.size !== 0) {
        const node2 = csview.state.tr.doc.nodeAt(csview.state.selection.$from.before(1));
        const demoPos = prevState.selection.from;
        const node1 = prevState.doc.resolve(demoPos).parent;

        if (!node1.content?.content[0]?.attrs) {
          tr = applyPasteStyle(node1, node2, nextState, tr, content, demoPos);
        } else if (node2.type.name === 'table') {
          tr = applyTableStyle(node1, nextState, tr, demoPos);
        } else {
          tr = applyContentStyle(node1, nextState, tr);
        }
      }
    }
  }
  return tr?.scrollIntoView();
}

function applyPasteStyle(node1, node2, nextState, tr, content, demoPos) {
  const opt = 1;
  if (node2.type.name === 'table') {
    const styleName = content.attrs.styleName;
    const node = nextState.tr.doc.nodeAt(demoPos);
    const endPos = demoPos + node.nodeSize;
    tr = applyLatestStyle(styleName, nextState, tr, node, demoPos, endPos, null, opt);
  } else {
    const startPos = nextState.selection.from - 1;
    const node = nextState.tr.doc.nodeAt(startPos);
    const styleName = content.attrs.styleName || node.attrs.styleName;
    const endPos = startPos + node.nodeSize;
    tr = applyLatestStyle(styleName, nextState, tr, node, startPos, endPos, null, opt);
    tr = tr.setNodeMarkup(startPos, undefined, { ...node.attrs, styleName });
  }
  return tr;
}

function applyTableStyle(node1, nextState, tr, demoPos) {
  const startPos = demoPos;
  const styleName = node1.attrs.styleName;
  const node = nextState.tr.doc.nodeAt(startPos);
  const endPos = startPos + node.nodeSize;
  const styleProp = getCustomStyleByName(styleName);
  tr = applyStyleToEachNode(nextState, startPos, endPos, tr, styleProp, styleName);
  return tr;
}

function applyContentStyle(node1, nextState, tr) {
  const startPos = nextState.selection.$to.after(1) - 1;
  const styleName = node1.attrs.styleName;
  const node = nextState.tr.doc.nodeAt(startPos);
  const endPos = startPos + node.nodeSize;
  const styleProp = getCustomStyleByName(styleName);
  tr = applyStyleToEachNode(nextState, startPos, endPos, tr, styleProp, styleName);
  return tr;
}






//LIC-254 Create new line by placing cursor at the beginning of a paragraph applies the current style instead of Normal style
export function applyStyleForPreviousEmptyParagraph(nextState: EditorState, tr: Transform) {
  if ((tr as Transaction).selection.$from.parentOffset === 0) {
    const prevNode = nextState.doc.resolve((tr as Transaction).selection.$anchor.pos - 1).nodeBefore;
    tr = applyLatestStyle(prevNode.attrs.styleName, nextState, tr, prevNode, (tr as Transaction).selection.$head.before(), ((tr as Transaction).selection.$from.end()), null);
  }
  return tr;
}

// [FS] IRAD-1202 2021-02-15
export function remapCounterFlags(tr) {
  // Depending on the window variables,
  // set counters for numbering.
  const cFlags = tr.doc.attrs.counterFlags;
  for (const key in cFlags) {
    if (Object.hasOwn(cFlags, key)) {
      window[key] = true;
    }
  }
}

export function applyStyles(state, tr) {
  if (!tr) {
    tr = state.tr;
  }

  tr?.doc?.descendants(function (child, pos) {
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
  bOK = node?.attrs?.styleName;
  return bOK;
}

// [FS] IRAD-1130 2021-01-07
// Handle heirarchy on delete




export function manageHierarchyOnDelete(prevState, nextState, tr, view) {
  const { nodesBeforeSelection, nodesAfterSelection, selectedPos } = separateNodes(nextState, view);

  if (shouldManageHierarchy(prevState, nextState, view)) {
    const selectedNode = prevState.doc.nodeAt(selectedPos);

    if (validateStyleName(selectedNode) && Number(getStyleLevel(selectedNode.attrs.styleName)) !== 0) {
      tr = tr || nextState.tr;

      if (nodesBeforeSelection.length > 0) {
        tr = adjustNodeLevels(nodesBeforeSelection, tr, -1);
      }

      if (nodesAfterSelection.length > 0) {
        tr = adjustNodeLevels(nodesAfterSelection, tr, 1);
      }
    }
  }

  return tr;
}

function separateNodes(nextState, view) {
  const nodesAfterSelection = [];
  const nodesBeforeSelection = [];
  const selectedPos = nextState.selection.from;

  if (view && (DELKEYCODE === view?.input?.lastKeyCode || BACKSPACEKEYCODE === view?.input?.lastKeyCode)) {
    const nextNodes = nodeAssignment(nextState);
    nextNodes.forEach((element) => {
      if (element.pos >= selectedPos) {
        nodesAfterSelection.push({ pos: element.pos, node: element.node });
      } else {
        nodesBeforeSelection.push({ pos: element.pos, node: element.node });
      }
    });
  }

  return {
    nodesBeforeSelection,
    nodesAfterSelection,
    selectedPos: updateSelectedPos(view, selectedPos)
  };
}

function updateSelectedPos(view, selectedPos) {
  return DELKEYCODE === view?.input?.lastKeyCode ? selectedPos - 1 : selectedPos + 1;
}

function shouldManageHierarchy(prevState, nextState, view) {
  return prevState.doc !== nextState.doc && prevState.selection.from !== 1 && view;
}

function adjustNodeLevels(nodes, tr, direction) {
  let levelCounter = 0;

  nodes.forEach((item) => {
    let subsequantLevel = Number(getStyleLevel(item.node.attrs.styleName));

    if (subsequantLevel !== 0) {
      if (Math.abs(subsequantLevel - levelCounter) > 1) {
        subsequantLevel += direction;
        if (subsequantLevel > 0) {
          const style = getCustomStyleByLevel(subsequantLevel);
          if (style) {
            const newattrs = { ...item.node.attrs, styleName: style.styleName };
            tr = tr.setNodeMarkup(item.pos, undefined, newattrs);
          }
        }
      }
      levelCounter = subsequantLevel;
    }
  });

  return tr;
}






// get all the nodes having styleName attribute
export function nodeAssignment(state) {
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
      if (style?.styles?.boldPartial) {
        tr = applyLineStyle(nextState, tr, node, pos);
      }
    }
  }
  return tr;
}

// [FS] IRAD-1474 2021-07-01
// Select multiple paragraph with empty paragraph and apply style not working.
export function applyStyleForEmptyParagraph(nextState, tr) {
  const opt = 1;
  const startPos = nextState.selection?.$from.before(1);
  const endPos = nextState.selection?.$to.after(1) - 1;
  if (null === tr) {
    tr = nextState.tr;
  }

  const node = nextState.tr?.doc?.nodeAt(startPos);
  const style = getCustomStyleByName(node?.attrs?.styleName);
  if (!style?.styles?.isList) {
    if (validateStyleName(node)) {
      if (
        node.content?.content &&
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
          endPos,
          null,
          opt
        );
      }
    }
  }
  return tr;
}

// Continious Numbering for custom style



export function applyStyleForNextParagraph(prevState, nextState, tr, view) {
  if (!tr) {
    tr = nextState.tr;
  }

  if (view && isNewParagraph(prevState, nextState, view)) {
    nextState.doc.descendants((node, pos) => {
      if (shouldApplyStyle(node, pos, prevState, nextState)) {
        const {trModified } = applyNodeStyle(
          node,
          pos,
          prevState,
          nextState,
          tr
        );
        if (trModified) {
          tr = trModified;
        }
      }
    });
  }

  return tr?.docChanged ? tr : null;
}

function shouldApplyStyle(node, pos, prevState, nextState) {
  return requiredAddAttr(node) && isActiveNode(pos, prevState, nextState,node);
}

function isActiveNode(pos, prevState, nextState,node) {
  const nextNodePos = pos + node.nodeSize;
  return (
    nextNodePos > prevState.selection.from &&
    nextNodePos < nextState.selection.from
  );
}

function applyNodeStyle(node, pos, prevState, nextState, tr) {
  let newattrs = { ...node.attrs };
  const nextNodePos = pos + node.nodeSize;
  const nextNode = nextState.doc.nodeAt(nextNodePos);
  const style = getCustomStyleByName(newattrs.styleName);

  if (nextNode && nextNode.type.name === 'paragraph' && style?.styles?.nextLineStyleName) {
    newattrs = updateNodeAttributes(newattrs, style, prevState);
    tr = tr.setNodeMarkup(nextNodePos, undefined, newattrs);
    tr = applyMarks(node, style, nextState, tr);
  }

  return { newattrs, trModified: tr };
}

function updateNodeAttributes(newattrs, style, prevState) {
  newattrs = setNodeAttrs(
    resetTheDefaultStyleNameToNone(style.styles.nextLineStyleName),
    newattrs
  );

  if (style.styles.isList) {
    const indent = getIndent(prevState);
    newattrs.indent = indent;
  }

  return newattrs;
}

function getIndent(prevState) {
  const posList = prevState.selection.from - 1;
  const Listnode = prevState.doc.nodeAt(posList);

  if (!Listnode.isText) {
    return Listnode.attrs.indent;
  } else {
    const ListnodeAlt = prevState.doc.nodeAt(posList - Listnode.nodeSize);
    return ListnodeAlt.attrs.indent;
  }
}

function applyMarks(node, style, nextState, tr) {
  const marks = getMarkByStyleName(
    style.styles?.nextLineStyleName || '',
    nextState.schema
  );

  node.descendants((child) => {
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

  return tr;
}





export function resetTheDefaultStyleNameToNone(styleName) {
  if ('Default' === styleName) {
    styleName = RESERVED_STYLE_NONE;
  }
  return styleName;
}

// [FS] IRAD-1217 2021-02-24
// get the style object using the nextlineStyleName and set the attribute values to the node.
export function setNodeAttrs(nextLineStyleName, newattrs) {
  if (nextLineStyleName) {
    const nextLineStyle = getCustomStyleByName(nextLineStyleName);
    if (nextLineStyle?.styles) {
      newattrs.styleName = nextLineStyleName;
      newattrs.indent = nextLineStyle.styles.indent;
      newattrs.align = nextLineStyle.styles.align;
      // KNITE-864 08-03-2024 InnerLink functionality change
      if (newattrs.innerLink) {
        newattrs.innerLink = null;
      }
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

export function isDocChanged(transactions) {
  return transactions.some((transaction) => transaction.docChanged);
}

export function applyNormalIfNoStyle(nextState, tr, node, opt?) {
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
      if (RESERVED_STYLE_NONE === styleName || undefined === styleName) {
        child.attrs.styleName = RESERVED_STYLE_NONE;
        styleName = RESERVED_STYLE_NONE;
      }
      tr = applyLatestStyle(styleName, nextState, tr, child, pos, end + 1, opt);
    }
  });
  return tr;
}

function updateStyleOverrideFlag(state, tr) {
  const retObj = { modified: true };
  if (!tr) {
    tr = state.tr;
  }

  tr.doc.descendants(function (child) {
    const contentLen = child.content.size;
    if (tr && haveEligibleChildren(child, contentLen)) {
      const startPos = tr.curSelection.$anchor.pos; //pos
      const endPos = tr.curSelection.$head.pos; //pos + contentLen
      if (!child.attrs.styleName) {
        child.attrs.styleName = 'Normal';
      }
      tr = updateOverrideFlag(
        child.attrs.styleName,
        tr,
        child,
        startPos,
        endPos,
        retObj,
      );
    }
  });

  return retObj.modified ? tr : null;
}

function haveEligibleChildren(node, contentLen) {
  return (
    node instanceof Node && 0 < contentLen && node.type.name === 'paragraph'
  );
}
