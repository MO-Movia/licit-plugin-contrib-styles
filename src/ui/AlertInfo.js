// @flow

import * as React from 'react';

class AlertInfo extends React.PureComponent<any, any> {
  _unmounted = false;

  constructor(props: any) {
    super(props);
  }

  state = {
    ...(this.props.initialValue || {}),
    validValue: null,
  };

  componentWillUnmount(): void {
    this._unmounted = true;
  }

  render(): React.Element<any> {
    const title = this.props.title || 'Document Error!';
    const content =
      this.props.content ||
      'Unable to load the document. Have issues in Json format, please verify...';
    return (
      <div className="alert">
        <strong>{title}</strong>
        <span>{content}</span>
      </div>
    );
  }

  _cancel = (): void => {
    this.props.close();
  };
}

export default AlertInfo;
