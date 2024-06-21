import React from 'react';
import {renderWithRedux} from '../../test/renderWithRedux';
import {TaskList} from './TaskList';

import {screen} from '@testing-library/react';
import * as hooks from '../../features/mwApiSlice';

describe('The TaskList', () => {
  const useGetTaskListQuery = jest.spyOn(hooks, 'useGetTaskListQuery');

  it.each([
    [
      {
        data: undefined,
        isError: true,
        isLoading: false,
      },
      {testId: 'tasklist-error'},
    ],
    [
      {
        data: undefined,
        isError: false,
        isLoading: true,
      },
      {testId: 'tasklist-loading'},
    ],
    [
      {
        data: [],
        isError: false,
        isLoading: false,
      },
      {testId: 'tasklist'},
    ],
  ])('renders the component', (tasks: any, result) => {
    useGetTaskListQuery.mockReturnValue(tasks);
    renderWithRedux(<TaskList />, {});
    expect(screen.getByTestId(result?.testId)).toBeDefined();
  });

  it.each([
    [
      {
        data: [],
        isError: false,
        isLoading: false,
      },
      {content: 'No open tasks - you lucky one'},
    ],
    [
      {
        data: [
          {
            title: 'Alert: Syren-Tripwire',
            count: 1,
          },
        ],
        isError: false,
        isLoading: false,
      },
      {shownTasksQty: 1},
    ],
    [
      {
        data: [
          {
            title: 'Test-Alert 1',
            count: 1,
          },
          {
            title: 'Test-Alert 2',
            count: 1,
          },
          {
            title: 'Test-Alert 3',
            count: 1,
          },
          {
            title: 'Test-Alert 4',
            count: 1,
          },
          {
            title: 'Test-Alert 5',
            count: 1,
          },
          {
            title: 'Test-Alert 6',
            count: 1,
          },
          {
            title: 'Test-Alert 7',
            count: 1,
          },
          {
            title: 'Test-Alert 8',
            count: 1,
          },
          {
            title: 'Test-Alert 9',
            count: 1,
          },
          {
            title: 'Test-Alert 10',
            count: 1,
          },
          {
            title: 'Test-Alert 11',
            count: 1,
          },
        ],
        isError: false,
        isLoading: false,
      },
      {shownTasksQty: 10, content: '... and 1 more.'},
    ],
  ])(
    'checks rendered component with different task items',
    (tasks: any, result: any) => {
      useGetTaskListQuery.mockReturnValue(tasks);
      renderWithRedux(<TaskList />, {});

      if (tasks.data.length === 0) {
        expect(screen.getByTestId('tasklist')).toContainHTML(result.content);
      } else {
        expect(screen.getByTestId('tasklist-items')).toBeDefined();
        expect(screen.getByTestId('tasklist-items').children.length).toBe(
          result.shownTasksQty
        );
      }

      if (tasks.data.length > 10) {
        expect(screen.getByTestId('tasklist')).toContainHTML(result.content);
      }
    }
  );

  beforeEach(() => {
    useGetTaskListQuery.mockClear();
  });
});
