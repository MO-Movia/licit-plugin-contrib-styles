// @flow

import { Schema } from 'prosemirror-model';
import {
  toCustomStyleDOM,
  getCustomStyleAttrs,
} from './CustomStyleNodeSpec.js';
import { toMarkDOM, getMarkAttrs } from './CustomStyleMarkSpec.js';
import { STYLEKEY, PARAGRAPH } from './Constants.js';

import {
  MARKSTRONG,
  MARKEM,
  MARKTEXTCOLOR,
  MARKFONTSIZE,
  MARKFONTTYPE,
  MARKSTRIKE,
  MARKSUPER,
  MARKTEXTHIGHLIGHT,
  MARKUNDERLINE,
} from './MarkNames.js';

const ALLOWED_MARKS = [
  MARKSTRONG,
  MARKEM,
  MARKTEXTCOLOR,
  MARKFONTSIZE,
  MARKFONTTYPE,
  MARKSTRIKE,
  MARKSUPER,
  MARKTEXTHIGHLIGHT,
  MARKUNDERLINE,
];
const ATTR_OVERRIDDEN = 'overridden';
const NEWATTRS = [ATTR_OVERRIDDEN];
const SPEC = 'spec';
const NODES = 'nodes';
const CONTENT = 'content';
const GETATTRS = 'getAttrs';
const PARSEDOM = 'parseDOM';
const TODOM = 'toDOM';

export function effectiveSchema(schema: Schema) {
  if (schema?.[SPEC]) {
    createStyleNodeAttributes(schema);
    createNewAttributes(schema);
  }
  return schema;
}

function createAttribute(content, key, value) {
  if (content) {
    const attr = content.attrs && Object.keys(content.attrs)[0];
    let styleAttrSpec = content.attrs[key];
    if (attr && content.attrs && !styleAttrSpec) {
      const contentAttr = content.attrs[attr];
      styleAttrSpec = Object.assign(
        Object.create(Object.getPrototypeOf(contentAttr)),
        contentAttr
      );
      styleAttrSpec.default = value;
      content.attrs[key] = styleAttrSpec;
    }
  }
}

function getContent(type, schema: Schema, nodeAttrs, toDOM) {
  let content = null;
  const contentArr = schema[SPEC][NODES][CONTENT];
  const len = contentArr.length;

  // check even index to find the content type name
  for (let i = 0; i < len; i += 2) {
    if (type === contentArr[i]) {
      // found, so get the actual content which is in the next index.
      content = contentArr[i + 1];

      // set custom handling of this plugin
      // [FS] IRAD-1177 2021-02-04
      // Always append to base calls.
      content[PARSEDOM][0][GETATTRS] = nodeAttrs.bind(
        null,
        content[PARSEDOM][0][GETATTRS]
      );
      content[TODOM] = toDOM.bind(null, content[TODOM]);

      break;
    }
  }

  return content;
}

function createStyleNodeAttributes(schema: Schema) {
  // Paragraph Style attribute
  const paragraphContent = getContent(
    PARAGRAPH,
    schema,
    getCustomStyleAttrs,
    toCustomStyleDOM
  );

  const contentArr = [paragraphContent, schema.nodes.paragraph];

  contentArr.forEach((content) => {
    createAttribute(content, STYLEKEY, null);
  });
}

function getAnExistingAttribute(schema) {
  let existingAttr = null;
  existingAttr = schema['marks']['link']['attrs']['href'];
  return existingAttr;
}
function getMarkContent(type, schema, nodeAttrs, toDOM) {
  let content = null;
  const contentArr = schema[SPEC]['marks']['content'];
  const len = contentArr.length;
  // check even index to find the content type name
  for (let i = 0; i < len; i += 2) {
    if (type == contentArr[i]) {
      // found, so get the actual content which is in the next index.
      content = contentArr[i + 1];
      // Always append to base calls.
      if (!content[PARSEDOM][0][GETATTRS]) {
        if (MARKSTRONG === type) {
          content[PARSEDOM][0].getAttrs = (node) =>
            node.style.fontWeight != 'normal' && null;
        } else if (MARKEM === type) {
          content[PARSEDOM][0].getAttrs = (node) =>
            node.style.fontStyle === 'italic' && null;
        }
      }
      content[PARSEDOM][0][GETATTRS] = nodeAttrs.bind(
        null,
        content[PARSEDOM][0][GETATTRS]
      );
      content[TODOM] = toDOM.bind(null, content[TODOM]);
    }
  }
  return content;
}
function getRequiredMarks(marks, markName, schema) {
  const mark = getMarkContent(markName, schema, getMarkAttrs, toMarkDOM);
  if (mark) {
    marks.push(mark);
    marks.push(schema[SPEC]['marks'][markName]);
  }
}
function createMarkAttributes(mark, existingAttr) {
  if (mark) {
    const requiredAttrs = [...NEWATTRS];
    requiredAttrs.forEach((key) => {
      if (!mark.attrs) {
        mark['attrs'] = {};
      }
      if (mark.attrs) {
        let newAttr = mark.attrs[key];
        if (!newAttr) {
          if (existingAttr) {
            newAttr = Object.assign(
              Object.create(Object.getPrototypeOf(existingAttr)),
              existingAttr
            );
            newAttr.default = false;
          } else {
            newAttr = {};
            newAttr.hasDefault = true;
            newAttr.default = false;
          }
          mark.attrs[key] = newAttr;
        }
      }
    });
  }
}
function createNewAttributes(schema) {
  const marks = [];
  const existingAttr = getAnExistingAttribute(schema);
  ALLOWED_MARKS.forEach((name) => {
    getRequiredMarks(marks, name, schema);
  });
  for (let i = 0, name = ''; i < marks.length; i++) {
    if (i < marks.length - 1) {
      // even items are content.
      // odd items are marks.
      // Hence name is available only in the node.
      if (0 === i % 2) {
        const mark = marks[i + 1];
        if (mark) {
          name = mark.name;
        }
      }
    } else {
      name = '';
    }
    createMarkAttributes(marks[i], name, existingAttr);
  }
  return schema;
}
export const applyEffectiveSchema = effectiveSchema;
