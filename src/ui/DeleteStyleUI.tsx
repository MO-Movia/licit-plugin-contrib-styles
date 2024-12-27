import React from 'react';
import './custom-style-delete.css';
import { getStylesAsync } from '../customStyle.js';
import { RESERVED_STYLE_NONE } from '../CustomStyleNodeSpec.js';
import type { Style } from '../StyleRuntime.js';

let customStyles: Style[] = [];

// eslint-disable-next-line
export class DeleteStyleUI extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      selectedOption: 1,
      selectedStylename: RESERVED_STYLE_NONE,
      customStyles,
    };
    this.getCustomStyles();
  }

  componentDidMount() {}

  // To fetch the custom styles from server and set to the state.
  getCustomStyles() {
    getStylesAsync().then((result) => {
      result = result.filter((obj) => obj.styleName !== this.state.styleName);
      customStyles = result;
      this.setState({
        customStyles: result,
      });
    });
  }

  oncheckBoxClicked(selectedOption: number) {
    if (1 === selectedOption) {
      this.setState((prevState) => ({
        styles: {
          ...prevState.styles,
          selectedStylename: RESERVED_STYLE_NONE,
          selectedOption: selectedOption,
        },
      }));
    } else {
      this.setState((prevState) => ({
        styles: {
          ...prevState.styles,
          selectedOption: selectedOption,
        },
      }));
    }
  }

  onStyleSelectionChanged(e) {
    this.setState((prevState) => ({
      styles: {
        ...prevState.styles,
        selectedStylename: e.target.value,
      },
    }));
  }

  // eslint-disable-next-line
  render(): JSX.Element {
    return (
      <div className="molsp-customdelete-div" style={{ height: '150px' }}>
        <div className="molsp-customedit-head">
          <span> Delete Style</span>
        </div>
        <div
          className="test"
          style={{ alignItems: 'center', marginLeft: '5px' }}
        >
          <div
            className="molsp-formp molsp-deleteoptions"
            style={{ float: 'left' }}
          >
            <input
              checked={this.state.selectedOption === 1}
              onChange={this.oncheckBoxClicked.bind(this, 1)}
              style={{ float: 'left' }}
              type="radio"
              value="1"
            />
            <span
              style={{
                float: 'left',
                width: '292px',
              }}
            >
              Set all paragraphs with this style to Normal
            </span>
          </div>
          <div
            className="molsp-formp molsp-deleteoptions"
            style={{ float: 'left' }}
          >
            <input
              checked={this.state.selectedOption === 2}
              name="nextlinestyle"
              onChange={this.oncheckBoxClicked.bind(this, 2)}
              style={{ float: 'left' }}
              type="radio"
              value="2"
            />
            <span
              style={{
                float: 'left',
                width: '292px',
              }}
            >
              Set all paragraphs with this style to the following style
            </span>
            <span
              id="nextStyle"
              style={{
                visibility:
                  this.state.selectedOption === 2 ? 'visible' : 'hidden',
              }}
            >
              <select
                className="molsp-deletefontstyle molsp-delete-stylenameinput"
                id="nextStyleValue"
                onChange={this.onStyleSelectionChanged.bind(this)}
                style={{
                  height: '20px',
                  marginTop: '10px',
                  width: '110px',
                }}
                value={this.state.selectedStylename}
              >
                {customStyles.map((style) => (
                  <option key={style.styleName}>{style.styleName}</option>
                ))}
              </select>
            </span>
          </div>
          <div
            className="molsp-delete-btns"
            style={{
              clear: 'both',
              marginTop: this.state.selectedOption === 2 ? '10px' : '30px',
              marginLeft: '268px',
            }}
          >
            <button
              className="molsp-delete-btnsave molsp-delete-buttonstyle"
              data-cy="cyStyleSave"
              onClick={this._save.bind(this)}
            >
              OK
            </button>
            <button
              className="molsp-delete-buttonstyle"
              data-cy="cyStyleCancel"
              onClick={this._cancel}
            >
              {this.state.mode === 3 ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  _cancel = (): void => {
    this.props.close();
  };

  _save = (): void => {
    // eslint-disable-next-line
    const { otherStyleSelected, ...newState } = this.state;
    // Update the state with the new state object
    this.setState(newState);
    this.props.close(newState);
  };
}
