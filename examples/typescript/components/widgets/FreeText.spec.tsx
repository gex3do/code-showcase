import React from 'react';
import {render, screen} from '@testing-library/react';
import {FreeText} from './FreeText';

import renderer from 'react-test-renderer';

describe('The FreeText', () => {
  it.each([
    [
      'with icon and title',
      {
        icon: 'AlignHorizontalRight',
        title: 'Hello World',
        content:
          'Once upon a time in a place far away, lived a man named Gary Larson who used to draw cartoons.',
        textColor: '#fff000',
        bgColor: '#000000',
      },
      {
        icon: 'AlignHorizontalRight',
        headerText: 'Hello World',
        content:
          'Once upon a time in a place far away, lived a man named Gary Larson who used to draw cartoons.',
        textColor: '#fff000',
        bgColor: '#000000',
      },
    ],
    [
      'content only',
      {
        content:
          'He went into hiding. He made a couple short films. He threw sticks for his dogs. They threw some back.',
      },
      {
        content:
          'He went into hiding. He made a couple short films. He threw sticks for his dogs. They threw some back.',
      },
    ],
  ])('renders as expected | %s', (_, data, result: any) => {
    render(<FreeText {...data} />);

    expect(screen.getByTestId('freetext')).toBeDefined();

    if (result.icon) {
      expect(screen.getByTestId('freetext-icon')).toBeDefined();
    } else {
      expect(screen.queryByTestId('freetext-icon')).toBeNull();
    }

    if (result.headerText) {
      expect(screen.getByTestId('freetext-header')).toContainHTML(
        result.headerText
      );
    } else {
      expect(screen.queryByTestId('freetext-header')).toBeNull();
    }

    expect(screen.getByTestId('freetext-content')).toContainHTML(
      result.content
    );

    const tree = renderer.create(<FreeText {...data} />).toTree();
    expect(tree?.props.textColor).toBe(result.textColor);
    expect(tree?.props.bgColor).toBe(result.bgColor);
  });
});
