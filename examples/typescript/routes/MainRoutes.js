import React from 'react';
import SelectedTaskPage from '../views/selected-task-page';

// project imports
import MainLayout from 'layout/MainLayout';

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/tasks/:taskId',
      element: <SelectedTaskPage />,
    },
    {
      path: '/tasks',
      element: <SelectedTaskPage />,
    },
  ],
};

export default MainRoutes;
