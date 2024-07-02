// [FS] IRAD-1048 2020-09-24
// UI for Custom Style edit
//Need to change the button binding implementation
import React from 'react';
import './custom-style-edit.css';
import {
  atViewportCenter,
  ColorEditor,
  createPopUp,
  getLineSpacingValue,
} from '@modusoperandi/licit-ui-commands';
import {
  isCustomStyleExists,
  setStyles,
  saveStyle,
  getStylesAsync,
} from '../customStyle.js';
import {
  RESERVED_STYLE_NONE,
  getDetailsBullet,
  BULLET_POINTS,
} from '../CustomStyleNodeSpec.js';
import type { Style } from '../StyleRuntime.js';
import { AlertInfo } from './AlertInfo.js';

let customStyles: Style[] = [];
const otherStyleSelected = false;
const editedStyles = [];

const FONT_PT_SIZES = [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 90];

const FONT_TYPE_NAMES = [
  // SERIF
  'Aclonica',
  'Acme',
  'Alegreya',
  'Arial',
  //'Arial',//??? - Commented out fonts that are not available to download using https://fonts.googleapis.com/css?family=
  'Arial Black',
  'Georgia',
  'Tahoma',
  'Times New Roman',
  'Times',
  'Verdana',
  // MONOSPACE
  'Courier New',
  //'Lucida Console',//???
  //'Monaco',//???
  //'monospace',//???
];

// Values to show in Linespacing drop-down
const LINE_SPACE = ['Single', '1.15', '1.5', 'Double'];
// Values to show in numbering/indent drop-down
const LEVEL_VALUES = [
  'None',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
];

const SAMPLE_TEXT = `Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample.
Sample Text Sample Text Sample Text Sample Text Sample Text`;
// eslint-disable-next-line
export class CustomStyleEditor extends React.PureComponent<any, any> {
  _popUp = null;

  constructor(props) {
    super(props);
    this.state = {
      ...props,
      toc: false,
      isHidden: false,
      otherStyleSelected,
      customStyles,
    };
    // set default values for text alignment and boldNumbering checkbox.
    if (!this.state.styles.align) {
      this.state.styles.align = 'left';
    }
    if (0 === this.state.mode) {
      this.state.styles.boldNumbering = true;
      this.state.styles.toc = false;
      this.state.styles.isHidden = false;
      this.state.styles.boldSentence = true;
      this.state.styles.nextLineStyleName = RESERVED_STYLE_NONE;
    }
    if (!this.state.styles.fontName) {
      this.state.styles.fontName = 'Arial';
    }
    if (!this.state.styles.fontSize) {
      this.state.styles.fontSize = '11';
    }
    this.getCustomStyles();
  }

  // To set the selected style values
  onStyleClick(style: string, event) {
    let state = null;
    switch (style) {
      // simple toggles where style matches the key to change.
      case 'strong':
      case 'em':
      case 'strike':
      case 'super':
      case 'underline':
        // copy the current style values, and flip the matching value
        state = { styles: { ...this.state.styles } };
        if (state.styles[style] === true) {
          state.styles[style] = undefined;
        } else {
          state.styles[style] = !state.styles[style];
        }

        break;

      case 'name':
        if (event) {
          const oldName = this.state.styleName;
          const newName = event.target.value;
          state = { styleName: newName, styles: null };
          state.styles = { ...this.state.styles };
          if (this.state.styles.nextLineStyleName === oldName) {
            // Update next line style as well.
            state.styles.nextLineStyleName = newName;
          }
        }
        break;

      case 'description':
        if (event) {
          state = { description: event.target.value };
        }
        break;

      // [FS] IRAD-1497 2021-06-30
      // Not able to set paragraph spacing before and after.
      case 'before':
        if (event) {
          state = {
            styles: {
              ...this.state.styles,
              paragraphSpacingBefore: event.target.value,
            },
          };
        }
        break;
      case 'after':
        if (event) {
          state = {
            styles: {
              ...this.state.styles,
              paragraphSpacingAfter: event.target.value,
            },
          };
        }
        break;
      default:
        break;
    }

    // save changes and update
    if (state) {
      this.setState(state, () => this.buildStyle());
    }
  }

