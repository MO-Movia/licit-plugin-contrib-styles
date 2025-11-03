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
  saveStyleSet
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
    expect(addStyleToList({} as unknown as Style)).toBeDefined();
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
});
