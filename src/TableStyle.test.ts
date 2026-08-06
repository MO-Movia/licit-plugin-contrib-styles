import { Node as ProseMirrorNode, Schema } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { tableNodes } from 'prosemirror-tables';

import {
  applyStoredTableStyleAtSelection,
  applyStoredTableStyles,
  applyTableStyle,
  DEFAULT_TABLE_STYLE_NAME,
} from './TableStyle';
import { setStyles } from './customStyle';
import { CustomstyleDropDownCommand } from './ui/CustomstyleDropDownCommand';

function createSchema(): Schema {
  const tables = tableNodes({
    cellAttributes: {},
    cellContent: 'paragraph+',
    tableGroup: 'block',
  });

  tables.table = {
    ...tables.table,
    attrs: {
      ...tables.table.attrs,
      tableStyleName: { default: DEFAULT_TABLE_STYLE_NAME },
      vignette: { default: false },
    },
  };

  return new Schema({
    nodes: {
      doc: { content: 'block+' },
      paragraph: {
        attrs: { styleName: { default: DEFAULT_TABLE_STYLE_NAME } },
        content: 'text*',
        group: 'block',
      },
      text: { group: 'inline' },
      ...tables,
    },
  });
}

function createTableDoc(
  schema: Schema,
  tableStyleName = DEFAULT_TABLE_STYLE_NAME,
  vignette = false
): ProseMirrorNode {
  const paragraph = (text: string) =>
    schema.nodes.paragraph.create(
      { styleName: DEFAULT_TABLE_STYLE_NAME },
      schema.text(text)
    );
  const cell = (text: string) =>
    schema.nodes.table_cell.create(null, paragraph(text));
  const row = schema.nodes.table_row.create(null, [cell('A'), cell('B')]);
  const table = schema.nodes.table.create(
    { tableStyleName, vignette },
    [row, row]
  );

  return schema.nodes.doc.create(null, table);
}

function paragraphStyleNames(doc: ProseMirrorNode): string[] {
  const names: string[] = [];
  doc.descendants((node) => {
    if (node.type.name === 'paragraph') {
      names.push(node.attrs.styleName);
    }
  });
  return names;
}

function stateInsideFirstCell(doc: ProseMirrorNode, schema: Schema): EditorState {
  let textPosition: number | null = null;
  doc.descendants((node, pos) => {
    if (textPosition === null && node.isText) {
      textPosition = pos;
    }
  });

  return EditorState.create({
    doc,
    schema,
    selection: TextSelection.create(doc, textPosition as number),
  });
}

describe('table styles', () => {
  const bodyTableStyle = { styleName: 'Body Table' };

  beforeEach(() => {
    setStyles([
      { styleName: DEFAULT_TABLE_STYLE_NAME },
      bodyTableStyle,
    ]);
  });

  it('stores the style on the table and applies it to every cell paragraph', () => {
    const schema = createSchema();
    const state = EditorState.create({
      doc: createTableDoc(schema),
      schema,
    });

    const tr = applyTableStyle(state, state.tr, 0, bodyTableStyle.styleName);

    expect(tr.doc.nodeAt(0)?.attrs.tableStyleName).toBe('Body Table');
    expect(paragraphStyleNames(tr.doc)).toEqual([
      'Body Table',
      'Body Table',
      'Body Table',
      'Body Table',
    ]);
  });

  it('reapplies the stored table style after paste and structural changes', () => {
    const schema = createSchema();
    const doc = createTableDoc(schema, bodyTableStyle.styleName);
    const state = stateInsideFirstCell(doc, schema);

    const pasteTr = applyStoredTableStyleAtSelection(state, state.tr);
    expect(paragraphStyleNames(pasteTr.doc)).toEqual([
      'Body Table',
      'Body Table',
      'Body Table',
      'Body Table',
    ]);

    const structureState = EditorState.create({ doc, schema });
    const structureTr = applyStoredTableStyles(
      structureState,
      structureState.tr
    );
    expect(paragraphStyleNames(structureTr.doc)).toEqual([
      'Body Table',
      'Body Table',
      'Body Table',
      'Body Table',
    ]);
  });

  it('keeps vignette tables outside whole-table styling and toolbar hiding', () => {
    const schema = createSchema();
    const vignetteDoc = createTableDoc(schema, DEFAULT_TABLE_STYLE_NAME, true);
    const vignetteState = stateInsideFirstCell(vignetteDoc, schema);
    const dropdown = new CustomstyleDropDownCommand({
      dispatch: jest.fn(),
      editorState: vignetteState,
    });

    const vignetteTr = applyTableStyle(
      vignetteState,
      vignetteState.tr,
      0,
      bodyTableStyle.styleName
    );

    expect(vignetteTr.steps).toHaveLength(0);
    expect(dropdown.isSelectionInsideTableCell(vignetteState)).toBe(false);

    const regularState = stateInsideFirstCell(createTableDoc(schema), schema);
    expect(dropdown.isSelectionInsideTableCell(regularState)).toBe(true);
  });
});
