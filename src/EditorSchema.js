// @flow

import { Schema } from 'prosemirror-model';
import {
  toCustomStyleDOM,
  getCustomStyleAttrs,
} from './CustomStyleNodeSpec';
import {
  STYLEKEY,
  PARAGRAPH,
} from './Constants';


const SPEC = 'spec';
const NODES = 'nodes';
const CONTENT = 'content';
const GETATTRS = 'getAttrs';
const PARSEDOM = 'parseDOM';
const TODOM = 'toDOM';
const ALIGN = 'align';

export function effectiveSchema(schema: Schema) {
  if (schema && schema[SPEC]) {
    createStyleNodeAttributes(schema);
  }
  return schema;
}

function createAttribute(content, attr, key, value) {
  if (content) {
    let styleAttrSpec = content.attrs[key];
    if (content.attrs && !styleAttrSpec) {
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

  const contentArr = [
    paragraphContent,
    schema.nodes.paragraph,
  ];

  contentArr.forEach((content) => {
    createAttribute(content, ALIGN, STYLEKEY, null);
  });
}

export const applyEffectiveSchema = effectiveSchema;
