import {Socket} from 'socket.io-client';

import {store} from '../store';
import {
  addClientSession,
  initClientSessions,
  removeClientSession,
  setMySid,
  updateSelectedTask,
} from '../features/clientSessionsSlice';

const handle_connect = (socket: Socket) => () => {
  store.dispatch(setMySid({sid: socket.id}));
  const taskId = store.getState().selectedTask;
  if (socket && taskId) {
    socket.emit('select_task', {taskId});
  }
};

const handle_disconnect = () => () => {
  store.dispatch(initClientSessions({}));
};

const handle_add_client_session = () => (data: any) => {
  store.dispatch(addClientSession(data));
};

const handle_init_client_sessions = () => (data: any) => {
  store.dispatch(initClientSessions(data));
};

const handle_client_disconnected = () => (data: any) => {
  store.dispatch(removeClientSession(data));
};

const handle_task_selected = () => (data: any) => {
  store.dispatch(updateSelectedTask(data));
};

export const registerEventHandlers = (socket: Socket) => {
  socket.on('connect', handle_connect(socket));
  socket.on('disconnect', handle_disconnect());
  socket.on('add_client_session', handle_add_client_session());
  socket.on('client_disconnected', handle_client_disconnected());
  socket.on('init_client_sessions', handle_init_client_sessions());
  socket.on('task_selected', handle_task_selected());
};
