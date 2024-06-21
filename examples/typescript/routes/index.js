import {useRoutes} from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import config from 'config';

export default function ThemeRoutes() {
  return useRoutes([MainRoutes], config.basename);
}
