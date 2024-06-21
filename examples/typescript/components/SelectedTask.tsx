import React, {useEffect} from 'react';

import {Box, CircularProgress, Grid} from '@mui/material';

import {useGetTaskQuery} from '../features/mwApiSlice';
import {selectTask, unselectTask} from '../features/selectedTaskSlice';
import {useDispatch, useSocket} from '../app/hooks';
import {skipToken} from '@reduxjs/toolkit/query/react';
import {TaskWidget, TaskWidgetData, Widgets} from './widgets';
import {ErrorPlaceholderWidget} from './widgets/ErrorPlaceholder';
import {TaskHeader} from './TaskHeader';

interface SelectedTaskProps {
  taskId: string | undefined;
}

export const SelectedTask = (props: SelectedTaskProps) => {
  const {taskId} = props;

  const dispatch = useDispatch();
  const socket = useSocket();

  useEffect(() => {
    if (taskId) {
      dispatch(selectTask(taskId));
    } else {
      dispatch(unselectTask());
    }
    if (socket) {
      socket.emit('select_task', {taskId});
    }
  }, [taskId]);

  const {data, isLoading, isFetching, isError, error} = useGetTaskQuery(
    Number(taskId) ?? skipToken,
    {refetchOnMountOrArgChange: true}
  );

  if (data && taskId !== undefined) {
    return (
      <Box
        sx={{width: '100%', marginLeft: '1px'}}
        data-testid="selectedtask-item"
      >
        <TaskHeader task={data} />
        <Grid container spacing={1}>
          {data.payload?.widgets.map((widget: TaskWidget, index: number) => {
            const Widget =
              Widgets[widget.type] ?? ErrorPlaceholderWidget(widget);
            const widgetData: TaskWidgetData = {
              ...widget.data,
              extraData: data?.payload?.data,
            };
            return (
              <Grid item md={12} key={index}>
                <Widget {...widgetData} />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{width: '100%', textAlign: 'center'}}
        data-testid="selectedtask-item-error"
      >
        {error}
      </Box>
    );
  }

  if (isLoading || isFetching) {
    return (
      <Box
        sx={{width: '100%', textAlign: 'center'}}
        data-testid="selectedtask-item-loading"
      >
        <CircularProgress />
      </Box>
    );
  }

  return <></>;
};
