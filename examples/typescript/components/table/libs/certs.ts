import {Theme} from '@mui/material';
import {getCertState, getCertStateStyle} from '../../../libs/certStates';

export const getCertStateData = (rowData: any, theme: Theme) => {
  const stateName = rowData?.entity?.info?.state || 'UNKNOWN';
  const stateData = getCertState(stateName);
  return {...stateData, style: getCertStateStyle(stateName, theme)};
};
