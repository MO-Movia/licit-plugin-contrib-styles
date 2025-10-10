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
   it('should be defined', () => {
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
          fontName: 'Tahoma',
          fontSize: '12',
          nextLineStyleName: 'Normal',
          paragraphSpacingAfter: '3',
          toc: false,
          hasNumbering: false,
          isList:true,
          hasText: true,
          hasBullet: true,
          styleLevel: 2,
          prefixValue:'A'
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
   const customstyleitemtest = new CustomStyleItem(props);
    expect(customstyleitemtest.render()).toBeDefined();
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
            fontName: 'Tahoma',
            fontSize: '12',
            nextLineStyleName: 'Normal',
            paragraphSpacingAfter: '3',
            toc: false,
            hasNumbering: true,
            hasText: true,
            hasBullet: true,
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


  it('should return an empty string when hasText is true and styles.hasBullet is true', () => {
    const styles = {
      hasNumbering: false,
      isList: false,
      styleLevel: 2,
      hasBullet: true,
    };
    const result = customstyleitem.sampleLevel(styles);
    expect(result).toBe('');
  });

  it('should return a string of "1." repeated according to styleLevel when hasText is true and either styles.hasNumbering or styles.isList is true', () => {
    const styles = {
      hasNumbering: true,
      isList: true,
      styleLevel: 3,
      hasBullet: false,
    };
    const result = customstyleitem.sampleLevel(styles);
    expect(result).toBe('1.1.1.');
  });

  it('should prepend prefixValue only for the first level', () => {
    const styles = {
      hasNumbering: true,
      isList: true,
      styleLevel: 3,
      hasBullet: false,
      prefixValue: 'A',
    };
    const result = customstyleitem.sampleLevel(styles);
    expect(result).toBe('A1.1.1.');
  });



});
