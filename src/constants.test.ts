import {getNode} from './Constants';
import { schema } from 'prosemirror-schema-basic';
import { Transform } from 'prosemirror-transform';

describe('constants',()=>{
    it('should return selectedNode',()=>{
        const transform = {doc:{doc:{type:{name:'paragraph'}},nodesBetween:()=>{return {value:'selctednode_dummy'}; }} };
        expect(getNode(0,1,transform as unknown as Transform)).toBe(null);
    });
    it('should return selectedNode',()=>{
        const doc = schema.node('doc', null, [
            schema.node('paragraph'),
            schema.node('heading'),
            schema.node('paragraph'),
          ]);
        const trmock = {
            doc:doc

          };
          expect(getNode(0,1,trmock as Transform)).toBeDefined();
    });
    it('should return selectedNode BRANCH COVERAGE',()=>{
        const doc = schema.node('doc', null, [
            schema.node('heading'),
            schema.node('heading'),
            schema.node('heading'),
          ]);
        const trmock = {
            doc:doc

          };
          expect(getNode(0,1,trmock as Transform)).toBeDefined();
    });
});
