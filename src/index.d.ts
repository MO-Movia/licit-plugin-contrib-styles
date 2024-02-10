// Type declaration file
import { Plugin, PluginKey } from 'prosemirror-state';
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
} from './customStyle.js';
import { RESERVED_STYLE_NONE } from './CustomStyleNodeSpec.js';
import { getLineSpacingValue } from '@modusoperandi/licit-ui-commands';
import { findParentNodeClosestToPos } from 'prosemirror-utils';
import { Node, Schema } from 'prosemirror-model';
import { CustomstyleDropDownCommand } from './ui/CustomstyleDropDownCommand.js';
import { applyEffectiveSchema } from './EditorSchema.js';
import type { StyleRuntime } from './StyleRuntime.js';

export class CustomstylePlugin extends Plugin {
  constructor(runtime: StyleRuntime, hideNumbering?: boolean);

  initButtonCommands();

  getEffectiveSchema(schema: Schema): Schema;
}

export function onInitAppendTransaction(ref, tr, nextState);

export function onUpdateAppendTransaction(
  ref,
  tr,
  nextState,
  prevState,
  csview,
  transactions,
  slice1
);

export function remapCounterFlags(tr);

export function manageHierarchyOnDelete(prevState, nextState, tr, view);
export function nodeAssignment(state);

export function applyStyleForEmptyParagraph(nextState, tr);

export function applyStyleForNextParagraph(prevState, nextState, tr, view);

export function resetTheDefaultStyleNameToNone(styleName);

export function setNodeAttrs(nextLineStyleName, newattrs);

export function applyNormalIfNoStyle(nextState, tr, node, opt);
