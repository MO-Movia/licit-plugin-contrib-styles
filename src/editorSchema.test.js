import { applyEffectiveSchema } from './EditorSchema';

describe('EditorSchema', () => {
    const mockSchema = {
        nodes: {
            doc: {
                content: 'paragraph+',
            },
            paragraph:
            {
                attrs: {
                    align: {
                        default: null
                    },
                    color: {
                        default: null
                    },
                    id: {
                        default: null
                    },
                    indent: {
                        default: null
                    },
                    lineSpacing: {
                        default: null
                    },
                    paddingBottom: {
                        default: null
                    },
                    paddingTop: {
                        default: null
                    },
                    capco: {
                        default: null
                    }
                },
                content: 'inline*',
                group: 'block',
                parseDOM: [
                    {
                        tag: 'p'
                    }
                ]
            },
        },
        marks: {
            link: {
                attrs: {
                    href: 'test_href'
                }
            },
            em: {
                parseDOM: [{
                    tag: 'i'
                }, {
                    tag: 'em'
                }, {
                    style: 'font-style=italic'
                }],
                attrs: {
                    overridden: {
                        hasDefault: true,
                        default: false
                    }
                }
            },
            strong: {
                parseDOM: [{
                    tag: 'strong'
                }, {
                    tag: 'b'
                }, {
                    style: 'font-weight'
                }],
                attrs: {
                    overridden: {
                        hasDefault: true,
                        default: false
                    }
                }
            }, underline: {
                parseDOM: [{
                    tag: 'u'
                }, {
                    style: 'text-decoration-line'
                }, {
                    style: 'text-decoration'
                }],
                attrs: {
                    overridden: {
                        hasDefault: true,
                        default: false
                    }
                }
            }
        },
        spec: {
            nodes: {
                doc: {
                    content: 'paragraph+',
                },
                content: [
                    'doc',
                    {
                        'attrs': {
                            'layout': {
                                'default': null
                            },
                            'padding': {
                                'default': null
                            },
                            'width': {
                                'default': null
                            },
                            'counterFlags': {
                                'default': null
                            },
                            'capcoMode': {
                                'default': 0
                            }
                        },
                        'content': 'block+'
                    },
                    'paragraph',
                    {
                        'attrs': {
                            'align': {
                                'default': null
                            },
                            'color': {
                                'default': null
                            },
                            'id': {
                                'default': null
                            },
                            'indent': {
                                'default': null
                            },
                            'lineSpacing': {
                                'default': null
                            },
                            'paddingBottom': {
                                'default': null
                            },
                            'paddingTop': {
                                'default': null
                            },
                            'capco': {
                                'default': null
                            }
                        },
                        'content': 'inline*',
                        'group': 'block',
                        'parseDOM': [
                            {
                                'tag': 'p'
                            }
                        ]
                    },
                    'blockquote',
                    {
                        'attrs': {
                            'align': {
                                'default': null
                            },
                            'color': {
                                'default': null
                            },
                            'id': {
                                'default': null
                            },
                            'indent': {
                                'default': null
                            },
                            'lineSpacing': {
                                'default': null
                            },
                            'paddingBottom': {
                                'default': null
                            },
                            'paddingTop': {
                                'default': null
                            },
                            'capco': {
                                'default': null
                            }
                        },
                        'content': 'inline*',
                        'group': 'block',
                        'parseDOM': [
                            {
                                'tag': 'blockquote'
                            }
                        ],
                        'defining': true
                    },
                    'horizontal_rule',
                    {
                        'attrs': {
                            'pageBreak': {
                                'default': null
                            }
                        },
                        'group': 'block',
                        'parseDOM': [
                            {
                                'tag': 'hr'
                            }
                        ]
                    },
                    'heading',
                    {
                        'attrs': {
                            'align': {
                                'default': null
                            },
                            'color': {
                                'default': null
                            },
                            'id': {
                                'default': null
                            },
                            'indent': {
                                'default': null
                            },
                            'lineSpacing': {
                                'default': null
                            },
                            'paddingBottom': {
                                'default': null
                            },
                            'paddingTop': {
                                'default': null
                            },
                            'level': {
                                'default': 1
                            },
                            'capco': {
                                'default': null
                            }
                        },
                        'content': 'inline*',
                        'group': 'block',
                        'parseDOM': [
                            {
                                'tag': 'h1'
                            },
                            {
                                'tag': 'h2'
                            },
                            {
                                'tag': 'h3'
                            },
                            {
                                'tag': 'h4'
                            },
                            {
                                'tag': 'h5'
                            },
                            {
                                'tag': 'h6'
                            }
                        ],
                        'defining': true
                    },
                    'text',
                    {
                        'group': 'inline'
                    },
                    'math',
                    {
                        'inline': true,
                        'attrs': {
                            'align': {
                                'default': null
                            },
                            'latex': {
                                'default': ''
                            }
                        },
                        'group': 'inline',
                        'draggable': true,
                        'parseDOM': [
                            {
                                'tag': 'math[data-latex]'
                            },
                            {
                                'tag': 'span[data-latex]'
                            }
                        ]
                    },
                    'hard_break',
                    {
                        'inline': true,
                        'group': 'inline',
                        'selectable': false,
                        'parseDOM': [
                            {
                                'tag': 'br'
                            }
                        ]
                    },
                    'bullet_list',
                    {
                        'attrs': {
                            'id': {
                                'default': null
                            },
                            'indent': {
                                'default': 0
                            },
                            'listStyleType': {
                                'default': null
                            }
                        },
                        'group': 'block',
                        'content': 'list_item+',
                        'parseDOM': [
                            {
                                'tag': 'ul'
                            }
                        ]
                    },
                    'ordered_list',
                    {
                        'attrs': {
                            'id': {
                                'default': null
                            },
                            'counterReset': {
                                'default': null
                            },
                            'indent': {
                                'default': 0
                            },
                            'following': {
                                'default': null
                            },
                            'listStyleType': {
                                'default': null
                            },
                            'name': {
                                'default': null
                            },
                            'start': {
                                'default': 1
                            },
                            'type': {
                                'default': 'decimal'
                            },
                            'styleName': {
                                'default': 'None'
                            }
                        },
                        'group': 'block',
                        'content': 'list_item+',
                        'parseDOM': [
                            {
                                'tag': 'ol'
                            }
                        ]
                    },
                    'list_item',
                    {
                        'attrs': {
                            'align': {
                                'default': null
                            }
                        },
                        'content': 'paragraph block*',
                        'parseDOM': [
                            {
                                'tag': 'li'
                            }
                        ]
                    },
                    'bookmark',
                    {
                        'inline': true,
                        'attrs': {
                            'id': {
                                'default': null
                            },
                            'visible': {
                                'default': null
                            }
                        },
                        'group': 'inline',
                        'draggable': true,
                        'parseDOM': [
                            {
                                'tag': 'a[data-bookmark-id]'
                            }
                        ]
                    },
                    'table',
                    {
                        'content': 'table_row+',
                        'tableRole': 'table',
                        'isolating': true,
                        'group': 'block',
                        'parseDOM': [
                            {
                                'tag': 'table',
                                'style': 'border'
                            }
                        ],
                        'attrs': {
                            'marginLeft': {
                                'default': null
                            },
                            'vignette': {
                                'default': false
                            }
                        }
                    },
                    'table_row',
                    {
                        'content': '(table_cell | table_header)*',
                        'tableRole': 'row',
                        'parseDOM': [
                            {
                                'tag': 'tr'
                            }
                        ]
                    },
                    'table_cell',
                    {
                        'content': 'block+',
                        'attrs': {
                            'colspan': {
                                'default': 1
                            },
                            'rowspan': {
                                'default': 1
                            },
                            'colwidth': {
                                'default': null
                            },
                            'borderColor': {
                                'default': null
                            },
                            'background': {
                                'default': null
                            },
                            'vignette': {
                                'default': false
                            }
                        },
                        'tableRole': 'cell',
                        'isolating': true,
                        'parseDOM': [
                            {
                                'tag': 'td'
                            }
                        ]
                    },
                    'table_header',
                    {
                        'content': 'block+',
                        'attrs': {
                            'colspan': {
                                'default': 1
                            },
                            'rowspan': {
                                'default': 1
                            },
                            'colwidth': {
                                'default': null
                            },
                            'borderColor': {
                                'default': null
                            },
                            'background': {
                                'default': null
                            }
                        },
                        'tableRole': 'header_cell',
                        'isolating': true,
                        'parseDOM': [
                            {
                                'tag': 'th'
                            }
                        ]
                    }
                ],
                text: {},
                paragraph: {
                    content: 'text*',
                    group: 'block',
                    parseDOM: [{ tag: 'p' }],
                    toDOM() {
                        return ['p', 0];
                    },
                },
            },
            marks: {
                content: ['link', { 'attrs': { 'href': { 'default': null }, 'rel': { 'default': 'noopener noreferrer nofollow' }, 'target': { 'default': 'blank' }, 'title': { 'default': null } }, 'inclusive': false, 'parseDOM': [{ 'tag': 'a[href]' }] }, 'mark-no-break', { 'parseDOM': [{ 'tag': 'nobr' }] }, 'code', { 'parseDOM': [{ 'tag': 'code' }] }, 'em', { 'parseDOM': [{ 'tag': 'i' }, { 'tag': 'em' }, { 'style': 'font-style=italic' }] }, 'mark-font-size', { 'attrs': { 'pt': { 'default': null } }, 'inline': true, 'group': 'inline', 'parseDOM': [{ 'style': 'font-size' }] }, 'mark-font-type', { 'attrs': { 'name': '' }, 'inline': true, 'group': 'inline', 'parseDOM': [{ 'style': 'font-family' }] }, 'spacer', { 'attrs': { 'size': { 'default': 'tab' } }, 'defining': true, 'draggable': false, 'excludes': '_', 'group': 'inline', 'inclusive': false, 'inline': true, 'spanning': false, 'parseDOM': [{ 'tag': 'span[data-spacer-size]' }] }, 'strike', { 'parseDOM': [{ 'style': 'text-decoration' }] }, 'strong', { 'parseDOM': [{ 'tag': 'strong' }, { 'tag': 'b' }, { 'style': 'font-weight' }] }, 'super', { 'parseDOM': [{ 'tag': 'sup' }, { 'style': 'vertical-align' }] }, 'sub', { 'parseDOM': [{ 'tag': 'sub' }, { 'style': 'vertical-align' }] }, 'mark-text-color', { 'attrs': { 'color': '' }, 'inline': true, 'group': 'inline', 'parseDOM': [{ 'style': 'color' }] }, 'mark-text-highlight', { 'attrs': { 'highlightColor': '' }, 'inline': true, 'group': 'inline', 'parseDOM': [{ 'tag': 'span[style*=background-color]' }] }, 'mark-text-selection', { 'attrs': { 'id': '' }, 'inline': true, 'group': 'inline', 'parseDOM': [{ 'tag': 'czi-text-selection' }] }, 'underline', { 'parseDOM': [{ 'tag': 'u' }, { 'style': 'text-decoration-line' }, { 'style': 'text-decoration' }] }]
            }
        },
    };
    it('Should handle effectiveSchema', () => {
        expect(applyEffectiveSchema(mockSchema)).toBeDefined();
    });
    it('Should handle effectiveSchema when schema not present', () => {
        expect(applyEffectiveSchema(null)).toBeDefined();
    });
    it('Should handle effectiveSchema when schema does not have paragraph node', () => {
        const mockSchema = {
            nodes: {
                doc: {
                    content: 'block+',
                },
                paragraph:
                {
                    attrs: {},
                    content: 'inline*',
                    group: 'block',
                    parseDOM: [
                        {
                            tag: 'p'
                        }
                    ]
                },
            },
            marks: {
                link: {
                    attrs: {
                    }
                },
                em: {
                    parseDOM: [{
                        tag: 'i'
                    }, {
                        tag: 'em'
                    }, {
                        style: 'font-style=italic'
                    }],
                },
                strong: {
                    parseDOM: [{
                        tag: 'strong'
                    }, {
                        tag: 'b'
                    }, {
                        style: 'font-weight'
                    }],
                    attrs: {
                        overridden: {
                            hasDefault: true,
                            default: false
                        }
                    }
                }, underline: {
                    parseDOM: [{
                        tag: 'u'
                    }, {
                        style: 'text-decoration-line'
                    }, {
                        style: 'text-decoration'
                    }],
                }
            },
            spec: { nodes: { content: [] }, marks: { content: [] } },
        };
        expect(applyEffectiveSchema(mockSchema)).toBeDefined();
    });
    it('Should handle effectiveSchema when schema does not have paragraph node', () => {
        const mockSchema = {
            nodes: {
                doc: {
                    content: 'paragraph+',
                },
                paragraph:
                {
                    attrs: {
                        align: {
                            default: null
                        },
                        color: {
                            default: null
                        },
                        id: {
                            default: null
                        },
                        indent: {
                            default: null
                        },
                        lineSpacing: {
                            default: null
                        },
                        paddingBottom: {
                            default: null
                        },
                        paddingTop: {
                            default: null
                        },
                        capco: {
                            default: null
                        }
                    },
                    content: 'inline*',
                    group: 'block',
                    parseDOM: [
                        {
                            tag: 'p'
                        }
                    ]
                },
            },
            marks: {
                link: {
                    attrs: {
                        href: 'test_href'
                    }
                },
                em: {
                    parseDOM: [{
                        tag: 'i'
                    }, {
                        tag: 'em'
                    }, {
                        style: 'font-style=italic'
                    }],
                    attrs: {
                        overridden: {
                            hasDefault: true,
                            default: false
                        }
                    }
                },
                strong: {
                    parseDOM: [{
                        tag: 'strong'
                    }, {
                        tag: 'b'
                    }, {
                        style: 'font-weight'
                    }],
                    attrs: {
                        overridden: {
                            hasDefault: true,
                            default: false
                        }
                    }
                }, underline: {
                    parseDOM: [{
                        tag: 'u'
                    }, {
                        style: 'text-decoration-line'
                    }, {
                        style: 'text-decoration'
                    }],
                    attrs: {
                        overridden: {
                            hasDefault: true,
                            default: false
                        }
                    }
                }

            },
            spec: {
                nodes: {
                    doc: {
                        content: 'paragraph+',
                    },
                    content: [
                        'doc',
                        {
                            'attrs': {
                                'layout': {
                                    'default': null
                                },
                                'padding': {
                                    'default': null
                                },
                                'width': {
                                    'default': null
                                },
                                'counterFlags': {
                                    'default': null
                                },
                                'capcoMode': {
                                    'default': 0
                                }
                            },
                            'content': 'block+'
                        },
                        'paragraph',
                        {
                            'attrs': {
                                'align': {
                                    'default': null
                                },
                                'color': {
                                    'default': null
                                },
                                'id': {
                                    'default': null
                                },
                                'indent': {
                                    'default': null
                                },
                                'lineSpacing': {
                                    'default': null
                                },
                                'paddingBottom': {
                                    'default': null
                                },
                                'paddingTop': {
                                    'default': null
                                },
                                'capco': {
                                    'default': null
                                }
                            },
                            'content': 'inline*',
                            'group': 'block',
                            'parseDOM': [
                                {
                                    'tag': 'p'
                                }
                            ]
                        },
                        'blockquote',
                        {
                            'attrs': {
                                'align': {
                                    'default': null
                                },
                                'color': {
                                    'default': null
                                },
                                'id': {
                                    'default': null
                                },
                                'indent': {
                                    'default': null
                                },
                                'lineSpacing': {
                                    'default': null
                                },
                                'paddingBottom': {
                                    'default': null
                                },
                                'paddingTop': {
                                    'default': null
                                },
                                'capco': {
                                    'default': null
                                }
                            },
                            'content': 'inline*',
                            'group': 'block',
                            'parseDOM': [
                                {
                                    'tag': 'blockquote'
                                }
                            ],
                            'defining': true
                        },
                        'horizontal_rule',
                        {
                            'attrs': {
                                'pageBreak': {
                                    'default': null
                                }
                            },
                            'group': 'block',
                            'parseDOM': [
                                {
                                    'tag': 'hr'
                                }
                            ]
                        },
                        'heading',
                        {
                            'attrs': {
                                'align': {
                                    'default': null
                                },
                                'color': {
                                    'default': null
                                },
                                'id': {
                                    'default': null
                                },
                                'indent': {
                                    'default': null
                                },
                                'lineSpacing': {
                                    'default': null
                                },
                                'paddingBottom': {
                                    'default': null
                                },
                                'paddingTop': {
                                    'default': null
                                },
                                'level': {
                                    'default': 1
                                },
                                'capco': {
                                    'default': null
                                }
                            },
                            'content': 'inline*',
                            'group': 'block',
                            'parseDOM': [
                                {
                                    'tag': 'h1'
                                },
                                {
                                    'tag': 'h2'
                                },
                                {
                                    'tag': 'h3'
                                },
                                {
                                    'tag': 'h4'
                                },
                                {
                                    'tag': 'h5'
                                },
                                {
                                    'tag': 'h6'
                                }
                            ],
                            'defining': true
                        },
                        'text',
                        {
                            'group': 'inline'
                        },
                        'math',
                        {
                            'inline': true,
                            'attrs': {
                                'align': {
                                    'default': null
                                },
                                'latex': {
                                    'default': ''
                                }
                            },
                            'group': 'inline',
                            'draggable': true,
                            'parseDOM': [
                                {
                                    'tag': 'math[data-latex]'
                                },
                                {
                                    'tag': 'span[data-latex]'
                                }
                            ]
                        },
                        'hard_break',
                        {
                            'inline': true,
                            'group': 'inline',
                            'selectable': false,
                            'parseDOM': [
                                {
                                    'tag': 'br'
                                }
                            ]
                        },
                        'bullet_list',
                        {
                            'attrs': {
                                'id': {
                                    'default': null
                                },
                                'indent': {
                                    'default': 0
                                },
                                'listStyleType': {
                                    'default': null
                                }
                            },
                            'group': 'block',
                            'content': 'list_item+',
                            'parseDOM': [
                                {
                                    'tag': 'ul'
                                }
                            ]
                        },
                        'ordered_list',
                        {
                            'attrs': {
                                'id': {
                                    'default': null
                                },
                                'counterReset': {
                                    'default': null
                                },
                                'indent': {
                                    'default': 0
                                },
                                'following': {
                                    'default': null
                                },
                                'listStyleType': {
                                    'default': null
                                },
                                'name': {
                                    'default': null
                                },
                                'start': {
                                    'default': 1
                                },
                                'type': {
                                    'default': 'decimal'
                                },
                                'styleName': {
                                    'default': 'None'
                                }
                            },
                            'group': 'block',
                            'content': 'list_item+',
                            'parseDOM': [
                                {
                                    'tag': 'ol'
                                }
                            ]
                        },
                        'list_item',
                        {
                            'attrs': {
                                'align': {
                                    'default': null
                                }
                            },
                            'content': 'paragraph block*',
                            'parseDOM': [
                                {
                                    'tag': 'li'
                                }
                            ]
                        },
                        'bookmark',
                        {
                            'inline': true,
                            'attrs': {
                                'id': {
                                    'default': null
                                },
                                'visible': {
                                    'default': null
                                }
                            },
                            'group': 'inline',
                            'draggable': true,
                            'parseDOM': [
                                {
                                    'tag': 'a[data-bookmark-id]'
                                }
                            ]
                        },
                        'table',
                        {
                            'content': 'table_row+',
                            'tableRole': 'table',
                            'isolating': true,
                            'group': 'block',
                            'parseDOM': [
                                {
                                    'tag': 'table',
                                    'style': 'border'
                                }
                            ],
                            'attrs': {
                                'marginLeft': {
                                    'default': null
                                },
                                'vignette': {
                                    'default': false
                                }
                            }
                        },
                        'table_row',
                        {
                            'content': '(table_cell | table_header)*',
                            'tableRole': 'row',
                            'parseDOM': [
                                {
                                    'tag': 'tr'
                                }
                            ]
                        },
                        'table_cell',
                        {
                            'content': 'block+',
                            'attrs': {
                                'colspan': {
                                    'default': 1
                                },
                                'rowspan': {
                                    'default': 1
                                },
                                'colwidth': {
                                    'default': null
                                },
                                'borderColor': {
                                    'default': null
                                },
                                'background': {
                                    'default': null
                                },
                                'vignette': {
                                    'default': false
                                }
                            },
                            'tableRole': 'cell',
                            'isolating': true,
                            'parseDOM': [
                                {
                                    'tag': 'td'
                                }
                            ]
                        },
                        'table_header',
                        {
                            'content': 'block+',
                            'attrs': {
                                'colspan': {
                                    'default': 1
                                },
                                'rowspan': {
                                    'default': 1
                                },
                                'colwidth': {
                                    'default': null
                                },
                                'borderColor': {
                                    'default': null
                                },
                                'background': {
                                    'default': null
                                }
                            },
                            'tableRole': 'header_cell',
                            'isolating': true,
                            'parseDOM': [
                                {
                                    'tag': 'th'
                                }
                            ]
                        }
                    ],
                    text: {},
                    paragraph: {
                        content: 'text*',
                        group: 'block',
                        parseDOM: [{ tag: 'p' }],
                        toDOM() {
                            return ['p', 0];
                        },
                    },
                },
                marks: {
                    content: ['link', { 'attrs': { 'href': { 'default': null }, 'rel': { 'default': 'noopener noreferrer nofollow' }, 'target': { 'default': 'blank' }, 'title': { 'default': null } }, 'inclusive': false, 'parseDOM': [{ 'tag': 'a[href]' }] }, 'mark-no-break', { 'parseDOM': [{ 'tag': 'nobr' }] }, 'code', { 'parseDOM': [{ 'tag': 'code' }] }, 'em', { 'parseDOM': [{ 'tag': 'i' }, { 'tag': 'em' }, { 'style': 'font-style=italic' }] }, 'mark-font-size', { 'attrs': { 'pt': { 'default': null } }, 'inline': true, 'group': 'inline', 'parseDOM': [{ 'style': 'font-size' }] }, 'mark-font-type', { 'attrs': { 'name': '' }, 'inline': true, 'group': 'inline', 'parseDOM': [{ 'style': 'font-family' }] }, 'spacer', { 'attrs': { 'size': { 'default': 'tab' } }, 'defining': true, 'draggable': false, 'excludes': '_', 'group': 'inline', 'inclusive': false, 'inline': true, 'spanning': false, 'parseDOM': [{ 'tag': 'span[data-spacer-size]' }] }, 'strike', { 'parseDOM': [{ 'style': 'text-decoration' }] }, 'strong', { 'parseDOM': [{ 'getAttrs': {} }] }, 'super', { 'parseDOM': [{ 'tag': 'sup' }, { 'style': 'vertical-align' }] }, 'sub', { 'parseDOM': [{ 'tag': 'sub' }, { 'style': 'vertical-align' }] }, 'mark-text-color', { 'attrs': { 'color': '' }, 'inline': true, 'group': 'inline', 'parseDOM': [{ 'style': 'color' }] }, 'mark-text-highlight', { 'attrs': { 'highlightColor': '' }, 'inline': true, 'group': 'inline', 'parseDOM': [{ 'tag': 'span[style*=background-color]' }] }, 'mark-text-selection', { 'attrs': { 'id': '' }, 'inline': true, 'group': 'inline', 'parseDOM': [{ 'tag': 'czi-text-selection' }] }, 'underline', { 'parseDOM': [{ 'tag': 'u' }, { 'style': 'text-decoration-line' }, { 'style': 'text-decoration' }] }]

                }
            },
        };
        expect(applyEffectiveSchema(mockSchema)).toBeDefined();
    });
});
