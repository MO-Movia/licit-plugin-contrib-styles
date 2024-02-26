import { AlertInfo } from './AlertInfo';
import React from 'react';
describe('alertinfo', () => {
  const props = {
    title: 'Alert Title', 
    content: 'Alert content',
    close: () => {}, 
  };
   const alertinfo = new AlertInfo(props);
  it('should handle alertinfo', () => {
    expect(alertinfo).toBeDefined();
  });
  it('should handle _cancel ', () => {
    const props = {
      title: 'Alert Title', 
      content: 'Alert content',
      close: () => undefined, 
    };
    const alertinfo = new AlertInfo(props);

    const spy = jest.spyOn(alertinfo.props, 'close');
    alertinfo._cancel();
    expect(spy).toHaveBeenCalled();
  });
  it('should handle render ', () => {
    const props = {
      title: '', 
      content: '',
      close: () => undefined, 
    };
    const alertinfo = new AlertInfo(props);
    const AlertComponent = () => {
      return (
        <div className="alert">
          <strong>Document Error!</strong>
          <span>
            Unable to load the document. Have issues in Json format, please
            verify...
          </span>
        </div>
      );
    };

    expect(alertinfo.render()).toStrictEqual(AlertComponent());
  });
});
