import CustomStyleEditor from './CustomStyleEditor';
import { isCustomStyleExists, setStyles, saveStyle, getStylesAsync } from '../customStyle';
import * as customstyle from '../customStyle';

describe('CustomStyleEditor', () => {
    const spy = jest.spyOn(customstyle, 'getStylesAsync').mockResolvedValue([]);
    const customstyleeditor = new CustomStyleEditor({ styles: { align: 'left', boldNumbering: true, toc: false, isHidden: false, boldSentence: true, nextLineStyleName: 'none', fontName: 'Arial', fontSize: 11 }, mode: 0 })
    customstyleeditor.state = { styles: { align: 'left', boldNumbering: true, toc: false, isHidden: false, boldSentence: true, nextLineStyleName: "A Apply Stylefff", fontName: 'Arial', fontSize: 11, strong: false }, mode: 0, styleName: "A Apply Stylefff", otherStyleSelected: '' }
    it('should be defined', () => {

        expect(customstyleeditor).toBeDefined();
    })
    it('should handle componentWillUnmount', () => {
        customstyleeditor.componentWillUnmount()
        expect(customstyleeditor._unmounted).toBe(true);
    });
    it('should handle onStyleClick when style = strong', () => {
        //customstyleeditor.state.styles[style]
        expect(customstyleeditor.onStyleClick('strong', new Event('click'))).toBeUndefined();
    })
    it('should handle onStyleClick when style = name', () => {
        const event = { target: { value: "A Apply Stylefff-new" } }
        expect(customstyleeditor.onStyleClick('name', event)).toBeUndefined();
    })
    it('should handle onStyleClick when style = description', () => {
        const event = { target: { value: "description" } }
        expect(customstyleeditor.onStyleClick('description', event)).toBeUndefined();
    })
    it('should handle onStyleClick when style = before', () => {
        const event = { target: { value: "before" } }
        expect(customstyleeditor.onStyleClick('before', event)).toBeUndefined();
    })
    it('should handle onStyleClick when style = after', () => {
        const event = { target: { value: "after" } }
        expect(customstyleeditor.onStyleClick('after', event)).toBeUndefined();
    })
    it('should handle onStyleClick when style = default', () => {
        const event = { target: { value: "" } }
        expect(customstyleeditor.onStyleClick('', event)).toBeUndefined();
    })

    it('should handle getNumberingLevel', () => {

        expect(customstyleeditor.getNumberingLevel('2')).toBe("1.1. ");
    })

    it('should handle onFontNameChange', () => {
        const event = { target: { value: "Tahoma" } };

        expect(customstyleeditor.onFontNameChange(event)).toBeUndefined();
    })
    it('should handle onIndentRadioChanged', () => {
        const event = { target: { value: "0" } };
        expect(customstyleeditor.onIndentRadioChanged(event)).toBeUndefined();
        const event1 = { target: { value: "" } };
        expect(customstyleeditor.onIndentRadioChanged(event1)).toBeUndefined();
    })
    it('should handle onScentenceRadioChanged', () => {
        const event = { target: { value: "0" } };
        expect(customstyleeditor.onScentenceRadioChanged(event)).toBeUndefined();
        const event1 = { target: { value: "" } };
        expect(customstyleeditor.onScentenceRadioChanged(event1)).toBeUndefined();
    })
    it('should handle onFontSizeChange', () => {
        const event = { target: { value: "" } };

        expect(customstyleeditor.onFontSizeChange(event)).toBeUndefined();
    })
    it('should handle onLineSpaceChange', () => {
        const event = { target: { value: "" } };

        expect(customstyleeditor.onLineSpaceChange(event)).toBeUndefined();
    })
    it('should handle onLevelChange', () => {
        const event = { target: { value: "" } };

        expect(customstyleeditor.onLevelChange(event)).toBeUndefined();
    })
    it('should handle onLevelChange when event target value null', () => {
        const event = { target: { value: null } };

        expect(customstyleeditor.onLevelChange(event)).toBeUndefined();
    })
    it('should handle onBulletLevelChange', () => {
        const event = { target: { value: "" } };

        expect(customstyleeditor.onBulletLevelChange(event)).toBeUndefined();
    })
    it('should handle handleBulletPoints', () => {
        const event = { target: { value: "", checked: true } };

        expect(customstyleeditor.handleBulletPoints(event)).toBeUndefined();
    })
    it('should handle onIndentChange', () => {
        const event = { target: { value: "", checked: true } };

        expect(customstyleeditor.onIndentChange(event)).toBeUndefined();
    })
    it('should handle onOtherStyleSelectionChanged', () => {
        const event = { target: { value: "", checked: true } };

        expect(customstyleeditor.onOtherStyleSelectionChanged(event)).toBeUndefined();
    })
    it('should handle handleNumbering', () => {
        const event = { target: { value: "", checked: true } };

        expect(customstyleeditor.handleNumbering(event)).toBeUndefined();
    })
    it('should handle handleBoldNumbering', () => {
        const event = { target: { value: "", checked: true } };

        expect(customstyleeditor.handleBoldNumbering(event)).toBeUndefined();
    })
    it('should handle handleBoldPartial', () => {
        const event = { target: { value: "", checked: true } };

        expect(customstyleeditor.handleBoldPartial(event)).toBeUndefined();
    })
    it('should handle handleTOC', () => {
        const event = { target: { value: "", checked: true } };

        expect(customstyleeditor.handleTOC(event)).toBeUndefined();
    })
    it('should handle selectStyleCheckboxState', () => {


        expect(customstyleeditor.selectStyleCheckboxState()).toBe(false);
    })
    it('should handle _save ', () => {
        customstyleeditor.props = { styles: { align: 'left', boldNumbering: true, toc: false, isHidden: false, boldSentence: true, nextLineStyleName: 'none', fontName: 'Arial', fontSize: 11 }, mode: 0, close: () => { } };

        expect(customstyleeditor._save()).toBeUndefined();
    })
    it('should handle disableRename ', () => {
        customstyleeditor.props = { styles: { align: 'left', boldNumbering: true, toc: false, isHidden: false, boldSentence: true, nextLineStyleName: 'none', fontName: 'Arial', fontSize: 11 }, mode: 0, close: () => { } };
        customstyleeditor.state = { styles: { align: 'left', boldNumbering: true, toc: false, isHidden: false, boldSentence: true, nextLineStyleName: "A Apply Stylefff", fontName: 'Arial', fontSize: 11, strong: false }, mode: 2, styleName: "A Apply Stylefff", otherStyleSelected: '' }
        expect(customstyleeditor.disableRename()).toStrictEqual({
            "opacity": 0.4,
            "pointerEvents": "none",
        });
    })

    it('should handle buildStyle ', () => {
        customstyleeditor.state = ({ styles: { align: 'left', boldNumbering: true, toc: false, isHidden: false, boldSentence: true, nextLineStyleName: 'none', fontName: 'Arial', fontSize: 11, strong: true, color: true, underline: true, strike: true, em: true, textHighlight: true, lineHeight: true, paragraphSpacingBefore: 10, paragraphSpacingAfter: 10, indent: 10 }, mode: 0, close: () => { } });

        expect(customstyleeditor.buildStyle()).toStrictEqual({
            "backgroundColor": true,
            "color": true,
            "fontFamily": "Arial",
            "fontSize": "11px",
            "fontStyle": "italic",
            "fontWeight": "bold",
            "lineHeight": "125%",
            "marginBottom": "10px",
            "marginLeft": "20px",
            "marginTop": "10px",
            "textAlign": "left",
            "textDecoration": "underline line-through",
        });
    })
})