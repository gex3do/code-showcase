import React from 'react';
import {screen} from '@testing-library/react';

import {TaskListItem} from './TaskListItem';

import {renderWithRedux} from '../../test/renderWithRedux';
import dates from '../../libs/dates';

const defaultItemProps = {
  id: 666,
  age: 34,
  assignee: 'whoevercares',
  count: 467,
  escalated: false,
  title: 'Default Title',
};

describe('The TaskListItem', () => {
  const getMinutesFromNow = jest.spyOn(dates, 'getMinutesFromNow');

  it.each([
    ['Render me properly, please', [], 'Render me properly, please'],
    ['Render me properly, please', ['dev'], 'Render me properly, pleasedev'],
    [
      'Render me properly, please',
      ['dev', 'test'],
      'Render me properly, pleasedev | test',
    ],
  ])('renders the primary text correctly', (title, viewers, expected) => {
    const props = {item: {...defaultItemProps, title}, viewers, listId: 23};
    renderWithRedux(<TaskListItem {...props} />);
    expect(screen.getByTestId('task-list-item-23-primary').textContent).toBe(
      expected
    );
  });

  it.each([
    [42, undefined, 'for 42 min'],
    [42, 'taskmaster', 'for 42 min / taskmaster'],
  ])(
    'renders the secondary text correctly | assignee: %p, age: %p',
    (age, assignee, result) => {
      getMinutesFromNow.mockReturnValue(age);
      const props = {item: {...defaultItemProps, assignee, age}, listId: 23};
      renderWithRedux(<TaskListItem {...props} />);
      expect(
        screen.getByTestId('task-list-item-23-secondary').textContent
      ).toBe(result);
    }
  );

  it.each([[true], [false]])(
    'honors `escalated` property (value: %p) wrt child props',
    escalated => {
      const props = {item: {...defaultItemProps, escalated}, listId: 23};
      renderWithRedux(<TaskListItem {...props} />);
      expect(
        screen.getByTestId('task-list-item-23').classList.contains('escalated')
      ).toBe(escalated);
    }
  );

  beforeEach(() => {
    getMinutesFromNow.mockClear();
  });
});
