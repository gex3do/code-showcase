import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

import {Alert, Box, CircularProgress, List, Typography} from '@mui/material';

import {useSelector} from '../../app/hooks';

import {useGetTaskListQuery} from '../../features/mwApiSlice';
import {concurrentUsersByTaskId} from '../../features/clientSessionsSlice';
import {MoreText} from '../MoreText';
import {TaskListItem} from './TaskListItem';
import {Task} from './index';

const CONST = {
  TASKS_QTY: 10,
  TASKS_POLLING_INTERVAL: 5000,
};

export const TaskList = (props: any) => {
  const {clientSessions, ownSid} = props;

  const [pollingInterval, setPollingInterval] = useState(
    CONST.TASKS_POLLING_INTERVAL
  );
  const {data, isLoading, isFetching, isError, error} = useGetTaskListQuery(
    undefined,
    {
      pollingInterval: pollingInterval,
    }
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setPollingInterval(CONST.TASKS_POLLING_INTERVAL);
        return;
      }

      setPollingInterval(0);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      // triggered on de-mounting the component
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const usersByTasks = concurrentUsersByTaskId(clientSessions, ownSid);
  const selectedTaskId = Number(useSelector(state => state.selectedTask));

  const renderTaskList = () => {
    if (data !== undefined) {
      return data
        .slice(0, CONST.TASKS_QTY)
        .map((item: Task, index) => (
          <TaskListItem
            key={index.toString()}
            item={item}
            listId={index}
            selected={selectedTaskId === item.id}
            viewers={usersByTasks[item.id]}
          />
        ));
    } else {
      return [];
    }
  };

  if (data && !isError) {
    const styles = {
      border: '1px solid rgba(0, 0, 0, 0.5)',
      bottom: '0px',
    };

    return (
      <>
        <Box sx={{width: '100%'}} data-testid="tasklist">
          <h3>Open Tasks</h3>
          {data.length > 0 ? (
            <div>
              <List className="tasks-list" data-testid="tasklist-items">
                {renderTaskList()}
              </List>
              <MoreText
                totalItems={data.length}
                maxShowedItems={CONST.TASKS_QTY}
                testId="tasklist-items-more"
              />
            </div>
          ) : (
            <Typography variant="subtitle2">
              No open tasks - you lucky one
            </Typography>
          )}
        </Box>
        <Box>
          <div style={styles}>
            <Link to={{pathname: '/taskshistory'}}>
              <h3>Tasks History</h3>
            </Link>
          </div>
        </Box>
      </>
    );
  }

  if (isLoading || isFetching) {
    return (
      <Box
        sx={{width: '100%', textAlign: 'center'}}
        data-testid="tasklist-loading"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" data-testid="tasklist-error">
        {error}
      </Alert>
    );
  }

  return <></>;
};
