import React from 'react';

import {renderWithRedux} from '../test/renderWithRedux';
import {screen} from '@testing-library/react';
import {SelectedTask} from './SelectedTask';
import {TaskPriority, TaskStatus} from './TaskList';
import * as hooks from '../features/mwApiSlice';
import dates from '../libs/dates';

describe('The SelectedTask', () => {
  const useGetTaskQuery = jest.spyOn(hooks, 'useGetTaskQuery');
  const getMinutesFromNow = jest.spyOn(dates, 'getMinutesFromNow');
  getMinutesFromNow.mockReturnValue(500);

  it.each([
    [
      {
        data: [],
        isLoading: false,
        isFetching: false,
        isError: true,
        error: 'this gives an error',
      },
      {testId: 'selectedtask-item-error'},
    ],
    [
      {
        data: [],
        isLoading: true,
        isFetching: false,
        isError: false,
        error: null,
      },
      {testId: 'selectedtask-item-loading'},
    ],
    [
      {
        data: {
          id: '1',
          widgets: [],
        },
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
      },
      {testId: 'selectedtask-item'},
    ],
  ])('renders the component', (selectedTask: any, result) => {
    useGetTaskQuery.mockReturnValue(selectedTask);
    renderWithRedux(
      <SelectedTask
        taskId={selectedTask.data.id ? selectedTask.data.id : undefined}
      />,
      {}
    );
    expect(screen.getByTestId(result?.testId)).toBeDefined();
  });

  it.each([
    [
      {
        data: {
          id: '1',
          title: 'test a',
          assignee: 'test user',
          count: '4321',
          priority: TaskPriority.LOW,
          escalated: false,
          status: TaskStatus.OPEN,
          created: 1654013100,
          widgets: [],
        },
        isLoading: false,
        isError: false,
      },
      {
        testId: 'selectedtask-item',
        data: {
          id: '#1',
          title: 'test a',
          assignee: 'test user',
          priority: 'KeyboardArrowDownIcon',
          escalated: false,
          status: 'OPEN',
          ageInMinutes: '500 minutes',
        },
      },
    ],
    [
      {
        params: {taskId: 2},
        data: {
          id: '2',
          title: 'test b',
          assignee: 'test user',
          priority: TaskPriority.MEDIUM,
          escalated: true,
          status: TaskStatus.CLOSED,
          created: 1654013100,
          widgets: [],
        },
        loading: false,
        error: null,
      },
      {
        testId: 'selectedtask-item',
        data: {
          id: '#2',
          title: 'test b',
          assignee: 'test user',
          priority: 'PriorityHighIcon',
          status: 'CLOSED',
          ageInMinutes: '500 minutes',
        },
      },
    ],
  ])(
    'checks rendered component with different task data',
    (selectedTask: any, result) => {
      useGetTaskQuery.mockReturnValue(selectedTask);
      renderWithRedux(
        <SelectedTask
          taskId={selectedTask.data.id ? selectedTask.data.id : undefined}
        />,
        {}
      );

      expect(screen.getByTestId(result.testId)).toBeDefined();

      expect(screen.getByTestId('selectedtask-item-id')).toContainHTML(
        result.data.id
      );
      expect(screen.getByTestId('selectedtask-item-title')).toContainHTML(
        result.data.title
      );
      expect(screen.getByTestId('selectedtask-item-priority')).toContainHTML(
        result.data.priority
      );
      expect(screen.getByTestId('selectedtask-item-status')).toContainHTML(
        result.data.status
      );
      expect(
        screen.getByTestId('selectedtask-item-assignee-age')
      ).toContainHTML(result.data.ageInMinutes);
      expect(
        screen.getByTestId('selectedtask-item-assignee-age')
      ).toContainHTML(result.data.assignee);
    }
  );

  beforeEach(() => {
    useGetTaskQuery.mockClear();
    getMinutesFromNow.mockClear();
  });
});
