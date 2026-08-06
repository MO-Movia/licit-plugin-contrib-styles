import React, { ChangeEvent, SyntheticEvent } from 'react';
import { Node } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import {
  atAnchorRight,
  createPopUp,
  PopUpHandle,
} from '@modusoperandi/licit-ui-commands';

import { DEFAULT_NORMAL_STYLE } from './Constants';
import { CustomStyleCommand, applyStyleForTableColumnCell } from './CustomStyleCommand';
import { RESERVED_STYLE_NONE } from './CustomStyleNodeSpec';
import type { Style } from './StyleRuntime';
import {
  getCachedStyles,
  getCustomStyleByName,
  getStylesAsync,
  setStyles,
} from './customStyle';
import { CustomStyleItem } from './ui/CustomStyleItem';

export const TABLE_STYLE_NAME_ATTRIBUTE = 'tableStyleName';
export const DEFAULT_TABLE_STYLE_NAME = RESERVED_STYLE_NONE;

export type OpenTableStylePickerOptions = {
  anchor: HTMLElement;
  getTablePos: () => number | null;
  onClose?: () => void;
  onSelect?: () => void;
  view: EditorView;
};

type TableAtPosition = {
  node: Node;
  pos: number;
};

type TableStylePickerProps = {
  dispatch: (tr: Transform) => void;
  editorState: EditorState;
  editorView: EditorView;
  onClose?: () => void;
  onSelectStyle: (style: Style) => void;
  selectedStyleName?: string | null;
};

type TableStylePickerState = {
  searchTerm: string;
  styles: Style[];
};

class TableStyleItemCommand extends CustomStyleCommand {
  private readonly onSelect: (style: Style) => void;

  constructor(style: Style, onSelect: (style: Style) => void) {
    super(style, style.styleName);
    this.onSelect = onSelect;
  }

  execute = (): boolean => {
    this.onSelect(this._customStyle as Style);
    return true;
  };
}

function isStylableNode(node: Node): boolean {
  return (
    node.type.name === 'paragraph' ||
    node.type.name === 'enhanced_table_figure_notes'
  );
}

function isVignetteTable(node: Node): boolean {
  return node.attrs?.vignette === true || node.attrs?.vignette === 'true';
}

function normalizeTableStyles(styles: Style[]): Style[] {
  const availableStyles = (styles || []).filter((style) => style?.styleName);
  const normalStyle = availableStyles.find(
    (style) => style.styleName === RESERVED_STYLE_NONE
  );
  const otherStyles = availableStyles.filter(
    (style) => style.styleName !== RESERVED_STYLE_NONE
  );

  return [normalStyle || DEFAULT_NORMAL_STYLE, ...otherStyles];
}

export function normalizeTableStyleName(styleName: string): string {
  return styleName === 'Default' ? RESERVED_STYLE_NONE : styleName;
}

export function findTableAtSelection(
  state: EditorState
): TableAtPosition | null {
  const { $from, $to } = state.selection;

  for (const $pos of [$from, $to]) {
    for (let depth = $pos.depth; depth > 0; depth--) {
      if ($pos.node(depth).type.name === 'table') {
        return {
          node: $pos.node(depth),
          pos: $pos.before(depth),
        };
      }
    }
  }

  return null;
}

export function applyTableStyle(
  state: EditorState,
  tr: Transform,
  tablePos: number,
  styleName: string
): Transform {
  const normalizedStyleName = normalizeTableStyleName(styleName);
  const table = tr.doc.nodeAt(tablePos);

  if (table?.type.spec.tableRole !== 'table' || isVignetteTable(table)) {
    return tr;
  }

  tr = tr.setNodeMarkup(tablePos, undefined, {
    ...table.attrs,
    [TABLE_STYLE_NAME_ATTRIBUTE]: normalizedStyleName,
  });

  const tableEnd = tablePos + table.nodeSize;
  const style = getCustomStyleByName(normalizedStyleName);

  tr.doc.nodesBetween(tablePos + 1, tableEnd - 1, (node, pos) => {
    if (!isStylableNode(node)) {
      return;
    }

    tr = tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      styleName: normalizedStyleName,
    });
    const styledNode = tr.doc.nodeAt(pos) || node;
    tr = applyStyleForTableColumnCell(
      style,
      normalizedStyleName,
      state,
      tr,
      styledNode,
      pos,
      undefined,
      false
    );
  });

  return tr;
}

export function applyStoredTableStyleAtSelection(
  state: EditorState,
  tr: Transform
): Transform {
  const table = findTableAtSelection(state);
  const styleName = table?.node.attrs?.[TABLE_STYLE_NAME_ATTRIBUTE];

  if (
    !table ||
    isVignetteTable(table.node) ||
    typeof styleName !== 'string' ||
    !styleName
  ) {
    return tr;
  }

  return applyTableStyle(state, tr, table.pos, styleName);
}

