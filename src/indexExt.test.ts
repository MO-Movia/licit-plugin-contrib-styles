import {
  applyStyleForEmptyParagraph,
  applyStyleForNextParagraph,
  onInitAppendTransaction,
  isDocChanged,
} from './index';
import * as customStyle from './customStyle';
import * as command from './CustomStyleCommand';
import { RESERVED_STYLE_NONE } from './CustomStyleNodeSpec';

describe('index branch coverage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('onInitAppendTransaction applies styles only when styles are loaded', () => {
    const ref = { loaded: false };
    const tr = {};
    const nextState = { tr: {} };

    jest.spyOn(customStyle, 'isStylesLoaded').mockReturnValue(false);
    expect(onInitAppendTransaction(ref, tr, nextState)).toBe(tr);
    expect(ref.loaded).toBe(false);

    jest.spyOn(customStyle, 'isStylesLoaded').mockReturnValue(true);
    jest.spyOn(command, 'applyLatestStyle').mockReturnValue({ updated: true } as never);
    const state = {
      tr: {
        doc: {
          content: { size: 10 },
          descendants(cb) {
            cb(
              { content: { size: 3 }, type: { name: 'paragraph' }, attrs: {} },
              1
            );
          },
        },
      },
    };

    const result = onInitAppendTransaction(ref, tr, state as never);
    expect(result).toBeDefined();
    expect(ref.loaded).toBe(true);
  });

  it('applyStyleForEmptyParagraph applies latest style for eligible node', () => {
    const tr = {};
    const node = {
      attrs: { styleName: 'MyStyle' },
      content: { content: [{ marks: [] }] },
    };

    const nextState = {
      selection: {
        $from: { depth: 1, before: () => 2 },
        $to: { end: () => 5 },
      },
      tr: { doc: { nodeAt: () => node } },
    };

    jest.spyOn(customStyle, 'getCustomStyleByName').mockReturnValue({ styles: {} } as never);
    const applyLatestStyleSpy = jest
      .spyOn(command, 'applyLatestStyle')
      .mockReturnValue({ changed: true } as never);

    const result = applyStyleForEmptyParagraph(nextState as never, tr as never);
    expect(result).toEqual({ changed: true });
    expect(applyLatestStyleSpy).toHaveBeenCalledWith(
      'MyStyle',
      nextState,
      tr,
      node,
      2,
      5,
      null,
      1
    );
  });

  it('applyStyleForEmptyParagraph skips style apply for list style', () => {
    const tr = {};
    const node = {
      attrs: { styleName: 'ListStyle' },
      content: { content: [{ marks: [] }] },
    };
    const nextState = {
      selection: {
        $from: { depth: 1, before: () => 2 },
        $to: { end: () => 5 },
      },
      tr: { doc: { nodeAt: () => node } },
    };

    jest
      .spyOn(customStyle, 'getCustomStyleByName')
      .mockReturnValue({ styles: { isList: true } } as never);
    const applyLatestStyleSpy = jest.spyOn(command, 'applyLatestStyle');

    const result = applyStyleForEmptyParagraph(nextState as never, tr as never);
    expect(result).toBe(tr);
    expect(applyLatestStyleSpy).not.toHaveBeenCalled();
  });

  it('applyStyleForNextParagraph returns null when not a new paragraph', () => {
    const prevState = { selection: { from: 10 } };
    const nextState = {
      selection: {
        from: 25,
        $from: {},
      },
    };
    const view = { input: { lastKeyCode: 13 } };

    const result = applyStyleForNextParagraph(
      prevState as never,
      nextState as never,
      {} as never,
      view as never
    );
    expect(result).toBeNull();
  });

  it('applyStyleForNextParagraph applies nextLineStyle and marks for paragraph', () => {
    const tr = {
      setNodeMarkup: jest.fn().mockReturnThis(),
      addStoredMark: jest.fn().mockReturnThis(),
    };
    const prevParagraph = {
      type: { name: 'paragraph' },
      attrs: { styleName: 'Heading1', indent: 1, align: 'left' },
    };
    const listNode = { isText: false, attrs: { indent: 3 } };
    const nextNode = {
      type: { name: 'paragraph' },
      content: { size: 0 },
      descendants: (cb) => cb({ type: { name: 'text' } }),
    };

    const $from = {
      depth: 1,
      node: (depth) => {
        if (depth === 0) {
          return {
            child: () => prevParagraph,
            childCount: 1,
          };
        }
        return { type: { name: 'doc' } };
      },
      index: () => 1,
    };

    const prevState = {
      selection: { from: 1 },
      doc: { nodeAt: () => listNode },
    };
    const nextState = {
      schema: {},
      selection: { from: 3, $from },
      doc: { nodeAt: () => nextNode },
    };
    const view = { input: { lastKeyCode: 13 } };

    jest.spyOn(customStyle, 'getCustomStyleByName').mockReturnValue({
      styleName: 'Heading1',
      styles: { nextLineStyleName: 'Default', isList: true, lineHeight: '1.5' },
    } as never);
    jest.spyOn(command, 'getMarkByStyleName').mockReturnValue([{} as never]);

    const result = applyStyleForNextParagraph(
      prevState as never,
      nextState as never,
      tr as never,
      view as never
    );

    expect(result).toBe(tr);
    expect(tr.setNodeMarkup).toHaveBeenCalled();
    expect(tr.addStoredMark).toHaveBeenCalled();
  });

  it('isDocChanged returns false when no transactions changed document', () => {
    expect(isDocChanged([{ docChanged: false }, { docChanged: 0 }])).toBe(false);
  });

  it('RESERVED_STYLE_NONE constant is available for branch-dependent defaults', () => {
    expect(typeof RESERVED_STYLE_NONE).toBe('string');
  });
});
