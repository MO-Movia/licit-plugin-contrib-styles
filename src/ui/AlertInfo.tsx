import React from 'react';

export class AlertInfo extends React.PureComponent<{
  title: string;
  content: string | React.ReactElement;
  close: () => void;
}> {
  render(): React.ReactElement {
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
