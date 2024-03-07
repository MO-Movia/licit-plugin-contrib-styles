import { CustomStyleItem } from './CustomStyleItem';
import * as cusstyle from '../customStyle';
import { EditorState } from 'prosemirror-state';
import { CustomStyleCommand } from '../CustomStyleCommand';

describe('customstyleitem', () => {

  const ed = new EditorState();
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
    } as unknown as CustomStyleCommand,
    disabled: true,
    dispatch: () => undefined,
    editorState: ed,
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
    const ed = new EditorState();
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
      } as unknown as CustomStyleCommand,
      disabled: true,
      dispatch: () => undefined,
      editorState: ed,
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
    const ed = new EditorState();
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
      } as unknown as CustomStyleCommand,
      disabled: true,
      dispatch: () => undefined,
      editorState: ed,
      editorView: undefined,
      label: '',
      hasText: false,
    };
    const customstyleitem = new CustomStyleItem(props);
    expect(customstyleitem.render()).toBeDefined();
  });
});