  // Build styles to display the example piece
  buildStyle() {
    const style: React.CSSProperties = {};
    if (this.state.styles.fontName) {
      style.fontFamily = this.state.styles.fontName;
    }
    if (this.state.styles.fontSize) {
      style.fontSize = `${this.state.styles.fontSize}px`;
    }
    if (this.state.styles.strong) {
      style.fontWeight = 'bold';
    }
    if (this.state.styles.color) {
      style.color = this.state.styles.color;
    }
    if (this.state.styles.underline) {
      style.textDecoration =
        undefined !== style.textDecoration
          ? `${style.textDecoration}${' underline'}`
          : 'underline';
    }
    if (this.state.styles.strike) {
      style.textDecoration =
        undefined !== style.textDecoration
          ? `${style.textDecoration}${' line-through'}`
          : 'line-through';
    }
    if (this.state.styles.em) {
      style.fontStyle = 'italic';
    }
    if (this.state.styles.textHighlight) {
      style.backgroundColor = this.state.styles.textHighlight;
    }
    if (this.state.styles.align) {
      style.textAlign = this.state.styles.align;
    }
    if (this.state.styles.lineHeight) {
      // [FS] IRAD-1104 2020-11-13
      // Issue fix : Linespacing Double and Single not applied in the sample text paragraph
      style.lineHeight = getLineSpacingValue(this.state.styles.lineHeight);
    }
    // [FS] IRAD-1111 2020-12-10
    // Issue fix : Paragraph space before is not applied in the sample text.
    if (this.state.styles.paragraphSpacingBefore) {
      style.marginTop = `${this.state.styles.paragraphSpacingBefore}px`;
    }
    // [FS] IRAD-1111 2020-12-10
    // Issue fix : Paragraph space after is not applied in the sample text.
    if (this.state.styles.paragraphSpacingAfter) {
      style.marginBottom = `${this.state.styles.paragraphSpacingAfter}px`;
    }
    // [FS] IRAD-1111 2020-12-10
    // Issue fix : Indent is not applied in the sample text.
    if (!this.state.styles.isLevelbased) {
      if (this.state.styles.indent) {
        style.marginLeft = `${parseInt(this.state.styles.indent) * 2}px`;
      }
    } else {
      const levelValue = document?.getElementById('levelValue');
      if (
        // this covers null & undefined
        levelValue instanceof window.HTMLSelectElement &&
        levelValue.value
      ) {
        style.marginLeft = `${parseInt(levelValue.value) * 2}px`;
      }
    }

    const sampleDiv = document.getElementById('sampletextdiv');
    if (sampleDiv) {
      // [FS] IRAD-1394 2021-06-02
      // Issue: numbering sample not working when select Bold first sentence
      let textSample = SAMPLE_TEXT;
      if (this.state.styles.boldPartial) {
        if (this.state.styles.boldSentence) {
          const content = SAMPLE_TEXT.split('.');
          sampleDiv.innerHTML = `<strong>${content[0]}</strong> ${content[1]}`;
        } else {
          const content = SAMPLE_TEXT.split(' ');
          sampleDiv.innerHTML = `<strong>${content[0]}</strong> ${SAMPLE_TEXT}`;
        }
        textSample = sampleDiv.innerHTML;
        // [FS] IRAD-1473 2021-06-30
        // Style Example not showing properly when select Bold and Bold First Sentence
        style.fontWeight = 'normal';
      }
      if (
        this.state.styles.styleLevel &&
        (this.state.styles.hasNumbering || this.state.styles.isList)
      ) {
        // [FS] IRAD-1137 2021-01-11
        // Issue fix : The Preview text is not showing the numbering in bold after Bold Numbering is enabled.
        const sampleDiv = document.getElementById('sampletextdiv');
        if (sampleDiv) {
          if (this.state.styles.boldNumbering) {
            sampleDiv.innerHTML = `<strong>${this.getNumberingLevel(
              this.state.styles.styleLevel,
              this.state.styles.prefixValue
            )}</strong>${textSample}`;
          } else {
            sampleDiv.innerText = `${this.getNumberingLevel(
              this.state.styles.styleLevel,
              this.state.styles.prefixValue
            )}${textSample}`;
          }
        }
      } else {
        sampleDiv.innerText = `${SAMPLE_TEXT}`;
        sampleDiv.innerHTML = textSample;
      }

      if (this.state.styles.styleLevel && this.state.styles.hasBullet) {
        const bulletDetails = getDetailsBullet(this.state.styles.bulletLevel);
        sampleDiv.innerHTML = `<strong style=color:${bulletDetails.color}>${bulletDetails.symbol}</strong>${textSample}`;
      }
    }
    return style;
  }
  // [FS] IRAD-1111 2020-12-10
  // get the numbering corresponding to the level
  getNumberingLevel(level: string | number, prefixValue: string | number) {
    let levelStyle = '';
    for (let i = 0; i < parseInt(`${level}`); i++) {
      if (i === 0 && prefixValue) {
        levelStyle = levelStyle + prefixValue + '1.';
      } else {
        levelStyle = levelStyle + '1.';
      }
    }
    return levelStyle + ' ';
  }

  // handles font name change
  onFontNameChange(e) {
    this.setState(prevState => ({
      styles: { ...prevState.styles, fontName: e.target.value }
    }));
  }

  // handles indent radio button event

  onIndentRadioChanged(e) {
    this.setState(prevState => ({
      styles: { ...prevState.styles, isLevelbased: e.target.value === '0' }
    }));
  }




  // handles scentece bold event
  onScentenceRadioChanged(e) {
    this.setState(prevState => ({
      styles: { ...prevState.styles, boldSentence: e.target.value === '0' }
    }));
  }


  // handles font size change
  onFontSizeChange(e) {
    this.setState(prevState => ({
      styles: { ...prevState.styles, fontSize: e.target.value }
    }));
  }


  // handles line space  change
  onLineSpaceChange(e) {
    this.setState(prevState=>({
      styles: { ...prevState.styles, lineHeight: e.target.value },
    }));
  }


  // handles Level drop down change
  onLevelChange(e) {
    let isCheckboxDisabled;
    const val = RESERVED_STYLE_NONE === e.target.value ? null : e.target.value;
    if (val === 'None') {
      isCheckboxDisabled = true;
    }
    const prevStates = this.state.styles;

    this.setState({
      styles: {
        ...prevStates,
        styleLevel: val,
        hasNumbering: isCheckboxDisabled
          ? false
          : prevStates.hasNumbering,
        hasBullet: isCheckboxDisabled ? false : prevStates.hasBullet,
      },
    });
  }

  // handles Bullet Level drop down change
  onBulletLevelChange(e) {
    this.setState({
      styles: { ...this.state.styles, bulletLevel: e.target.value },
    });
  }

  // handles the bullet checkbox actions
  handleBulletPoints(val) {
    this.setState({
      styles: {
        ...this.state.styles,
        hasBullet: val.target.checked,
        bulletLevel: this.state.styles.bulletLevel
          ? this.state.styles.bulletLevel
          : '25CF',
        hasNumbering: val.target.checked
          ? false
          : this.state.styles.hasNumbering,
        nextLineStyleName: val.target.checked
          ? this.state.styleName
          : RESERVED_STYLE_NONE,
      },
    });
  }



