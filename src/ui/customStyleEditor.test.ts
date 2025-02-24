import { CustomStyleEditor } from './CustomStyleEditor';
import * as customstyle from '../customStyle';
import { SyntheticEvent } from 'react';

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
  it('should handle onStyleClick when style = strong', () => {
    expect(
      customstyleeditor.onStyleClick('strong', new Event('click'))
    ).toBeUndefined();
  });
  it('should handle onStyleClick when style = strong and styles[style] = true', () => {
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
        strong: true,
      },
      mode: 0,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
    };
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
    expect(customstyleeditor.getNumberingLevel('2', 'A')).toBe('A1.1. ');
  });

  it('should handle onFontNameChange', () => {
    const event = { target: { value: 'Tahoma' } };
    expect(customstyleeditor.onFontNameChange(event)).toBeUndefined();
  });
  describe('onFontNameChange', () => {       // //FSFIX    Breakthrough code to cover code inside setState
    let component;
  
    beforeEach(() => {
      // Initialize the component
      component = customstyleeditor;
  
      // Mock setState to handle both object and function updates
      component.setState = jest.fn((update) => {
        const newState =
          typeof update === 'function' ? update(component.state) : update;
        component.state = { ...component.state, ...newState };
      });
    });
  
    it('should update fontName in styles', () => {
      // Initial state
      component.state = { styles: { fontName: '' } };
  
      // Mock event object
      const event = { target: { value: 'Arial' } };
  
      // Trigger the method
      component.onFontNameChange(event);
  
      // Expect setState to be called
      expect(component.setState).toHaveBeenCalledWith(expect.any(Function));
  
      // Expect the state to be updated correctly
      expect(component.state.styles.fontName).toBe('Arial');
    });
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

  it('should handle onLevelChange when event target value is None', () => {
    const event = { target: { value: 'None' } };
    customstyleeditor.onLevelChange(event);
    expect(customstyleeditor.state.styles.styleLevel).toEqual("None");

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
    const props = {
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
      close: () => undefined,
    };

    const CustomStyleEditors = new CustomStyleEditor(props);

    expect(CustomStyleEditors._save()).toBeUndefined();
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
    const props = {
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
      close: () => undefined,
    };
    const CustomStyleEditors = new CustomStyleEditor(props);
    expect(CustomStyleEditors._save()).toBeUndefined();
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
    const props = {
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
      close: () => undefined,
    };
    const CustomStyleEditors = new CustomStyleEditor(props);
    expect(CustomStyleEditors._save()).toBeUndefined();
  });
  it('should handle disableRename ', () => {
    const props = {
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
      close: () => undefined,
    };
    const CustomStyleEditors = new CustomStyleEditor(props);

    CustomStyleEditors.state = {
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
    expect(CustomStyleEditors.disableRename()).toStrictEqual({
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
      close: () => undefined,
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
      close: () => undefined,
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
      close: () => undefined,
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
  it('should handle buildStyle when isLevelbased is true and boldSentence is true', () => {
    const mockSelectElement = document.createElement('Select');
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
      close: () => undefined,
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
    jest.spyOn(document, 'getElementById').mockReturnValue(mockSelectElement);
    customstyleeditor.state = {
      styles: {
        align: 'left',
        boldNumbering: true,
        toc: false,
        isHidden: false,
        boldSentence: false,
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
      close: () => undefined,
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
      .mockReturnValue(mockSelectElement)
      .toString();
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
      .mockReturnValue(mockSelectElement)
      .toString();
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
      close: () => undefined,
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
    customstyleeditor._popUp = null;
    const event = { target: { value: 'strong' } } as unknown as SyntheticEvent;
    expect(customstyleeditor.showColorDialog(true, event)).toBeUndefined();
  });
  it('should handle showColorDialog when event is null', () => {
    customstyleeditor._popUp = null;
    expect(
      customstyleeditor.showColorDialog(true, null as unknown as SyntheticEvent)
    ).toBeUndefined();
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
    const props = {
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
      mode: 3,
      close: () => undefined,
    };
    const CustomStyleEditors = new CustomStyleEditor(props);

    console.log('jifi', CustomStyleEditors.state.mode);
    const spy = jest.spyOn(CustomStyleEditors.props, 'close');

    CustomStyleEditors._cancel();
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
    const props = {
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
      close: () => undefined,
    };
    const CustomStyleEditors = new CustomStyleEditor(props);
    const spy = jest.spyOn(CustomStyleEditors.props, 'close');
    CustomStyleEditors._cancel();
    expect(spy).toHaveBeenCalled();
  });
  it('should handle _save ', () => {
    const dom = document.createElement('div');
    dom.className = 'errormsg';
    dom.setAttribute('style', '');
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
    const props = {
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
    const CustomStyleEditors = new CustomStyleEditor(props);
    jest.spyOn(customstyle, 'isCustomStyleExists').mockReturnValue(true);
    CustomStyleEditors._save();
    expect(dom.style.display).toBe('');
  });
  it('should handle _save when mode is 3', () => {
    const dom = document.createElement('div');
    dom.className = 'errormsg';
    dom.setAttribute('style', '');
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
    const props = {
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
      mode: 3,
      close: () => {},
    };
    const CustomStyleEditors = new CustomStyleEditor(props);
    CustomStyleEditors.modifyCustomStyle = () => {};
    const spy = jest.spyOn(CustomStyleEditors, 'modifyCustomStyle');
    CustomStyleEditors._save();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle handleKeyDown ', () => {
    const dom1 = document.createElement('div');
    dom1.focus = () => {};
    jest.spyOn(document, 'getElementById').mockReturnValue(dom1);
    const spy = jest.spyOn(dom1, 'focus');
    customstyleeditor.handleKeyDown();
    expect(spy).toHaveBeenCalled();
  });
  it('should handle handleKeyDown ', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    expect(customstyleeditor.handleKeyDown()).toBeUndefined();
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
    const props = {
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
    const CustomStyleEditors = new CustomStyleEditor(props);

    const dom = document.createElement('select');
    jest.spyOn(document, 'getElementById').mockReturnValue(dom);
    const spy = jest.spyOn(CustomStyleEditors, 'setState');
    CustomStyleEditors.setNextLineStyle('Arial');
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
    const props = {
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
    const CustomStyleEditors = new CustomStyleEditor(props);

    const dom = document.createElement('div');
    jest.spyOn(document, 'getElementById').mockReturnValue(dom);
    const spy = jest.spyOn(CustomStyleEditors, 'setState');
    CustomStyleEditors.setNextLineStyle('Arial');
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
    const props = {
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
    // customstyleeditor.props.mode = 1;
    const CustomStyleEditors = new CustomStyleEditor(props);

    const dom = document.createElement('div');
    const dom1 = document.createElement('div');
    jest
      .spyOn(document, 'getElementsByClassName')
      .mockReturnValue([dom, dom1] as unknown as HTMLCollectionOf<Element>);
    expect(CustomStyleEditors.componentDidMount()).toBeUndefined();
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

  it('should return true if custom style is already applied in the document', () => {
    const editorState = {
      doc: {
        nodesBetween: jest.fn().mockImplementation((start, end, callback) => {
          const node = {
            attrs: {
              styleName: 'YourCustomStyle',
            },
            content: {
              content: [],
            },
          };
          callback(node);
        }),
      },
    };
    customstyleeditor.state = {
      editorView: { state: editorState },
      styleName: 'YourCustomStyle',
    };

    const result = customstyleeditor.isCustomStyleAlreadyApplied();

    expect(result).toBe(false);
  });

  it('should return true when styleLevel is 1 and isList is true', () => {
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
        styleLevel: 1,
        hasNumbering: true,
        super: true,
        isList: true,
      },
      mode: 3,
      styleName: 'A Apply Stylefff',
      otherStyleSelected: '',
      customStyles: [{ styles: { styleLevel: 2 }, styleName: 'test' }],
    };
    const result = customstyleeditor.checkCondition(true);
    expect(result).toBe(true);
  });

  it('custom style is already applied in the document', () => {
    const editorState = {
      doc: {
        nodesBetween: jest.fn().mockImplementation((start, end, callback) => {
          const node = {
            attrs: {
              styleName: 'YourCustomStyle',
            },
            content: {
              content: ['test'],
            },
          };
          callback(node);
        }),
      },
    };

    customstyleeditor.state = {
      editorView: { state: editorState },
      styleName: 'YourCustomStyle',
    };

    const result = customstyleeditor.isCustomStyleAlreadyApplied();

    expect(result).toBe(true);
  });
  it('should handle modifyCustomStyle', () => {
    jest.spyOn(customstyle, 'saveStyle').mockResolvedValue([]);
    expect(
      customstyleeditor.modifyCustomStyle({
        editorView: {},
        styleName: 'styleName',
        mode: 1,
        description: 'description',
        styles: {},
      })
    ).toBeUndefined();
  });
  it('should handle showAlert', () => {
    expect(customstyleeditor.showAlert()).toBeUndefined();
  });
  it('should handle handlePrefix', () => {
    const spy = jest.spyOn(customstyleeditor, 'setState');
    customstyleeditor.handlePrefix({ target: { value: '' } });
    expect(spy).toHaveBeenCalled();
  });
  it('should handle handleHideNumbering', () => {
    const spy = jest.spyOn(customstyleeditor, 'setState');
    customstyleeditor.handleHideNumbering({ target: { value: false } });
    expect(spy).toHaveBeenCalled();
  });
  it('should handle handleList', () => {
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
    };
    jest
      .spyOn(customstyleeditor, 'isCustomStyleAlreadyApplied')
      .mockReturnValue(true);
    const spy = jest.spyOn(customstyleeditor, 'showAlert');
    customstyleeditor.handleList({ target: { value: '', checked: false } });
    expect(spy).toHaveBeenCalled();
  });
  it('should handle handleList when mode is 0', () => {
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
    jest
      .spyOn(customstyleeditor, 'isCustomStyleAlreadyApplied')
      .mockReturnValue(true);
    const spy = jest.spyOn(customstyleeditor, 'showAlert');
    customstyleeditor.handleList({ target: { value: '', checked: false } });
    expect(spy).not.toHaveBeenCalled();
  });
  it('should handle onSelectCustomStyle', () => {
    customstyleeditor.getCustomStyles();
    expect(customstyleeditor.onSelectCustomStyle(() => {})).toBeUndefined();
  });
  it('should handle handleList', () => {
    expect(
      customstyleeditor.handleList({ target: { value: 'none' } })
    ).toBeUndefined();
  });
  it('should handle componentDidMount ', () => {
    const props = {
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
    const CustomStyleEditors = new CustomStyleEditor(props);
    CustomStyleEditors.state = {
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
      styleName: 'Normal',
      otherStyleSelected: '',
      customStyles: '',
      editorView: { state: { doc: { nodesBetween: () => {} } } },
    };
    expect(CustomStyleEditors.componentDidMount()).toBeUndefined();
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
        styleLevel: 1,
        hasNumbering: true,
        super: true,
        isList: true,
      },
      mode: 3,
      styleName: 'Normal',
      otherStyleSelected: '',
      customStyles: [{ styles: { styleLevel: 2 }, styleName: 'test' }],
    };
    jest.spyOn(customstyle, 'isCustomStyleExists').mockReturnValue(true);
    expect(customstyleeditor.render()).toBeDefined();
  });
});