export function applyStoredTableStyles(
  state: EditorState,
  tr: Transform
): Transform {
  const tables: Array<{ pos: number; styleName: string }> = [];

  tr.doc.descendants((node, pos) => {
    const styleName = node.attrs?.[TABLE_STYLE_NAME_ATTRIBUTE];
    if (
      node.type.spec.tableRole === 'table' &&
      !isVignetteTable(node) &&
      typeof styleName === 'string' &&
      styleName
    ) {
      tables.push({ pos, styleName });
    }
  });

  for (const table of tables) {
    tr = applyTableStyle(state, tr, table.pos, table.styleName);
  }

  return tr;
}

export function openTableStylePicker({
  anchor,
  getTablePos,
  onClose,
  onSelect,
  view,
}: OpenTableStylePickerOptions): PopUpHandle | null {
  const tablePos = getTablePos();
  const table = tablePos === null ? null : view.state.doc.nodeAt(tablePos);
  if (table?.type.spec.tableRole !== 'table' || isVignetteTable(table)) {
    return null;
  }

  const picker: PopUpHandle = createPopUp(
    TableStylePicker,
    {
      dispatch: view.dispatch,
      editorState: view.state,
      editorView: view,
      onClose: () => picker.close(undefined),
      onSelectStyle: (style: Style) => {
        const currentTablePos = getTablePos();
        const currentTable =
          currentTablePos === null
            ? null
            : view.state.doc.nodeAt(currentTablePos);
        if (
          currentTable?.type.spec.tableRole !== 'table' ||
          isVignetteTable(currentTable)
        ) {
          return;
        }

        view.dispatch(
          applyTableStyle(
            view.state,
            view.state.tr,
            currentTablePos,
            style.styleName
          ) as Transaction
        );
        onSelect?.();
      },
      selectedStyleName:
        table.attrs[TABLE_STYLE_NAME_ATTRIBUTE] || RESERVED_STYLE_NONE,
    },
    {
      anchor,
      autoDismiss: true,
      IsChildDialog: true,
      onClose,
      position: atAnchorRight,
    }
  );

  return picker;
}

export class TableStylePicker extends React.PureComponent<
  TableStylePickerProps,
  TableStylePickerState
> {
  state: TableStylePickerState = {
    searchTerm: '',
    styles: normalizeTableStyles(getCachedStyles()),
  };

  componentDidMount(): void {
    Promise.resolve()
      .then(() => getStylesAsync())
      .then((styles) => {
        const hasRuntimeStyles = styles.length > 0;
        const availableStyles = normalizeTableStyles(
          hasRuntimeStyles ? styles : getCachedStyles()
        );
        if (hasRuntimeStyles) {
          setStyles(availableStyles);
        }
        this.setState({ styles: availableStyles });
      })
      .catch(console.warn);
  }

  render(): React.ReactElement {
    const searchTerm = this.state.searchTerm.trim().toLowerCase();
    const styles = this.state.styles.filter((style) =>
      style.styleName.toLowerCase().includes(searchTerm)
    );

    return (
      <div className="molsp-dropbtn">
        <div className="molsp-search-wrapper">
          <input
            aria-label="Search table styles"
            className="molsp-search-input"
            onChange={this.onSearchChange}
            onClick={this.stopPropagation}
            onContextMenu={this.stopPropagation}
            onKeyDown={this.stopPropagation}
            placeholder="Search styles"
            type="search"
            value={this.state.searchTerm}
          />
        </div>
        <div className="molsp-stylenames">
          {styles.map((style) => this.renderStyleItem(style))}
        </div>
      </div>
    );
  }

  private renderStyleItem(style: Style): React.ReactElement {
    const command = new TableStyleItemCommand(style, this.onSelectStyle);
    const selected = style.styleName === this.props.selectedStyleName;

    return (
      <CustomStyleItem
        command={command}
        dispatch={this.props.dispatch}
        editorState={this.props.editorState}
        editorView={this.props.editorView}
        hasText={true}
        key={style.styleName}
        label={style.styleName}
        onClick={this.onCommand}
        onMouseEnter={this.onCommand}
        selectionClassName={selected ? 'selectbackground' : ''}
        showStyleEditAction={false}
        value={command as unknown as Record<string, unknown>}
      />
    );
  }

  private readonly onSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    this.setState({ searchTerm: event.target.value });
  };

  private readonly stopPropagation = (
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    event.stopPropagation();
  };

  private readonly onCommand = (
    command: TableStyleItemCommand,
    event: SyntheticEvent<Element>
  ): void => {
    if (command.shouldRespondToUIEvent(event)) {
      command.execute();
    }
  };

  private readonly onSelectStyle = (style: Style): void => {
    this.props.onSelectStyle(style);
    this.props.onClose?.();
  };
}
