import React, { useEffect, useState } from 'react';
import { getStylesAsync, saveStyleSet } from '../customStyle';
import type { Style } from '../StyleRuntime.js';

export default function TextEditorBox(props) {
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    // Load styles on component mount
    useEffect(() => {
        getStylesAsync().then((result) => {
            setText(JSON.stringify(result, null, 2)); // prettified JSON
        });
    }, []);

    const handleSave = () => {
        try {
            const styles: Style[] = JSON.parse(text);
            saveStyleSet(styles).then((result) => {
                if (result) {
                    props.close(text);
                }

            });
        } catch (error) {
            setError('Failed to save custom styles.' + error);
        }

    };

    const handleCancel = () => {
        props.close(undefined);
    };

    return (
        <div
            style={{
                width: 500,
                padding: 20,
                border: '1px solid #ccc',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                fontFamily: 'Arial, sans-serif',
                minWidth: '400px',
                background: 'whitesmoke',
                maxWidth: '800px'
            }}
        >
            <div
                style={{
                    fontWeight: 'bold',
                    marginBottom: 12,
                    fontSize: 16,
                    color: '#333',
                }}
            >
                {props.label || 'Custom Style JSON Editor'}
            </div>
            <textarea
                onChange={(e) => setText(e.target.value)}
                style={{
                    height: 380,
                    padding: 8,
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    resize: 'vertical',
                    fontSize: 14,
                    maxWidth: '800px',
                    minWidth: '452px',
                    maxHeight: '700px',
                }}
                value={text}
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 16,
                    gap: 10,
                }}
            >
                <button
                    onClick={handleCancel}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#eee',
                        border: '1px solid #bbb',
                        borderRadius: 4,
                        cursor: 'pointer',
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#007BFF',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                    }}
                >
                    Save
                </button>
            </div>
            {error && (
                <div
                    style={{
                        color: 'red',
                        fontSize: '12px',
                        marginTop: '10px',
                        textAlign: 'right',
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    );
}