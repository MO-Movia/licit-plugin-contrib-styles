import React from 'react';
import ReactDOM from 'react-dom';
import TextEditorBox from './JSONEditor';

jest.mock('../customStyle', () => ({
    getStylesAsync: jest.fn(() => Promise.resolve([{ name: 'style1' }])),
    saveStyleSet: jest.fn(() => Promise.resolve(true)),
}));


describe('TextEditorBox  (ReactDOM)', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('calls close(undefined) on cancel', () => {
        const closeMock = jest.fn();
        ReactDOM.render(<TextEditorBox close={closeMock} />, container);

        const cancelBtn = container.querySelector('button') as HTMLButtonElement;
        cancelBtn.click();

        expect(closeMock).toHaveBeenCalledWith(undefined);
    });


    it('shows error on invalid JSON', async () => {
        ReactDOM.render(<TextEditorBox close={jest.fn()} />, container);

        const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
        const saveBtn = container.querySelectorAll('button')[1] as HTMLButtonElement;

        textarea.value = 'invalid json';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        await saveBtn.click();

        expect(container.textContent).toMatch(/Failed to save custom styles/);
    });
});
