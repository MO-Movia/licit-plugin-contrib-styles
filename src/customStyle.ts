// [FS] IRAD-1085 2020-10-09
import type { Style, CSSStyle } from './StyleRuntime.js';
import { EditorView } from 'prosemirror-view';
import {
  RESERVED_STYLE_NONE,
  RESERVED_STYLE_NONE_NUMBERING,
} from './CustomStyleNodeSpec.js';
import { DEFAULT_NORMAL_STYLE } from './Constants.js';
let customStyles = new Array(0);
let styleRuntime;
let hideNumbering = false;
let _view: EditorView;
let hasdocTypechanged = false;
let docType = null;
// [FS] IRAD-1202 2021-02-15
// None & None-@#$- have same effect of None.
// None-@#$-<styleLevel> is used for numbering to set style level for None, based on the cursor level style level.
function isValidStyleName(styleName) {
  return (
    styleName &&
    !styleName.includes(RESERVED_STYLE_NONE_NUMBERING) &&
    customStyles?.length > 0
  );
}

export function addStyleToList(style: Style) {
  if (0 < customStyles.length) {
    const index = customStyles.findIndex(item => item.styleName === style.styleName);
    if (index !== -1) {
      customStyles[index] = style;
    }
    else {
      customStyles.push(style);
    }
  }
  return customStyles;
}

// [FS] IRAD-1137 2021-01-15
// check if the entered style name already exist
export function isCustomStyleExists(styleName: string) {
  let bOK = false;
  if (isValidStyleName(styleName)) {
    for (const style of customStyles) {
      // [FS] IRAD-1432 2021-07-08
      // FIX: Able to add same style name
      if (styleName.toUpperCase() === style.styleName.toUpperCase()) {
        bOK = true;
        return bOK;
      }
    }
  }
  return bOK;
}

// [FS] IRAD-1128 2020-12-30
// get a style by styleName
export function getCustomStyleByName(name: string): Style {
  let style: Style = { styleName: name };
  let has = false;
  if (isValidStyleName(name)) {
    // break the loop if find any matches
    for (let i = 0; !has && i < customStyles.length; i++) {
      if (name === customStyles[i].styleName) {
        style = customStyles[i];
        has = true;
      }
    }
  } else {
    style = DEFAULT_NORMAL_STYLE;
  }
  return style;
}

export function setView(csview : EditorView) {
  _view = csview;
}

// store styles in cache
export function setStyles(style: Style[]) {
  customStyles = style;
  let documentType;
  if (style && Array.isArray(style)) {
    documentType =
      style.length > 0 && style[0].docType ? style[0].docType : null;
  }
  hasdocTypechanged = docType !== documentType;
  docType = documentType;
  if (docType) {
    hasdocTypechanged = true;
    if (_view) {
      _view.dispatch(_view.state.tr.scrollIntoView());
      _view = null;
    }
  }
  if (style[0] === undefined || !Object.hasOwn(style[0], 'docType')) {
    hasdocTypechanged = true;
  }
  if (style && 0 === style.length) {
    saveDefaultStyle();
  }
}
export function setHidenumberingFlag(hideNumberingFlag) {
  hideNumbering = hideNumberingFlag;
}

export function getHidenumberingFlag(): boolean {
  return hideNumbering;
}

export function setStyleRuntime(runtime) {
  styleRuntime = runtime;
}

function saveDefaultStyle() {
  if (!isCustomStyleExists(RESERVED_STYLE_NONE)) {
    saveStyle(DEFAULT_NORMAL_STYLE)?.then(() => {
      /* This is intentional */
    });
  }
}

export function isStylesLoaded() {
  return customStyles?.length > 0 && hasdocTypechanged;
}

export function hasStyleRuntime() {
  return !!styleRuntime;
}
// get a style by Level
export function getCustomStyleByLevel(level: number) {
  let style = null;
  if (customStyles.length > 0) {
    for (const obj of customStyles) {
      if (
        obj.styles?.hasNumbering &&
        obj.styles.styleLevel &&
        level === Number(obj.styles.styleLevel)
      ) {
        if (null === style) {
          style = obj;
          return style;
        }
      }
    }
  }
  return style;
}

// [FS] IRAD-1238 2021-03-08
// To find the custom style exists with the given  level.
export function isPreviousLevelExists(previousLevel: number) {
  let isLevelExists = true;
  if (customStyles.length > 0 && 0 < previousLevel) {
    const value = customStyles.find((u) => {
      let retVal = false;
      if (u?.styles) {
        retVal = Number(u.styles.styleLevel) === previousLevel;
      }
      return retVal;
    });
    isLevelExists = !!value;
  }
  return isLevelExists;
}

// [FS] IRAD-1046 2020-09-24
// To create a style object from the customstyles to show the styles in the example piece.
export function getCustomStyle(customStyle) {
  const style: CSSStyle = {};

  for (const property in customStyle) {
    switch (property) {
      case 'strong':
        // [FS] IRAD-1137 2021-1-22
        // Deselected Bold, Italics and Underline are not removed from the example style near style name
        if (!customStyle.boldPartial && customStyle[property]) {
          style.fontWeight = 'bold';
        }
        break;

      case 'em':
        // [FS] IRAD-1137 2021-1-22
        // Deselected Bold, Italics and Underline are not removed from the example style near style name
        if (customStyle[property]) {
          style.fontStyle = 'italic';
        }
        break;

      case 'color':
        style.color = customStyle[property];
        break;

      case 'textHighlight':
        style.backgroundColor = customStyle[property];
        break;

      case 'fontSize':
        style.fontSize = customStyle[property];
        break;

      case 'fontName':
        style.fontName = customStyle[property];
        break;
      // [FS] IRAD-1042 2020-09-29
      // Fix:icluded strike through in custom styles.
      case 'strike':
        if (customStyle[property]) {
          style.textDecorationLine = 'line-through';
        }
        break;

      case 'super':
        style.verticalAlign = 'super';
        break;

      case 'underline':
        // [FS] IRAD-1137 2021-1-22
        // Deselected Bold, Italics and Underline are not removed from the example style near style name
        if (customStyle[property]) {
          style.textDecoration = 'underline';
        }
        break;

      case 'textAlign':
        style.textAlign = customStyle[property];
        break;

      case 'lineHeight':
        style.lineHeight = customStyle[property];
        break;

      default:
        break;
    }
  }
  return style;
}
// [FS] IRAD-1539 2021-08-02
// method to save,retrive,rename and remove style from the style server.
export function saveStyle(styleProps: Style): Promise<Style[]> {
  return styleRuntime?.saveStyle(styleProps);
}
export function getStylesAsync(): Promise<Style[]> {
  return styleRuntime.getStylesAsync();
}
export function renameStyle(
  oldName: string,
  newName: string
): Promise<Style[]> {
  return styleRuntime.renameStyle(oldName, newName);
}
export function removeStyle(styleName: string): Promise<Style[]> {
  return styleRuntime.removeStyle(styleName);
}
