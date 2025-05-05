import { Icon, SubscriptIcon, SuperscriptIcon } from './Icon';

describe('Icon', () => {
  const props = {
    type: 'superscript',
    title: '',
  };
  const icon = new Icon(props);
  it('should handle icon', () => {
    expect(icon).toBeDefined();
  });
  it('should handle render when props is superscript', () => {
    const props = {
      type: 'superscript',
      title: '',
    };
    const icon = new Icon(props);
    expect(icon.render()).toBeDefined();
    expect(new SuperscriptIcon({}).render()).toBeDefined();
  });
  it('should handle render when props is subscript', () => {
    const props = {
      type: 'subscript',
      title: '',
    };
    const icon = new Icon(props);
    expect(icon.render()).toBeDefined();
    expect(new SubscriptIcon({}).render()).toBeDefined();
  });

  it('should handle render when props anything else', () => {
    const props = {
      type: 'any',
      title: '',
    };
    const icon = new Icon(props);

    expect(icon.render()).toBeDefined();
  });
  it('should handle render when props is null', () => {
    const props = {
      type: '',
      title: '',
    };
    const icon = new Icon(props);

    expect(icon.render()).toBeDefined();
  });

  it('should handle render when props is null', () => {
    expect(Icon.get('', 'edit')).toBeDefined();
  });
});
