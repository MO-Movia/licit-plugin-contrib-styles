import {toCustomStyleDOM,getCustomStyleAttrs,getDetailsBullet} from './CustomStyleNodeSpec';

describe("getAttrs",()=>{
    const base = (p)=>{ return { attrs:{"styleName": ''}}};
    const dom = document.createElement('div');
    dom.setAttribute("styleName",'test_styles');

    const spy = jest.spyOn(document,'getElementById').mockReturnValue(dom);
    it('should handle getAttrs',()=>{
        expect(getCustomStyleAttrs(base,dom)).toStrictEqual({
               "attrs": {
                 "styleName": "",
               },
               "styleName": "test_styles",
             })
    })
})
describe('toCustomStyleDOM',()=>{
    const base = (p)=>{ return ['span',{'styleName':''}]};
    const node = {attrs:{styleName:'test_styles'}};
    expect(toCustomStyleDOM(base,node)).toStrictEqual(["span", {"style": "margin-bottom: 3pt !important;", "styleName": "test_styles"}]);

})