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
import {
  applyStoredTableStyleAtSelection,
  applyStoredTableStyles as applyAllStoredTableStyles,
  applyTableStyle as applyStyleToTable,
  openTableStylePicker as openStylePickerForTable,
  TABLE_STYLE_NAME_ATTRIBUTE,
} from './TableStyle';
import type { OpenTableStylePickerOptions } from './TableStyle';

export * from './TableStyle';

const ENTERKEYCODE = 13;
const BACKSPACEKEYCODE = 8;
const DELETEKEYCODE = 46;
const PARA_POSITION_DIFF = 4;
const ATTR_STYLE_NAME = 'styleName';
const DEFAULT_CHUNK_BUDGET_MS = 100;
const DEFAULT_CHUNK_IDLE_MS = 50;
const ZERO_WIDTH_SPACE = '\u200B';
let slice1;
let styleChunkTimer = null;
let styleChunkLastInteractionAt = 0;

export type CustomstylePluginOptions = {
  chunkBudgetMs?: number;
  chunkIdleMs?: number;
};
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
  constructor(
    runtime: StyleRuntime,
    hideNumbering?: boolean,
    options?: CustomstylePluginOptions
  ) {
    let csview = null;
    let firstTime = true;
    let loaded = false;
    const chunkBudgetMs = options?.chunkBudgetMs ?? DEFAULT_CHUNK_BUDGET_MS;
    const chunkIdleMs = options?.chunkIdleMs ?? DEFAULT_CHUNK_IDLE_MS;
    // Internal continuation position for time-based batched style application.
    // Replaces the old STYLE_CHUNK_START_POS transaction meta. When non-null,
    // appendTransaction knows it should resume style application from this pos.
    let resumePos: number | null = null;

    // Schedule the next time-based style batch. Uses setTimeout(0) to yield
    // to the browser (pending user input is processed first). During initial
    // load (no user interaction yet), batches fire ASAP. Once the user has
    // interacted, batches only fire after chunkIdleMs of idle time so active
    // editing is not interrupted.
    const scheduleNextChunk = (nextPos: number) => {
      if (!csview || typeof nextPos !== 'number') {
        return;
      }
      if (styleChunkTimer !== null) {
        clearTimeout(styleChunkTimer);
        styleChunkTimer = null;
      }
      const tick = () => {
        styleChunkTimer = null;
        if (!csview?.dispatch || csview.isDestroyed) {
          return;
        }
        // During initial load (no interaction yet), dispatch immediately.
        // Once the user has interacted, wait for chunkIdleMs of idle time
        // before dispatching so we don't block active typing/editing.
        if (
          styleChunkLastInteractionAt > 0 &&
          Date.now() - styleChunkLastInteractionAt < chunkIdleMs
        ) {
          styleChunkTimer = setTimeout(tick, chunkIdleMs) as unknown as number;
          return;
        }
        resumePos = nextPos;
        const hadFocus =
          typeof csview.hasFocus === 'function' ? csview.hasFocus() : false;
        const continuationTr = csview.state.tr.setMeta('addToHistory', false);
        csview.dispatch(continuationTr);
        if (
          hadFocus &&
          typeof csview.hasFocus === 'function' &&
          !csview.hasFocus()
        ) {
          csview.focus();
        }
      };
      // setTimeout(0) yields to the browser — any pending input events are
      // processed before the callback fires. This is the fastest practical
      // schedule that doesn't block user interaction.
      styleChunkTimer = setTimeout(tick, 0) as unknown as number;
    };

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
            styleChunkLastInteractionAt = Date.now();
            csview = view;
            return false;
          },
          mousedown(view) {
            styleChunkLastInteractionAt = Date.now();
            csview = view;
            return false;
          },
          focus(view) {
            styleChunkLastInteractionAt = Date.now();
            csview = view;
            return false;
          },
        },
        nodeViews: {},
      },
      appendTransaction: (transactions, prevState, nextState) => {
        let tr = null;
        const ref = { firstTime, loaded };
        const isChunking = resumePos !== null;
        if (!loaded || isChunking) {
          const startPos = isChunking ? resumePos : 0;
          if (isChunking) {
            resumePos = null;
          }
          tr = onInitAppendTransaction(
            ref,
            tr,
            nextState,
            startPos,
            chunkBudgetMs,
            scheduleNextChunk
          );
          if (tr?.docChanged) {
            tr.setMeta('styleInitialLoad', true);
          }
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
        return hasTransactionChanges(tr) ? tr : null;
      },
    });
  }

  initButtonCommands() {
    return {
      '[H1] Header 1': CustomstyleDropDownCommand,
    };
  }

  openTableStylePicker(options: OpenTableStylePickerOptions) {
    return openStylePickerForTable(options);
  }

  applyTableStyle(
    state: EditorState,
    tr: Transform,
    tablePos: number,
    styleName: string
  ): Transform {
    return applyStyleToTable(state, tr, tablePos, styleName);
  }

  applyStoredTableStyles(
    state: EditorState,
    tr: Transform
  ): Transform {
    return applyAllStoredTableStyles(state, tr);
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


function hasTransactionChanges(tr) {
  if (!tr) {
    return false;
  }
  return !!tr.docChanged;
}

function preserveSelectionAfterChunk(tr, selection) {
  if (!tr?.docChanged || !selection) {
    return tr;
  }
  const anchor = tr.mapping.map(selection.anchor);
  const head = tr.mapping.map(selection.head);
  try {
    return tr.setSelection(TextSelection.between(tr.doc.resolve(anchor), tr.doc.resolve(head)));
  }
  catch (_error) {
    console.info(_error);
    return tr;
  }
}

export function onInitAppendTransaction(
  ref,
  tr,
  nextState,
  startPos = 0,
  budgetMs = DEFAULT_CHUNK_BUDGET_MS,
  scheduleNext = null
) {
  ref.loaded = isStylesLoaded();
  if (ref.loaded) {
    tr ??= nextState.tr;
    const result = applyStylesTimeBatched(nextState, startPos, budgetMs);
    const chunkTr = preserveSelectionAfterChunk(result.tr, nextState.selection);

    if (!result.done && scheduleNext) {
      // Continue batched style application asynchronously so host app
      // focus/update work does not break the appendTransaction chain.
      scheduleNext(result.lastPos);
    }
    return chunkTr.docChanged ? chunkTr : null;
  }
  return hasTransactionChanges(tr) ? tr : null;
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
  const isPaste = !!transactions?.[0]?.getMeta?.('paste');
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
      tr.selection.$cursor?.pos === tr.selection.$from.start() &&
      prevState.selection.$cursor?.pos === prevState.selection.$from.start()
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
    } else if (
      // ? ADD THIS BLOCK RIGHT HERE � after the two existing else-if blocks
      ENTERKEYCODE === csview.input.lastKeyCode &&
      prevState.selection.from === nextState.selection.from - 1
    ) {
      tr = applyStoredMarksAfterHardBreak(nextState, tr);
    }
  }
  tr = removeHangingIndentOnBackspaceOrDelete(
    prevState,
    nextState,
    tr,
    getLastKeyCode(csview)
  );
  tr = applyLineStyleForBoldPartial(nextState, tr, isPaste);
  if (0 < transactions.length && isPaste) {
    let _startPos = 0;
    let _endPos = 0;
    let node2 = null;
    let demoPos = null;
    let node1 = null;
    for (let index = 0; index < slice1.content.childCount; index++) {
      if (
        !(
          slice1.content.content[index].type.name === 'table' ||
          slice1.content.content[index].type.name === 'doc'
        )
      ) {
        if (index !== 0) {
          _startPos = _endPos;
        }
        demoPos = prevState.selection.from;
        node1 = prevState.doc.resolve(demoPos).parent;
        if (index === 0) {
          _startPos = csview.state.selection.$from.before(
            csview.state.selection.$from.depth === 0
              ? 1
              : csview.state.selection.$from.depth
          );
          node2 = csview.state.tr.doc.nodeAt(_startPos);
        } else {
          node2 = csview.state.tr.doc.nodeAt(demoPos);
        }

        if (!node1.content?.content[0]?.attrs) {
          const opt = 1;
          if (node2?.type?.name === 'table') {
            const styleName =
              slice1.content.content[index].attrs.styleName ?? 'Normal';
            const node = nextState.tr.doc.nodeAt(_startPos);
            const len = node.nodeSize;
            _endPos = _startPos + len;
            tr = applyLatestStyle(
              styleName,
              nextState,
              tr,
              node,
              _startPos,
              _endPos,
              null,
              opt
            );
          } else {
            if (index === 0) {
              _startPos = csview.state.selection.from - 1;
            }
            const node = nextState.tr.doc.nodeAt(_startPos);
            //FIX: Copied text show Normal style name instead of showing the applied style in the current paragraph.
            let styleName =
              null === slice1.content.content[index]?.attrs?.styleName
                ? node?.attrs?.styleName
                : slice1.content.content[index]?.attrs?.styleName;
            styleName = styleName ?? RESERVED_STYLE_NONE;
            const len = node.nodeSize;
            _endPos = _startPos + len;
            tr = applyLatestStyle(
              styleName ?? '',
              nextState,
              tr,
              node,
              _startPos,
              _endPos - 1,
              null,
              opt
            );
            const newattrs = { ...node.attrs };
            newattrs.styleName = styleName;
            tr = tr.setNodeMarkup(_startPos, undefined, newattrs);
          }
        } else {
          if (node2.type.name === 'table') {
            const styleName = node1.attrs.styleName ?? 'Normal';
            const node = nextState.tr.doc.nodeAt(_startPos);
            const len = node.nodeSize;
            const endPos = _startPos + len;
            const styleProp = getCustomStyleByName(styleName);
            tr = applyStyleToEachNode(
              nextState,
              _startPos,
              endPos,
              tr,
              styleProp,
              styleName
            );
          } else {
            const styleName = node1.attrs.styleName ?? 'Normal';
            const node = nextState.tr.doc.nodeAt(_startPos);
            const len = node.nodeSize;
            const endPos = _startPos + len;
            const styleProp = getCustomStyleByName(styleName);
            tr = applyStyleToEachNode(
              nextState,
              _startPos,
              endPos,
              tr,
              styleProp,
              styleName
            );
          }
        }
      }
    }
    tr = tr?.scrollIntoView();
  }

  if (isPaste) {
    tr = applyStoredTableStyleAtSelection(nextState, tr ?? nextState.tr);
  }

  return hasTransactionChanges(tr) ? tr : null;
}

