import Icon from './Icon';

describe('Icon', () => {
  const props = {
    type: 'superscript',
    title: ''
  };
  const icon = new Icon(props);
  it('should handle icon', () => {
    expect(icon).toBeDefined();
  });
  it('should handle render when props is superscript', () => {
    icon.props = {
      type: 'superscript',
      title: ''
    };
    expect(icon.render()).toBeDefined();
  });
  it('should handle render when props is subscript', () => {
    icon.props = {
      type: 'subscript',
      title: ''
    };
    expect(icon.render()).toBeDefined();
  });

  it('should handle render when props anything else', () => {
    icon.props = {
      type: 'any',
      title: ''
    };
    expect(icon.render()).toBeDefined();
  });
  it('should handle render when props is null', () => {
    icon.props = {
      type: null,
      title: ''
    };
    expect(icon.render()).toBeDefined();
  });

  it('should handle render when props is null', () => {
    expect(Icon.get(null, 'edit')).toBeDefined();
  });
});

