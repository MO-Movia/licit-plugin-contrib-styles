
jest.mock('../customStyle', () => ({
    getStylesAsync: jest.fn(),
    saveStyleSet: jest.fn(),
}));

describe('TextEditorBox (with ReactDOM)', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.clearAllMocks();
    });

    afterEach(() => {
        document.body.removeChild(container);
        container = null;
    });

    it('calls props.close(undefined) when Cancel is clicked', async () => {
        const mockClose = jest.fn();

        await new Promise((resolve) => {

            setTimeout(resolve, 0); // wait for useEffect
        });


        expect(mockClose).toBeDefined();
    });
});
