import React from 'react';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { getCustomStyleByName, getCustomStyle } from '../customStyle.js';
import { getDetailsBullet } from '../CustomStyleNodeSpec.js';
import { PointerSurface } from '@modusoperandi/licit-ui-commands';
import type { PointerSurfaceProps } from '@modusoperandi/licit-ui-commands';
import { Icon } from './Icon.js';
import cx from 'classnames';
import { HTMLStyles } from '../StyleRuntime';
import { CustomStyleCommand } from '../CustomStyleCommand';
export class CustomStyleItem extends React.PureComponent<
  PointerSurfaceProps & {
    command: CustomStyleCommand;
    disabled?: boolean;
    dispatch: (tr: Transform) => void;
    editorState: EditorState;
    editorView?: EditorView;
    label: string;
    onClick?: (value: unknown, e: React.SyntheticEvent) => void;
    onMouseEnter?: (value: unknown, e: React.SyntheticEvent) => void;
    hasText?: boolean;
    onCommand?: () => void; //Function changed to ()=>void
    selectionClassName?: string;
  }
> {
  render(): React.ReactElement {
    const { label, hasText, ...pointerProps } = this.props;
    let text = '';
    let customStyle;
    // The numbering in custom style drop menu not showing properly
    text = ' AaBbCcDd';
    const level = this.sampleLevel(pointerProps.command._customStyle.styles);
    const hasBoldPartial = this.hasBoldPartial(
      pointerProps.command._customStyle.styles
    );
    // Style menu not showing properly for First Word Bold
    const hasBoldSentence = this.hasBoldSentence(
      pointerProps.command._customStyle.styles
    );
    // Added two divs to display Numbering and bold first word/sentece.
    const BOLD_WORD = 'AaBb  ';
    const BOLD_SENTENCE = 'AaBbCc. ';
    const styleProps = getCustomStyleByName(label);
    const className = 'czi-custom-menu-item';
    if (styleProps?.styles) {
      customStyle = getCustomStyle(styleProps.styles);
    }
    const klass = cx(className);
    return (
      <div
        className={this.props.selectionClassName}
        id="container1"
        title={label}
      >
        <div style={{ width: '140px', height: 'auto' }}>
          <PointerSurface
            {...pointerProps}
            className={klass}
            style={{ display: 'inline-block', width: '140px' }}
          >
            {label}
          </PointerSurface>
        </div>
        <div
          style={{
            display: level === '' ? 'none' : '',
            // [FS] IRAD-1410 2021-06-02
            // Issue: Number example in custom style menu box not showing properly
            marginTop: '-4px',
            fontWeight: pointerProps.command._customStyle.styles?.boldNumbering
              ? 'bold'
              : 'normal',
          }}
        >
          <PointerSurface
            {...pointerProps}
            className={klass}
            style={customStyle}
          >
            {level}
          </PointerSurface>
        </div>
        <div
          style={{
            display: pointerProps.command._customStyle.styles?.hasBullet
              ? ''
              : 'none',
            color: pointerProps.command._customStyle.styles?.bulletLevel
              ? getDetailsBullet(
                  pointerProps.command._customStyle.styles.bulletLevel
                ).color
              : '',
            marginTop: '-4px',
          }}
        >
          <PointerSurface {...pointerProps} className={klass}>
            {pointerProps.command._customStyle.styles?.bulletLevel
              ? getDetailsBullet(
                  pointerProps.command._customStyle.styles.bulletLevel
                ).symbol
              : ''}
          </PointerSurface>
        </div>
        <div
          style={{
            display: hasBoldPartial ? '' : 'none',
            // Issue: Number example along with Bold first word in custom style menu box not showing properly
            marginTop: '-4px',
            fontWeight: hasBoldPartial ? 'bold' : 'normal',
          }}
        >
          <PointerSurface
            {...pointerProps}
            className={klass}
            style={customStyle}
          >
            {hasBoldPartial && hasBoldSentence ? BOLD_SENTENCE : BOLD_WORD}
          </PointerSurface>
        </div>
        <div className="molsp-style-sampletext" style={customStyle}>
          <PointerSurface
            {...pointerProps}
            className={klass}
            style={customStyle}
          >
            {text}
          </PointerSurface>
        </div>
        <div
          className="molsp-arrow-right"
          data-cy="cyStyleEdit"
          style={{ width: '50px', display: hasText ? 'block' : 'none' }}
        >
          {/* Need to change the below icon to downarroe */}
          <PointerSurface {...pointerProps} className={klass + ' edit-icon'}>
            {Icon.get('edit')}
            {''}
          </PointerSurface>
        </div>
      </div>
    );
  }

  // To show Numbering in dropdown menu sample text
  sampleLevel(styles: HTMLStyles): string {
    let level = '';
    if (
      this.props.hasText &&
      styles &&
      (styles.hasNumbering || styles.isList)
    ) {
      for (let i = 0; i < styles.styleLevel; i++) {
        if (i === 0 && styles.prefixValue) {
          level = level + styles.prefixValue + '1.';
        } else {
          level = level + '1.';
        }
      }
    }

    if (this.props.hasText && styles?.hasBullet) {
      level = '';
    }

    return level;
  }

  hasBoldPartial(styles: HTMLStyles) {
    return !!styles?.boldPartial;
  }

  hasBoldSentence(styles: HTMLStyles) {
    return !!styles?.boldSentence;
  }
}
