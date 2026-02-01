// Plugin to handle Styles.
import {
  Plugin,
  PluginKey,
  EditorState,
  TextSelection,
  Transaction,
} from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import {
  applyLatestStyle,
  getMarkByStyleName,
  applyLineStyle,
  applyStyleToEachNode,
} from './CustomStyleCommand';
import {
  getCustomStyleByName,
  setStyleRuntime,
  setHidenumberingFlag,
  isStylesLoaded,
  setView,
  setCustomStylesOnLoad,
} from './customStyle';
import { RESERVED_STYLE_NONE } from './CustomStyleNodeSpec';
import { getLineSpacingValue } from '@modusoperandi/licit-ui-commands';
import { findParentNodeClosestToPos } from 'prosemirror-utils';
import { Node, Schema, Slice } from 'prosemirror-model';
import { CustomstyleDropDownCommand } from './ui/CustomstyleDropDownCommand';
import { applyEffectiveSchema } from './EditorSchema';
import type { StyleRuntime } from './StyleRuntime';
export * from './StyleRuntime';

const ENTERKEYCODE = 13;
const BACKSPACEKEYCODE = 8;
const PARA_POSITION_DIFF = 4;
const ATTR_STYLE_NAME = 'styleName';
let slice1;

const isNodeHasAttribute = (node, attrName) => {
  return attrName in (node?.attrs || {});
};
const requiredAddAttr = (node) => {
  return (
    'paragraph' === node?.type?.name &&
    isNodeHasAttribute(node, ATTR_STYLE_NAME)
  );
};

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
          setCustomStylesOnLoad();
        },
        apply(tr) {
          remapCounterFlags(tr);
        },
      },
      view: (view) => {
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
          if ((slice.content as unknown as Slice)?.content[0]?.attrs) {
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
        if (1 === tr?.updated) {
          slice1 = null;
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

  static setLevelCounter(styleCounter) {
    document.documentElement.style.counterSet = `C1 ${styleCounter - 1}`;
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
  tr = applyStyleForEmptyParagraph(nextState, tr);
  ref.firstTime = false;

  // custom style for next line
  if (csview) {
    if (BACKSPACEKEYCODE === csview.input.lastKeyCode) {
      const paraPositionDiff =
        prevState.selection.from - nextState.selection.from;
      if (paraPositionDiff === 2 || paraPositionDiff === 0) {
        const { schema } = nextState;
        const para = findParentNodeClosestToPos(
          tr.curSelection.$head,
          (node) => {
            return node.type === schema.nodes.paragraph;
          }
        );
        if (para) {
          let styleName = para.node.attrs.styleName;
          if (RESERVED_STYLE_NONE === styleName || undefined === styleName) {
            const newattrs = { ...para.node.attrs };
            newattrs.styleName = RESERVED_STYLE_NONE;
            tr = tr.setNodeMarkup(para.pos, undefined, newattrs);
            styleName = RESERVED_STYLE_NONE;
          }
          tr = applyLatestStyle(
            styleName,
            nextState,
            tr,
            para.node,
            para.pos,
            para.pos + para.node.nodeSize - 1
          );
          tr = tr.setSelection(
            TextSelection.create(tr.doc, nextState.selection.from)
          );
        }
      }
    }
    if (
      ENTERKEYCODE === csview.input.lastKeyCode &&
      tr.selection.$from.start() === tr.selection.$from.end()
    ) {
      tr = applyStyleForNextParagraph(prevState, nextState, tr, csview);
    } else if (
      ENTERKEYCODE === csview.input.lastKeyCode &&
      tr.selection.$cursor?.pos === tr.selection.$from.start()
    ) {
      tr = applyStyleForPreviousEmptyParagraph(nextState, tr);
      const cursourPosition = prevState.tr.selection.$cursor?.pos;
      if (
        cursourPosition !== undefined &&
        cursourPosition >= 0 &&
        cursourPosition <= prevState.doc.content.size
      ) {
        tr = tr.setSelection(TextSelection.create(tr.doc, cursourPosition));
      }
    }
  }

  const isPaste = transactions.length && transactions[0].getMeta('paste');
  tr = applyLineStyleForBoldPartial(nextState, tr, isPaste);

  // OPTIMIZED: Only process paste if content is small enough
  if (isPaste) {
    // Defer styling for large pastes
    if (slice1.content.childCount > 20) {
      // Apply minimal styling or defer to next tick
      tr = applyMinimalPasteStyling(slice1, prevState, nextState, csview, tr);
    } else {
      tr = optimizedPasteHandler(slice1, prevState, nextState, csview, tr);
    }
    tr = tr?.scrollIntoView();
  }

  return tr;
}

// NEW: Minimal styling for large pastes
function applyMinimalPasteStyling(slice1, prevState, nextState, csview, tr) {
  // Only set styleName attributes without calling expensive style functions
  const demoPos = prevState.selection.from;
  const parentNode = prevState.doc.resolve(demoPos).parent;
  const defaultStyle = parentNode.attrs?.styleName ?? RESERVED_STYLE_NONE;

  let currentPos = csview.state.selection.$from.before(
    csview.state.selection.$from.depth === 0
      ? 1
      : csview.state.selection.$from.depth
  );

  // Just set attributes, skip applyLatestStyle and applyStyleToEachNode
  slice1.content.forEach((sliceNode, index) => {
    if (sliceNode.type.name === 'table' || sliceNode.type.name === 'doc') {
      return;
    }

    if (index === 0) {
      currentPos = csview.state.selection.from - 1;
    }

    const targetNode = nextState.tr.doc.nodeAt(currentPos);
    if (!targetNode) {
      return;
    }

    const styleName = sliceNode.attrs?.styleName ?? defaultStyle;
    const newattrs = { ...targetNode.attrs, styleName };

    // Only set markup, skip expensive style application
    tr = tr.setNodeMarkup(currentPos, undefined, newattrs);

    currentPos += targetNode.nodeSize;
  });

  return tr;
}

// OPTIMIZED: For small pastes - batch all markup changes first
function optimizedPasteHandler(slice1, prevState, nextState, csview, tr) {
  const demoPos = prevState.selection.from;
  const parentNode = prevState.doc.resolve(demoPos).parent;
  const hasParentAttrs = !!parentNode.content?.content[0]?.attrs;

  let currentPos = csview.state.selection.$from.before(
    csview.state.selection.$from.depth === 0
      ? 1
      : csview.state.selection.$from.depth
  );

  // STEP 1: Collect all node information without applying styles
  const nodeInfos = [];

  slice1.content.forEach((sliceNode, index) => {
    if (sliceNode.type.name === 'table' || sliceNode.type.name === 'doc') {
      return;
    }

    const currentNode =
      index === 0
        ? csview.state.tr.doc.nodeAt(currentPos)
        : csview.state.tr.doc.nodeAt(demoPos);

    if (index === 0 && !hasParentAttrs && currentNode?.type?.name !== 'table') {
      currentPos = csview.state.selection.from - 1;
    }

    const targetNode = nextState.tr.doc.nodeAt(currentPos);
    if (!targetNode) {
      return;
    }

    const nodeLength = targetNode.nodeSize;
    const endPos = currentPos + nodeLength;

    let styleName;
    if (hasParentAttrs) {
      styleName = parentNode.attrs.styleName ?? 'Normal';
    } else {
      if (currentNode?.type?.name === 'table') {
        styleName = sliceNode.attrs.styleName ?? 'Normal';
      } else {
        styleName =
          null === sliceNode?.attrs?.styleName
            ? targetNode?.attrs?.styleName
            : sliceNode?.attrs?.styleName;
        styleName = styleName ?? RESERVED_STYLE_NONE;
      }
    }

    nodeInfos.push({
      pos: currentPos,
      endPos:
        hasParentAttrs || currentNode?.type?.name === 'table'
          ? endPos
          : endPos - 1,
      node: targetNode,
      styleName,
      isTable: currentNode?.type?.name === 'table',
      hasParentAttrs,
      needsMarkup: !hasParentAttrs && currentNode?.type?.name !== 'table',
    });

    currentPos = endPos;
  });

  // STEP 2: Apply all setNodeMarkup calls first (these are fast)
  nodeInfos.forEach((info) => {
    if (info.needsMarkup) {
      const newattrs = { ...info.node.attrs, styleName: info.styleName };
      tr = tr.setNodeMarkup(info.pos, undefined, newattrs);
    }
  });

  // STEP 3: Group nodes by style to reduce applyLatestStyle/applyStyleToEachNode calls
  const styleGroups = new Map();
  nodeInfos.forEach((info) => {
    const key = `${info.styleName}-${info.hasParentAttrs}`;
    if (!styleGroups.has(key)) {
      styleGroups.set(key, []);
    }
    styleGroups.get(key).push(info);
  });

  // STEP 4: Apply styles once per group instead of per node
  const opt = 1;
  styleGroups.forEach((infos) => {
    const info = infos[0];

    if (info.hasParentAttrs) {
      // Apply to all nodes in this group at once
      const styleProp = getCustomStyleByName(info.styleName);
      infos.forEach((nodeInfo) => {
        tr = applyStyleToEachNode(
          nextState,
          nodeInfo.pos,
          nodeInfo.endPos,
          tr,
          styleProp,
          info.styleName
        );
      });
    } else {
      // Apply to each node individually (but at least they're grouped)
      infos.forEach((nodeInfo) => {
        tr = applyLatestStyle(
          info.styleName ?? '',
          nextState,
          tr,
          nodeInfo.node,
          nodeInfo.pos,
          nodeInfo.endPos,
          null,
          opt
        );
      });
    }
  });

  return tr;
}

//LIC-254 Create new line by placing cursor at the beginning of a paragraph applies the current style instead of Normal style
export function applyStyleForPreviousEmptyParagraph(
  nextState: EditorState,
  tr: Transform
) {
  if ((tr as Transaction).selection.$from.parentOffset === 0) {
    const prevNode = nextState.doc.resolve(
      (tr as Transaction).selection.$anchor.pos - 1
    ).nodeBefore;
    if (prevNode) {
      tr = applyLatestStyle(
        prevNode?.attrs?.styleName,
        nextState,
        tr,
        prevNode,
        (tr as Transaction).selection.$head.before(),
        (tr as Transaction).selection.$from.end(),
        null
      );
    }
  }
  return tr;
}

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

export function applyStyles(state: EditorState, tr?: Transform) {
  tr ??= state.tr;
  tr?.doc?.descendants(function (child, pos) {
    const contentLen = child.content.size;
    if (haveEligibleChildren(child, contentLen)) {
      const docLen = tr.doc.content.size;
      // Validate end position.
      const end = Math.min(pos + contentLen, docLen);
      // check if the loaded document's para have valid styleName
      const styleName = child.attrs.styleName ?? RESERVED_STYLE_NONE;
      tr = applyLatestStyle(styleName, state, tr, child, pos, end);
    }
  });
  return tr;
}

function validateStyleName(node) {
  return 'styleName' in (node?.attrs || {});
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

// FIX: Style with First Word Bold and Continue is not showing properly when entering text in a new paragraph
function applyLineStyleForBoldPartial(nextState, tr, isPaste) {
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
      if (style?.styles?.indentPosition) {
        tr = applyHangingIndentTransform(tr, nextState, node, pos, isPaste);
      }
    }
  }
  return tr;
}

// [FS] IRAD-1474 2021-07-01
// Select multiple paragraph with empty paragraph and apply style not working.
export function applyStyleForEmptyParagraph(nextState, tr) {
  const opt = 1;
  const startPos = nextState.selection?.$from.before(
    nextState.selection?.$from.depth === 0
      ? 1
      : nextState.selection?.$from.depth
  );
  const endPos = nextState.selection?.$to?.end();
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
          node.attrs.styleName ?? RESERVED_STYLE_NONE,
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
  let modified = false;
  if (!tr) {
    tr = nextState.tr;
  }
  if (!nextState?.selection) {
    return tr;
  }
  const { $from } = nextState.selection;
  if (view && isNewParagraph(prevState, nextState, view)) {
    const prevParagraph = findPreviousParagraph($from);
    const required = requiredAddAttr(prevParagraph);
    if (required) {
      let newattrs = {
        styleName: prevParagraph.attrs.styleName,
        indent: prevParagraph.attrs.indent,
        align: prevParagraph.attrs.align,
      };

      const nextNodePos = nextState.selection.from - 1;
      const nextNode = nextState.doc.nodeAt(nextNodePos);

      let IsActiveNode = false;
      if (
        nextNodePos > prevState.selection.from &&
        nextNodePos < nextState.selection.from
      ) {
        IsActiveNode = true;
      }

      if (nextNode && IsActiveNode && nextNode.type.name === 'paragraph') {
        const posList = prevState.selection.from - 1;
        const Listnode = prevState.doc.nodeAt(posList);
        const style = getCustomStyleByName(prevParagraph.attrs.styleName);
        if (style?.styles?.nextLineStyleName) {
          // [FS] IRAD-1217 2021-02-24
          // Select style for next line not working continuously for more that 2 paragraphs
          if ($from.node(-1).type.name !== 'list_item') {
            newattrs = setNodeAttrs(
              resetTheDefaultStyleNameToNone(style.styles.nextLineStyleName),
              newattrs
            );
          }
          if (style.styles.isList === true) {
            if (Listnode.isText === false) {
              newattrs.indent = Listnode.attrs.indent;
            } else {
              const ListnodeAlt = prevState.doc.nodeAt(
                posList - Listnode.nodeSize
              );
              newattrs.indent = ListnodeAlt.attrs.indent;
            }
          }
          tr = tr.setNodeMarkup(nextNodePos, undefined, newattrs);
          let styleName = style.styleName;
          if ($from.node(-1).type.name !== 'list_item') {
            styleName = style.styles?.nextLineStyleName ?? RESERVED_STYLE_NONE;
          }

          // get the nextLine Style from the current style object.
          const marks = getMarkByStyleName(styleName, nextState.schema);
          nextNode.descendants((child) => {
            if (child.type.name === 'text') {
              marks.forEach((mark) => {
                tr = tr.addStoredMark(mark);
              });
            }
          });
          if (nextNode.content.size === 0) {
            marks.forEach((mark) => {
              tr = tr.addStoredMark(mark);
            });
          }
          modified = true;
        }
      }
    }
  }

  return modified ? tr : null;
}

function findPreviousParagraph($from) {
  const prevParagraph = null;

  // Traverse up to find the previous paragraph
  for (let i = $from?.depth; i > 0; i--) {
    const parent = $from.node(i - 1); // Get parent node
    const index = $from.index(i - 1); // Get index of the current node in its parent

    // Traverse backwards within the parent
    for (let j = index - 1; j >= 0; j--) {
      const beforeNode = parent.child(j);
      if (beforeNode.type.name === 'paragraph') {
        return beforeNode; // Found previous paragraph
      } else if (beforeNode.isBlock) {
        // If it's a block node, check inside it
        const found = findLastParagraph(beforeNode);
        if (found) return found;
      }
    }
  }

  return prevParagraph;
}

/*
 * Finds the last paragraph inside a given node (e.g., inside a list item).
 */
function findLastParagraph(node) {
  if (!node?.isBlock) return null;

  for (let i = node.childCount - 1; i >= 0; i--) {
    const child = node.child(i);
    if (child.type.name === 'paragraph') return child;
    if (child.isBlock) {
      const found = findLastParagraph(child);
      if (found) return found;
    }
  }
  return null;
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
      if (newattrs.innerLink) {
        newattrs.innerLink = null;
      }
      if (newattrs.reset === 'true') {
        newattrs.reset = 'false';
      }
      newattrs.overriddenAlign = null;
      newattrs.overriddenAlignValue = null;
      newattrs.overriddenIndent = null;
      newattrs.overriddenIndentValue = null;
      newattrs.overriddenLineSpacing = null;
      newattrs.overriddenLineSpacingValue = null;

      // Line spacing not working for next line style
      newattrs.lineSpacing = getLineSpacingValue(
        nextLineStyle.styles.lineHeight ? nextLineStyle.styles.lineHeight : ''
      );
    } else if (RESERVED_STYLE_NONE === nextLineStyleName) {
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
    nextState.selection.from - prevState.selection.from <= PARA_POSITION_DIFF
  ) {
    bOk = true;
  }
  return bOk;
}

export function isDocChanged(transactions) {
  return transactions.some((transaction) => transaction.docChanged);
}

export function applyNormalIfNoStyle(nextState, tr, node, opt?) {
  tr ??= nextState.tr;
  node.descendants(function (child, pos) {
    const contentLen = child.content.size;
    if (tr && haveEligibleChildren(child, contentLen)) {
      const docLen = tr.doc.content.size;
      // Validate end position.
      const end = Math.min(pos + contentLen, docLen);
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
// using this function we can find if the user overrided the align,line spacing,indent.

function haveEligibleChildren(node, contentLen) {
  return (
    node instanceof Node && 0 < contentLen && node.type.name === 'paragraph'
  );
}

// Hanging indent implementation
export function applyHangingIndentTransform(tr, state, node, pos, isPaste) {
  if (!node || node.type.name !== 'paragraph') return tr;

  const newContent = [];
  let spacerRemoved = false;
  let foundSpacer = false;
  let foundHangingIndent = false;
  let isParagraphStartsWithTab = false;
  let counter = 0;
  let emptyChild;
  // Scan once for spacers and existing hanging-indents
  node.content.forEach((child) => {
    if (child.marks.some((m) => m?.type.name === 'spacer')) {
      foundSpacer = true;
    }
    if (child.marks.some((m) => m?.type.name === 'mark-hanging-indent')) {
      foundHangingIndent = !isPaste;
    }
  });

  // Skip if no spacer or already has hanging-indent
  if (!foundSpacer || foundHangingIndent) return tr;

  node.content.forEach((child) => {
    let _node = child;
    counter++;
    // Remove the *first* spacer-marked text node
    if (!spacerRemoved && child.marks.some((m) => m.type.name === 'spacer')) {
      spacerRemoved = true;
      if (counter === 1) isParagraphStartsWithTab = true;
      emptyChild = child;
      return;
    }

    // Remove existing spacer marks
    const existingMarks = child.marks.filter((m) => m.type.name !== 'spacer');

    // Create hangingIndent mark
    const hangingIndentMark = state.schema.marks['mark-hanging-indent'].create({
      prefix: spacerRemoved ? 1 : 0,
    });
    if (isParagraphStartsWithTab) {
      const prefix1 = state.schema.marks['mark-hanging-indent'].create({
        prefix: 0,
      });
      const dummy1 = state.schema.text(' ', [...existingMarks, prefix1]);
      newContent.push(dummy1);
      _node = _node.mark([hangingIndentMark, ...existingMarks]);
      isParagraphStartsWithTab = false;
    } else {
      _node = _node.mark([hangingIndentMark, ...existingMarks]);
    }

    // Ensure hangingIndent is the *outermost* mark

    newContent.push(_node);
  });
  if (isParagraphStartsWithTab && newContent.length === 0) {
    const existingMarks = emptyChild.marks.filter(
      (m) => m.type.name !== 'spacer'
    );
    const prefix = state.schema.marks['mark-hanging-indent'].create({
      prefix: 0,
    });
    const dummy = state.schema.text(' ', [...existingMarks, prefix]);
    newContent.push(dummy);
    const prefix1 = state.schema.marks['mark-hanging-indent'].create({
      prefix: 1,
    });
    const dummy1 = state.schema.text(' ', [...existingMarks, prefix1]);
    newContent.push(dummy1);
  }
  if (newContent?.length === 1 && spacerRemoved) {
    const existingMarks = emptyChild.marks.filter(
      (m) => m.type.name !== 'spacer'
    );
    const prefix1 = state.schema.marks['mark-hanging-indent'].create({
      prefix: 1,
    });
    const dummy1 = state.schema.text(' ', [...existingMarks, prefix1]);
    newContent.push(dummy1);
  }
  // Recreate updated paragraph
  const newParagraph = node.type.create(node.attrs, newContent);
  tr.replaceWith(pos, pos + node.nodeSize, newParagraph);
  (tr as Transaction).setSelection(
    TextSelection.create(tr.doc, state.selection?.from)
  );

  return tr;
}
