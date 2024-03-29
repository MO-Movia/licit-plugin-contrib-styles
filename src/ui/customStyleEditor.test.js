import { CustomStyleEditor } from './CustomStyleEditor';
import * as customstyle from '../customStyle';
describe('CustomStyleEditor', () => {
  jest.spyOn(customstyle, 'getStylesAsync').mockResolvedValue([]);
  const customstyleeditor = new CustomStyleEditor({
    styles: {
      align: 'left',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'none',
      fontName: 'Arial',
      fontSize: 11,
    },
    mode: 0,
  });
  customstyleeditor.state = {
    styles: {
      align: 'left',
      boldNumbering: true,
      toc: false,
      isHidden: false,
      boldSentence: true,
      nextLineStyleName: 'A Apply Stylefff',
      fontName: 'Arial',
      fontSize: 11,
      strong: false,
    },
    mode: 0,
    styleName: 'A Apply Stylefff',
    otherStyleSelected: '',
  };
  it('should be defined', () => {
    expect(customstyleeditor).toBeDefined();
  });
  it('should handle componentWillUnmount', () => {
    customstyleeditor.componentWillUnmount();
    expect(customstyleeditor._unmounted).toBe(true);
  });
  it('should handle onStyleClick when style = strong', () => {
    expect(
      customstyleeditor.onStyleClick('strong', new Event('click'))
    ).toBeUndefined();
  });
  it('should handle onStyleClick when style = name', () => {
    const event = { target: { value: 'A Apply Stylefff-new' } };
    expect(customstyleeditor.onStyleClick('name', event)).toBeUndefined();
  });
  it('should handle onStyleClick when style = name and event null', () => {
    expect(customstyleeditor.onStyleClick('name', null)).toBeUndefined();
  });
  it('should handle onStyleClick when style = name and this.state.styles.nextLineStyleName != oldName', () => {
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: '',
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 0,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
    };
    const event = { target: { value: 'A Apply Stylefff-new' } };
    expect(customstyleeditor.onStyleClick('name', event)).toBeUndefined();
  });
  it('should handle onStyleClick when style = description', () => {
    const event = { target: { value: 'description' } };
    expect(
      customstyleeditor.onStyleClick('description', event)
    ).toBeUndefined();
  });
  it('should handle onStyleClick when style = description and event null', () => {
    expect(customstyleeditor.onStyleClick('description', null)).toBeUndefined();
  });
  it('should handle onStyleClick when style = before', () => {
    const event = { target: { value: 'before' } };
    expect(customstyleeditor.onStyleClick('before', event)).toBeUndefined();
  });
  it('should handle onStyleClick when style = before when event null', () => {
    expect(customstyleeditor.onStyleClick('before', null)).toBeUndefined();
  });
  it('should handle onStyleClick when style = after', () => {
    const event = { target: { value: 'after' } };
    expect(customstyleeditor.onStyleClick('after', event)).toBeUndefined();
  });
  it('should handle onStyleClick when style = after when event null', () => {
    expect(customstyleeditor.onStyleClick('after', null)).toBeUndefined();
  });
  it('should handle onStyleClick when style = default', () => {
    const event = { target: { value: '' } };
    expect(customstyleeditor.onStyleClick('', event)).toBeUndefined();
  });
  it('should handle getNumberingLevel', () => {
    expect(customstyleeditor.getNumberingLevel('2')).toBe('1.1. ');
  });

  it('should handle onFontNameChange', () => {
    const event = { target: { value: 'Tahoma' } };
    expect(customstyleeditor.onFontNameChange(event)).toBeUndefined();
  });
  it('should handle onIndentRadioChanged', () => {
    const event = { target: { value: '0' } };
    expect(customstyleeditor.onIndentRadioChanged(event)).toBeUndefined();
    const event1 = { target: { value: '' } };
    expect(customstyleeditor.onIndentRadioChanged(event1)).toBeUndefined();
  });
  it('should handle onScentenceRadioChanged', () => {
    const event = { target: { value: '0' } };
    expect(customstyleeditor.onScentenceRadioChanged(event)).toBeUndefined();
    const event1 = { target: { value: '' } };
    expect(customstyleeditor.onScentenceRadioChanged(event1)).toBeUndefined();
  });
  it('should handle onFontSizeChange', () => {
    const event = { target: { value: '' } };
    expect(customstyleeditor.onFontSizeChange(event)).toBeUndefined();
  });
  it('should handle onLineSpaceChange', () => {
    const event = { target: { value: '' } };
    expect(customstyleeditor.onLineSpaceChange(event)).toBeUndefined();
  });
  it('should handle onLevelChange', () => {
    const event = { target: { value: '' } };
    expect(customstyleeditor.onLevelChange(event)).toBeUndefined();
  });
  it('should handle onLevelChange when event target value Normal', () => {
    const event = { target: { value: 'Normal' } };
    expect(customstyleeditor.onLevelChange(event)).toBeUndefined();
  });
  it('should handle onBulletLevelChange', () => {
    const event = { target: { value: '' } };
    expect(customstyleeditor.onBulletLevelChange(event)).toBeUndefined();
  });
  it('should handle handleBulletPoints', () => {
    const event = { target: { value: '', checked: true } };
    expect(customstyleeditor.handleBulletPoints(event)).toBeUndefined();
  });
  it('should handle handleBulletPoints when bulletLvel:true', () => {
    const event = { target: { value: '', checked: false } };
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        bulletLevel: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: '',
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 0,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
    };
    expect(customstyleeditor.handleBulletPoints(event)).toBeUndefined();
  });
  it('should handle onIndentChange', () => {
    const event = { target: { value: '', checked: true } };
    expect(customstyleeditor.onIndentChange(event)).toBeUndefined();
  });
  it('should handle onIndentChange whene.target.value = none', () => {
    const event = { target: { value: 'None', checked: true } };
    expect(customstyleeditor.onIndentChange(event)).toBeUndefined();
  });
  it('should handle onOtherStyleSelectionChanged', () => {
    const event = { target: { value: '', checked: true } };
    expect(
      customstyleeditor.onOtherStyleSelectionChanged(event)
    ).toBeUndefined();
  });
  it('should handle onOtherStyleSelectionChanged when this.state.otherStyleSelected', () => {
    const event = { target: { value: '', checked: true } };
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        bulletLevel: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: '',
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 0,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: true,
    };
    expect(
      customstyleeditor.onOtherStyleSelectionChanged(event)
    ).toBeUndefined();
  });
  it('should handle handleNumbering', () => {
    const event = { target: { value: '', checked: true } };
    expect(customstyleeditor.handleNumbering(event)).toBeUndefined();
  });
  it('should handle handleNumbering when val.check = false', () => {
    const event = { target: { value: '', checked: false } };
    expect(customstyleeditor.handleNumbering(event)).toBeUndefined();
  });
  it('should handle handleBoldNumbering', () => {
    const event = { target: { value: '', checked: true } };
    expect(customstyleeditor.handleBoldNumbering(event)).toBeUndefined();
  });
  it('should handle handleBoldPartial', () => {
    const event = { target: { value: '', checked: true } };
    expect(customstyleeditor.handleBoldPartial(event)).toBeUndefined();
  });
  it('should handle handleTOC', () => {
    const event = { target: { value: '', checked: true } };
    expect(customstyleeditor.handleTOC(event)).toBeUndefined();
  });
  it('should handle selectStyleCheckboxState', () => {
    expect(customstyleeditor.selectStyleCheckboxState()).toBe(false);
  });
  it('should handle selectStyleCheckboxState', () => {
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        bulletLevel: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: true,
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 0,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: true,
    };
    expect(customstyleeditor.selectStyleCheckboxState()).toBe(true);
  });
  it('should handle _save ', () => {
    customstyleeditor.props = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
      },
      mode: 0,
      close: () => {},
    };
    expect(customstyleeditor._save()).toBeUndefined();
  });
  it('should handle _save when there is errMsg ', () => {
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        bulletLevel: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: true,
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 0,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: true,
    };
    jest.spyOn(customstyle, 'isCustomStyleExists').mockReturnValue(true);
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    customstyleeditor.props = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
      },
      mode: 0,
      close: () => {},
    };
    expect(customstyleeditor._save()).toBeUndefined();
  });
  it('should handle _save when there is errMsg when styleName is empty string', () => {
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        bulletLevel: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: true,
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 2,
      styleName: '',
      otherStyleSelected: true,
    };
    jest.spyOn(customstyle, 'isCustomStyleExists').mockReturnValue(true);
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    customstyleeditor.props = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
      },
      mode: 2,
      close: () => {},
    };
    expect(customstyleeditor._save()).toBeUndefined();
  });
  it('should handle disableRename ', () => {
    customstyleeditor.props = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
      },
      mode: 0,
      close: () => {},
    };
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'A Apply Stylefff',
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 2,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
    };
    expect(customstyleeditor.disableRename()).toStrictEqual({
      opacity: 0.4,
      pointerEvents: 'none',
    });
  });
  it('should handle buildStyle ', () => {
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
        strong: true,
        color: true,
        underline: true,
        strike: true,
        em: true,
        textHighlight: true,
        lineHeight: true,
        paragraphSpacingBefore: 10,
        paragraphSpacingAfter: 10,
        indent: 10,
      },
      mode: 0,
      close: () => {},
    };
    expect(customstyleeditor.buildStyle()).toStrictEqual({
      backgroundColor: true,
      color: true,
      fontFamily: 'Arial',
      fontSize: '11px',
      fontStyle: 'italic',
      fontWeight: 'bold',
      lineHeight: '125%',
      marginBottom: '10px',
      marginLeft: '20px',
      marginTop: '10px',
      textAlign: 'left',
      textDecoration: 'underline line-through',
    });
  });
  it('should handle buildStyle when fontName and fontSize not present ', () => {
    customstyleeditor.state = {
      styles: {
        align: null,
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: null,
        fontSize: null,
        strong: true,
        color: true,
        underline: true,
        strike: true,
        em: true,
        textHighlight: true,
        lineHeight: true,
        paragraphSpacingBefore: 10,
        paragraphSpacingAfter: 10,
        indent: 10,
      },
      mode: 0,
      close: () => {},
    };
    expect(customstyleeditor.buildStyle()).toStrictEqual({
      backgroundColor: true,
      color: true,
      fontStyle: 'italic',
      fontWeight: 'bold',
      lineHeight: '125%',
      marginBottom: '10px',
      marginLeft: '20px',
      marginTop: '10px',
      textDecoration: 'underline line-through',
    });
  });
  it('should handle buildStyle when isLevelbased is true', () => {
    const mockSelectElement = document.createElement('Select');
    mockSelectElement.value = '2';
    jest.spyOn(document, 'getElementById').mockReturnValue(mockSelectElement);
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
        strong: true,
        color: true,
        underline: true,
        strike: true,
        em: true,
        textHighlight: true,
        lineHeight: true,
        paragraphSpacingBefore: 10,
        paragraphSpacingAfter: 10,
        indent: 10,
        isLevelbased: true,
        boldPartial: true,
      },
      mode: 0,
      close: () => {},
    };
    expect(customstyleeditor.buildStyle()).toStrictEqual({
      backgroundColor: true,
      color: true,
      fontFamily: 'Arial',
      fontSize: '11px',
      fontStyle: 'italic',
      fontWeight: 'normal',
      lineHeight: '125%',
      marginBottom: '10px',
      marginTop: '10px',
      textAlign: 'left',
      textDecoration: 'underline line-through',
    });
  });
  it('should handle buildStyle when isLevelbased is true and boldSentence is false', () => {
    const mockSelectElement = document.createElement('Select');
    mockSelectElement.value = '2';
    jest.spyOn(document, 'getElementById').mockReturnValue(mockSelectElement);
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
        strong: true,
        color: true,
        underline: true,
        strike: true,
        em: true,
        textHighlight: true,
        lineHeight: true,
        paragraphSpacingBefore: 10,
        paragraphSpacingAfter: 10,
        indent: 10,
        isLevelbased: true,
        boldPartial: true,
        styleLevel: true,
        hasBullet: true,
      },
      mode: 0,
      close: () => {},
    };
    expect(customstyleeditor.buildStyle()).toStrictEqual({
      backgroundColor: true,
      color: true,
      fontFamily: 'Arial',
      fontSize: '11px',
      fontStyle: 'italic',
      fontWeight: 'normal',
      lineHeight: '125%',
      marginBottom: '10px',
      marginTop: '10px',
      textAlign: 'left',
      textDecoration: 'underline line-through',
    });
  });
  it('should handle buildStyle when isLevelbased is true and boldnumbering false', () => {
    const mockSelectElement = document.createElement('div');
    mockSelectElement.innerHTML = jest
      .spyOn(document, 'getElementById')
      .mockReturnValue(mockSelectElement);
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: null,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
        strong: true,
        color: true,
        underline: true,
        strike: true,
        em: true,
        textHighlight: true,
        lineHeight: true,
        paragraphSpacingBefore: 10,
        paragraphSpacingAfter: 10,
        indent: 10,
        isLevelbased: true,
        boldPartial: true,
        styleLevel: true,
        hasBullet: true,
      },
      mode: 0,
      close: () => {},
    };
    expect(customstyleeditor.buildStyle()).toStrictEqual({
      backgroundColor: true,
      color: true,
      fontFamily: 'Arial',
      fontSize: '11px',
      fontStyle: 'italic',
      fontWeight: 'normal',
      lineHeight: '125%',
      marginBottom: '10px',
      marginTop: '10px',
      textAlign: 'left',
      textDecoration: 'underline line-through',
    });
  });
  it('should handle buildStyle when underline false', () => {
    const mockSelectElement = document.createElement('div');
    mockSelectElement.innerHTML = jest
      .spyOn(document, 'getElementById')
      .mockReturnValue(mockSelectElement);
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: null,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
        strong: true,
        color: true,
        underline: false,
        strike: true,
        em: true,
        textHighlight: true,
        lineHeight: true,
        paragraphSpacingBefore: 10,
        paragraphSpacingAfter: 10,
        indent: 10,
        isLevelbased: true,
        boldPartial: true,
        hasNumbering: true,
        styleLevel: true,
        hasBullet: true,
      },
      mode: 0,
      close: () => {},
    };
    expect(customstyleeditor.buildStyle()).toStrictEqual({
      backgroundColor: true,
      color: true,
      fontFamily: 'Arial',
      fontSize: '11px',
      fontStyle: 'italic',
      fontWeight: 'normal',
      lineHeight: '125%',
      marginBottom: '10px',
      marginTop: '10px',
      textAlign: 'left',
      textDecoration: 'line-through',
    });
  });
  it('should handle onNextLineStyleSelected', () => {
    const dom = document.createElement('div');
    jest.spyOn(document, 'getElementById').mockReturnValue(dom);
    expect(customstyleeditor.onNextLineStyleSelected(0)).toBeUndefined();
  });
  it('should handle onNextLineStyleSelected', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    expect(customstyleeditor.onNextLineStyleSelected(0)).toBeUndefined();
  });
  it('should handle onNextLineStyleSelected when selectedOption is 1', () => {
    const dom = document.createElement('div');
    jest.spyOn(document, 'getElementById').mockReturnValue(dom);
    expect(customstyleeditor.onNextLineStyleSelected(1)).toBeUndefined();
  });
  it('should handle onNextLineStyleSelected when selectedOption is 2', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    expect(customstyleeditor.onNextLineStyleSelected(2)).toBeUndefined();
  });
  it('should handle onNextLineStyleSelected when selectedOption is not 0 and 1', () => {
    const dom = document.createElement('select');
    dom.selectedIndex = 0;
    const option1 = document.createElement('option');
    option1.value = 'value1';
    option1.text = 'Option 1';
    dom.appendChild(option1);
    jest.spyOn(document, 'getElementById').mockReturnValue(dom);
    expect(customstyleeditor.onNextLineStyleSelected(2)).toBeUndefined();
  });

  it('should handle showColorDialog', () => {
    customstyleeditor._popUp = {};
    const event = { target: { value: 'strong' } };
    expect(customstyleeditor.showColorDialog(true, event)).toBeUndefined();
  });
  it('should handle showColorDialog when event is null', () => {
    customstyleeditor._popUp = {};
    expect(customstyleeditor.showColorDialog(true, null)).toBeUndefined();
  });
  it('should handle onAlignButtonClick', () => {
    expect(customstyleeditor.onAlignButtonClick('')).toBeUndefined();
  });
  it('should handle _cancel when when mode 3', () => {
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'A Apply Stylefff',
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 3,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
      customStyles: '',
    };
    customstyleeditor.props = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
      },
      mode: 0,
      close: () => {},
    };
    const spy = jest.spyOn(customstyleeditor.props, 'close');
    customstyleeditor._cancel();
    expect(spy).toHaveBeenCalled();
  });
  it('should handle _cancel when when mode not 3', () => {
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'A Apply Stylefff',
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 1,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
      customStyles: '',
    };
    customstyleeditor.props = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
      },
      mode: 0,
      close: () => {},
    };
    const spy = jest.spyOn(customstyleeditor.props, 'close');
    customstyleeditor._cancel();
    expect(spy).toHaveBeenCalled();
  });
  it('should handle _save ', () => {
    const dom = document.createElement('div');
    dom.className = 'errormsg';
    dom.style = {};
    jest.spyOn(document, 'getElementById').mockReturnValue(dom);
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'A Apply Stylefff',
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 0,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
      customStyles: '',
    };
    customstyleeditor.props = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
      },
      mode: 0,
      close: () => {},
    };
    jest.spyOn(customstyle, 'isCustomStyleExists').mockReturnValue(true);
    customstyleeditor._save();
    expect(dom.style.display).toBe('');
  });
  it('should handle _save when mode is 3', () => {
    const dom = document.createElement('div');
    dom.className = 'errormsg';
    dom.style = {};
    jest.spyOn(document, 'getElementById').mockReturnValue(dom);
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'A Apply Stylefff',
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 3,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
      customStyles: '',
    };
    customstyleeditor.props = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
      },
      mode: 0,
      close: () => {},
    };
    customstyleeditor.modifyCustomStyle = () => {};
    const spy = jest.spyOn(customstyleeditor, 'modifyCustomStyle');
    customstyleeditor._save();
    expect(spy).toHaveBeenCalled();
  });
  it('should handle handleKeyDown ', () => {
    const dom1 = document.createElement('div');
    dom1.focus = () => {};
    jest.spyOn(document, 'getElementById').mockReturnValue(dom1);
    const spy = jest.spyOn(dom1, 'focus');
    customstyleeditor.handleKeyDown(new Event('click'));
    expect(spy).toHaveBeenCalled();
  });
  it('should handle handleKeyDown ', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    expect(customstyleeditor.handleKeyDown(new Event('click'))).toBeUndefined();
  });
  it('should handle setNextLineStyle ', () => {
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 3,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
      customStyles: '',
    };
    customstyleeditor.props = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
      },
      mode: 1,
      close: () => {},
    };
    const dom = document.createElement('select');
    jest.spyOn(document, 'getElementById').mockReturnValue(dom);
    const spy = jest.spyOn(customstyleeditor, 'setState');
    customstyleeditor.setNextLineStyle('Arial');
    expect(spy).toHaveBeenCalled();
  });
  it('should handle setNextLineStyle when document.getelementbyid does not return instance of select element', () => {
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
      },
      mode: 3,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
      customStyles: '',
    };
    customstyleeditor.props = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        nextLineStyleName: 'none',
        fontName: 'Arial',
        fontSize: 11,
      },
      mode: 1,
      close: () => {},
    };
    const dom = document.createElement('div');
    jest.spyOn(document, 'getElementById').mockReturnValue(dom);
    const spy = jest.spyOn(customstyleeditor, 'setState');
    customstyleeditor.setNextLineStyle('Arial');
    expect(spy).toHaveBeenCalled();
  });
  it('should handle componentDidMount ', () => {
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        fontName: 'Arial',
        fontSize: 11,
        strong: false,
        styleLevel: true,
        hasNumbering: true,
      },
      mode: 3,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
      customStyles: '',
    };
    customstyleeditor.props.mode = 1;
    const dom = document.createElement('div');
    const dom1 = document.createElement('div');
    jest.spyOn(document, 'getElementsByClassName').mockReturnValue([dom, dom1]);
    expect(customstyleeditor.componentDidMount()).toBeUndefined();
  });
  it('should handle render', () => {
    customstyleeditor.state = {
      styles: {
        align: 'center',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        fontName: null,
        fontSize: null,
        strong: true,
        em: true,
        underline: true,
        color: 'rgba(0,0,0,0)',
        textHighlight: 'rgba(0,0,0,0)',
        boldPartial: true,
        styleLevel: true,
        hasNumbering: true,
        super: true,
      },
      mode: 3,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
      customStyles: [{ styles: { styleLevel: 2 }, styleName: 'test' }],
    };
    jest.spyOn(customstyle, 'isCustomStyleExists').mockReturnValue(true);
    expect(customstyleeditor.render()).toBeDefined();
  });
  it('should handle render when align is justify', () => {
    customstyleeditor.state = {
      styles: {
        align: 'justify',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        fontName: null,
        fontSize: null,
        strong: true,
        em: true,
        underline: true,
        color: 'rgba(0,0,0,0)',
        textHighlight: 'rgba(0,0,0,0)',
        boldPartial: true,
        hasBullet: true,
        styleLevel: true,
        hasNumbering: true,
        super: true,
      },
      mode: 3,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
      customStyles: [{ styles: { styleLevel: 2 }, styleName: 'test' }],
    };
    jest.spyOn(customstyle, 'isCustomStyleExists').mockReturnValue(true);
    expect(customstyleeditor.render()).toBeDefined();
  });
  it('should handle render when align is right', () => {
    customstyleeditor.state = {
      styles: {
        nextLineStyleName: 'A Apply Stylefff',
        align: 'right',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: true,
        fontName: null,
        fontSize: null,
        strong: true,
        em: true,
        underline: true,
        color: 'rgba(0,0,0,0)',
        textHighlight: 'rgba(0,0,0,0)',
        boldPartial: true,
        hasBullet: true,
        styleLevel: true,
        hasNumbering: true,
        super: true,
      },
      mode: 3,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: null,
      customStyles: [{ styles: { styleLevel: 2 }, styleName: 'test' }],
    };
    jest.spyOn(customstyle, 'isCustomStyleExists').mockReturnValue(true);
    expect(customstyleeditor.render()).toBeDefined();
  });
});