//LIC-254 Create new line by placing cursor at the beginning of a paragraph applies the current style instead of Normal style
export function applyStyleForPreviousEmptyParagraph(
  nextState: EditorState,
  tr: Transform
) {
  const selection = (tr as Transaction).selection;
  if (selection.$from.parentOffset === 0) {
    const previousNodeEndPos = selection.$anchor.pos - 1;
    const prevNode = nextState.doc.resolve(previousNodeEndPos).nodeBefore;
    if (prevNode) {
      const style = getCustomStyleByName(prevNode.attrs.styleName);
      const emptyParaStyleName =
        prevNode.attrs.styleName === style?.styles?.nextLineStyleName
          ? prevNode?.attrs?.styleName
          : RESERVED_STYLE_NONE;
      const previousNodeStartPos = previousNodeEndPos - prevNode.nodeSize;
      tr = applyLatestStyle(
        emptyParaStyleName,
        nextState,
        tr,
        prevNode,
        previousNodeStartPos,
        previousNodeStartPos + prevNode.content.size,
        null
      );
    }
  }
  return tr;
}

export function applyStoredMarksAfterHardBreak(
  nextState: EditorState,
  tr: Transform
): Transform {
  if (!tr) {
    tr = nextState.tr;
  }
  const { selection, schema } = nextState;

  // ? Cast to TextSelection to access $cursor
  const textSelection = selection as TextSelection;
  const currentPos = textSelection.$cursor
    ? textSelection.$cursor.pos
    : selection.$from.pos;

  // Find the parent paragraph
  const para = findParentNodeClosestToPos(
    nextState.doc.resolve(currentPos),
    (node) => node.type === schema.nodes.paragraph
  );
  if (!para) return tr;
  const styleName = para.node.attrs?.styleName;
  if (!styleName || styleName === RESERVED_STYLE_NONE) return tr;
  // Get the marks defined by this custom style
  const marks = getMarkByStyleName(styleName, schema);
  if (!marks || marks.length === 0) return tr;
  // Set them as storedMarks so next typed character inherits them
  for (const mark of marks) {
    tr = (tr as Transaction).addStoredMark(mark);
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


// Apply styles using a time-based budget. Processes nodes from startPos until
// the time budget (budgetMs) is exhausted, then returns the last processed
// position so the caller can schedule the next batch.
export function applyStylesTimeBatched(
  state: EditorState,
  startPos: number = 0,
  budgetMs: number = DEFAULT_CHUNK_BUDGET_MS
): { tr: Transform; lastPos: number; done: boolean } {
  let tr: Transform = state.tr;
  const docSize = tr.doc.content.size;
  const startTime = Date.now();
  let lastPos = startPos;
  let stopped = false;

  tr.doc.nodesBetween(startPos, docSize, (child, pos) => {
    if (stopped || pos < startPos) {
      return true;
    }
    // Check time budget after each eligible node. If exceeded, stop
    // processing — remaining nodes will be handled in the next batch.
    if (Date.now() - startTime >= budgetMs) {
      stopped = true;
      return false;
    }

    const contentLen = child.content.size;
    if (haveEligibleChildren(child, contentLen)) {
      const docLen = tr.doc.content.size;
      const end = Math.min(pos + contentLen, docLen);
      const styleName = child.attrs?.styleName ?? RESERVED_STYLE_NONE;
      tr = applyLatestStyle(styleName, state, tr, child, pos, end);
      lastPos = Math.max(lastPos, pos + child.nodeSize);
      // Don't descend into the paragraph's inline/text children —
      // applyLatestStyle already handled its content.
      return false;
    }
    return true;
  });

  const done = !stopped;
  return {
    tr,
    lastPos: done ? docSize : lastPos,
    done,
  };
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
        tr = removeResolvedHangingIndentAnchors(tr, nextState, pos);
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
        const tableStyleName = getEnclosingTableStyleName($from);
        const style = tableStyleName
          ? getTableContinuationStyle(tableStyleName)
          : getCustomStyleByName(prevParagraph.attrs.styleName);
        if (style?.styles?.nextLineStyleName) {
          // [FS] IRAD-1217 2021-02-24
          // Select style for next line not working continuously for more that 2 paragraphs
          if ($from.node(-1).type.name !== 'list_item') {
            newattrs = setNodeAttrs(
              tableStyleName ||
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
          let styleName = tableStyleName || style.styleName;
          if (!tableStyleName && $from.node(-1).type.name !== 'list_item') {
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

function getEnclosingTableStyleName($from): string | null {
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name !== 'table') {
      continue;
    }

    if (node.attrs?.vignette === true || node.attrs?.vignette === 'true') {
      return null;
    }

    const styleName = node.attrs?.[TABLE_STYLE_NAME_ATTRIBUTE];
    return typeof styleName === 'string' && styleName
      ? resetTheDefaultStyleNameToNone(styleName)
      : null;
  }

  return null;
}

function getTableContinuationStyle(styleName: string) {
  const style = getCustomStyleByName(styleName);
  return {
    ...style,
    styleName,
    styles: {
      ...style?.styles,
      nextLineStyleName: styleName,
    },
  };
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
      if (nextLineStyle.styles.indentPosition) {
        newattrs.indentPosition = nextLineStyle.styles.indentPosition;
        newattrs.hangingIndent = true;
      }
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
  const mappedPos = tr.mapping.mapResult(pos, -1).pos;

  const newContent = [];
  let spacerRemoved = false;
  let foundSpacer = false;
  let foundHangingIndent = false;
  let isParagraphStartsWithTab = false;
  let counter = 0;
  let emptyChild;
  let existingMarks = [];
  let prefix1AnchorInserted = false;
  // Scan once for spacers and existing hanging-indents
  node.content.forEach((child) => {
    if (child.marks.some(m => m?.type.name === 'spacer')) {
      foundSpacer = true;
    }
    if (child.marks.some(m => m?.type.name === 'mark-hanging-indent' && m?.attrs?.prefix === 1)) {
      foundHangingIndent = !isPaste;
    }
  });

  // Skip if no spacer or already has hanging-indent
  if (!foundSpacer || foundHangingIndent) return tr;

  node.content.forEach((child) => {
    let _node = child;
    counter++;
    // Remove the *first* spacer-marked text node
    if (!spacerRemoved && child.marks.some(m => m.type.name === 'spacer')) {
      spacerRemoved = true;
      if (counter === 1) isParagraphStartsWithTab = true;
      if (_node.text === ' ') {
        existingMarks = child.marks.filter(m => !['spacer', 'mark-hanging-indent'].includes(m.type.name));
      }
      emptyChild = child;
      return;
    }

    // Remove existing spacer marks
    if (_node.text !== ' ') {
      existingMarks = child.marks.filter(m => !['spacer', 'mark-hanging-indent'].includes(m.type.name));
    }

    // Create hangingIndent mark
    const hangingIndentMark = state.schema.marks['mark-hanging-indent'].create({
      prefix: spacerRemoved ? 1 : 0,
    });
    if (isParagraphStartsWithTab) {
      const prefix1 = state.schema.marks['mark-hanging-indent'].create({ prefix: 0 });
      const dummy1 = state.schema.text(' ', [...existingMarks, prefix1]);
      newContent.push(dummy1);
      const prefix1Marks = [hangingIndentMark, ...existingMarks];
      const prefix1Anchor = state.schema.text(ZERO_WIDTH_SPACE, prefix1Marks);
      newContent.push(prefix1Anchor);
      prefix1AnchorInserted = true;
      _node = _node.mark(prefix1Marks);
      isParagraphStartsWithTab = false;
    } else {
      const nodeMarks = [hangingIndentMark, ...existingMarks];
      if (spacerRemoved && !prefix1AnchorInserted) {
        const prefix1Anchor = state.schema.text(ZERO_WIDTH_SPACE, nodeMarks);
        newContent.push(prefix1Anchor);
        prefix1AnchorInserted = true;
      }
      _node = _node.mark(nodeMarks);

    }

    // Ensure hangingIndent is the *outermost* mark

    newContent.push(_node);
  });
  if (isParagraphStartsWithTab && newContent.length === 0) {
    existingMarks = emptyChild.marks.filter(m => !['spacer', 'mark-hanging-indent'].includes(m.type.name));
    const prefix = state.schema.marks['mark-hanging-indent'].create({ prefix: 0 });
    const dummy = state.schema.text(ZERO_WIDTH_SPACE, [...existingMarks, prefix]);
    newContent.push(dummy);
    const prefix1 = state.schema.marks['mark-hanging-indent'].create({ prefix: 1 });
    const dummy1 = state.schema.text(`${ZERO_WIDTH_SPACE}${ZERO_WIDTH_SPACE}`, [...existingMarks, prefix1]);
    newContent.push(dummy1);
  }
  if (newContent?.length === 1 && spacerRemoved) {
    if (emptyChild.text?.trim() !== '') {
      existingMarks = emptyChild.marks.filter(m => !['spacer', 'mark-hanging-indent'].includes(m.type.name));
    }
    const prefix1 = state.schema.marks['mark-hanging-indent'].create({ prefix: 1 });
    const dummy1 = state.schema.text(`${ZERO_WIDTH_SPACE}${ZERO_WIDTH_SPACE}`, [...existingMarks, prefix1]);
    newContent.push(dummy1);
  }
  // Recreate updated paragraph
  const newParagraph = node.type.create(node.attrs, newContent);
  tr.replaceWith(mappedPos, mappedPos + node.nodeSize, newParagraph);
  const prefix1Pos = getHangingIndentPrefixStartPos(
    tr.doc.nodeAt(mappedPos),
    mappedPos,
    1
  );
  const selectionPos = prefix1Pos ?? tr.mapping.mapResult(state.selection?.from, -1).pos;
  (tr as Transaction).setSelection(
    TextSelection.create(tr.doc, Math.min(selectionPos, tr.doc.content.size))
  );

  return tr;
}

function getHangingIndentPrefixStartPos(node, pos, prefix) {
  if (!node || node.type.name !== 'paragraph') {
    return null;
  }
  let offset = 0;
  let prefixPos = null;
  for (const child of getChildNodes(node)) {
    if (prefixPos !== null) {
      break;
    }
    if (hasHangingIndentPrefix(child, prefix)) {
      prefixPos =
        child.text?.startsWith(ZERO_WIDTH_SPACE)
          ? pos + 1 + offset + 1
          : pos + 1 + offset;
      break;
    }
    offset += child.nodeSize;
  }
  return prefixPos;
}

function getLastKeyCode(view) {
  const viewLastKeyCode = view?.input?.lastKeyCode;
  if (typeof viewLastKeyCode === 'number') {
    return viewLastKeyCode;
  }
  return null;
}

function getChildNodes(node) {
  return Array.from(
    { length: node.childCount },
    (_, index) => node.child(index)
  );
}

function hasHangingIndentPrefix(child, prefix) {
  return child.marks.some(
    (mark) =>
      mark.type.name === 'mark-hanging-indent' &&
      mark.attrs?.prefix === prefix
  );
}

export function removeHangingIndentOnBackspaceOrDelete(
  prevState,
  nextState,
  tr,
  lastKeyCode
) {
  if (lastKeyCode !== BACKSPACEKEYCODE && lastKeyCode !== DELETEKEYCODE) {
    return tr;
  }
  if (!prevState?.selection?.empty) {
    return tr;
  }

  const cursorPos = prevState.selection.from;
  const prevParagraph = findParentNodeClosestToPos(
    prevState.doc.resolve(cursorPos),
    (node) => node.type === prevState.schema.nodes.paragraph
  );
  if (!prevParagraph) {
    return tr;
  }

  const shouldRemoveHangingIndent =
    lastKeyCode === BACKSPACEKEYCODE
      ? isBackspaceAtPrefix1Start(
        prevParagraph.node,
        prevParagraph.pos,
        cursorPos
      )
      : isDeleteAtPrefix0EndBeforePrefix1(
        prevParagraph.node,
        prevParagraph.pos,
        cursorPos
      );

  if (!shouldRemoveHangingIndent) {
    return tr;
  }

  tr ??= nextState.tr;
  const nextCursorPos = Math.min(nextState.selection.from, tr.doc.content.size);
  const nextParagraph = findParentNodeClosestToPos(
    tr.doc.resolve(nextCursorPos),
    (node) => node.type === nextState.schema.nodes.paragraph
  );

  if (!nextParagraph) {
    return tr;
  }

  return removeHangingIndentFromParagraph(
    tr,
    nextState,
    nextParagraph.node,
    nextParagraph.pos
  );
}

function isBackspaceAtPrefix1Start(node, pos, cursorPos) {
  let offset = 0;
  for (const child of getChildNodes(node)) {
    const childStart = pos + 1 + offset;
    if (
      hasHangingIndentPrefix(child, 1) &&
      cursorPos === getEditableChildStart(child, childStart)
    ) {
      return true;
    }
    offset += child.nodeSize;
  }
  return false;
}

function getEditableChildStart(child, childStart) {
  let cursorPos = childStart;
  const text = child.text ?? '';
  while (text[cursorPos - childStart] === ZERO_WIDTH_SPACE) {
    cursorPos++;
  }
  return cursorPos;
}

function isDeleteAtPrefix0EndBeforePrefix1(node, pos, cursorPos) {
  let offset = 0;
  for (let index = 0; index < node.childCount; index++) {
    const child = node.child(index);
    const childEnd = pos + 1 + offset + child.nodeSize;
    if (
      hasHangingIndentPrefix(child, 0) &&
      cursorPos === childEnd &&
      hasAdjacentPrefix1Child(node, index)
    ) {
      return true;
    }
    offset += child.nodeSize;
  }
  return false;
}

function hasAdjacentPrefix1Child(node, index) {
  for (let nextIndex = index + 1; nextIndex < node.childCount; nextIndex++) {
    if (hasHangingIndentPrefix(node.child(nextIndex), 1)) {
      return true;
    }
  }
  return false;
}

function removeHangingIndentFromParagraph(tr, state, node, pos) {
  const mappedPos = tr.mapping.mapResult(pos, -1).pos;
  const currentNode = tr.doc.nodeAt(mappedPos);
  if (!currentNode || currentNode.type.name !== 'paragraph') {
    return tr;
  }

  const newContent = [];
  let changed = false;
  currentNode.content.forEach((child) => {
    if (!hasHangingIndentMark(child)) {
      newContent.push(child);
      return;
    }

    const marks = child.marks.filter(
      (mark) => mark.type.name !== 'mark-hanging-indent'
    );
    const text = child.text?.replaceAll(ZERO_WIDTH_SPACE, '') ?? '';
    changed = true;
    if (text.length > 0) {
      newContent.push(state.schema.text(text, marks));
    }
  });

  if (!changed) {
    return tr;
  }

  const newParagraph = currentNode.type.create(currentNode.attrs, newContent);
  tr.replaceWith(mappedPos, mappedPos + currentNode.nodeSize, newParagraph);
  const mappedSelection = Math.min(
    tr.mapping.mapResult(state.selection.from, -1).pos,
    tr.doc.content.size
  );
  return (tr as Transaction).setSelection(
    TextSelection.create(tr.doc, mappedSelection)
  );
}

function hasHangingIndentMark(child) {
  return child.marks.some(
    (mark) => mark.type.name === 'mark-hanging-indent'
  );
}

function getZeroWidthSpaceDeletePositions(text, startPos) {
  if (text.replaceAll(ZERO_WIDTH_SPACE, '').length === 0) {
    return [];
  }

  const deletePositions = [];
  for (let index = 0; index < text.length; index++) {
    if (text[index] === ZERO_WIDTH_SPACE) {
      deletePositions.push(startPos + index);
    }
  }
  return deletePositions;
}

function getResolvedHangingIndentAnchorPositions(node, mappedPos) {
  const deletePositions = [];
  let offset = 0;
  for (const child of getChildNodes(node)) {
    if (hasHangingIndentPrefix(child, 1) && child.text?.includes(ZERO_WIDTH_SPACE)) {
      deletePositions.push(
        ...getZeroWidthSpaceDeletePositions(child.text, mappedPos + 1 + offset)
      );
    }
    offset += child.nodeSize;
  }
  return deletePositions;
}

function removeResolvedHangingIndentAnchors(tr, state, pos) {
  if (!tr) {
    tr = state.tr;
  }
  const mappedPos = tr.mapping.mapResult(pos, -1).pos;
  const node = tr.doc.nodeAt(mappedPos);
  if (!node || node.type.name !== 'paragraph') {
    return tr;
  }

  const deletePositions = getResolvedHangingIndentAnchorPositions(node, mappedPos);

  if (deletePositions.length === 0) {
    return tr;
  }

  const selectionFrom = state.selection.from;
  deletePositions.sort((left, right) => right - left);
  for (const deletePos of deletePositions) {
    tr = tr.delete(deletePos, deletePos + 1);
  }

  const mappedSelection = Math.min(
    tr.mapping.mapResult(selectionFrom, -1).pos,
    tr.doc.content.size
  );
  return (tr as Transaction).setSelection(
    TextSelection.create(tr.doc, mappedSelection)
  );
}