  // handles indent dropdown change
  onIndentChange(e) {
    this.setState({
      styles: {
        ...this.state.styles,
        indent: 'None' === e.target.value ? 0 : e.target.value,
      },
    });
  }

  // [FS] IRAD-1201 2021-02-18
  // set the nextLineStyle to JSON on style selection changed
  onOtherStyleSelectionChanged(e) {
    if (this.state.otherStyleSelected) {
      this.setState({
        styles: { ...this.state.styles, nextLineStyleName: e.target.value },
      });
    }
  }

  // [FS] IRAD-1201 2021-02-18
  // set the nextLineStyle to JSON according to the selected option
  onNextLineStyleSelected(selectedOption: number) {
    const hiddenDiv = document.getElementById('nextStyle');
    if (hiddenDiv) {
      hiddenDiv.style.display = 'none';
    }
    if (0 === selectedOption) {
      this.setState({
        otherStyleSelected: false,
      });
      this.setState({
        styles: {
          ...this.state.styles,
          nextLineStyleName: RESERVED_STYLE_NONE,
        },
      });
    } else if (1 === selectedOption) {
      this.setState({
        otherStyleSelected: false,
      });
      this.setState({
        styles: {
          ...this.state.styles,
          nextLineStyleName: this.state.styleName,
        },
      });
    } else {
      if (hiddenDiv) {
        hiddenDiv.style.display = 'block';
      }
      const selectedStyle = document.getElementById('nextStyleValue');
      if (selectedStyle instanceof window.HTMLSelectElement) {
        this.setState({
          otherStyleSelected: true,
          styles: {
            ...this.state.styles,
            nextLineStyleName:
              selectedStyle.options[selectedStyle.selectedIndex].text,
          },
        });
      }
    }
  }

  // [FS] IRAD-1127 2020-12-31
  // to populate the selected custom styles.
  onSelectCustomStyle(e) {
    if (null !== customStyles) {
      const value = customStyles.find((u) => u.styleName === e.target.value);
      // FIX: not able to modify and save the populated style
      value.mode = 3;
      this.state = {
        ...value,
      };
      this.setState(this.state);
      this.setNextLineStyle(this.state.styles.nextLineStyleName);
    }
  }

