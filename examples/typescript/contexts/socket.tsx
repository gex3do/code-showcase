import React, {createContext, useEffect, useState} from 'react';

import {io, Socket} from 'socket.io-client';

import {
  AddClientSessionPayload,
  ClientDisconnectedPayload,
  InitClientSessionsPayload,
  TaskSelectedPayload,
} from '../features/clientSessionsSlice';
import {registerEventHandlers} from './socket_event_handlers';

/** for details about the type definitions, refer to the socket.io docs:
 *  https://socket.io/docs/v4/typescript/
 */
export interface ClientToServerEvents {
  message: any;
  select_task: any;
}

export interface ServerToClientEvents {
  connect: (socket: Socket) => void;
  disconnect: () => void;
  add_client_session: (data: AddClientSessionPayload) => void;
  client_disconnected: (data: ClientDisconnectedPayload) => void;
  init_client_sessions: (data: InitClientSessionsPayload) => void;
  task_selected: (data: TaskSelectedPayload) => void;
}

export const SocketContext = createContext<
  Socket<ServerToClientEvents, ClientToServerEvents> | undefined
>(undefined);

interface SocketProps {
  children: React.ReactElement;
  uri: string;
  options: object;
}

export const SocketProvider = (props: SocketProps) => {
  const {children, uri, options} = props;

  const [socketIo, setSocketIo] =
    useState<Socket<ServerToClientEvents, ClientToServerEvents>>();

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      uri,
      options
    );
    registerEventHandlers(socket);
    setSocketIo(socket);
  }, []);

  return (
    <SocketContext.Provider value={socketIo}>{children}</SocketContext.Provider>
  );
};
