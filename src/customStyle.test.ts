import { EditorView } from 'prosemirror-view';
import {
  isPreviousLevelExists,
  setStyles,
  isStylesLoaded,
  hasStyleRuntime,
  getCustomStyle,
  saveStyle,
  setStyleRuntime,
  renameStyle,
  removeStyle,
  addStyleToList,
  setView,
  saveStyleSet,
  getCustomStyleByName,
  registerStyleCacheInvalidator,
  invalidateStyleCache,
} from './customStyle';
import type { Style } from './StyleRuntime';

describe('customstyle', () => {
  it('should handle isPreviousLevelExists', () => {
    setStyles([{ styleName: '', styles: { styleLevel: 2 } }]);
    expect(isPreviousLevelExists(2)).toBeTruthy();
  });
  it('should handle isPreviousLevelExists when customStyles.length=0', () => {
    setStyles([]);
    expect(isPreviousLevelExists(2)).toBeTruthy();
  });
  it('should handle isPreviousLevelExists when customStyles does not have styles', () => {
    setStyles([{ styleName: '' }]);
    expect(isPreviousLevelExists(2)).toBeFalsy();
  });
  it('should handle isStylesLoaded', () => {
    const test = isStylesLoaded();
    expect(test).toBeDefined();
  });
  it('should handle isStylesLoaded', () => {
    const test = hasStyleRuntime();
    expect(test).toBeFalsy();
  });
  it('should handle getCustomStyle', () => {
    const cstyle = {
      strong: {},
      boldPartial: true,
      em: null,
      strike: null,
      textAlign: {},
      underline: null,
    };
    const test = getCustomStyle(cstyle);
    expect(test).toBeDefined();
  });
  it('should handle saveStyle', () => {
    setStyleRuntime({
      saveStyle: () => {
        return null;
      },
    });
    expect(saveStyle({} as unknown as Style)).toBeDefined();
  });
  it('should handle saveStyle', () => {
    setStyleRuntime({
      renameStyle: () => {
        return null;
      },
    });
    expect(renameStyle('old', 'new')).toBeDefined();
  });
  it('should handle saveStyle', () => {
    setStyleRuntime({
      removeStyle: () => {
        return null;
      },
    });
    expect(removeStyle('newStyle')).toBeDefined();
  });
  it('should handle saveStyleSet', () => {
    setStyleRuntime({
      saveStyleSet: () => {
        return null;
      },
    });
    expect(saveStyleSet([{ styleName: 'Heading11', description: 'Bold heading' } as unknown as Style])).toBeDefined();
  });

  it('should handle addStyleToList', () => {
    setStyleRuntime({
      removeStyle: () => {
        return null;
      },
    });
    expect(addStyleToList({} as unknown as Style)).toStrictEqual([
      { styleName: '' },
      {},
    ]);
  });
  it('should handle setStyles', () => {
    setView({
      dispatch: () => { },
      state: { tr: { scrollIntoView: () => { } } },
    } as unknown as EditorView);
    expect(
      setStyles([
        { styleName: 'Normal', docType: 'asd', styles: { strong: true, styleLevel: 2 } },
      ])
    ).toBeUndefined();
  });

  it('should return cached style from getCustomStyleByName', () => {
    setStyleRuntime({ saveStyle: () => null, getStylesAsync: () => Promise.resolve([]) });
    setStyles([
      { styleName: 'MyStyle', styles: { strong: true } } as unknown as Style,
    ]);
    const result = getCustomStyleByName('MyStyle');
    expect(result.styleName).toBe('MyStyle');
  });

  it('should return DEFAULT_NORMAL_STYLE from getCustomStyleByName for valid name not in map', () => {
    setStyleRuntime({ saveStyle: () => null, getStylesAsync: () => Promise.resolve([]) });
    setStyles([
      { styleName: 'OtherStyle', styles: { strong: true } } as unknown as Style,
    ]);
    const result = getCustomStyleByName('NonExistent');
    expect(result.styleName).toBe('Normal');
  });

  it('should update an existing style in addStyleToList', () => {
    setStyleRuntime({ saveStyle: () => null, getStylesAsync: () => Promise.resolve([]) });
    setStyles([
      { styleName: 'Existing', styles: { strong: true } } as unknown as Style,
    ]);
    const updated = { styleName: 'Existing', styles: { strong: false } } as unknown as Style;
    const result = addStyleToList(updated);
    expect(result.find((s) => s.styleName === 'Existing')?.styles?.strong).toBe(false);
  });

  it('should register and invoke cache invalidator callbacks', () => {
    setStyleRuntime({ saveStyle: () => null, getStylesAsync: () => Promise.resolve([]) });
    const cb = jest.fn();
    const unregister = registerStyleCacheInvalidator(cb);
    setStyles([
      { styleName: 'StyleForInvalidation', styles: {} } as unknown as Style,
    ]);
    expect(cb).toHaveBeenCalled();
    unregister();
    cb.mockClear();
    setStyles([
      { styleName: 'AfterUnregister', styles: {} } as unknown as Style,
    ]);
    expect(cb).not.toHaveBeenCalled();
  });

  it('should invoke invalidateStyleCache directly', () => {
    const cb = jest.fn();
    registerStyleCacheInvalidator(cb);
    invalidateStyleCache();
    expect(cb).toHaveBeenCalled();
  });
});