  // shows color dialog based on input text-color/text-heighlight
  showColorDialog(isTextColor: boolean, event: React.SyntheticEvent) {
    const anchor = event ? event.currentTarget : null;
    const hex = null;
    this._popUp = createPopUp(
      ColorEditor,
      { hex },
      {
        anchor,
        autoDismiss: true,
        IsChildDialog: true,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            if (undefined !== val) {
              if (isTextColor) {
                this.setState({ styles: { ...this.state.styles, color: val } });
              } else {
                this.setState({
                  styles: { ...this.state.styles, textHighlight: val },
                });
              }
            }
          }
        },
      }
    );
  }

  //handles the option button click, close the popup with selected values
  onAlignButtonClick(val: string) {
    this.setState({ styles: { ...this.state.styles, align: val } });
  }

  handleNumbering(val) {
    // if user select numbering, then always set nextLineStyle as continues this style.
    // [FS] IRAD-1221 2021-03-01
    // Issue fix: The next line style not switch back to RESERVED_STYLE_NONE when disable the numbering.
    this.setState({
      styles: {
        ...this.state.styles,
        hasNumbering: val.target.checked,
        hasBullet: val.target.checked ? false : this.state.styles.hasBullet,
        nextLineStyleName: val.target.checked
          ? this.state.styleName
          : RESERVED_STYLE_NONE,
      },
    });
  }

  // handles the boldNumbering checkbox actions
  handleBoldNumbering(val) {
    this.setState({
      styles: { ...this.state.styles, boldNumbering: val.target.checked },
    });
  }

  // handles the boldNumbering checkbox actions
  handleBoldPartial(val) {
    this.setState({
      styles: { ...this.state.styles, boldPartial: val.target.checked },
    });
  }

  handleTOC(val) {
    this.setState({
      styles: { ...this.state.styles, toc: val.target.checked },
    });
  }

  handleList(val) {
    //edit mode
    if (
      this.state.mode > 0 &&
      this.isCustomStyleAlreadyApplied() &&
      false === val.target.checked
    ) {
      this.showAlert();
    } else {
      this.setState({
        styles: {
          ...this.state.styles,
          styleLevel: 1,
          isList: val.target.checked,
          nextLineStyleName: val.target.checked
            ? this.state.styleName
            : RESERVED_STYLE_NONE,
        },
      });
    }
  }

  handlePrefix(val) {
    //edit mode
    this.setState({
      styles: {
        ...this.state.styles,
        prefixValue: val.target.value,
      },
    });
  }

  isCustomStyleAlreadyApplied() {
    let found = false;
    const { doc } = this.state.editorView.state;
    doc.nodesBetween(0, doc.nodeSize - 2, (node) => {
      if (node.content?.content?.length) {
        if (!found && node.attrs.styleName === this.state.styleName) {
          found = true;
        }
      }
    });
    return found;
  }

  showAlert() {
    const anchor = null;
    this._popUp = createPopUp(
      AlertInfo,
      {
        content:
          'This style already used in the document,uncheck list-style will breaks the heirarchy.',
        title: 'Modify Style Alert!!!',
      },
      {
        anchor,
        position: atViewportCenter,
        onClose: () => {
          if (this._popUp) {
            this._popUp = null;
            this.setState({
              styles: {
                ...this.state.styles,
                styleLevel: 1,
                isList: true,
              },
            });
          }
        },
      }
    );
  }

  // [FS] IRAD-1201 2021-02-17
  // to check if the "select style" option selected by user
  selectStyleCheckboxState() {
    let chceked = false;
    if (this.state.styles.nextLineStyleName) {
      chceked =
        this.state.styles.nextLineStyleName !== RESERVED_STYLE_NONE &&
        this.state.styles.nextLineStyleName !== this.state.styleName;
    }
    return chceked;
  }

  componentDidMount() {
    const acc = document.getElementsByClassName('molsp-licit-accordion');
    let i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener('click', function () {
        this.classList.toggle('molsp-accactive');
        const panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    }
    const mp = document.getElementsByClassName('molsp-panel')[0] as HTMLElement;
    mp.style.maxHeight = mp.scrollHeight + 'px';
    const mp1 = document.getElementsByClassName(
      'molsp-panel1'
    )[0] as HTMLElement;
    mp1.style.maxHeight = mp1.scrollHeight + 'px';
    const mp2 = document.getElementsByClassName(
      'molsp-panel2'
    )[0] as HTMLElement;
    mp2.style.maxHeight = mp2.scrollHeight + 'px';
    const mp3 = document.getElementsByClassName(
      'molsp-panel3'
    )[0] as HTMLElement;
    mp3.style.maxHeight = mp3.scrollHeight + 'px';

    this.setNextLineStyle(this.state.styles.nextLineStyleName);
    // [FS] IRAD-1153 2021-02-25
    // Numbering level not showing in Preview text when modify style
    if (
      1 === this.props.mode &&
      this.state.styles.styleLevel &&
      this.state.styles.hasNumbering
    ) {
      this.buildStyle();
    }
  }

  // eslint-disable-next-line
  render(): JSX.Element {
    return (
      <div className="molsp-customedit-div">
        <div className="molsp-customedit-head">
          <span>{this.state.mode === 0 ? 'Create Style' : 'Edit Style'}</span>
        </div>
        <div className="molsp-customedit-body">
          <div className="molsp-sectiondiv">
            <div
              style={
                3 > this.props.mode ? { display: 'none' } : { display: 'block' }
              }
            >
              <p className="molsp-formp">Styles:</p>
              <select
                className="molsp-stylenameinput molsp-fontstyle"
                defaultValue={'DEFAULT'}
                onChange={this.onSelectCustomStyle.bind(this)}
                style={{ height: '24px' }}
              >
                <option disabled value="DEFAULT">
                  {' '}
                  -- select a style --{' '}
                </option>
                {this.state.customStyles.map((style) => (
                  <option key={style.styleName} value={style.styleName}>
                    {style.styleName}
                  </option>
                ))}
              </select>
            </div>
            <p className="molsp-formp">
              Style Name:{' '}
              <span id="errormsg" style={{ display: 'none', color: 'red' }}>
                {isCustomStyleExists(this.state.styleName)
                  ? 'Style name already exists'
                  : ''}
              </span>
            </p>
            <span>
              <input data-cy="cyStyleName"
                autoFocus
                className="molsp-stylenameinput molsp-fontstyle"
                disabled={
                  this.state.mode === 1 || this.state.mode === 3
                }
                id="txtName"
                key="name"
                onChange={this.onStyleClick.bind(this, 'name')}
                type="text"
                value={this.state.styleName || ''}
              />
            </span>
            <p className="molsp-formp">Description:</p>
            <span>
              <input
                className="molsp-stylenameinput molsp-fontstyle"
                key="description"
                onChange={this.onStyleClick.bind(this, 'description')}
                type="text"
                value={this.state.description || ''}
              />
            </span>

            <p className="molsp-formp">Preview:</p>
            <div
              className="molsp-textareadiv"
              style={
                3 === this.props.mode
                  ? { height: '164px' }
                  : { height: '215px' }
              }
            >
              <div className="molsp-sampletext">
                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                Paragraph Paragraph Paragraph Paragraph
              </div>
              <div
                className={
                  this.state.styles.super
                    ? 'molsp-hide-sampletext'
                    : 'molsp-visible-sampletext'
                }
                id="sampletextdiv"
                style={this.buildStyle()}
              >
                {SAMPLE_TEXT}
              </div>
              <sup
                className={
                  this.state.styles.super
                    ? 'molsp-visible-sampletext'
                    : 'molsp-hide-sampletext'
                }
                id="mo-sup"
                style={this.buildStyle()}
              >
                {SAMPLE_TEXT}
              </sup>
              <div className="molsp-sampletext">
                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                Paragraph Paragraph
              </div>
            </div>
          </div>

          <div
            className="molsp-sectiondiv molsp-editorsection"
            style={this.disableRename()}
          >
            <p className="molsp-formp">Style Attributes:</p>
            <div
              style={{
                height: '329px',
                overflow: 'hidden auto',
                overflowX: 'hidden',
                border: '1px solid',
              }}
            >
              <button
                className="molsp-licit-accordion molsp-accactive"
                id="accordion1"
              >
                <div className="molsp-indentdiv">
                  <span
                    className="molsp-iconspan czi-icon text_format"
                    style={{ marginTop: '1px' }}
                  >
                    text_format
                  </span>
                  <label
                    style={{
                      marginLeft: '-10px',
                      marginTop: '2px',
                      color: '#444',
                    }}
                  >
                    Font
                  </label>
                </div>
              </button>
              <div className="molsp-panel" style={{ marginBottom: '5px' }}>
                <div className="molsp-sectiondiv">
                  <select
                    data-cy="cyStyleFont"
                    className="molsp-fonttype molsp-fontstyle"
                    onChange={this.onFontNameChange.bind(this)}
                    value={this.state.styles.fontName || 'Arial'}
                  >
                    {FONT_TYPE_NAMES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <select
                    data-cy="cyStyleFontSize"
                    className="molsp-fontsize molsp-fontstyle"
                    onChange={this.onFontSizeChange.bind(this)}
                    value={this.state.styles.fontSize || 11}
                  >
                    {FONT_PT_SIZES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="molsp-font-buttons">
                  <span
                    aria-label=" Bold"
                    className="czi-tooltip-surface molsp-markbutton-container"
                    data-tooltip=" Bold"
                    id="86ba3aa0-ff11-11ea-930a-95c69ca4f97f"
                    onClick={this.onStyleClick.bind(this, 'strong')}
                    role="tooltip"
                    style={{ marginLeft: '5px', marginRight: '5px' }}
                  >
                    <button
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.strong
                          ? 'czi-custom-button use-icon active molsp-markbuttons'
                          : 'czi-custom-button use-icon molsp-markbuttons'
                      }
                    >
                      <span data-cy="cyStyleBold" className="molsp-iconspan czi-icon format_bold editor-markbuttons">
                        format_bold
                      </span>
                    </button>
                  </span>
                  <span
                    aria-label=" Italic"
                    className="czi-tooltip-surface molsp-fontstyle molsp-markbutton-container"
                    data-tooltip=" Italic"
                    id="86ba61b0-ff11-11ea-930a-95c69ca4f97f"
                    onClick={this.onStyleClick.bind(this, 'em')}
                    role="tooltip"
                  >
                    <button
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.em
                          ? 'czi-custom-button use-icon active molsp-markbuttons'
                          : 'czi-custom-button use-icon molsp-markbuttons'
                      }
                    >
                      <span className="molsp-iconspan czi-icon format_italic editor-markbuttons">
                        format_italic
                      </span>
                      <span> </span>
                    </button>
                  </span>
                  <span
                    aria-label=" Underline"
                    className="czi-tooltip-surface molsp-fontstyle molsp-markbutton-container"
                    data-tooltip=" Underline"
                    id="86ba88c0-ff11-11ea-930a-95c69ca4f97f"
                    onClick={this.onStyleClick.bind(this, 'underline')}
                    role="tooltip"
                  >
                    <button
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.underline
                          ? 'czi-custom-button use-icon active molsp-markbuttons'
                          : 'czi-custom-button use-icon molsp-markbuttons'
                      }
                    >
                      <span className="molsp-iconspan czi-icon  format_underline editor-markbuttons">
                        format_underline
                      </span>
                      <span> </span>
                    </button>
                  </span>
                  <span
                    aria-label=" Text color"
                    className="czi-tooltip-surface molsp-fontstyle molsp-markbutton-container"
                    data-tooltip=" Text color"
                    id="86bad6e1-ff11-11ea-930a-95c69ca4f97f"
                    onClick={this.showColorDialog.bind(this, true)}
                    role="tooltip"
                  >
                    <button
                      aria-disabled="false"
                      aria-pressed="false"
                      className="czi-custom-button use-icon molsp-markbuttons"
                    >
                      <span
                        className="molsp-iconspan czi-icon format_color_text editor-markbuttons"
                        style={{
                          color:
                            this.state.styles.color !== 'rgba(0,0,0,0)'
                              ? this.state.styles.color
                              : '#666',
                        }}
                      >
                        format_color_text
                      </span>
                      <span> </span>
                    </button>
                  </span>
                  <span
                    aria-label=" Highlight color"
                    className="czi-tooltip-surface molsp-fontstyle molsp-markbutton-container"
                    data-tooltip=" Highlight color"
                    id="86bafdf0-ff11-11ea-930a-95c69ca4f97f"
                    onClick={this.showColorDialog.bind(this, false)}
                    role="tooltip"
                  >
                    <button
                      aria-disabled="false"
                      aria-pressed="false"
                      className="czi-custom-button use-icon molsp-markbuttons"
                    >
                      <span
                        className="molsp-iconspan czi-icon border_color editor-markbuttons"
                        style={{
                          color:
                            this.state.styles.textHighlight !== 'rgba(0,0,0,0)'
                              ? this.state.styles.textHighlight
                              : '#666',
                        }}
                      >
                        border_color
                      </span>
                      <span> </span>
                    </button>
                  </span>
                </div>

                <div className="molsp-formp molsp-hierarchydiv">
                  <span style={{ float: 'left' }}>
                    <label>
                      <input
                        checked={this.state.styles.boldPartial}
                        onChange={this.handleBoldPartial.bind(this)}
                        type="checkbox"
                      />Bold the
                    </label>
                  </span>
                  <span>
                    <input
                      checked={this.state.styles.boldSentence}
                      disabled={!this.state.styles.boldPartial}
                      name="boldscentence"
                      onChange={this.onScentenceRadioChanged.bind(this)}
                      style={{ marginLeft: '21px' }}
                      type="radio"
                      value="0"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      First Sentence
                    </label>
                    <input
                      checked={!this.state.styles.boldSentence}
                      disabled={!this.state.styles.boldPartial}
                      name="boldscentence"
                      onChange={this.onScentenceRadioChanged.bind(this)}
                      style={{ marginLeft: '21px' }}
                      type="radio"
                      value="1"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      First Word
                    </label>
                  </span>
                </div>
                <div>
                  <span style={{ float: 'left', marginTop: '3px' }}>
                    <label style={{ fontSize: '12px', color: '#464343' }}>
                      <input
                        data-cy="cyStyleTOC"
                        checked={this.state.styles.toc}
                        onChange={this.handleTOC.bind(this)}
                        type="checkbox"
                      />TOC
                    </label>
                  </span>
                </div>
              </div>
              <button className="molsp-licit-accordion molsp-accactive">
                <div className="molsp-indentdiv">
                  <span
                    className="molsp-iconspan czi-icon format_textdirection_l_to_r"
                    style={{ marginTop: '1px' }}
                  >
                    format_textdirection_l_to_r
                  </span>
                  <label
                    style={{
                      marginLeft: '-10px',
                      marginTop: '2px',
                      color: '#444',
                    }}
                  >
                    Paragraph
                  </label>
                </div>
              </button>
              <div className="molsp-panel1">
                <p className="molsp-formp">Alignment:</p>
                <div className="molsp-czi-custom-buttons">
                  <span
                    aria-label=" Align Left"
                    className="czi-tooltip-surface"
                    data-tooltip=" Align Left"
                    id="86ba3aa0-ff11-11ea-930a-95c69ca4f97f"
                    role="tooltip"
                  >
                    <button
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.align === 'left'
                          ? 'czi-custom-button use-icon molsp-activealignbuttons'
                          : 'czi-custom-button molsp-alignbuttons'
                      }
                      onClick={this.onAlignButtonClick.bind(this, 'left')}
                    >
                      <span className="molsp-iconspan czi-icon format_align_left">
                        format_align_left
                      </span>
                    </button>
                  </span>
                  <span
                    aria-label=" Align Center"
                    className="czi-tooltip-surface molsp-alignbuttons"
                    data-tooltip=" Align Center"
                    id="86ba61b0-ff11-11ea-930a-95c69ca4f97f"
                    role="tooltip"
                  >
                    <button
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.align === 'center'
                          ? 'czi-custom-button use-icon molsp-activealignbuttons'
                          : 'czi-custom-button  molsp-alignbuttons'
                      }
                      onClick={this.onAlignButtonClick.bind(this, 'center')}
                    >
                      <span className="molsp-iconspan czi-icon format_align_center">
                        format_align_center
                      </span>
                    </button>
                  </span>
                  <span
                    aria-label=" Align Right"
                    className="czi-tooltip-surface molsp-alignbuttons"
                    data-tooltip=" Align Right"
                    id="86ba88c0-ff11-11ea-930a-95c69ca4f97f"
                    role="tooltip"
                  >
                    <button
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.align === 'right'
                          ? 'czi-custom-button use-icon molsp-activealignbuttons'
                          : 'czi-custom-button  molsp-alignbuttons'
                      }
                      onClick={this.onAlignButtonClick.bind(this, 'right')}
                    >
                      <span className="molsp-iconspan czi-icon format_align_right">
                        format_align_right
                      </span>
                    </button>
                  </span>
                  <span
                    aria-label=" Justify"
                    className="czi-tooltip-surface molsp-alignbuttons"
                    data-tooltip=" Justify"
                    id="86baafd0-ff11-11ea-930a-95c69ca4f97f"
                    role="tooltip"
                  >
                    <button
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.align === 'justify'
                          ? 'czi-custom-button use-icon molsp-activealignbuttons'
                          : 'czi-custom-button  molsp-alignbuttons'
                      }
                      onClick={this.onAlignButtonClick.bind(this, 'justify')}
                    >
                      <span className="molsp-iconspan czi-icon format_align_justify">
                        format_align_justify
                      </span>
                    </button>
                  </span>
                </div>
                <p className="molsp-formp">Line Spacing:</p>
                <select
                  className="molsp-linespacing molsp-fontstyle"
                  onChange={this.onLineSpaceChange.bind(this)}
                  value={this.state.styles.lineHeight || ''}
                >
                  {LINE_SPACE.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <p className="molsp-formp">Paragraph Spacing:</p>

                <div className="molsp-spacingdiv">
                  <label>Before: </label>
                  <span>
                    <input
                      data-cy="cyStyleBeforeSpace"
                      className="molsp-spacinginput molsp-fontstyle"
                      key="before"
                      onChange={this.onStyleClick.bind(this, 'before')}
                      type="text"
                      value={this.state.styles.paragraphSpacingBefore || ''}
                    />
                  </span>
                  <label style={{ marginLeft: '3px' }}> pts</label>

                  <label style={{ marginLeft: '23px' }}>After: </label>
                  <span>
                    <input
                      data-cy="cyStyleAfterSpace"
                      className="molsp-spacinginput molsp-fontstyle"
                      key="after"
                      onChange={this.onStyleClick.bind(this, 'after')}
                      type="text"
                      value={this.state.styles.paragraphSpacingAfter || ''}
                    />
                  </span>
                  <label style={{ marginLeft: '3px' }}>pts</label>
                </div>
              </div>
              <button className="molsp-licit-accordion molsp-accactive">
                <div className="molsp-indentdiv">
                  <span className="molsp-iconspan czi-icon account_tree">
                    account_tree
                  </span>
                  <label
                    style={{
                      marginLeft: '-7px',
                      marginTop: '2px',
                      color: '#444',
                    }}
                  >
                    Hierarchy
                  </label>
                </div>
              </button>
              <div
                className="molsp-panel2 molsp-formp"
                style={{ maxHeight: '100%' }}
              >
                {this.state.styles.hasNumbering || this.state.styles.isList ? (
                  <div
                    className="molsp-hierarchydiv"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginLeft: '-1px',
                    }}
                  >
                    <p className="molsp-formp" style={{ margin: '0' }}>
                      Prefix:
                    </p>
                    <div
                      className="molsp-hierarchydiv"
                      style={{ textAlign: 'right' }}
                    >
                      <input
                        onChange={this.handlePrefix.bind(this)}
                        style={{ width: '48px' }}
                        type="text"
                        value={this.state.styles.prefixValue}
                      />
                    </div>
                    <div
                      className="molsp-hierarchydiv"
                      style={{ textAlign: 'right' }}
                    >
                      <label>
                        <input
                          checked={this.state.styles.isList}
                          onChange={this.handleList.bind(this)}
                          type="checkbox"
                        />List-style
                      </label>
                    </div>
                  </div>
                ) : (
                  <div
                    className="molsp-hierarchydiv"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginLeft: '-1px',
                    }}
                  >
                    <div
                      className="molsp-hierarchydiv"
                      style={{ textAlign: 'right' }}
                    >
                      <label>
                        <input
                          checked={this.state.styles.isList}
                          onChange={this.handleList.bind(this)}
                          type="checkbox"
                        />List-style
                      </label>
                    </div>
                  </div>
                )}
                <div className="molsp-hierarchydiv" style={{ display: 'flex' }}>
                  <p className="molsp-formp" style={{ margin: '0' }}>
                    Level:
                  </p>
                  <div
                    style={{
                      float: 'left',
                      marginTop: '19px',
                      marginLeft: '-42px',
                    }}
                  >
                    <select
                      data-cy="cyStyleLevel"
                      className="molsp-leveltype molsp-fontstyle"
                      disabled={this.state.styles.isList === true}
                      id="levelValue"
                      onChange={this.onLevelChange.bind(this)}
                      value={this.state.styles.styleLevel || ''}
                    >
                      {LEVEL_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>
                      <input
                        checked={this.state.styles.hasNumbering}
                        className="molsp-chknumbering"
                        disabled={
                          this.state.styles.styleLevel === 'None' ||
                          this.state.styles.styleLevel === undefined ||
                          (this.state.styles.styleLevel === 1 &&
                            this.state.styles.isList === true)
                        }
                        onChange={this.handleNumbering.bind(this)}
                        type="checkbox"
                      />Numbering(1.1)
                    </label>
                    <label>
                      <input
                        checked={this.state.styles.boldNumbering}
                        className="molsp-chkboldnumbering"
                        disabled={this.checkCondition(
                          this.state.styles.hasNumbering
                        )}
                        onChange={this.handleBoldNumbering.bind(this)}
                        type="checkbox"
                      />Bold numbering
                    </label>
                    <label>
                      <input
                        checked={this.state.styles.hasBullet}
                        className="molsp-chknumbering"
                        disabled={
                          this.state.styles.styleLevel === 'None' ||
                          this.state.styles.styleLevel === undefined ||
                          (this.state.styles.styleLevel === 1 &&
                            this.state.styles.isList === true)
                        }
                        onChange={this.handleBulletPoints.bind(this)}
                        type="checkbox"
                      />
                      Bullet{' '}
                      <span>
                        <select
                          className="molsp-fontstyle"
                          disabled={this.checkCondition(
                            this.state.styles.hasBullet
                          )}
                          id="bulletValue"
                          onChange={this.onBulletLevelChange.bind(this)}
                          style={{ textAlign: 'center' }}
                          value={this.state.styles.bulletLevel || ''}
                        >
                          {BULLET_POINTS.map((value) => (
                            <option
                              key={value.key}
                              style={{ color: value.color }}
                              value={value.key}
                            >
                              <span>{value.symbol}</span>
                            </option>
                          ))}
                        </select>
                      </span>
                    </label>
                  </div>
                </div>
                <p className="molsp-formp">Indenting:</p>
                <div className="molsp-hierarchydiv">
                  <div className="molsp-indentdiv">
                    <input
                      checked={this.state.styles.isLevelbased}
                      disabled={this.state.styles.isList === true}
                      name="indenting"
                      onChange={this.onIndentRadioChanged.bind(this)}
                      type="radio"
                      value="0"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      Based On Level
                    </label>
                  </div>
                  <div className="molsp-indentdiv">
                    <input
                      checked={!this.state.styles.isLevelbased}
                      disabled={this.state.styles.isList === true}
                      name="indenting"
                      onChange={this.onIndentRadioChanged.bind(this)}
                      type="radio"
                      value="1"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      Specified
                    </label>
                    <span>
                      <select
                        data-cy="cyStyleIndent"
                        className="molsp-leveltype molsp-specifiedindent molsp-fontstyle"
                        disabled={this.state.styles.isList === true}
                        onChange={this.onIndentChange.bind(this)}
                        style={{ width: '99px !important' }}
                        value={this.state.styles.indent || ''}
                      >
                        {LEVEL_VALUES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </span>
                  </div>
                </div>
              </div>

              <button className="molsp-licit-accordion molsp-accactive">
                <div className="molsp-indentdiv">
                  <label
                    style={{
                      marginLeft: '-7px',
                      marginTop: '2px',
                      color: '#444',
                    }}
                  >
                    Style Settings
                  </label>
                </div>
              </button>

              <div className="molsp-panel3 molsp-formp">
                <p className="molsp-formp">Select style for next line:</p>
                <div className="molsp-hierarchydiv">
                  <div className="molsp-settingsdiv">
                    <input
                      checked={
                        this.state.styles.nextLineStyleName ===
                        this.state.styleName && !this.state.otherStyleSelected
                      }
                      name="nextlinestyle"
                      onChange={this.onNextLineStyleSelected.bind(this, 1)}
                      style={{
                        marginLeft: '10px',
                      }}
                      type="radio"
                      value="1"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      Continue this style
                    </label>
                  </div>
                  <div className="molsp-settingsdiv">
                    <input
                      checked={
                        this.state.styles.nextLineStyleName ===
                        RESERVED_STYLE_NONE
                      }
                      disabled={this.state.styles.isList === true}
                      name="nextlinestyle"
                      onChange={this.onNextLineStyleSelected.bind(this, 0)}
                      style={{
                        marginLeft: '10px',
                      }}
                      type="radio"
                      value="2"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      None
                    </label>
                  </div>
                  <div className="molsp-indentdiv">
                    <input
                      checked={this.state.otherStyleSelected}
                      disabled={this.state.styles.isList === true}
                      name="nextlinestyle"
                      onChange={this.onNextLineStyleSelected.bind(this, 2)}
                      style={{
                        marginLeft: '9px',
                      }}
                      type="radio"
                      value="0"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                        width: '62px',
                      }}
                    >
                      Select style
                    </label>
                    <span id="nextStyle" style={{ display: 'none' }}>
                      <select
                        className="molsp-fontstyle molsp-stylenameinput"
                        disabled={this.state.styles.isList === true}
                        id="nextStyleValue"
                        onChange={this.onOtherStyleSelectionChanged.bind(this)}
                        style={{
                          height: '20px',
                          marginLeft: '7px',
                          width: '97px',
                        }}
                        value={this.state.styles.nextLineStyleName}
                      >
                        {customStyles.map((style) => (
                          <option key={style.styleName}>
                            {style.styleName}
                          </option>
                        ))}
                      </select>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="molsp-btns">
          <button data-cy="cyStyleCancel" className="molsp-buttonstyle" onClick={this._cancel}>
            {this.state.mode === 3 ? 'Close' : 'Cancel'}
          </button>
          <button
            data-cy="cyStyleSave"
            className="molsp-btnsave molsp-buttonstyle"
            onClick={this._save.bind(this)}
            onKeyDown={this.handleKeyDown}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  _cancel = (): void => {
    // [FS] IRAD-1231 2021-03-02
    // FIX: edited custom styles not applied to the document
    if (3 === this.state.mode) {
      this.setState({
        customstyles: [],
      });
      // eslint-disable-next-line
      const { customStyles, ...newState } = this.state;
      // Update the state with the new state object
      this.setState(newState);
      this.props.close(editedStyles);
    } else {
      this.props.close();
    }
  };

  _save = (): void => {
    // eslint-disable-next-line
    const { otherStyleSelected, ...newState } = this.state;
    // Update the state with the new state object
    this.setState(newState);
    // [FS] IRAD-1137 2021-01-15
    // FIX: able to save a custom style name with already exist style name
    if (0 === this.state.mode && isCustomStyleExists(this.state.styleName)) {
      const errMsg = document.getElementById('errormsg');
      if (errMsg?.style) {
        errMsg.style.display = '';
      }

      // [FS] IRAD-1176 2021-02-08
      // save the custom styles from Edit all option.
    } else if (3 === this.state.mode) {
      this.modifyCustomStyle(this.state);
      editedStyles.push(this.state.styleName);
    } else if ('' !== this.state.styleName){
        // eslint-disable-next-line
        const { customStyles, ...newState } = this.state;
        // Update the state with the new state object
        this.setState(newState);
        this.props.close(newState);
    }
  };

  handleKeyDown = (): void => {
    const txtName = document.getElementById('txtName');
    if (txtName) {
      txtName.focus();
    }
  };
  // [FS] IRAD-1176 2021-02-08
  // save the custom styles from Edit all option.
  modifyCustomStyle(val) {
    delete val.editorView;
    const styleObj = {
      styleName: val.styleName,
      mode: val.mode,
      description: val.description,
      styles: val.styles,
    };
    saveStyle(styleObj).then((result) => {
      setStyles(result);
    });
  }

  // To fetch the custom styles from server and set to the state.
  getCustomStyles() {
    getStylesAsync().then((result) => {
      customStyles = result;
      // [FS] IRAD-1222 2021-03-01
      // Issue fix: In edit all, the style list not showing the first time.
      this.setState({
        customStyles: result,
      });
    });
  }

  // [FS] IRAD-1231 2021-03-03
  // Issue fix: Selected style for next line not retaining when modify.
  setNextLineStyle(nextLineStyleName: string) {
    // [FS] IRAD-1241 2021-03-05
    // The selcted Style in the Next line setting not retaing in Edit All and modify
    let display = '';

    if (
      0 < this.props.mode &&
      nextLineStyleName &&
      RESERVED_STYLE_NONE !== nextLineStyleName &&
      nextLineStyleName !== this.state.styleName
    ) {
      this.setState({
        otherStyleSelected: true,
      });

      display = 'block';
      const selectedStyle = document.getElementById('nextStyleValue');
      if (selectedStyle instanceof window.HTMLSelectElement) {
        selectedStyle.value = nextLineStyleName;
      }
    } else {
      this.setState({
        otherStyleSelected: false,
      });

      display = 'none';
    }

    const hiddenDiv = document.getElementById('nextStyle');
    if (hiddenDiv?.style) {
      hiddenDiv.style.display = display;
      hiddenDiv.style.marginBottom = '-7px';
    }
  }

  // Disable the style attribute div on Rename
  disableRename(): React.CSSProperties {
    const style: React.CSSProperties = {};
    if (2 === this.state.mode) {
      style.opacity = 0.4;
      style.pointerEvents = 'none';
    }

    return style;
  }

  checkCondition(mainCondition: boolean) {
    return (
      !mainCondition ||
      this.state.styles.styleLevel === 'None' ||
      this.state.styles.styleLevel === undefined ||
      (this.state.styles.styleLevel === 1 && this.state.styles.isList === true)
    );
  }
}
