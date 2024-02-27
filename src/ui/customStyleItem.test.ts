import { CustomStyleItem } from './CustomStyleItem';
import * as cusstyle from '../customStyle';

describe('customstyleitem', () => {
  const mockState = {
    doc: {
      type: 'doc',
      attrs: {
        layout: null,
        padding: null,
        width: null,
        counterFlags: null,
        capcoMode: 0,
      },
      content: [
        {
          type: 'paragraph',
          attrs: {
            align: null,
            color: null,
            id: null,
            indent: null,
            lineSpacing: null,
            paddingBottom: null,
            paddingTop: null,
            capco: null,
            styleName: 'Normal',
          },
        },
      ],
    },
    selection: { type: 'text', anchor: 1, head: 1 },
  } as any;
  
   const props = {
    command: {
      _customStyleName: 'Normal',
      _customStyle: {
        styleName: 'Normal',
        mode: 1,
        description: 'Normal',
        styles: {
          align: 'right',
          boldNumbering: true,
          boldSentence: true,
          fontName: 'Tahoma',
          fontSize: '12',
          nextLineStyleName: 'Normal',
          paragraphSpacingAfter: '3',
          toc: false,
          hasNumbering: true,
          hasText: true,
          hasBullet: true,
          styleLevel: 2,
        },
        toc: false,
        isHidden: false,
      },
      _popUp: null,
    } as any,
    disabled: true,
    dispatch: () => undefined,
    editorState: mockState,
    editorView: undefined,
    label: 'Normal',
    hasText: true,
  };
  const customstyleitem = new CustomStyleItem(props);

  it('should be defined', () => {
    expect(customstyleitem).toBeDefined();
  });
  it('should handle render', () => {
    expect(customstyleitem.render()).toBeDefined();
  });
  it('should handle render when label is not defined branch coverage', () => {
    jest.spyOn(cusstyle, 'getCustomStyleByName').mockReturnValue({
      styles: undefined,
      styleName: ''
    });   
 
    const props = {
      command: {
        _customStyleName: 'Normal',
        _customStyle: {
          styleName: 'Normal',
          mode: 1,
          description: 'Normal',
          styles: {
            align: 'right',
            boldNumbering: false,
            boldSentence: false,
            boldPartial: true,
            fontName: 'Tahoma',
            fontSize: '12',
            nextLineStyleName: 'Normal',
            paragraphSpacingAfter: '3',
            toc: false,
            hasNumbering: true,
            hasText: true,
            hasBullet: false,
            styleLevel: 2,
            bulletLevel: true,
          },
          toc: false,
          isHidden: false,
        },
        _popUp: null,
      } as any,
      disabled: true,
      dispatch: () => undefined,
      editorState: mockState,
      editorView: undefined,
      label: '',
      hasText: false,
    };
    const customstyleitem = new CustomStyleItem(props);
    jest.spyOn(customstyleitem, 'sampleLevel').mockReturnValue('');
    jest.spyOn(customstyleitem, 'hasBoldSentence').mockReturnValue(true);

    expect(customstyleitem.render()).toBeDefined();
  });
  it('should handle render when label is not defined when hasBoldPartial and hasBoldSentance true and false respectively', () => {
    jest.spyOn(cusstyle, 'getCustomStyleByName').mockReturnValue({
      styles: undefined,
      styleName: ''
    });
  
    const props = {
      command: {
        _customStyleName: 'Normal',
        _customStyle: {
          styleName: 'Normal',
          mode: 1,
          description: 'Normal',
          toc: false,
          isHidden: false,
        },
        _popUp: null,
      } as any,
      disabled: true,
      dispatch: () => undefined,
      editorState: mockState,
      editorView: undefined,
      label: '',
      hasText: false,
    };
    const customstyleitem = new CustomStyleItem(props);
    expect(customstyleitem.render()).toBeDefined();
  });
});
